import React from 'react';
import '../styles/Footer.css';

function Footer() {
    return (
        <footer className="footer-container">
            <div className="footer-bottom">
                <p>© {new Date().getFullYear()} Site created with React.js by Ramy Kassam</p>
            </div>
        </footer>
    );
}

export default Footer;