/**
 * Threshold Detection Algorithms
 */

class ThresholdDetection {
  /**
   * Algorithm 1: Inter Quartile Range (IQR)
   */
  static IQR(cpuUtilizations) {
    const sorted = [...cpuUtilizations].sort((a, b) => a - b);
    const n = sorted.length;
    
    if (n === 0) return 100;
    
    const q1Index = Math.floor(n * 0.25);
    const q3Index = Math.floor(n * 0.75);
    
    const q1 = sorted[q1Index] || sorted[0];
    const q3 = sorted[q3Index] || sorted[n - 1];
    
    const iqr = q3 - q1;
    const safetyRange = 0.05; // 5%
    const threshold = 100 - (safetyRange * iqr);
    
    return Math.max(0, Math.min(100, threshold));
  }

  /**
   * Algorithm 2: Local Regression (LR)
   */
  static LR(cpuUtilizations, loadPatterns = null) {
    const sorted = [...cpuUtilizations].sort((a, b) => b - a);
    const n = sorted.length;
    
    if (n === 0) return 100;
    
    // Initialize load pattern if not provided
    if (!loadPatterns) {
      loadPatterns = sorted.map((val, idx) => idx > 0 ? val - sorted[idx - 1] : 0);
    }
    
    // Calculate CPU utilization weight function
    let cw = 0;
    sorted.forEach((cpu, idx) => {
      if (cpu < 1) cpu = 1; // Avoid division by zero
      cw = (cw + (1 / (1 - cpu / 100))) / 2;
    });
    
    // Calculate load pattern weight function
    let lw = 0;
    sorted.forEach((cpu, idx) => {
      if (cpu < 1) cpu = 1;
      lw = (lw + (1 / (1 - cpu / 100))) / 2;
    });
    
    const safetyRange = 0.1; // Default safety range
    const threshold = (sorted[0] * cw + (loadPatterns[0] || 0) * lw) * safetyRange;
    
    return Math.max(0, Math.min(100, threshold));
  }

  /**
   * Algorithm 3: Median Absolute Deviation (MAD)
   */
  static MAD(cpuUtilizations) {
    const sorted = [...cpuUtilizations].sort((a, b) => b - a);
    const n = sorted.length;
    
    if (n === 0) return 100;
    
    // Calculate median
    const median = n % 2 === 0
      ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2
      : sorted[Math.floor(n / 2)];
    
    // Calculate deviations
    const deviations = sorted.map(cpu => Math.abs(median - cpu));
    const sortedDeviations = [...deviations].sort((a, b) => a - b);
    
    // Calculate median of deviations
    const dm = sortedDeviations.length % 2 === 0
      ? (sortedDeviations[sortedDeviations.length / 2 - 1] + sortedDeviations[sortedDeviations.length / 2]) / 2
      : sortedDeviations[Math.floor(sortedDeviations.length / 2)];
    
    const safetyRange = 0.1;
    const threshold = 100 - (dm * safetyRange);
    
    return Math.max(0, Math.min(100, threshold));
  }

  /**
   * Algorithm 4: Robust Local Regression (LRR)
   */
  static LRR(cpuUtilizations, loadPatterns = null) {
    const sorted = [...cpuUtilizations].sort((a, b) => b - a);
    const n = sorted.length;
    
    if (n === 0) return 100;
    
    // Initialize load pattern if not provided
    if (!loadPatterns) {
      loadPatterns = sorted.map((val, idx) => idx > 0 ? val - sorted[idx - 1] : 0);
    }
    
    // Calculate CPU utilization weight function
    let cw = 0;
    sorted.forEach((cpu) => {
      const normalizedCpu = Math.min(99, Math.max(1, cpu));
      cw = (cw + 1 / (100 - normalizedCpu)) / 2;
    });
    
    // Calculate load pattern weight function
    let lw = 0;
    sorted.forEach((cpu) => {
      const normalizedCpu = Math.min(99, Math.max(1, cpu));
      lw = (lw + 1 / (100 - normalizedCpu)) / 2;
    });
    
    // Combined weight function
    const clw = cw * lw;
    
    const safetyRange = 0.1;
    const threshold = (sorted[0] * cw + (loadPatterns[0] || 0) * lw + clw) * safetyRange;
    
    return Math.max(0, Math.min(100, threshold));
  }

  /**
   * Static Threshold
   */
  static StaticThreshold() {
    return 80; // Standard static threshold
  }
}

module.exports = ThresholdDetection;

