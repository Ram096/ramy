import React from 'react';
import '../styles/Projects.css';
import doughmasterspdf from '../assets/documents/doughmasters.pdf';
import foodmarketpdf from '../assets/documents/Final_Report_Food_MartDataset.pdf'
import studyezpdf from '../assets/documents/studyezpresentation.pdf'
import parkpalpdf from '../assets/documents/parkpal.pdf'
import presentationpizza from '../assets/videos/presentationdoughmasters.mp4';
import presentationstudyez from '../assets/videos/studyezpresentation.mp4'

const projects = [
  {
    title: "Dough Masters",
    subtitle: "A Java-based pizza ordering and management system.",
    description: "A comprehensive ordering and management system designed to streamline the pizza ordering process for both customers and the store. Features include an interactive menu, order management, and inventory tracking. The project simulates 30 days of pizzeria operations and includes a user-friendly app prototype designed in Figma. Built with object-oriented programming principles, Dough Masters provides an efficient solution for managing orders and tracking sales.",
    sourceCodeLink: "https://github.com/Ram096/PROJECT7_OOAD", 
    paperLink: doughmasterspdf, 
    presentationLink: presentationpizza, 
    demoLink: "https://www.figma.com/proto/uzaAIX56zA3xlCM9rZaX1x/Dough-Masters?type=design&node-id=2-22&scaling=min-zoom&page-id=0%3A1&starting-point-node-id=2%3A22",
    extraInfoTwo: "https://www.upmenu.com/blog/pizza-pos-systems/#:~:text=Here%E2%80%99s%20how%20it%20can%20significantly%20benefit%20pizza%20establishments%3A,integrate%20with%20online%20ordering%20systems%20and%20platforms.%20" 
  },
  {
    title: "StudyEz",
    subtitle: "Smart study scheduling and document management based in EJS, CSS and JavaScript",
    description: "StudyEz is an innovative study management tool designed to streamline your learning process. With seamless Google Calendar integration, automatic event creation, and document uploading, it simplifies study scheduling and material management. The platform utilizes a spaced-repetition algorithm to optimize study sessions, ensuring efficient learning and retention. Key features include event notifications, document categorization, and customizable study sessions based on user feedback. StudyEz aims to enhance your study efficiency and support academic success with a user-friendly interface and robust backend.",
    sourceCodeLink: "https://github.com/Ram096/studyez",
    paperLink: studyezpdf,
    presentationLink: presentationstudyez,
  },
  {
    title: "ParkPal",
    subtitle: "Design demo of an application for students on campus to facilitate available parking options",
    description: "Perfect Parking App streamlines the search and reservation of parking spots with real-time availability updates and seamless integration with payment systems. Key features include interactive maps, easy account creation and login, and the ability to pay for parking directly through the app. The platform also supports long-term reservations and personalized AI recommendations based on user preferences. Our user testing revealed the need for enhancements such as a functional menu button for easier navigation and a profile page for managing account details. Overall, the app received positive feedback for its intuitive design and effective parking solutions.",
    paperLink: parkpalpdf,
    demoLink: "https://www.figma.com/proto/vfhGdFQ68q6RuFT11vOcJp/Perfect-Parking?node-id=99-421&node-type=canvas&scaling=scale-down&content-scaling=fixed&page-id=99%3A420&starting-point-node-id=99%3A421",
  },
  {
    title: "Leveraging Data Analytics in FoodMart",
    subtitle: "A python based analisis for strategic retail decision making of a supermarket",
    description: "Our exploration of the Foodmart dataset, a comprehensive repository detailing workforce size, advertisement budgets, and store locations. This project employs advanced data preprocessing, feature engineering, and machine learning techniques to uncover actionable insights. Our aim is to identify key factors influencing gross profit and sales, optimizing retail strategies to enhance profitability and customer satisfaction. Discover how data-driven decisions can transform the retail grocery industry through strategic analysis and forecasting.",
    paperLink: foodmarketpdf,
    extraInfo: "https://www.kaggle.com/datasets/dermisfit/foodmart-dataset",
  },
  {
    title: "Universal Design Hub",
    subtitle: "Website made with HTML and CSS, it explores ways to create environments that are accessible and usable by everyone",
    description: "Discover the power of inclusive design. This website is dedicated to universal design principles, offering insights, resources, and solutions for creating products, environments, and systems that are accessible to everyone. Learn how thoughtful design can remove barriers, improve usability, and ensure equity for individuals of all abilities. Whether you're a designer, developer, or advocate, explore how universal design promotes innovation, accessibility, and a more inclusive world.",
    sourceCodeLink: "https://github.com/Ram096/finalproject", 
    projectLink: "https://ram096.github.io/finalproject/",
  },
  
    // Add more projects as needed
  ];
  
  function Projects() {
    return (
      <div className="projects-container">
      <div className="projects-background-block">
        <h1 className="projects-title">My Projects</h1>
        <div className="projects-list">
          {projects.map((project, index) => (
            <div key={index} className="project-card">
              <h2 className="project-title">{project.title}</h2>
              <p className="project-subtitle">{project.subtitle}</p>
              
              {/* Project links only if they exist */}
              <div className="project-links">
                {project.projectLink && (
                  <a href={project.projectLink} className="project-link" target="_blank" rel="noopener noreferrer">Website</a>
                )}
                {project.sourceCodeLink && (
                  <a href={project.sourceCodeLink} className="project-link" target="_blank" rel="noopener noreferrer">Source Code</a>
                )}
                {project.paperLink && (
                  <a href={project.paperLink} className="project-link" target="_blank" rel="noopener noreferrer">Paper</a>
                )}
                {project.presentationLink && (
                  <a href={project.presentationLink} className="project-link" target="_blank" rel="noopener noreferrer">Presentation</a>
                )}
                {project.demoLink && (
                  <a href={project.demoLink} className="project-link" target="_blank" rel="noopener noreferrer">Demo</a>
                )}
              </div>

              {/* Project description */}
              <p className="project-description">{project.description}</p>

              {/* Additional information, if provided */}
              <div className="project-extra-info">
                {project.extraInfo && (
                  <a href={project.extraInfo} className="extra-info-link">Learn more about the foodmart dataset ↓</a>
                )}
                {project.extraInfoTwo && (
                  <a href={project.extraInfoTwo} className="extra-info-link">Learn about the importance of a pizza management system ↓</a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
    );
  }
  

  
  export default Projects;