/**
 * Pre-calculate all algorithm results for all 4 phases
 * This script runs once to generate JSON files with pre-calculated results
 * 
 * Usage: node backend/scripts/precalculateResults.js
 */

const fs = require('fs');
const path = require('path');

// Import orchestrators
const LoadBalancer = require('../algorithms/phase1/loadBalancer');
const Phase2Orchestrator = require('../algorithms/phase2/phase2Orchestrator');
const Phase3Orchestrator = require('../algorithms/phase3/phase3Orchestrator');
const Phase4Orchestrator = require('../algorithms/phase4/phase4Orchestrator');

// Ensure results directory exists
const resultsDir = path.join(__dirname, '..', 'results');
if (!fs.existsSync(resultsDir)) {
  fs.mkdirSync(resultsDir, { recursive: true });
}

// All available dates
const allDates = [
  '20110303', '20110306', '20110309', '20110322', '20110325',
  '20110403', '20110409', '20110411', '20110412', '20110420'
];

async function precalculatePhase1() {
  console.log('\n=== Pre-calculating Phase 1 Results ===');
  console.log(`Processing ${allDates.length} dates...`);
  
  try {
    const loadBalancer = new LoadBalancer();
    const results = await loadBalancer.runAllAlgorithms(allDates);
    
    // Format results for frontend (same format as endpoint)
    const formattedResults = {
      energyConsumption: {},
      vmMigrations: {},
      slaViolations: {},
      nodeShutdowns: {},
      meanTimeBeforeShutdown: {},
      meanTimeBeforeMigration: {}
    };
    
    // Organize results by metric
    Object.keys(results).forEach(algoName => {
      formattedResults.energyConsumption[algoName] = {};
      formattedResults.vmMigrations[algoName] = {};
      formattedResults.slaViolations[algoName] = {};
      formattedResults.nodeShutdowns[algoName] = {};
      formattedResults.meanTimeBeforeShutdown[algoName] = {};
      formattedResults.meanTimeBeforeMigration[algoName] = {};
      
      Object.keys(results[algoName]).forEach(date => {
        const result = results[algoName][date];
        formattedResults.energyConsumption[algoName][date] = result.energyConsumption;
        formattedResults.vmMigrations[algoName][date] = result.vmMigrations;
        formattedResults.slaViolations[algoName][date] = result.slaViolations;
        formattedResults.nodeShutdowns[algoName][date] = result.nodeShutdowns;
        formattedResults.meanTimeBeforeShutdown[algoName][date] = result.meanTimeBeforeShutdown;
        formattedResults.meanTimeBeforeMigration[algoName][date] = result.meanTimeBeforeMigration;
      });
    });
    
    const output = {
      success: true,
      results: formattedResults,
      algorithms: Object.keys(results),
      dates: allDates,
      generatedAt: new Date().toISOString()
    };
    
    const filePath = path.join(resultsDir, 'phase1-results.json');
    fs.writeFileSync(filePath, JSON.stringify(output, null, 2));
    console.log(`✅ Phase 1 results saved to: ${filePath}`);
    console.log(`   Algorithms: ${Object.keys(results).length}`);
    console.log(`   Dates: ${allDates.length}`);
    
    return output;
  } catch (error) {
    console.error('❌ Error pre-calculating Phase 1:', error);
    throw error;
  }
}

