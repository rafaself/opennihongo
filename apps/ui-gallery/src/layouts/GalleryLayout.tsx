import { useState } from "react";
import { Link, Outlet } from "@tanstack/react-router";
import { galleryNavigation } from "../catalog/navigation";
import "./GalleryNavigation.css";

export function GalleryLayout() {
  const [openSectionId, setOpenSectionId] = useState<string | null>(null);

  return (
    <div className="gallery-shell">
      <header className="gallery-header">
        <div className="gallery-header-inner">
          <Link
            aria-label="OpenNihongo Design System home"
            className="gallery-brand"
            onClick={() => {
              setOpenSectionId(null);
            }}
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
              onClick={() => {
                setOpenSectionId(null);
              }}
              to={galleryNavigation.overview.to}
            >
              {galleryNavigation.overview.label}
            </Link>
            {galleryNavigation.sections.map((section) => (
              <details
                className="gallery-navigation-section"
                key={section.id}
                onToggle={(event) => {
                  if (event.currentTarget.open) {
                    setOpenSectionId(section.id);
                  } else {
                    setOpenSectionId((currentSectionId) =>
                      currentSectionId === section.id ? null : currentSectionId,
                    );
                  }
                }}
                open={openSectionId === section.id}
              >
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
                            <Link
                              hash={link.hash}
                              onClick={() => {
                                setOpenSectionId(null);
                              }}
                              to={link.to}
                            >
                              {link.label}
                            </Link>
                          ) : (
                            <Link
                              onClick={() => {
                                setOpenSectionId(null);
                              }}
                              to={link.to}
                            >
                              {link.label}
                            </Link>
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
