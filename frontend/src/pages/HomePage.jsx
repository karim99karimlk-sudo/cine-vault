import { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import HeroCarousel from '../components/HeroCarousel';
import MovieCard from '../components/MovieCard';
import { SkeletonCard } from '../components/SkeletonCard';
import {
  fetchTrendingMovies,
  fetchPopularMovies,
  fetchPopularTvShows,
  fetchNowPlayingMovies,
  fetchTopRatedMovies,
  fetchUpcomingMovies,
} from '../services/tmdb';
import './HomePage.css';

function dedupeMovies(list) {
  const seen = new Set();
  return list.filter((m) => {
    if (!m || !m.id || seen.has(m.id)) return false;
    seen.add(m.id);
    return true;
  });
}

export function HomePage({
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

  const rowRefs = useRef({});

  const scrollRow = (sectionKey, direction) => {
    const track = rowRefs.current[sectionKey];
    if (!track) return;
    const scrollAmount = Math.max(track.clientWidth * 0.75, 320);
    track.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

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

  const showHero = !selectedGenre && heroSlides.length > 0;

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
      {homeLoading && (
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
        style={!showHero && !homeLoading ? { marginTop: '85px' } : undefined}
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

        {/* Categorized Discovery Rows */}
        <div className="cv-discovery-sections">
          {discoveryRows.map((section) => (
            <section key={section.key} className="cv-category-block">
              <div className="cv-section-header">
                <h2 className="cv-section-title" style={{ marginBottom: 0 }}>
                  {section.title}
                </h2>
                <div className="cv-section-actions">
                  {section.items.length > 0 && (
                    <div className="cv-carousel-nav-btns">
                      <button
                        type="button"
                        className="cv-carousel-nav-btn"
                        onClick={() => scrollRow(section.key, 'left')}
                        aria-label={`Scroll ${section.title} left`}
                      >
                        ‹
                      </button>
                      <button
                        type="button"
                        className="cv-carousel-nav-btn"
                        onClick={() => scrollRow(section.key, 'right')}
                        aria-label={`Scroll ${section.title} right`}
                      >
                        ›
                      </button>
                    </div>
                  )}
                  <Link
                    to={`/movies?category=${section.key}`}
                    className="cv-explore-link"
                  >
                    Explore All →
                  </Link>
                </div>
              </div>

              {homeLoading ? (
                <div className="cv-trending-carousel" aria-busy="true">
                  {Array.from({ length: 8 }).map((_, idx) => (
                    <div key={idx} className="cv-trending-carousel-item">
                      <SkeletonCard />
                    </div>
                  ))}
                </div>
              ) : section.items.length === 0 ? (
                <div className="cv-empty-state" style={{ padding: '2rem' }}>
                  <p>No titles in {section.title} match the selected genre.</p>
                </div>
              ) : (
                <div className="cv-trending-carousel-wrap">
                  <div
                    className="cv-trending-carousel"
                    ref={(el) => {
                      rowRefs.current[section.key] = el;
                    }}
                  >
                    {section.items.map((movie) => (
                      <div
                        key={`${movie.media_type || 'item'}-${movie.id}`}
                        className="cv-trending-carousel-item"
                      >
                        <MovieCard
                          movie={movie}
                          genreMap={genreMap}
                          isSaved={isInWatchlist(movie.id)}
                          onSelect={onSelectMovie}
                          onToggleWatchlist={onToggleWatchlist}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>
          ))}
        </div>
      </main>
    </>
  );
}

export default HomePage;
