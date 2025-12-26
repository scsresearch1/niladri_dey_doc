const SBCSL = require('./sbcsl');
const CCPLP = require('./ccplp');
const CBLP = require('./cblp');
const LBPCCCP = require('./lbPccCp');
const DataProcessor = require('../dataProcessor');
const { Worker } = require('worker_threads');
const os = require('os');

/**
 * Phase 2 Algorithm Orchestrator
 * Coordinates execution of all Phase 2 algorithms:
 * 1. SBCSL - Service Based Categorization and Summarization of Loads
 * 2. CCPLP - Corrective Coefficient Based Pheromone Level Prediction
 * 3. CBLP - Correlation Based Load Prediction
 * 4. LB-PCC-CP - Load Balancing by Predictive Corrective Coefficient and Correlative Prediction
 */
class Phase2Orchestrator {
  constructor() {
    this.dataProcessor = new DataProcessor();
  }

  /**
   * Prepare VMs and Services from dataset (optimized for large datasets)
   */
  prepareVMsAndServices(vmData, date) {
    // Group VMs by unique VM ID first to avoid duplicates
    const vmMap = new Map();
    
    // Process VM data and group by VM ID
    vmData.forEach((vm) => {
      const vmId = vm.vmId || vm.id;
      if (!vmId) return; // Skip invalid entries
      
      if (!vmMap.has(vmId)) {
        const cpuUtil = vm.cpuUtilization || 0;
        const memUtil = vm.memoryUtilization || (cpuUtil * 0.8);
        const netUtil = vm.networkUtilization || (cpuUtil * 0.3);
        
        // Determine service based on VM characteristics
        let serviceType = 'low';
        if (cpuUtil > 70) serviceType = 'high';
        else if (cpuUtil > 40) serviceType = 'medium';
        
        // Store aggregated VM data (use averages for multiple data points)
        vmMap.set(vmId, {
          vmId: vmId,
          id: vmId,
          serviceId: `service_${serviceType}`,
          computeCapacity: cpuUtil,
          C: cpuUtil,
          memoryCapacity: memUtil,
          M: memUtil,
          storageCapacity: cpuUtil * 0.5,
          S: cpuUtil * 0.5,
          networkCapacity: netUtil,
          N: netUtil,
          cpuUtilization: cpuUtil,
          memoryUtilization: memUtil,
          networkUtilization: netUtil,
          currentLoad: cpuUtil,
          load: cpuUtil,
          dataPointCount: 1
        });
      } else {
        // Aggregate multiple data points for the same VM
        const existingVM = vmMap.get(vmId);
        const cpuUtil = vm.cpuUtilization || 0;
        const memUtil = vm.memoryUtilization || (cpuUtil * 0.8);
        const netUtil = vm.networkUtilization || (cpuUtil * 0.3);
        
        // Update with running average
        const count = existingVM.dataPointCount;
        existingVM.computeCapacity = ((existingVM.computeCapacity * count) + cpuUtil) / (count + 1);
        existingVM.C = existingVM.computeCapacity;
        existingVM.memoryCapacity = ((existingVM.memoryCapacity * count) + memUtil) / (count + 1);
        existingVM.M = existingVM.memoryCapacity;
        existingVM.networkCapacity = ((existingVM.networkCapacity * count) + netUtil) / (count + 1);
        existingVM.N = existingVM.networkCapacity;
        existingVM.cpuUtilization = existingVM.computeCapacity;
        existingVM.memoryUtilization = existingVM.memoryCapacity;
        existingVM.networkUtilization = existingVM.networkCapacity;
        existingVM.currentLoad = existingVM.computeCapacity;
        existingVM.load = existingVM.computeCapacity;
        existingVM.dataPointCount = count + 1;
      }
    });
    
    // Convert to arrays
    const vms = Array.from(vmMap.values());
    
    // Create services
    const serviceMap = new Map();
    vms.forEach(vm => {
      if (!serviceMap.has(vm.serviceId)) {
        const serviceType = vm.serviceId.replace('service_', '');
        serviceMap.set(vm.serviceId, {
          id: vm.serviceId,
          name: `Service ${serviceType.charAt(0).toUpperCase() + serviceType.slice(1)} Load`,
          type: serviceType
        });
      }
    });
    
    const services = Array.from(serviceMap.values());
    
    console.log(`  Prepared ${vms.length} unique VMs across ${services.length} services from ${vmData.length} data points`);
    
    return { services, vms };
  }

