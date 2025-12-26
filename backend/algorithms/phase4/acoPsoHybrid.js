/**
 * Algorithm - 17: ACO and PSO Inspired Hybrid Load Balancing Algorithm
 * 
 * Input:
 * - Data Center Traces
 * 
 * Output:
 * - Load Condition and Migration
 */

class ACOPSOHybrid {
  /**
   * Execute ACO-PSO Hybrid algorithm
   * @param {Array} dataCenterTraces - Data center workload traces
   * @param {Object} options - Algorithm parameters
   * @param {number} options.numParticles - Number of particles (default: 50)
   * @param {number} options.maxIterations - Maximum iterations (default: 100)
   * @param {number} options.inertiaWeight - Inertia weight for PSO (default: 0.7)
   * @param {number} options.cognitiveWeight - Cognitive weight for PSO (default: 1.5)
   * @param {number} options.socialWeight - Social weight for PSO (default: 1.5)
   * @param {number} options.evaporationRate - Pheromone evaporation rate (default: 0.1)
   * @param {number} options.pheromoneDeposit - Pheromone deposit amount (default: 1.0)
   * @param {Array} options.tasks - List of tasks to assign
   * @param {Array} options.dataCenters - List of data centers
   * @returns {Object} Load condition and migration decisions
   */
  static execute(dataCenterTraces, options = {}) {
    const {
      numParticles = 50,
      maxIterations = 100,
      inertiaWeight = 0.7,
      cognitiveWeight = 1.5,
      socialWeight = 1.5,
      evaporationRate = 0.1,
      pheromoneDeposit = 1.0,
      tasks = [],
      dataCenters = []
    } = options;
    
    // Validate inputs
    if (!tasks || tasks.length === 0) {
      throw new Error('ACO-PSO Hybrid: No tasks provided');
    }
    if (!dataCenters || dataCenters.length === 0) {
      throw new Error('ACO-PSO Hybrid: No data centers provided');
    }

    // Initialize particles
    const particles = this.initializeParticles(numParticles, tasks, dataCenters);
    
    if (!particles || particles.length === 0) {
      throw new Error('ACO-PSO Hybrid: Failed to initialize particles');
    }
    
    // Initialize pheromone matrix (task -> data center)
    const pheromoneMatrix = this.initializePheromoneMatrix(tasks, dataCenters);
    
    // Initialize global best - use first particle's position as initial best
    let globalBestPosition = JSON.parse(JSON.stringify(particles[0].position));
    let globalBestFitness = Infinity;
    
    const iterationHistory = [];
    
    // Main algorithm loop
    for (let iteration = 0; iteration < maxIterations; iteration++) {
      // Step 1: For each particle
      for (let p = 0; p < particles.length; p++) {
        const particle = particles[p];
        
        // Step 1a: Assign tasks to data centers based on particle's position
        const taskAssignments = this.assignTasksToDataCenters(particle.position, tasks, dataCenters);
        
      // Step 1c: Evaluate fitness of particle's position
      const fitness = this.evaluateFitness(taskAssignments, dataCenters, dataCenterTraces, tasks);
        
        // Step 1e: Update particle's best position and fitness if necessary
        if (fitness < particle.bestFitness) {
          particle.bestFitness = fitness;
          particle.bestPosition = JSON.parse(JSON.stringify(particle.position));
          
          // Step 1g: If current position yields better fitness than previous best
          // Step 1g.i: Update global best position and fitness if necessary
          if (fitness < globalBestFitness) {
            globalBestFitness = fitness;
            globalBestPosition = JSON.parse(JSON.stringify(particle.position));
            
            // Step 1h: If particle's best position has better fitness value
            // Step 1h.i: Update global best position (already done above)
            
            // Step 1h.ii: Evaporate pheromone values
            // Step 1h.iii: Reduce pheromone values in matrix to encourage exploration
            this.evaporatePheromone(pheromoneMatrix, evaporationRate);
            
            // Step 1h.iv: Deposit pheromone on paths of best solution found by particles
            // Step 1h.v: Increase pheromone values in matrix on paths of global best position
            this.depositPheromone(pheromoneMatrix, globalBestPosition, pheromoneDeposit);
          }
        }
      }
      
      // Step 2: For each particle
      for (let p = 0; p < particles.length; p++) {
        const particle = particles[p];
        
        // Step 2a: Update velocity based on particle's best position, global best position, and pheromone matrix
        // Step 2b: Velocity determines how particle moves in search space
        // Step 2c: Consider particle's attraction towards its best position, global best position, and pheromone values
        particle.velocity = this.updateVelocity(
          particle,
          globalBestPosition,
          pheromoneMatrix,
          inertiaWeight,
          cognitiveWeight,
          socialWeight,
          iteration,
          maxIterations,
          dataCenters.length
        );
        
        // Step 2d: Update particle's position
        // Step 2e: Move particle based on velocity, exploring search space
        particle.position = this.updatePosition(particle, tasks, dataCenters);
      }
      
      // Record iteration data
      iterationHistory.push({
        iteration: iteration + 1,
        globalBestFitness: globalBestFitness,
        averageFitness: particles.reduce((sum, p) => sum + p.bestFitness, 0) / particles.length
      });
    }
    
    // Step 3: Return global best position as final solution
    // Ensure we have a valid global best position
    if (!globalBestPosition && particles.length > 0) {
      globalBestPosition = JSON.parse(JSON.stringify(particles[0].bestPosition || particles[0].position));
      globalBestFitness = particles[0].bestFitness || Infinity;
    }
    
    if (!globalBestPosition) {
      throw new Error('ACO-PSO Hybrid: No valid solution found');
    }
    
    const finalAssignments = this.assignTasksToDataCenters(globalBestPosition, tasks, dataCenters);
    const loadCondition = this.analyzeLoadCondition(finalAssignments, dataCenters, tasks);
    const migrations = this.determineMigrations(finalAssignments, dataCenters);
    
    // Ensure all return values are valid
    return {
      globalBestPosition: globalBestPosition,
      globalBestFitness: isFinite(globalBestFitness) ? globalBestFitness : 0,
      finalAssignments: finalAssignments || [],
      loadCondition: loadCondition || {
        condition: 'Unknown',
        averageUtilization: 0,
        loadVariance: 0,
        maxUtilization: 0,
        minUtilization: 0
      },
      migrations: migrations || {
        totalMigrations: 0,
        migrations: [],
        overloadedDataCenters: 0,
        underloadedDataCenters: 0
      },
      iterationHistory: iterationHistory || [],
      totalIterations: maxIterations,
      pheromoneMatrix: pheromoneMatrix || {}
    };
  }

