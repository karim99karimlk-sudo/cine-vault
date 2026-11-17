import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { searchMovies, getImageUrl } from '../services/tmdb';
import { useDebounce } from '../hooks/useDebounce';
import './header.css';

export default function Header({
  watchlistCount = 0,
  genreMap = {},
  onSelectMovie = () => {},
}) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const debouncedQuery = useDebounce(searchQuery.trim(), 400);
  const searchBoxRef = useRef(null);

  const location = useLocation();
  const [searchParams] = useSearchParams();
  const currentCategory = searchParams.get('category') || 'popular';
  const pathname = location.pathname;

  // Sticky header scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Fetch search results for floating dropdown
  useEffect(() => {
    if (!debouncedQuery) {
      return;
    }

    let isMounted = true;
    searchMovies(debouncedQuery, 1)
      .then((data) => {
        if (!isMounted) return;
        setResults((data.results || []).slice(0, 8));
        setHighlightedIndex(-1);
        setLoading(false);
      })
      .catch(() => {
        if (!isMounted) return;
        setResults([]);
        setHighlightedIndex(-1);
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [debouncedQuery]);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    setHighlightedIndex(-1);
    if (val.trim()) {
      setLoading(true);
      setIsDropdownOpen(true);
    } else {
      setResults([]);
      setLoading(false);
      setIsDropdownOpen(false);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setResults([]);
    setHighlightedIndex(-1);
    setLoading(false);
    setIsDropdownOpen(false);
  };

  const handleSelectResult = (movie) => {
    setIsDropdownOpen(false);
    setHighlightedIndex(-1);
    onSelectMovie(movie);
  };

  const handleInputKeyDown = (e) => {
    if (!isDropdownOpen || results.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev <= 0 ? results.length - 1 : prev - 1));
    } else if (e.key === 'Enter' && highlightedIndex >= 0 && results[highlightedIndex]) {
      e.preventDefault();
      handleSelectResult(results[highlightedIndex]);
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
        <div className="cv-search-box" ref={searchBoxRef}>
          <span className="cv-search-icon">🔍</span>
          <input
            type="text"
            className="cv-search-input"
            placeholder="Search movies & TV shows..."
            value={searchQuery}
            onChange={handleInputChange}
            onKeyDown={handleInputKeyDown}
            onFocus={() => {
              if (searchQuery.trim()) setIsDropdownOpen(true);
            }}
            aria-label="Search movies and TV shows"
            aria-expanded={isDropdownOpen}
          />
          {searchQuery && (
            <button
              type="button"
              className="cv-search-clear"
              onClick={handleClearSearch}
              aria-label="Clear search"
              title="Clear search"
            >
              ✕
            </button>
          )}

          {/* Floating Search Results Dropdown */}
          {isDropdownOpen && searchQuery.trim() && (
            <div className="cv-search-dropdown" role="listbox" aria-label="Search results">
              {loading ? (
                <div className="cv-search-dropdown-status">
                  Searching for "{searchQuery.trim()}"...
                </div>
              ) : results.length === 0 ? (
                <div className="cv-search-dropdown-status">
                  No results found for "{searchQuery.trim()}"
                </div>
              ) : (
                <ul className="cv-search-results-list">
                  {results.map((movie, idx) => {
                    const isTv = movie.media_type === 'tv';
                    const year = movie.release_date ? movie.release_date.slice(0, 4) : 'TBA';
                    const rating =
                      typeof movie.vote_average === 'number' && movie.vote_average > 0
                        ? movie.vote_average.toFixed(1)
                        : 'NR';
                    const primaryGenre =
                      (movie.genre_ids?.[0] && genreMap[movie.genre_ids[0]]) ||
                      (isTv ? 'TV Series' : 'Movie');

                    return (
                      <li key={`${movie.media_type || 'item'}-${movie.id}`}>
                        <button
                          type="button"
                          className={`cv-search-result-item ${idx === highlightedIndex ? 'active' : ''}`}
                          onMouseEnter={() => setHighlightedIndex(idx)}
                          onClick={() => handleSelectResult(movie)}
                        >
                          <img
                            src={getImageUrl(movie.poster_path, 'w185')}
                            alt={movie.title}
                            className="cv-search-result-thumb"
                            loading="lazy"
                          />
                          <div className="cv-search-result-info">
                            <div className="cv-search-result-title">{movie.title}</div>
                            <div className="cv-search-result-meta">
                              <span className={`cv-search-type-tag ${isTv ? 'tv' : 'movie'}`}>
                                {isTv ? 'TV' : 'Movie'}
                              </span>
                              <span>{year}</span>
                              <span>•</span>
                              <span>{primaryGenre}</span>
                              <span>•</span>
                              <span className="cv-search-result-rating">⭐ {rating}</span>
                            </div>
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
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
