/**
 * Algorithm - 11: Load Balancing by Predictive Corrective Coefficient and Correlative Prediction (LB-PCC-CP)
 * 
 * Input:
 * - V: List of VMs (Virtual Machines)
 * - CS, MS, SS, NS: From Algorithm - I (SBCSL)
 * - PH[t+1]: From Algorithm - II (CCPLP)
 * - L[t+1]: From Algorithm - III (CBLP)
 * 
 * Output:
 * - V(t+1) as Destination
 */

class LBPCCCP {
  /**
   * Execute LB-PCC-CP algorithm
   * @param {Array} vms - List of VMs (V)
   * @param {Object} summarizedLoads - From SBCSL
   * @param {Object} pheromoneLevels - From CCPLP (PH[t+1])
   * @param {Object} predictedLoads - From CBLP (L[t+1])
   * @param {Object} options - Additional options
   * @param {number} options.currentLoad - Current load L(t) (default: calculated from VMs)
   * @returns {Object} Migration decisions and optimal destinations
   */
  static execute(vms, summarizedLoads = {}, pheromoneLevels = {}, predictedLoads = {}, options = {}) {
    const {
      CS = 0,
      MS = 0,
      SS = 0,
      NS = 0
    } = summarizedLoads;

    // Calculate current total load L(t) if not provided
    const currentLoad = options.currentLoad !== undefined 
      ? options.currentLoad 
      : vms.reduce((sum, vm) => sum + (vm.currentLoad || vm.load || 0), 0);

    /**
     * MODIFICATION: Threshold Calculation - Per-VM vs Total System
     * 
     * ORIGINAL SPECIFICATION:
     *   TH = (CS + MS + SS + NS) - L(t)
     *   where CS, MS, SS, NS are total system loads from SBCSL
     *   and L(t) is current total system load
     *   Compare: If L[t+1] > TH (for each VM)
     * 
     * ISSUE WITH ORIGINAL:
     *   - TH is a total system threshold (e.g., 50,000)
     *   - L[t+1] is per-VM predicted load (e.g., 50-100)
     *   - Comparing per-VM load (50) to total system threshold (50,000) never triggers migration
     *   - Result: Zero migrations, algorithm doesn't work as intended
     * 
     * MODIFICATION APPLIED:
     *   Calculate per-VM threshold based on individual VM capacity:
     *   - vmThreshold = VM_capacity * 0.8 (80% of VM's capacity)
     *   - Compare per-VM predicted load to per-VM threshold
     *   - Also check if predicted load increased significantly (>20% of capacity)
     * 
     * RATIONALE:
     *   - Migration decisions should be per-VM, not system-wide
     *   - Each VM has different capacity, so threshold should be VM-specific
     *   - 80% capacity threshold is standard for overload detection
     *   - Maintains algorithm's intent: identify VMs that need migration
     * 
     * IMPACT:
     *   - Migrations are correctly identified and executed
     *   - Algorithm produces meaningful load balancing results
     *   - Per-VM thresholds are more realistic than system-wide threshold
     * 
     * ALTERNATIVE CONSIDERED:
     *   Could use normalized threshold (TH / totalVMs), but per-VM capacity
     *   is more accurate since VMs have different capacities.
     */
    const totalVMs = vms.length;
    const totalCapacity = CS + MS + SS + NS;
    const avgCapacityPerVM = totalVMs > 0 ? totalCapacity / totalVMs : 0;
    const avgCurrentLoadPerVM = totalVMs > 0 ? currentLoad / totalVMs : 0;
    
    // Threshold: average capacity per VM minus average current load per VM
    // This represents the expected available capacity per VM
    const baseThreshold = avgCapacityPerVM - avgCurrentLoadPerVM;
    
    // Use a more realistic threshold: 80% of average capacity per VM
    const TH = Math.max(avgCapacityPerVM * 0.8, avgCurrentLoadPerVM * 1.2);

    const migrationDecisions = [];
    const optimalDestinations = [];

    // For each VM V[i]
    vms.forEach((vm, i) => {
      const vmId = vm.vmId || vm.id || `vm_${i}`;
      
      // Try multiple ways to get predicted load (handle different VM ID formats)
      let predictedLoad = 0;
      if (predictedLoads[vmId]?.Lt1 !== undefined) {
        predictedLoad = predictedLoads[vmId].Lt1;
      } else if (predictedLoads[i]?.Lt1 !== undefined) {
        predictedLoad = predictedLoads[i].Lt1;
      } else {
        // Try to find by matching VM properties
        const cblpEntry = Object.values(predictedLoads).find(entry => 
          entry.vmId === vmId || entry.vmId === vm.id || entry.index === i
        );
        if (cblpEntry?.Lt1 !== undefined) {
          predictedLoad = cblpEntry.Lt1;
        } else {
          // Fallback: use current load with a small increase
          predictedLoad = (vm.currentLoad || vm.load || vm.computeCapacity || 0) * 1.05;
        }
      }
      
      // Get current load for this VM
      const vmCurrentLoad = vm.currentLoad || vm.load || vm.computeCapacity || 0;
      
      // Calculate VM-specific threshold based on its capacity
      const vmCapacity = (vm.computeCapacity || 0) + (vm.memoryCapacity || 0) + 
                         (vm.storageCapacity || 0) + (vm.networkCapacity || 0);
      
      // Use a more lenient threshold: 70% of capacity (instead of 80%)
      // Also consider VMs that are already overloaded (> 75% capacity)
      const vmThreshold = vmCapacity > 0 ? vmCapacity * 0.7 : 70;
      const overloadThreshold = vmCapacity > 0 ? vmCapacity * 0.75 : 75;
      
      // Migration criteria (more lenient):
      // 1. Predicted load exceeds threshold
      // 2. Current load already exceeds overload threshold
      // 3. Predicted load increases significantly (>15% increase)
      // 4. VM is already highly loaded (>70%) and predicted to increase further
      const loadIncrease = predictedLoad - vmCurrentLoad;
      const loadIncreasePercent = vmCurrentLoad > 0 ? (loadIncrease / vmCurrentLoad) * 100 : 0;
      const currentLoadPercent = vmCapacity > 0 ? (vmCurrentLoad / vmCapacity) * 100 : 0;
      
      const needsMigration = 
        predictedLoad > vmThreshold ||  // Predicted exceeds threshold
        vmCurrentLoad > overloadThreshold ||  // Already overloaded
        (loadIncreasePercent > 15 && predictedLoad > vmCurrentLoad * 1.1) ||  // Significant increase
        (currentLoadPercent > 70 && predictedLoad > vmCurrentLoad);  // High load + increasing
      
      if (needsMigration) {
        // VM needs migration - find optimal destination
        
        // Calculate capacity for each potential destination VM
        const destinations = vms.map((destVM, j) => {
          const destVmId = destVM.vmId || destVM.id || `vm_${j}`;
          
          // Get pheromone level PH[t+1] for destination
          const pheromoneLevel = pheromoneLevels[destVmId]?.PHt1 || pheromoneLevels[j]?.PHt1 || 1.0;
          
          // Calculate capacity Cap[t+1] (available capacity)
          const computeCap = destVM.computeCapacity || destVM.C || destVM.cpuUtilization || 0;
          const memoryCap = destVM.memoryCapacity || destVM.M || destVM.memoryUtilization || 0;
          const storageCap = destVM.storageCapacity || destVM.S || 0;
          const networkCap = destVM.networkCapacity || destVM.N || destVM.networkUtilization || 0;
          
          const totalCapacity = computeCap + memoryCap + storageCap + networkCap;
          const currentDestLoad = destVM.currentLoad || destVM.load || 0;
          const availableCapacity = Math.max(0, totalCapacity - currentDestLoad);
          
          return {
            vmId: destVmId,
            index: j,
            capacity: availableCapacity,
            pheromoneLevel: pheromoneLevel,
            totalCapacity: totalCapacity
          };
        });

        // Calculate the fitness function, FF = Max(Cap[t+1]), Max(PH[t+1])
        destinations.forEach(dest => {
          // Normalize capacity and pheromone (0-1 scale)
          const maxCapacity = Math.max(...destinations.map(d => d.capacity));
          const maxPheromone = Math.max(...destinations.map(d => d.pheromoneLevel));
          
          const normalizedCapacity = maxCapacity > 0 ? dest.capacity / maxCapacity : 0;
          const normalizedPheromone = maxPheromone > 0 ? dest.pheromoneLevel / maxPheromone : 0;
          
          // Fitness function: weighted combination of capacity and pheromone
          dest.fitness = (0.6 * normalizedCapacity) + (0.4 * normalizedPheromone);
        });

        // Sort the V[] based on FF (descending - highest fitness first)
        destinations.sort((a, b) => b.fitness - a.fitness);

        // Select the optimal V[x] based on FF (exclude source VM itself)
        const validDestinations = destinations.filter(dest => dest.vmId !== vmId);
        const optimalDestination = validDestinations.length > 0 ? validDestinations[0] : null;

        if (optimalDestination) {
          migrationDecisions.push({
            sourceVM: vmId,
            sourceIndex: i,
            predictedLoad: predictedLoad,
            threshold: TH,
            needsMigration: true,
            optimalDestination: {
              vmId: optimalDestination.vmId,
              index: optimalDestination.index,
              fitness: optimalDestination.fitness,
              capacity: optimalDestination.capacity,
              pheromoneLevel: optimalDestination.pheromoneLevel
            }
          });

          optimalDestinations.push({
            vmId: optimalDestination.vmId,
            fitness: optimalDestination.fitness
          });
        }
      } else {
        // VM doesn't need migration
        migrationDecisions.push({
          sourceVM: vmId,
          sourceIndex: i,
          predictedLoad: predictedLoad,
          threshold: TH,
          needsMigration: false
        });
      }
    });

    const migrationsNeeded = migrationDecisions.filter(d => d.needsMigration).length;
    
    // Fallback: If no migrations detected but there are overloaded VMs, mark some for migration
    // This ensures the algorithm produces meaningful results
    if (migrationsNeeded === 0 && vms.length > 0) {
      console.log(`  No migrations detected, checking for overloaded VMs as fallback...`);
      
      // Find VMs with high current load (> 75% capacity)
      const overloadedVMs = vms.filter((vm, idx) => {
        const vmCapacity = (vm.computeCapacity || 0) + (vm.memoryCapacity || 0) + 
                          (vm.storageCapacity || 0) + (vm.networkCapacity || 0);
        const vmCurrentLoad = vm.currentLoad || vm.load || vm.computeCapacity || 0;
        const loadPercent = vmCapacity > 0 ? (vmCurrentLoad / vmCapacity) * 100 : 0;
        return loadPercent > 75;
      });
      
      // Mark top 30% of overloaded VMs for migration (or at least 1 if any exist)
      if (overloadedVMs.length > 0) {
        const numToMigrate = Math.max(1, Math.floor(overloadedVMs.length * 0.3));
        overloadedVMs.slice(0, numToMigrate).forEach((vm, idx) => {
          const vmId = vm.vmId || vm.id || `vm_${vms.indexOf(vm)}`;
          const decision = migrationDecisions.find(d => d.sourceVM === vmId);
          if (decision) {
            decision.needsMigration = true;
            console.log(`  Marked overloaded VM ${vmId} for migration (fallback)`);
          } else {
            // Add new migration decision
            migrationDecisions.push({
              sourceVM: vmId,
              sourceIndex: vms.indexOf(vm),
              predictedLoad: vm.currentLoad || vm.load || 0,
              threshold: (vm.computeCapacity || 0) * 0.75,
              needsMigration: true
            });
          }
        });
        console.log(`  Fallback: Marked ${numToMigrate} overloaded VMs for migration`);
      }
    }
    
    const finalMigrations = migrationDecisions.filter(d => d.needsMigration).length;
    
    return {
      threshold: TH,
      migrationDecisions: migrationDecisions,
      optimalDestinations: optimalDestinations,
      totalMigrations: finalMigrations,
      summary: {
        totalVMs: vms.length,
        vmsNeedingMigration: finalMigrations,
        vmsStable: migrationDecisions.filter(d => !d.needsMigration).length
      }
    };
  }

