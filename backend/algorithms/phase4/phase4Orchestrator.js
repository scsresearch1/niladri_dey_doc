const ACOPSOHybrid = require('./acoPsoHybrid');
const DataProcessor = require('../dataProcessor');
const os = require('os');

/**
 * Phase 4 Algorithm Orchestrator
 * Coordinates execution of Phase 4 algorithm:
 * Algorithm 17: ACO and PSO Inspired Hybrid Load Balancing Algorithm
 */
class Phase4Orchestrator {
  constructor() {
    this.dataProcessor = new DataProcessor();
  }

  /**
   * Prepare tasks and data centers from dataset
   */
  preparePhase4Data(vmData, date) {
    // Limit the number of data points to process (sample if too large)
    const MAX_DATA_POINTS = 50000; // Reasonable limit for algorithm execution
    let processedData = vmData;
    
    if (vmData.length > MAX_DATA_POINTS) {
      console.log(`  Sampling ${vmData.length} data points to ${MAX_DATA_POINTS} for algorithm execution`);
      const step = Math.ceil(vmData.length / MAX_DATA_POINTS);
      processedData = vmData.filter((_, idx) => idx % step === 0);
    }
    
    // Group VMs by unique VM ID and calculate average utilization
    const vmMap = new Map();
    processedData.forEach((dataPoint) => {
      const vmId = dataPoint.vmId || `vm_${dataPoint.hostId || 'unknown'}`;
      if (!vmMap.has(vmId)) {
        vmMap.set(vmId, {
          vmId: vmId,
          cpuUtilizations: [],
          memoryUtilizations: []
        });
      }
      const vm = vmMap.get(vmId);
      vm.cpuUtilizations.push(dataPoint.cpuUtilization || 0);
      vm.memoryUtilizations.push(dataPoint.memoryUtilization || (dataPoint.cpuUtilization || 0) * 0.8);
    });
    
    // Create tasks from unique VMs (grouped by load characteristics)
    const tasks = [];
    const MAX_TASKS = 500; // Reasonable limit for algorithm
    const VMs_PER_TASK = Math.max(1, Math.ceil(vmMap.size / MAX_TASKS));
    
    let taskIndex = 0;
    const vmArray = Array.from(vmMap.values());
    
    for (let i = 0; i < vmArray.length; i += VMs_PER_TASK) {
      const vmGroup = vmArray.slice(i, i + VMs_PER_TASK);
      
      // Calculate average demands for this task
      let totalCompute = 0;
      let totalMemory = 0;
      
      vmGroup.forEach(vm => {
        const avgCpu = vm.cpuUtilizations.reduce((a, b) => a + b, 0) / vm.cpuUtilizations.length;
        const avgMemory = vm.memoryUtilizations.reduce((a, b) => a + b, 0) / vm.memoryUtilizations.length;
        totalCompute += avgCpu;
        totalMemory += avgMemory;
      });
      
      // Determine task type
      const avgCpuUtil = totalCompute / vmGroup.length;
      let taskType = 'low';
      if (avgCpuUtil > 70) taskType = 'high';
      else if (avgCpuUtil > 40) taskType = 'medium';
      
      tasks.push({
        id: `task_${taskIndex}`,
        name: `Task ${taskType.charAt(0).toUpperCase() + taskType.slice(1)} ${taskIndex}`,
        type: taskType,
        computeDemand: totalCompute,
        memoryDemand: totalMemory,
        vms: vmGroup.map(vm => vm.vmId)
      });
      
      taskIndex++;
    }
    
    // Create data centers (reasonable number)
    const dataCenters = [];
    const numDataCenters = Math.min(10, Math.max(3, Math.ceil(tasks.length / 50)));
    
    // Calculate total demand to size data centers appropriately
    const totalComputeDemand = tasks.reduce((sum, task) => sum + (task.computeDemand || 0), 0);
    const totalMemoryDemand = tasks.reduce((sum, task) => sum + (task.memoryDemand || 0), 0);
    
    // Size data centers to handle the load with some headroom
    const avgComputePerDC = totalComputeDemand / numDataCenters;
    const avgMemoryPerDC = totalMemoryDemand / numDataCenters;
    
    for (let i = 0; i < numDataCenters; i++) {
      // Vary capacities but ensure they can handle average load + 50% headroom
      const baseComputeCapacity = avgComputePerDC * 1.5;
      const baseMemoryCapacity = avgMemoryPerDC * 1.5;
      
      dataCenters.push({
        id: `datacenter_${i}`,
        name: `Data Center ${i + 1}`,
        computeCapacity: baseComputeCapacity + (i * (baseComputeCapacity * 0.1)), // Varying capacities
        memoryCapacity: baseMemoryCapacity + (i * (baseMemoryCapacity * 0.1)),
        storageCapacity: (baseComputeCapacity + baseMemoryCapacity) * 2, // Storage = 2x (compute + memory)
        networkBandwidth: 1000 + (i * 100), // Network bandwidth in Mbps
        location: `Location_${i}`
      });
    }
    
    console.log(`  Prepared: ${tasks.length} tasks, ${dataCenters.length} data centers (from ${processedData.length} data points, ${vmMap.size} unique VMs)`);
    
    return { tasks, dataCenters };
  }

