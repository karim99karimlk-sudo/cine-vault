
// Movie Database
const movies = [
  {
    id: 1,
    title: "Interstellar Odyssey",
    category: "Sci-Fi",
    rating: 8.9,
    year: 2024,
    duration: "2h 49m",
    age: "PG-13",
    genre: "Sci-Fi",
    genres: ["Sci-Fi", "Adventure", "Drama"],
    poster: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=600",
    backdrop: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=1920",
    desc: "When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot, Joseph Cooper, is tasked to pilot a spacecraft, along with a team of researchers, to find a new planet for humans.",
    director: "Christopher Nolan",
    cast: "Matthew McConaughey, Anne Hathaway, Jessica Chastain",
    studio: "Paramount / Legendary",
    isTrending: true,
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
    desc: "In a neon-drenched dystopian megacity, an elite cybernetically enhanced mercenary uncovers a massive corporate conspiracy that threatens the remaining free colonies.",
    director: "Denis Villeneuve",
    cast: "Keanu Reeves, Ana de Armas, Idris Elba",
    studio: "CyberNet Productions",
    isTrending: true,
    rank: 2
  },
  {
    id: 3,
    title: "The Silent Abyss",
    category: "Drama",
    rating: 8.1,
    year: 2024,
    duration: "1h 58m",
    age: "PG-13",
    genre: "Drama",
    genres: ["Drama", "Mystery", "Thriller"],
    poster: "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&q=80&w=600",
    backdrop: "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&q=80&w=1920",
    desc: "Deep sea researchers uncover an ancient subterranean anomaly in the Mariana Trench, awakening forces that challenge human comprehension and survival.",
    director: "Guillermo del Toro",
    cast: "Oscar Isaac, Florence Pugh, Willem Dafoe",
    studio: "Oceanic Films",
    isTrending: true,
    rank: 3
  },
  {
    id: 4,
    title: "Realm of Legends",
    category: "Animation",
    rating: 8.7,
    year: 2025,
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
    isTrending: true,
    rank: 4
  },
  {
    id: 5,
    title: "Shadow Syndicate",
    category: "Action",
    rating: 7.9,
    year: 2024,
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
    isTrending: true,
    rank: 5
  },
  {
    id: 6,
    title: "Starlight Sonata",
    category: "Drama",
    rating: 8.3,
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
    isTrending: true,
    rank: 6
  },
  {
    id: 7,
    title: "Quantum Paradox",
    category: "Sci-Fi",
    rating: 8.0,
    year: 2025,
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
    isTrending: true,
    rank: 7
  },
  {
    id: 8,
    title: "Chronicles of Valoria",
    category: "Action",
    rating: 8.2,
    year: 2024,
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
    isTrending: true,
    rank: 8
  },
  {
    id: 9,
    title: "Echoes in the Fog",
    category: "Drama",
    rating: 7.8,
    year: 2023,
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
    isTrending: true,
    rank: 9
  },
  {
    id: 10,
    title: "Aetheria: Awakening",
    category: "Animation",
    rating: 8.5,
    year: 2025,
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
    isTrending: true,
    rank: 10
  }
];

// My List state stored in localStorage or memory
let myList = JSON.parse(localStorage.getItem('cinevault_mylist')) || [];

// DOM Elements
const movieGrid = document.getElementById('movieGrid');
const top10Carousel = document.getElementById('top10Carousel');
const searchInput = document.getElementById('searchInput');
const filterTabs = document.querySelectorAll('.tab-btn');
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const navLinks = document.getElementById('navLinks');
const header = document.getElementById('header');

// Modal Elements
const movieModal = document.getElementById('movieModal');
const modalCloseBtn = document.getElementById('modalCloseBtn');
const modalHeroBg = document.getElementById('modalHeroBg');
const modalTitle = document.getElementById('modalTitle');
const modalMetaList = document.getElementById('modalMetaList');
const modalDesc = document.getElementById('modalDesc');
const modalDirector = document.getElementById('modalDirector');
const modalCast = document.getElementById('modalCast');
const modalStudio = document.getElementById('modalStudio');
const modalWatchlistBtn = document.getElementById('modalWatchlistBtn');
const listCount = document.getElementById('listCount');

let currentActiveMovieId = null;

// Sticky Header Effect
window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
});

