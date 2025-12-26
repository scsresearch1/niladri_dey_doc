const LGTLCI = require('./lgtLci');
const TDLI = require('./tdli');
const PLGBPD = require('./plgbPd');
const SSOF = require('./ssof');
const TVPLCVPSOLB = require('./tvplCvPsoLb');
const DataProcessor = require('../dataProcessor');
const os = require('os');

/**
 * Phase 3 Algorithm Orchestrator
 * Coordinates execution of all Phase 3 algorithms:
 * 1. LGT-LCI - Local and Global Threshold Based Load Condition Identification
 * 2. TDLI - Time-Dependent Location Identification
 * 3. PLGB-PD - Predictive Local and Global Best Position Detection
 * 4. SSOF - System Stability Driven Objective Function
 * 5. TVPL-CV-PSO-LB - Time-Variant Predictive Location Driven Corrective Velocity Based PSO for Load Balancing
 */
class Phase3Orchestrator {
  constructor() {
    this.dataProcessor = new DataProcessor();
  }

  /**
   * Prepare tasks, VMs, infrastructures, and locations from dataset
   */
  preparePhase3Data(vmData, date) {
    // Create logical tasks based on VM groups
    const tasks = [];
    const vms = [];
    const infrastructures = [];
    const locations = [];
    
    // Group VMs by characteristics to create tasks
    const taskMap = new Map();
    const vmMap = new Map();
    
    vmData.forEach((vm, index) => {
      const vmId = vm.vmId || `vm_${index}`;
      
      // Determine task type based on VM load
      const cpuUtil = vm.cpuUtilization || 0;
      let taskType = 'low';
      if (cpuUtil > 70) taskType = 'high';
      else if (cpuUtil > 40) taskType = 'medium';
      
      const taskId = `task_${taskType}`;
      
      if (!taskMap.has(taskId)) {
        taskMap.set(taskId, {
          id: taskId,
          name: `Task ${taskType.charAt(0).toUpperCase() + taskType.slice(1)} Load`,
          type: taskType,
          computeDemand: 0,
          memoryDemand: 0,
          storageDemand: 0,
          networkDemand: 0
        });
      }
      
      const task = taskMap.get(taskId);
      task.computeDemand += cpuUtil || 0;
      task.memoryDemand += (vm.memoryUtilization || cpuUtil * 0.8) || 0;
      task.storageDemand += (cpuUtil * 0.5) || 0;
      task.networkDemand += (vm.networkUtilization || cpuUtil * 0.3) || 0;
      
      // Create VM object
      const vmObj = {
        vmId: vmId,
        id: vmId,
        taskId: taskId,
        computeCapacity: cpuUtil || 0,
        memoryCapacity: vm.memoryUtilization || (cpuUtil * 0.8) || 0,
        storageCapacity: cpuUtil * 0.5 || 0,
        networkCapacity: vm.networkUtilization || (cpuUtil * 0.3) || 0,
        currentLoad: cpuUtil || 0,
        coordinateX: index % 10, // Simple coordinate mapping
        coordinateY: Math.floor(index / 10)
      };
      
      vms.push(vmObj);
      vmMap.set(vmId, vmObj);
    });
    
    tasks.push(...Array.from(taskMap.values()));
    
    // Create infrastructures (logical grouping of VMs)
    const infraMap = new Map();
    vms.forEach((vm, idx) => {
      const infraId = `infra_${Math.floor(idx / 10)}`; // Group 10 VMs per infrastructure
      
      if (!infraMap.has(infraId)) {
        infraMap.set(infraId, {
          id: infraId,
          infrastructureId: infraId,
          vmIds: [],
          computeCapacity: 0,
          memoryCapacity: 0,
          storageCapacity: 0,
          networkBandwidth: 0
        });
      }
      
      const infra = infraMap.get(infraId);
      infra.vmIds.push(vm.vmId);
      infra.computeCapacity += vm.computeCapacity;
      infra.memoryCapacity += vm.memoryCapacity;
      infra.storageCapacity += vm.storageCapacity;
      infra.networkBandwidth += vm.networkCapacity;
    });
    
    infrastructures.push(...Array.from(infraMap.values()));
    
    // Create locations (physical locations for infrastructures)
    infrastructures.forEach((infra, idx) => {
      locations.push({
        id: `location_${idx}`,
        locationId: `location_${idx}`,
        infrastructureId: infra.id,
        computeCapacity: infra.computeCapacity * 1.2, // Location has more capacity
        memoryCapacity: infra.memoryCapacity * 1.2,
        storageCapacity: infra.storageCapacity * 1.2,
        networkBandwidth: infra.networkBandwidth * 1.2
      });
    });
    
    console.log(`  Prepared: ${tasks.length} tasks, ${vms.length} VMs, ${infrastructures.length} infrastructures, ${locations.length} locations`);
    
    return { tasks, vms, infrastructures, locations };
  }

