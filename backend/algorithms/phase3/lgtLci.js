/**
 * Algorithm - 12: Local and Global Threshold Based Load Condition Identification (LGT-LCI)
 * 
 * Input:
 * - T[]: Tasks
 * - VM[]: Virtual Machines allocated to the Tasks
 * - I[]: Infrastructure allocated to the VMs
 * - L[]: Physical location allocated to Infrastructures
 * 
 * Output:
 * - VMx[]: Loaded VMs
 */

class LGTLCI {
  /**
   * Execute LGT-LCI algorithm
   * @param {Array} tasks - List of tasks (T[])
   * @param {Array} vms - List of VMs (VM[])
   * @param {Array} infrastructures - List of infrastructures (I[])
   * @param {Array} locations - List of physical locations (L[])
   * @returns {Object} Loaded VMs and thresholds
   */
  static execute(tasks, vms, infrastructures = [], locations = []) {
    const loadedVMs = [];
    let localThreshold = 0;
    let globalThreshold = 0;
    const vmInfrastructureMap = new Map(); // Map VMs to their infrastructures
    
    // For each task T[k]
    tasks.forEach((task, k) => {
      // Calculate the capacity demand as Dem(T[k]) <= <Compute Capacity, Memory Capacity, Storage Capacity, Network Bandwidth>
      const taskDemand = {
        computeCapacity: task.computeDemand || task.computeCapacity || 0,
        memoryCapacity: task.memoryDemand || task.memoryCapacity || 0,
        storageCapacity: task.storageDemand || task.storageCapacity || 0,
        networkBandwidth: task.networkDemand || task.networkBandwidth || 0
      };
      
      const totalTaskDemand = taskDemand.computeCapacity + taskDemand.memoryCapacity + 
                              taskDemand.storageCapacity + taskDemand.networkBandwidth;
      
      // Identify the set of VMs allocated to T[k]
      const allocatedVMs = vms.filter(vm => {
        return vm.taskId === task.id || 
               vm.assignedTask === task.id ||
               (vm.tasks && vm.tasks.includes(task.id));
      });
      
      // If VM[k]:T[k], Then VMI[i] = VM[k]
      const vmInfrastructure = [];
      allocatedVMs.forEach(vm => {
        vmInfrastructure.push(vm);
        
        // Map VM to infrastructure if not already mapped
        if (!vmInfrastructureMap.has(vm.vmId || vm.id)) {
          // Find infrastructure for this VM
          const vmInfra = infrastructures.find(infra => 
            infra.vmId === vm.vmId || infra.vmIds?.includes(vm.vmId)
          ) || infrastructures[0]; // Default to first infrastructure
          
          vmInfrastructureMap.set(vm.vmId || vm.id, vmInfra);
        }
      });
      
      // For each element in VMI[] as VMI[i]
      vmInfrastructure.forEach((vmi, i) => {
        // Identify the I[] capacity allocated to VMI[i] as Cap(I[j])
        const infrastructure = vmInfrastructureMap.get(vmi.vmId || vmi.id);
        
        if (infrastructure) {
          const infraCapacity = {
            computeCapacity: infrastructure.computeCapacity || 0,
            memoryCapacity: infrastructure.memoryCapacity || 0,
            storageCapacity: infrastructure.storageCapacity || 0,
            networkBandwidth: infrastructure.networkBandwidth || 0
          };
          
          const totalInfraCapacity = infraCapacity.computeCapacity + infraCapacity.memoryCapacity +
                                    infraCapacity.storageCapacity + infraCapacity.networkBandwidth;
          
          // For all I[0..j], Local Threshold <= Local Threshold + Cap(I[j])
          localThreshold += totalInfraCapacity;
          
          // If Dem(T[k]) > Local Threshold
          if (totalTaskDemand > localThreshold) {
            // Identify the capacity of L[] allocated to I[j] as Cap(L[p])
            const location = locations.find(loc => 
              loc.infrastructureId === infrastructure.id
            ) || locations[0];
            
            if (location) {
              const locationCapacity = {
                computeCapacity: location.computeCapacity || 0,
                memoryCapacity: location.memoryCapacity || 0,
                storageCapacity: location.storageCapacity || 0,
                networkBandwidth: location.networkBandwidth || 0
              };
              
              const totalLocationCapacity = locationCapacity.computeCapacity + 
                                           locationCapacity.memoryCapacity +
                                           locationCapacity.storageCapacity + 
                                           locationCapacity.networkBandwidth;
              
              // For all L[0..p], Global Threshold <= Global Threshold + L[p]
              globalThreshold += totalLocationCapacity;
              
              // If Dem(T[k]) > Global Threshold
              if (totalTaskDemand > globalThreshold) {
                // Then, mark VMI[i] as loaded VM and VMx[n++] <= VMI[i]
                if (!loadedVMs.find(vm => (vm.vmId || vm.id) === (vmi.vmId || vmi.id))) {
                  loadedVMs.push({
                    ...vmi,
                    taskId: task.id,
                    taskDemand: totalTaskDemand,
                    localThreshold: localThreshold,
                    globalThreshold: globalThreshold,
                    infrastructureId: infrastructure.id,
                    locationId: location.id
                  });
                }
              } else {
                // Else, the Mark system is partially stable and pass (Local Threshold, Global Threshold) to the SSOF algorithm
                // This will be handled by the orchestrator
              }
            }
          }
        }
      });
    });
    
    return {
      loadedVMs: loadedVMs,
      localThreshold: localThreshold,
      globalThreshold: globalThreshold,
      totalLoadedVMs: loadedVMs.length,
      systemStability: loadedVMs.length === 0 ? 'Stable' : 'Partially Stable'
    };
  }