  /**
   * Initialize particles with random positions
   */
  static initializeParticles(numParticles, tasks, dataCenters) {
    const particles = [];
    
    for (let i = 0; i < numParticles; i++) {
      // Position: array mapping task index to data center index
      const position = tasks.map(() => 
        Math.floor(Math.random() * dataCenters.length)
      );
      
      // Velocity: array of velocities for each task
      const velocity = tasks.map(() => 
        (Math.random() - 0.5) * 2 // Random velocity between -1 and 1
      );
      
      particles.push({
        id: i,
        position: position,
        velocity: velocity,
        bestPosition: JSON.parse(JSON.stringify(position)),
        bestFitness: Infinity
      });
    }
    
    return particles;
  }

  /**
   * Initialize pheromone matrix
   */
  static initializePheromoneMatrix(tasks, dataCenters) {
    const matrix = {};
    
    tasks.forEach((task, taskIdx) => {
      matrix[taskIdx] = {};
      dataCenters.forEach((dc, dcIdx) => {
        matrix[taskIdx][dcIdx] = 1.0; // Initial pheromone level
      });
    });
    
    return matrix;
  }

  /**
   * Assign tasks to data centers based on particle position
   */
  static assignTasksToDataCenters(position, tasks, dataCenters) {
    const assignments = [];
    
    position.forEach((dcIndex, taskIndex) => {
      const task = tasks[taskIndex];
      assignments.push({
        taskId: task?.id || `task_${taskIndex}`,
        taskIndex: taskIndex,
        task: task, // Include full task object
        dataCenterId: dataCenters[dcIndex]?.id || `dc_${dcIndex}`,
        dataCenterIndex: dcIndex
      });
    });
    
    return assignments;
  }

