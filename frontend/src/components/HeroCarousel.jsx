import { useState, useEffect, useCallback } from 'react';
import { getImageUrl } from '../services/tmdb';

export default function HeroCarousel({
  movies = [],
  genreMap = {},
  isInWatchlist = () => false,
  onSelectMovie = () => {},
  onToggleWatchlist = () => {},
}) {
  const slides = movies.slice(0, 8);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const slideCount = slides.length;
  const safeIndex = slideCount > 0 ? activeIndex % slideCount : 0;

  const nextSlide = useCallback(() => {
    if (slideCount <= 1) return;
    setActiveIndex((prev) => (prev + 1) % slideCount);
  }, [slideCount]);

  const prevSlide = useCallback(() => {
    if (slideCount <= 1) return;
    setActiveIndex((prev) => (prev - 1 + slideCount) % slideCount);
  }, [slideCount]);

  // Auto-advance every 6 seconds unless hovered
  useEffect(() => {
    if (slideCount <= 1 || isPaused) return;
    const timer = setInterval(nextSlide, 6000);
    return () => clearInterval(timer);
  }, [slideCount, isPaused, nextSlide]);

  if (slideCount === 0) return null;

  const activeMovie = slides[safeIndex];
  const saved = isInWatchlist(activeMovie.id);

  return (
    <section
      className="cv-hero cv-hero-carousel"
      id="home"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      aria-roledescription="carousel"
      aria-label="Featured Movies Spotlight"
    >
      {/* Pre-rendered crossfading backdrops */}
      {slides.map((movie, idx) => (
        <div
          key={movie.id}
          className={`cv-hero-bg cv-hero-slide-bg ${idx === safeIndex ? 'active' : ''}`}
          style={{
            backgroundImage: `url('${getImageUrl(movie.backdrop_path || movie.poster_path, 'w1280')}')`,
          }}
          aria-hidden={idx !== safeIndex}
        />
      ))}

      <div className="cv-hero-overlay" />

      {/* Left / Right Carousel Arrows */}
      {slideCount > 1 && (
        <>
          <button
            type="button"
            className="cv-hero-arrow cv-hero-arrow-left"
            onClick={prevSlide}
            aria-label="Previous featured movie"
          >
            ‹
          </button>
          <button
            type="button"
            className="cv-hero-arrow cv-hero-arrow-right"
            onClick={nextSlide}
            aria-label="Next featured movie"
          >
            ›
          </button>
        </>
      )}

      {/* Active Slide Content */}
      <div className="cv-hero-content" key={activeMovie.id}>
        <div className="cv-hero-badge">
          🔥 #{safeIndex + 1} Featured Spotlight
        </div>
        <h1 className="cv-hero-title">{activeMovie.title}</h1>
        <div className="cv-hero-meta">
          <span className="cv-meta-rating">
            ⭐ {activeMovie.vote_average ? activeMovie.vote_average.toFixed(1) : 'NR'}
          </span>
          <span>{activeMovie.release_date ? activeMovie.release_date.slice(0, 4) : 'TBA'}</span>
          <span className="cv-age-tag">HD</span>
          <span>🗳️ {activeMovie.vote_count?.toLocaleString() || 0} votes</span>
        </div>

        <div className="cv-hero-genres">
          {(activeMovie.genre_ids || []).slice(0, 3).map((gid) =>
            genreMap[gid] ? (
              <span key={gid} className="cv-genre-tag">
                {genreMap[gid]}
              </span>
            ) : null
          )}
        </div>

        <p className="cv-hero-desc">{activeMovie.overview}</p>

        <div className="cv-hero-btns">
          <button
            type="button"
            className="cv-btn cv-btn-primary"
            onClick={() => onSelectMovie(activeMovie)}
          >
            ▶ Watch Trailer & Info
          </button>
          <button
            type="button"
            className="cv-btn cv-btn-secondary"
            onClick={() => onToggleWatchlist(activeMovie)}
          >
            {saved ? '✓ In My List' : '+ Add to Watchlist'}
          </button>
        </div>
      </div>

      {/* Bottom Thumbnail / Dot Indicators */}
      {slideCount > 1 && (
        <div className="cv-hero-indicators" role="tablist" aria-label="Featured slides">
          {slides.map((movie, idx) => (
            <button
              key={movie.id}
              type="button"
              role="tab"
              aria-selected={idx === safeIndex}
              aria-label={`Slide ${idx + 1}: ${movie.title}`}
              className={`cv-hero-thumb ${idx === safeIndex ? 'active' : ''}`}
              onClick={() => setActiveIndex(idx)}
              title={movie.title}
            >
              <img
                src={getImageUrl(movie.poster_path || movie.backdrop_path, 'w185')}
                alt={movie.title}
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
