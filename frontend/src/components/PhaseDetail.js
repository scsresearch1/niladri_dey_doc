import React, { useState } from 'react';
import './PhaseDetail.css';
import DatasetViewer from './DatasetViewer';
import AlgorithmResults from './AlgorithmResults';
import Phase2Results from './Phase2Results';
import Phase3Results from './Phase3Results';
import Phase4Results from './Phase4Results';

// Helper function to format date
function formatDate(dateString) {
  const year = dateString.substring(0, 4);
  const month = dateString.substring(4, 6);
  const day = dateString.substring(6, 8);
  return `${year}-${month}-${day}`;
}

const PhaseDetail = ({ phase, onClose }) => {
  const [selectedDatasetDate, setSelectedDatasetDate] = useState(null);

  if (!phase) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'var(--success-green)';
      case 'in-progress':
        return 'var(--warning-orange)';
      case 'pending':
        return 'var(--medium-gray)';
      default:
        return 'var(--medium-gray)';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'in-progress':
        return 'In Progress';
      case 'pending':
        return 'Pending';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="phase-detail-overlay" onClick={onClose}>
      <div className="phase-detail-modal" onClick={(e) => e.stopPropagation()}>
        <button className="phase-detail-close" onClick={onClose}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        
        <div className="phase-detail-header">
          <div className="phase-detail-number">
            <span>{phase.id}</span>
          </div>
          <div className="phase-detail-title-section">
            <h2 className="phase-detail-title">{phase.title}</h2>
            <div className="phase-detail-status" style={{ backgroundColor: getStatusColor(phase.status) + '20', color: getStatusColor(phase.status) }}>
              {getStatusLabel(phase.status)}
            </div>
          </div>
        </div>

        <div className="phase-detail-content">
          <div className="phase-detail-section">
            <h3 className="section-title">Description</h3>
            <p className="section-text">{phase.description}</p>
          </div>

          {phase.conclusion && (
            <div className="phase-detail-section">
              <h3 className="section-title">Conclusion</h3>
              <div className="conclusion-text">
                {phase.conclusion.split('. ').map((sentence, idx, arr) => 
                  sentence.trim() && (
                    <p key={idx} className="conclusion-paragraph">
                      {sentence.trim()}{idx < arr.length - 1 ? '.' : ''}
                    </p>
                  )
                )}
              </div>
            </div>
          )}

          {phase.detailedAlgorithms && phase.detailedAlgorithms.length > 0 && (
            <div className="phase-detail-section">
              <h3 className="section-title">Detailed Algorithms</h3>
              <div className="algorithms-container">
                {phase.detailedAlgorithms.map((algorithm, idx) => (
                  <div key={algorithm.id || idx} className="algorithm-card">
                    <div className="algorithm-header">
                      <span className="algorithm-number">Algorithm - {algorithm.id}</span>
                      <span className="algorithm-category">{algorithm.category}</span>
                    </div>
                    <h4 className="algorithm-name">{algorithm.name}</h4>
                    <ol className="algorithm-steps">
                      {algorithm.steps.map((step, stepIdx) => (
                        <li key={stepIdx} className="algorithm-step">
                          <span className="step-content">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                ))}
              </div>
            </div>
          )}

          {phase.algorithms && phase.algorithms.length > 0 && (
            <div className="phase-detail-section">
              <h3 className="section-title">Hadoop Load Balancing Algorithms</h3>
              <div className="tag-list">
                {phase.algorithms.map((algo, idx) => (
                  <span key={idx} className="tag">{algo}</span>
                ))}
              </div>
            </div>
          )}

          {phase.thresholdPolicies && phase.thresholdPolicies.length > 0 && (
            <div className="phase-detail-section">
              <h3 className="section-title">Threshold Detection Policies</h3>
              <div className="tag-list">
                {phase.thresholdPolicies.map((policy, idx) => (
                  <span key={idx} className="tag">{policy}</span>
                ))}
              </div>
            </div>
          )}

          {phase.vmConsolidationPolicies && phase.vmConsolidationPolicies.length > 0 && (
            <div className="phase-detail-section">
              <h3 className="section-title">VM Consolidation Policies</h3>
              <div className="tag-list">
                {phase.vmConsolidationPolicies.map((policy, idx) => (
                  <span key={idx} className="tag">{policy}</span>
                ))}
              </div>
            </div>
          )}

          {phase.proposedMethods && phase.proposedMethods.length > 0 && (
            <div className="phase-detail-section">
              <h3 className="section-title">Proposed Novel Methods</h3>
              <div className="tag-list">
                {phase.proposedMethods.map((method, idx) => (
                  <span key={idx} className="tag tag-success">{method}</span>
                ))}
              </div>
            </div>
          )}

          {phase.challengesAddressed && phase.challengesAddressed.length > 0 && (
            <div className="phase-detail-section">
              <h3 className="section-title">Challenges Addressed</h3>
              <ul className="outcomes-detail-list">
                {phase.challengesAddressed.map((challenge, idx) => (
                  <li key={idx} className="outcome-detail-item">
                    <span className="outcome-detail-icon">→</span>
                    <span>{challenge}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {phase.limitationsOfExistingMethods && phase.limitationsOfExistingMethods.length > 0 && (
            <div className="phase-detail-section">
              <h3 className="section-title">Limitations of Existing Methods</h3>
              <ul className="outcomes-detail-list">
                {phase.limitationsOfExistingMethods.map((limitation, idx) => (
                  <li key={idx} className="outcome-detail-item">
                    <span className="outcome-detail-icon">⚠</span>
                    <span>{limitation}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}


          {phase.results && phase.results.length > 0 && (
            <div className="phase-detail-section">
              <h3 className="section-title">Results Achieved</h3>
              <div className="tag-list">
                {phase.results.map((result, idx) => (
                  <span key={idx} className="tag tag-success">{result}</span>
                ))}
              </div>
            </div>
          )}

          {phase.keyFeatures && phase.keyFeatures.length > 0 && (
            <div className="phase-detail-section">
              <h3 className="section-title">Key Features</h3>
              <div className="tag-list">
                {phase.keyFeatures.map((feature, idx) => (
                  <span key={idx} className="tag">{feature}</span>
                ))}
              </div>
            </div>
          )}

          {phase.algorithm && (
            <div className="phase-detail-section">
              <h3 className="section-title">Proposed Algorithm</h3>
              <div className="algorithm-badge">
                <span>{phase.algorithm}</span>
              </div>
            </div>
          )}

          {phase.techniques && phase.techniques.length > 0 && (
            <div className="phase-detail-section">
              <h3 className="section-title">Techniques Used</h3>
              <div className="tag-list">
                {phase.techniques.map((technique, idx) => (
                  <span key={idx} className="tag tag-primary">{technique}</span>
                ))}
              </div>
            </div>
          )}

          {phase.keyFindings && phase.keyFindings.length > 0 && (
            <div className="phase-detail-section">
              <h3 className="section-title">Key Findings</h3>
              <ul className="outcomes-detail-list">
                {phase.keyFindings.map((finding, idx) => (
                  <li key={idx} className="outcome-detail-item">
                    <span className="outcome-detail-icon">★</span>
                    <span>{finding}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {phase.keyContributions && phase.keyContributions.length > 0 && (
            <div className="phase-detail-section">
              <h3 className="section-title">Key Contributions</h3>
              <ul className="outcomes-detail-list">
                {phase.keyContributions.map((contribution, idx) => (
                  <li key={idx} className="outcome-detail-item">
                    <span className="outcome-detail-icon">★</span>
                    <span>{contribution}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {phase.improvements && phase.improvements.length > 0 && (
            <div className="phase-detail-section">
              <h3 className="section-title">Performance Improvements</h3>
              <div className="improvements-grid">
                {phase.improvements.map((improvement, idx) => (
                  <div key={idx} className="improvement-card">
                    <div className="improvement-value">{improvement.value}</div>
                    <div className="improvement-metric">{improvement.metric}</div>
                    <div className="improvement-description">{improvement.description}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {phase.benefits && phase.benefits.length > 0 && (
            <div className="phase-detail-section">
              <h3 className="section-title">Key Benefits</h3>
              <ul className="outcomes-detail-list">
                {phase.benefits.map((benefit, idx) => (
                  <li key={idx} className="outcome-detail-item">
                    <span className="outcome-detail-icon">✓</span>
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {(phase.datasets || phase.datasetInfo) && (
            <div className="phase-detail-section">
              <h3 className="section-title">Experimental Setup</h3>
              <div className="experimental-info">
                {phase.datasetInfo && (
                  <>
                    <div className="info-item">
                      <span className="info-label">Dataset Source:</span>
                      <span className="info-value">{phase.datasetInfo.source}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Number of Datasets:</span>
                      <span className="info-value">{phase.datasetInfo.count}</span>
                    </div>
                    {phase.datasetInfo.description && (
                      <div className="info-item">
                        <span className="info-label">Description:</span>
                        <span className="info-description">{phase.datasetInfo.description}</span>
                      </div>
                    )}
                    {phase.datasetInfo.totalFiles && (
                      <div className="info-item">
                        <span className="info-label">Total Files:</span>
                        <span className="info-value">{phase.datasetInfo.totalFiles.toLocaleString()}</span>
                      </div>
                    )}
                    {phase.datasetInfo.dates && phase.datasetInfo.dates.length > 0 && (
                      <div className="info-item">
                        <span className="info-label">Dataset Dates:</span>
                        <div className="dataset-dates">
                          {phase.datasetInfo.dates.map((date, idx) => (
                            <button 
                              key={idx} 
                              className="date-tag date-tag-clickable"
                              onClick={() => setSelectedDatasetDate(date)}
                              title={`View files for ${formatDate(date)}`}
                            >
                              {formatDate(date)}
                            </button>
                          ))}
                        </div>
                        <div className="dataset-note">
                          <small>Click on any date to view dataset files</small>
                        </div>
                      </div>
                    )}
                  </>
                )}
                {phase.datasets && !phase.datasetInfo && (
                  <div className="info-item">
                    <span className="info-label">Datasets:</span>
                    <span className="info-value">{phase.datasets}</span>
                  </div>
                )}
                {phase.metrics && phase.metrics.length > 0 && (
                  <div className="info-item">
                    <span className="info-label">Performance Metrics:</span>
                    <div className="metrics-list">
                      {phase.metrics.map((metric, idx) => (
                        <span key={idx} className="metric-tag">{metric}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {phase.outcomes && phase.outcomes.length > 0 && (
            <div className="phase-detail-section">
              <h3 className="section-title">Key Outcomes</h3>
              <ul className="outcomes-detail-list">
                {phase.outcomes.map((outcome, idx) => (
                  <li key={idx} className="outcome-detail-item">
                    <span className="outcome-detail-icon">✓</span>
                    <span>{outcome}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {phase.id === 1 && (
            <div className="phase-detail-section">
              <h3 className="section-title">Algorithm Execution & Results</h3>
              <div className="algorithm-results-embed">
                <AlgorithmResults phaseId={phase.id} />
              </div>
            </div>
          )}

          {phase.id === 2 && (
            <div className="phase-detail-section">
              <h3 className="section-title">Phase 2 Algorithm Execution & Results</h3>
              <div className="algorithm-results-embed">
                <Phase2Results phaseId={phase.id} />
              </div>
            </div>
          )}

          {phase.id === 3 && (
            <div className="phase-detail-section">
              <h3 className="section-title">Phase 3 Algorithm Execution & Results</h3>
              <div className="algorithm-results-embed">
                <Phase3Results phaseId={phase.id} />
              </div>
            </div>
          )}

          {phase.id === 4 && (
            <div className="phase-detail-section">
              <h3 className="section-title">Phase 4 Algorithm Execution & Results</h3>
              <div className="algorithm-results-embed">
                <Phase4Results phaseId={phase.id} />
              </div>
            </div>
          )}
        </div>
      </div>
      {selectedDatasetDate && (
        <DatasetViewer 
          date={selectedDatasetDate} 
          onClose={() => setSelectedDatasetDate(null)} 
        />
      )}
    </div>
  );
};

export default PhaseDetail;