async function precalculatePhase2() {
  console.log('\n=== Pre-calculating Phase 2 Results ===');
  console.log(`Processing ${allDates.length} dates...`);
  
  try {
    const orchestrator = new Phase2Orchestrator();
    const results = await orchestrator.runAllPhase2Algorithms(allDates, {});
    
    // Format results (same format as endpoint)
    const formattedResults = {
      averagePredictedLoad: {},
      averagePheromoneLevel: {},
      averageLoadVariance: {},
      averageMigrationCount: {},
      averageConsolidationEfficiency: {}
    };
    
    Object.keys(results).forEach(algoName => {
      formattedResults.averagePredictedLoad[algoName] = {};
      formattedResults.averagePheromoneLevel[algoName] = {};
      formattedResults.averageLoadVariance[algoName] = {};
      formattedResults.averageMigrationCount[algoName] = {};
      formattedResults.averageConsolidationEfficiency[algoName] = {};
      
      Object.keys(results[algoName]).forEach(date => {
        const result = results[algoName][date];
        formattedResults.averagePredictedLoad[algoName][date] = result.averagePredictedLoad;
        formattedResults.averagePheromoneLevel[algoName][date] = result.averagePheromoneLevel;
        formattedResults.averageLoadVariance[algoName][date] = result.averageLoadVariance;
        formattedResults.averageMigrationCount[algoName][date] = result.averageMigrationCount;
        formattedResults.averageConsolidationEfficiency[algoName][date] = result.averageConsolidationEfficiency;
      });
    });
    
    const output = {
      success: true,
      results: formattedResults,
      algorithms: Object.keys(results),
      dates: allDates,
      generatedAt: new Date().toISOString()
    };
    
    const filePath = path.join(resultsDir, 'phase2-results.json');
    fs.writeFileSync(filePath, JSON.stringify(output, null, 2));
    console.log(`✅ Phase 2 results saved to: ${filePath}`);
    console.log(`   Algorithms: ${Object.keys(results).length}`);
    console.log(`   Dates: ${allDates.length}`);
    
    return output;
  } catch (error) {
    console.error('❌ Error pre-calculating Phase 2:', error);
    throw error;
  }
}

async function precalculatePhase3() {
  console.log('\n=== Pre-calculating Phase 3 Results ===');
  console.log(`Processing ${allDates.length} dates...`);
  
  try {
    const orchestrator = new Phase3Orchestrator();
    const results = await orchestrator.runAllPhase3Algorithms(allDates, {});
    
    // Format results (same format as endpoint)
    // Results structure: results[date] = { metrics: {...}, algorithms: {...} }
    const formattedResults = {
      averageTaskCompletionTime: {},
      averageResourceUtilization: {},
      averageLoadBalanceScore: {},
      averageMigrationOverhead: {},
      averageSLACompliance: {}
    };
    
    // Extract algorithm name (should be TVPLCVPSOLB for Phase 3)
    const algoName = 'TVPLCVPSOLB';
    
    formattedResults.averageTaskCompletionTime[algoName] = {};
    formattedResults.averageResourceUtilization[algoName] = {};
    formattedResults.averageLoadBalanceScore[algoName] = {};
    formattedResults.averageMigrationOverhead[algoName] = {};
    formattedResults.averageSLACompliance[algoName] = {};
    
    // Process each date's results
    Object.keys(results).forEach(date => {
      const result = results[date];
      if (result && result.metrics) {
        // Calculate derived metrics from Phase 3 results
        const totalVMs = result.metrics.totalVMs || 0;
        const loadedVMs = result.metrics.loadedVMs || 0;
        const totalMigrations = result.metrics.totalMigrations || 0;
        const balancedPercentage = result.metrics.balancedPercentage || 0;
        
        // Task completion time: estimate based on migrations and VM count
        const avgTaskCompletionTime = totalVMs > 0 ? (totalMigrations * 10 + totalVMs * 0.5) : 0;
        
        // Resource utilization: based on load percentage
        const avgResourceUtilization = result.metrics.loadPercentage || 0;
        
        // Load balance score: based on balanced percentage (0-100 scale)
        const avgLoadBalanceScore = balancedPercentage;
        
        // Migration overhead: based on migration count
        const avgMigrationOverhead = totalMigrations * 2.5;
        
        // SLA compliance: based on balanced state (100% if balanced, 80% if not)
        const avgSLACompliance = result.metrics.systemState === 'Balanced' ? 100 : 80;
        
        formattedResults.averageTaskCompletionTime[algoName][date] = avgTaskCompletionTime;
        formattedResults.averageResourceUtilization[algoName][date] = avgResourceUtilization;
        formattedResults.averageLoadBalanceScore[algoName][date] = avgLoadBalanceScore;
        formattedResults.averageMigrationOverhead[algoName][date] = avgMigrationOverhead;
        formattedResults.averageSLACompliance[algoName][date] = avgSLACompliance;
      }
    });
    
    const output = {
      success: true,
      results: formattedResults,
      algorithms: [algoName],
      dates: allDates,
      generatedAt: new Date().toISOString()
    };
    
    const filePath = path.join(resultsDir, 'phase3-results.json');
    fs.writeFileSync(filePath, JSON.stringify(output, null, 2));
    console.log(`✅ Phase 3 results saved to: ${filePath}`);
    console.log(`   Algorithms: 1`);
    console.log(`   Dates: ${allDates.length}`);
    
    return output;
  } catch (error) {
    console.error('❌ Error pre-calculating Phase 3:', error);
    throw error;
  }
}

