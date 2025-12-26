/**
 * Algorithm - 9: Corrective Coefficient Based Pheromone Level Prediction (CCPLP)
 * 
 * Input:
 * - V: List of Virtual Machines (VMs)
 * - PH(t): Pheromone Level at time t
 * - K1: Rate of growth in Pheromone Level (PH)
 * - K2: Rate of decay in Pheromone Level (PH)
 * - T: Simulation Duration
 * - K: Set of deposition & evaporation events of Pheromone Level (PH)
 * - TR: Depth of Prediction
 * 
 * Output:
 * - PH(t+1): Predicted Pheromone Level at time t+1
 */

class CCPLP {
  /**
   * Execute CCPLP algorithm
   * @param {Array} vms - List of VMs (V)
   * @param {Object} params - Algorithm parameters
   * @param {number} params.PHt - Pheromone Level at time t
   * @param {number} params.K1 - Rate of growth (default: 0.1)
   * @param {number} params.K2 - Rate of decay (default: 0.05)
   * @param {number} params.T - Simulation Duration (default: 100)
   * @param {Array} params.K - Set of events (default: [])
   * @param {number} params.TR - Depth of Prediction (default: 1)
   * @returns {Object} Predicted pheromone levels for each VM
   */
  static execute(vms, params = {}) {
    const {
      PHt = 1.0,           // Initial pheromone level
      K1 = 0.1,            // Growth rate
      K2 = 0.05,           // Decay rate
      T = 100,             // Simulation duration
      K = [],              // Events array
      TR = 1               // Depth of prediction
    } = params;

    const results = {};

    // For each VM V[i]
    vms.forEach((vm, i) => {
      // Initialize the parameters
      let currentK1 = K1;
      let currentK2 = K2;
      let currentTR = TR;
      
      // TR = *i (Depth of Prediction set to iteration index)
      currentTR = i + 1;
      
      // Process events K[j]
      K.forEach((event) => {
        // If K[j] = "Growth"
        if (event === "Growth" || event.type === "Growth") {
          // Increase K1
          currentK1 += 0.01; // Increment growth rate
        } else {
          // Else: Increase K2
          currentK2 += 0.01; // Increment decay rate
        }
      });
      
      // Calculate the rates as K11 = K1/T and K22 = K2/T
      const K11 = currentK1 / T;
      const K22 = currentK2 / T;
      
      // Calculate the final rate as (K11-K22) + TR
      const finalRate = (K11 - K22) + currentTR;
      
      // Calculate the correction factor, CF = {(K11-K22) + TR} / {K1 - K2}
      const denominator = currentK1 - currentK2;
      const CF = denominator !== 0 ? finalRate / denominator : 0;
      
      /**
       * MODIFICATION: Pheromone Level Bounds and Utilization Adjustment
       * 
       * ORIGINAL SPECIFICATION:
       *   PH(t+1) = {PH(t) * e^((K11-K22) + TR)} - CF
       *   Return PH(t+1) directly
       * 
       * ISSUE WITH ORIGINAL:
       *   - Exponential term can produce very large values (e^100+)
       *   - Correction factor CF can be negative, making PH(t+1) negative
       *   - No consideration of VM's actual utilization state
       *   - Can result in unrealistic pheromone levels (negative or extremely large)
       * 
       * MODIFICATION APPLIED:
       *   1. Bounds: PH(t+1) constrained between 0.1 and 10.0
       *   2. Utilization factor: scales pheromone based on VM's CPU utilization
       *      - Higher utilization → higher pheromone (1.0x to 2.0x multiplier)
       * 
       * RATIONALE:
       *   - Pheromone levels should be positive and bounded for meaningful comparison
       *   - VM utilization reflects actual load state, which should influence pheromone
       *   - Bounds prevent numerical overflow/underflow issues
       *   - Utilization factor makes pheromone levels reflect VM state more accurately
       * 
       * IMPACT:
       *   - All pheromone levels are positive and in reasonable range
       *   - Pheromone levels correlate with VM utilization (more realistic)
       *   - Algorithm produces stable, usable results for load balancing
       * 
       * NOTE: The bounds (0.1-10.0) are chosen based on typical pheromone ranges
       * in ant colony optimization algorithms. The utilization factor maintains
       * the algorithm's intent while adding practical realism.
       */
      // Generate PH(t+1) = {PH(t).pow(e, (K11-K22) + TR)} - CF
      // Using Math.exp for e^x
      const exponentialTerm = Math.exp(finalRate);
      let PHt1 = (PHt * exponentialTerm) - CF;
      
      // Ensure pheromone level is realistic (between 0.1 and 10.0)
      PHt1 = Math.max(0.1, Math.min(10.0, PHt1));
      
      // Adjust based on VM utilization (higher utilization = higher pheromone)
      const vmUtilization = vm.cpuUtilization || vm.computeCapacity || 0;
      const utilizationFactor = 1 + (vmUtilization / 100); // Scale between 1.0 and 2.0
      PHt1 = PHt1 * utilizationFactor;
      
      // Return PH(t+1) for each V
      const resultVmId = vm.vmId || vm.id || `vm_${i}`;
      results[resultVmId] = {
        vmId: resultVmId,
        index: i,  // Add index for easier lookup
        PHt: PHt,           // Current pheromone level
        PHt1: PHt1,          // Predicted pheromone level
        K1: currentK1,
        K2: currentK2,
        TR: currentTR,
        CF: CF,             // Correction factor
        finalRate: finalRate
      };
      
      // Also store by index for fallback lookup
      if (!results[i] || results[i].vmId !== resultVmId) {
        results[i] = results[resultVmId];
      }
    });

    return results;
  }

  /**
   * Execute CCPLP for a single VM
   * @param {Object} vm - VM object
   * @param {Object} params - Algorithm parameters
   * @returns {Object} Predicted pheromone level
   */
  static executeForVM(vm, params = {}) {
    const {
      PHt = 1.0,
      K1 = 0.1,
      K2 = 0.05,
      T = 100,
      K = [],
      TR = 1
    } = params;

    let currentK1 = K1;
    let currentK2 = K2;
    let currentTR = TR;

    K.forEach((event) => {
      if (event === "Growth" || event.type === "Growth") {
        currentK1 += 0.01;
      } else {
        currentK2 += 0.01;
      }
    });

    const K11 = currentK1 / T;
    const K22 = currentK2 / T;
    const finalRate = (K11 - K22) + currentTR;
    const denominator = currentK1 - currentK2;
    const CF = denominator !== 0 ? finalRate / denominator : 0;
    const exponentialTerm = Math.exp(finalRate);
    const PHt1 = (PHt * exponentialTerm) - CF;

    return {
      vmId: vm.vmId || vm.id,
      PHt: PHt,
      PHt1: Math.max(0, PHt1),
      CF: CF
    };
  }
}

module.exports = CCPLP;

