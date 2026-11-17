import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import MovieModal from './components/MovieModal';
import HomePage from './pages/HomePage';
import MoviesPage from './pages/MoviesPage';
import ActorPage from './pages/ActorPage';
import WatchlistPage from './pages/WatchlistPage';
import { fetchGenres } from './services/tmdb';
import { useWatchlist } from './hooks/useWatchlist';
import './App.css';

function App() {
  const [genres, setGenres] = useState([]);
  const genreMap = useMemo(() => {
    const map = {};
    genres.forEach((g) => {
      map[g.id] = g.name;
    });
    return map;
  }, [genres]);

  const [selectedMovie, setSelectedMovie] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const toastTimerRef = useRef(null);

  const { watchlist, isInWatchlist, toggleWatchlist } = useWatchlist();

  useEffect(() => {
    let isMounted = true;
    fetchGenres()
      .then((res) => {
        if (isMounted) setGenres(res.genres || []);
      })
      .catch((err) => console.error('Failed to load genres:', err));
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  const showToast = useCallback((text) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToastMessage(text);
    toastTimerRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 3000);
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

  return (
    <BrowserRouter>
      <div className="cv-app">
        <Header
          watchlistCount={watchlist.length}
          genreMap={genreMap}
          onSelectMovie={setSelectedMovie}
        />

        <Routes>
          <Route
            path="/"
            element={
              <HomePage
                genres={genres}
                genreMap={genreMap}
                isInWatchlist={isInWatchlist}
                onSelectMovie={setSelectedMovie}
                onToggleWatchlist={handleToggleWatchlist}
              />
            }
          />
          <Route
            path="/movies"
            element={
              <MoviesPage
                genres={genres}
                genreMap={genreMap}
                isInWatchlist={isInWatchlist}
                onSelectMovie={setSelectedMovie}
                onToggleWatchlist={handleToggleWatchlist}
              />
            }
          />
          <Route
            path="/actor/:id"
            element={
              <ActorPage
                genreMap={genreMap}
                isInWatchlist={isInWatchlist}
                onSelectMovie={setSelectedMovie}
                onToggleWatchlist={handleToggleWatchlist}
              />
            }
          />
          <Route
            path="/watchlist"
            element={
              <WatchlistPage
                watchlist={watchlist}
                genres={genres}
                genreMap={genreMap}
                isInWatchlist={isInWatchlist}
                onSelectMovie={setSelectedMovie}
                onToggleWatchlist={handleToggleWatchlist}
              />
            }
          />
        </Routes>

        {selectedMovie && (
          <MovieModal
            key={`${selectedMovie.media_type || 'movie'}-${selectedMovie.id}`}
            movie={selectedMovie}
            isSaved={isInWatchlist(selectedMovie.id)}
            onClose={() => setSelectedMovie(null)}
            onToggleWatchlist={handleToggleWatchlist}
            onSelectMovie={setSelectedMovie}
          />
        )}

        {toastMessage && (
          <div className="cv-toast" role="status" aria-live="polite">
            <span>🔔</span>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>CineVault</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{toastMessage}</div>
            </div>
          </div>
        )}

        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
