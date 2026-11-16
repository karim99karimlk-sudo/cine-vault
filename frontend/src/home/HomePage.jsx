import { useState, useEffect, useRef } from 'react';
import Header from '../component/Header';
import './HomePage.css';

// --- MOVIE DATABASE ---
const MOVIES_DATA = [
  {
    id: 1,
    title: "Interstellar Odyssey",
    category: "Trending",
    rating: 8.9,
    year: 2026,
    duration: "2h 49m",
    age: "PG-13",
    genre: "Sci-Fi",
    genres: ["Sci-Fi", "Adventure", "Drama"],
    poster: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=600",
    backdrop: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=1920",
    desc: "When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot is tasked to pilot a spacecraft, along with a team of researchers, to find a new planet for humans.",
    director: "Christopher Nolan",
    cast: "Matthew McConaughey, Anne Hathaway, Jessica Chastain",
    studio: "Paramount / Legendary",
    rank: 1
  },
  {
    id: 2,
    title: "Neon Cyberpunk 2099",
    category: "Action",
    rating: 8.4,
    year: 2025,
    duration: "2h 15m",
    age: "R",
    genre: "Action",
    genres: ["Action", "Sci-Fi", "Thriller"],
    poster: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=600",
    backdrop: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=1920",
    desc: "In a neon-drenched dystopian megacity, an elite cybernetically enhanced mercenary uncovers a massive corporate conspiracy threatening the remaining free colonies.",
    director: "Denis Villeneuve",
    cast: "Keanu Reeves, Ana de Armas, Idris Elba",
    studio: "CyberNet Productions",
    rank: 2
  },
  {
    id: 3,
    title: "The Silent Abyss",
    category: "Top Rated",
    rating: 9.1,
    year: 2026,
    duration: "1h 58m",
    age: "PG-13",
    genre: "Drama",
    genres: ["Drama", "Mystery", "Thriller"],
    poster: "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&q=80&w=600",
    backdrop: "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&q=80&w=1920",
    desc: "Deep sea researchers uncover an ancient subterranean anomaly in the Mariana Trench, awakening primordial forces that challenge human comprehension.",
    director: "Guillermo del Toro",
    cast: "Oscar Isaac, Florence Pugh, Willem Dafoe",
    studio: "Oceanic Films",
    rank: 3
  },
  {
    id: 4,
    title: "Realm of Legends",
    category: "Upcoming",
    rating: 8.7,
    year: 2027,
    duration: "1h 45m",
    age: "PG",
    genre: "Animation",
    genres: ["Animation", "Fantasy", "Adventure"],
    poster: "https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&q=80&w=600",
    backdrop: "https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&q=80&w=1920",
    desc: "A young spirited spirit-weaver embarks on an epic quest across floating celestial islands to restore the shattered heart of the ancient dragon realm.",
    director: "Makoto Shinkai",
    cast: "Tom Holland, Zendaya, Stephanie Hsu",
    studio: "Animation Works",
    rank: 4
  },
  {
    id: 5,
    title: "Shadow Syndicate",
    category: "Action",
    rating: 7.9,
    year: 2025,
    duration: "2h 05m",
    age: "R",
    genre: "Action",
    genres: ["Action", "Crime", "Thriller"],
    poster: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&q=80&w=600",
    backdrop: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&q=80&w=1920",
    desc: "An international syndicate of elite hackers and black-ops agents execute an impossible heist across European capitals while evading global intelligence.",
    director: "Chad Stahelski",
    cast: "Jason Statham, Charlize Peterson, Donnie Yen",
    studio: "Apex Action Studios",
    rank: 5
  },
  {
    id: 6,
    title: "Starlight Sonata",
    category: "Top Rated",
    rating: 8.8,
    year: 2024,
    duration: "2h 10m",
    age: "PG-13",
    genre: "Drama",
    genres: ["Drama", "Romance", "Music"],
    poster: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=600",
    backdrop: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=1920",
    desc: "Against the backdrop of 1920s Paris, two prodigal musicians find solace, passion, and heartbreak as their melodies capture the soul of a changing continent.",
    director: "Damien Chazelle",
    cast: "Timothée Chalamet, Saoirse Ronan, Cillian Murphy",
    studio: "CineArts Guild",
    rank: 6
  },
  {
    id: 7,
    title: "Quantum Paradox",
    category: "Upcoming",
    rating: 8.3,
    year: 2027,
    duration: "2h 20m",
    age: "PG-13",
    genre: "Sci-Fi",
    genres: ["Sci-Fi", "Mystery"],
    poster: "https://images.unsplash.com/photo-1507499739999-097706ad8914?auto=format&fit=crop&q=80&w=600",
    backdrop: "https://images.unsplash.com/photo-1507499739999-097706ad8914?auto=format&fit=crop&q=80&w=1920",
    desc: "Physicists testing a particle accelerator accidentally fracture timelines, forcing them to navigate parallel realities before their own universe collapses.",
    director: "Rian Johnson",
    cast: "Ryan Gosling, Emma Stone, Mark Ruffalo",
    studio: "Quantum Horizon",
    rank: 7
  },
  {
    id: 8,
    title: "Chronicles of Valoria",
    category: "Trending",
    rating: 8.2,
    year: 2025,
    duration: "2h 35m",
    age: "PG-13",
    genre: "Action",
    genres: ["Action", "Adventure", "Fantasy"],
    poster: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=600",
    backdrop: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=1920",
    desc: "An exiled prince returns to reclaim his ancestral throne with the help of rebel clans and mythical beasts in a sweeping tale of honor and warfare.",
    director: "Peter Jackson",
    cast: "Henry Cavill, Anya Taylor-Joy, Mads Mikkelsen",
    studio: "Epic Fantasy Films",
    rank: 8
  },
  {
    id: 9,
    title: "Echoes in the Fog",
    category: "Top Rated",
    rating: 8.0,
    year: 2024,
    duration: "1h 52m",
    age: "R",
    genre: "Drama",
    genres: ["Drama", "Thriller"],
    poster: "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=600",
    backdrop: "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=1920",
    desc: "A retired detective living in a secluded coastal town is drawn into a chilling cold case when unsettling clues wash ashore during a heavy autumn storm.",
    director: "Denis Villeneuve",
    cast: "Liam Neeson, Emily Blunt, Javier Bardem",
    studio: "Midnight Productions",
    rank: 9
  },
  {
    id: 10,
    title: "Aetheria: Awakening",
    category: "Upcoming",
    rating: 8.5,
    year: 2027,
    duration: "1h 40m",
    age: "PG",
    genre: "Animation",
    genres: ["Animation", "Sci-Fi", "Family"],
    poster: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=600",
    backdrop: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=1920",
    desc: "In an ethereal floating world powered by pure crystalline energy, a young robotic companion discovers emotions and sets off to save its ecosystem.",
    director: "Hayao Miyazaki",
    cast: "Millie Bobby Brown, Chris Pratt, Awkwafina",
    studio: "Skyline Animation",
    rank: 10
  }
];

