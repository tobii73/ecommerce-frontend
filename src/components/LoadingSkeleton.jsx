import "../styles/components/LoadingSkeleton.css";

export const Skeleton = ({ className = "" }) => (
  <span className={`loading-skeleton ${className}`} aria-hidden="true" />
);

export const ProductCardSkeleton = () => (
  <article className="home-product-card product-card-skeleton" aria-hidden="true">
    <Skeleton className="product-card-skeleton__image" />
    <div className="home-product-card__body">
      <Skeleton className="product-card-skeleton__title" />
      <Skeleton className="product-card-skeleton__price" />
      <Skeleton className="product-card-skeleton__button" />
    </div>
  </article>
);
