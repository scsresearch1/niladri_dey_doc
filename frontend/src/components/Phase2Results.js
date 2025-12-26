import React, { useState } from 'react';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import './AlgorithmResults.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Phase2Results = ({ phaseId }) => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [selectedMetric, setSelectedMetric] = useState('averagePredictedLoad');
  const [error, setError] = useState(null);
  const [processedDates, setProcessedDates] = useState([]);
  const [numDatesToProcess, setNumDatesToProcess] = useState(10); // Default to ALL dates

  const allDates = [
    '20110303', '20110306', '20110309', '20110322', '20110325',
    '20110403', '20110409', '20110411', '20110412', '20110420'
  ];
  
  // Use processed dates if available, otherwise use all dates
  const dates = processedDates.length > 0 ? processedDates : allDates;

  const formatDate = (dateString) => {
    const year = dateString.substring(0, 4);
    const month = dateString.substring(4, 6);
    const day = dateString.substring(6, 8);
    return `${year}-${month}-${day}`;
  };

  const runAlgorithms = async () => {
    setLoading(true);
    setError(null);
    try {
      // Use selected number of dates (default ALL 10 dates for complete processing)
      const datesToProcess = allDates.slice(0, numDatesToProcess);
      // Increased timeout for full processing: 30 minutes for all dates, 10 min for partial
      const timeoutDuration = numDatesToProcess >= 10 ? 1800000 : 600000;
      
      const response = await axios.post('/api/phase2/run-algorithms', { 
        dates: datesToProcess,
        options: {}
      }, {
        timeout: timeoutDuration
      });
      setResults(response.data.results);
      // Set the dates that were actually processed
      setProcessedDates(response.data.dates || datesToProcess);
      console.log('Phase 2 Algorithm results:', response.data.results);
      console.log('Processed dates:', response.data.dates);
    } catch (err) {
      console.error('Error running Phase 2 algorithms:', err);
      if (err.code === 'ECONNABORTED') {
        const timeoutMinutes = numDatesToProcess >= 10 ? '30' : '10';
        setError(`Algorithm execution timed out after ${timeoutMinutes} minutes. Processing all data may take longer. Check server logs for progress.`);
      } else {
        setError(err.response?.data?.error || 'Failed to run Phase 2 algorithms. Please check dataset files.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getChartData = () => {
    if (!results || !results[selectedMetric]) return null;

    const datesForChart = processedDates.length > 0 ? processedDates : dates;
    const values = datesForChart.map(date => {
      const value = results[selectedMetric][date];
      return value !== undefined && value !== null ? (typeof value === 'number' ? value : parseFloat(value) || 0) : null;
    });

    return {
      labels: datesForChart.map(d => formatDate(d)),
      datasets: [{
        label: getMetricLabel(),
        data: values,
        backgroundColor: '#3b82f6',
        borderColor: '#2563eb',
        borderWidth: 2
      }]
    };
  };

  const getTableData = () => {
    if (!results || !results[selectedMetric]) return [];

    const datesForTable = processedDates.length > 0 ? processedDates : dates;
    return datesForTable.map(date => {
      const value = results[selectedMetric][date];
      if (value === undefined || value === null) {
        return { date, value: 'N/A' };
      }
      const numValue = typeof value === 'number' ? value : parseFloat(value);
      return {
        date,
        value: isNaN(numValue) ? 'N/A' : numValue.toFixed(2)
      };
    });
  };

  // Find minimum values for each date column
  const getMinValuesPerColumn = () => {
    if (!results || !results[selectedMetric]) return {};

    const datesForMin = processedDates.length > 0 ? processedDates : dates;
    let minValue = Infinity;
    let hasData = false;
    
    datesForMin.forEach(date => {
      const value = results[selectedMetric][date];
      if (value !== undefined && value !== null) {
        const numValue = typeof value === 'number' ? value : parseFloat(value);
        if (!isNaN(numValue) && numValue !== 0) {
          hasData = true;
          if (numValue < minValue) {
            minValue = numValue;
          }
        }
      }
    });

    return hasData ? minValue : null;
  };

  // Check if a cell value is the minimum
  const isMinValue = (value) => {
    if (value === 'N/A') return false;
    const minValue = getMinValuesPerColumn();
    if (minValue === null || minValue === undefined) return false;
    const numValue = typeof value === 'number' ? value : parseFloat(value);
    return !isNaN(numValue) && numValue > 0 && Math.abs(numValue - minValue) < 0.01;
  };

  const getMetricLabel = () => {
    const labels = {
      averagePredictedLoad: 'Average Predicted Load',
      averagePheromoneLevel: 'Average Pheromone Level',
      totalComputeLoad: 'Total Compute Load',
      totalMemoryLoad: 'Total Memory Load',
      totalStorageLoad: 'Total Storage Load',
      totalNetworkLoad: 'Total Network Load',
      totalVMs: 'Total VMs (Number)'
    };
    return labels[selectedMetric] || selectedMetric;
  };

  const chartData = getChartData();
  const tableData = getTableData();

  return (
    <div className="algorithm-results">
      <div className="results-header">
        <h2 className="results-title">Phase 2 Algorithm Results</h2>
        <div className="run-controls">
          <div className="dates-selector">
            <label htmlFor="dates-select-phase2">Process Dates:</label>
            <select 
              id="dates-select-phase2"
              value={numDatesToProcess} 
              onChange={(e) => setNumDatesToProcess(parseInt(e.target.value))}
              className="dates-select"
              disabled={loading}
            >
              <option value={10}>All 10 dates (Complete Processing)</option>
              <option value={3}>3 dates (Quick Test Only)</option>
              <option value={5}>5 dates (Partial Test)</option>
            </select>
          </div>
          <button 
            className="run-algorithms-btn" 
            onClick={runAlgorithms}
            disabled={loading}
          >
            {loading ? 'Running Algorithms...' : 'Run Phase 2 Algorithms'}
          </button>
        </div>
      </div>

      {error && (
        <div className="results-error">
          <p>{error}</p>
          <p className="error-note">Note: Make sure dataset files are accessible in backend/dataset/planetlab/</p>
        </div>
      )}

      {loading && (
        <div className="results-loading">
          <div className="loading-spinner"></div>
          <p>Processing Phase 2 algorithms on datasets... This may take a few minutes.</p>
          <div className="loading-info-box">
            <strong>⚡ Multi-Threaded Processing:</strong> Processing <strong>{numDatesToProcess} date(s)</strong> with <strong>ALL files and ALL data points</strong> using <strong>Worker Threads</strong> for parallel execution.
            <br />
            <span className="loading-note">
              {numDatesToProcess >= 10 
                ? 'Using all CPU cores for parallel processing. This may take 10-20 minutes depending on dataset size and CPU cores.'
                : `Processing ${numDatesToProcess} dates using parallel worker threads. For complete results, select "All 10 dates".`}
            </span>
          </div>
          <p className="loading-note">Check server console for progress updates.</p>
        </div>
      )}

      {results && !loading && (
        <>
          <div className="results-info-banner">
            <div className="info-banner-content">
              <span className="info-icon">ℹ️</span>
              <div className="info-text">
                <strong>Processing Status:</strong> Results shown for {processedDates.length} date(s): {processedDates.map(d => formatDate(d)).join(', ')}
                {processedDates.length < allDates.length && (
                  <span className="info-note"> (Only showing processed dates. To process all {allDates.length} dates, modify the backend configuration)</span>
                )}
              </div>
            </div>
          </div>

          <div className="metric-selector">
            <label>Select Metric:</label>
            <select 
              value={selectedMetric} 
              onChange={(e) => setSelectedMetric(e.target.value)}
              className="metric-select"
            >
              <option value="averagePredictedLoad">Average Predicted Load</option>
              <option value="averagePheromoneLevel">Average Pheromone Level</option>
              <option value="totalComputeLoad">Total Compute Load</option>
              <option value="totalMemoryLoad">Total Memory Load</option>
              <option value="totalStorageLoad">Total Storage Load</option>
              <option value="totalNetworkLoad">Total Network Load</option>
              <option value="totalVMs">Total VMs (Number)</option>
            </select>
          </div>

          <div className="results-content">
            <div className="results-table-section">
              <h3 className="section-title">Dataset-wise Description</h3>
              {processedDates.length > 0 && processedDates.length < allDates.length && (
                <div className="dates-warning">
                  <span className="warning-icon">⚠️</span>
                  <span>Showing results for {processedDates.length} processed date(s) only. Unprocessed dates are hidden.</span>
                </div>
              )}
              <div className="table-container">
                <table className="results-data-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>{getMetricLabel()}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableData.map((row, idx) => {
                      const isMin = isMinValue(row.value);
                      return (
                        <tr key={idx}>
                          <td className="algorithm-cell">{formatDate(row.date)}</td>
                          <td 
                            className={isMin ? 'min-value-cell' : (row.value === 'N/A' ? 'no-data-cell' : '')}
                          >
                            {row.value}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="results-chart-section">
              <h3 className="section-title">{getMetricLabel()} Analysis</h3>
              {chartData && (
                <div className="chart-container">
                  <Bar
                    data={chartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          display: true,
                          position: 'top',
                        },
                        title: {
                          display: true,
                          text: getMetricLabel(),
                          font: {
                            size: 16,
                            weight: 'bold'
                          }
                        }
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          title: {
                            display: true,
                            text: getMetricLabel().split('(')[0].trim()
                          }
                        },
                        x: {
                          title: {
                            display: true,
                            text: 'Dataset Dates'
                          }
                        }
                      }
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {!results && !loading && (
        <div className="results-placeholder">
          <p>Click "Run Phase 2 Algorithms" to execute Phase 2 algorithms (SBCSL, CCPLP, CBLP, LB-PCC-CP) on the datasets and view results.</p>
        </div>
      )}
    </div>
  );
};

export default Phase2Results;

