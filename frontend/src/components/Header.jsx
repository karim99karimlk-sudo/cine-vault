import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import './header.css';

export default function Header({
  searchQuery = '',
  onSearchChange = () => {},
  watchlistCount = 0,
}) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const currentCategory = searchParams.get('category') || 'popular';
  const pathname = location.pathname;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  const handleSearchInput = (val) => {
    onSearchChange(val);
    if (val.trim() && pathname !== '/' && pathname !== '/movies' && pathname !== '/watchlist') {
      navigate('/movies');
    }
  };

  return (
    <header className={`cv-header ${isScrolled ? 'scrolled' : ''}`}>
      {/* Logo */}
      <Link
        to="/"
        className="cv-logo-container"
        onClick={() => {
          closeMobileMenu();
          onSearchChange('');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      >
        <span className="cv-logo-icon">🎬</span>
        <span className="cv-logo-text">CineVault</span>
      </Link>

      {/* Navigation Links */}
      <ul className={`cv-nav-links ${mobileMenuOpen ? 'active' : ''}`}>
        <li>
          <Link
            to="/"
            className={`cv-nav-link ${pathname === '/' ? 'active' : ''}`}
            onClick={() => {
              closeMobileMenu();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            Home
          </Link>
        </li>
        <li>
          <Link
            to="/movies?category=popular"
            className={`cv-nav-link ${
              pathname === '/movies' && currentCategory === 'popular' ? 'active' : ''
            }`}
            onClick={closeMobileMenu}
          >
            Movies
          </Link>
        </li>
        <li>
          <Link
            to="/movies?category=popular_tv"
            className={`cv-nav-link ${
              pathname === '/movies' && currentCategory === 'popular_tv' ? 'active' : ''
            }`}
            onClick={closeMobileMenu}
          >
            TV Shows
          </Link>
        </li>
        <li>
          <Link
            to="/movies?category=top_rated"
            className={`cv-nav-link ${
              pathname === '/movies' && currentCategory === 'top_rated' ? 'active' : ''
            }`}
            onClick={closeMobileMenu}
          >
            Top Rated
          </Link>
        </li>
        <li>
          <Link
            to="/movies?category=upcoming"
            className={`cv-nav-link ${
              pathname === '/movies' && currentCategory === 'upcoming' ? 'active' : ''
            }`}
            onClick={closeMobileMenu}
          >
            Upcoming
          </Link>
        </li>
        <li>
          <Link
            to="/watchlist"
            className={`cv-nav-link ${pathname === '/watchlist' ? 'active' : ''}`}
            onClick={closeMobileMenu}
          >
            My List <span className="cv-badge">{watchlistCount}</span>
          </Link>
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
            onChange={(e) => handleSearchInput(e.target.value)}
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

        <Link to="/watchlist" className="cv-user-profile" title="My Watchlist" onClick={closeMobileMenu}>
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120"
            alt="User Avatar"
            className="cv-avatar"
          />
        </Link>

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
