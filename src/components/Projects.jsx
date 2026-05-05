import React, { useState, useRef, useEffect } from 'react';
import './Projects.css';
import { ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';

const Projects = () => {
  const projects = [
    {
      title: 'Universal Design Hub',
      role: 'Full Stack Web App',
      description: 'Discover the power of inclusive design. This website is dedicated to universal design principles, offering insights, resources, and solutions for creating products, environments, and systems that are accessible to everyone. Learn how thoughtful design can remove barriers, improve usability, and ensure equity for individuals of all abilities. Whether you\'re a designer, developer, or advocate, explore how universal design promotes innovation, accessibility, and a more inclusive world.',
      tech: ['JS', 'HTML/CSS'],
      links: [
        { label: 'Live Site', url: 'https://ram096.github.io/finalproject/' }
      ]
    },
    {
      title: 'FoodMart Sales Forecasting',
      role: 'Data Analyst',
      description: 'Conducted comprehensive data analysis on the FoodMart dataset, focusing on key metrics such as workforce size, advertisement budget, and gross profit to identify growth opportunities. Presented insights through data visualization.',
      tech: ['Data Analysis', 'Visualization', 'Python', 'Jupyter'],
      links: [
        { label: 'Report', url: 'https://www.overleaf.com/read/qpcxgdjxkckx#1d9666' }
      ]
    },
    {
      title: 'ParkPal Application Design',
      role: 'HCI Project',
      description: 'Conducted usability tests and developed an evaluation script, analyzing feedback from over 50 participants to enhance user experience. Achieved “Most Useful Project” award at the project expo.',
      tech: ['Figma', 'HCI', 'Usability Testing'],
      links: [
        { label: 'Figma Prototype', url: 'https://www.figma.com/proto/vfhGdFQ68q6RuFT11vOcJp/Perfect-Parking?node-id=99-421&node-type=canvas&scaling=scale-down&content-scaling=fixed&page-id=99%3A420&starting-point-node-id=99%3A421' }
      ]
    },
    {
      title: 'Dough Masters',
      role: 'Java-based pizza ordering system',
      description: 'A comprehensive ordering and management system designed to streamline the pizza ordering process for both customers and the store. Features include an interactive menu, order management, and inventory tracking. The project simulates 30 days of pizzeria operations and includes a user-friendly app prototype designed in Figma. Built with object-oriented programming principles, Dough Masters provides an efficient solution for managing orders and tracking sales.',
      tech: ['Java', 'OOP', 'Figma'],
      links: [
        { label: 'Demo', url: 'https://www.figma.com/proto/uzaAIX56zA3xlCM9rZaX1x/Dough-Masters?type=design&node-id=2-22&scaling=min-zoom&page-id=0%3A1&starting-point-node-id=2%3A22' },
        { label: 'Source Code', url: 'https://github.com/Ram096/PROJECT7_OOAD' },
        { label: 'Paper', url: 'https://ram096.github.io/ramy/static/media/doughmasters.fea56c04cb905bada4af.pdf' }
      ]
    }
  ];

  const trackRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (trackRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = trackRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, []);

  const scroll = (direction) => {
    if (trackRef.current) {
      const scrollAmount = trackRef.current.clientWidth > 768 ? 350 : trackRef.current.clientWidth;
      trackRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
      setTimeout(checkScroll, 350);
    }
  };

  return (
    <section id="projects" className="projects-section">
      <div className="container">
        <div className="section-header-with-nav">
          <h2 className="section-title projects-title">Projects</h2>
          {projects.length > 3 && (
            <div className="carousel-nav">
              <button
                className={`nav-button ${!canScrollLeft ? 'disabled' : ''}`}
                onClick={() => scroll('left')}
                disabled={!canScrollLeft}
              >
                <ChevronLeft size={24} />
              </button>
              <button
                className={`nav-button ${!canScrollRight ? 'disabled' : ''}`}
                onClick={() => scroll('right')}
                disabled={!canScrollRight}
              >
                <ChevronRight size={24} />
              </button>
            </div>
          )}
        </div>

        <div className="carousel-container">
          <div
            className="projects-track"
            ref={trackRef}
            onScroll={checkScroll}
          >
            {projects.map((project, index) => (
              <div key={index} className="project-card">
                <div className="project-header">
                  <h3>{project.title}</h3>
                  {project.links && project.links.length > 0 && (
                    <div className="project-links">
                      {project.links.map((link, i) => (
                        <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" className="project-link">
                          <ExternalLink size={16} />
                          <span>{link.label}</span>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
                <p className="project-role">{project.role}</p>
                <p className="project-description">{project.description}</p>
                <div className="project-tech">
                  {project.tech.map((tech, i) => (
                    <span key={i} className="tech-tag">{tech}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Projects;
