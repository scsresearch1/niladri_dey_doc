const { parentPort, workerData } = require('worker_threads');
const ThresholdDetection = require('./thresholdDetection');
const VMConsolidation = require('./vmConsolidation');
const DataProcessor = require('../dataProcessor');

/**
 * Worker thread for executing algorithm on a dataset
 * This runs in a separate thread for true parallel processing
 */
class AlgorithmWorker {
  constructor() {
    this.dataProcessor = new DataProcessor();
  }

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
    
    return Array.from(vmMap.values()).map(vm => ({
      vmId: vm.vmId,
      cpuUtilization: vm.cpuUtilization.reduce((a, b) => a + b, 0) / vm.cpuUtilization.length,
      maxCPUUtilization: Math.max(...vm.cpuUtilization),
      memoryUtilization: vm.memoryUtilization.reduce((a, b) => a + b, 0) / vm.memoryUtilization.length,
      networkUtilization: vm.cpuUtilization.reduce((a, b) => a + b, 0) / vm.cpuUtilization.length * 0.3,
      dataPoints: vm.cpuUtilization.length
    }));
  }

  calculateEnergyConsumption(host, migrations) {
    const basePower = 200;
    const maxPower = 400;
    const avgCPU = host.avgCPU !== undefined 
      ? host.avgCPU 
      : (host.vms && host.vms.length > 0 
          ? host.vms.reduce((sum, vm) => sum + (vm.cpuUtilization || 0), 0) / host.vms.length 
          : 20);
    const powerConsumption = basePower + ((maxPower - basePower) * (avgCPU / 100));
    const hours = 24;
    const energyKWh = (powerConsumption * hours) / 1000;
    const migrationOverhead = migrations * 0.15;
    return energyKWh + migrationOverhead;
  }

  calculateTimeBeforeShutdown(host, migratedVMs) {
    try {
      const cpuUtils = this.dataProcessor.getCPUUtilization(host);
      let timeBeforeShutdown = 0;
      const shutdownThreshold = 20;
      const baseShutdownTime = 600;
      
      if (cpuUtils && cpuUtils.length > 0) {
        const avgCPU = cpuUtils.reduce((a, b) => a + b, 0) / cpuUtils.length;
        const minCPU = Math.min(...cpuUtils);
        const maxCPU = Math.max(...cpuUtils);
        
        if (avgCPU < shutdownThreshold) {
          timeBeforeShutdown = 300;
        } else if (avgCPU < 30) {
          const intervalsNeeded = Math.ceil((avgCPU - shutdownThreshold) / 2);
          timeBeforeShutdown = Math.max(300, intervalsNeeded * 300);
        } else {
          const decreaseRate = avgCPU < 50 ? 1.5 : 1.0;
          const intervalsNeeded = Math.ceil((avgCPU - shutdownThreshold) / decreaseRate);
          timeBeforeShutdown = intervalsNeeded * 300;
        }
        
        timeBeforeShutdown += baseShutdownTime;
        const variance = maxCPU - minCPU;
        if (variance > 30) {
          timeBeforeShutdown += 300;
        }
      } else {
        timeBeforeShutdown = 900;
      }
      
      if (migratedVMs && migratedVMs.length > 0) {
        const migrationCount = Array.isArray(migratedVMs) ? migratedVMs.length : 0;
        timeBeforeShutdown += migrationCount * 60;
      }
      
      return Math.max(300, Math.min(3600, timeBeforeShutdown));
    } catch (error) {
      return 900;
    }
  }

  async runAlgorithm(thresholdAlgo, consolidationAlgo, date, vmData) {
    try {
      let nodes = this.dataProcessor.getActiveNodes(vmData);
      
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

      // Step 1: Threshold Detection
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

        const avgCPU = cpuUtils.length > 0 ? cpuUtils.reduce((a, b) => a + b, 0) / cpuUtils.length : 0;
        const maxCPU = cpuUtils.length > 0 ? Math.max(...cpuUtils) : 0;
        const uniqueVMs = this.getUniqueVMs(node);
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

        const selectedVMIds = new Set(selectedVMs.map(vm => vm.vmId));
        totalVMMigrations += selectedVMIds.size;
        const hostEnergy = this.calculateEnergyConsumption(host, selectedVMIds.size);
        totalEnergyConsumption += hostEnergy;

        const remainingVMs = uniqueVMs.filter(vm => !selectedVMIds.has(vm.vmId));
        const uniqueRemainingVMIds = remainingVMs.length;
        
        if (remainingVMs.length > 0) {
          const remainingCPU = remainingVMs.reduce((sum, vm) => sum + vm.cpuUtilization, 0) / remainingVMs.length;
          const remainingMaxCPU = remainingVMs.length > 0 ? Math.max(...remainingVMs.map(vm => vm.maxCPUUtilization)) : 0;
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
          const timeBeforeShutdown = this.calculateTimeBeforeShutdown(host, Array.from(selectedVMIds));
          totalNodeShutdowns++;
          totalTimeBeforeShutdown += timeBeforeShutdown;
          shutdownCount++;
        }
      });

      // Step 3: Check safe hosts
      safeHosts.forEach(host => {
        const uniqueVMs = host.uniqueVMs || this.getUniqueVMs(host);
        const uniqueVMCount = uniqueVMs.length;
        
        const canShutdown = 
          (host.avgCPU < 30 && host.maxCPU < 45 && uniqueVMCount <= 10) || 
          (host.avgCPU < 25) ||
          (host.avgCPU < 35 && uniqueVMCount <= 5);
        
        const hostEnergy = this.calculateEnergyConsumption(host, 0);
        totalEnergyConsumption += hostEnergy;
        
        if (canShutdown) {
          const timeBeforeShutdown = this.calculateTimeBeforeShutdown(host, []);
          totalNodeShutdowns++;
          totalTimeBeforeShutdown += timeBeforeShutdown;
          shutdownCount++;
        }
      });

      const effectiveShutdownCount = shutdownCount > 0 ? shutdownCount : (totalNodeShutdowns > 0 ? totalNodeShutdowns : 0);
      let meanTimeBeforeShutdown = effectiveShutdownCount > 0 ? totalTimeBeforeShutdown / effectiveShutdownCount : 0;
      const meanTimeBeforeMigration = migrationCount > 0 ? totalTimeBeforeMigration / migrationCount : 0;
      
      if (totalNodeShutdowns > 0 && meanTimeBeforeShutdown === 0) {
        meanTimeBeforeShutdown = totalTimeBeforeShutdown / totalNodeShutdowns;
      }
      
      if (totalNodeShutdowns > 0 && meanTimeBeforeShutdown === 0) {
        meanTimeBeforeShutdown = 900;
      }

      const totalUniqueVMs = nodes.reduce((sum, node) => {
        const uniqueVMs = this.getUniqueVMs(node);
        return sum + uniqueVMs.length;
      }, 0);
      
      if (totalEnergyConsumption === 0 && nodes.length > 0) {
        nodes.forEach(node => {
          totalEnergyConsumption += this.calculateEnergyConsumption(node, 0);
        });
      }
      
      const slaViolationsPercent = totalUniqueVMs > 0 
        ? (totalSLAViolations / totalUniqueVMs) * 100 
        : 0;
      
      const finalMeanTimeBeforeShutdown = meanTimeBeforeShutdown > 0 ? meanTimeBeforeShutdown : (totalNodeShutdowns > 0 ? 900 : 0);
      const finalMeanTimeBeforeMigration = meanTimeBeforeMigration > 0 ? meanTimeBeforeMigration : (migrationCount > 0 ? 300 : 0);

      return {
        date: date,
        algorithm: `${thresholdAlgo} ${consolidationAlgo}`,
        energyConsumption: totalEnergyConsumption,
        vmMigrations: totalVMMigrations,
        slaViolations: slaViolationsPercent,
        nodeShutdowns: totalNodeShutdowns,
        meanTimeBeforeShutdown: finalMeanTimeBeforeShutdown,
        meanTimeBeforeMigration: finalMeanTimeBeforeMigration
      };
    } catch (error) {
      throw error;
    }
  }
}

// Worker thread execution
if (parentPort) {
  const worker = new AlgorithmWorker();
  const { thresholdAlgo, consolidationAlgo, date, vmData } = workerData;
  
  worker.runAlgorithm(thresholdAlgo, consolidationAlgo, date, vmData)
    .then(result => {
      parentPort.postMessage({ success: true, result });
    })
    .catch(error => {
      parentPort.postMessage({ success: false, error: error.message });
    });
}

