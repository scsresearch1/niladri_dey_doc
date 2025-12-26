import React, { useState, useEffect } from 'react';
import './App.css';
import Header from './components/Header';
import Hero from './components/Hero';
import Phases from './components/Phases';
import Footer from './components/Footer';
import axios from 'axios';

function App() {
  const [phases, setPhases] = useState([]);
  const [researchData, setResearchData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [phasesRes, researchRes] = await Promise.all([
          axios.get('/api/phases'),
          axios.get('/api/research-overview')
        ]);
        setPhases(phasesRes.data.phases);
        setResearchData(researchRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        // Fallback data if API is not available
        setPhases([
          {
            id: 1,
            title: "Phase 1: Load Balancing Method Mapping",
            description: "Demonstrate the process of mapping the category of load balancing methods for specific services or resource types.",
            status: "completed",
            outcomes: [
              "Service-resource type classification framework",
              "Load balancing method categorization",
              "Mapping algorithm implementation"
            ],
            conclusion: "Initial research focused on load balancing strategies in the Hadoop framework, including FIFO, FAIR, Capacity, Hybrid, LATE, SAMR, and Context-aware allocation. Characteristics of these algorithms were analyzed using parametric metrics to understand their strengths and limitations. The study transitioned load balancing strategies to the cloud, examining Threshold Detection Policies such as Inter Quartile Range, Local Regression, Median Absolute Deviation, Robust Local Regression, and Static Threshold. VM Consolidation Policies like Maximum Correlation, Minimum Migration Time, Minimum Utilization, and Random Selection were also analyzed for their effectiveness. The research employed mathematical models to evaluate the advantages and bottlenecks of each algorithm category and conducted experiments on 10 datasets using various performance metrics, including energy consumption, SLA degradation, and execution time, among others.",
            algorithms: [
              "FIFO",
              "FAIR",
              "Capacity",
              "Hybrid",
              "LATE",
              "SAMR",
              "Context-aware allocation"
            ],
            thresholdPolicies: [
              "Inter Quartile Range",
              "Local Regression",
              "Median Absolute Deviation",
              "Robust Local Regression",
              "Static Threshold"
            ],
            vmConsolidationPolicies: [
              "Maximum Correlation",
              "Minimum Migration Time",
              "Minimum Utilization",
              "Random Selection"
            ],
            detailedAlgorithms: [
              {
                id: 1,
                name: "Threshold Detection using Inter Quartile Range (IQR)",
                category: "Threshold Detection",
                steps: [
                  "Accept the list of active nodes.",
                  "For each active node, accept the list of Virtual Machine:",
                  "  a. Initialize the CPU utilization and sort it in ascending order.",
                  "  b. Build the quartiles for each segment.",
                  "  c. Calculate the Inter Quartile Range (IQR) as Q3 - Q1, where Q3 is the third quartile and Q1 is the first quartile.",
                  "Calculate the threshold, Q, using the formula: Q = 100 - Safety Range [Assumed 5%] * IQR",
                  "Conditional check: If the host CPU utilization is greater than Q:",
                  "  a. Then mark the host as overloaded.",
                  "Else (if the host CPU utilization is not greater than Q):",
                  "  a. Mark the host node as a safe node.",
                  "Report the final overloaded list of hosts."
                ]
              },
              {
                id: 2,
                name: "Threshold Detection using Local Regression (LR)",
                category: "Threshold Detection",
                steps: [
                  "Accept the list of active nodes.",
                  "For each active node, accept the list of Virtual Machine:",
                  "  a. Initialize the CPU utilization and sort it in descending order as C[].",
                  "  b. Initialize the increase in load pattern as P[].",
                  "  c. Calculate the CPU utilization weight function as CW = {CW + {1 / (1 - CW[i])}} / 2.",
                  "  d. Calculate the load pattern weight function as LW = {LW + {1 / (1 - CW[i])}} / 2.",
                  "Calculate the threshold, R, using the formula: R = (C[] * CW + P[] * LW) * Safety Range",
                  "Conditional check: If the host CPU utilization is greater than C[i] - R:",
                  "  a. Then mark the host as overloaded.",
                  "Else (if the host CPU utilization is not greater than C[i] - R):",
                  "  a. Mark the host node as a safe node.",
                  "Report the final overloaded list of hosts."
                ]
              },
              {
                id: 3,
                name: "Threshold Detection using Median Absolute Deviation (MAD)",
                category: "Threshold Detection",
                steps: [
                  "Accept the list of active nodes.",
                  "For each active node accept the list of Virtual Machine:",
                  "  a. Initialize the CPU utilization and sort in descending order as C[]",
                  "  b. Calculate the Median of the C[]",
                  "  c. Calculate the Deviation collection D[] as (Median - C[])",
                  "Calculate the deviation median as DM as Median(D[])",
                  "Calculate the threshold, R as (100 - DM * Safety_Range)",
                  "If the host CPU utilization > R:",
                  "  a. Then mark the host as overloaded",
                  "Else:",
                  "  a. Mark the host node as safe node",
                  "Report the final overloaded list of hosts."
                ]
              },
              {
                id: 4,
                name: "Threshold Detection using Robust Local Regression (LRR)",
                category: "Threshold Detection",
                steps: [
                  "Accept the list of active nodes.",
                  "For each active node, accept the list of Virtual Machine:",
                  "  a. Initialize the CPU utilization and sort in descending order as C[].",
                  "  b. Initialize the increase in load pattern as P[].",
                  "  c. Calculate the CPU utilization weight function as CW = (CW+1 / (100 - C[i]))/2.",
                  "  d. Calculate the load pattern weight function as LW = (LW+1 / (100 - C[i]))/2.",
                  "  e. Calculate the combined weight function as CLW = CW*LW.",
                  "Calculate the threshold, R as (C[]*CW + P[]*LW + CLW)*Safety Range",
                  "If the host CPU utilization > C[i]-R:",
                  "  a. Then mark the host as overloaded.",
                  "Else:",
                  "  a. Mark the host node as safe node.",
                  "Report the final overloaded list of hosts."
                ]
              },
              {
                id: 5,
                name: "Virtual Machine Consolidation using Maximum Correlation (MC)",
                category: "VM Consolidation",
                steps: [
                  "Accept the list of overloaded virtual machines.",
                  "For each virtual machine:",
                  "  a. Initialize the Capacity, Utilized and availability Resources as C[][][].",
                  "  b. Build the correlation matrix [Kendall].",
                  "Report the virtual machines with highest correlation."
                ]
              },
              {
                id: 6,
                name: "Virtual Machine Consolidation using Minimum Migration Time (MMT)",
                category: "VM Consolidation",
                steps: [
                  "Accept the list of overloaded virtual machines.",
                  "Calculate the network transfer speed as NS.",
                  "For each virtual machine:",
                  "  a. Calculate the size of the RAM as SR.",
                  "  b. Calculate the size of the Application as SA.",
                  "  c. Find the transfer time as (SR * SA)/NS and denote as TT.",
                  "  d. Find the total migration time MT as Shutdown Time + Startup Time + TT.",
                  "Report the virtual machines with lowest MT."
                ]
              },
              {
                id: 7,
                name: "Virtual Machine Consolidation using Random Selection (RS)",
                category: "VM Consolidation",
                steps: [
                  "Accept the list of overloaded virtual machines.",
                  "Calculate the network transfer speed as NS.",
                  "For each virtual machine under the loaded nodes:",
                  "  a. Migrate the virtual machine to less loaded node:",
                  "    i. If the load is balanced:",
                  "      1. Continue with the migration.",
                  "    ii. Else:",
                  "      1. Reverse the migration.",
                  "Report the final migration."
                ]
              }
            ],
            datasets: 10,
            datasetInfo: {
              source: "PlanetLab",
              count: 10,
              dates: [
                "20110303",
                "20110306",
                "20110309",
                "20110322",
                "20110325",
                "20110403",
                "20110409",
                "20110411",
                "20110412",
                "20110420"
              ],
              description: "PlanetLab workload traces containing real-world cloud computing resource utilization data",
              totalFiles: 11846
            },
            metrics: [
              "Energy consumption",
              "SLA degradation",
              "Execution time"
            ],
            algorithmResults: {
              thresholdDetection: [
                {
                  algorithm: "Inter Quartile Range (IQR)",
                  energyConsumption: "Low",
                  slaViolations: "Moderate",
                  executionTime: "Fast",
                  accuracy: "High",
                  description: "Effective for normal distribution workloads"
                },
                {
                  algorithm: "Local Regression (LR)",
                  energyConsumption: "Moderate",
                  slaViolations: "Low",
                  executionTime: "Moderate",
                  accuracy: "Very High",
                  description: "Best for dynamic load patterns"
                },
                {
                  algorithm: "Median Absolute Deviation (MAD)",
                  energyConsumption: "Low",
                  slaViolations: "Low",
                  executionTime: "Fast",
                  accuracy: "High",
                  description: "Robust against outliers"
                },
                {
                  algorithm: "Robust Local Regression (LRR)",
                  energyConsumption: "Moderate",
                  slaViolations: "Very Low",
                  executionTime: "Moderate",
                  accuracy: "Very High",
                  description: "Optimal for complex load patterns"
                }
              ],
              vmConsolidation: [
                {
                  algorithm: "Maximum Correlation (MC)",
                  migrationCount: "High",
                  energySavings: "High",
                  slaViolations: "Moderate",
                  executionTime: "Moderate",
                  description: "Effective for correlated workloads"
                },
                {
                  algorithm: "Minimum Migration Time (MMT)",
                  migrationCount: "Moderate",
                  energySavings: "Moderate",
                  slaViolations: "Low",
                  executionTime: "Fast",
                  description: "Minimizes migration overhead"
                },
                {
                  algorithm: "Random Selection (RS)",
                  migrationCount: "Variable",
                  energySavings: "Low",
                  slaViolations: "High",
                  executionTime: "Very Fast",
                  description: "Baseline comparison algorithm"
                }
              ],
              summary: {
                bestThresholdDetection: "Robust Local Regression (LRR)",
                bestVMConsolidation: "Minimum Migration Time (MMT)",
                overallImprovement: "Over 20% reduction in energy consumption",
                slaImprovement: "15% reduction in SLA violations",
                keyFinding: "Combination of LRR and MMT provides optimal load balancing"
              }
            }
          },
          {
            id: 2,
            title: "Phase 2: Load Condition Identification",
            description: "Propose the strategy for improved identification of the load conditions with resource summarization.",
            status: "completed",
            outcomes: [
              "Resource summarization techniques",
              "Load condition detection algorithms",
              "Real-time monitoring capabilities"
            ],
            conclusion: "Load balancing techniques enable automatic and dynamic scaling of physical resource pool allocations based on virtual resource utilization. Existing load balancing methods primarily focus on task scheduling rather than load optimization, leading to limitations in improving response times beyond a certain point. These methods often use genetic optimization, criticized for their less dynamic nature and limited effectiveness on virtualized resources. The proposed novel method involves predictive load estimation, load reduction using correlation-based parametric reduction, and corrective coefficient-based pheromone prediction during load balancing. The solution addresses challenges with standard optimization methods, including complex probability distribution, non-coordinated search space, increasing complexity, and higher dependency on fixed parameters, resulting in improved response times, reduced SLA violations, and fewer virtual machine migrations.",
            proposedMethods: [
              "Predictive load estimation",
              "Correlation-based parametric reduction",
              "Corrective coefficient-based pheromone prediction"
            ],
            challengesAddressed: [
              "Complex probability distribution",
              "Non-coordinated search space",
              "Increasing complexity",
              "Higher dependency on fixed parameters"
            ],
            limitationsOfExistingMethods: [
              "Focus on task scheduling rather than load optimization",
              "Limited effectiveness in improving response times",
              "Less dynamic nature of genetic optimization",
              "Limited effectiveness on virtualized resources"
            ],
            results: [
              "Improved response times",
              "Reduced SLA violations",
              "Fewer virtual machine migrations"
            ],
            keyFeatures: [
              "Automatic and dynamic scaling",
              "Physical resource pool allocation",
              "Virtual resource utilization-based"
            ],
            datasets: 10,
            datasetInfo: {
              source: "PlanetLab",
              count: 10,
              dates: [
                "20110303",
                "20110306",
                "20110309",
                "20110322",
                "20110325",
                "20110403",
                "20110409",
                "20110411",
                "20110412",
                "20110420"
              ],
              description: "PlanetLab workload traces for evaluating load condition identification strategies",
              totalFiles: 11846
            }
          },
          {
            id: 3,
            title: "Phase 3: Predictive Load Balancing",
            description: "Propose a novel predictive load balancing strategy for migrating applications.",
            status: "completed",
            outcomes: [
              "Machine learning prediction models",
              "Application migration strategies",
              "Predictive analytics framework"
            ],
            conclusion: "Proposal of a novel bio-inspired and PSO-inspired algorithm for cloud-based load balancing. Utilization of space-time coordinate system reduces backtracking during particle movements, decreasing iterations in load balancing strategy and improving SLA. Found that employing local and global thresholds for identifying system stability conditions maximizes objective function outcomes and reduces algorithm iterations by over 20% compared to benchmarks. Demonstrated that predictive determination of personal best and global best locations with time-dependent coordinate systems using corrective velocity and threshold-based objective function leads to optimal load balancing for task scheduling, resulting in nearly 50% improvement in time complexity over parallel benchmarked research.",
            algorithm: "Bio-inspired and PSO-inspired Algorithm",
            keyFindings: [
              "Proposal of a novel bio-inspired and PSO-inspired algorithm for cloud-based load balancing",
              "Utilization of space-time coordinate system reduces backtracking during particle movements",
              "Decreasing iterations in load balancing strategy and improving SLA",
              "Employing local and global thresholds for identifying system stability conditions maximizes objective function outcomes",
              "Reduces algorithm iterations by over 20% compared to benchmarks",
              "Predictive determination of personal best and global best locations with time-dependent coordinate systems",
              "Using corrective velocity and threshold-based objective function leads to optimal load balancing",
              "Nearly 50% improvement in time complexity over parallel benchmarked research"
            ],
            improvements: [
              {
                metric: "Algorithm Iterations",
                value: "Over 20% reduction",
                description: "Compared to benchmarks through local and global thresholds"
              },
              {
                metric: "Time Complexity",
                value: "Nearly 50% improvement",
                description: "Over parallel benchmarked research outcomes"
              }
            ],
            benefits: [
              "Reduced backtracking during particle movements",
              "Decreased iterations in load balancing strategy",
              "Improved SLA (Service Level Agreement)",
              "Maximized objective function outcomes",
              "Optimal load balancing for task scheduling"
            ],
            techniques: [
              "Bio-inspired algorithm",
              "PSO (Particle Swarm Optimization)",
              "Space-time coordinate system",
              "Predictive load balancing",
              "Time-dependent coordinate systems",
              "Corrective velocity",
              "Threshold-based objective function"
            ],
            datasets: 10,
            datasetInfo: {
              source: "PlanetLab",
              count: 10,
              dates: [
                "20110303",
                "20110306",
                "20110309",
                "20110322",
                "20110325",
                "20110403",
                "20110409",
                "20110411",
                "20110412",
                "20110420"
              ],
              description: "PlanetLab datasets for testing predictive load balancing algorithms and PSO-based approaches",
              totalFiles: 11846
            }
          },
          {
            id: 4,
            title: "Phase 4: Hybrid Genetic Load Balancing",
            description: "Propose a hybrid genetic load balancing strategy with power awareness and cost minimization.",
            status: "completed",
            outcomes: [
              "Genetic algorithm optimization",
              "Power-aware scheduling",
              "Cost minimization algorithms",
              "Hybrid optimization framework"
            ],
            conclusion: "This work proposes a bio-inspired ACO & PSO hybrid algorithm for cloud-based load balancing. During the research, this work proved and concluded that consideration of the local and global threshold for identification of the load conditions is effective than the existing method. Also, this work concludes that consideration of the local and global threshold for identification of the system stability conditions is effective than the existing method for maximizing the outcome of the objective function and reduce the iterations of the proposed algorithm, which results in over 20% improvement compared with the existing benchmarked solutions. Also, this work confirms that the consideration of the space-time coordinate system will ensure the reduction of the backtracking during particle movements. This also contributes to the reduction of the iterations during the load balancing strategy and contributes towards the improvement of the SLA. Finally, this work also demonstrates that the predictive determination of the personal best and global best locations with time-dependent coordinate systems using the corrective velocity and threshold-based objective function shall produce the most optimal load balancing for task scheduling and showcased nearly 50% improvement on time complexity over parallel benchmarked research outcomes.",
            algorithm: "Bio-inspired ACO & PSO Hybrid Algorithm",
            keyContributions: [
              "Local and global threshold for load conditions identification",
              "Local and global threshold for system stability conditions identification",
              "Space-time coordinate system for backtracking reduction",
              "Predictive determination of personal best and global best locations",
              "Time-dependent coordinate systems with corrective velocity",
              "Threshold-based objective function"
            ],
            improvements: [
              {
                metric: "Overall Performance",
                value: "Over 20% improvement",
                description: "Compared with existing benchmarked solutions"
              },
              {
                metric: "Time Complexity",
                value: "Nearly 50% improvement",
                description: "Over parallel benchmarked research outcomes"
              }
            ],
            benefits: [
              "Reduced iterations during load balancing strategy",
              "Improved SLA (Service Level Agreement)",
              "Reduced backtracking during particle movements",
              "Maximized outcome of objective function",
              "Most optimal load balancing for task scheduling"
            ],
            techniques: [
              "ACO (Ant Colony Optimization)",
              "PSO (Particle Swarm Optimization)",
              "Hybrid bio-inspired approach",
              "Predictive load balancing",
              "Time-dependent coordinate systems"
            ],
            datasets: 10,
            datasetInfo: {
              source: "PlanetLab",
              count: 10,
              dates: [
                "20110303",
                "20110306",
                "20110309",
                "20110322",
                "20110325",
                "20110403",
                "20110409",
                "20110411",
                "20110412",
                "20110420"
              ],
              description: "PlanetLab workload traces for evaluating hybrid genetic load balancing with power awareness and cost minimization",
              totalFiles: 11846
            }
          }
        ]);
        setResearchData({
          title: "A Cost Effective and Power Aware Load Balancing Strategy for Cloud using Genetic Optimization & Machine Learning",
          abstract: "This research proposes an innovative approach to cloud load balancing that combines genetic optimization algorithms with machine learning techniques to achieve optimal resource allocation while minimizing power consumption and operational costs."
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading research data...</p>
      </div>
    );
  }

  return (
    <div className="App">
      <Header />
      <Hero researchData={researchData} />
      <Phases phases={phases} />
      <Footer />
    </div>
  );
}

export default App;

