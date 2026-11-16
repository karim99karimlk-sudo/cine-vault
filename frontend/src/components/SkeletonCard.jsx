/**
 * Loading skeleton placeholder for movie cards and hero banner.
 */
export function SkeletonCard() {
  return (
    <div className="cv-card cv-skeleton-card" aria-hidden="true">
      <div className="cv-poster-wrap cv-skeleton-shimmer" />
      <div className="cv-card-info">
        <div className="cv-skeleton-line cv-skeleton-title cv-skeleton-shimmer" />
        <div className="cv-card-footer">
          <div className="cv-skeleton-line cv-skeleton-meta cv-skeleton-shimmer" />
          <div className="cv-skeleton-line cv-skeleton-rating cv-skeleton-shimmer" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonGrid({ count = 10 }) {
  return (
    <div className="cv-grid" aria-busy="true" aria-label="Loading movies">
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </div>
  );
}

export default SkeletonCard;