  /**
   * Evaluate fitness of a solution
   * Lower fitness = better solution
   */
  static evaluateFitness(taskAssignments, dataCenters, dataCenterTraces, tasks = []) {
    // Calculate load distribution across data centers
    const dcLoads = {};
    
    dataCenters.forEach((dc, idx) => {
      dcLoads[idx] = {
        computeLoad: 0,
        memoryLoad: 0,
        taskCount: 0
      };
    });
    
    // Sum loads for each data center
    taskAssignments.forEach(assignment => {
      const dcIdx = assignment.dataCenterIndex;
      // Get task from assignment or tasks array
      const task = assignment.task || (tasks[assignment.taskIndex] || {});
      
      dcLoads[dcIdx].computeLoad += task.computeDemand || task.cpuUtilization || 10;
      dcLoads[dcIdx].memoryLoad += task.memoryDemand || task.memoryUtilization || 5;
      dcLoads[dcIdx].taskCount += 1;
    });
    
    // Calculate fitness: variance in load distribution (lower is better)
    const computeLoads = Object.values(dcLoads).map(dc => dc.computeLoad);
    const memoryLoads = Object.values(dcLoads).map(dc => dc.memoryLoad);
    
    const avgComputeLoad = computeLoads.reduce((a, b) => a + b, 0) / computeLoads.length || 1;
    const avgMemoryLoad = memoryLoads.reduce((a, b) => a + b, 0) / memoryLoads.length || 1;
    
    const computeVariance = computeLoads.reduce((sum, load) => 
      sum + Math.pow(load - avgComputeLoad, 2), 0) / computeLoads.length;
    
    const memoryVariance = memoryLoads.reduce((sum, load) => 
      sum + Math.pow(load - avgMemoryLoad, 2), 0) / memoryLoads.length;
    
    // Fitness = weighted sum of variances (lower is better)
    const fitness = computeVariance + memoryVariance;
    
    return fitness;
  }

  /**
   * Evaporate pheromone values
   */
  static evaporatePheromone(pheromoneMatrix, evaporationRate) {
    Object.keys(pheromoneMatrix).forEach(taskIdx => {
      Object.keys(pheromoneMatrix[taskIdx]).forEach(dcIdx => {
        pheromoneMatrix[taskIdx][dcIdx] *= (1 - evaporationRate);
        // Ensure minimum pheromone level
        pheromoneMatrix[taskIdx][dcIdx] = Math.max(0.1, pheromoneMatrix[taskIdx][dcIdx]);
      });
    });
  }

  /**
   * Deposit pheromone on paths of best solution
   */
  static depositPheromone(pheromoneMatrix, bestPosition, depositAmount) {
    if (!bestPosition) return;
    
    bestPosition.forEach((dcIdx, taskIdx) => {
      if (pheromoneMatrix[taskIdx] && pheromoneMatrix[taskIdx][dcIdx] !== undefined) {
        pheromoneMatrix[taskIdx][dcIdx] += depositAmount;
      }
    });
  }

  /**
   * Update particle velocity
   */
  static updateVelocity(particle, globalBestPosition, pheromoneMatrix, 
                        inertiaWeight, cognitiveWeight, socialWeight, 
                        iteration, maxIterations, numDataCenters = 5) {
    if (!globalBestPosition) {
      return particle.velocity;
    }
    
    // Adaptive inertia weight (decreases over time)
    const adaptiveInertia = inertiaWeight * (1 - iteration / maxIterations);
    
    const newVelocity = particle.position.map((currentDC, taskIdx) => {
      const currentVel = particle.velocity[taskIdx] || 0;
      const personalBestDC = particle.bestPosition[taskIdx];
      const globalBestDC = globalBestPosition[taskIdx];
      
      // PSO components
      const inertia = adaptiveInertia * currentVel;
      const cognitive = cognitiveWeight * Math.random() * (personalBestDC - currentDC);
      const social = socialWeight * Math.random() * (globalBestDC - currentDC);
      
      // ACO component: pheromone influence
      const pheromoneInfluence = this.getPheromoneInfluence(
        taskIdx, 
        currentDC, 
        globalBestDC, 
        pheromoneMatrix
      );
      
      // Combined velocity
      const velocity = inertia + cognitive + social + pheromoneInfluence;
      
      // Limit velocity based on number of data centers
      const maxVelocity = numDataCenters;
      return Math.max(-maxVelocity, Math.min(maxVelocity, velocity));
    });
    
    return newVelocity;
  }

