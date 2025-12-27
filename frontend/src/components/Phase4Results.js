import React, { useState, useEffect } from 'react';
import api from '../config/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Filler,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import './Phase4Results.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Filler,
  Title,
  Tooltip,
  Legend
);

// AWS-inspired color palette
const AWS_COLORS = {
  primary: '#232F3E',      // AWS Dark Blue
  secondary: '#FF9900',    // AWS Orange
  success: '#146eb4',       // AWS Blue
  info: '#00A1C9',          // AWS Light Blue
  warning: '#FF9900',       // AWS Orange
  danger: '#D13212',        // AWS Red
  chartBlue: '#146eb4',
  chartOrange: '#FF9900',
  chartGreen: '#7AA116',
  chartPurple: '#8C4FFF',
  chartTeal: '#00A1C9',
  background: '#F9FAFB',
  grid: '#E5E7EB',
  text: '#232F3E',
  textSecondary: '#6B7280'
};

const Phase4Results = ({ phaseId }) => {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [processedDates, setProcessedDates] = useState([]);
  const [numDatesToProcess, setNumDatesToProcess] = useState(3);

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

      console.log(`Phase 4: Loading pre-calculated results for ${datesToProcess.length} dates...`);

      const response = await api.post('/api/phase4/run-algorithms', {
        dates: datesToProcess,
        options: {}
      });

      if (response.data.success) {
        setResults(response.data.results);
        setProcessedDates(datesToProcess);
        console.log('Phase 4: Results loaded successfully', response.data.results);
      } else {
        throw new Error(response.data.error || 'Failed to load results');
      }
    } catch (err) {
      console.error('Phase 4: Error loading results:', err);
      setError(err.response?.data?.error || err.message || 'Failed to load Phase 4 results');
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

  const formatDate = (dateStr) => {
    const year = dateStr.substring(0, 4);
    const month = dateStr.substring(4, 6);
    const day = dateStr.substring(6, 8);
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    // Auto-load results when component mounts
    runAlgorithms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Extract data for charts (handle new structure: results.metricName.algorithmName.date)
  const getMetricData = (metricName) => {
    if (!results || !results[metricName]) return [];
    const algoName = Object.keys(results[metricName])[0] || 'ACOPSOHybrid';
    return processedDates.map(date => {
      const value = results[metricName][algoName]?.[date];
      return typeof value === 'number' ? value : 0;
    });
  };

  // AWS-style chart options
  const awsChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            family: 'system-ui, -apple-system, sans-serif',
            size: 12,
            weight: 500
          },
          color: AWS_COLORS.text
        }
      },
      tooltip: {
        backgroundColor: 'rgba(35, 47, 62, 0.95)',
        padding: 12,
        titleFont: {
          size: 13,
          weight: 600
        },
        bodyFont: {
          size: 12
        },
        borderColor: AWS_COLORS.grid,
        borderWidth: 1,
        cornerRadius: 6,
        displayColors: true,
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += formatValue(context.parsed.y);
              if (label.includes('Percentage') || label.includes('Utilization')) {
                label += '%';
              }
            }
            return label;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: true,
          color: AWS_COLORS.grid,
          drawBorder: false
        },
        ticks: {
          color: AWS_COLORS.textSecondary,
          font: {
            size: 11
          }
        }
      },
      y: {
        grid: {
          display: true,
          color: AWS_COLORS.grid,
          drawBorder: false
        },
        ticks: {
          color: AWS_COLORS.textSecondary,
          font: {
            size: 11
          },
          callback: function(value) {
            return formatValue(value);
          }
        },
        beginAtZero: true
      }
    }
  };

  // Prepare chart data
  const dateLabels = processedDates.map(formatDate);
  const balancedPercentageData = getMetricData('balancedPercentage');
  const averageUtilizationData = getMetricData('averageUtilization');
  const loadVarianceData = getMetricData('loadVariance');
  const migrationCountData = getMetricData('migrationCount');
  const fitnessScoreData = getMetricData('fitnessScore');

  // Main dashboard chart - Multiple metrics overlay (AWS style)
  const dashboardChartData = {
    labels: dateLabels,
    datasets: [
      {
        label: 'Balanced Percentage (%)',
        data: balancedPercentageData,
        borderColor: AWS_COLORS.chartBlue,
        backgroundColor: `${AWS_COLORS.chartBlue}20`,
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: AWS_COLORS.chartBlue,
        yAxisID: 'y'
      },
      {
        label: 'Average Utilization (%)',
        data: averageUtilizationData,
        borderColor: AWS_COLORS.chartOrange,
        backgroundColor: `${AWS_COLORS.chartOrange}20`,
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: AWS_COLORS.chartOrange,
        yAxisID: 'y'
      },
      {
        label: 'Load Variance',
        data: loadVarianceData,
        borderColor: AWS_COLORS.chartGreen,
        backgroundColor: `${AWS_COLORS.chartGreen}20`,
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: AWS_COLORS.chartGreen,
        yAxisID: 'y1'
      }
    ]
  };

  const dashboardChartOptions = {
    ...awsChartOptions,
    scales: {
      ...awsChartOptions.scales,
      y: {
        ...awsChartOptions.scales.y,
        position: 'left',
        title: {
          display: true,
          text: 'Percentage (%)',
          color: AWS_COLORS.textSecondary,
          font: { size: 11 }
        }
      },
      y1: {
        ...awsChartOptions.scales.y,
        position: 'right',
        title: {
          display: true,
          text: 'Variance',
          color: AWS_COLORS.textSecondary,
          font: { size: 11 }
        },
        grid: {
          display: false
        }
      }
    }
  };

  // Migration count chart
  const migrationChartData = {
    labels: dateLabels,
    datasets: [
      {
        label: 'Migration Count',
        data: migrationCountData,
        backgroundColor: AWS_COLORS.chartPurple,
        borderColor: AWS_COLORS.chartPurple,
        borderWidth: 1,
        borderRadius: 4
      }
    ]
  };

  // Fitness score chart
  const fitnessChartData = {
    labels: dateLabels,
    datasets: [
      {
        label: 'Fitness Score',
        data: fitnessScoreData,
        borderColor: AWS_COLORS.chartTeal,
        backgroundColor: `${AWS_COLORS.chartTeal}20`,
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: AWS_COLORS.chartTeal
      }
    ]
  };

  if (!results && !loading && !error) {
    return (
      <div className="phase4-results-container">
        <div className="phase4-results-header">
          <h3>Phase 4 Algorithm Results</h3>
          <div className="phase4-controls">
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
              Load Results
            </button>
          </div>
        </div>
        <div className="phase4-info">
          <p>Click "Load Results" to view Phase 4 ACO-PSO Hybrid algorithm results.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="phase4-results-container">
      <div className="phase4-results-header">
        <h3>Phase 4 Algorithm Results</h3>
        <div className="phase4-controls">
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
            {loading ? 'Loading...' : 'Refresh Results'}
          </button>
        </div>
      </div>

      {loading && (
        <div className="phase4-loading">
          <div className="loading-spinner"></div>
          <p>Loading pre-calculated results...</p>
        </div>
      )}

      {error && (
        <div className="phase4-error">
          <h4>Error</h4>
          <p>{error}</p>
          <button onClick={runAlgorithms}>Try Again</button>
        </div>
      )}

      {results && processedDates.length > 0 && (
        <>
          {/* AWS-style Dashboard Cards */}
          <div className="aws-metrics-grid">
            <div className="aws-metric-card">
              <div className="aws-metric-header">
                <span className="aws-metric-label">Balanced Percentage</span>
                <span className="aws-metric-value">
                  {formatValue(balancedPercentageData.reduce((a, b) => a + b, 0) / balancedPercentageData.length || 0)}%
                </span>
              </div>
              <div className="aws-metric-trend">
                <span className="trend-indicator positive">↑</span>
                <span>Average across dates</span>
              </div>
            </div>

            <div className="aws-metric-card">
              <div className="aws-metric-header">
                <span className="aws-metric-label">Average Utilization</span>
                <span className="aws-metric-value">
                  {formatValue(averageUtilizationData.reduce((a, b) => a + b, 0) / averageUtilizationData.length || 0)}%
                </span>
              </div>
              <div className="aws-metric-trend">
                <span className="trend-indicator neutral">→</span>
                <span>Average across dates</span>
              </div>
            </div>

            <div className="aws-metric-card">
              <div className="aws-metric-header">
                <span className="aws-metric-label">Total Migrations</span>
                <span className="aws-metric-value">
                  {migrationCountData.reduce((a, b) => a + b, 0)}
                </span>
              </div>
              <div className="aws-metric-trend">
                <span className="trend-indicator positive">↓</span>
                <span>Low migration count</span>
              </div>
            </div>

            <div className="aws-metric-card">
              <div className="aws-metric-header">
                <span className="aws-metric-label">Avg Fitness Score</span>
                <span className="aws-metric-value">
                  {formatValue(fitnessScoreData.reduce((a, b) => a + b, 0) / fitnessScoreData.length || 0)}
                </span>
              </div>
              <div className="aws-metric-trend">
                <span className="trend-indicator neutral">→</span>
                <span>Optimization metric</span>
              </div>
            </div>
          </div>

          {/* Main Dashboard Chart - AWS Style */}
          <div className="aws-chart-card">
            <div className="aws-chart-header">
              <h4>Load Balancing Metrics Overview</h4>
              <span className="aws-chart-subtitle">Balanced Percentage, Utilization, and Load Variance</span>
            </div>
            <div className="aws-chart-body">
              <Line data={dashboardChartData} options={dashboardChartOptions} />
            </div>
          </div>

          {/* Secondary Charts Grid */}
          <div className="aws-charts-grid">
            <div className="aws-chart-card">
              <div className="aws-chart-header">
                <h4>Migration Count</h4>
                <span className="aws-chart-subtitle">Task migrations per date</span>
              </div>
              <div className="aws-chart-body">
                <Bar data={migrationChartData} options={awsChartOptions} />
              </div>
            </div>

            <div className="aws-chart-card">
              <div className="aws-chart-header">
                <h4>Fitness Score</h4>
                <span className="aws-chart-subtitle">Algorithm optimization fitness</span>
              </div>
              <div className="aws-chart-body">
                <Line data={fitnessChartData} options={awsChartOptions} />
              </div>
            </div>
          </div>

          {/* Data Table */}
          <div className="phase4-table-container">
            <h4>Detailed Metrics Table</h4>
            <table className="phase4-results-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Balanced %</th>
                  <th>Avg Utilization %</th>
                  <th>Load Variance</th>
                  <th>Migrations</th>
                  <th>Fitness Score</th>
                </tr>
              </thead>
              <tbody>
                {processedDates.map((date, idx) => (
                  <tr key={date}>
                    <td>{formatDate(date)}</td>
                    <td>{formatValue(balancedPercentageData[idx])}%</td>
                    <td>{formatValue(averageUtilizationData[idx])}%</td>
                    <td>{formatValue(loadVarianceData[idx])}</td>
                    <td>{migrationCountData[idx]}</td>
                    <td>{formatValue(fitnessScoreData[idx])}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default Phase4Results;
