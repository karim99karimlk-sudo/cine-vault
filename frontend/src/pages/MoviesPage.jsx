import { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar } from '@fortawesome/free-solid-svg-icons';
import MovieCard from '../components/MovieCard';
import { SkeletonGrid } from '../components/SkeletonCard';
import { fetchMoviesByCategory, searchMovies } from '../services/tmdb';
import './MoviesPage.css';

const CATEGORY_OPTIONS = [
  { id: 'popular', label: 'Popular Movies', shortLabel: 'Popular' },
  { id: 'trending', label: 'Trending This Week', shortLabel: 'Trending' },
  { id: 'now_playing', label: 'Now Playing in Theaters', shortLabel: 'In Theaters' },
  { id: 'top_rated', label: 'Top Rated Masterpieces', shortLabel: 'Top Rated' },
  { id: 'upcoming', label: 'Upcoming Releases', shortLabel: 'Upcoming' },
  { id: 'popular_tv', label: 'Popular TV Shows', shortLabel: 'TV Shows' },
];

function dedupeMovies(list) {
  const seen = new Set();
  return list.filter((m) => {
    if (!m || !m.id) return false;
    const key = `${m.media_type || 'movie'}-${m.id}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export default function MoviesPage({
  debouncedQuery = '',
  genres = [],
  genreMap = {},
  isInWatchlist = () => false,
  onSelectMovie = () => {},
  onToggleWatchlist = () => {},
}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const category = searchParams.get('category') || 'popular';

  const [selectedGenre, setSelectedGenre] = useState(null);
  const [sortBy, setSortBy] = useState('default'); // 'default' | 'rating' | 'newest'
  const [movies, setMovies] = useState([]);
  const [page, setPage] = useState(2);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [retryTick, setRetryTick] = useState(0);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [category]);

  // Fetch initial 2 pages (40 movies) whenever category or debouncedQuery changes
  useEffect(() => {
    let isMounted = true;

    const loadInitial = async () => {
      try {
        if (debouncedQuery) {
          const page1 = await searchMovies(debouncedQuery, 1);
          if (!isMounted) return;
          const total = Math.min(page1.total_pages || 1, 500);
          let combined = page1.results || [];
          let loadedPage = 1;
          if (total >= 2) {
            const page2 = await searchMovies(debouncedQuery, 2);
            if (!isMounted) return;
            combined = dedupeMovies([...combined, ...(page2.results || [])]);
            loadedPage = 2;
          }
          setMovies(combined);
          setPage(loadedPage);
          setTotalPages(total);
        } else {
          const [page1, page2] = await Promise.all([
            fetchMoviesByCategory(category, 1),
            fetchMoviesByCategory(category, 2),
          ]);
          if (!isMounted) return;
          const combined = dedupeMovies([
            ...(page1.results || []),
            ...(page2.results || []),
          ]);
          setMovies(combined);
          setPage(2);
          setTotalPages(Math.min(page1.total_pages || 1, 500));
        }
        setError(null);
        setLoading(false);
      } catch (err) {
        if (!isMounted) return;
        setError(err.message || 'Failed to load movies.');
        setLoading(false);
      }
    };

    loadInitial();

    return () => {
      isMounted = false;
    };
  }, [category, debouncedQuery, retryTick]);

  const handleCategoryChange = (newCategory) => {
    if (newCategory !== category) {
      setLoading(true);
      setSearchParams({ category: newCategory });
    }
  };

  const handleLoadMore = async () => {
    const nextPage = page + 1;
    setLoadingMore(true);
    setError(null);
    try {
      const data = debouncedQuery
        ? await searchMovies(debouncedQuery, nextPage)
        : await fetchMoviesByCategory(category, nextPage);
      const incoming = data.results || [];
      setMovies((prev) => dedupeMovies([...prev, ...incoming]));
      setPage(data.page || nextPage);
      setTotalPages(Math.min(data.total_pages || 1, 500));
    } catch (err) {
      setError(err.message || 'Failed to load more movies.');
    } finally {
      setLoadingMore(false);
    }
  };

  const filteredMovies = useMemo(() => {
    let result = movies;
    if (selectedGenre !== null) {
      result = result.filter((m) => {
        if (Array.isArray(m.genre_ids)) {
          return m.genre_ids.includes(selectedGenre);
        }
        if (Array.isArray(m.genres)) {
          return m.genres.some((g) => g.id === selectedGenre);
        }
        return false;
      });
    }

    if (sortBy === 'rating') {
      return [...result].sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0));
    }
    if (sortBy === 'newest') {
      return [...result].sort((a, b) => {
        const dateA = a.release_date || '0000-00-00';
        const dateB = b.release_date || '0000-00-00';
        return dateB.localeCompare(dateA);
      });
    }
    return result;
  }, [movies, selectedGenre, sortBy]);

  const activeCategoryObj =
    CATEGORY_OPTIONS.find((c) => c.id === category) || CATEGORY_OPTIONS[0];

  return (
    <div className="cv-container cv-movies-page" style={{ marginTop: '85px' }}>
      {/* Top Bar */}
      <div
        className="cv-actor-topbar"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <Link to="/" className="cv-btn cv-btn-secondary cv-btn-sm">
          ← Back to Home
        </Link>

        {/* Sort Pills */}
        <div className="cv-category-pills">
          <button
            type="button"
            className={`cv-pill-btn ${sortBy === 'default' ? 'active' : ''}`}
            onClick={() => setSortBy('default')}
          >
            Default Order
          </button>
          <button
            type="button"
            className={`cv-pill-btn ${sortBy === 'rating' ? 'active' : ''}`}
            onClick={() => setSortBy('rating')}
          >
            <FontAwesomeIcon icon={faStar} style={{ color: 'var(--accent-gold)', marginRight: '0.35rem' }} />
            Highest Rated
          </button>
          <button
            type="button"
            className={`cv-pill-btn ${sortBy === 'newest' ? 'active' : ''}`}
            onClick={() => setSortBy('newest')}
          >
            📅 Newest First
          </button>
        </div>
      </div>

      {/* Header & Category Switcher */}
      <div className="cv-section-header" style={{ marginBottom: '1.5rem' }}>
        <h1 className="cv-section-title" style={{ marginBottom: 0 }}>
          {debouncedQuery
            ? `Search Results for "${debouncedQuery}"`
            : selectedGenre
            ? `${genreMap[selectedGenre] || 'Genre'} — ${activeCategoryObj.label}`
            : activeCategoryObj.label}
        </h1>

        {!debouncedQuery && (
          <div className="cv-category-pills">
            {CATEGORY_OPTIONS.map((cat) => (
              <button
                key={cat.id}
                type="button"
                className={`cv-pill-btn ${category === cat.id ? 'active' : ''}`}
                onClick={() => handleCategoryChange(cat.id)}
              >
                {cat.shortLabel}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Genre Filter Pills */}
      {genres.length > 0 && (
        <div className="cv-filter-bar">
          <div className="cv-tabs" role="tablist" aria-label="Filter by genre">
            <button
              type="button"
              className={`cv-tab-btn ${selectedGenre === null ? 'active' : ''}`}
              onClick={() => setSelectedGenre(null)}
            >
              All Genres
            </button>
            {genres.map((genre) => (
              <button
                key={genre.id}
                type="button"
                className={`cv-tab-btn ${selectedGenre === genre.id ? 'active' : ''}`}
                onClick={() =>
                  setSelectedGenre((prev) => (prev === genre.id ? null : genre.id))
                }
              >
                {genre.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="cv-error-banner" role="alert">
          <div>
            <strong>⚠️ Connection Issue:</strong> {error}
          </div>
          <button
            type="button"
            className="cv-btn cv-btn-primary cv-btn-sm"
            onClick={() => {
              setLoading(true);
              setRetryTick((t) => t + 1);
            }}
          >
            Retry
          </button>
        </div>
      )}

      {/* Movies Grid */}
      {loading ? (
        <SkeletonGrid count={15} />
      ) : filteredMovies.length === 0 ? (
        <div className="cv-empty-state">
          <div className="cv-empty-icon">🎬</div>
          <h3>No Movies Found</h3>
          <p>No titles matched the current filter criteria.</p>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '0.75rem',
              marginTop: '1rem',
              flexWrap: 'wrap',
            }}
          >
            {selectedGenre !== null && (
              <button
                type="button"
                className="cv-btn cv-btn-secondary cv-btn-sm"
                onClick={() => setSelectedGenre(null)}
              >
                Clear Genre Filter
              </button>
            )}
            {page < totalPages && (
              <button
                type="button"
                className="cv-btn cv-btn-primary cv-btn-sm"
                disabled={loadingMore}
                onClick={handleLoadMore}
              >
                {loadingMore ? 'Loading...' : 'Load More Pages'}
              </button>
            )}
          </div>
        </div>
      ) : (
        <>
          <div className="cv-grid">
            {filteredMovies.map((movie) => (
              <MovieCard
                key={`${movie.media_type || 'movie'}-${movie.id}`}
                movie={movie}
                genreMap={genreMap}
                isSaved={isInWatchlist(movie.id)}
                onSelect={onSelectMovie}
                onToggleWatchlist={onToggleWatchlist}
              />
            ))}
          </div>

          {page < totalPages && (
            <div className="cv-pagination">
              <button
                type="button"
                className="cv-btn cv-btn-primary cv-load-more-btn"
                disabled={loadingMore}
                onClick={handleLoadMore}
              >
                {loadingMore ? 'Loading more movies...' : 'Load More Movies'}
              </button>
              <span className="cv-page-indicator">
                Showing {filteredMovies.length} titles (Page {page} of {totalPages})
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
}