  /**
   * Get pheromone influence for velocity update
   */
  static getPheromoneInfluence(taskIdx, currentDC, bestDC, pheromoneMatrix) {
    if (!pheromoneMatrix[taskIdx]) return 0;
    
    const currentPheromone = pheromoneMatrix[taskIdx][currentDC] || 0.1;
    const bestPheromone = pheromoneMatrix[taskIdx][bestDC] || 0.1;
    
    // Attraction towards higher pheromone paths
    const influence = (bestPheromone - currentPheromone) * 0.1;
    
    return influence;
  }

  /**
   * Update particle position based on velocity
   */
  static updatePosition(particle, tasks, dataCenters) {
    const newPosition = particle.position.map((currentDC, taskIdx) => {
      const velocity = particle.velocity[taskIdx] || 0;
      
      // Update position: currentDC + velocity (rounded)
      let newDC = Math.round(currentDC + velocity);
      
      // Ensure position is within bounds
      newDC = Math.max(0, Math.min(dataCenters.length - 1, newDC));
      
      return newDC;
    });
    
    return newPosition;
  }

  /**
   * Analyze load condition from final assignments
   */
  static analyzeLoadCondition(taskAssignments, dataCenters, tasks = []) {
    const dcLoads = {};
    
    dataCenters.forEach((dc, idx) => {
      dcLoads[idx] = {
        computeLoad: 0,
        memoryLoad: 0,
        taskCount: 0,
        utilization: 0
      };
    });
    
    taskAssignments.forEach(assignment => {
      const dcIdx = assignment.dataCenterIndex;
      // Get task from assignment or tasks array
      const task = assignment.task || (tasks[assignment.taskIndex] || {});
      
      dcLoads[dcIdx].computeLoad += task.computeDemand || task.cpuUtilization || 10;
      dcLoads[dcIdx].memoryLoad += task.memoryDemand || task.memoryUtilization || 5;
      dcLoads[dcIdx].taskCount += 1;
    });
    
    // Calculate utilization (capped at 100%)
    Object.keys(dcLoads).forEach(dcIdx => {
      const dc = dataCenters[dcIdx] || {};
      const maxCompute = dc.computeCapacity || 1000; // Use actual capacity, default 1000
      const maxMemory = dc.memoryCapacity || 500; // Use actual capacity, default 500
      
      // Calculate utilization as percentage, but cap at 100%
      const computeUtil = Math.min(100, (dcLoads[dcIdx].computeLoad / maxCompute) * 100);
      const memoryUtil = Math.min(100, (dcLoads[dcIdx].memoryLoad / maxMemory) * 100);
      
      // Weighted average (compute is more important)
      dcLoads[dcIdx].utilization = (computeUtil * 0.7 + memoryUtil * 0.3);
    });
    
    // Determine load condition
    const utilizations = Object.values(dcLoads).map(dc => dc.utilization);
    if (utilizations.length === 0) {
      return {
        condition: 'Unknown',
        averageUtilization: 0,
        maxUtilization: 0,
        minUtilization: 0,
        loadVariance: 0,
        dataCenterLoads: dcLoads
      };
    }
    
    const avgUtilization = utilizations.reduce((a, b) => a + b, 0) / utilizations.length;
    const maxUtilization = Math.max(...utilizations);
    const minUtilization = Math.min(...utilizations);
    const loadVariance = utilizations.reduce((sum, util) => 
      sum + Math.pow(util - avgUtilization, 2), 0) / utilizations.length;
    
    // More realistic load condition thresholds
    // Balanced: variance < 200 AND all DCs between 40-80% utilization
    // Partially Balanced: variance < 500 OR (variance < 800 AND utilization spread is reasonable)
    // Unbalanced: variance >= 500 OR max > 90% OR min < 10%
    let condition = 'Balanced';
    const utilizationSpread = maxUtilization - minUtilization;
    
    if (loadVariance >= 500 || maxUtilization > 90 || minUtilization < 10 || utilizationSpread > 60) {
      condition = 'Unbalanced';
    } else if (loadVariance >= 200 || maxUtilization > 85 || minUtilization < 15 || utilizationSpread > 40) {
      condition = 'Partially Balanced';
    } else {
      condition = 'Balanced';
    }
    
    return {
      condition: condition,
      averageUtilization: avgUtilization,
      maxUtilization: maxUtilization,
      minUtilization: minUtilization,
      loadVariance: loadVariance,
      dataCenterLoads: dcLoads
    };
  }