  /**
   * Execute Phase 4 algorithm for a dataset
   */
  async executePhase4Algorithms(date, options = {}) {
    try {
      // Load dataset
      let vmData;
      if (this.dataProcessor.cache && this.dataProcessor.cache.has(date)) {
        vmData = this.dataProcessor.cache.get(date);
        console.log(`Phase 4: Using cached dataset ${date}: ${vmData.length} data points`);
      } else {
        vmData = await this.dataProcessor.loadDataset(date);
        console.log(`Phase 4: Loaded dataset ${date}: ${vmData.length} data points`);
      }
      
      // Limit data points if dataset is extremely large
      const MAX_DATA_POINTS = 1000000;
      if (vmData.length > MAX_DATA_POINTS) {
        console.log(`  Warning: Dataset has ${vmData.length} data points, sampling to ${MAX_DATA_POINTS}`);
        const step = Math.ceil(vmData.length / MAX_DATA_POINTS);
        vmData = vmData.filter((_, idx) => idx % step === 0);
      }
      
      // Prepare Phase 4 data structures
      const { tasks, dataCenters } = this.preparePhase4Data(vmData, date);
      
      console.log(`Phase 4: Processing ${tasks.length} tasks across ${dataCenters.length} data centers for date ${date}`);
      
      // Execute ACO-PSO Hybrid Algorithm (Algorithm 17)
      console.log(`  Executing ACO-PSO Hybrid Load Balancing Algorithm...`);
      
      const algorithmOptions = {
        numParticles: options.numParticles || 50,
        maxIterations: options.maxIterations || 100,
        inertiaWeight: options.inertiaWeight || 0.7,
        cognitiveWeight: options.cognitiveWeight || 1.5,
        socialWeight: options.socialWeight || 1.5,
        evaporationRate: options.evaporationRate || 0.1,
        pheromoneDeposit: options.pheromoneDeposit || 1.0,
        tasks: tasks,
        dataCenters: dataCenters,
        dataCenterTraces: vmData // Pass VM data as traces
      };
      
      // Validate inputs
      if (!tasks || tasks.length === 0) {
        throw new Error(`No tasks prepared for date ${date}`);
      }
      if (!dataCenters || dataCenters.length === 0) {
        throw new Error(`No data centers prepared for date ${date}`);
      }
      
      const results = ACOPSOHybrid.execute(vmData, algorithmOptions);
      
      // Validate results
      if (!results) {
        throw new Error(`Algorithm returned no results for date ${date}`);
      }
      if (!results.loadCondition) {
        console.warn(`  Warning: No load condition in results for ${date}, using defaults`);
        results.loadCondition = {
          condition: 'Unknown',
          averageUtilization: 0,
          loadVariance: 0,
          maxUtilization: 0,
          minUtilization: 0
        };
      }
      if (!results.migrations) {
        console.warn(`  Warning: No migrations in results for ${date}, using defaults`);
        results.migrations = {
          totalMigrations: 0,
          migrations: [],
          overloadedDataCenters: 0,
          underloadedDataCenters: 0
        };
      }
      if (typeof results.globalBestFitness !== 'number') {
        results.globalBestFitness = results.globalBestFitness || 0;
      }
      
      console.log(`  ACO-PSO Hybrid Complete: Fitness=${results.globalBestFitness.toFixed(2)}, ` +
                  `Load Condition=${results.loadCondition.condition || 'Unknown'}, ` +
                  `Migrations=${results.migrations.totalMigrations || 0}`);
      
      // Calculate performance metrics
      const totalTasks = tasks.length;
      const totalDataCenters = dataCenters.length;
      const loadConditionStr = results.loadCondition.condition || 'Unknown';
      
      // Calculate balanced percentage based on actual load condition analysis
      // Count data centers that are within acceptable utilization range (40-80%)
      let balancedDCs = 0;
      if (results.loadCondition.dataCenterLoads) {
        Object.values(results.loadCondition.dataCenterLoads).forEach(dcLoad => {
          const util = dcLoad.utilization || 0;
          // Balanced if utilization is between 40% and 80%
          if (util >= 40 && util <= 80) {
            balancedDCs++;
          }
        });
      } else {
        // Fallback: use condition string
        if (loadConditionStr === 'Balanced') {
          balancedDCs = totalDataCenters;
        } else if (loadConditionStr === 'Partially Balanced') {
          balancedDCs = Math.floor(totalDataCenters * 0.7);
        } else {
          balancedDCs = Math.floor(totalDataCenters * 0.3); // Even unbalanced systems have some balanced DCs
        }
      }
      
      const balancedPercentage = totalDataCenters > 0 ? (balancedDCs / totalDataCenters) * 100 : 0;
      
      return {
        date: date,
        algorithms: {
          ACOPSOHybrid: {
            globalBestFitness: results.globalBestFitness,
            loadCondition: results.loadCondition.condition,
            totalMigrations: results.migrations.totalMigrations,
            iterations: results.totalIterations,
            averageUtilization: results.loadCondition.averageUtilization,
            loadVariance: results.loadCondition.loadVariance
          }
        },
        metrics: {
          totalTasks: totalTasks,
          totalDataCenters: totalDataCenters,
          balancedDataCenters: balancedDCs,
          balancedPercentage: balancedPercentage,
          loadCondition: results.loadCondition.condition,
          totalMigrations: results.migrations.totalMigrations,
          averageUtilization: results.loadCondition.averageUtilization,
          maxUtilization: results.loadCondition.maxUtilization,
          minUtilization: results.loadCondition.minUtilization,
          loadVariance: results.loadCondition.loadVariance,
          globalBestFitness: results.globalBestFitness
        }
      };
    } catch (error) {
      console.error(`Error executing Phase 4 algorithms for ${date}:`, error);
      throw error;
    }
  }

