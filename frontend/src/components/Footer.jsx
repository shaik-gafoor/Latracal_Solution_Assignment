import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          {/* Brand Section */}
          <div className="footer-brand">
            <Link to="/" className="footer-logo">
              🎬 MovieReview
            </Link>
            <div className="footer-tagline">
              Your ultimate movie review platform
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="footer-nav">
            <ul className="footer-links">
              <li>
                <Link to="/">Home</Link>
              </li>
              <li>
                <Link to="/movies">Movies</Link>
              </li>
              <li>
                <Link to="/profile">Profile</Link>
              </li>
              <li>
                <Link to="/about">About</Link>
              </li>
              <li>
                <Link to="/contact">Contact</Link>
              </li>
            </ul>
          </nav>

          {/* Social Media */}
          <div className="footer-section">
            <h4 className="footer-heading">Follow Us</h4>
            <div className="social-links">
              <a href="#" className="social-link">
                📘 Facebook
              </a>
              <a href="#" className="social-link">
                🐦 Twitter
              </a>
              <a href="#" className="social-link">
                📷 Instagram
              </a>
              <a href="#" className="social-link">
                📺 YouTube
              </a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>
            &copy; 2025 MovieReview Platform. All rights reserved. | Made with
            ❤️ for movie lovers
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
