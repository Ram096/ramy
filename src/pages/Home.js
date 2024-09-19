import React from 'react';
import '../styles/Home.css';
import myImage from '../assets/images/image_1.png';
import { Link } from 'react-router-dom';

function Home() {
    return (
    <div className="home-container">
      <div className="home-content">
      <img src={myImage} alt="Ramy Kassam" className="profile-image" />
        <h1>Welcome to My Website!</h1>
        <div className="text-content">
        <p>Hello! I'm Ramy Kassam, a Computer Science student at the University of Colorado Boulder with a passion for programming and technology. I love working on projects that challenge me to think critically and push my skills to the next level.</p>
        <p>On this site, you'll find more about my projects, experience, and interests. Feel free to explore and connect with me via email at raka0023@colorado.edu</p>
        <Link to="https://github.com/Ram096/ramy" className="see-more-link">See more about me →</Link>
        </div>
      </div>
    </div>
  );
}

export default Home;