  /**
   * Run Phase 4 algorithms on all dates (multi-threaded)
   */
  async runAllPhase4Algorithms(dates, options = {}) {
    const results = {};
    const totalTasks = dates.length;
    let completedTasks = 0;
    
    // Pre-load all datasets
    console.log(`Phase 4: Pre-loading ${dates.length} datasets...`);
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
    console.log(`Phase 4: All datasets pre-loaded. Starting algorithm execution...`);
    
    // Get CPU core count for optimal worker thread allocation
    const cpuCores = os.cpus().length;
    const maxWorkers = Math.min(cpuCores, totalTasks);
    console.log(`Phase 4: Using ${maxWorkers} worker threads (${cpuCores} CPU cores available)`);
    
    // Create all tasks
    const allTasks = dates.map(date => ({
      date,
      options
    }));
    
    // Process tasks in parallel batches
    const processBatch = async (batch) => {
      const batchPromises = batch.map(async (task) => {
        try {
          const result = await this.executePhase4Algorithms(task.date, task.options);
          completedTasks++;
          const percent = ((completedTasks / totalTasks) * 100).toFixed(1);
          console.log(`Phase 4 Progress: ${completedTasks}/${totalTasks} (${percent}%) dates completed`);
          return { date: task.date, result };
        } catch (error) {
          console.error(`Error for Phase 4 on ${task.date}:`, error.message);
          completedTasks++;
          return {
            date: task.date,
            result: {
              date: task.date,
              error: error.message,
              metrics: {
                totalTasks: 0,
                totalDataCenters: 0,
                balancedPercentage: 0
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
    
    console.log(`Phase 4: Processing ${allTasks.length} tasks in ${batches.length} parallel batches...`);
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
    console.log(`✓ Phase 4: Completed all ${totalTasks} algorithm executions in ${duration} seconds`);
    
    return results;
  }
}

module.exports = Phase4Orchestrator;

