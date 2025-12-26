import React from 'react';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer" id="contact">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-section">
            <h3 className="footer-title">Research Implementation</h3>
            <p className="footer-description">
              A comprehensive scientific application demonstrating cost-effective and power-aware load balancing strategies for cloud computing.
            </p>
          </div>
          <div className="footer-section">
            <h4 className="footer-heading">Research Areas</h4>
            <ul className="footer-links">
              <li><a href="#phases">Load Balancing</a></li>
              <li><a href="#phases">Genetic Algorithms</a></li>
              <li><a href="#phases">Machine Learning</a></li>
              <li><a href="#phases">Cloud Optimization</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4 className="footer-heading">Phases</h4>
            <ul className="footer-links">
              <li><a href="#phases">Phase 1: Method Mapping</a></li>
              <li><a href="#phases">Phase 2: Load Identification</a></li>
              <li><a href="#phases">Phase 3: Predictive Strategy</a></li>
              <li><a href="#phases">Phase 4: Hybrid Genetic</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4 className="footer-heading">Contact</h4>
            <div className="footer-contact">
              <div className="contact-person">
                <p className="contact-name">Niladri Sekhar Dey</p>
                <p className="contact-title">Ph.D. Scholar (PART TIME)</p>
              </div>
              <div className="contact-person">
                <p className="contact-name">Dr. S. Hrushikesava Raju</p>
                <p className="contact-title">Associate Professor, Department of CSE</p>
              </div>
              <div className="contact-institution">
                <p className="institution-name">Department of Computer Science and Engineering</p>
                <p className="institution-org">KONERU LAKSHMAIAH EDUCATION FOUNDATION</p>
              </div>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p className="footer-copyright">
            © {currentYear} PhD Research - Load Balancing Strategy. All rights reserved.
          </p>
          <p className="footer-note">
            Scientific Research Implementation
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

