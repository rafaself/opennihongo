import { Link } from "@tanstack/react-router";

export function NotFoundPage() {
  return (
    <section aria-labelledby="not-found-title" className="gallery-not-found">
      <p className="gallery-eyebrow">404 / Page not found</p>
      <h1 id="not-found-title">We couldn’t find that page.</h1>
      <p>
        The address may have changed, or the page may not be part of the gallery
        yet.
      </p>
      <Link className="gallery-not-found-link" to="/">
        Return to the overview
      </Link>
    </section>
  );
}
