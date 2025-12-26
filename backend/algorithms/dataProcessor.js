const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');
const { promisify } = require('util');
const readFile = promisify(fs.readFile);

/**
 * Parse PlanetLab dataset files
 * Expected format: Each file contains CPU utilization data
 */
class DataProcessor {
  constructor() {
    this.datasetPath = path.join(__dirname, '..', 'dataset', 'planetlab');
    this.cache = new Map(); // Cache loaded datasets
    // NO LIMITATIONS - Process all files and all data points
  }

  /**
   * Load dataset for a specific date (with caching and parallel I/O optimization)
   */
  async loadDataset(date) {
    // Check cache first
    if (this.cache.has(date)) {
      return this.cache.get(date);
    }

    const datePath = path.join(this.datasetPath, date);
    if (!fs.existsSync(datePath)) {
      throw new Error(`Dataset date ${date} not found`);
    }

    const files = fs.readdirSync(datePath);
    const vmData = [];
    
    // Process ALL files in PARALLEL - NO LIMITATIONS
    console.log(`Loading dataset ${date}: Processing ${files.length} files in parallel...`);

    // Process files in parallel batches for better I/O performance
    const processFile = async (file, fileIndex) => {
      const filePath = path.join(datePath, file);
      try {
        const content = await readFile(filePath, 'utf8');
        const lines = content.split('\n').filter(line => line.trim());
        const fileData = [];
        
        // Process ALL data points - NO SAMPLING
        // PlanetLab format: Each line is a CPU utilization value (0-100)
        lines.forEach((line, index) => {
          const cpuUtil = parseFloat(line.trim());
          if (!isNaN(cpuUtil) && cpuUtil >= 0 && cpuUtil <= 100) {
            fileData.push({
              vmId: file,
              timestamp: index * 300, // Assume 5-minute intervals (300 seconds)
              cpuUtilization: cpuUtil,
              memoryUtilization: cpuUtil * 0.8, // Estimate memory based on CPU
              networkUtilization: cpuUtil * 0.3 // Estimate network based on CPU
            });
          }
        });
        
        return { fileIndex, fileData, success: true };
      } catch (error) {
        console.warn(`Error reading file ${file}:`, error.message);
        return { fileIndex, fileData: [], success: false };
      }
    };

    // Process files in parallel batches (100 files at a time)
    const batchSize = 100;
    for (let i = 0; i < files.length; i += batchSize) {
      const batch = files.slice(i, i + batchSize);
      const batchPromises = batch.map((file, idx) => processFile(file, i + idx));
      const batchResults = await Promise.all(batchPromises);
      
      batchResults.forEach(({ fileData }) => {
        vmData.push(...fileData);
      });
      
      if (i + batchSize < files.length) {
        console.log(`  Processed ${Math.min(i + batchSize, files.length)}/${files.length} files...`);
      }
    }
    
    console.log(`Dataset ${date} loaded: ${vmData.length} data points from ${files.length} files`);

    // Cache the result
    this.cache.set(date, vmData);
    return vmData;
  }

  /**
   * Synchronous version for backward compatibility (uses async internally)
   */
  loadDatasetSync(date) {
    // For backward compatibility, but this should be avoided
    // Use loadDataset() with await instead
    if (this.cache.has(date)) {
      return this.cache.get(date);
    }
    throw new Error('Use async loadDataset() instead of loadDatasetSync()');
  }

  /**
   * Get all active nodes (hosts) from dataset
   * In PlanetLab, each file represents a VM, and we group VMs into hosts
   */
  getActiveNodes(vmData) {
    const nodes = new Map();
    
    // Group VMs by extracting host identifier from filename
    // PlanetLab filenames often contain host information
    vmData.forEach(vm => {
      // Extract host/node identifier from filename
      // Format varies, but typically contains host name before first underscore or special char
      const parts = vm.vmId.split(/[_-]/);
      const nodeId = parts.length > 1 ? parts.slice(0, -1).join('_') : parts[0];
      
      if (!nodes.has(nodeId)) {
        nodes.set(nodeId, []);
      }
      nodes.get(nodeId).push(vm);
    });

    // If we have too many nodes (one per VM), group them into logical hosts
    // Typical PlanetLab setup: 10-20 VMs per host
    const nodeArray = Array.from(nodes.entries());
    
    // If we have many single-VM nodes, group them into hosts
    if (nodeArray.length > 100) {
      const groupedNodes = new Map();
      const vmsPerHost = 10; // Group 10 VMs per host
      let hostIndex = 0;
      
      nodeArray.forEach(([nodeId, vms]) => {
        const hostId = `host_${Math.floor(hostIndex / vmsPerHost)}`;
        if (!groupedNodes.has(hostId)) {
          groupedNodes.set(hostId, []);
        }
        groupedNodes.get(hostId).push(...vms);
        hostIndex += vms.length;
      });
      
      return Array.from(groupedNodes.entries()).map(([nodeId, vms]) => ({
        nodeId,
        vms: vms.sort((a, b) => a.timestamp - b.timestamp)
      }));
    }

    return nodeArray.map(([nodeId, vms]) => ({
      nodeId,
      vms: vms.sort((a, b) => a.timestamp - b.timestamp)
    }));
  }

  /**
   * Get CPU utilization array for a node
   */
  getCPUUtilization(node) {
    return node.vms.map(vm => vm.cpuUtilization);
  }
}

module.exports = DataProcessor;

