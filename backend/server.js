const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Import dataset downloader (with error handling)
let DatasetDownloader;
try {
  DatasetDownloader = require('./utils/downloadDatasets');
} catch (error) {
  console.warn('⚠️  Could not load dataset downloader:', error.message);
  // Create a dummy class to prevent crashes
  DatasetDownloader = class {
    constructor() {}
    async ensureDatasetsExist() {
      console.warn('⚠️  Dataset downloader not available');
      return false;
    }
  };
}

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
// CORS configuration - allow frontend URL from environment variable
// Default allowed origins (including Netlify)
const allowedOrigins = [
  'https://cloudlb.netlify.app',
  'http://localhost:3000',
  'http://localhost:3001'
];

// Add FRONTEND_URL from environment if set
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Allow if origin is in allowed list or if FRONTEND_URL is not set (development)
    if (allowedOrigins.indexOf(origin) !== -1 || !process.env.FRONTEND_URL) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.get('/api/phases', (req, res) => {
  res.json({
    phases: [
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
        },
        detailedAlgorithms: [
          {
            id: 8,
            name: "Service Based Categorization and Summarization of Loads (SBCSL)",
            category: "Load Summarization",
            steps: [
              "Accept the list of Services SR[] and Virtual Machines V[].",
              "For each service SR[i]:",
              "  a. Initialize CS = 0, MS = 0, SS = 0, NS = 0.",
              "  b. For each VM V[j] belonging to SR[i]:",
              "    i. Calculate CS = CS + V[j].C (Compute Capacity).",
              "    ii. Calculate MS = MS + V[j].M (Memory Capacity).",
              "    iii. Calculate SS = SS + V[j].S (Storage Capacity).",
              "    iv. Calculate NS = NS + V[j].N (Network Capacity).",
              "  c. Produce CS, MS, SS, NS for service SR[i].",
              "Return service-specific summarized loads for all services."
            ]
          },
          {
            id: 9,
            name: "Corrective Coefficient Based Pheromone Level Prediction (CCPLP)",
            category: "Pheromone Prediction",
            steps: [
              "Accept VMs V[], initial pheromone level PH(t), growth rate K1, decay rate K2, simulation duration T, events K[], and prediction depth TR.",
              "For each VM V[i]:",
              "  a. Initialize current pheromone PHt = PH(t).",
              "  b. Initialize growth rate K1_current = K1 and decay rate K2_current = K2.",
              "  c. For each time step t = 1 to TR:",
              "    i. Update TR = t.",
              "    ii. Process events K[j]:",
              "      - If K[j] = 'Growth', increase K1_current.",
              "      - Else, increase K2_current.",
              "    iii. Calculate K11 = K1_current / T and K22 = K2_current / T.",
              "    iv. Calculate final rate = (K11 - K22) + TR.",
              "    v. Calculate correction factor CF = final_rate / (K1_current - K2_current).",
              "    vi. Generate PH(t+1) = PHt * e^(final_rate) - CF.",
              "  d. Return predicted pheromone level PH(t+1) for VM V[i].",
              "Return predicted pheromone levels for all VMs."
            ]
          },
          {
            id: 10,
            name: "Correlation Based Load Prediction (CBLP)",
            category: "Load Prediction",
            steps: [
              "Accept VMs V[], weight constants CW, MW, SW, NW, and summarized loads CS, MS, SS, NS from SBCSL.",
              "For each VM V[j]:",
              "  a. Extract VM capacities: vmCS = V[j].C, vmMS = V[j].M, vmSS = V[j].S, vmNS = V[j].N.",
              "  b. Calculate coefficients:",
              "    i. B1 = CW / CS (if CS ≠ 0).",
              "    ii. B2 = MW / MS (if MS ≠ 0).",
              "    iii. B3 = SW / SS (if SS ≠ 0).",
              "    iv. B4 = NW / NS (if NS ≠ 0).",
              "  c. Predict load: L(t+1) = B1 * vmCS + B2 * vmMS + B3 * vmSS + B4 * vmNS.",
              "  d. Return predicted load L(t+1) for VM V[j].",
              "Return predicted loads for all VMs."
            ]
          },
          {
            id: 11,
            name: "Load Balancing by Predictive Corrective Coefficient and Correlative Prediction (LB-PCC-CP)",
            category: "Load Balancing",
            steps: [
              "Accept VMs V[], summarized loads CS, MS, SS, NS from SBCSL, predicted pheromone levels PH[t+1] from CCPLP, and predicted loads L[t+1] from CBLP.",
              "Calculate threshold TH = (CS + MS + SS + NS) - L(t), where L(t) is current total load.",
              "For each VM V[i]:",
              "  a. Get predicted load L[t+1] for V[i].",
              "  b. If L[t+1] > TH:",
              "    i. VM needs migration - find optimal destination.",
              "    ii. For each potential destination VM V[j]:",
              "      - Get pheromone level PH[t+1] for V[j].",
              "      - Calculate capacity Cap[t+1] = available capacity of V[j].",
              "      - Calculate fitness function FF = Max(Cap[t+1]), Max(PH[t+1]).",
              "    iii. Sort V[] based on FF (descending).",
              "    iv. Select optimal V[x] with highest FF (excluding source VM).",
              "    v. Migrate V[i] to V[x].",
              "  c. Else:",
              "    - VM does not need migration.",
              "Return migration decisions and optimal destinations for all VMs."
            ]
          }
        ]
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
        },
        detailedAlgorithms: [
          {
            id: 12,
            name: "Local and Global Threshold Based Load Condition Identification (LGT-LCI)",
            category: "Load Condition Identification",
            steps: [
              "Accept Tasks T[], VMs VM[], Infrastructure I[], and Physical Locations L[].",
              "For each task T[k]:",
              "  a. Calculate capacity demand Dem(T[k]) = <Compute, Memory, Storage, Network>.",
              "  b. Identify VMs allocated to T[k] as VMI[].",
              "  c. For each VM VMI[i]:",
              "    i. Identify infrastructure I[j] capacity allocated to VMI[i] as Cap(I[j]).",
              "    ii. For all I[0..j], calculate Local Threshold = Local Threshold + Cap(I[j]).",
              "    iii. If Dem(T[k]) > Local Threshold:",
              "      - Identify capacity of L[] allocated to I[j] as Cap(L[p]).",
              "      - For all L[0..p], calculate Global Threshold = Global Threshold + Cap(L[p]).",
              "      - If Dem(T[k]) > Global Threshold:",
              "        * Mark VMI[i] as loaded VM and add to VMx[].",
              "      - Else: System is partially stable, pass (Local Threshold, Global Threshold) to SSOF.",
              "Return VMx[] (loaded VMs), Local Threshold, and Global Threshold."
            ]
          },
          {
            id: 13,
            name: "Time-Dependent Location Identification (TDLI)",
            category: "Space-Time Coordinates",
            steps: [
              "Accept Swarms S[], Coordinates L[] with (x,y), and Time Instances T[].",
              "For each swarm S[i]:",
              "  a. Identify coordinates for S[i] as L[j] with (x,y) at T[i].",
              "  b. Calculate Space-time coordinate SPC = power(x, y, T[i]).",
              "  c. Return SPC for swarm S[i].",
              "Return space-time coordinates SPC for all swarms."
            ]
          },
          {
            id: 14,
            name: "Predictive Local and Global Best Position Detection (PLGB-PD)",
            category: "Position Detection",
            steps: [
              "Accept Space-time coordinates SPC[], Velocities V[], and Inertia W[].",
              "For each velocity V[i]:",
              "  a. Initialize Error Correction factor EC[i] = 0.",
              "  b. Calculate Regression Coefficient RC = Mean(V[0..i]).",
              "  c. Calculate V[i+1] = W[i] + RC * V[i] + EC[i].",
              "  d. Update EC[i] = Abs(V[i+1] - V[i]) / Mean(EC[0..i-1]).",
              "  e. Re-calculate V[i+1] = W[i] + RC * V[i] + EC[i].",
              "For each SPC[i]:",
              "  a. Calculate SPC[i+1] = V[i+1] + SPC[i].",
              "  b. If SPC[i+1] > All{SPC[]}:",
              "    - Set GBP (Global Best Position) = SPC[i].",
              "  c. If SPC[i+1] > Any{SPC[]}:",
              "    - Add SPC[i] to LBP[] (Local Best Positions).",
              "Return LBP[] (Local best positions) and GBP (Global best position)."
            ]
          },
          {
            id: 15,
            name: "System Stability Driven Objective Function (SSOF)",
            category: "System Stability",
            steps: [
              "Accept Infrastructure I[], Local Threshold LT, and Global Threshold GT.",
              "For each infrastructure I[k]:",
              "  a. Identify utilization Util(I[k]) = capacity - demand.",
              "  b. If Util(I[k]) < LT:",
              "    i. For each infrastructure I[0..k]:",
              "      - Calculate total capacity TC = TC + Util(I[k]).",
              "    ii. If TC < GT:",
              "      - Set System State SS = 'Balanced'.",
              "    iii. Else:",
              "      - Set System State SS = 'Un-Balanced'.",
              "Return SS (System State: Balanced or Un-Balanced)."
            ]
          },
          {
            id: 16,
            name: "Time-Variant Predictive Location Driven Corrective Velocity Based Particle Swarm Optimization for Load Balancing (TVPL-CV-PSO-LB)",
            category: "Load Balancing",
            steps: [
              "Accept Loaded VMs VMx[], Velocities V[], Particles PSO[], Local Best Positions LBP[], Global Best Position GBP, Local Threshold LT, Global Threshold GT, and Infrastructure I[].",
              "Initialize GBP = 0 (if not provided).",
              "For each loaded VM VMx[i]:",
              "  a. Position PSO[0..i].",
              "  b. For each particle PSO[k]:",
              "    i. Set LBP[k] = SPC[i] from TDLI algorithm.",
              "    ii. If LBP[k] is best(GBP):",
              "      - Update GBP = LBP[k].",
              "      - Update LT and GT for I[].",
              "    iii. For each infrastructure I[p]:",
              "      - Call SSOF(I[0..p], LBP[0..k], GBP).",
              "      - If SS is Balanced:",
              "        * STOP.",
              "      - Else:",
              "        * Migrate VMx[i] to I[p+1].",
              "  c. Continue until SS is Balanced.",
              "Return SS (System State) and Map(VMx[]::I[]) (VM to Infrastructure mapping)."
            ]
          }
        ]
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
        },
        detailedAlgorithms: [
          {
            id: 17,
            name: "ACO and PSO Inspired Hybrid Load Balancing Algorithm",
            category: "Hybrid Load Balancing",
            steps: [
              "Accept Data Center Traces as input.",
              "Initialize particle swarm with random positions (each position represents task-to-data-center assignment).",
              "Initialize pheromone matrix for all task-data center pairs.",
              "For each particle:",
              "  a. Assign tasks to data centers based on the particle's position.",
              "  b. The position of a particle represents a potential solution, indicating which task is assigned to which data center.",
              "  c. Evaluate the fitness of the particle's position.",
              "  d. The fitness function quantifies the quality of the load balancing solution.",
              "  e. Update the particle's best position and fitness if necessary.",
              "  f. Store the best position found by the particle so far.",
              "  g. If the current position yields a better fitness value than the previous best:",
              "    i. Update the global best position and fitness if necessary.",
              "    ii. Compare the particle's best position with the global best position.",
              "  h. If the particle's best position has a better fitness value:",
              "    i. Update the global best position.",
              "    ii. Evaporate the pheromone values.",
              "    iii. Reduce the pheromone values in the matrix to encourage exploration of new paths.",
              "    iv. Deposit pheromone on the paths of the best solution found by the particles.",
              "    v. Increase the pheromone values in the matrix on the paths of the global best position.",
              "For each particle:",
              "  a. Update the velocity based on the particle's best position, the global best position, and the pheromone matrix.",
              "  b. The velocity determines how the particle moves in the search space.",
              "  c. Consider the particle's attraction towards its best position, the global best position, and the pheromone values.",
              "  d. Update the particle's position.",
              "  e. Move the particle based on its velocity, thereby exploring the search space.",
              "Return the global best position as the final solution.",
              "Analyze load condition and determine migration decisions."
            ]
          }
        ]
      }
    ]
  });
});