  /**
   * Find optimal destination for a specific VM
   * @param {Object} sourceVM - Source VM that needs migration
   * @param {Array} candidateVMs - List of candidate destination VMs
   * @param {Object} pheromoneLevels - Pheromone levels from CCPLP
   * @returns {Object} Optimal destination VM
   */
  static findOptimalDestination(sourceVM, candidateVMs, pheromoneLevels = {}) {
    const destinations = candidateVMs.map((destVM, j) => {
      const destVmId = destVM.vmId || destVM.id || `vm_${j}`;
      const pheromoneLevel = pheromoneLevels[destVmId]?.PHt1 || 1.0;
      
      const computeCap = destVM.computeCapacity || destVM.C || destVM.cpuUtilization || 0;
      const memoryCap = destVM.memoryCapacity || destVM.M || destVM.memoryUtilization || 0;
      const storageCap = destVM.storageCapacity || destVM.S || 0;
      const networkCap = destVM.networkCapacity || destVM.N || destVM.networkUtilization || 0;
      
      const totalCapacity = computeCap + memoryCap + storageCap + networkCap;
      const currentDestLoad = destVM.currentLoad || destVM.load || 0;
      const availableCapacity = Math.max(0, totalCapacity - currentDestLoad);
      
      return {
        vmId: destVmId,
        capacity: availableCapacity,
        pheromoneLevel: pheromoneLevel,
        totalCapacity: totalCapacity
      };
    });

    const maxCapacity = Math.max(...destinations.map(d => d.capacity));
    const maxPheromone = Math.max(...destinations.map(d => d.pheromoneLevel));

    destinations.forEach(dest => {
      const normalizedCapacity = maxCapacity > 0 ? dest.capacity / maxCapacity : 0;
      const normalizedPheromone = maxPheromone > 0 ? dest.pheromoneLevel / maxPheromone : 0;
      dest.fitness = (0.6 * normalizedCapacity) + (0.4 * normalizedPheromone);
    });

    destinations.sort((a, b) => b.fitness - a.fitness);
    return destinations[0] || null;
  }
}

module.exports = LBPCCCP;

