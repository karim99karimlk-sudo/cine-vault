import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import Header from '../components/Header';
import HeroCarousel from '../components/HeroCarousel';
import MovieCard from '../components/MovieCard';
import { SkeletonGrid } from '../components/SkeletonCard';
import MovieModal from '../components/MovieModal';
import Footer from '../components/Footer';
import ActorPage from './ActorPage';
import {
  fetchTrendingMovies,
  fetchPopularMovies,
  fetchNowPlayingMovies,
  fetchTopRatedMovies,
  fetchUpcomingMovies,
  fetchMoviesByCategory,
  searchMovies,
  fetchGenres,
} from '../services/tmdb';
import { useDebounce } from '../hooks/useDebounce';
import { useWatchlist } from '../hooks/useWatchlist';
import './HomePage.css';

const CATEGORY_LABELS = {
  trending: 'Trending This Week',
  popular: 'Popular Movies',
  now_playing: 'Now Playing in Theaters',
  top_rated: 'Top Rated Movies',
  upcoming: 'Upcoming Releases',
};

function dedupeMovies(list) {
  const seen = new Set();
  return list.filter((m) => {
    if (!m || !m.id || seen.has(m.id)) return false;
    seen.add(m.id);
    return true;
  });
}

export function HomePage() {
  // Navigation & filter state
  const [activeView, setActiveView] = useState('discover'); // 'discover' | 'popular' | 'top_rated' | 'upcoming' | 'watchlist'
  const [activeCategory, setActiveCategory] = useState('popular'); // 'trending' | 'popular' | 'now_playing' | 'top_rated' | 'upcoming'
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

  // Categorized home sections state
  const [homeSections, setHomeSections] = useState({
    trending: [],
    popular: [],
    nowPlaying: [],
    topRated: [],
    upcoming: [],
  });
  const [homeLoading, setHomeLoading] = useState(true);
  const [homeError, setHomeError] = useState(null);
  const [homeRetryTick, setHomeRetryTick] = useState(0);

  // Paginated feed state (for active category or search results)
  const [movies, setMovies] = useState([]);
  const [page, setPage] = useState(2);
  const [totalPages, setTotalPages] = useState(1);
  const [feedLoading, setFeedLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [feedError, setFeedError] = useState(null);

  // Modal, Actor page & toast state
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [selectedActor, setSelectedActor] = useState(null);
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

  // 1. Load genres + initial categorized home sections (Trending, Popular, Now Playing, Top Rated, Upcoming)
  useEffect(() => {
    let isMounted = true;

    Promise.all([
      fetchGenres(),
      fetchTrendingMovies('week', 1),
      fetchPopularMovies(1),
      fetchNowPlayingMovies(1),
      fetchTopRatedMovies(1),
      fetchUpcomingMovies(1),
    ])
      .then(([genreRes, trendingRes, popularRes, nowPlayingRes, topRatedRes, upcomingRes]) => {
        if (!isMounted) return;
        setGenres(genreRes.genres || []);
        setHomeSections({
          trending: trendingRes.results || [],
          popular: popularRes.results || [],
          nowPlaying: nowPlayingRes.results || [],
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

  // 2. Load initial 2 pages (up to 40 movies) of catalog whenever debouncedQuery or activeCategory changes
  useEffect(() => {
    let isMounted = true;

    const fetchInitialCatalog = async () => {
      try {
        if (debouncedQuery) {
          const page1 = await searchMovies(debouncedQuery, 1);
          if (!isMounted) return;
          const total = Math.min(page1.total_pages || 1, 500);
          let combined = page1.results || [];
          let currentLoadedPage = 1;

          if (total >= 2) {
            const page2 = await searchMovies(debouncedQuery, 2);
            if (!isMounted) return;
            combined = dedupeMovies([...combined, ...(page2.results || [])]);
            currentLoadedPage = 2;
          }

          setMovies(combined);
          setPage(currentLoadedPage);
          setTotalPages(total);
        } else {
          const [page1, page2] = await Promise.all([
            fetchMoviesByCategory(activeCategory, 1),
            fetchMoviesByCategory(activeCategory, 2),
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
        setFeedError(null);
        setFeedLoading(false);
      } catch (err) {
        if (!isMounted) return;
        setFeedError(err.message || 'Failed to fetch movies.');
        setFeedLoading(false);
      }
    };

    fetchInitialCatalog();

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
      setMovies((prev) => dedupeMovies([...prev, ...incoming]));
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
    setSelectedActor(null);
    setActiveView(view);
    if (view === 'popular' || view === 'top_rated' || view === 'upcoming') {
      handleSelectCategory(view);
    }
  };

  // Featured hero carousel movies (top 8 trending/popular with backdrops)
  const heroSlides = useMemo(() => {
    const combined = dedupeMovies([
      ...homeSections.trending,
      ...homeSections.popular,
    ]).filter((m) => m.backdrop_path);
    return combined.slice(0, 8);
  }, [homeSections.trending, homeSections.popular]);

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
  const showHero =
    activeView === 'discover' && !isSearching && !selectedGenre && heroSlides.length > 0;
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
          if (val.trim()) {
            setSelectedActor(null);
          }
          setSearchQuery(val);
        }}
        watchlistCount={watchlist.length}
        activeView={selectedActor ? '' : activeView}
        onSelectView={handleSelectView}
      />

      {selectedActor ? (
        <ActorPage
          key={selectedActor.id}
          actor={selectedActor}
          genreMap={genreMap}
          isInWatchlist={isInWatchlist}
          onSelectMovie={setSelectedMovie}
          onToggleWatchlist={handleToggleWatchlist}
          onBack={() => setSelectedActor(null)}
        />
      ) : (
        <>
          {/* 2. HERO CAROUSEL */}
          {homeLoading && activeView === 'discover' && !isSearching && (
            <section className="cv-hero cv-skeleton-hero" aria-hidden="true">
              <div className="cv-hero-content">
                <div
                  className="cv-skeleton-line cv-skeleton-shimmer"
                  style={{ width: '180px', height: '28px', marginBottom: '1rem' }}
                />
                <div
                  className="cv-skeleton-line cv-skeleton-shimmer"
                  style={{ width: '420px', maxWidth: '90%', height: '54px', marginBottom: '1rem' }}
                />
                <div
                  className="cv-skeleton-line cv-skeleton-shimmer"
                  style={{ width: '260px', height: '20px', marginBottom: '1.2rem' }}
                />
                <div
                  className="cv-skeleton-line cv-skeleton-shimmer"
                  style={{ width: '520px', maxWidth: '95%', height: '72px', marginBottom: '2rem' }}
                />
              </div>
            </section>
          )}

          {showHero && (
            <HeroCarousel
              movies={heroSlides}
              genreMap={genreMap}
              isInWatchlist={isInWatchlist}
              onSelectMovie={setSelectedMovie}
              onToggleWatchlist={handleToggleWatchlist}
            />
          )}

          {/* 3. MAIN CONTENT AREA */}
          <main
            className="cv-container"
            id="movies"
            style={
              !showHero && !(homeLoading && activeView === 'discover' && !isSearching)
                ? { marginTop: '85px' }
                : undefined
            }
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

            {/* Categorized Discovery Rows (10 movies each across 5 categories) */}
            {showCategorizedRows && (
              <div className="cv-discovery-sections">
                {[
                  { key: 'trending', title: 'Trending This Week', items: homeSections.trending },
                  { key: 'popular', title: 'Popular Movies', items: homeSections.popular },
                  { key: 'now_playing', title: 'Now Playing in Theaters', items: homeSections.nowPlaying },
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
                          if (
                            section.key === 'popular' ||
                            section.key === 'top_rated' ||
                            section.key === 'upcoming'
                          ) {
                            setActiveView(section.key);
                          } else {
                            setActiveView('popular');
                          }
                          handleSelectCategory(section.key);
                          document
                            .getElementById('catalog-feed')
                            ?.scrollIntoView({ behavior: 'smooth' });
                        }}
                      >
                        Explore All →
                      </button>
                    </div>

                    {homeLoading ? (
                      <SkeletonGrid count={10} />
                    ) : (
                      <div className="cv-grid">
                        {section.items.slice(0, 10).map((movie) => (
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
            <section className="cv-catalog-section" id="catalog-feed">
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
                      { id: 'trending', label: 'Trending' },
                      { id: 'popular', label: 'Popular' },
                      { id: 'now_playing', label: 'In Theaters' },
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
                <SkeletonGrid count={15} />
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
                        Showing {displayedMovies.length} movies (Page {page} of {totalPages})
                      </span>
                    </div>
                  )}
                </>
              )}
            </section>
          </main>
        </>
      )}

      {/* 4. MOVIE DETAIL MODAL */}
      {selectedMovie && (
        <MovieModal
          key={selectedMovie.id}
          movie={selectedMovie}
          isSaved={isInWatchlist(selectedMovie.id)}
          onClose={() => setSelectedMovie(null)}
          onToggleWatchlist={handleToggleWatchlist}
          onSelectActor={(actor) => {
            setSelectedMovie(null);
            setSelectedActor(actor);
          }}
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
