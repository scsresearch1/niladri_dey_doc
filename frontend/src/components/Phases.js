import React, { useState } from 'react';
import './Phases.css';
import PhaseCard from './PhaseCard';
import PhaseDetail from './PhaseDetail';

const Phases = ({ phases }) => {
  const [selectedPhase, setSelectedPhase] = useState(null);

  const handleViewDetails = (phase) => {
    setSelectedPhase(phase);
  };

  const handleCloseDetail = () => {
    setSelectedPhase(null);
  };

  return (
    <>
      <section className="phases" id="phases">
        <div className="phases-container">
          <div className="phases-header">
            <h2 className="phases-title">Research Phases</h2>
            <p className="phases-subtitle">
              Four comprehensive phases demonstrating the progression of load balancing research
            </p>
          </div>
          <div className="phases-grid">
            {phases.map((phase, index) => (
              <PhaseCard 
                key={phase.id} 
                phase={phase} 
                index={index} 
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
          <div className="phases-timeline">
            <div className="timeline-line"></div>
            {phases.map((phase, index) => (
              <div key={phase.id} className="timeline-marker" style={{ left: `${(index * 33.33)}%` }}>
                <div className="marker-dot"></div>
                <div className="marker-label">Phase {phase.id}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
      {selectedPhase && (
        <PhaseDetail phase={selectedPhase} onClose={handleCloseDetail} />
      )}
    </>
  );
};

export default Phases;