export function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [watchlist, setWatchlist] = useState(() => {
    try {
      const saved = localStorage.getItem('cv_watchlist');
      return saved ? JSON.parse(saved) : [1, 3];
    } catch {
      return [1, 3];
    }
  });
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [viewingWatchlistOnly, setViewingWatchlistOnly] = useState(false);
  const toastTimerRef = useRef(null);

  // Save watchlist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('cv_watchlist', JSON.stringify(watchlist));
    } catch (e) {
      console.error(e);
    }
  }, [watchlist]);

  // Cleanup toast timer on unmount
  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  const showToast = (text) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToastMessage(text);
    toastTimerRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const toggleWatchlist = (id, e) => {
    if (e) e.stopPropagation();
    if (watchlist.includes(id)) {
      setWatchlist(watchlist.filter(item => item !== id));
      showToast("Removed from My List");
    } else {
      setWatchlist([...watchlist, id]);
      showToast("Added to My List successfully!");
    }
  };

  // Filter movies
  const query = searchQuery.trim().toLowerCase();
  const filteredMovies = MOVIES_DATA.filter(movie => {
    const matchesSearch =
      query === '' ||
      movie.title.toLowerCase().includes(query) ||
      movie.director.toLowerCase().includes(query) ||
      movie.cast.toLowerCase().includes(query) ||
      movie.genre.toLowerCase().includes(query) ||
      movie.genres.some(g => g.toLowerCase().includes(query));

    if (viewingWatchlistOnly) {
      return watchlist.includes(movie.id) && matchesSearch;
    }

    const matchesTab =
      activeTab === 'All' ||
      movie.category === activeTab ||
      movie.genre === activeTab ||
      movie.genres.includes(activeTab);

    return matchesTab && matchesSearch;
  });

  return (
    <div className="cv-app">
      {/* 1. HEADER & NAVIGATION */}
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        watchlistCount={watchlist.length}
        viewingWatchlistOnly={viewingWatchlistOnly}
        onSelectWatchlist={() => {
          setViewingWatchlistOnly(true);
          document.getElementById('movies')?.scrollIntoView({ behavior: 'smooth' });
        }}
        onSelectHome={() => {
          setViewingWatchlistOnly(false);
        }}
        onSelectCategory={(category) => {
          setViewingWatchlistOnly(false);
          setActiveTab(category);
        }}
      />

      {/* 2. HERO BANNER */}
      {!viewingWatchlistOnly && searchQuery === '' && (
        <section className="cv-hero" id="home">
          <div className="cv-hero-bg"></div>
          <div className="cv-hero-overlay"></div>
          <div className="cv-hero-content">
            <div className="cv-hero-badge">🔥 Featured Masterpiece</div>
            <h1 className="cv-hero-title">Interstellar Odyssey</h1>
            <div className="cv-hero-meta">
              <span className="cv-meta-rating">⭐ 8.9</span>
              <span>2026</span>
              <span className="cv-age-tag">PG-13</span>
              <span>⏱️ 2h 49m</span>
            </div>
            <div className="cv-hero-genres">
              <span className="cv-genre-tag">Sci-Fi</span>
              <span className="cv-genre-tag">Adventure</span>
              <span className="cv-genre-tag">Drama</span>
            </div>
            <p className="cv-hero-desc">
              When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot is tasked to pilot a spacecraft, along with a team of researchers, to find a new planet for humans.
            </p>
            <div className="cv-hero-btns">
              <button className="cv-btn cv-btn-primary" onClick={() => setSelectedMovie(MOVIES_DATA[0])}>
                ▶ Watch Trailer
              </button>
              <button className="cv-btn cv-btn-secondary" onClick={() => setSelectedMovie(MOVIES_DATA[0])}>
                ℹ More Info
              </button>
            </div>
          </div>
        </section>
      )}

      {/* MAIN CATALOG CONTAINER */}
      <div className="cv-container" id="movies" style={viewingWatchlistOnly || searchQuery !== '' ? { marginTop: '70px' } : undefined}>
        <h2 className="cv-section-title">
          {viewingWatchlistOnly ? 'My Watchlist' : 'Explore Cinematic Universe'}
        </h2>

        {/* 3. FILTERABLE CATEGORY TABS */}
        {!viewingWatchlistOnly && (
          <div className="cv-tabs">
            {['All', 'Trending', 'Top Rated', 'Upcoming', 'Action', 'Drama', 'Sci-Fi', 'Animation'].map(tab => (
              <button
                key={tab}
                className={`cv-tab-btn ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
        )}

        {/* 4. MOVIE GRID */}
        <div className="cv-grid">
          {filteredMovies.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎬</div>
              <h3>No movies found</h3>
              <p>Try searching for another title or clear your filters.</p>
            </div>
          ) : (
            filteredMovies.map(movie => {
              const isSaved = watchlist.includes(movie.id);
              return (
                <div key={movie.id} className="cv-card" onClick={() => setSelectedMovie(movie)}>
                  <div className="cv-poster-wrap">
                    <img src={movie.poster} alt={movie.title} className="cv-poster" loading="lazy" />
                    <div className="cv-card-overlay">
                      <button className="cv-action-circle" title="Play Movie" onClick={(e) => { e.stopPropagation(); setSelectedMovie(movie); }}>
                        ▶
                      </button>
                      <button className="cv-action-circle secondary" title={isSaved ? "Remove from Watchlist" : "Add to Watchlist"} onClick={(e) => toggleWatchlist(movie.id, e)}>
                        {isSaved ? '✓' : '+'}
                      </button>
                    </div>
                  </div>
                  <div className="cv-card-info">
                    <h3 className="cv-card-title">{movie.title}</h3>
                    <div className="cv-card-footer">
                      <span className="cv-card-genre">{movie.genre}</span>
                      <span className="cv-meta-rating">⭐ {movie.rating}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 5. TOP 10 RANKINGS SECTION */}
      {!viewingWatchlistOnly && (
        <section className="cv-top10-section" id="top10">
          <div className="cv-container" style={{ padding: 0 }}>
            <h2 className="cv-section-title">Top 10 Movies Today</h2>
            <div className="cv-top10-carousel">
              {MOVIES_DATA.slice(0, 10).map((movie, index) => (
                <div key={movie.id} className="cv-top10-card" onClick={() => setSelectedMovie(movie)}>
                  <div className="cv-top10-number">{index + 1}</div>
                  <div className="cv-top10-poster-wrap">
                    <img src={movie.poster} alt={movie.title} loading="lazy" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 6. INTERACTIVE DETAIL MODAL */}
      {selectedMovie && (
        <div className="cv-modal-overlay" onClick={() => setSelectedMovie(null)}>
          <div className="cv-modal-container" onClick={(e) => e.stopPropagation()}>
            <button className="cv-modal-close" onClick={() => setSelectedMovie(null)}>✕</button>

            <div className="cv-modal-hero" style={{ backgroundImage: `url('${selectedMovie.backdrop}')` }}>
              <div className="cv-modal-hero-overlay">
                <div className="cv-hero-btns">
                  <button className="cv-btn cv-btn-primary" onClick={() => { showToast(`Streaming "${selectedMovie.title}" in Ultra-HD...`); setSelectedMovie(null); }}>
                    ▶ Play Movie
                  </button>
                  <button className="cv-btn cv-btn-secondary" onClick={() => toggleWatchlist(selectedMovie.id)}>
                    {watchlist.includes(selectedMovie.id) ? '✓ In My List' : '+ Add to List'}
                  </button>
                </div>
              </div>
            </div>

            <div className="cv-modal-body">
              <h2 className="cv-modal-title">{selectedMovie.title}</h2>
              <div className="cv-modal-meta">
                <span className="cv-meta-rating">⭐ {selectedMovie.rating}</span>
                <span>{selectedMovie.year}</span>
                <span className="cv-age-tag">{selectedMovie.age}</span>
                <span>⏱️ {selectedMovie.duration}</span>
                <span style={{ color: 'var(--accent-red)', fontWeight: 600 }}>{selectedMovie.genre}</span>
              </div>
              <p className="cv-modal-desc">{selectedMovie.desc}</p>

              <div className="cv-modal-grid">
                <div>
                  <div className="cv-crew-label">Director</div>
                  <div className="cv-crew-val">{selectedMovie.director}</div>
                </div>
                <div>
                  <div className="cv-crew-label">Main Cast</div>
                  <div className="cv-crew-val">{selectedMovie.cast}</div>
                </div>
                <div>
                  <div className="cv-crew-label">Studio</div>
                  <div className="cv-crew-val">{selectedMovie.studio}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="cv-toast">
          <span>🔔</span>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>CineVault Notification</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{toastMessage}</div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="cv-footer">
        <div className="cv-footer-content">
          <div className="cv-logo" style={{ justifyContent: 'center' }} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <span className="cv-logo-icon">🎬</span>
            <span className="cv-logo-text">CineVault</span>
          </div>
          <p>Your premier destination for high-definition cinematic masterpieces. Stream blockbuster movies, award-winning indie films, and immersive series anytime.</p>
          <div className="cv-footer-links">
            <a href="#privacy">Privacy Policy</a>
            <a href="#terms">Terms of Service</a>
            <a href="#help">Help Center</a>
            <a href="#cookies">Cookie Preferences</a>
          </div>
          <p>&copy; 2026 CineVault Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}


