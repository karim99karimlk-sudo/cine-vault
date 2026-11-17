const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/';

const FALLBACK_POSTER =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="500" height="750" viewBox="0 0 500 750">
      <rect width="100%" height="100%" fill="#181b26"/>
      <circle cx="250" cy="320" r="60" fill="#202433" stroke="#e50914" stroke-width="3"/>
      <polygon points="235,295 235,345 278,320" fill="#e50914"/>
      <text x="50%" y="430" fill="#94a3b8" font-family="sans-serif" font-size="22" text-anchor="middle">No Poster Available</text>
    </svg>`
  );

const FALLBACK_BACKDROP =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#0a0b0e"/>
          <stop offset="100%" stop-color="#181b26"/>
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#bg)"/>
      <text x="50%" y="50%" fill="#94a3b8" font-family="sans-serif" font-size="28" text-anchor="middle">CineVault</text>
    </svg>`
  );

/**
 * Returns the full TMDB image URL or a fallback SVG placeholder when path is null/empty.
 * @param {string|null} path - TMDB image path (e.g. "/abc.jpg")
 * @param {string} size - TMDB image size (e.g. "w500", "w1280", "w185", "original")
 * @returns {string}
 */
export function getImageUrl(path, size = 'w500') {
  if (!path) {
    return size === 'w1280' || size === 'original' ? FALLBACK_BACKDROP : FALLBACK_POSTER;
  }
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${IMAGE_BASE_URL}${size}${normalizedPath}`;
}

/**
 * Core fetch wrapper for TMDB API v3 with Bearer token authentication.
 * @param {string} endpoint - API path starting with "/"
 * @param {Record<string, string|number|undefined>} params - Query parameters
 */
async function tmdbFetch(endpoint, params = {}) {
  const token = import.meta.env.VITE_TMDB_READ_TOKEN;
  if (!token) {
    throw new Error(
      'Missing VITE_TMDB_READ_TOKEN in environment variables (.env). Please add your TMDB API Read Access Token.'
    );
  }

  const url = new URL(`${BASE_URL}${endpoint}`);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value));
    }
  });

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    let errorMessage = `TMDB API Error (${response.status})`;
    try {
      const errData = await response.json();
      if (errData?.status_message) {
        errorMessage = errData.status_message;
      }
    } catch {
      // Ignore JSON parse errors on error responses
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

/**
 * Fetch popular movies list (/movie/popular)
 * @param {number} page
 */
export async function fetchPopularMovies(page = 1) {
  return tmdbFetch('/movie/popular', { language: 'en-US', page });
}

/**
 * Fetch top rated movies list (/movie/top_rated)
 * @param {number} page
 */
export async function fetchTopRatedMovies(page = 1) {
  return tmdbFetch('/movie/top_rated', { language: 'en-US', page });
}

/**
 * Fetch upcoming movies list (/movie/upcoming)
 * @param {number} page
 */
export async function fetchUpcomingMovies(page = 1) {
  return tmdbFetch('/movie/upcoming', { language: 'en-US', page });
}

/**
 * Fetch now playing movies in theaters (/movie/now_playing)
 * @param {number} page
 */
export async function fetchNowPlayingMovies(page = 1) {
  return tmdbFetch('/movie/now_playing', { language: 'en-US', page });
}

/**
 * Fetch trending movies (/trending/movie/{time_window})
 * @param {'day'|'week'} timeWindow
 * @param {number} page
 */
export async function fetchTrendingMovies(timeWindow = 'week', page = 1) {
  return tmdbFetch(`/trending/movie/${timeWindow}`, { language: 'en-US', page });
}

/**
 * Fetch movies by category key ('popular' | 'top_rated' | 'upcoming' | 'now_playing' | 'trending')
 * @param {'popular'|'top_rated'|'upcoming'|'now_playing'|'trending'} category
 * @param {number} page
 */
export async function fetchMoviesByCategory(category = 'popular', page = 1) {
  if (category === 'trending') {
    return fetchTrendingMovies('week', page);
  }
  const validCategories = ['popular', 'top_rated', 'upcoming', 'now_playing'];
  const safeCategory = validCategories.includes(category) ? category : 'popular';
  return tmdbFetch(`/movie/${safeCategory}`, { language: 'en-US', page });
}

/**
 * Search movies by query (/search/movie)
 * @param {string} query
 * @param {number} page
 */
export async function searchMovies(query, page = 1) {
  return tmdbFetch('/search/movie', {
    query,
    include_adult: 'false',
    language: 'en-US',
    page,
  });
}

/**
 * Fetch full movie details including credits and videos (/movie/{id}?append_to_response=credits,videos)
 * @param {number|string} movieId
 */
export async function fetchMovieDetails(movieId) {
  return tmdbFetch(`/movie/${movieId}`, {
    append_to_response: 'credits,videos',
    language: 'en-US',
  });
}

/**
 * Fetch official TMDB movie genre list (/genre/movie/list)
 * @returns {Promise<{ genres: Array<{ id: number, name: string }> }>}
 */
export async function fetchGenres() {
  return tmdbFetch('/genre/movie/list', { language: 'en-US' });
}

/**
 * Fetch full actor/person details including movie credits (/person/{id}?append_to_response=movie_credits)
 * @param {number|string} personId
 */
export async function fetchActorDetails(personId) {
  return tmdbFetch(`/person/${personId}`, {
    append_to_response: 'movie_credits',
    language: 'en-US',
  });
}