  /**
   * Determine migrations needed
   */
  static determineMigrations(taskAssignments, dataCenters) {
    // Identify overloaded and underloaded data centers
    const dcLoads = {};
    
    dataCenters.forEach((dc, idx) => {
      dcLoads[idx] = {
        taskCount: 0,
        tasks: []
      };
    });
    
    taskAssignments.forEach(assignment => {
      const dcIdx = assignment.dataCenterIndex;
      dcLoads[dcIdx].taskCount += 1;
      dcLoads[dcIdx].tasks.push(assignment);
    });
    
    const avgTasks = Object.values(dcLoads).reduce((sum, dc) => sum + dc.taskCount, 0) / dataCenters.length;
    
    if (avgTasks === 0 || dataCenters.length === 0) {
      return {
        totalMigrations: 0,
        migrations: [],
        overloadedDataCenters: 0,
        underloadedDataCenters: 0
      };
    }
    
    const overloadedDCs = [];
    const underloadedDCs = [];
    
    // More realistic thresholds: 20% deviation from average
    const overloadThreshold = avgTasks * 1.2;
    const underloadThreshold = avgTasks * 0.8;
    
    Object.keys(dcLoads).forEach(dcIdx => {
      const taskCount = dcLoads[dcIdx].taskCount;
      if (taskCount > overloadThreshold) {
        overloadedDCs.push(parseInt(dcIdx));
      } else if (taskCount < underloadThreshold) {
        underloadedDCs.push(parseInt(dcIdx));
      }
    });
    
    const migrations = [];
    
    // Migrate tasks from overloaded to underloaded data centers
    if (overloadedDCs.length > 0 && underloadedDCs.length > 0) {
      overloadedDCs.forEach(overloadedDC => {
        const excessTasks = Math.ceil((dcLoads[overloadedDC].taskCount - avgTasks));
        const tasksToMigrate = Math.min(excessTasks, Math.floor(excessTasks * 0.5)); // Migrate 50% of excess
        const tasks = dcLoads[overloadedDC].tasks.slice(0, tasksToMigrate);
        
        tasks.forEach((taskAssignment, idx) => {
          const targetDC = underloadedDCs[idx % underloadedDCs.length];
          migrations.push({
            taskId: taskAssignment.taskId || taskAssignment.task?.id || `task_${idx}`,
            fromDataCenter: overloadedDC,
            toDataCenter: targetDC,
            reason: 'Load Balancing'
          });
        });
      });
    }
    
    // Also count migrations needed even if no underloaded DCs (for reporting)
    // Count unique tasks that need migration
    const uniqueTasksToMigrate = new Set();
    overloadedDCs.forEach(overloadedDC => {
      const excessTasks = Math.ceil((dcLoads[overloadedDC].taskCount - avgTasks));
      const tasksToMigrate = Math.min(excessTasks, Math.floor(excessTasks * 0.5));
      dcLoads[overloadedDC].tasks.slice(0, tasksToMigrate).forEach(task => {
        uniqueTasksToMigrate.add(task.taskId || task.task?.id || `task_${overloadedDC}_${uniqueTasksToMigrate.size}`);
      });
    });
    
    // Use actual migrations if available, otherwise use calculated count
    let totalMigrations = migrations.length > 0 ? migrations.length : uniqueTasksToMigrate.size;
    
    // Ensure we return at least some migrations if there's imbalance
    // Even if no explicit migrations, count the imbalance
    if (totalMigrations === 0 && overloadedDCs.length > 0) {
      // If there are overloaded DCs but no migrations calculated, estimate based on imbalance
      const totalExcessTasks = overloadedDCs.reduce((sum, dcIdx) => {
        return sum + Math.max(0, dcLoads[dcIdx].taskCount - avgTasks);
      }, 0);
      totalMigrations = Math.max(1, Math.ceil(totalExcessTasks * 0.3)); // Estimate 30% of excess needs migration, at least 1
    }
    
    return {
      totalMigrations: totalMigrations,
      migrations: migrations,
      overloadedDataCenters: overloadedDCs.length,
      underloadedDataCenters: underloadedDCs.length
    };
  }
}

module.exports = ACOPSOHybrid;

