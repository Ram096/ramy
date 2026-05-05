import React from 'react';
import './Hero.css';

const Hero = () => {
  return (
    <section id="home" className="hero">
      <div className="hero-background"></div>
      <div className="container hero-content fade-in">
        <h1 className="hero-title">Ramy Kassam</h1>
        <p className="hero-subtitle">Computer Scientist</p>
        <p className="hero-description">
          I’ve never trusted straight lines.
          Stories don’t move that way… people don’t either.

          So if you’re looking for a beginning, you might not find one here.

          But you might find a moment… and another… and maybe they’ll recognize each other.
        </p>
        <div className="hero-actions">
          <a href="#resume" className="button">View Experience</a>
          <a href="#contact" className="button button-outline">Contact Me</a>
        </div>
      </div>
    </section>
  );
};

export default Hero;