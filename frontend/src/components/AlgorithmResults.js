import React, { useState, useEffect } from 'react';
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

const AlgorithmResults = ({ phaseId }) => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [selectedMetric, setSelectedMetric] = useState('energyConsumption');
  const [error, setError] = useState(null);
  const [processedDates, setProcessedDates] = useState([]);
  const [numDatesToProcess, setNumDatesToProcess] = useState(10); // Default to ALL dates

  const allDates = [
    '20110303', '20110306', '20110309', '20110322', '20110325',
    '20110403', '20110409', '20110411', '20110412', '20110420'
  ];
  
  // Use processed dates if available, otherwise use all dates
  const dates = processedDates.length > 0 ? processedDates : allDates;

  const dateLabels = dates.map(date => {
    const year = date.substring(0, 4);
    const month = date.substring(4, 6);
    const day = date.substring(6, 8);
    return `${year}-${month}-${day}`;
  });

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
      
      const response = await axios.post('/api/phase1/run-algorithms', { 
        dates: datesToProcess,
        sampleDates: numDatesToProcess < allDates.length
      }, {
        timeout: timeoutDuration
      });
      setResults(response.data.results);
      // Set the dates that were actually processed
      setProcessedDates(response.data.dates || datesToProcess);
      console.log('Algorithm results:', response.data.results);
      console.log('Processed dates:', response.data.dates);
    } catch (err) {
      console.error('Error running algorithms:', err);
      if (err.code === 'ECONNABORTED') {
        const timeoutMinutes = numDatesToProcess >= 10 ? '30' : '10';
        setError(`Algorithm execution timed out after ${timeoutMinutes} minutes. Processing all data may take longer. Check server logs for progress.`);
      } else {
        setError(err.response?.data?.error || 'Failed to run algorithms. Please check dataset files.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getChartData = () => {
    if (!results || !results[selectedMetric]) return null;

    const algorithms = Object.keys(results[selectedMetric]);
    const colors = [
      '#3b82f6', '#f59e0b', '#6b7280', '#eab308', '#60a5fa',
      '#10b981', '#1e40af', '#92400e', '#374151', '#f97316'
    ];

    // Use processed dates if available, otherwise use all dates
    const datesForChart = processedDates.length > 0 ? processedDates : dates;

    const datasets = datesForChart.map((date, dateIdx) => {
      const data = algorithms.map(algo => {
        const value = results[selectedMetric][algo]?.[date];
        if (value === undefined || value === null) return null;
        return typeof value === 'number' ? value : parseFloat(value) || null;
      });

      return {
        label: formatDate(date),
        data: data,
        backgroundColor: colors[dateIdx % colors.length],
        borderColor: colors[dateIdx % colors.length],
        borderWidth: 1
      };
    });

    return {
      labels: algorithms.map(algo => algo.replace(' ', ' ')),
      datasets: datasets.filter(ds => ds.data.some(v => v !== null && v !== undefined)) // Only include datasets with data
    };
  };

  const getTableData = () => {
    if (!results || !results[selectedMetric]) return [];

    const algorithms = Object.keys(results[selectedMetric]);
    return algorithms.map(algo => {
      const row = { algorithm: algo };
      dates.forEach(date => {
        const value = results[selectedMetric][algo]?.[date];
        if (value === undefined || value === null) {
          row[date] = 'N/A';
        } else {
          const numValue = typeof value === 'number' ? value : parseFloat(value);
          row[date] = isNaN(numValue) ? 'N/A' : numValue.toFixed(2);
        }
      });
      return row;
    });
  };

  // Find minimum values for each date column (only for dates with actual data)
  const getMinValuesPerColumn = () => {
    if (!results || !results[selectedMetric]) return {};

    const algorithms = Object.keys(results[selectedMetric]);
    const minValues = {};

    dates.forEach(date => {
      let minValue = Infinity;
      let hasData = false;
      algorithms.forEach(algo => {
        const value = results[selectedMetric][algo]?.[date];
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
      // Only set min value if we found actual non-zero data
      minValues[date] = (minValue === Infinity || !hasData) ? null : minValue;
    });

    return minValues;
  };

  // Check if a cell value is the minimum for its column
  const isMinValue = (date, value) => {
    if (value === 'N/A') return false;
    const minValues = getMinValuesPerColumn();
    const minValue = minValues[date];
    if (minValue === null || minValue === undefined) return false;
    const numValue = typeof value === 'number' ? value : parseFloat(value);
    return !isNaN(numValue) && numValue > 0 && Math.abs(numValue - minValue) < 0.01; // Use small epsilon for float comparison
  };

  const getMetricLabel = () => {
    const labels = {
      energyConsumption: 'Energy Consumption (KWh)',
      vmMigrations: 'VM Migrations (Number)',
      slaViolations: 'SLA Violations (%)',
      nodeShutdowns: 'Node Shutdowns (Number)',
      meanTimeBeforeShutdown: 'Mean Time Before Shutdown (Sec)',
      meanTimeBeforeMigration: 'Mean Time Before Migration (Sec)'
    };
    return labels[selectedMetric] || selectedMetric;
  };

  const chartData = getChartData();
  const tableData = getTableData();

  return (
    <div className="algorithm-results">
      <div className="results-header">
        <h2 className="results-title">Phase 1 Algorithm Results</h2>
        <div className="run-controls">
          <div className="dates-selector">
            <label htmlFor="dates-select">Process Dates:</label>
            <select 
              id="dates-select"
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
            {loading ? 'Running Algorithms...' : 'Run Algorithms'}
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
          <p>Processing algorithms on datasets... This may take a few minutes.</p>
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
              <option value="energyConsumption">Energy Consumption (KWh)</option>
              <option value="vmMigrations">VM Migrations (Number)</option>
              <option value="slaViolations">SLA Violations (%)</option>
              <option value="nodeShutdowns">Node Shutdowns (Number)</option>
              <option value="meanTimeBeforeShutdown">Mean Time Before Shutdown (Sec)</option>
              <option value="meanTimeBeforeMigration">Mean Time Before Migration (Sec)</option>
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
                      <th>Algorithms</th>
                      {processedDates.length > 0 ? processedDates.map((date, idx) => (
                        <th key={idx}>{formatDate(date)}</th>
                      )) : dates.map((date, idx) => (
                        <th key={idx}>{formatDate(date)}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {tableData.map((row, idx) => (
                      <tr key={idx}>
                        <td className="algorithm-cell">{row.algorithm}</td>
                        {processedDates.length > 0 ? processedDates.map((date, dateIdx) => {
                          const cellValue = row[date] === 'N/A' ? 'N/A' : parseFloat(row[date]);
                          const isMin = isMinValue(date, cellValue);
                          return (
                            <td 
                              key={dateIdx} 
                              className={isMin ? 'min-value-cell' : (row[date] === 'N/A' ? 'no-data-cell' : '')}
                            >
                              {row[date]}
                            </td>
                          );
                        }) : dates.map((date, dateIdx) => {
                          const cellValue = row[date] === 'N/A' ? 'N/A' : parseFloat(row[date]);
                          const isMin = isMinValue(date, cellValue);
                          return (
                            <td 
                              key={dateIdx} 
                              className={isMin ? 'min-value-cell' : (row[date] === 'N/A' ? 'no-data-cell' : '')}
                            >
                              {row[date]}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
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
                          position: 'bottom',
                          labels: {
                            boxWidth: 12,
                            padding: 8,
                            font: {
                              size: 10
                            }
                          }
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
                            text: 'Algorithm Types'
                          },
                          ticks: {
                            maxRotation: 45,
                            minRotation: 45
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
          <p>Click "Run Algorithms" to execute Phase 1 algorithms on the datasets and view results.</p>
        </div>
      )}
    </div>
  );
};

export default AlgorithmResults;