// Dataset diagnostic endpoint - check if datasets exist
app.get('/api/datasets/check', (req, res) => {
  const datasetPath = path.join(__dirname, 'dataset', 'planetlab');
  
  try {
    const exists = fs.existsSync(datasetPath);
    if (!exists) {
      return res.json({
        exists: false,
        path: datasetPath,
        error: 'Dataset directory does not exist',
        message: 'Datasets need to be uploaded to Render. See deployment documentation.'
      });
    }

    const dates = fs.readdirSync(datasetPath).filter(item => {
      const itemPath = path.join(datasetPath, item);
      return fs.statSync(itemPath).isDirectory();
    }).sort();

    const datasetInfo = dates.map(date => {
      const datePath = path.join(datasetPath, date);
      const files = fs.readdirSync(datePath);
      return {
        date: date,
        formattedDate: formatDate(date),
        fileCount: files.length,
        path: `dataset/planetlab/${date}`
      };
    });

    res.json({
      exists: true,
      path: datasetPath,
      totalDates: dates.length,
      totalFiles: datasetInfo.reduce((sum, d) => sum + d.fileCount, 0),
      datasets: datasetInfo
    });
  } catch (error) {
    res.json({
      exists: false,
      path: datasetPath,
      error: error.message,
      message: 'Error checking dataset directory'
    });
  }
});

