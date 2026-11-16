import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import Header from '../components/Header';
import MovieCard from '../components/MovieCard';
import { SkeletonGrid } from '../components/SkeletonCard';
import MovieModal from '../components/MovieModal';
import Footer from '../components/Footer';
import {
  fetchPopularMovies,
  fetchTopRatedMovies,
  fetchUpcomingMovies,
  fetchMoviesByCategory,
  searchMovies,
  fetchGenres,
  getImageUrl,
} from '../services/tmdb';
import { useDebounce } from '../hooks/useDebounce';
import { useWatchlist } from '../hooks/useWatchlist';
import './HomePage.css';

const CATEGORY_LABELS = {
  popular: 'Popular Movies',
  top_rated: 'Top Rated Movies',
  upcoming: 'Upcoming Releases',
};

export function HomePage() {
  // Navigation & filter state
  const [activeView, setActiveView] = useState('discover'); // 'discover' | 'popular' | 'top_rated' | 'upcoming' | 'watchlist'
  const [activeCategory, setActiveCategory] = useState('popular'); // 'popular' | 'top_rated' | 'upcoming'
  const [selectedGenre, setSelectedGenre] = useState(null); // genre ID or null for All
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedQuery = useDebounce(searchQuery.trim(), 400);

  // Genres state
  const [genres, setGenres] = useState([]);
  const genreMap = useMemo(() => {
    const map = {};
    genres.forEach((g) => {
      map[g.id] = g.name;
    });
    return map;
  }, [genres]);

  // Categorized home sections state (Popular, Top Rated, Upcoming)
  const [homeSections, setHomeSections] = useState({
    popular: [],
    topRated: [],
    upcoming: [],
  });
  const [homeLoading, setHomeLoading] = useState(true);
  const [homeError, setHomeError] = useState(null);
  const [homeRetryTick, setHomeRetryTick] = useState(0);

  // Paginated feed state (for active category or search results)
  const [movies, setMovies] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [feedLoading, setFeedLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [feedError, setFeedError] = useState(null);

  // Modal & toast state
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const toastTimerRef = useRef(null);

  // Watchlist hook (localStorage)
  const { watchlist, isInWatchlist, toggleWatchlist } = useWatchlist();

  const showToast = useCallback((text) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToastMessage(text);
    toastTimerRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  const handleToggleWatchlist = useCallback(
    (movie) => {
      const wasSaved = isInWatchlist(movie.id);
      toggleWatchlist(movie);
      showToast(
        wasSaved
          ? `Removed "${movie.title}" from My List`
          : `Added "${movie.title}" to My List`
      );
    },
    [isInWatchlist, toggleWatchlist, showToast]
  );

  // 1. Load genres + initial categorized home sections (Popular, Top Rated, Upcoming)
  useEffect(() => {
    let isMounted = true;

    Promise.all([
      fetchGenres(),
      fetchPopularMovies(1),
      fetchTopRatedMovies(1),
      fetchUpcomingMovies(1),
    ])
      .then(([genreRes, popularRes, topRatedRes, upcomingRes]) => {
        if (!isMounted) return;
        setGenres(genreRes.genres || []);
        setHomeSections({
          popular: popularRes.results || [],
          topRated: topRatedRes.results || [],
          upcoming: upcomingRes.results || [],
        });
        setHomeError(null);
        setHomeLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        setHomeError(err.message || 'Failed to load movies from TMDB.');
        setHomeLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [homeRetryTick]);

  // 2. Load first page of catalog whenever debouncedQuery or activeCategory changes
  useEffect(() => {
    let isMounted = true;

    const request = debouncedQuery
      ? searchMovies(debouncedQuery, 1)
      : fetchMoviesByCategory(activeCategory, 1);

    request
      .then((data) => {
        if (!isMounted) return;
        setMovies(data.results || []);
        setPage(data.page || 1);
        setTotalPages(Math.min(data.total_pages || 1, 500));
        setFeedError(null);
        setFeedLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        setFeedError(err.message || 'Failed to fetch movies.');
        setFeedLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [debouncedQuery, activeCategory]);

  // Handler for "Load More" pagination button
  const handleLoadMore = async () => {
    const nextPage = page + 1;
    setLoadingMore(true);
    setFeedError(null);
    try {
      const data = debouncedQuery
        ? await searchMovies(debouncedQuery, nextPage)
        : await fetchMoviesByCategory(activeCategory, nextPage);

      const incoming = data.results || [];
      setMovies((prev) => {
        const existingIds = new Set(prev.map((m) => m.id));
        const uniqueNew = incoming.filter((m) => !existingIds.has(m.id));
        return [...prev, ...uniqueNew];
      });
      setPage(data.page || nextPage);
      setTotalPages(Math.min(data.total_pages || 1, 500));
    } catch (err) {
      setFeedError(err.message || 'Failed to load more movies.');
    } finally {
      setLoadingMore(false);
    }
  };

  // Handle category change with immediate loading state
  const handleSelectCategory = (category) => {
    if (category !== activeCategory) {
      setFeedLoading(true);
      setActiveCategory(category);
    }
  };

  // Handle header navigation switches
  const handleSelectView = (view) => {
    setActiveView(view);
    if (view === 'popular' || view === 'top_rated' || view === 'upcoming') {
      handleSelectCategory(view);
    }
  };

  // Featured hero movie from popular list
  const heroMovie = homeSections.popular[0] || null;

  // Filter helper by selectedGenre
  const filterByGenre = useCallback(
    (list) => {
      if (!selectedGenre) return list;
      return list.filter((m) => {
        if (Array.isArray(m.genre_ids)) {
          return m.genre_ids.includes(selectedGenre);
        }
        if (Array.isArray(m.genres)) {
          return m.genres.some((g) => g.id === selectedGenre);
        }
        return false;
      });
    },
    [selectedGenre]
  );

  // Filtered movies for the main grid or watchlist
  const displayedMovies = useMemo(() => {
    if (activeView === 'watchlist') {
      const q = debouncedQuery.toLowerCase();
      const matched = watchlist.filter(
        (m) => !q || (m.title && m.title.toLowerCase().includes(q))
      );
      return filterByGenre(matched);
    }
    return filterByGenre(movies);
  }, [activeView, watchlist, debouncedQuery, movies, filterByGenre]);

  const isSearching = debouncedQuery.length > 0;
  const showHero = activeView === 'discover' && !isSearching && !selectedGenre && heroMovie;
  const showCategorizedRows =
    activeView === 'discover' && !isSearching && !selectedGenre && !homeError;

  return (
    <div className="cv-app">
      {/* 1. HEADER */}
      <Header
        searchQuery={searchQuery}
        onSearchChange={(val) => {
          if (val.trim() !== debouncedQuery) {
            setFeedLoading(true);
          }
          setSearchQuery(val);
        }}
        watchlistCount={watchlist.length}
        activeView={activeView}
        onSelectView={handleSelectView}
      />

      {/* 2. HERO BANNER */}
      {homeLoading && activeView === 'discover' && !isSearching && (
        <section className="cv-hero cv-skeleton-hero" aria-hidden="true">
          <div className="cv-hero-content">
            <div className="cv-skeleton-line cv-skeleton-shimmer" style={{ width: '180px', height: '28px', marginBottom: '1rem' }} />
            <div className="cv-skeleton-line cv-skeleton-shimmer" style={{ width: '420px', maxWidth: '90%', height: '54px', marginBottom: '1rem' }} />
            <div className="cv-skeleton-line cv-skeleton-shimmer" style={{ width: '260px', height: '20px', marginBottom: '1.2rem' }} />
            <div className="cv-skeleton-line cv-skeleton-shimmer" style={{ width: '520px', maxWidth: '95%', height: '72px', marginBottom: '2rem' }} />
          </div>
        </section>
      )}

      {showHero && (
        <section className="cv-hero" id="home">
          <div
            className="cv-hero-bg"
            style={{
              backgroundImage: `url('${getImageUrl(heroMovie.backdrop_path || heroMovie.poster_path, 'w1280')}')`,
            }}
          />
          <div className="cv-hero-overlay" />
          <div className="cv-hero-content">
            <div className="cv-hero-badge">🔥 #1 Popular Today</div>
            <h1 className="cv-hero-title">{heroMovie.title}</h1>
            <div className="cv-hero-meta">
              <span className="cv-meta-rating">
                ⭐ {heroMovie.vote_average ? heroMovie.vote_average.toFixed(1) : 'NR'}
              </span>
              <span>{heroMovie.release_date ? heroMovie.release_date.slice(0, 4) : 'TBA'}</span>
              <span className="cv-age-tag">HD</span>
              <span>🗳️ {heroMovie.vote_count?.toLocaleString() || 0} votes</span>
            </div>
            <div className="cv-hero-genres">
              {(heroMovie.genre_ids || []).slice(0, 3).map((gid) =>
                genreMap[gid] ? (
                  <span key={gid} className="cv-genre-tag">
                    {genreMap[gid]}
                  </span>
                ) : null
              )}
            </div>
            <p className="cv-hero-desc">{heroMovie.overview}</p>
            <div className="cv-hero-btns">
              <button
                type="button"
                className="cv-btn cv-btn-primary"
                onClick={() => setSelectedMovie(heroMovie)}
              >
                ▶ Watch Trailer & Info
              </button>
              <button
                type="button"
                className="cv-btn cv-btn-secondary"
                onClick={() => handleToggleWatchlist(heroMovie)}
              >
                {isInWatchlist(heroMovie.id) ? '✓ In My List' : '+ Add to Watchlist'}
              </button>
            </div>
          </div>
        </section>
      )}

      {/* 3. MAIN CONTENT AREA */}
      <main
        className="cv-container"
        id="movies"
        style={!showHero && !(homeLoading && activeView === 'discover' && !isSearching) ? { marginTop: '85px' } : undefined}
      >
        {/* Global Network Error Banner */}
        {(homeError || feedError) && (
          <div className="cv-error-banner" role="alert">
            <div>
              <strong>⚠️ Connection Issue:</strong> {homeError || feedError}
            </div>
            <button
              type="button"
              className="cv-btn cv-btn-primary cv-btn-sm"
              onClick={() => {
                setHomeLoading(true);
                setFeedLoading(true);
                setHomeRetryTick((t) => t + 1);
              }}
            >
              Retry
            </button>
          </div>
        )}

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

        {/* Categorized Discovery Rows (Popular, Top Rated, Upcoming) */}
        {showCategorizedRows && (
          <div className="cv-discovery-sections">
            {[
              { key: 'popular', title: 'Popular Movies', items: homeSections.popular },
              { key: 'top_rated', title: 'Top Rated Masterpieces', items: homeSections.topRated },
              { key: 'upcoming', title: 'Upcoming Releases', items: homeSections.upcoming },
            ].map((section) => (
              <section key={section.key} className="cv-category-block">
                <div className="cv-section-header">
                  <h2 className="cv-section-title" style={{ marginBottom: 0 }}>
                    {section.title}
                  </h2>
                  <button
                    type="button"
                    className="cv-explore-link"
                    onClick={() => {
                      setActiveView(section.key);
                      handleSelectCategory(section.key);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  >
                    Explore All →
                  </button>
                </div>

                {homeLoading ? (
                  <SkeletonGrid count={5} />
                ) : (
                  <div className="cv-grid">
                    {section.items.slice(0, 5).map((movie) => (
                      <MovieCard
                        key={movie.id}
                        movie={movie}
                        genreMap={genreMap}
                        isSaved={isInWatchlist(movie.id)}
                        onSelect={setSelectedMovie}
                        onToggleWatchlist={handleToggleWatchlist}
                      />
                    ))}
                  </div>
                )}
              </section>
            ))}
          </div>
        )}

        {/* Main Catalog / Search / Category / Watchlist Section */}
        <section className="cv-catalog-section">
          <div className="cv-section-header">
            <h2 className="cv-section-title" style={{ marginBottom: 0 }}>
              {activeView === 'watchlist'
                ? `My Watchlist (${displayedMovies.length})`
                : isSearching
                ? `Search Results for "${debouncedQuery}"`
                : selectedGenre
                ? `${genreMap[selectedGenre] || 'Filtered'} — ${CATEGORY_LABELS[activeCategory]}`
                : `Browse ${CATEGORY_LABELS[activeCategory]}`}
            </h2>

            {/* Category Switcher Tabs when browsing */}
            {activeView !== 'watchlist' && !isSearching && (
              <div className="cv-category-pills">
                {[
                  { id: 'popular', label: 'Popular' },
                  { id: 'top_rated', label: 'Top Rated' },
                  { id: 'upcoming', label: 'Upcoming' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    className={`cv-pill-btn ${activeCategory === cat.id ? 'active' : ''}`}
                    onClick={() => handleSelectCategory(cat.id)}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {feedLoading ? (
            <SkeletonGrid count={10} />
          ) : displayedMovies.length === 0 ? (
            <div className="cv-empty-state">
              <div className="cv-empty-icon">🎬</div>
              <h3>
                {activeView === 'watchlist'
                  ? 'Your Watchlist is Empty'
                  : 'No Movies Found'}
              </h3>
              <p>
                {activeView === 'watchlist'
                  ? 'Bookmark movies by clicking the "+" icon on any movie card to save them for later.'
                  : 'Try adjusting your search query or clearing the active genre filter.'}
              </p>
              {(selectedGenre || searchQuery) && (
                <button
                  type="button"
                  className="cv-btn cv-btn-secondary cv-btn-sm"
                  style={{ marginTop: '1rem' }}
                  onClick={() => {
                    setSelectedGenre(null);
                    setSearchQuery('');
                  }}
                >
                  Reset Filters
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="cv-grid">
                {displayedMovies.map((movie) => (
                  <MovieCard
                    key={movie.id}
                    movie={movie}
                    genreMap={genreMap}
                    isSaved={isInWatchlist(movie.id)}
                    onSelect={setSelectedMovie}
                    onToggleWatchlist={handleToggleWatchlist}
                  />
                ))}
              </div>

              {/* Pagination Controls ("Load More") */}
              {activeView !== 'watchlist' && page < totalPages && (
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
                    Showing page {page} of {totalPages}
                  </span>
                </div>
              )}
            </>
          )}
        </section>
      </main>

      {/* 4. MOVIE DETAIL MODAL */}
      {selectedMovie && (
        <MovieModal
          key={selectedMovie.id}
          movie={selectedMovie}
          isSaved={isInWatchlist(selectedMovie.id)}
          onClose={() => setSelectedMovie(null)}
          onToggleWatchlist={handleToggleWatchlist}
        />
      )}

      {/* 5. TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="cv-toast" role="status" aria-live="polite">
          <span>🔔</span>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>CineVault</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{toastMessage}</div>
          </div>
        </div>
      )}

      {/* 6. FOOTER WITH TMDB ATTRIBUTION */}
      <Footer />
    </div>
  );
}

export default HomePage;
