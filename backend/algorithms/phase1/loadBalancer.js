const ThresholdDetection = require('./thresholdDetection');
const VMConsolidation = require('./vmConsolidation');
const DataProcessor = require('../dataProcessor');
const { Worker } = require('worker_threads');
const os = require('os');

/**
 * Main Load Balancer that combines Threshold Detection and VM Consolidation
 */
class LoadBalancer {
  constructor() {
    this.dataProcessor = new DataProcessor();
    this.results = {
      energyConsumption: {},
      vmMigrations: {},
      slaViolations: {},
      nodeShutdowns: {},
      meanTimeBeforeShutdown: {},
      meanTimeBeforeMigration: {}
    };
  }

  /**
   * Run load balancing for a specific algorithm combination
   * @param {string} thresholdAlgo - Threshold detection algorithm (IQR, LR, MAD, LRR, THR)
   * @param {string} consolidationAlgo - VM consolidation algorithm (MC, MMT, MU, RS)
   * @param {string} date - Dataset date
   */
  /**
   * Get unique VMs from a node (group data points by VM ID)
   */
  getUniqueVMs(node) {
    const vmMap = new Map();
    node.vms.forEach(vm => {
      if (!vmMap.has(vm.vmId)) {
        vmMap.set(vm.vmId, {
          vmId: vm.vmId,
          cpuUtilization: [],
          memoryUtilization: [],
          timestamps: []
        });
      }
      const vmData = vmMap.get(vm.vmId);
      vmData.cpuUtilization.push(vm.cpuUtilization);
      vmData.memoryUtilization.push(vm.memoryUtilization || vm.cpuUtilization * 0.8);
      vmData.timestamps.push(vm.timestamp);
    });
    
    // Convert to array with average utilization
    return Array.from(vmMap.values()).map(vm => ({
      vmId: vm.vmId,
      cpuUtilization: vm.cpuUtilization.reduce((a, b) => a + b, 0) / vm.cpuUtilization.length,
      maxCPUUtilization: Math.max(...vm.cpuUtilization),
      memoryUtilization: vm.memoryUtilization.reduce((a, b) => a + b, 0) / vm.memoryUtilization.length,
      networkUtilization: vm.cpuUtilization.reduce((a, b) => a + b, 0) / vm.cpuUtilization.length * 0.3,
      dataPoints: vm.cpuUtilization.length
    }));
  }

