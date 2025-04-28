import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();

  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!currentUser || !currentUser.name) return 'U';
    
    const nameParts = currentUser.name.split(' ');
    if (nameParts.length >= 2) {
      return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
    }
    return nameParts[0][0].toUpperCase();
  };

  const renderNavLinks = () => (
    <div className="navbar-links">
      <Link to="/dashboard" className={`navbar-link ${isActive('/dashboard') ? 'active' : ''}`}>
        <i className="icon dashboard-icon"></i>
        <span>Dashboard</span>
      </Link>
      <Link to="/search" className={`navbar-link ${isActive('/search') ? 'active' : ''}`}>
        <i className="icon search-icon"></i>
        <span>Find Resources</span>
      </Link>
      <Link to="/locate" className={`navbar-link ${isActive('/locate') ? 'active' : ''}`}>
        <i className="icon locate-icon"></i>
        <span>Resource Locator</span>
      </Link>
      <Link to="/bookmarks" className={`navbar-link ${isActive('/bookmarks') ? 'active' : ''}`}>
        <i className="icon bookmark-icon"></i>
        <span>Bookmarks</span>
      </Link>
      <Link to="/notes" className={`navbar-link ${isActive('/notes') ? 'active' : ''}`}>
        <i className="icon notes-icon"></i>
        <span>Notes</span>
      </Link>
    </div>
  );

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-left">
          <Link to="/dashboard" className="navbar-logo">
            <img src="/assets/logo.jpg" alt="StudySync Logo" className="logo-image" />
            <span>StudySync</span>
          </Link>
        </div>

        <div className="navbar-center">
          {renderNavLinks()}
        </div>

        <div className="navbar-right">
          <form className="search-bar" onSubmit={handleSearch}>
            <input 
              type="text" 
              placeholder="Quick search..." 
              value={searchQuery}
              onChange={handleSearchChange}
            />
            <button type="submit" className="search-button">
              <i className="icon search-icon-small"></i>
            </button>
          </form>
          
          <div className="profile-menu-container">
            <button className="profile-button" onClick={toggleProfileMenu}>
              <div className="profile-avatar">
                <span>{getUserInitials()}</span>
              </div>
            </button>
            
            {isProfileMenuOpen && (
              <div className="profile-dropdown">
                <div className="profile-header">
                  <div className="profile-avatar large">
                    <span>{getUserInitials()}</span>
                  </div>
                  <div className="profile-info">
                    <h4>{currentUser?.name || 'User'}</h4>
                    <p>{currentUser?.email || 'user@example.com'}</p>
                  </div>
                </div>
                <ul className="profile-menu">
                  <li>
                    <button onClick={handleLogout} className="logout-link">
                      <i className="icon logout-icon"></i>
                      <span>Log out</span>
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>

          <button className="mobile-menu-toggle" onClick={toggleMobileMenu}>
            <i className={`icon ${isMobileMenuOpen ? 'close-icon' : 'menu-icon'}`}></i>
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="mobile-menu">
          {renderNavLinks()}
          <form className="search-bar" onSubmit={handleSearch}>
            <input 
              type="text" 
              placeholder="Quick search..." 
              value={searchQuery}
              onChange={handleSearchChange}
            />
            <button type="submit" className="search-button">
              <i className="icon search-icon-small"></i>
            </button>
          </form>
          <div className="profile-dropdown">
            <div className="profile-header">
              <div className="profile-avatar large">
                <span>{getUserInitials()}</span>
              </div>
              <div className="profile-info">
                <h4>{currentUser?.name || 'User'}</h4>
                <p>{currentUser?.email || 'user@example.com'}</p>
              </div>
            </div>
            <ul className="profile-menu">
              <li>
                <button onClick={handleLogout} className="logout-link">
                  <i className="icon logout-icon"></i>
                  <span>Log out</span>
                </button>
              </li>
            </ul>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;