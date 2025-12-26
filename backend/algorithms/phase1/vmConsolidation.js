/**
 * VM Consolidation Algorithms
 */

class VMConsolidation {
  /**
   * Algorithm 5: Maximum Correlation (MC)
   * Uses Kendall correlation coefficient
   */
  static MaximumCorrelation(vms) {
    if (vms.length === 0) return [];
    
    // Build correlation matrix using Kendall correlation
    const correlations = [];
    
    for (let i = 0; i < vms.length; i++) {
      for (let j = i + 1; j < vms.length; j++) {
        const correlation = this.kendallCorrelation(
          vms[i].cpuUtilization,
          vms[j].cpuUtilization
        );
        correlations.push({
          vm1: vms[i],
          vm2: vms[j],
          correlation: correlation
        });
      }
    }
    
    // Sort by correlation (highest first)
    correlations.sort((a, b) => b.correlation - a.correlation);
    
    // Return VMs with highest correlation
    return correlations.slice(0, Math.min(10, correlations.length));
  }

  /**
   * Algorithm 6: Minimum Migration Time (MMT)
   */
  static MinimumMigrationTime(vms, networkSpeed = 1000) {
    // Calculate migration time for each VM
    const migrationTimes = vms.map(vm => {
      const ramSize = vm.memoryUtilization || 1024; // MB
      const appSize = vm.cpuUtilization * 10 || 100; // Estimated from CPU
      const transferTime = (ramSize * appSize) / networkSpeed;
      const shutdownTime = 5; // seconds
      const startupTime = 10; // seconds
      const totalTime = shutdownTime + startupTime + transferTime;
      
      return {
        vm: vm,
        migrationTime: totalTime
      };
    });
    
    // Sort by migration time (lowest first)
    migrationTimes.sort((a, b) => a.migrationTime - b.migrationTime);
    
    return migrationTimes;
  }

  /**
   * Algorithm 7: Random Selection (RS)
   */
  static RandomSelection(vms) {
    const shuffled = [...vms].sort(() => Math.random() - 0.5);
    return shuffled;
  }

  /**
   * Minimum Utilization (MU) - Select VMs with minimum utilization
   */
  static MinimumUtilization(vms) {
    const sorted = [...vms].sort((a, b) => 
      (a.cpuUtilization + a.memoryUtilization) - (b.cpuUtilization + b.memoryUtilization)
    );
    return sorted;
  }

  /**
   * Calculate Kendall correlation coefficient
   */
  static kendallCorrelation(arr1, arr2) {
    if (!Array.isArray(arr1)) arr1 = [arr1];
    if (!Array.isArray(arr2)) arr2 = [arr2];
    
    const n = Math.min(arr1.length, arr2.length);
    if (n < 2) return 0;
    
    let concordant = 0;
    let discordant = 0;
    
    for (let i = 0; i < n - 1; i++) {
      for (let j = i + 1; j < n; j++) {
        const sign1 = Math.sign(arr1[j] - arr1[i]);
        const sign2 = Math.sign(arr2[j] - arr2[i]);
        
        if (sign1 * sign2 > 0) concordant++;
        else if (sign1 * sign2 < 0) discordant++;
      }
    }
    
    const total = concordant + discordant;
    return total > 0 ? (concordant - discordant) / total : 0;
  }
}

module.exports = VMConsolidation;

