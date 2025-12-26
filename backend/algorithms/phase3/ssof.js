/**
 * Algorithm - 15: System Stability Driven Objective Function (SSOF)
 * 
 * Input:
 * - I[]: Infrastructure allocated to the VMs
 * - LT: Local Threshold
 * - GT: Global Threshold
 * 
 * Output:
 * - SS: System state {Balanced, Un-Balanced}
 */

class SSOF {
  /**
   * Execute SSOF algorithm
   * @param {Array} infrastructures - Infrastructure allocated to VMs (I[])
   * @param {number} localThreshold - Local Threshold (LT)
   * @param {number} globalThreshold - Global Threshold (GT)
   * @returns {Object} System state and stability metrics
   */
  static execute(infrastructures, localThreshold = 0, globalThreshold = 0) {
    let totalCapacity = 0;
    let systemState = 'Un-Balanced';
    const utilizationResults = [];
    
    // For each element in I[] as I[k]
    infrastructures.forEach((infrastructure, k) => {
      // Identify the utilization as Util(I[k]) <= capacity - demand
      const capacity = {
        computeCapacity: infrastructure.computeCapacity || 0,
        memoryCapacity: infrastructure.memoryCapacity || 0,
        storageCapacity: infrastructure.storageCapacity || 0,
        networkBandwidth: infrastructure.networkBandwidth || 0
      };
      
      const demand = {
        computeCapacity: infrastructure.computeDemand || infrastructure.currentComputeLoad || 0,
        memoryCapacity: infrastructure.memoryDemand || infrastructure.currentMemoryLoad || 0,
        storageCapacity: infrastructure.storageDemand || infrastructure.currentStorageLoad || 0,
        networkBandwidth: infrastructure.networkDemand || infrastructure.currentNetworkLoad || 0
      };
      
      const totalCapacityValue = capacity.computeCapacity + capacity.memoryCapacity +
                                 capacity.storageCapacity + capacity.networkBandwidth;
      
      const totalDemandValue = demand.computeCapacity + demand.memoryCapacity +
                              demand.storageCapacity + demand.networkBandwidth;
      
      const utilization = Math.max(0, totalCapacityValue - totalDemandValue);
      
      utilizationResults.push({
        infrastructureId: infrastructure.id || infrastructure.infrastructureId,
        utilization: utilization,
        capacity: totalCapacityValue,
        demand: totalDemandValue
      });
      
      // If Util(I[k]) < LT
      if (utilization < localThreshold) {
        // For each element in I[0..k]
        let cumulativeCapacity = 0;
        for (let j = 0; j <= k; j++) {
          const infra = infrastructures[j];
          if (infra) {
            const infraCapacity = (infra.computeCapacity || 0) +
                                 (infra.memoryCapacity || 0) +
                                 (infra.storageCapacity || 0) +
                                 (infra.networkBandwidth || 0);
            
            const infraDemand = (infra.computeDemand || infra.currentComputeLoad || 0) +
                               (infra.memoryDemand || infra.currentMemoryLoad || 0) +
                               (infra.storageDemand || infra.currentStorageLoad || 0) +
                               (infra.networkDemand || infra.currentNetworkLoad || 0);
            
            const infraUtilization = Math.max(0, infraCapacity - infraDemand);
            
            // Calculate the total capacity as TC = TC + Util(I[k])
            cumulativeCapacity += infraUtilization;
          }
        }
        
        // If TC < GT
        if (cumulativeCapacity < globalThreshold) {
          // Then, SS: Balanced
          systemState = 'Balanced';
        } else {
          // Else, SS: Un-Balanced
          systemState = 'Un-Balanced';
        }
      }
    });
    
    // If no infrastructure met the local threshold condition, check overall
    if (systemState === 'Un-Balanced' && infrastructures.length > 0) {
      const totalUtilization = utilizationResults.reduce((sum, r) => sum + r.utilization, 0);
      const avgUtilization = totalUtilization / infrastructures.length;
      
      // If average utilization is below global threshold, system might be balanced
      if (avgUtilization < globalThreshold && totalUtilization < globalThreshold * infrastructures.length) {
        systemState = 'Balanced';
      }
    }
    
    return {
      SS: systemState, // System state: Balanced or Un-Balanced
      localThreshold: localThreshold,
      globalThreshold: globalThreshold,
      totalCapacity: totalCapacity,
      utilizationResults: utilizationResults,
      averageUtilization: utilizationResults.length > 0 
        ? utilizationResults.reduce((sum, r) => sum + r.utilization, 0) / utilizationResults.length 
        : 0
    };
  }

  /**
   * Execute SSOF for a subset of infrastructures
   * @param {Array} infrastructures - Subset of infrastructures
   * @param {number} localThreshold - Local Threshold
   * @param {number} globalThreshold - Global Threshold
   * @returns {Object} System state
   */
  static executeForSubset(infrastructures, localThreshold, globalThreshold) {
    return this.execute(infrastructures, localThreshold, globalThreshold);
  }
}

module.exports = SSOF;

