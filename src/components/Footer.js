import React from 'react';
import '../styles/Footer.css';

function Footer() {
    return (
        <footer className="footer-container">
            <div className="footer-bottom">
                <p>© {new Date().getFullYear()} Website made by me with React.js. Check out the code on github</p>
            </div>
        </footer>
    );
}

export default Footer;