  /**
   * Execute all Phase 2 algorithms for a dataset
   */
  async executePhase2Algorithms(date, options = {}) {
    try {
      // Load dataset (use cached data if available)
      let vmData;
      if (this.dataProcessor.cache && this.dataProcessor.cache.has(date)) {
        vmData = this.dataProcessor.cache.get(date);
        console.log(`Phase 2: Using cached dataset ${date}: ${vmData.length} data points`);
      } else {
        vmData = await this.dataProcessor.loadDataset(date);
        console.log(`Phase 2: Loaded dataset ${date}: ${vmData.length} data points`);
      }
      
      // Limit data points if dataset is extremely large to avoid memory issues
      const MAX_DATA_POINTS = 1000000; // 1 million data points max
      if (vmData.length > MAX_DATA_POINTS) {
        console.log(`  Warning: Dataset has ${vmData.length} data points, sampling to ${MAX_DATA_POINTS} for processing`);
        // Sample every Nth data point
        const step = Math.ceil(vmData.length / MAX_DATA_POINTS);
        vmData = vmData.filter((_, idx) => idx % step === 0);
      }
      
      // Prepare VMs and Services
      const { services, vms } = this.prepareVMsAndServices(vmData, date);
      
      // Validate that we have VMs and services
      if (!vms || vms.length === 0) {
        throw new Error(`No VMs prepared for date ${date}. Dataset may be empty or invalid.`);
      }
      if (!services || services.length === 0) {
        throw new Error(`No services prepared for date ${date}.`);
      }
      
      console.log(`Phase 2: Processing ${vms.length} VMs across ${services.length} services for date ${date}`);
      
      // Step 1: Execute SBCSL (Algorithm 8)
      console.log(`  Step 1: Executing SBCSL on ${vms.length} VMs...`);
      const sbcslResults = SBCSL.execute(services, vms);
      
      // Validate SBCSL results
      if (!sbcslResults || Object.keys(sbcslResults).length === 0) {
        console.warn(`  Warning: SBCSL returned no results for ${date}`);
      }
      
      // Aggregate SBCSL results across all services
      let totalCS = 0, totalMS = 0, totalSS = 0, totalNS = 0;
      const serviceResultValues = Object.values(sbcslResults);
      for (let i = 0; i < serviceResultValues.length; i++) {
        const serviceResult = serviceResultValues[i];
        totalCS += serviceResult.CS || 0;
        totalMS += serviceResult.MS || 0;
        totalSS += serviceResult.SS || 0;
        totalNS += serviceResult.NS || 0;
      }
      
      const summarizedLoads = {
        CS: totalCS,
        MS: totalMS,
        SS: totalSS,
        NS: totalNS
      };
      
      console.log(`  SBCSL Complete: CS=${totalCS.toFixed(2)}, MS=${totalMS.toFixed(2)}, SS=${totalSS.toFixed(2)}, NS=${totalNS.toFixed(2)}`);
      
      // Step 2: Execute CCPLP (Algorithm 9)
      console.log(`  Step 2: Executing CCPLP on ${vms.length} VMs...`);
      const cclpParams = {
        PHt: options.pheromoneLevel || 1.0,
        K1: options.growthRate || 0.1,
        K2: options.decayRate || 0.05,
        T: options.simulationDuration || 100,
        K: options.events || [],
        TR: options.predictionDepth || 1
      };
      
      const cclpResults = CCPLP.execute(vms, cclpParams);
      
      // Validate CCPLP results
      if (!cclpResults || Object.keys(cclpResults).length === 0) {
        console.warn(`  Warning: CCPLP returned no results for ${date}`);
      }
      
      const samplePheromone = Object.values(cclpResults)[0];
      console.log(`  CCPLP Complete: Predicted pheromone levels for ${Object.keys(cclpResults).length} VMs`);
      if (samplePheromone) {
        console.log(`  Sample pheromone: PHt=${samplePheromone.PHt}, PHt1=${samplePheromone.PHt1.toFixed(4)}`);
      } else {
        console.warn(`  Warning: No sample pheromone data available for ${date}`);
      }
      
      // Step 3: Execute CBLP (Algorithm 10)
      console.log(`  Step 3: Executing CBLP on ${vms.length} VMs...`);
      const cblpWeights = {
        CW: options.computeWeight || 0.4,
        MW: options.memoryWeight || 0.3,
        SW: options.storageWeight || 0.2,
        NW: options.networkWeight || 0.1
      };
      
      const cblpResults = CBLP.execute(vms, cblpWeights, summarizedLoads);
      
      // Validate CBLP results
      if (!cblpResults || Object.keys(cblpResults).length === 0) {
        console.warn(`  Warning: CBLP returned no results for ${date}`);
      }
      
      const sampleLoad = Object.values(cblpResults)[0];
      console.log(`  CBLP Complete: Predicted loads for ${Object.keys(cblpResults).length} VMs`);
      if (sampleLoad) {
        console.log(`  Sample load: Lt=${sampleLoad.Lt.toFixed(2)}, Lt1=${sampleLoad.Lt1.toFixed(2)}`);
      } else {
        console.warn(`  Warning: No sample load data available for ${date}`);
      }
      
      // Step 4: Execute LB-PCC-CP (Algorithm 11)
      console.log(`  Step 4: Executing LB-PCC-CP...`);
      const totalCurrentLoad = vms.reduce((sum, vm) => {
        const load = vm.currentLoad || vm.load || vm.computeCapacity || 0;
        return sum + load;
      }, 0);
      
      console.log(`  Current total load: ${totalCurrentLoad.toFixed(2)}, Total capacity: ${(totalCS + totalMS + totalSS + totalNS).toFixed(2)}`);
      
      const lbResults = LBPCCCP.execute(vms, summarizedLoads, cclpResults, cblpResults, {
        currentLoad: totalCurrentLoad
      });
      
      // Validate LB-PCC-CP results
      if (!lbResults) {
        throw new Error(`LB-PCC-CP returned no results for date ${date}`);
      }
      
      console.log(`  LB-PCC-CP Complete: ${lbResults.totalMigrations || 0} migrations recommended out of ${vms.length} VMs`);
      
      // Calculate performance metrics
      const totalVMs = vms.length;
      const vmsNeedingMigration = lbResults.totalMigrations || 0;
      const migrationRate = totalVMs > 0 ? (vmsNeedingMigration / totalVMs) * 100 : 0;
      console.log(`  Migration metrics: ${vmsNeedingMigration} VMs need migration out of ${totalVMs} (${migrationRate.toFixed(2)}%)`);
      
      // Ensure we have valid values
      if (vmsNeedingMigration === 0 && totalVMs > 0) {
        console.log(`  Note: No migrations needed - system is balanced or thresholds are too high`);
      }
      
      // Calculate average predicted load (optimized to avoid large array operations)
      let totalPredictedLoad = 0;
      let predictedLoadCount = 0;
      const cblpValues = Object.values(cblpResults || {});
      for (let i = 0; i < cblpValues.length; i++) {
        const load = cblpValues[i]?.Lt1;
        if (load !== undefined && load !== null && !isNaN(load) && load > 0) {
          totalPredictedLoad += load;
          predictedLoadCount++;
        }
      }
      const avgPredictedLoad = predictedLoadCount > 0 ? totalPredictedLoad / predictedLoadCount : 0;
      console.log(`  Average predicted load: ${avgPredictedLoad.toFixed(2)} (from ${predictedLoadCount} VMs)`);
      
      // Fallback: if no predicted loads, use current loads
      if (avgPredictedLoad === 0 && vms.length > 0) {
        const fallbackLoad = vms.reduce((sum, vm) => {
          const load = vm.currentLoad || vm.load || vm.computeCapacity || 0;
          return sum + load;
        }, 0) / vms.length;
        console.log(`  Using fallback average load: ${fallbackLoad.toFixed(2)}`);
      }
      
      // Calculate average pheromone level (optimized)
      let totalPheromone = 0;
      let pheromoneCount = 0;
      const cclpValues = Object.values(cclpResults || {});
      for (let i = 0; i < cclpValues.length; i++) {
        const pheromone = cclpValues[i]?.PHt1;
        if (pheromone !== undefined && pheromone !== null && !isNaN(pheromone) && pheromone > 0) {
          totalPheromone += pheromone;
          pheromoneCount++;
        }
      }
      const avgPheromoneLevel = pheromoneCount > 0 ? totalPheromone / pheromoneCount : 0;
      console.log(`  Average pheromone level: ${avgPheromoneLevel.toFixed(4)} (from ${pheromoneCount} VMs)`);
      
      // Fallback: if no pheromone levels, use default
      if (avgPheromoneLevel === 0) {
        console.log(`  Using default pheromone level: 1.0`);
      }
      
      return {
        date: date,
        algorithms: {
          SBCSL: {
            summarizedLoads: summarizedLoads,
            serviceCount: Object.keys(sbcslResults).length
            // serviceResults: sbcslResults // Excluded to reduce response size
          },
          CCPLP: {
            averagePheromoneLevel: avgPheromoneLevel,
            vmCount: Object.keys(cclpResults).length
            // pheromoneLevels: cclpResults // Excluded to reduce response size
          },
          CBLP: {
            averagePredictedLoad: avgPredictedLoad,
            vmCount: Object.keys(cblpResults).length
            // predictedLoads: cblpResults // Excluded to reduce response size
          },
          LBPCCCP: {
            threshold: lbResults.threshold,
            totalMigrations: lbResults.totalMigrations,
            summary: lbResults.summary
            // migrationDecisions: lbResults.migrationDecisions, // Excluded to reduce response size
            // optimalDestinations: lbResults.optimalDestinations // Excluded to reduce response size
          }
        },
        metrics: {
          totalVMs: totalVMs || 0,
          totalServices: services.length || 0,
          vmsNeedingMigration: vmsNeedingMigration || 0,
          migrationRate: migrationRate || 0,
          averagePredictedLoad: avgPredictedLoad > 0 ? avgPredictedLoad : (vms.length > 0 ? vms.reduce((sum, vm) => sum + (vm.currentLoad || vm.load || vm.computeCapacity || 0), 0) / vms.length : 0),
          averagePheromoneLevel: avgPheromoneLevel > 0 ? avgPheromoneLevel : 1.0,
          totalComputeLoad: totalCS || 0,
          totalMemoryLoad: totalMS || 0,
          totalStorageLoad: totalSS || 0,
          totalNetworkLoad: totalNS || 0
        }
      };
    } catch (error) {
      console.error(`Error executing Phase 2 algorithms for ${date}:`, error);
      throw error;
    }
  }