// Mobile Menu Toggle
mobileMenuBtn.addEventListener('click', () => {
  navLinks.classList.toggle('active');
});

// Render Movie Grid
function renderMovies(filter = 'all', searchQuery = '') {
  movieGrid.innerHTML = '';

  let filtered = movies.filter(movie => {
    const matchesFilter = (filter === 'all') || (movie.category === filter);
    const matchesSearch = movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      movie.genre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      movie.director.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (filtered.length === 0) {
    movieGrid.innerHTML = `
                    <div style="grid-column: 1 / -1; text-align: center; padding: 4rem; color: var(--text-muted);">
                        <i class="fa-solid fa-film" style="font-size: 3rem; margin-bottom: 1rem; color: var(--accent-red);"></i>
                        <h3>No movies found</h3>
                        <p>Try searching for a different title or category.</p>
                    </div>
                `;
    return;
  }

  filtered.forEach(movie => {
    const card = document.createElement('div');
    card.className = 'movie-card';
    card.onclick = () => openModal(movie.id);

    card.innerHTML = `
                    <div class="poster-container">
                        <img src="${movie.poster}" alt="${movie.title}" class="movie-poster" loading="lazy">
                        <div class="card-overlay">
                            <button class="action-icon-btn" title="Play Movie" onclick="event.stopPropagation(); openModal(${movie.id});">
                                <i class="fa-solid fa-play"></i>
                            </button>
                            <button class="action-icon-btn secondary" title="Add to My List" onclick="event.stopPropagation(); toggleMyList(${movie.id});">
                                <i class="fa-solid ${myList.includes(movie.id) ? 'fa-check' : 'fa-plus'}"></i>
                            </button>
                        </div>
                    </div>
                    <div class="movie-info">
                        <div>
                            <h3 class="movie-title">${movie.title}</h3>
                        </div>
                        <div class="movie-details-footer">
                            <span class="movie-genre-tag">${movie.genre}</span>
                            <div class="movie-rating">
                                <i class="fa-solid fa-star"></i> ${movie.rating}
                            </div>
                        </div>
                    </div>
                `;
    movieGrid.appendChild(card);
  });
}

// Render Top 10 Carousel
function renderTop10() {
  top10Carousel.innerHTML = '';
  const topTenMovies = movies.filter(m => m.isTrending).slice(0, 10);

  topTenMovies.forEach((movie, index) => {
    const card = document.createElement('div');
    card.className = 'top10-card';
    card.onclick = () => openModal(movie.id);

    card.innerHTML = `
                    <div class="top10-number">${index + 1}</div>
                    <div class="top10-poster-wrap">
                        <img src="${movie.poster}" alt="${movie.title}" loading="lazy">
                    </div>
                `;
    top10Carousel.appendChild(card);
  });
}

// Filter Tab Events
filterTabs.forEach(btn => {
  btn.addEventListener('click', () => {
    filterTabs.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.getAttribute('data-filter');
    renderMovies(filter, searchInput.value);
  });
});

// Search Input Event
searchInput.addEventListener('input', (e) => {
  const activeTab = document.querySelector('.tab-btn.active').getAttribute('data-filter');
  renderMovies(activeTab, e.target.value);
});

// Modal Functions
function openModal(id) {
  const movie = movies.find(m => m.id === id);
  if (!movie) return;

  currentActiveMovieId = id;
  modalHeroBg.style.backgroundImage = `url('${movie.backdrop}')`;
  modalTitle.textContent = movie.title;
  modalDesc.textContent = movie.desc;
  modalDirector.textContent = movie.director;
  modalCast.textContent = movie.cast;
  modalStudio.textContent = movie.studio;

  modalMetaList.innerHTML = `
                <span class="meta-item rating"><i class="fa-solid fa-star"></i> ${movie.rating}</span>
                <span class="meta-item">${movie.year}</span>
                <span class="age-rating">${movie.age}</span>
                <span class="meta-item"><i class="fa-solid fa-clock"></i> ${movie.duration}</span>
                <span class="meta-item" style="color:var(--accent-red); font-weight:600;">${movie.genre}</span>
            `;

  updateModalWatchlistButton();

  movieModal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function openModalById(id) {
  openModal(id);
}

function closeModal() {
  movieModal.classList.remove('active');
  document.body.style.overflow = 'auto';
}

modalCloseBtn.addEventListener('click', closeModal);
movieModal.addEventListener('click', (e) => {
  if (e.target === movieModal) closeModal();
});

// My List Toggle logic
function toggleMyList(id) {
  const index = myList.indexOf(id);
  if (index > -1) {
    myList.splice(index, 1);
    showToast("Removed from My List", "Movie removed from your watchlist");
  } else {
    myList.push(id);
    showToast("Added to My List", "Movie successfully saved to your watchlist");
  }
  localStorage.setItem('cinevault_mylist', JSON.stringify(myList));
  updateListCount();
  renderMovies(document.querySelector('.tab-btn.active').getAttribute('data-filter'), searchInput.value);
  updateModalWatchlistButton();
}

function updateModalWatchlistButton() {
  if (myList.includes(currentActiveMovieId)) {
    modalWatchlistBtn.innerHTML = `<i class="fa-solid fa-check"></i> In My List`;
    modalWatchlistBtn.style.backgroundColor = 'var(--accent-red)';
    modalWatchlistBtn.style.borderColor = 'var(--accent-red)';
  } else {
    modalWatchlistBtn.innerHTML = `<i class="fa-solid fa-plus"></i> My List`;
    modalWatchlistBtn.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
    modalWatchlistBtn.style.borderColor = 'rgba(255, 255, 255, 0.15)';
  }
}

modalWatchlistBtn.addEventListener('click', () => {
  if (currentActiveMovieId) {
    toggleMyList(currentActiveMovieId);
  }
});

function updateListCount() {
  listCount.textContent = myList.length;
}

// My List Nav Filter
document.getElementById('myListNav').addEventListener('click', (e) => {
  e.preventDefault();
  filterTabs.forEach(b => b.classList.remove('active'));

  // Filter grid to show only items in My List
  movieGrid.innerHTML = '';
  const bookmarked = movies.filter(m => myList.includes(m.id));

  if (bookmarked.length === 0) {
    movieGrid.innerHTML = `
                    <div style="grid-column: 1 / -1; text-align: center; padding: 4rem; color: var(--text-muted);">
                        <i class="fa-solid fa-bookmark" style="font-size: 3rem; margin-bottom: 1rem; color: var(--accent-red);"></i>
                        <h3>Your My List is empty</h3>
                        <p>Click the '+' button on any movie card to add it to your watchlist.</p>
                    </div>
                `;
    return;
  }

  bookmarked.forEach(movie => {
    const card = document.createElement('div');
    card.className = 'movie-card';
    card.onclick = () => openModal(movie.id);

    card.innerHTML = `
                    <div class="poster-container">
                        <img src="${movie.poster}" alt="${movie.title}" class="movie-poster" loading="lazy">
                        <div class="card-overlay">
                            <button class="action-icon-btn" title="Play Movie" onclick="event.stopPropagation(); openModal(${movie.id});">
                                <i class="fa-solid fa-play"></i>
                            </button>
                            <button class="action-icon-btn secondary" title="Remove" onclick="event.stopPropagation(); toggleMyList(${movie.id});">
                                <i class="fa-solid fa-check"></i>
                            </button>
                        </div>
                    </div>
                    <div class="movie-info">
                        <div>
                            <h3 class="movie-title">${movie.title}</h3>
                        </div>
                        <div class="movie-details-footer">
                            <span class="movie-genre-tag">${movie.genre}</span>
                            <div class="movie-rating">
                                <i class="fa-solid fa-star"></i> ${movie.rating}
                            </div>
                        </div>
                    </div>
                `;
    movieGrid.appendChild(card);
  });

  // Scroll smoothly to grid
  document.getElementById('movies-section').scrollIntoView({ behavior: 'smooth' });
});

// Toast notification helper
function showToast(title, subtitle) {
  const toast = document.getElementById('toastBox');
  document.getElementById('toastTitle').textContent = title;
  document.getElementById('toastSubtitle').textContent = subtitle;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

// Simulate streaming playback
function simulatePlay() {
  showToast("Now Streaming", "Connecting to CineVault Ultra-HD servers...");
  closeModal();
}

// Initialize application on load
window.onload = function () {
  renderMovies();
  renderTop10();
  updateListCount();
};
