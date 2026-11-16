import { useState, useEffect } from 'react';
import { fetchMovieDetails, getImageUrl } from '../services/tmdb';

function formatRuntime(minutes) {
  if (!minutes || minutes <= 0) return 'N/A';
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
}

export default function MovieModal({
  movie,
  isSaved = false,
  onClose = () => {},
  onToggleWatchlist = () => {},
}) {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showTrailer, setShowTrailer] = useState(false);

  useEffect(() => {
    if (!movie?.id) return;

    let isMounted = true;

    fetchMovieDetails(movie.id)
      .then((data) => {
        if (isMounted) {
          setDetails(data);
          setError(null);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'Failed to load movie details.');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [movie?.id]);

  // Close on Escape key & lock body scroll
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  if (!movie) return null;

  const data = details || movie;
  const releaseYear = data.release_date ? data.release_date.slice(0, 4) : 'TBA';
  const rating =
    typeof data.vote_average === 'number' && data.vote_average > 0
      ? data.vote_average.toFixed(1)
      : 'NR';

  const genres = details?.genres || [];
  const cast = details?.credits?.cast?.slice(0, 8) || [];
  const director =
    details?.credits?.crew?.find((member) => member.job === 'Director')?.name || 'N/A';
  const studio =
    details?.production_companies?.slice(0, 2).map((c) => c.name).join(' / ') || 'N/A';

  // Find official YouTube Trailer (or fallback to any YouTube video)
  const videos = details?.videos?.results || [];
  const trailer =
    videos.find((v) => v.site === 'YouTube' && v.type === 'Trailer' && v.official) ||
    videos.find((v) => v.site === 'YouTube' && v.type === 'Trailer') ||
    videos.find((v) => v.site === 'YouTube');

  return (
    <div className="cv-modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label={data.title}>
      <div className="cv-modal-container" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="cv-modal-close" onClick={onClose} aria-label="Close modal">
          ✕
        </button>

        {/* W1280 Backdrop Banner or Embedded YouTube Trailer */}
        {showTrailer && trailer ? (
          <div className="cv-modal-trailer-wrap">
            <iframe
              src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1&rel=0`}
              title={trailer.name || `${data.title} Trailer`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="cv-modal-iframe"
            />
          </div>
        ) : (
          <div
            className="cv-modal-hero"
            style={{
              backgroundImage: `url('${getImageUrl(data.backdrop_path || data.poster_path, 'w1280')}')`,
            }}
          >
            <div className="cv-modal-hero-overlay">
              <div className="cv-hero-btns">
                {trailer && (
                  <button
                    type="button"
                    className="cv-btn cv-btn-primary"
                    onClick={() => setShowTrailer(true)}
                  >
                    ▶ Watch Trailer
                  </button>
                )}
                <button
                  type="button"
                  className="cv-btn cv-btn-secondary"
                  onClick={() => onToggleWatchlist(data)}
                >
                  {isSaved ? '✓ In My List' : '+ Add to List'}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="cv-modal-body">
          <div className="cv-modal-header-row">
            <div>
              <h2 className="cv-modal-title">{data.title}</h2>
              {details?.tagline && <p className="cv-modal-tagline">"{details.tagline}"</p>}
            </div>
            {showTrailer && (
              <button
                type="button"
                className="cv-btn cv-btn-secondary cv-btn-sm"
                onClick={() => setShowTrailer(false)}
              >
                ✕ Close Trailer
              </button>
            )}
          </div>

          <div className="cv-modal-meta">
            <span className="cv-meta-rating">⭐ {rating}</span>
            <span>{releaseYear}</span>
            {details?.runtime ? <span>⏱️ {formatRuntime(details.runtime)}</span> : null}
            {details?.status && <span className="cv-age-tag">{details.status}</span>}
          </div>

          {genres.length > 0 && (
            <div className="cv-hero-genres" style={{ marginBottom: '1.25rem', flexWrap: 'wrap' }}>
              {genres.map((g) => (
                <span key={g.id} className="cv-genre-tag">
                  {g.name}
                </span>
              ))}
            </div>
          )}

          <p className="cv-modal-desc">
            {data.overview || 'No synopsis available for this title.'}
          </p>

          {loading && (
            <div className="cv-modal-loading">
              <div className="cv-skeleton-line cv-skeleton-shimmer" style={{ width: '60%', height: '18px' }} />
              <div className="cv-skeleton-line cv-skeleton-shimmer" style={{ width: '90%', height: '60px', marginTop: '0.75rem' }} />
            </div>
          )}

          {error && (
            <div className="cv-error-inline">
              ⚠️ Could not load extended details: {error}
            </div>
          )}

          {!loading && details && (
            <>
              <div className="cv-modal-grid">
                <div>
                  <div className="cv-crew-label">Director</div>
                  <div className="cv-crew-val">{director}</div>
                </div>
                <div>
                  <div className="cv-crew-label">Studio</div>
                  <div className="cv-crew-val">{studio}</div>
                </div>
                <div>
                  <div className="cv-crew-label">Votes</div>
                  <div className="cv-crew-val">
                    {details.vote_count ? details.vote_count.toLocaleString() : '0'} reviews
                  </div>
                </div>
              </div>

              {/* Top Cast Section */}
              {cast.length > 0 && (
                <div className="cv-cast-section">
                  <div className="cv-crew-label" style={{ marginBottom: '0.9rem' }}>
                    Top Cast
                  </div>
                  <div className="cv-cast-grid">
                    {cast.map((actor) => (
                      <div key={actor.cast_id || actor.id} className="cv-cast-card">
                        <img
                          src={getImageUrl(actor.profile_path, 'w185')}
                          alt={actor.name}
                          className="cv-cast-avatar"
                          loading="lazy"
                        />
                        <div className="cv-cast-info">
                          <div className="cv-cast-name">{actor.name}</div>
                          <div className="cv-cast-character">{actor.character}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Embedded Trailer Preview Section if not already playing in header */}
              {trailer && !showTrailer && (
                <div className="cv-trailer-section">
                  <div className="cv-crew-label" style={{ marginBottom: '0.9rem' }}>
                    Official Trailer — {trailer.name}
                  </div>
                  <div className="cv-modal-trailer-wrap cv-trailer-inline">
                    <iframe
                      src={`https://www.youtube.com/embed/${trailer.key}?rel=0`}
                      title={trailer.name || `${data.title} Trailer`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="cv-modal-iframe"
                      loading="lazy"
                    />
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
