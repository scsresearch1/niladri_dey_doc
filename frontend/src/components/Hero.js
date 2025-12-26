import React from 'react';
import './Hero.css';

const Hero = ({ researchData }) => {
  return (
    <section className="hero" id="overview">
      <div className="hero-container">
        <div className="hero-content">
          <div className="hero-badge">
            <span className="badge-text">Research Implementation</span>
          </div>
          <h1 className="hero-title">
            {researchData?.title || "A Cost Effective and Power Aware Load Balancing Strategy for Cloud using Genetic Optimization & Machine Learning"}
          </h1>
          <p className="hero-description">
            {researchData?.abstract || "This research proposes an innovative approach to cloud load balancing that combines genetic optimization algorithms with machine learning techniques to achieve optimal resource allocation while minimizing power consumption and operational costs."}
          </p>
          <div className="hero-stats">
            <div className="stat-item">
              <div className="stat-number">4</div>
              <div className="stat-label">Research Phases</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">2</div>
              <div className="stat-label">Optimization Methods</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">100%</div>
              <div className="stat-label">Power Aware</div>
            </div>
          </div>
        </div>
        <div className="hero-visual">
          <div className="scientific-diagram">
            <svg className="diagram-connections" viewBox="0 0 600 500">
              <line x1="150" y1="100" x2="300" y2="250" stroke="#60a5fa" strokeWidth="2" opacity="0.4"/>
              <line x1="450" y1="100" x2="300" y2="250" stroke="#60a5fa" strokeWidth="2" opacity="0.4"/>
              <line x1="150" y1="400" x2="300" y2="250" stroke="#60a5fa" strokeWidth="2" opacity="0.4"/>
              <line x1="450" y1="400" x2="300" y2="250" stroke="#60a5fa" strokeWidth="2" opacity="0.4"/>
            </svg>
            <div className="diagram-node node-top-left">
              <span>Genetic Algorithm</span>
            </div>
            <div className="diagram-node node-top-right">
              <span>Machine Learning</span>
            </div>
            <div className="diagram-node node-center">
              <span>Load Balancing</span>
            </div>
            <div className="diagram-node node-bottom-left">
              <span>Cost Optimization</span>
            </div>
            <div className="diagram-node node-bottom-right">
              <span>Power Awareness</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

