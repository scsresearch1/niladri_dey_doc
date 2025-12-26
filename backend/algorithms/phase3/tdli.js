/**
 * Algorithm - 13: Time-Dependent Location Identification (TDLI)
 * 
 * Input:
 * - S[]: Set of Swarms
 * - L[]: Coordinate of the swarms (x,y)
 * - T[]: Time Instances connected to (x,y)
 * 
 * Output:
 * - SPC: Space-time coordinate
 */

class TDLI {
  /**
   * Execute TDLI algorithm
   * @param {Array} swarms - Set of swarms (S[])
   * @param {Array} coordinates - Coordinates of swarms (L[]) with (x,y)
   * @param {Array} timeInstances - Time instances (T[])
   * @returns {Object} Space-time coordinates for each swarm
   */
  static execute(swarms, coordinates = [], timeInstances = []) {
    const results = {};
    
    // For each element in S[] as S[i]
    swarms.forEach((swarm, i) => {
      const swarmId = swarm.id || swarm.swarmId || `swarm_${i}`;
      
      // Identify the coordinates for each S[i] as L[j] with (x,y) at T[i]
      const swarmCoord = coordinates.find(coord => 
        coord.swarmId === swarmId || coord.id === swarm.id
      ) || coordinates[i] || { x: 0, y: 0 };
      
      const timeInstance = timeInstances.find(time => 
        time.swarmId === swarmId || time.id === swarm.id
      ) || timeInstances[i] || { time: 0 };
      
      const x = swarmCoord.x || swarmCoord.coordinateX || 0;
      const y = swarmCoord.y || swarmCoord.coordinateY || 0;
      const t = timeInstance.time || timeInstance.timestamp || i;
      
      // Calculate the SPC <= power(x,y,T[i])
      // Using Euclidean distance in 2D space with time component
      // SPC = sqrt(x^2 + y^2) * time_factor
      const spatialDistance = Math.sqrt(x * x + y * y);
      const timeFactor = 1 + (t / 1000); // Normalize time
      const SPC = Math.pow(spatialDistance, timeFactor);
      
      // Alternative: SPC = (x^2 + y^2)^(1/time_factor) for time-dependent scaling
      // Using the power function as specified: power(x, y, T[i])
      // This can be interpreted as x^(y*time_factor) or similar
      const powerSPC = Math.pow(x, y * timeFactor) || Math.pow(Math.abs(x) + 1, Math.abs(y) + 1) * timeFactor;
      
      // Return SPC
      results[swarmId] = {
        swarmId: swarmId,
        coordinate: { x: x, y: y },
        time: t,
        SPC: SPC,
        powerSPC: powerSPC,
        spatialDistance: spatialDistance
      };
    });
    
    return results;
  }

  /**
   * Execute TDLI for a single swarm
   * @param {Object} swarm - Swarm object
   * @param {Object} coordinate - Coordinate object with (x,y)
   * @param {Object} timeInstance - Time instance
   * @returns {Object} Space-time coordinate
   */
  static executeForSwarm(swarm, coordinate = { x: 0, y: 0 }, timeInstance = { time: 0 }) {
    const x = coordinate.x || 0;
    const y = coordinate.y || 0;
    const t = timeInstance.time || timeInstance.timestamp || 0;
    
    const spatialDistance = Math.sqrt(x * x + y * y);
    const timeFactor = 1 + (t / 1000);
    const SPC = Math.pow(spatialDistance, timeFactor);
    const powerSPC = Math.pow(x, y * timeFactor) || Math.pow(Math.abs(x) + 1, Math.abs(y) + 1) * timeFactor;
    
    return {
      swarmId: swarm.id || swarm.swarmId,
      coordinate: { x, y },
      time: t,
      SPC: SPC,
      powerSPC: powerSPC,
      spatialDistance: spatialDistance
    };
  }
}

module.exports = TDLI;

