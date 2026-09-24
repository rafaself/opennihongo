import { Link, Outlet } from "@tanstack/react-router";

export function GalleryLayout() {
  return (
    <div className="gallery-shell">
      <header className="gallery-header">
        <div className="gallery-header-inner">
          <Link
            aria-label="OpenNihongo Design System home"
            className="gallery-brand"
            to="/"
          >
            <span aria-hidden="true" className="gallery-brand-mark">
              文
            </span>
            <span>
              OpenNihongo{" "}
              <span className="gallery-brand-subtitle">Design System</span>
            </span>
          </Link>
          <nav aria-label="Main navigation" className="gallery-navigation">
            <Link activeProps={{ "aria-current": "page" }} to="/">
              Overview
            </Link>
          </nav>
        </div>
      </header>

      <main className="gallery-main" id="top">
        <Outlet />
      </main>

      <footer className="gallery-footer">
        <span>OpenNihongo Design System</span>
        <span>Made for steady progress.</span>
      </footer>
    </div>
  );
}