  /**
   * Execute all Phase 3 algorithms for a dataset
   */
  async executePhase3Algorithms(date, options = {}) {
    try {
      // Load dataset
      let vmData;
      if (this.dataProcessor.cache && this.dataProcessor.cache.has(date)) {
        vmData = this.dataProcessor.cache.get(date);
        console.log(`Phase 3: Using cached dataset ${date}: ${vmData.length} data points`);
      } else {
        vmData = await this.dataProcessor.loadDataset(date);
        console.log(`Phase 3: Loaded dataset ${date}: ${vmData.length} data points`);
      }
      
      // Limit data points if dataset is extremely large
      const MAX_DATA_POINTS = 1000000;
      if (vmData.length > MAX_DATA_POINTS) {
        console.log(`  Warning: Dataset has ${vmData.length} data points, sampling to ${MAX_DATA_POINTS}`);
        const step = Math.ceil(vmData.length / MAX_DATA_POINTS);
        vmData = vmData.filter((_, idx) => idx % step === 0);
      }
      
      // Prepare Phase 3 data structures
      const { tasks, vms, infrastructures, locations } = this.preparePhase3Data(vmData, date);
      
      console.log(`Phase 3: Processing ${vms.length} VMs across ${tasks.length} tasks for date ${date}`);
      
      // Step 1: Execute LGT-LCI (Algorithm 12)
      console.log(`  Step 1: Executing LGT-LCI...`);
      const lgtLciResults = LGTLCI.execute(tasks, vms, infrastructures, locations);
      console.log(`  LGT-LCI Complete: ${lgtLciResults.totalLoadedVMs} loaded VMs identified`);
      console.log(`    Local Threshold: ${lgtLciResults.localThreshold.toFixed(2)}, Global Threshold: ${lgtLciResults.globalThreshold.toFixed(2)}`);
      
      // Step 2: Execute TDLI (Algorithm 13)
      console.log(`  Step 2: Executing TDLI...`);
      // Create swarms from loaded VMs
      const swarms = lgtLciResults.loadedVMs.map((vm, idx) => ({
        id: vm.vmId || vm.id || `swarm_${idx}`,
        swarmId: vm.vmId || vm.id || `swarm_${idx}`
      }));
      
      const coordinates = lgtLciResults.loadedVMs.map((vm, idx) => ({
        swarmId: vm.vmId || vm.id,
        x: vm.coordinateX || idx % 10,
        y: vm.coordinateY || Math.floor(idx / 10)
      }));
      
      const timeInstances = lgtLciResults.loadedVMs.map((vm, idx) => ({
        swarmId: vm.vmId || vm.id,
        time: idx * 100 // Time progression
      }));
      
      const tdlResults = TDLI.execute(swarms, coordinates, timeInstances);
      console.log(`  TDLI Complete: Space-time coordinates calculated for ${Object.keys(tdlResults).length} swarms`);
      
      // Step 3: Execute PLGB-PD (Algorithm 14)
      console.log(`  Step 3: Executing PLGB-PD...`);
      const velocities = lgtLciResults.loadedVMs.map((vm, idx) => ({
        value: vm.currentLoad || 0,
        velocity: vm.currentLoad || 0
      }));
      
      const inertias = lgtLciResults.loadedVMs.map(() => 0.5); // Default inertia
      
      const plgbPdResults = PLGBPD.execute(Object.values(tdlResults), velocities, inertias);
      console.log(`  PLGB-PD Complete: ${plgbPdResults.LBP.length} local best positions, 1 global best position`);
      
      // Step 4: Execute SSOF (Algorithm 15) - will be called by TVPL-CV-PSO-LB
      // Step 5: Execute TVPL-CV-PSO-LB (Algorithm 16)
      console.log(`  Step 4-5: Executing TVPL-CV-PSO-LB with SSOF...`);
      const particles = lgtLciResults.loadedVMs.map((vm, idx) => ({
        id: `particle_${idx}`,
        position: idx,
        vmId: vm.vmId || vm.id
      }));
      
      const tvplResults = TVPLCVPSOLB.execute(
        lgtLciResults.loadedVMs,
        velocities,
        particles,
        plgbPdResults.LBP,
        plgbPdResults.GBP,
        lgtLciResults.localThreshold,
        lgtLciResults.globalThreshold,
        infrastructures,
        { maxIterations: options.maxIterations || 50 }
      );
      console.log(`  TVPL-CV-PSO-LB Complete: System state = ${tvplResults.SS}, ${tvplResults.totalMigrations} migrations`);
      
      // Calculate performance metrics
      const totalVMs = vms.length;
      const loadedVMCount = lgtLciResults.totalLoadedVMs;
      const loadPercentage = totalVMs > 0 ? (loadedVMCount / totalVMs) * 100 : 0;
      const balancedVMs = tvplResults.vmInfrastructureMap.filter(m => m.balanced).length;
      const balancedPercentage = loadedVMCount > 0 ? (balancedVMs / loadedVMCount) * 100 : 0;
      
      return {
        date: date,
        algorithms: {
          LGTLCI: {
            loadedVMs: loadedVMCount,
            localThreshold: lgtLciResults.localThreshold,
            globalThreshold: lgtLciResults.globalThreshold,
            systemStability: lgtLciResults.systemStability
          },
          TDLI: {
            spaceTimeCoordinates: Object.keys(tdlResults).length,
            averageSPC: Object.values(tdlResults).reduce((sum, r) => sum + (r.SPC || 0), 0) / Object.keys(tdlResults).length || 0
          },
          PLGBPD: {
            localBestPositions: plgbPdResults.LBP.length,
            globalBestPosition: plgbPdResults.GBP?.SPC || 0
          },
          SSOF: {
            // Called internally by TVPL-CV-PSO-LB
            systemState: tvplResults.SS
          },
          TVPLCVPSOLB: {
            systemState: tvplResults.SS,
            totalMigrations: tvplResults.totalMigrations,
            iterations: tvplResults.iterations,
            vmInfrastructureMappings: tvplResults.vmInfrastructureMap.length
          }
        },
        metrics: {
          totalVMs: totalVMs,
          loadedVMs: loadedVMCount,
          loadPercentage: loadPercentage,
          balancedVMs: balancedVMs,
          balancedPercentage: balancedPercentage,
          systemState: tvplResults.SS,
          totalMigrations: tvplResults.totalMigrations,
          localThreshold: lgtLciResults.localThreshold,
          globalThreshold: lgtLciResults.globalThreshold
        }
      };
    } catch (error) {
      console.error(`Error executing Phase 3 algorithms for ${date}:`, error);
      throw error;
    }
  }