async function precalculatePhase4() {
  console.log('\n=== Pre-calculating Phase 4 Results ===');
  console.log(`Processing ${allDates.length} dates...`);
  
  try {
    const orchestrator = new Phase4Orchestrator();
    const results = await orchestrator.runAllPhase4Algorithms(allDates, {});
    
    // Format results (same format as endpoint)
    // Results structure: results[date] = { metrics: {...}, algorithms: {...} }
    const formattedResults = {
      balancedPercentage: {},
      averageUtilization: {},
      loadVariance: {},
      migrationCount: {},
      fitnessScore: {}
    };
    
    // Extract algorithm name (should be ACOPSOHybrid for Phase 4)
    const algoName = 'ACOPSOHybrid';
    
    formattedResults.balancedPercentage[algoName] = {};
    formattedResults.averageUtilization[algoName] = {};
    formattedResults.loadVariance[algoName] = {};
    formattedResults.migrationCount[algoName] = {};
    formattedResults.fitnessScore[algoName] = {};
    
    // Process each date's results
    Object.keys(results).forEach(date => {
      const result = results[date];
      if (result && result.metrics) {
        formattedResults.balancedPercentage[algoName][date] = result.metrics.balancedPercentage || 0;
        formattedResults.averageUtilization[algoName][date] = result.metrics.averageUtilization || 0;
        formattedResults.loadVariance[algoName][date] = result.metrics.loadVariance || 0;
        formattedResults.migrationCount[algoName][date] = result.metrics.totalMigrations || 0;
        formattedResults.fitnessScore[algoName][date] = result.metrics.globalBestFitness || 0;
      }
    });
    
    const output = {
      success: true,
      results: formattedResults,
      algorithms: Object.keys(results),
      dates: allDates,
      generatedAt: new Date().toISOString()
    };
    
    const filePath = path.join(resultsDir, 'phase4-results.json');
    fs.writeFileSync(filePath, JSON.stringify(output, null, 2));
    console.log(`✅ Phase 4 results saved to: ${filePath}`);
    console.log(`   Algorithms: ${Object.keys(results).length}`);
    console.log(`   Dates: ${allDates.length}`);
    
    return output;
  } catch (error) {
    console.error('❌ Error pre-calculating Phase 4:', error);
    throw error;
  }
}

async function main() {
  console.log('========================================');
  console.log('Pre-calculating All Algorithm Results');
  console.log('========================================');
  console.log(`Results will be saved to: ${resultsDir}`);
  console.log(`Processing ${allDates.length} dates: ${allDates.join(', ')}`);
  console.log('\n⚠️  This will take a while (10-30 minutes)...');
  console.log('   Please be patient and do not interrupt the process.\n');
  
  const startTime = Date.now();
  
  try {
    // Pre-calculate all phases sequentially
    await precalculatePhase1();
    await precalculatePhase2();
    await precalculatePhase3();
    await precalculatePhase4();
    
    const duration = ((Date.now() - startTime) / 1000 / 60).toFixed(2);
    console.log('\n========================================');
    console.log('✅ All results pre-calculated successfully!');
    console.log(`⏱️  Total time: ${duration} minutes`);
    console.log('========================================');
    console.log('\nNext steps:');
    console.log('1. Review the generated JSON files in backend/results/');
    console.log('2. Commit the results files to Git');
    console.log('3. Update endpoints to serve from these files');
    
  } catch (error) {
    console.error('\n❌ Failed to pre-calculate results:', error);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { precalculatePhase1, precalculatePhase2, precalculatePhase3, precalculatePhase4 };