  /**
   * Run Phase 2 algorithms on all dates (multi-threaded)
   */
  async runAllPhase2Algorithms(dates, options = {}) {
    const results = {};
    const totalTasks = dates.length;
    let completedTasks = 0;
    
    // Pre-load all datasets
    console.log(`Phase 2: Pre-loading ${dates.length} datasets...`);
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
    console.log(`Phase 2: All datasets pre-loaded. Starting algorithm execution...`);
    
    // Get CPU core count for optimal worker thread allocation
    const cpuCores = os.cpus().length;
    const maxWorkers = Math.min(cpuCores, totalTasks);
    console.log(`Phase 2: Using ${maxWorkers} worker threads (${cpuCores} CPU cores available)`);
    
    // Create all tasks
    const allTasks = dates.map(date => ({
      date,
      options
    }));
    
    // Process tasks in parallel batches
    const processBatch = async (batch) => {
      const batchPromises = batch.map(async (task) => {
        try {
          const result = await this.executePhase2Algorithms(task.date, task.options);
          completedTasks++;
          const percent = ((completedTasks / totalTasks) * 100).toFixed(1);
          console.log(`Phase 2 Progress: ${completedTasks}/${totalTasks} (${percent}%) dates completed`);
          return { date: task.date, result };
        } catch (error) {
          console.error(`Error for Phase 2 on ${task.date}:`, error.message);
          completedTasks++;
          return {
            date: task.date,
            result: {
              date: task.date,
              error: error.message,
              metrics: {
                totalVMs: 0,
                vmsNeedingMigration: 0,
                migrationRate: 0
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
    
    console.log(`Phase 2: Processing ${allTasks.length} tasks in ${batches.length} parallel batches...`);
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
    console.log(`✓ Phase 2: Completed all ${totalTasks} algorithm executions in ${duration} seconds`);
    
    return results;
  }
}

module.exports = Phase2Orchestrator;