  /**
   * Execute LGT-LCI for a single task
   * @param {Object} task - Task object
   * @param {Array} vms - List of VMs
   * @param {Array} infrastructures - List of infrastructures
   * @param {Array} locations - List of locations
   * @returns {Object} Result for this task
   */
  static executeForTask(task, vms, infrastructures = [], locations = []) {
    const taskDemand = {
      computeCapacity: task.computeDemand || task.computeCapacity || 0,
      memoryCapacity: task.memoryDemand || task.memoryCapacity || 0,
      storageCapacity: task.storageDemand || task.storageCapacity || 0,
      networkBandwidth: task.networkDemand || task.networkBandwidth || 0
    };
    
    const totalTaskDemand = taskDemand.computeCapacity + taskDemand.memoryCapacity + 
                            taskDemand.storageCapacity + taskDemand.networkBandwidth;
    
    const allocatedVMs = vms.filter(vm => 
      vm.taskId === task.id || vm.assignedTask === task.id
    );
    
    let localThreshold = 0;
    let globalThreshold = 0;
    const loadedVMs = [];
    
    allocatedVMs.forEach(vm => {
      const infrastructure = infrastructures.find(infra => 
        infra.vmId === vm.vmId || infra.vmIds?.includes(vm.vmId)
      ) || infrastructures[0];
      
      if (infrastructure) {
        const infraCapacity = (infrastructure.computeCapacity || 0) +
                             (infrastructure.memoryCapacity || 0) +
                             (infrastructure.storageCapacity || 0) +
                             (infrastructure.networkBandwidth || 0);
        
        localThreshold += infraCapacity;
        
        if (totalTaskDemand > localThreshold) {
          const location = locations.find(loc => 
            loc.infrastructureId === infrastructure.id
          ) || locations[0];
          
          if (location) {
            const locationCapacity = (location.computeCapacity || 0) +
                                    (location.memoryCapacity || 0) +
                                    (location.storageCapacity || 0) +
                                    (location.networkBandwidth || 0);
            
            globalThreshold += locationCapacity;
            
            if (totalTaskDemand > globalThreshold) {
              loadedVMs.push(vm);
            }
          }
        }
      }
    });
    
    return {
      taskId: task.id,
      taskDemand: totalTaskDemand,
      localThreshold: localThreshold,
      globalThreshold: globalThreshold,
      loadedVMs: loadedVMs,
      isLoaded: loadedVMs.length > 0
    };
  }
}

module.exports = LGTLCI;

