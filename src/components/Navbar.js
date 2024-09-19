import { useState } from 'react';
import '../styles/Navbar.css';
import { Link } from 'react-router-dom';

function Navbar() {
  const [isActive, setIsActive] = useState(false);

  const toggleActiveClass = () => {
    setIsActive(!isActive);
  };

  const removeActive = () => {
    setIsActive(false);
  };
  
  return (
    <>
      <header className="App-header">
        <nav className="navbar">
      
        <Link to="/" className="logo">Ramy Kassam</Link>
          <ul className={`navMenu ${isActive ? 'active' : ''}`}>
            <li onClick={removeActive}>
              <Link to="/" className="navLink">Home</Link>
            </li>
            <li onClick={removeActive}>
              <Link to="/projects" className="navLink">Projects</Link>
            </li>
            <li onClick={removeActive}>
              <Link to="/blog" className="navLink">Blog</Link>
            </li>
            <li onClick={removeActive}>
              <Link to="/resume" className="navLink">Resume</Link>
            </li>
          </ul>
          <div className={`hamburger ${isActive ? 'active' : ''}`} onClick={toggleActiveClass}>
            <span className="bar"></span>
            <span className="bar"></span>
            <span className="bar"></span>
          </div>
        </nav>
      </header>
    </>
  );
}

export default Navbar;