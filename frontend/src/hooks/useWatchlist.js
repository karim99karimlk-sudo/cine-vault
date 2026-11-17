import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'cv_tmdb_watchlist';

/**
 * Custom hook for managing a user's movie watchlist persisted in localStorage.
 * Stores movie objects so the watchlist view can render immediately.
 */
export function useWatchlist() {
  const [watchlist, setWatchlist] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed.filter(item => item && typeof item === 'object' && item.id) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(watchlist));
    } catch (err) {
      console.error('Failed to save watchlist to localStorage:', err);
    }
  }, [watchlist]);

  const isInWatchlist = useCallback(
    (movieId) => watchlist.some((m) => m.id === movieId),
    [watchlist]
  );

  const toggleWatchlist = useCallback((movie) => {
    if (!movie || !movie.id) return false;
    let added = false;
    setWatchlist((prev) => {
      const exists = prev.some((item) => item.id === movie.id);
      if (exists) {
        added = false;
        return prev.filter((item) => item.id !== movie.id);
      } else {
        added = true;
        const normalizedMovie = {
          id: movie.id,
          media_type: movie.media_type || 'movie',
          title: movie.title || movie.name || 'Untitled',
          poster_path: movie.poster_path || null,
          backdrop_path: movie.backdrop_path || null,
          release_date: movie.release_date || movie.first_air_date || '',
          vote_average: movie.vote_average ?? 0,
          genre_ids: movie.genre_ids || (movie.genres ? movie.genres.map((g) => g.id) : []),
          overview: movie.overview || '',
        };
        return [normalizedMovie, ...prev];
      }
    });
    return added;
  }, []);

  return {
    watchlist,
    isInWatchlist,
    toggleWatchlist,
  };
}

export default useWatchlist;
