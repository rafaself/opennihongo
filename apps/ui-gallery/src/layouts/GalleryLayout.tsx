import { Link, Outlet } from "@tanstack/react-router";
import { galleryNavigation } from "../catalog/navigation";
import "./GalleryNavigation.css";

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
            <Link
              activeProps={{ "aria-current": "page" }}
              to={galleryNavigation.overview.to}
            >
              {galleryNavigation.overview.label}
            </Link>
            {galleryNavigation.sections.map((section) => (
              <details className="gallery-navigation-section" key={section.id}>
                <summary>{section.label}</summary>
                <div className="gallery-navigation-panel">
                  <p className="gallery-navigation-description">
                    {section.description}
                  </p>
                  {section.links.length > 0 && (
                    <ul className="gallery-navigation-links">
                      {section.links.map((link) => (
                        <li key={link.id}>
                          {"hash" in link ? (
                            <Link hash={link.hash} to={link.to}>
                              {link.label}
                            </Link>
                          ) : (
                            <Link to={link.to}>{link.label}</Link>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </details>
            ))}
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
