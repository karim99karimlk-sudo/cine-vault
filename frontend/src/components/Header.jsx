import { useState, useEffect } from 'react';
import './header.css';

export default function Header({
  searchQuery = '',
  onSearchChange = () => {},
  watchlistCount = 0,
  activeView = 'discover',
  onSelectView = () => {},
}) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNav = (view) => {
    setMobileMenuOpen(false);
    onSelectView(view);
  };

  return (
    <header className={`cv-header ${isScrolled ? 'scrolled' : ''}`}>
      {/* Logo */}
      <div
        className="cv-logo-container"
        onClick={() => {
          handleNav('discover');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      >
        <span className="cv-logo-icon">🎬</span>
        <span className="cv-logo-text">CineVault</span>
      </div>

      {/* Navigation Links */}
      <ul className={`cv-nav-links ${mobileMenuOpen ? 'active' : ''}`}>
        <li>
          <button
            type="button"
            className={`cv-nav-link ${activeView === 'discover' ? 'active' : ''}`}
            onClick={() => {
              handleNav('discover');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            Home
          </button>
        </li>
        <li>
          <button
            type="button"
            className={`cv-nav-link ${activeView === 'popular' ? 'active' : ''}`}
            onClick={() => handleNav('popular')}
          >
            Popular
          </button>
        </li>
        <li>
          <button
            type="button"
            className={`cv-nav-link ${activeView === 'top_rated' ? 'active' : ''}`}
            onClick={() => handleNav('top_rated')}
          >
            Top Rated
          </button>
        </li>
        <li>
          <button
            type="button"
            className={`cv-nav-link ${activeView === 'upcoming' ? 'active' : ''}`}
            onClick={() => handleNav('upcoming')}
          >
            Upcoming
          </button>
        </li>
        <li>
          <button
            type="button"
            className={`cv-nav-link ${activeView === 'watchlist' ? 'active' : ''}`}
            onClick={() => handleNav('watchlist')}
          >
            My List <span className="cv-badge">{watchlistCount}</span>
          </button>
        </li>
      </ul>

      {/* Header Actions (Search & Profile) */}
      <div className="cv-header-actions">
        <div className="cv-search-box">
          <span className="cv-search-icon">🔍</span>
          <input
            type="text"
            className="cv-search-input"
            placeholder="Search movies..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label="Search movies"
          />
          {searchQuery && (
            <button
              type="button"
              className="cv-search-clear"
              onClick={() => onSearchChange('')}
              aria-label="Clear search"
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        <div className="cv-user-profile" title="My Watchlist" onClick={() => handleNav('watchlist')}>
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120"
            alt="User Avatar"
            className="cv-avatar"
          />
        </div>

        <button
          type="button"
          className="cv-mobile-menu-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? '✕' : '☰'}
        </button>
      </div>
    </header>
  );
}
