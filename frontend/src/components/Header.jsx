import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { useAppContext } from "../context/AppContext";

const Header = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();
  const { currentUser, logout, isAuthenticated } = useAuth();
  const { actions } = useAppContext();

  const handleSearch = (query) => {
    // Update the global search state
    actions.setSearchQuery(query);
    // Navigate to movies page if not already there
    if (window.location.pathname !== "/movies") {
      navigate("/movies");
    }
  };

  const handleSearchInput = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    handleSearch(value);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    handleSearch("");
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/movies?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    navigate("/");
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  return (
    <header className="header">
      <div className="header-container">
        {/* Logo */}
        <Link to="/" className="logo">
          <span className="logo-text">🎬 MovieReview</span>
        </Link>

        {/* Search Bar */}
        <form className="search-form" onSubmit={handleSearchSubmit}>
          <div className="search-container">
            <input
              type="text"
              placeholder="Search movies..."
              value={searchQuery}
              onChange={handleSearchInput}
              className="search-input"
            />
            <button
              type="button"
              className="search-btn"
              onClick={searchQuery ? handleClearSearch : handleSearchSubmit}
              title={searchQuery ? "Clear search" : "Search"}
            >
              {searchQuery ? "✕" : "🔍"}
            </button>
          </div>
        </form>

        {/* Navigation */}
        <nav className={`nav ${isMenuOpen ? "nav-open" : ""}`}>
          <Link to="/" className="nav-link">
            Home
          </Link>
          <Link to="/movies" className="nav-link">
            Movies
          </Link>
          <Link to="/profile" className="nav-link">
            Profile
          </Link>
        </nav>

        {/* User Actions */}
        <div className="user-actions">
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDarkMode ? "☀️" : "🌙"}
          </button>

          {isAuthenticated() ? (
            <div className="user-menu">
              <button
                className="user-menu-toggle"
                onClick={toggleUserMenu}
                title={`Logged in as ${currentUser?.name}`}
              >
                <span className="user-avatar">👤</span>
                <span className="user-name">{currentUser?.name}</span>
                <span className="dropdown-arrow">
                  {isUserMenuOpen ? "▲" : "▼"}
                </span>
              </button>

              {isUserMenuOpen && (
                <div className="user-dropdown">
                  <Link
                    to="/profile"
                    className="dropdown-item"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    <span className="dropdown-icon">👤</span>
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="dropdown-item logout-item"
                  >
                    <span className="dropdown-icon">🚪</span>
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="auth-btn login-btn">
                Login
              </Link>
              <Link to="/signup" className="auth-btn signup-btn">
                Sign Up
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="mobile-toggle"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          ☰
        </button>
      </div>
    </header>
  );
};

export default Header;
