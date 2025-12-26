/**
 * Algorithm - 14: Predictive Local and Global Best Position Detection (PLGB-PD)
 * 
 * Input:
 * - SPC[]: Space-time coordinates obtained from the TDLI algorithm
 * - V[]: Velocity
 * - W[]: Inertia
 * 
 * Output:
 * - LBP[]: Local best positions
 * - GBP: Global best position
 */

class PLGBPD {
  /**
   * Execute PLGB-PD algorithm
   * @param {Array} spaceTimeCoordinates - Space-time coordinates from TDLI (SPC[])
   * @param {Array} velocities - Velocities (V[])
   * @param {Array} inertias - Inertia values (W[])
   * @returns {Object} Local and global best positions
   */
  static execute(spaceTimeCoordinates, velocities = [], inertias = []) {
    const LBP = []; // Local best positions
    let GBP = null; // Global best position
    const EC = []; // Error Correction factors
    const updatedVelocities = [];
    const updatedSPC = [];
    
    // For each element in V[] as V[i]
    velocities.forEach((velocity, i) => {
      // Initialize the Error Correction factor, EC[] = 0
      EC[i] = 0;
      
      // Calculate the Regression Coefficient RC <= Mean(V[0..i])
      const velocitiesUpToI = velocities.slice(0, i + 1);
      const meanVelocity = velocitiesUpToI.reduce((sum, v) => {
        const velValue = typeof v === 'number' ? v : (v.value || v.velocity || 0);
        return sum + velValue;
      }, 0) / velocitiesUpToI.length;
      const RC = meanVelocity || 0;
      
      // Get inertia for this velocity
      const W = inertias[i] || (typeof inertias[i] === 'number' ? inertias[i] : (inertias[i]?.inertia || 0.5));
      const currentVelocity = typeof velocity === 'number' ? velocity : (velocity.value || velocity.velocity || 0);
      
      // Calculate V[i+1] <= W[i] + RC * V[i] + EC[i]
      let V_next = W + (RC * currentVelocity) + EC[i];
      
      // Update EC[i] = Abs(V[i+1] - V[i])/Mean(EC[0..i-1])
      if (i > 0 && EC.slice(0, i).length > 0) {
        const meanEC = EC.slice(0, i).reduce((sum, ec) => sum + ec, 0) / i;
        EC[i] = meanEC > 0 ? Math.abs(V_next - currentVelocity) / meanEC : Math.abs(V_next - currentVelocity);
      } else {
        EC[i] = Math.abs(V_next - currentVelocity);
      }
      
      // Re-Calculate V[i+1] <= W[i] + RC * V[i] + EC[i]
      V_next = W + (RC * currentVelocity) + EC[i];
      updatedVelocities.push(V_next);
    });
    
    // For each element in SPC[] as SPC[i]
    const spcArray = Array.isArray(spaceTimeCoordinates) 
      ? spaceTimeCoordinates 
      : Object.values(spaceTimeCoordinates);
    
    spcArray.forEach((spc, i) => {
      const spcValue = spc.SPC || spc.powerSPC || spc.value || 0;
      const velocity = updatedVelocities[i] || updatedVelocities[updatedVelocities.length - 1] || 0;
      
      // Calculate the SPC[i+1] <= V[i+1] + SPC[i]
      const SPC_next = velocity + spcValue;
      updatedSPC.push({
        ...spc,
        SPC_next: SPC_next,
        velocity: velocity
      });
      
      // If SPC[i+1] > All{SPC[]}
      const allSPCValues = spcArray.map(s => s.SPC || s.powerSPC || s.value || 0);
      const maxSPC = Math.max(...allSPCValues);
      
      if (SPC_next > maxSPC) {
        // Then, GBP <= SPC[i]
        GBP = {
          ...spc,
          SPC: spcValue,
          SPC_next: SPC_next,
          index: i,
          isGlobalBest: true
        };
      }
      
      // If SPC[i+1] > Any{SPC[]}
      const anyGreater = allSPCValues.some(val => SPC_next > val);
      
      if (anyGreater) {
        // Then, LBP[K] <= SPC[i]
        LBP.push({
          ...spc,
          SPC: spcValue,
          SPC_next: SPC_next,
          index: i,
          isLocalBest: true
        });
      }
      // Else, Continue (implicit)
    });
    
    // If no global best found, use the maximum SPC
    if (!GBP && updatedSPC.length > 0) {
      const maxIndex = updatedSPC.reduce((maxIdx, spc, idx, arr) => 
        (spc.SPC_next || 0) > (arr[maxIdx].SPC_next || 0) ? idx : maxIdx, 0
      );
      GBP = updatedSPC[maxIndex];
    }
    
    return {
      LBP: LBP, // Local best positions
      GBP: GBP, // Global best position
      updatedVelocities: updatedVelocities,
      updatedSPC: updatedSPC,
      errorCorrections: EC
    };
  }

  /**
   * Execute PLGB-PD for a single iteration
   * @param {Array} spaceTimeCoordinates - Current SPC values
   * @param {Array} velocities - Current velocities
   * @param {Array} inertias - Inertia values
   * @returns {Object} Updated positions
   */
  static executeIteration(spaceTimeCoordinates, velocities, inertias) {
    return this.execute(spaceTimeCoordinates, velocities, inertias);
  }
}

module.exports = PLGBPD;

