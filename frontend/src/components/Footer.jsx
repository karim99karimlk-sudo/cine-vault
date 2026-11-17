import './Footer.css';

export default function Footer() {
  return (
    <footer className="cv-footer">
      <div className="cv-footer-content">
        <div
          className="cv-logo"
          style={{ justifyContent: 'center' }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <span className="cv-logo-icon">🎬</span>
          <span className="cv-logo-text">CineVault</span>
        </div>

        <p>
          Your premier destination for high-definition cinematic discovery. Explore popular blockbusters,
          top-rated classics, and upcoming theatrical releases anytime.
        </p>

        <div className="cv-tmdb-attribution">
          <span className="cv-tmdb-badge">TMDB</span>
          <span>This product uses the TMDB API but is not endorsed or certified by TMDB.</span>
        </div>

        <div className="cv-footer-links">
          <a href="#privacy" onClick={(e) => e.preventDefault()}>Privacy Policy</a>
          <a href="#terms" onClick={(e) => e.preventDefault()}>Terms of Service</a>
          <a href="#help" onClick={(e) => e.preventDefault()}>Help Center</a>
          <a href="#cookies" onClick={(e) => e.preventDefault()}>Cookie Preferences</a>
        </div>

        <p>&copy; {new Date().getFullYear()} CineVault Inc. All rights reserved.</p>
      </div>
    </footer>
  );
}