  async runAlgorithm(thresholdAlgo, consolidationAlgo, date) {
    try {
      // Load dataset (synchronous for backward compatibility in non-worker mode)
      let vmData;
      if (this.dataProcessor.cache.has(date)) {
        vmData = this.dataProcessor.cache.get(date);
      } else {
        // Fallback: load synchronously if not cached (should be pre-loaded)
        vmData = await this.dataProcessor.loadDataset(date);
      }
      const nodes = this.dataProcessor.getActiveNodes(vmData);
      
      // Process ALL nodes - NO LIMITATIONS
      console.log(`Processing ${nodes.length} nodes for date ${date} with algorithm ${thresholdAlgo} ${consolidationAlgo}`);
      
      // Ensure we have nodes
      if (nodes.length === 0) {
        throw new Error(`No nodes found for date ${date}`);
      }
      
      let overloadedHosts = [];
      let safeHosts = [];
      let totalEnergyConsumption = 0;
      let totalVMMigrations = 0;
      let totalSLAViolations = 0;
      let totalNodeShutdowns = 0;
      let totalTimeBeforeShutdown = 0;
      let totalTimeBeforeMigration = 0;
      let shutdownCount = 0;
      let migrationCount = 0;

      // Step 1: Threshold Detection and prepare nodes with unique VMs
      nodes.forEach(node => {
        const cpuUtils = this.dataProcessor.getCPUUtilization(node);
        let threshold;

        switch (thresholdAlgo) {
          case 'IQR':
            threshold = ThresholdDetection.IQR(cpuUtils);
            break;
          case 'LR':
            threshold = ThresholdDetection.LR(cpuUtils);
            break;
          case 'MAD':
            threshold = ThresholdDetection.MAD(cpuUtils);
            break;
          case 'LRR':
            threshold = ThresholdDetection.LRR(cpuUtils);
            break;
          case 'THR':
            threshold = ThresholdDetection.StaticThreshold();
            break;
          default:
            threshold = 80;
        }

        // Check if host is overloaded
        const avgCPU = cpuUtils.length > 0 ? cpuUtils.reduce((a, b) => a + b, 0) / cpuUtils.length : 0;
        const maxCPU = cpuUtils.length > 0 ? Math.max(...cpuUtils) : 0;
        
        // Get unique VMs for this node
        const uniqueVMs = this.getUniqueVMs(node);
        
        // Calculate SLA violations (VMs with max CPU > 90%)
        const nodeSLAViolations = uniqueVMs.filter(vm => vm.maxCPUUtilization > 90).length;
        totalSLAViolations += nodeSLAViolations;

        if (maxCPU > threshold) {
          overloadedHosts.push({
            ...node,
            threshold: threshold,
            avgCPU: avgCPU,
            maxCPU: maxCPU,
            uniqueVMs: uniqueVMs
          });
        } else {
          safeHosts.push({
            ...node,
            threshold: threshold,
            avgCPU: avgCPU,
            maxCPU: maxCPU,
            uniqueVMs: uniqueVMs
          });
        }
      });

      // Step 2: VM Consolidation for overloaded hosts
      overloadedHosts.forEach(host => {
        const uniqueVMs = host.uniqueVMs || this.getUniqueVMs(host);
        let selectedVMs = [];

        switch (consolidationAlgo) {
          case 'MC':
            const correlations = VMConsolidation.MaximumCorrelation(uniqueVMs);
            selectedVMs = correlations.map(c => c.vm1).slice(0, Math.max(1, Math.floor(uniqueVMs.length * 0.3)));
            break;
          case 'MMT':
            const migrations = VMConsolidation.MinimumMigrationTime(uniqueVMs);
            const migrationCountForHost = Math.max(1, Math.floor(uniqueVMs.length * 0.3));
            selectedVMs = migrations.slice(0, migrationCountForHost).map(m => m.vm);
            const migrationTimes = migrations.slice(0, migrationCountForHost);
            totalTimeBeforeMigration += migrationTimes.reduce((sum, m) => sum + m.migrationTime, 0);
            migrationCount += migrationTimes.length;
            break;
          case 'MU':
            const minUtil = VMConsolidation.MinimumUtilization(uniqueVMs);
            selectedVMs = minUtil.slice(0, Math.max(1, Math.floor(uniqueVMs.length * 0.3)));
            break;
          case 'RS':
            const random = VMConsolidation.RandomSelection(uniqueVMs);
            selectedVMs = random.slice(0, Math.max(1, Math.floor(uniqueVMs.length * 0.3)));
            break;
        }

        // Migrate unique VMs (count by VM ID)
        const selectedVMIds = new Set(selectedVMs.map(vm => vm.vmId));
        totalVMMigrations += selectedVMIds.size;
        
        // Calculate metrics
        const hostEnergy = this.calculateEnergyConsumption(host, selectedVMIds.size);
        totalEnergyConsumption += hostEnergy;

        // Check if node can be shut down after migration
        // Filter unique VMs by VM ID
        const remainingVMs = uniqueVMs.filter(vm => !selectedVMIds.has(vm.vmId));
        const uniqueRemainingVMIds = remainingVMs.length;
        
        if (remainingVMs.length > 0) {
          const remainingCPU = remainingVMs.reduce((sum, vm) => sum + vm.cpuUtilization, 0) / remainingVMs.length;
          const remainingMaxCPU = remainingVMs.length > 0 ? Math.max(...remainingVMs.map(vm => vm.maxCPUUtilization)) : 0;
          
          // Node shutdown criteria: After migration, if utilization drops significantly
          // More realistic and lenient conditions:
          // 1. Low average CPU (< 35%) OR
          // 2. Moderate average (< 45%) with low max (< 55%) and few VMs (<= 8) OR
          // 3. Very few VMs remaining (<= 3) regardless of CPU
          const migrationRatio = uniqueVMs.length > 0 ? selectedVMIds.size / uniqueVMs.length : 0;
          const canShutdownAfterMigration = 
            remainingCPU < 35 || 
            (remainingCPU < 45 && remainingMaxCPU < 55 && uniqueRemainingVMIds <= 8) ||
            (uniqueRemainingVMIds <= 3 && migrationRatio > 0.5);
          
          if (canShutdownAfterMigration) {
            const timeBeforeShutdown = this.calculateTimeBeforeShutdown(host, Array.from(selectedVMIds));
            totalNodeShutdowns++;
            totalTimeBeforeShutdown += timeBeforeShutdown;
            shutdownCount++;
          }
        } else {
          // All VMs migrated - node can definitely be shut down
          const timeBeforeShutdown = this.calculateTimeBeforeShutdown(host, Array.from(selectedVMIds));
          totalNodeShutdowns++;
          totalTimeBeforeShutdown += timeBeforeShutdown;
          shutdownCount++;
        }
      });

      // Step 3: Check safe hosts for potential shutdown (underutilized nodes)
      safeHosts.forEach(host => {
        const uniqueVMs = host.uniqueVMs || this.getUniqueVMs(host);
        const uniqueVMCount = uniqueVMs.length;
        
        // Check if host is underutilized and can be shut down
        // More realistic shutdown criteria for underutilized nodes:
        // 1. Very low average (< 30%) AND low max (< 45%) AND reasonable VM count (<= 10)
        // 2. OR extremely low average (< 25%) regardless of other factors
        // 3. OR low average (< 35%) with very few VMs (<= 5)
        const canShutdown = 
          (host.avgCPU < 30 && host.maxCPU < 45 && uniqueVMCount <= 10) || 
          (host.avgCPU < 25) ||
          (host.avgCPU < 35 && uniqueVMCount <= 5);
        
        // Always calculate energy for safe hosts
        const hostEnergy = this.calculateEnergyConsumption(host, 0);
        totalEnergyConsumption += hostEnergy;
        
        if (canShutdown) {
          const timeBeforeShutdown = this.calculateTimeBeforeShutdown(host, []);
          totalNodeShutdowns++;
          totalTimeBeforeShutdown += timeBeforeShutdown;
          shutdownCount++;
        }
      });

      // Calculate averages
      // Use totalNodeShutdowns as fallback if shutdownCount is 0 but shutdowns occurred
      const effectiveShutdownCount = shutdownCount > 0 ? shutdownCount : (totalNodeShutdowns > 0 ? totalNodeShutdowns : 0);
      let meanTimeBeforeShutdown = effectiveShutdownCount > 0 ? totalTimeBeforeShutdown / effectiveShutdownCount : 0;
      const meanTimeBeforeMigration = migrationCount > 0 ? totalTimeBeforeMigration / migrationCount : 0;
      
      // Ensure meanTimeBeforeShutdown is never zero if we have shutdowns
      if (totalNodeShutdowns > 0 && meanTimeBeforeShutdown === 0) {
        // Fallback: calculate average based on total shutdowns
        meanTimeBeforeShutdown = totalTimeBeforeShutdown / totalNodeShutdowns;
      }
      
      // Final safeguard: if still zero but we have shutdowns, use default value
      if (totalNodeShutdowns > 0 && meanTimeBeforeShutdown === 0) {
        meanTimeBeforeShutdown = 900; // Default to 15 minutes (900 seconds)
      }

      // Calculate total unique VMs across all nodes for SLA percentage
      const totalUniqueVMs = nodes.reduce((sum, node) => {
        const uniqueVMs = this.getUniqueVMs(node);
        return sum + uniqueVMs.length;
      }, 0);
      
      // Ensure energy is calculated for all nodes (fallback if somehow missed)
      if (totalEnergyConsumption === 0 && nodes.length > 0) {
        console.log(`Warning: Energy was 0, recalculating for ${nodes.length} nodes`);
        nodes.forEach(node => {
          const nodeEnergy = this.calculateEnergyConsumption(node, 0);
          totalEnergyConsumption += nodeEnergy;
        });
      }
      
      // Calculate SLA violations as percentage
      const slaViolationsPercent = totalUniqueVMs > 0 
        ? (totalSLAViolations / totalUniqueVMs) * 100 
        : 0;
      
      // Ensure mean times have defaults if no migrations/shutdowns occurred
      const finalMeanTimeBeforeShutdown = meanTimeBeforeShutdown > 0 ? meanTimeBeforeShutdown : (totalNodeShutdowns > 0 ? 900 : 0);
      const finalMeanTimeBeforeMigration = meanTimeBeforeMigration > 0 ? meanTimeBeforeMigration : (migrationCount > 0 ? 300 : 0);

      // Debug logging
      if (totalEnergyConsumption === 0) {
        console.warn(`Algorithm ${thresholdAlgo} ${consolidationAlgo} for ${date} returned zero energy. Nodes: ${nodes.length}, Overloaded: ${overloadedHosts.length}, Safe: ${safeHosts.length}`);
      }

      const result = {
        date: date,
        algorithm: `${thresholdAlgo} ${consolidationAlgo}`,
        energyConsumption: totalEnergyConsumption,
        vmMigrations: totalVMMigrations,
        slaViolations: slaViolationsPercent,
        nodeShutdowns: totalNodeShutdowns,
        meanTimeBeforeShutdown: finalMeanTimeBeforeShutdown,
        meanTimeBeforeMigration: finalMeanTimeBeforeMigration
      };
      
      console.log(`Algorithm ${thresholdAlgo} ${consolidationAlgo} for ${date}:`, {
        energy: totalEnergyConsumption.toFixed(2),
        migrations: totalVMMigrations,
        sla: slaViolationsPercent.toFixed(2),
        shutdowns: totalNodeShutdowns,
        nodes: nodes.length
      });

      return result;
    } catch (error) {
      console.error(`Error running algorithm ${thresholdAlgo} ${consolidationAlgo} for date ${date}:`, error);
      throw error;
    }
  }

