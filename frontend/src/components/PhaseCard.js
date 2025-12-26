import React from 'react';
import './PhaseCard.css';

const PhaseCard = ({ phase, index, onViewDetails }) => {
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
    <div className="phase-card">
      <div className="phase-card-header">
        <div className="phase-number">
          <span>{phase.id}</span>
        </div>
        <div className="phase-status" style={{ backgroundColor: getStatusColor(phase.status) + '20', color: getStatusColor(phase.status) }}>
          {getStatusLabel(phase.status)}
        </div>
      </div>
      <h3 className="phase-card-title">{phase.title}</h3>
      <p className="phase-card-description">{phase.description}</p>
      <div className="phase-outcomes">
        <h4 className="outcomes-title">Key Outcomes:</h4>
        <ul className="outcomes-list">
          {phase.outcomes?.map((outcome, idx) => (
            <li key={idx} className="outcome-item">
              <span className="outcome-icon">✓</span>
              <span>{outcome}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="phase-card-footer">
        <button className="phase-button" onClick={() => onViewDetails && onViewDetails(phase)}>
          View Details
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default PhaseCard;