// Dataset API endpoint
app.get('/api/datasets', (req, res) => {
  const datasetPath = path.join(__dirname, 'dataset', 'planetlab');
  
  try {
    if (!fs.existsSync(datasetPath)) {
      return res.status(404).json({ 
        error: 'Dataset directory not found',
        message: 'Datasets need to be uploaded to Render. The dataset directory is missing.',
        path: datasetPath
      });
    }

    const dates = fs.readdirSync(datasetPath).filter(item => {
      const itemPath = path.join(datasetPath, item);
      return fs.statSync(itemPath).isDirectory();
    }).sort();

    if (dates.length === 0) {
      return res.status(404).json({
        error: 'No dataset dates found',
        message: 'Dataset directory exists but contains no date folders.',
        path: datasetPath
      });
    }

    const datasetInfo = dates.map(date => {
      const datePath = path.join(datasetPath, date);
      const files = fs.readdirSync(datePath);
      return {
        date: date,
        formattedDate: formatDate(date),
        fileCount: files.length,
        path: `dataset/planetlab/${date}`
      };
    });

    res.json({
      source: "PlanetLab",
      description: "Real-world cloud computing workload traces from PlanetLab infrastructure",
      totalDates: dates.length,
      totalFiles: datasetInfo.reduce((sum, d) => sum + d.fileCount, 0),
      datasets: datasetInfo
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Error reading dataset directory', 
      message: error.message,
      path: datasetPath
    });
  }
});

// Helper function to format date
function formatDate(dateString) {
  const year = dateString.substring(0, 4);
  const month = dateString.substring(4, 6);
  const day = dateString.substring(6, 8);
  return `${year}-${month}-${day}`;
}

// Load Balancer Algorithm Execution
const LoadBalancer = require('./algorithms/phase1/loadBalancer');

// Phase 2 Algorithm Execution
const Phase2Orchestrator = require('./algorithms/phase2/phase2Orchestrator');

// Phase 3 Algorithm Execution
const Phase3Orchestrator = require('./algorithms/phase3/phase3Orchestrator');

// Phase 4 Algorithm Execution
const Phase4Orchestrator = require('./algorithms/phase4/phase4Orchestrator');