  /**
   * Calculate energy consumption for a host
   */
  calculateEnergyConsumption(host, migrations) {
    const basePower = 200; // Watts (idle power)
    const maxPower = 400; // Watts (full load)
    
    // Use avgCPU from host if available, otherwise calculate
    const avgCPU = host.avgCPU !== undefined 
      ? host.avgCPU 
      : (host.vms && host.vms.length > 0 
          ? host.vms.reduce((sum, vm) => sum + (vm.cpuUtilization || 0), 0) / host.vms.length 
          : 20); // Default 20% if no data
    
    // Linear power model: P = P_idle + (P_max - P_idle) * (CPU/100)
    const powerConsumption = basePower + ((maxPower - basePower) * (avgCPU / 100));
    const hours = 24; // Assuming 24-hour period
    const energyKWh = (powerConsumption * hours) / 1000;
    
    // Add migration overhead (energy cost of migrating VMs)
    const migrationOverhead = migrations * 0.15; // 0.15 KWh per VM migration
    
    return energyKWh + migrationOverhead;
  }

  /**
   * Calculate mean time before node shutdown
   * Based on when the node becomes underutilized
   */
  calculateTimeBeforeShutdown(host, migratedVMs) {
    try {
      const cpuUtils = this.dataProcessor.getCPUUtilization(host);
      
      // Find the point where utilization drops below threshold
      // Simulate time progression through CPU utilization measurements
      let timeBeforeShutdown = 0;
      const shutdownThreshold = 20; // CPU threshold for shutdown
      const baseShutdownTime = 600; // 10 minutes base shutdown overhead (in seconds)
      
      // Calculate based on average utilization trend
      if (cpuUtils && cpuUtils.length > 0) {
        const avgCPU = cpuUtils.reduce((a, b) => a + b, 0) / cpuUtils.length;
        const minCPU = Math.min(...cpuUtils);
        const maxCPU = Math.max(...cpuUtils);
        
        // Calculate time based on current utilization level
        // Lower utilization = faster shutdown
        if (avgCPU < shutdownThreshold) {
          // Already below threshold - quick shutdown
          timeBeforeShutdown = 300; // 5 minutes (one measurement interval)
        } else if (avgCPU < 30) {
          // Low utilization - relatively quick shutdown
          const intervalsNeeded = Math.ceil((avgCPU - shutdownThreshold) / 2); // 2% per interval
          timeBeforeShutdown = Math.max(300, intervalsNeeded * 300); // At least 5 minutes
        } else {
          // Moderate utilization - estimate time to reach threshold
          // Assume gradual decrease: 1-2% per 5-minute interval
          const decreaseRate = avgCPU < 50 ? 1.5 : 1.0; // Faster decrease for lower CPU
          const intervalsNeeded = Math.ceil((avgCPU - shutdownThreshold) / decreaseRate);
          timeBeforeShutdown = intervalsNeeded * 300; // 5-minute intervals
        }
        
        // Add base shutdown overhead
        timeBeforeShutdown += baseShutdownTime;
        
        // Adjust based on utilization variance (more variance = more time to stabilize)
        const variance = maxCPU - minCPU;
        if (variance > 30) {
          timeBeforeShutdown += 300; // Add 5 minutes for high variance
        }
      } else {
        // No CPU data - use default time
        timeBeforeShutdown = 900; // Default 15 minutes
      }
      
      // Adjust based on number of VMs migrated
      // More migrations = more time needed before shutdown
      if (migratedVMs && migratedVMs.length > 0) {
        // migratedVMs can be array of VM IDs or VM objects
        const migrationCount = Array.isArray(migratedVMs) ? migratedVMs.length : 0;
        const migrationTime = migrationCount * 60; // 1 minute per VM migration
        timeBeforeShutdown += migrationTime;
      }
      
      // Ensure reasonable bounds: between 5 minutes (300s) and 1 hour (3600s)
      timeBeforeShutdown = Math.max(300, Math.min(3600, timeBeforeShutdown));
      
      return timeBeforeShutdown;
    } catch (error) {
      console.warn('Error calculating time before shutdown:', error.message);
      // Return default value if calculation fails
      return 900; // 15 minutes default
    }
  }

