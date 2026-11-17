import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar } from '@fortawesome/free-solid-svg-icons';
import { getImageUrl } from '../services/tmdb';
import './MovieCard.css';

/**
 * Reusable MovieCard displaying poster, title, release year, formatted rating, primary genre, and watchlist toggle.
 */
export default function MovieCard({
  movie,
  genreMap = {},
  isSaved = false,
  onSelect = () => {},
  onToggleWatchlist = () => {},
}) {
  const releaseYear = movie.release_date ? movie.release_date.slice(0, 4) : 'TBA';
  const formattedRating =
    typeof movie.vote_average === 'number' && movie.vote_average > 0
      ? movie.vote_average.toFixed(1)
      : 'NR';

  const isTv = movie.media_type === 'tv' || (!movie.title && Boolean(movie.name));
  const primaryGenreId = movie.genre_ids?.[0] || movie.genres?.[0]?.id;
  const primaryGenreName =
    (primaryGenreId && genreMap[primaryGenreId]) ||
    movie.genres?.[0]?.name ||
    (isTv ? 'TV Series' : 'Movie');

  return (
    <article className="cv-card" onClick={() => onSelect(movie)}>
      <div className="cv-poster-wrap">
        <img
          src={getImageUrl(movie.poster_path, 'w500')}
          alt={movie.title || 'Movie Poster'}
          className="cv-poster"
          loading="lazy"
        />
        {isTv && <span className="cv-media-badge">TV</span>}
        <button
          type="button"
          className={`cv-bookmark-badge ${isSaved ? 'saved' : ''}`}
          title={isSaved ? 'Remove from Watchlist' : 'Add to Watchlist'}
          aria-label={isSaved ? 'Remove from Watchlist' : 'Add to Watchlist'}
          onClick={(e) => {
            e.stopPropagation();
            onToggleWatchlist(movie);
          }}
        >
          {isSaved ? '✓' : '+'}
        </button>
        <div className="cv-card-overlay">
          <button
            type="button"
            className="cv-action-circle"
            title="View Details & Trailer"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(movie);
            }}
          >
            ▶
          </button>
          <button
            type="button"
            className="cv-action-circle secondary"
            title={isSaved ? 'Remove from Watchlist' : 'Add to Watchlist'}
            onClick={(e) => {
              e.stopPropagation();
              onToggleWatchlist(movie);
            }}
          >
            {isSaved ? '✓' : '+'}
          </button>
        </div>
      </div>

      <div className="cv-card-info">
        <h3 className="cv-card-title" title={movie.title}>
          {movie.title}
        </h3>
        <div className="cv-card-footer">
          <div className="cv-card-submeta">
            <span className="cv-card-year">{releaseYear}</span>
            <span className="cv-card-genre">{primaryGenreName}</span>
          </div>
          <span className="cv-meta-rating">
            <FontAwesomeIcon icon={faStar} /> {formattedRating}
          </span>
        </div>
      </div>
    </article>
  );
}
