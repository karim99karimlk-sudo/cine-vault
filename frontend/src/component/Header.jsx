import { useState, useEffect } from 'react';
import './header.css';

export default function Header({
  searchQuery = '',
  onSearchChange = () => {},
  watchlistCount = 0,
  viewingWatchlistOnly = false,
  onSelectWatchlist = () => {},
  onSelectHome = () => {},
  onSelectCategory = () => {},
}) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeNav, setActiveNav] = useState('home');

  // Handle sticky header scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (navKey, callback) => {
    setActiveNav(navKey);
    setMobileMenuOpen(false);
    if (callback) callback();
  };

  return (
    <header className={`cv-header ${isScrolled ? 'scrolled' : ''}`}>
      {/* Logo */}
      <div
        className="cv-logo-container"
        onClick={() => {
          handleNavClick('home', onSelectHome);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      >
        <span className="cv-logo-icon">🎬</span>
        <span className="cv-logo-text">CineVault</span>
      </div>

      {/* Navigation Links */}
      <ul className={`cv-nav-links ${mobileMenuOpen ? 'active' : ''}`}>
        <li>
          <a
            href="#home"
            className={`cv-nav-link ${!viewingWatchlistOnly && activeNav === 'home' ? 'active' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              handleNavClick('home', onSelectHome);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            Home
          </a>
        </li>
        <li>
          <a
            href="#movies"
            className={`cv-nav-link ${!viewingWatchlistOnly && activeNav === 'movies' ? 'active' : ''}`}
            onClick={() => handleNavClick('movies', () => onSelectCategory('All'))}
          >
            Movies
          </a>
        </li>
        <li>
          <a
            href="#movies"
            className={`cv-nav-link ${!viewingWatchlistOnly && activeNav === 'series' ? 'active' : ''}`}
            onClick={() => handleNavClick('series', () => onSelectCategory('Trending'))}
          >
            Series
          </a>
        </li>
        <li>
          <a
            href="#top10"
            className={`cv-nav-link ${!viewingWatchlistOnly && activeNav === 'top10' ? 'active' : ''}`}
            onClick={() => handleNavClick('top10', onSelectHome)}
          >
            Top 10
          </a>
        </li>
        <li>
          <a
            href="#movies"
            className={`cv-nav-link ${viewingWatchlistOnly ? 'active' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              handleNavClick('mylist', onSelectWatchlist);
            }}
          >
            My List <span className="cv-badge">{watchlistCount}</span>
          </a>
        </li>
      </ul>

      {/* Header Actions (Search & Profile) */}
      <div className="cv-header-actions">
        <div className="cv-search-box">
          <span className="cv-search-icon">🔍</span>
          <input
            type="text"
            className="cv-search-input"
            placeholder="Search movies, actors..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        <div className="cv-user-profile" title="User Profile">
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120"
            alt="User Avatar"
            className="cv-avatar"
          />
        </div>

        <button
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
