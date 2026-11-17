import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import MovieCard from '../components/MovieCard';

export default function WatchlistPage({
  watchlist = [],
  debouncedQuery = '',
  genres = [],
  genreMap = {},
  isInWatchlist = () => false,
  onSelectMovie = () => {},
  onToggleWatchlist = () => {},
}) {
  const [selectedGenre, setSelectedGenre] = useState(null);

  const filteredWatchlist = useMemo(() => {
    const q = debouncedQuery.toLowerCase();
    return watchlist.filter((m) => {
      const matchesQuery = !q || (m.title && m.title.toLowerCase().includes(q));
      const matchesGenre =
        selectedGenre === null ||
        (Array.isArray(m.genre_ids) && m.genre_ids.includes(selectedGenre));
      return matchesQuery && matchesGenre;
    });
  }, [watchlist, debouncedQuery, selectedGenre]);

  return (
    <div className="cv-container" style={{ marginTop: '85px' }}>
      <div className="cv-actor-topbar">
        <Link to="/" className="cv-btn cv-btn-secondary cv-btn-sm">
          ← Back to Home
        </Link>
      </div>

      <div className="cv-section-header" style={{ marginBottom: '1.5rem' }}>
        <h1 className="cv-section-title" style={{ marginBottom: 0 }}>
          My Watchlist ({filteredWatchlist.length})
        </h1>
      </div>

      {genres.length > 0 && watchlist.length > 0 && (
        <div className="cv-filter-bar">
          <div className="cv-tabs" role="tablist" aria-label="Filter watchlist by genre">
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

      {filteredWatchlist.length === 0 ? (
        <div className="cv-empty-state">
          <div className="cv-empty-icon">🎬</div>
          <h3>Your Watchlist is Empty</h3>
          <p>
            Bookmark movies or TV shows by clicking the "+" icon on any card to save them for later.
          </p>
          <Link
            to="/movies?category=popular"
            className="cv-btn cv-btn-primary cv-btn-sm"
            style={{ marginTop: '1rem' }}
          >
            Explore Popular Movies
          </Link>
        </div>
      ) : (
        <div className="cv-grid">
          {filteredWatchlist.map((movie) => (
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
    </div>
  );
}