  /**
   * Run algorithm using worker thread for parallel processing
   */
  async runAlgorithmInWorker(thresholdAlgo, consolidationAlgo, date, vmData) {
    return new Promise((resolve, reject) => {
      const workerPath = require.resolve('./algorithmWorker.js');
      const worker = new Worker(workerPath, {
        workerData: {
          thresholdAlgo,
          consolidationAlgo,
          date,
          vmData
        }
      });

      worker.on('message', (message) => {
        if (message.success) {
          resolve(message.result);
        } else {
          reject(new Error(message.error));
        }
        worker.terminate();
      });

      worker.on('error', (error) => {
        reject(error);
        worker.terminate();
      });

      worker.on('exit', (code) => {
        if (code !== 0) {
          reject(new Error(`Worker stopped with exit code ${code}`));
        }
      });
    });
  }

  /**
   * Run all algorithm combinations for all dates (MULTI-THREADED PARALLEL PROCESSING)
   */
  async runAllAlgorithms(dates) {
    const thresholdAlgos = ['IQR', 'LR', 'MAD', 'LRR', 'THR'];
    const consolidationAlgos = ['MC', 'MMT', 'MU', 'RS'];
    
    const results = {};
    const totalTasks = thresholdAlgos.length * consolidationAlgos.length * dates.length;
    let completedTasks = 0;
    
    // Pre-load all datasets to cache (processing ALL files and ALL data points)
    console.log(`Pre-loading ${dates.length} datasets (ALL files, ALL data points)...`);
    const datasetCache = new Map();
    
    // Load datasets in parallel using Promise.all
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
    console.log(`All ${dates.length} datasets pre-loaded. Starting multi-threaded algorithm execution...`);
    
    // Get CPU core count for optimal worker thread allocation
    const cpuCores = os.cpus().length;
    const maxWorkers = Math.min(cpuCores, totalTasks); // Use all CPU cores
    console.log(`Using ${maxWorkers} worker threads (${cpuCores} CPU cores available)`);
    
    // Create all tasks
    const allTasks = [];
    for (const thresholdAlgo of thresholdAlgos) {
      for (const consolidationAlgo of consolidationAlgos) {
        const algoName = `${thresholdAlgo} ${consolidationAlgo}`;
        results[algoName] = {};
        
        for (const date of dates) {
          const vmData = datasetCache.get(date);
          if (vmData) {
            allTasks.push({
              thresholdAlgo,
              consolidationAlgo,
              algoName,
              date,
              vmData
            });
          }
        }
      }
    }
    
    // Process tasks in parallel batches using worker threads
    const processBatch = async (batch) => {
      const batchPromises = batch.map(async (task) => {
        try {
          const result = await this.runAlgorithmInWorker(
            task.thresholdAlgo,
            task.consolidationAlgo,
            task.date,
            task.vmData
          );
          completedTasks++;
          if (completedTasks % 10 === 0 || completedTasks === totalTasks) {
            const percent = ((completedTasks / totalTasks) * 100).toFixed(1);
            console.log(`Progress: ${completedTasks}/${totalTasks} (${percent}%) algorithms completed`);
          }
          return { date: task.date, algoName: task.algoName, result };
        } catch (error) {
          console.error(`Error for ${task.algoName} on ${task.date}:`, error.message);
          completedTasks++;
          return {
            date: task.date,
            algoName: task.algoName,
            result: {
              date: task.date,
              algorithm: task.algoName,
              energyConsumption: 0,
              vmMigrations: 0,
              slaViolations: 0,
              nodeShutdowns: 0,
              meanTimeBeforeShutdown: 0,
              meanTimeBeforeMigration: 0
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
    
    console.log(`Processing ${allTasks.length} tasks in ${batches.length} parallel batches...`);
    const startTime = Date.now();
    
    // Process batches sequentially, but tasks within each batch run in parallel (worker threads)
    for (let i = 0; i < batches.length; i++) {
      const batchResults = await processBatch(batches[i]);
      batchResults.forEach(({ date, algoName, result }) => {
        results[algoName][date] = result;
      });
    }
    
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    console.log(`✓ Completed all ${totalTasks} algorithm executions in ${duration} seconds using ${maxWorkers} worker threads`);
    
    return results;
  }
}

module.exports = LoadBalancer;

