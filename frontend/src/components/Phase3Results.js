import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import './Phase3Results.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

const Phase3Results = ({ phaseId }) => {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [processedDates, setProcessedDates] = useState([]);
  const [numDatesToProcess, setNumDatesToProcess] = useState(3);

  const getMinValuesPerColumn = (data) => {
    const columns = {};
    Object.keys(data).forEach(metric => {
      const values = Object.values(data[metric]).filter(v => typeof v === 'number' && !isNaN(v));
      if (values.length > 0) {
        columns[metric] = Math.min(...values);
      }
    });
    return columns;
  };

  const isMinValue = (value, metric, minValues) => {
    if (typeof value !== 'number' || isNaN(value)) return false;
    return minValues[metric] !== undefined && Math.abs(value - minValues[metric]) < 0.0001;
  };

  const runAlgorithms = async () => {
    setLoading(true);
    setError(null);
    setResults(null);
    setProcessedDates([]);

    try {
      const defaultDates = [
        '20110303', '20110306', '20110309', '20110322', '20110325',
        '20110403', '20110409', '20110411', '20110412', '20110420'
      ];

      const datesToProcess = numDatesToProcess === 'all' 
        ? defaultDates 
        : defaultDates.slice(0, numDatesToProcess);

      console.log(`Phase 3: Running algorithms on ${datesToProcess.length} dates...`);

      const response = await axios.post('/api/phase3/run-algorithms', {
        dates: datesToProcess,
        options: {}
      });

      if (response.data.success) {
        setResults(response.data.results);
        setProcessedDates(datesToProcess);
        console.log('Phase 3: Algorithm execution completed', response.data.results);
      } else {
        throw new Error(response.data.error || 'Failed to execute algorithms');
      }
    } catch (err) {
      console.error('Phase 3: Error running algorithms:', err);
      setError(err.response?.data?.error || err.message || 'Failed to execute Phase 3 algorithms');
    } finally {
      setLoading(false);
    }
  };

  const formatValue = (value) => {
    if (typeof value === 'number') {
      if (value >= 1000) {
        return value.toFixed(0);
      } else if (value >= 1) {
        return value.toFixed(2);
      } else {
        return value.toFixed(4);
      }
    }
    return value;
  };

  const getMetricClass = (value, metric, minValues) => {
    if (isMinValue(value, metric, minValues)) {
      return 'min-value-cell';
    }
    return '';
  };

  useEffect(() => {
    // Auto-run algorithms when component mounts (optional)
    // runAlgorithms();
  }, []);

  if (!results && !loading && !error) {
    return (
      <div className="phase3-results-container">
        <div className="phase3-results-header">
          <h3>Phase 3 Algorithm Execution & Results</h3>
          <div className="phase3-controls">
            <label>
              Process Dates:
              <select 
                value={numDatesToProcess} 
                onChange={(e) => setNumDatesToProcess(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                disabled={loading}
              >
                <option value={3}>3 dates</option>
                <option value={5}>5 dates</option>
                <option value={10}>10 dates</option>
                <option value="all">All dates</option>
              </select>
            </label>
            <button 
              onClick={runAlgorithms} 
              disabled={loading}
              className="run-algorithms-btn"
            >
              Run Phase 3 Algorithms
            </button>
          </div>
        </div>
        <div className="phase3-info">
          <p>Click "Run Phase 3 Algorithms" to execute all Phase 3 algorithms:</p>
          <ul>
            <li><strong>LGT-LCI:</strong> Local and Global Threshold Based Load Condition Identification</li>
            <li><strong>TDLI:</strong> Time-Dependent Location Identification</li>
            <li><strong>PLGB-PD:</strong> Predictive Local and Global Best Position Detection</li>
            <li><strong>SSOF:</strong> System Stability Driven Objective Function</li>
            <li><strong>TVPL-CV-PSO-LB:</strong> Time-Variant Predictive Location Driven Corrective Velocity Based PSO for Load Balancing</li>
          </ul>
        </div>
      </div>
    );
  }

  const minValues = results ? getMinValuesPerColumn(results) : {};

  const chartData = results && processedDates.length > 0 ? {
    labels: processedDates.map(d => {
      const year = d.substring(0, 4);
      const month = d.substring(4, 6);
      const day = d.substring(6, 8);
      return `${year}-${month}-${day}`;
    }),
    datasets: [
      {
        label: 'Load Percentage (%)',
        data: processedDates.map(d => results.loadPercentage?.[d] || 0),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      },
      {
        label: 'Balanced Percentage (%)',
        data: processedDates.map(d => results.balancedPercentage?.[d] || 0),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      }
    ]
  } : null;

  const migrationsChartData = results && processedDates.length > 0 ? {
    labels: processedDates.map(d => {
      const year = d.substring(0, 4);
      const month = d.substring(4, 6);
      const day = d.substring(6, 8);
      return `${year}-${month}-${day}`;
    }),
    datasets: [
      {
        label: 'Total Migrations',
        data: processedDates.map(d => results.totalMigrations?.[d] || 0),
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1
      }
    ]
  } : null;

  return (
    <div className="phase3-results-container">
      <div className="phase3-results-header">
        <h3>Phase 3 Algorithm Execution & Results</h3>
        <div className="phase3-controls">
          <label>
            Process Dates:
            <select 
              value={numDatesToProcess} 
              onChange={(e) => setNumDatesToProcess(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
              disabled={loading}
            >
              <option value={3}>3 dates</option>
              <option value={5}>5 dates</option>
              <option value={10}>10 dates</option>
              <option value="all">All dates</option>
            </select>
          </label>
          <button 
            onClick={runAlgorithms} 
            disabled={loading}
            className="run-algorithms-btn"
          >
            {loading ? 'Running...' : 'Run Phase 3 Algorithms'}
          </button>
        </div>
      </div>

      {loading && (
        <div className="phase3-loading">
          <div className="loading-spinner"></div>
          <p>Executing Phase 3 algorithms with multi-threading...</p>
          <p className="loading-note">This may take a few minutes. Processing all datasets...</p>
        </div>
      )}

      {error && (
        <div className="phase3-error">
          <h4>Error</h4>
          <p>{error}</p>
          <button onClick={runAlgorithms}>Try Again</button>
        </div>
      )}

      {results && processedDates.length > 0 && (
        <>
          <div className="phase3-table-container">
            <h4>Phase 3 Performance Metrics</h4>
            <table className="phase3-results-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Total VMs</th>
                  <th>Loaded VMs</th>
                  <th>Load Percentage (%)</th>
                  <th>Balanced Percentage (%)</th>
                  <th>System State</th>
                  <th>Total Migrations</th>
                  <th>Local Threshold</th>
                  <th>Global Threshold</th>
                </tr>
              </thead>
              <tbody>
                {processedDates.map(date => {
                  const year = date.substring(0, 4);
                  const month = date.substring(4, 6);
                  const day = date.substring(6, 8);
                  const formattedDate = `${year}-${month}-${day}`;

                  return (
                    <tr key={date}>
                      <td>{formattedDate}</td>
                      <td className={getMetricClass(results.totalVMs?.[date], 'totalVMs', minValues)}>
                        {formatValue(results.totalVMs?.[date] || 0)}
                      </td>
                      <td className={getMetricClass(results.loadedVMs?.[date], 'loadedVMs', minValues)}>
                        {formatValue(results.loadedVMs?.[date] || 0)}
                      </td>
                      <td className={getMetricClass(results.loadPercentage?.[date], 'loadPercentage', minValues)}>
                        {formatValue(results.loadPercentage?.[date] || 0)}%
                      </td>
                      <td className={getMetricClass(results.balancedPercentage?.[date], 'balancedPercentage', minValues)}>
                        {formatValue(results.balancedPercentage?.[date] || 0)}%
                      </td>
                      <td>{results.systemState?.[date] || 'N/A'}</td>
                      <td className={getMetricClass(results.totalMigrations?.[date], 'totalMigrations', minValues)}>
                        {formatValue(results.totalMigrations?.[date] || 0)}
                      </td>
                      <td className={getMetricClass(results.localThreshold?.[date], 'localThreshold', minValues)}>
                        {formatValue(results.localThreshold?.[date] || 0)}
                      </td>
                      <td className={getMetricClass(results.globalThreshold?.[date], 'globalThreshold', minValues)}>
                        {formatValue(results.globalThreshold?.[date] || 0)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="phase3-charts">
            {chartData && (
              <div className="chart-container">
                <h4>Load & Balance Metrics</h4>
                <Bar data={chartData} options={{
                  responsive: true,
                  plugins: {
                    legend: { position: 'top' },
                    title: { display: true, text: 'Load Percentage vs Balanced Percentage' }
                  },
                  scales: {
                    y: { beginAtZero: true }
                  }
                }} />
              </div>
            )}

            {migrationsChartData && (
              <div className="chart-container">
                <h4>Migration Metrics</h4>
                <Bar data={migrationsChartData} options={{
                  responsive: true,
                  plugins: {
                    legend: { position: 'top' },
                    title: { display: true, text: 'Total VM Migrations' }
                  },
                  scales: {
                    y: { beginAtZero: true }
                  }
                }} />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Phase3Results;