  /**
   * Run Phase 3 algorithms on all dates (multi-threaded)
   */
  async runAllPhase3Algorithms(dates, options = {}) {
    const results = {};
    const totalTasks = dates.length;
    let completedTasks = 0;
    
    // Pre-load all datasets
    console.log(`Phase 3: Pre-loading ${dates.length} datasets...`);
    const datasetCache = new Map();
    
    const loadPromises = dates.map(async (date) => {
      try {
        const vmData = await this.dataProcessor.loadDataset(date);
        datasetCache.set(date, vmData);
        console.log(`✓ Loaded dataset ${date}: ${vmData.length} data points`);
        return { date, success: true };
      } catch (error) {
        console.warn(`✗ Failed to load dataset ${date}:`, error.message);
        return { date, success: false, error: error.message };
      }
    });
    
    await Promise.all(loadPromises);
    console.log(`Phase 3: All datasets pre-loaded. Starting algorithm execution...`);
    
    // Get CPU core count for optimal worker thread allocation
    const cpuCores = os.cpus().length;
    const maxWorkers = Math.min(cpuCores, totalTasks);
    console.log(`Phase 3: Using ${maxWorkers} worker threads (${cpuCores} CPU cores available)`);
    
    // Create all tasks
    const allTasks = dates.map(date => ({
      date,
      options
    }));
    
    // Process tasks in parallel batches
    const processBatch = async (batch) => {
      const batchPromises = batch.map(async (task) => {
        try {
          const result = await this.executePhase3Algorithms(task.date, task.options);
          completedTasks++;
          const percent = ((completedTasks / totalTasks) * 100).toFixed(1);
          console.log(`Phase 3 Progress: ${completedTasks}/${totalTasks} (${percent}%) dates completed`);
          return { date: task.date, result };
        } catch (error) {
          console.error(`Error for Phase 3 on ${task.date}:`, error.message);
          completedTasks++;
          return {
            date: task.date,
            result: {
              date: task.date,
              error: error.message,
              metrics: {
                totalVMs: 0,
                loadedVMs: 0,
                loadPercentage: 0
              }
            }
          };
        }
      });
      
      return Promise.all(batchPromises);
    };
    
    // Process all tasks in parallel batches
    const batchSize = maxWorkers;
    const batches = [];
    for (let i = 0; i < allTasks.length; i += batchSize) {
      batches.push(allTasks.slice(i, i + batchSize));
    }
    
    console.log(`Phase 3: Processing ${allTasks.length} tasks in ${batches.length} parallel batches...`);
    const startTime = Date.now();
    
    // Process batches sequentially, but tasks within each batch run in parallel
    for (let i = 0; i < batches.length; i++) {
      const batchResults = await processBatch(batches[i]);
      batchResults.forEach(({ date, result }) => {
        results[date] = result;
      });
    }
    
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    console.log(`✓ Phase 3: Completed all ${totalTasks} algorithm executions in ${duration} seconds`);
    
    return results;
  }
}

module.exports = Phase3Orchestrator;

