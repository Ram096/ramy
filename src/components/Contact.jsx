import React from 'react';
import './Contact.css';
import { Mail, Phone, MapPin, Terminal, Globe } from 'lucide-react';

const Contact = () => {
  return (
    <section id="contact" className="contact-section">
      <div className="container">
        <h2 className="section-title">Contact</h2>
        <div className="contact-content">
          <div className="contact-info">
            <div className="info-item">
              <Mail className="contact-icon" />
              <div>
                <h4>Email</h4>
                <a href="mailto:kassamramy27@outlook.com">kassamramy27@outlook.com</a>
              </div>
            </div>
            <div className="info-item">
              <Phone className="contact-icon" />
              <div>
                <h4>Phone</h4>
                <a href="tel:3053336473">(305) 333-6473</a>
              </div>
            </div>
            <div className="info-item">
              <MapPin className="contact-icon" />
              <div>
                <h4>Location</h4>
                <p>Boulder, CO 80301</p>
              </div>
            </div>
          </div>

          <div className="contact-socials">
            <h4>Connect</h4>
            <div className="social-links">
              <a href="https://github.com/Ram096" target="_blank" rel="noopener noreferrer" className="social-link">
                <Terminal />
                <span>GitHub</span>
              </a>
              {/* Assuming LinkedIn might be standard, added as placeholder */}
              <a href="#" target="_blank" rel="noopener noreferrer" className="social-link">
                <Globe />
                <span>LinkedIn</span>
              </a>
            </div>
          </div>
        </div>

        <footer className="footer">
          <p>© {new Date().getFullYear()} Ramy Kassam. All rights reserved.</p>
        </footer>
      </div>
    </section>
  );
};

export default Contact;