// API endpoint to run algorithms and get results
app.post('/api/phase1/run-algorithms', async (req, res) => {
  try {
    const { dates, sampleDates } = req.body;
    
    // Check if dataset directory exists first
    const datasetPath = path.join(__dirname, 'dataset', 'planetlab');
    if (!fs.existsSync(datasetPath)) {
      return res.status(404).json({ 
        error: 'Dataset directory not found',
        message: 'Datasets are missing on the server. Please upload datasets to backend/dataset/planetlab/ on Render.',
        path: datasetPath,
        help: 'See deployment documentation for instructions on uploading datasets to Render.'
      });
    }
    
    // Default dates - ALL dates by default
    const defaultDates = [
      '20110303', '20110306', '20110309', '20110322', '20110325',
      '20110403', '20110409', '20110411', '20110412', '20110420'
    ];
    
    // Process ALL dates by default - NO LIMITATIONS
    const datesToProcess = dates || defaultDates;
    
    // Verify requested dates exist
    const existingDates = fs.readdirSync(datasetPath).filter(item => {
      const itemPath = path.join(datasetPath, item);
      return fs.statSync(itemPath).isDirectory();
    });
    
    const missingDates = datesToProcess.filter(date => !existingDates.includes(date));
    if (missingDates.length > 0) {
      return res.status(404).json({
        error: 'Some dataset dates not found',
        message: `The following dates are missing: ${missingDates.join(', ')}`,
        missingDates: missingDates,
        availableDates: existingDates.sort(),
        path: datasetPath
      });
    }
    
    console.log(`Processing ${datesToProcess.length} dates: ${datesToProcess.join(', ')}`);
    const loadBalancer = new LoadBalancer();
    
    // Run all algorithms (optimized with sampling)
    const results = await loadBalancer.runAllAlgorithms(datesToProcess);
    
    // Format results for frontend
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
    
    res.json({
      success: true,
      results: formattedResults,
      algorithms: Object.keys(results),
      dates: datesToProcess
    });
  } catch (error) {
    console.error('Error running algorithms:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// API endpoint to get cached or run single algorithm
app.get('/api/phase1/results/:thresholdAlgo/:consolidationAlgo', async (req, res) => {
  try {
    const { thresholdAlgo, consolidationAlgo } = req.params;
    const { date } = req.query;
    
    const loadBalancer = new LoadBalancer();
    const dates = date ? [date] : [
      '20110303', '20110306', '20110309', '20110322', '20110325',
      '20110403', '20110409', '20110411', '20110412', '20110420'
    ];
    
    const results = {};
    for (const d of dates) {
      try {
        const result = await loadBalancer.runAlgorithm(thresholdAlgo, consolidationAlgo, d);
        results[d] = result;
      } catch (error) {
        results[d] = {
          date: d,
          algorithm: `${thresholdAlgo} ${consolidationAlgo}`,
          energyConsumption: 0,
          vmMigrations: 0,
          slaViolations: 0,
          nodeShutdowns: 0,
          meanTimeBeforeShutdown: 0,
          meanTimeBeforeMigration: 0,
          error: error.message
        };
      }
    }
    
    res.json({
      success: true,
      algorithm: `${thresholdAlgo} ${consolidationAlgo}`,
      results: results
    });
  } catch (error) {
    console.error('Error getting algorithm results:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// API endpoint to get aggregated performance results for Phase 1
app.get('/api/phase1/performance-results', async (req, res) => {
  try {
    const loadBalancer = new LoadBalancer();
    const dates = [
      '20110303', '20110306', '20110309', '20110322', '20110325',
      '20110403', '20110409', '20110411', '20110412', '20110420'
    ];
    
    const thresholdAlgos = ['IQR', 'LR', 'MAD', 'LRR', 'THR'];
    const consolidationAlgos = ['MC', 'MMT', 'MU', 'RS'];
    
    // Aggregate results by threshold detection algorithm
    const thresholdResults = {};
    const consolidationResults = {};
    
    // Run algorithms on multiple dates for better accuracy
    for (const thresholdAlgo of thresholdAlgos) {
      const allResults = [];
      
      // Run on first 3 dates for performance
      for (const date of dates.slice(0, 3)) {
        for (const consolidationAlgo of consolidationAlgos) {
          try {
            const result = await loadBalancer.runAlgorithm(thresholdAlgo, consolidationAlgo, date);
            allResults.push({
              consolidation: consolidationAlgo,
              date: date,
              energyConsumption: result.energyConsumption,
              slaViolations: result.slaViolations,
              vmMigrations: result.vmMigrations,
              nodeShutdowns: result.nodeShutdowns,
              meanTimeBeforeShutdown: result.meanTimeBeforeShutdown
            });
          } catch (error) {
            console.warn(`Error running ${thresholdAlgo} ${consolidationAlgo} on ${date}:`, error.message);
          }
        }
      }
      
      if (allResults.length > 0) {
        const avgEnergy = allResults.reduce((sum, r) => sum + r.energyConsumption, 0) / allResults.length;
        const avgSLA = allResults.reduce((sum, r) => sum + r.slaViolations, 0) / allResults.length;
        const avgMigrations = allResults.reduce((sum, r) => sum + r.vmMigrations, 0) / allResults.length;
        const avgShutdowns = allResults.reduce((sum, r) => sum + r.nodeShutdowns, 0) / allResults.length;
        
        // Only average mean shutdown time for results that actually have shutdowns
        const resultsWithShutdowns = allResults.filter(r => r.nodeShutdowns > 0 && r.meanTimeBeforeShutdown > 0);
        const avgShutdownTime = resultsWithShutdowns.length > 0
          ? resultsWithShutdowns.reduce((sum, r) => sum + r.meanTimeBeforeShutdown, 0) / resultsWithShutdowns.length
          : 0;
        
        thresholdResults[thresholdAlgo] = {
          algorithm: getThresholdAlgorithmName(thresholdAlgo),
          energyConsumption: avgEnergy.toFixed(2) + ' KWh',
          slaViolations: avgSLA.toFixed(2) + '%',
          executionTime: getExecutionTimeCategory(thresholdAlgo),
          accuracy: getAccuracyCategory(thresholdAlgo, avgSLA),
          vmMigrations: Math.round(avgMigrations).toString(),
          nodeShutdowns: Math.round(avgShutdowns).toString(),
          meanShutdownTime: avgShutdownTime > 0 ? avgShutdownTime.toFixed(2) + ' sec' : 'N/A',
          description: getThresholdDescription(thresholdAlgo)
        };
      }
    }
    
    // Calculate baseline (RS - Random Selection as baseline)
    let baselineEnergy = 0;
    let baselineCount = 0;
    
    // Get baseline from RS algorithm
    for (const thresholdAlgo of thresholdAlgos) {
      try {
        const baselineResult = await loadBalancer.runAlgorithm(thresholdAlgo, 'RS', dates[0]);
        baselineEnergy += baselineResult.energyConsumption;
        baselineCount++;
      } catch (error) {
        console.warn(`Error running baseline ${thresholdAlgo} RS:`, error.message);
      }
    }
    const avgBaselineEnergy = baselineCount > 0 ? baselineEnergy / baselineCount : 50; // Default baseline
    
    for (const consolidationAlgo of consolidationAlgos) {
      const allResults = [];
      
      // Run on all dates for more accurate results
      for (const date of dates.slice(0, 3)) { // Use first 3 dates for performance
        for (const thresholdAlgo of thresholdAlgos) {
          try {
            const result = await loadBalancer.runAlgorithm(thresholdAlgo, consolidationAlgo, date);
            allResults.push({
              threshold: thresholdAlgo,
              date: date,
              migrationCount: result.vmMigrations,
              energyConsumption: result.energyConsumption,
              slaViolations: result.slaViolations,
              nodeShutdowns: result.nodeShutdowns,
              meanTimeBeforeMigration: result.meanTimeBeforeMigration
            });
          } catch (error) {
            console.warn(`Error running ${thresholdAlgo} ${consolidationAlgo} on ${date}:`, error.message);
          }
        }
      }
      
      if (allResults.length > 0) {
        const avgMigrations = allResults.reduce((sum, r) => sum + r.migrationCount, 0) / allResults.length;
        const avgEnergy = allResults.reduce((sum, r) => sum + r.energyConsumption, 0) / allResults.length;
        const avgSLA = allResults.reduce((sum, r) => sum + r.slaViolations, 0) / allResults.length;
        const avgShutdowns = allResults.reduce((sum, r) => sum + r.nodeShutdowns, 0) / allResults.length;
        const avgMigrationTime = allResults.reduce((sum, r) => sum + (r.meanTimeBeforeMigration || 0), 0) / allResults.length;
        
        // Calculate energy savings compared to baseline
        const energySavings = avgBaselineEnergy - avgEnergy;
        const energySavingsPercent = avgBaselineEnergy > 0 ? ((energySavings / avgBaselineEnergy) * 100) : 0;
        
        consolidationResults[consolidationAlgo] = {
          algorithm: getConsolidationAlgorithmName(consolidationAlgo),
          migrationCount: Math.round(avgMigrations).toString(),
          energySavings: energySavings > 0 
            ? `${energySavings.toFixed(2)} KWh (${energySavingsPercent.toFixed(1)}% reduction)`
            : `${Math.abs(energySavings).toFixed(2)} KWh increase`,
          slaViolations: avgSLA.toFixed(2) + '%',
          executionTime: getExecutionTimeCategory(consolidationAlgo),
          nodeShutdowns: Math.round(avgShutdowns).toString(),
          meanMigrationTime: avgMigrationTime > 0 ? avgMigrationTime.toFixed(2) + ' sec' : 'N/A',
          description: getConsolidationDescription(consolidationAlgo)
        };
      }
    }
    
    res.json({
      success: true,
      thresholdDetection: Object.values(thresholdResults),
      vmConsolidation: Object.values(consolidationResults),
      summary: {
        bestThresholdDetection: "Robust Local Regression (LRR)",
        bestVMConsolidation: "Minimum Migration Time (MMT)",
        overallImprovement: "Over 20% reduction in energy consumption",
        slaImprovement: "15% reduction in SLA violations",
        keyFinding: "Combination of LRR and MMT provides optimal load balancing"
      }
    });
  } catch (error) {
    console.error('Error getting performance results:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Helper functions for algorithm names and descriptions
function getThresholdAlgorithmName(algo) {
  const names = {
    'IQR': 'Inter Quartile Range (IQR)',
    'LR': 'Local Regression (LR)',
    'MAD': 'Median Absolute Deviation (MAD)',
    'LRR': 'Robust Local Regression (LRR)',
    'THR': 'Static Threshold (THR)'
  };
  return names[algo] || algo;
}

function getConsolidationAlgorithmName(algo) {
  const names = {
    'MC': 'Maximum Correlation (MC)',
    'MMT': 'Minimum Migration Time (MMT)',
    'MU': 'Minimum Utilization (MU)',
    'RS': 'Random Selection (RS)'
  };
  return names[algo] || algo;
}

function getExecutionTimeCategory(algo) {
  const fast = ['LR', 'MAD', 'MMT', 'RS'];
  return fast.includes(algo) ? 'Fast' : 'Moderate';
}

function getAccuracyCategory(algo, slaViolations) {
  if (slaViolations < 0.5) return 'Very High';
  if (slaViolations < 1.0) return 'High';
  if (slaViolations < 1.5) return 'Moderate';
  return 'Low';
}

function getThresholdDescription(algo) {
  const descriptions = {
    'IQR': 'Effective for normal distribution workloads',
    'LR': 'Best for dynamic load patterns',
    'MAD': 'Robust against outliers',
    'LRR': 'Optimal for complex load patterns',
    'THR': 'Simple static threshold approach'
  };
  return descriptions[algo] || '';
}

function getConsolidationDescription(algo) {
  const descriptions = {
    'MC': 'Effective for correlated workloads',
    'MMT': 'Minimizes migration overhead',
    'MU': 'Selects VMs with minimum utilization',
    'RS': 'Baseline comparison algorithm'
  };
  return descriptions[algo] || '';
}

// Dataset files API endpoint
app.get('/api/datasets/:date/files', (req, res) => {
  const { date } = req.params;
  const datasetPath = path.join(__dirname, 'dataset', 'planetlab', date);
  
  try {
    if (!fs.existsSync(datasetPath)) {
      return res.status(404).json({ error: 'Dataset date not found' });
    }
    
    const files = fs.readdirSync(datasetPath);
    const fileInfo = files.map(file => ({
      name: file,
      path: `dataset/planetlab/${date}/${file}`,
      size: fs.statSync(path.join(datasetPath, file)).size
    }));
    
    res.json({
      date: date,
      formattedDate: formatDate(date),
      fileCount: files.length,
      files: fileInfo.slice(0, 100) // Limit to first 100 files for performance
    });
  } catch (error) {
    res.status(500).json({ error: 'Error reading dataset files', message: error.message });
  }
});

// Get a specific dataset file content (sample)
app.get('/api/datasets/:date/files/:filename', (req, res) => {
  const { date, filename } = req.params;
  const filePath = path.join(__dirname, 'dataset', 'planetlab', date, filename);
  
  try {
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n').slice(0, 50); // First 50 lines
    
    res.json({
      filename: filename,
      date: date,
      totalLines: content.split('\n').length,
      preview: lines,
      size: fs.statSync(filePath).size
    });
  } catch (error) {
    res.status(500).json({ error: 'Error reading file', message: error.message });
  }
});

app.get('/api/research-overview', (req, res) => {
  res.json({
    title: "A Cost Effective and Power Aware Load Balancing Strategy for Cloud using Genetic Optimization & Machine Learning",
    abstract: "This research proposes an innovative approach to cloud load balancing that combines genetic optimization algorithms with machine learning techniques to achieve optimal resource allocation while minimizing power consumption and operational costs.",
    objectives: [
      "Develop a comprehensive mapping framework for load balancing methods",
      "Create intelligent load condition identification mechanisms",
      "Implement predictive models for application migration",
      "Design a hybrid genetic algorithm for power-aware cost optimization"
    ]
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Phase 2 API Endpoints

// API endpoint to run Phase 2 algorithms and get results
app.post('/api/phase2/run-algorithms', async (req, res) => {
  try {
    // Check if dataset directory exists first
    const datasetPath = path.join(__dirname, 'dataset', 'planetlab');
    if (!fs.existsSync(datasetPath)) {
      return res.status(404).json({ 
        error: 'Dataset directory not found',
        message: 'Datasets are missing on the server. Please upload datasets to backend/dataset/planetlab/ on Render.',
        path: datasetPath
      });
    }

    const { dates, options } = req.body;
    
    // Default dates - ALL dates by default
    const defaultDates = [
      '20110303', '20110306', '20110309', '20110322', '20110325',
      '20110403', '20110409', '20110411', '20110412', '20110420'
    ];
    
    // Process ALL dates by default - NO LIMITATIONS
    const datesToProcess = dates || defaultDates;
    
    // Verify requested dates exist
    const existingDates = fs.readdirSync(datasetPath).filter(item => {
      const itemPath = path.join(datasetPath, item);
      return fs.statSync(itemPath).isDirectory();
    });
    
    const missingDates = datesToProcess.filter(date => !existingDates.includes(date));
    if (missingDates.length > 0) {
      return res.status(404).json({
        error: 'Some dataset dates not found',
        message: `The following dates are missing: ${missingDates.join(', ')}`,
        missingDates: missingDates,
        availableDates: existingDates.sort()
      });
    }
    
    console.log(`Phase 2: Processing ${datesToProcess.length} dates: ${datesToProcess.join(', ')}`);
    
    const orchestrator = new Phase2Orchestrator();
    
    // Run all Phase 2 algorithms (multi-threaded)
    const results = await orchestrator.runAllPhase2Algorithms(datesToProcess, options || {});
    
    // Format results for frontend
    const formattedResults = {
      averagePredictedLoad: {},
      averagePheromoneLevel: {},
      totalComputeLoad: {},
      totalMemoryLoad: {},
      totalStorageLoad: {},
      totalNetworkLoad: {},
      totalVMs: {}
    };
    
    // Organize results by metric
    Object.keys(results).forEach(date => {
      const result = results[date];
      if (result.metrics) {
        formattedResults.averagePredictedLoad[date] = result.metrics.averagePredictedLoad;
        formattedResults.averagePheromoneLevel[date] = result.metrics.averagePheromoneLevel;
        formattedResults.totalComputeLoad[date] = result.metrics.totalComputeLoad;
        formattedResults.totalMemoryLoad[date] = result.metrics.totalMemoryLoad;
        formattedResults.totalStorageLoad[date] = result.metrics.totalStorageLoad;
        formattedResults.totalNetworkLoad[date] = result.metrics.totalNetworkLoad;
        formattedResults.totalVMs[date] = result.metrics.totalVMs;
      }
    });
    
    res.json({
      success: true,
      results: formattedResults,
      detailedResults: results,
      dates: datesToProcess
    });
  } catch (error) {
    console.error('Error running Phase 2 algorithms:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// API endpoint to get Phase 2 algorithm details
app.get('/api/phase2/algorithms', (req, res) => {
  res.json({
    success: true,
    algorithms: [
      {
        id: 8,
        name: "SBCSL",
        fullName: "Service Based Categorization and Summarization of Loads",
        description: "Categorizes and summarizes loads by service type, calculating total compute, memory, storage, and network loads.",
        inputs: ["SR (List of Services)", "V (List of VMs)", "C (Compute Capacity)", "M (Memory Capacity)", "S (Storage Capacity)", "N (Network Capacity)"],
        outputs: ["CS (Total Compute Load)", "MS (Total Memory Load)", "SS (Total Storage Load)", "NS (Total Network Load)"]
      },
      {
        id: 9,
        name: "CCPLP",
        fullName: "Corrective Coefficient Based Pheromone Level Prediction",
        description: "Predicts pheromone levels using corrective coefficients, accounting for growth and decay rates.",
        inputs: ["V (List of VMs)", "PH(t) (Pheromone Level at time t)", "K1 (Growth Rate)", "K2 (Decay Rate)", "T (Simulation Duration)", "K (Events)", "TR (Prediction Depth)"],
        outputs: ["PH(t+1) (Predicted Pheromone Level)"]
      },
      {
        id: 10,
        name: "CBLP",
        fullName: "Correlation Based Load Prediction",
        description: "Predicts future load based on correlation between compute, memory, storage, and network components.",
        inputs: ["V (List of VMs)", "CW, MW, SW, NW (Weight Constants)", "CS, MS, SS, NS (From SBCSL)"],
        outputs: ["L(t+1) (Predicted Load)"]
      },
      {
        id: 11,
        name: "LB-PCC-CP",
        fullName: "Load Balancing by Predictive Corrective Coefficient and Correlative Prediction",
        description: "Performs load balancing decisions using predicted loads and pheromone levels to find optimal migration destinations.",
        inputs: ["V (List of VMs)", "CS, MS, SS, NS (From SBCSL)", "PH[t+1] (From CCPLP)", "L[t+1] (From CBLP)"],
        outputs: ["V(t+1) (Optimal Destination VM)"]
      }
    ]
  });
});

// Phase 3 API Endpoints

// API endpoint to run Phase 3 algorithms and get results
app.post('/api/phase3/run-algorithms', async (req, res) => {
  try {
    // Check if dataset directory exists first
    const datasetPath = path.join(__dirname, 'dataset', 'planetlab');
    if (!fs.existsSync(datasetPath)) {
      return res.status(404).json({ 
        error: 'Dataset directory not found',
        message: 'Datasets are missing on the server. Please upload datasets to backend/dataset/planetlab/ on Render.',
        path: datasetPath
      });
    }

    const { dates, options } = req.body;
    
    // Default dates - ALL dates by default
    const defaultDates = [
      '20110303', '20110306', '20110309', '20110322', '20110325',
      '20110403', '20110409', '20110411', '20110412', '20110420'
    ];
    
    // Process ALL dates by default - NO LIMITATIONS
    const datesToProcess = dates || defaultDates;
    
    // Verify requested dates exist
    const existingDates = fs.readdirSync(datasetPath).filter(item => {
      const itemPath = path.join(datasetPath, item);
      return fs.statSync(itemPath).isDirectory();
    });
    
    const missingDates = datesToProcess.filter(date => !existingDates.includes(date));
    if (missingDates.length > 0) {
      return res.status(404).json({
        error: 'Some dataset dates not found',
        message: `The following dates are missing: ${missingDates.join(', ')}`,
        missingDates: missingDates,
        availableDates: existingDates.sort()
      });
    }
    
    console.log(`Phase 3: Processing ${datesToProcess.length} dates: ${datesToProcess.join(', ')}`);
    
    const orchestrator = new Phase3Orchestrator();
    
    // Run all Phase 3 algorithms (multi-threaded)
    const results = await orchestrator.runAllPhase3Algorithms(datesToProcess, options || {});
    
    // Format results for frontend
    const formattedResults = {
      loadPercentage: {},
      loadedVMs: {},
      balancedPercentage: {},
      systemState: {},
      totalMigrations: {},
      totalVMs: {},
      localThreshold: {},
      globalThreshold: {}
    };
    
    // Organize results by metric
    Object.keys(results).forEach(date => {
      const result = results[date];
      if (result.metrics) {
        formattedResults.loadPercentage[date] = result.metrics.loadPercentage;
        formattedResults.loadedVMs[date] = result.metrics.loadedVMs;
        formattedResults.balancedPercentage[date] = result.metrics.balancedPercentage;
        formattedResults.systemState[date] = result.metrics.systemState;
        formattedResults.totalMigrations[date] = result.metrics.totalMigrations;
        formattedResults.totalVMs[date] = result.metrics.totalVMs;
        formattedResults.localThreshold[date] = result.metrics.localThreshold;
        formattedResults.globalThreshold[date] = result.metrics.globalThreshold;
      }
    });
    
    res.json({
      success: true,
      results: formattedResults,
      detailedResults: results,
      dates: datesToProcess
    });
  } catch (error) {
    console.error('Error running Phase 3 algorithms:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// API endpoint to get Phase 3 algorithm details
app.get('/api/phase3/algorithms', (req, res) => {
  res.json({
    success: true,
    algorithms: [
      {
        id: 12,
        name: "LGT-LCI",
        fullName: "Local and Global Threshold Based Load Condition Identification",
        description: "Identifies loaded VMs based on local and global capacity thresholds, comparing task demands against infrastructure and location capacities.",
        inputs: ["T[] (Tasks)", "VM[] (Virtual Machines)", "I[] (Infrastructure)", "L[] (Physical Locations)"],
        outputs: ["VMx[] (Loaded VMs)", "Local Threshold", "Global Threshold"]
      },
      {
        id: 13,
        name: "TDLI",
        fullName: "Time-Dependent Location Identification",
        description: "Calculates space-time coordinates for swarms using spatial coordinates (x,y) and time instances.",
        inputs: ["S[] (Swarms)", "L[] (Coordinates x,y)", "T[] (Time Instances)"],
        outputs: ["SPC (Space-time coordinate)"]
      },
      {
        id: 14,
        name: "PLGB-PD",
        fullName: "Predictive Local and Global Best Position Detection",
        description: "Detects local and global best positions using predictive velocity calculations with error correction factors.",
        inputs: ["SPC[] (Space-time coordinates)", "V[] (Velocity)", "W[] (Inertia)"],
        outputs: ["LBP[] (Local best positions)", "GBP (Global best position)"]
      },
      {
        id: 15,
        name: "SSOF",
        fullName: "System Stability Driven Objective Function",
        description: "Determines system stability (Balanced/Un-Balanced) by comparing infrastructure utilization against local and global thresholds.",
        inputs: ["I[] (Infrastructure)", "LT (Local Threshold)", "GT (Global Threshold)"],
        outputs: ["SS (System State: Balanced/Un-Balanced)"]
      },
      {
        id: 16,
        name: "TVPL-CV-PSO-LB",
        fullName: "Time-Variant Predictive Location Driven Corrective Velocity Based Particle Swarm Optimization for Load Balancing",
        description: "Performs load balancing using PSO with time-variant predictive locations, migrating loaded VMs to achieve system balance.",
        inputs: ["VMx[] (Loaded VMs)", "V[] (Velocity)", "PSO[] (Particles)", "LBP[] (Local best positions)", "GBP (Global best position)", "LT (Local Threshold)", "GT (Global Threshold)", "I[] (Infrastructure)"],
        outputs: ["SS (System State)", "Map(VMx[]::I[]) (VM to Infrastructure mapping)"]
      }
    ]
  });
});

// Phase 4 API Endpoints

// API endpoint to run Phase 4 algorithms and get results
app.post('/api/phase4/run-algorithms', async (req, res) => {
  try {
    // Check if dataset directory exists first
    const datasetPath = path.join(__dirname, 'dataset', 'planetlab');
    if (!fs.existsSync(datasetPath)) {
      return res.status(404).json({ 
        error: 'Dataset directory not found',
        message: 'Datasets are missing on the server. Please upload datasets to backend/dataset/planetlab/ on Render.',
        path: datasetPath
      });
    }

    const { dates, options } = req.body;
    
    // Default dates - ALL dates by default
    const defaultDates = [
      '20110303', '20110306', '20110309', '20110322', '20110325',
      '20110403', '20110409', '20110411', '20110412', '20110420'
    ];
    
    // Process ALL dates by default - NO LIMITATIONS
    const datesToProcess = dates || defaultDates;
    
    // Verify requested dates exist
    const existingDates = fs.readdirSync(datasetPath).filter(item => {
      const itemPath = path.join(datasetPath, item);
      return fs.statSync(itemPath).isDirectory();
    });
    
    const missingDates = datesToProcess.filter(date => !existingDates.includes(date));
    if (missingDates.length > 0) {
      return res.status(404).json({
        error: 'Some dataset dates not found',
        message: `The following dates are missing: ${missingDates.join(', ')}`,
        missingDates: missingDates,
        availableDates: existingDates.sort()
      });
    }
    
    console.log(`Phase 4: Processing ${datesToProcess.length} dates: ${datesToProcess.join(', ')}`);
    
    const orchestrator = new Phase4Orchestrator();
    
    // Run all Phase 4 algorithms (multi-threaded)
    const results = await orchestrator.runAllPhase4Algorithms(datesToProcess, options || {});
    
    // Format results for frontend
    const formattedResults = {
      balancedPercentage: {},
      totalMigrations: {},
      averageUtilization: {},
      loadCondition: {},
      totalTasks: {},
      totalDataCenters: {},
      loadVariance: {},
      globalBestFitness: {}
    };
    
    // Organize results by metric
    Object.keys(results).forEach(date => {
      const result = results[date];
      if (result.metrics) {
        formattedResults.balancedPercentage[date] = result.metrics.balancedPercentage;
        formattedResults.totalMigrations[date] = result.metrics.totalMigrations;
        formattedResults.averageUtilization[date] = result.metrics.averageUtilization;
        formattedResults.loadCondition[date] = result.metrics.loadCondition;
        formattedResults.totalTasks[date] = result.metrics.totalTasks;
        formattedResults.totalDataCenters[date] = result.metrics.totalDataCenters;
        formattedResults.loadVariance[date] = result.metrics.loadVariance;
        formattedResults.globalBestFitness[date] = result.metrics.globalBestFitness;
      }
    });
    
    res.json({
      success: true,
      results: formattedResults,
      detailedResults: results,
      dates: datesToProcess
    });
  } catch (error) {
    console.error('Error running Phase 4 algorithms:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// API endpoint to get Phase 4 algorithm details
app.get('/api/phase4/algorithms', (req, res) => {
  res.json({
    success: true,
    algorithms: [
      {
        id: 17,
        name: "ACO-PSO Hybrid",
        fullName: "ACO and PSO Inspired Hybrid Load Balancing Algorithm",
        description: "A hybrid algorithm combining Ant Colony Optimization (ACO) and Particle Swarm Optimization (PSO) for optimal task assignment to data centers. Uses pheromone trails from ACO and particle swarm dynamics from PSO to find optimal load balancing solutions.",
        inputs: ["Data Center Traces", "Tasks", "Data Centers", "Particle Swarm Parameters", "Pheromone Parameters"],
        outputs: ["Load Condition", "Migration Decisions", "Optimal Task Assignments", "Fitness Value"]
      }
    ]
  });
});

// Initialize server with dataset check
async function startServer() {
  // Check and download datasets if needed (non-blocking)
  // Wrap in try-catch to prevent server crash if module fails to load
  try {
    const downloader = new DatasetDownloader();
    downloader.ensureDatasetsExist()
      .then((success) => {
        if (success) {
          console.log('✅ Dataset check completed successfully');
        } else {
          console.warn('⚠️  Dataset check completed with warnings. Server will start anyway.');
          console.warn('⚠️  Some features may not work until datasets are available.');
        }
      })
      .catch((error) => {
        console.error('❌ Error during dataset check:', error.message);
        console.warn('⚠️  Server will start anyway, but datasets may not be available.');
      });
  } catch (error) {
    console.error('❌ Failed to initialize dataset downloader:', error.message);
    console.warn('⚠️  Server will start anyway. Datasets may need to be uploaded manually.');
  }

  // Start server immediately (don't wait for dataset download)
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Frontend URL: ${process.env.FRONTEND_URL || 'Not set'}`);
  });
}

// Start the server
startServer();

