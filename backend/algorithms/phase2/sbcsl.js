/**
 * Algorithm - 8: Service Based Categorization and Summarization of Loads (SBCSL)
 * 
 * Input:
 * - SR: List of Services
 * - V: List of VMs (Virtual Machines)
 * - C: Compute Capacity
 * - M: Memory Capacity
 * - S: Storage Capacity
 * - N: Network Capacity
 * 
 * Output:
 * - Service Specific Summarized Load (CS, MS, SS, NS)
 */

class SBCSL {
  /**
   * Execute SBCSL algorithm
   * @param {Array} services - List of services (SR)
   * @param {Array} vms - List of VMs (V)
   * @returns {Object} Service specific summarized loads
   */
  static execute(services, vms) {
    const results = {};
    
    // For each service SR[i]
    services.forEach((service, i) => {
      let CS = 0; // Compute Load Total
      let MS = 0; // Memory Load Total
      let SS = 0; // Storage Load Total
      let NS = 0; // Network Load Total
      
      // For each VM V[j]
      vms.forEach((vm) => {
        // Check if VM belongs to this service
        if (vm.serviceId === service.id || vm.serviceId === service.serviceId) {
          // Calculate the Compute Load in Total
          CS += vm.computeCapacity || vm.C || 0;
          
          // Calculate the Memory Load in Total
          MS += vm.memoryCapacity || vm.M || 0;
          
          // Calculate the Storage Load in Total
          SS += vm.storageCapacity || vm.S || 0;
          
          // Calculate the Network Load in Total
          NS += vm.networkCapacity || vm.N || 0;
        }
      });
      
      // Produce CS, MS, SS, NS for this service
      results[service.id || service.serviceId || `service_${i}`] = {
        serviceId: service.id || service.serviceId || `service_${i}`,
        serviceName: service.name || service.serviceName || `Service ${i + 1}`,
        CS: CS, // Total Compute Load
        MS: MS, // Total Memory Load
        SS: SS, // Total Storage Load
        NS: NS  // Total Network Load
      };
    });
    
    return results;
  }

  /**
   * Execute SBCSL for a single service
   * @param {Object} service - Service object
   * @param {Array} vms - List of VMs belonging to the service
   * @returns {Object} Summarized loads for the service
   */
  static executeForService(service, vms) {
    let CS = 0;
    let MS = 0;
    let SS = 0;
    let NS = 0;
    
    vms.forEach((vm) => {
      CS += vm.computeCapacity || vm.C || vm.cpuUtilization || 0;
      MS += vm.memoryCapacity || vm.M || vm.memoryUtilization || 0;
      SS += vm.storageCapacity || vm.S || 0;
      NS += vm.networkCapacity || vm.N || vm.networkUtilization || 0;
    });
    
    return {
      serviceId: service.id || service.serviceId,
      CS: CS,
      MS: MS,
      SS: SS,
      NS: NS
    };
  }
}

module.exports = SBCSL;

