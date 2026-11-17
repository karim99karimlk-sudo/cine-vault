import { useState, useEffect, useMemo } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { fetchActorDetails, getImageUrl } from '../services/tmdb';
import MovieCard from '../components/MovieCard';
import { SkeletonGrid } from '../components/SkeletonCard';
import './ActorPage.css';

function calculateAge(birthday, deathday) {
  if (!birthday) return null;
  const birthDate = new Date(birthday);
  const endDate = deathday ? new Date(deathday) : new Date();
  if (Number.isNaN(birthDate.getTime())) return null;
  let age = endDate.getFullYear() - birthDate.getFullYear();
  const m = endDate.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && endDate.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

export default function ActorPage({
  genreMap = {},
  isInWatchlist = () => false,
  onSelectMovie = () => {},
  onToggleWatchlist = () => {},
}) {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const passedActor = location.state?.actor || null;

  const [person, setPerson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bioExpanded, setBioExpanded] = useState(false);
  const [sortBy, setSortBy] = useState('popular'); // 'popular' | 'newest'
  const [mediaFilter, setMediaFilter] = useState('all'); // 'all' | 'movie' | 'tv'

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  useEffect(() => {
    if (!id) return;

    let isMounted = true;

    fetchActorDetails(id)
      .then((data) => {
        if (isMounted) {
          setPerson(data);
          setError(null);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'Failed to load actor details.');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  // Deduplicate and sort actor's combined movie & TV credits
  const filmography = useMemo(() => {
    const rawCast = person?.combined_credits?.cast || person?.movie_credits?.cast || [];
    const seen = new Set();
    const uniqueItems = [];

    for (const item of rawCast) {
      if (!item || !item.id) continue;
      const type = item.media_type || (item.first_air_date ? 'tv' : 'movie');
      if (mediaFilter !== 'all' && type !== mediaFilter) continue;

      const key = `${type}-${item.id}`;
      if (!seen.has(key)) {
        seen.add(key);
        uniqueItems.push(item);
      }
    }

    return uniqueItems.sort((a, b) => {
      if (sortBy === 'newest') {
        const dateA = a.release_date || '0000-00-00';
        const dateB = b.release_date || '0000-00-00';
        return dateB.localeCompare(dateA);
      }
      const scoreA = (a.popularity || 0) + (a.vote_count || 0) * 0.05;
      const scoreB = (b.popularity || 0) + (b.vote_count || 0) * 0.05;
      return scoreB - scoreA;
    });
  }, [person, sortBy, mediaFilter]);

  const data = person || passedActor || { id, name: 'Actor Profile' };
  const age = calculateAge(person?.birthday, person?.deathday);
  const biography = person?.biography?.trim() || '';
  const isLongBio = biography.length > 550;
  const displayedBio =
    !bioExpanded && isLongBio ? `${biography.slice(0, 550).trim()}...` : biography;

  return (
    <div className="cv-container cv-actor-page">
      {/* Top Back Navigation */}
      <div className="cv-actor-topbar">
        <button
          type="button"
          className="cv-btn cv-btn-secondary cv-btn-sm"
          onClick={() => navigate(-1)}
        >
          ← Back
        </button>
      </div>

      {error && (
        <div className="cv-error-banner" role="alert">
          <div>
            <strong>⚠️ Error loading actor profile:</strong> {error}
          </div>
        </div>
      )}

      {/* Actor Profile Header Card */}
      <section className="cv-actor-profile-card">
        <div className="cv-actor-photo-wrap">
          <img
            src={getImageUrl(data.profile_path, 'w500')}
            alt={data.name}
            className="cv-actor-photo"
          />
        </div>

        <div className="cv-actor-details">
          <div className="cv-actor-badges">
            <span className="cv-actor-dept-badge">
              🎭 {person?.known_for_department || 'Acting'}
            </span>
            {passedActor?.character && (
              <span className="cv-genre-tag">
                Role: <strong>{passedActor.character}</strong>
              </span>
            )}
          </div>

          <h1 className="cv-actor-name">{data.name}</h1>

          {loading ? (
            <div className="cv-actor-skeleton-info" aria-hidden="true">
              <div
                className="cv-skeleton-line cv-skeleton-shimmer"
                style={{ width: '55%', height: '20px', marginBottom: '1rem' }}
              />
              <div
                className="cv-skeleton-line cv-skeleton-shimmer"
                style={{ width: '95%', height: '16px', marginBottom: '0.6rem' }}
              />
              <div
                className="cv-skeleton-line cv-skeleton-shimmer"
                style={{ width: '90%', height: '16px', marginBottom: '0.6rem' }}
              />
              <div
                className="cv-skeleton-line cv-skeleton-shimmer"
                style={{ width: '75%', height: '16px' }}
              />
            </div>
          ) : (
            <>
              <div className="cv-actor-meta-grid">
                {person?.birthday && (
                  <div className="cv-actor-meta-item">
                    <span className="cv-crew-label">Born</span>
                    <span className="cv-crew-val">
                      {person.birthday}
                      {age !== null && !person.deathday ? ` (${age} years old)` : ''}
                    </span>
                  </div>
                )}

                {person?.deathday && (
                  <div className="cv-actor-meta-item">
                    <span className="cv-crew-label">Died</span>
                    <span className="cv-crew-val">
                      {person.deathday}
                      {age !== null ? ` (aged ${age})` : ''}
                    </span>
                  </div>
                )}

                {person?.place_of_birth && (
                  <div className="cv-actor-meta-item">
                    <span className="cv-crew-label">Place of Birth</span>
                    <span className="cv-crew-val">{person.place_of_birth}</span>
                  </div>
                )}

                <div className="cv-actor-meta-item">
                  <span className="cv-crew-label">Movies</span>
                  <span className="cv-crew-val">{filmography.length} Credits</span>
                </div>

                {typeof data.popularity === 'number' && (
                  <div className="cv-actor-meta-item">
                    <span className="cv-crew-label">Popularity</span>
                    <span className="cv-crew-val">🔥 {data.popularity.toFixed(1)}</span>
                  </div>
                )}
              </div>

              <div className="cv-actor-bio-section">
                <div className="cv-crew-label" style={{ marginBottom: '0.5rem' }}>
                  Biography
                </div>
                <p className="cv-actor-bio">
                  {displayedBio || `No biography is currently available for ${data.name}.`}
                </p>
                {isLongBio && (
                  <button
                    type="button"
                    className="cv-bio-toggle"
                    onClick={() => setBioExpanded((prev) => !prev)}
                  >
                    {bioExpanded ? 'Show Less ▲' : 'Read Full Biography ▼'}
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Actor Filmography Section */}
      <section className="cv-catalog-section" style={{ marginTop: '3rem' }}>
        <div className="cv-section-header">
          <h2 className="cv-section-title" style={{ marginBottom: 0 }}>
            Known For & Filmography ({filmography.length})
          </h2>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', maxWidth: '100%' }}>
            <div className="cv-category-pills">
              {[
                { id: 'all', label: 'All Credits' },
                { id: 'movie', label: 'Movies' },
                { id: 'tv', label: 'TV Shows' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  className={`cv-pill-btn ${mediaFilter === tab.id ? 'active' : ''}`}
                  onClick={() => setMediaFilter(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {filmography.length > 1 && (
              <div className="cv-category-pills">
                <button
                  type="button"
                  className={`cv-pill-btn ${sortBy === 'popular' ? 'active' : ''}`}
                  onClick={() => setSortBy('popular')}
                >
                  Most Popular
                </button>
                <button
                  type="button"
                  className={`cv-pill-btn ${sortBy === 'newest' ? 'active' : ''}`}
                  onClick={() => setSortBy('newest')}
                >
                  Newest First
                </button>
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <SkeletonGrid count={10} />
        ) : filmography.length === 0 ? (
          <div className="cv-empty-state">
            <div className="cv-empty-icon">🎬</div>
            <h3>No credits found</h3>
            <p>We couldn't find any appearances matching the selected filter for {data.name}.</p>
          </div>
        ) : (
          <div className="cv-grid">
            {filmography.map((movie) => (
              <MovieCard
                key={`${movie.media_type || 'movie'}-${movie.id}`}
                movie={movie}
                genreMap={genreMap}
                isSaved={isInWatchlist(movie.id)}
                onSelect={onSelectMovie}
                onToggleWatchlist={onToggleWatchlist}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
