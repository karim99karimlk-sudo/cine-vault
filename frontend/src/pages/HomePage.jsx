import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import HeroCarousel from '../components/HeroCarousel';
import MovieCard from '../components/MovieCard';
import { SkeletonGrid } from '../components/SkeletonCard';
import {
  fetchTrendingMovies,
  fetchPopularMovies,
  fetchPopularTvShows,
  fetchNowPlayingMovies,
  fetchTopRatedMovies,
  fetchUpcomingMovies,
  searchMovies,
} from '../services/tmdb';

function dedupeMovies(list) {
  const seen = new Set();
  return list.filter((m) => {
    if (!m || !m.id || seen.has(m.id)) return false;
    seen.add(m.id);
    return true;
  });
}

export function HomePage({
  debouncedQuery = '',
  genres = [],
  genreMap = {},
  isInWatchlist = () => false,
  onSelectMovie = () => {},
  onToggleWatchlist = () => {},
}) {
  const [selectedGenre, setSelectedGenre] = useState(null);

  // Categorized home sections state
  const [homeSections, setHomeSections] = useState({
    trending: [],
    popular: [],
    popularTv: [],
    nowPlaying: [],
    topRated: [],
    upcoming: [],
  });
  const [homeLoading, setHomeLoading] = useState(true);
  const [homeError, setHomeError] = useState(null);
  const [homeRetryTick, setHomeRetryTick] = useState(0);

  // Search results state when user types in search bar while on Home
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  // Load initial categorized home sections (Trending, Popular, TV Shows, Now Playing, Top Rated, Upcoming)
  useEffect(() => {
    let isMounted = true;

    Promise.all([
      fetchTrendingMovies('week', 1),
      fetchPopularMovies(1),
      fetchPopularTvShows(1),
      fetchNowPlayingMovies(1),
      fetchTopRatedMovies(1),
      fetchUpcomingMovies(1),
    ])
      .then(([trendingRes, popularRes, popularTvRes, nowPlayingRes, topRatedRes, upcomingRes]) => {
        if (!isMounted) return;
        setHomeSections({
          trending: trendingRes.results || [],
          popular: popularRes.results || [],
          popularTv: popularTvRes.results || [],
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

  // Search movies if debouncedQuery is active on Home
  useEffect(() => {
    if (!debouncedQuery) return;

    let isMounted = true;
    searchMovies(debouncedQuery, 1)
      .then((res) => {
        if (!isMounted) return;
        setSearchResults(res.results || []);
        setSearchLoading(false);
      })
      .catch(() => {
        if (!isMounted) return;
        setSearchLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [debouncedQuery]);

  // Featured hero carousel movies (top 8 trending/popular with backdrops)
  const heroSlides = useMemo(() => {
    const combined = dedupeMovies([
      ...homeSections.trending,
      ...homeSections.popular,
    ]).filter((m) => m.backdrop_path);
    return combined.slice(0, 8);
  }, [homeSections.trending, homeSections.popular]);

  const filterByGenre = (list) => {
    if (!selectedGenre) return list;
    return list.filter((m) => Array.isArray(m.genre_ids) && m.genre_ids.includes(selectedGenre));
  };

  const isSearching = debouncedQuery.length > 0;
  const showHero = !isSearching && !selectedGenre && heroSlides.length > 0;

  const discoveryRows = [
    { key: 'trending', title: 'Trending This Week', items: filterByGenre(homeSections.trending) },
    { key: 'popular', title: 'Popular Movies', items: filterByGenre(homeSections.popular) },
    { key: 'popular_tv', title: 'Popular TV Shows', items: filterByGenre(homeSections.popularTv) },
    { key: 'now_playing', title: 'Now Playing in Theaters', items: filterByGenre(homeSections.nowPlaying) },
    { key: 'top_rated', title: 'Top Rated Masterpieces', items: filterByGenre(homeSections.topRated) },
    { key: 'upcoming', title: 'Upcoming Releases', items: filterByGenre(homeSections.upcoming) },
  ];

  return (
    <>
      {/* HERO CAROUSEL */}
      {homeLoading && !isSearching && (
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
          onSelectMovie={onSelectMovie}
          onToggleWatchlist={onToggleWatchlist}
        />
      )}

      {/* MAIN DISCOVERY CONTAINER */}
      <main
        className="cv-container"
        id="movies"
        style={!showHero && !(homeLoading && !isSearching) ? { marginTop: '85px' } : undefined}
      >
        {homeError && (
          <div className="cv-error-banner" role="alert">
            <div>
              <strong>⚠️ Connection Issue:</strong> {homeError}
            </div>
            <button
              type="button"
              className="cv-btn cv-btn-primary cv-btn-sm"
              onClick={() => {
                setHomeLoading(true);
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

        {/* Search Results or Categorized Discovery Rows */}
        {isSearching ? (
          <section className="cv-catalog-section">
            <div className="cv-section-header">
              <h2 className="cv-section-title" style={{ marginBottom: 0 }}>
                Search Results for "{debouncedQuery}"
              </h2>
              <Link to="/movies" className="cv-explore-link">
                Advanced Search in Movies →
              </Link>
            </div>

            {searchLoading ? (
              <SkeletonGrid count={10} />
            ) : filterByGenre(searchResults).length === 0 ? (
              <div className="cv-empty-state">
                <div className="cv-empty-icon">🎬</div>
                <h3>No Movies Found</h3>
                <p>Try searching for another title or clearing the genre filter.</p>
              </div>
            ) : (
              <div className="cv-grid">
                {filterByGenre(searchResults).map((movie) => (
                  <MovieCard
                    key={movie.id}
                    movie={movie}
                    genreMap={genreMap}
                    isSaved={isInWatchlist(movie.id)}
                    onSelect={onSelectMovie}
                    onToggleWatchlist={onToggleWatchlist}
                  />
                ))}
              </div>
            )}
          </section>
        ) : (
          <div className="cv-discovery-sections">
            {discoveryRows.map((section) => (
              <section key={section.key} className="cv-category-block">
                <div className="cv-section-header">
                  <h2 className="cv-section-title" style={{ marginBottom: 0 }}>
                    {section.title}
                  </h2>
                  <Link
                    to={`/movies?category=${section.key}`}
                    className="cv-explore-link"
                  >
                    Explore All →
                  </Link>
                </div>

                {homeLoading ? (
                  <SkeletonGrid count={10} />
                ) : section.items.length === 0 ? (
                  <div className="cv-empty-state" style={{ padding: '2rem' }}>
                    <p>No titles in {section.title} match the selected genre.</p>
                  </div>
                ) : (
                  <div className="cv-grid">
                    {section.items.slice(0, 10).map((movie) => (
                      <MovieCard
                        key={movie.id}
                        movie={movie}
                        genreMap={genreMap}
                        isSaved={isInWatchlist(movie.id)}
                        onSelect={onSelectMovie}
                        onToggleWatchlist={onToggleWatchlist}
                      />
                    ))}
                  </div>
                )}
              </section>
            ))}
          </div>
        )}
      </main>
    </>
  );
}

export default HomePage;
