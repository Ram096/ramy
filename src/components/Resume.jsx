import React from 'react';
import './Resume.css';
import { BookOpen, Code, Briefcase, Award } from 'lucide-react';

const Resume = () => {
  return (
    <section id="resume" className="resume-section">
      <div className="container">
        <h2 className="section-title">Resume</h2>

        <div className="resume-grid">
          {/* Education */}
          <div className="resume-category">
            <div className="category-header">
              <BookOpen className="icon" size={24} />
              <h3>Education</h3>
            </div>
            <div className="resume-item">
              <h4>University of Colorado Boulder</h4>
              <p className="subtitle">Bachelors (Computer Science) • Minor in Mathematics</p>
              <p className="date">2021 - 2024</p>
              <p className="details">Relevant coursework: algorithms, computer systems, data mining, object-oriented analysis, fundamentals of human computer interaction, database systems.</p>
            </div>
          </div>

          {/* Technical Skills */}
          <div className="resume-category">
            <div className="category-header">
              <Code className="icon" size={24} />
              <h3>Technical Skills</h3>
            </div>
            <div className="skills-grid">
              <div className="skill-group">
                <span className="skill-label">Languages</span>
                <p>Python, C, C++, Java, JavaScript</p>
              </div>
              <div className="skill-group">
                <span className="skill-label">Web</span>
                <p>Django, React, NodeJS, HTML/CSS</p>
              </div>
              <div className="skill-group">
                <span className="skill-label">Databases</span>
                <p>MySQL, SQLite, MongoDB</p>
              </div>
              <div className="skill-group">
                <span className="skill-label">Tools</span>
                <p>Docker, GitHub, Ubuntu, Figma, Jupyter Notebook, VS Code, PyCharm</p>
              </div>
            </div>
          </div>

          {/* Experience */}
          <div className="resume-category full-width">
            <div className="category-header">
              <Briefcase className="icon" size={24} />
              <h3>Experience</h3>
            </div>

            <div className="experience-list">
              <div className="resume-item">
                <div className="item-header">
                  <h4>Vertx Partners</h4>
                  <span className="location">Boulder, CO</span>
                </div>
                <p className="subtitle">Software Developer</p>
                <p className="date">10/2024 - current</p>
                <ul className="details-list">
                  <li>Built and optimized a Python desktop application using Pandas and Tkinter.</li>
                  <li>Designed a scalable search engine for DoD infrastructure data, improving performance by 50%.</li>
                  <li>Developed Optix, a full-stack web app (Django, JS, HTML/CSS) for searching and analyzing DoD projects.</li>
                  <li>Implemented dynamic filtering, custom search construction, search history, exports, and analytics.</li>
                </ul>
              </div>

              <div className="resume-item">
                <div className="item-header">
                  <h4>Lavner Education</h4>
                  <span className="location">University of Denver - Denver, CO</span>
                </div>
                <p className="subtitle">IT Intern</p>
                <p className="date">06/2023 - 08/2023</p>
                <ul className="details-list">
                  <li>Configured software and hardware for Python, Scratch, and C++ classes.</li>
                  <li>Supported students in achieving 90%+ average assignment scores.</li>
                  <li>Mentored interns and assisted with technical instruction.</li>
                </ul>
              </div>

              <div className="resume-item">
                <div className="item-header">
                  <h4>CU Night Ride</h4>
                  <span className="location">University of Colorado Boulder - Boulder, CO</span>
                </div>
                <p className="subtitle">Manager</p>
                <p className="date">04/2022 - 03/2024</p>
                <ul className="details-list">
                  <li>Managed nighttime transportation to guarantee college safety. Provided smooth shift operations.</li>
                  <li>Delivered clear and effective communication, effectively representing the UMC.</li>
                  <li>Achievement: Employee of the semester.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Extracurricular */}
          <div className="resume-category full-width">
            <div className="category-header">
              <Award className="icon" size={24} />
              <h3>Extracurricular Activities</h3>
            </div>
            <div className="resume-item">
              <p className="details">Volunteer: Catholic Charities, Chicago Cares, Habitat for humanity, Rebuilding North Florida</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Resume;
