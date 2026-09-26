import { useEffect, useRef, useState } from "react";
import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import { IconButton } from "@opennihongo/ui";
import { galleryNavigation } from "../catalog/navigation";
import "./GalleryLayout.css";

type Theme = "light" | "dark";

interface GalleryPageHeading {
  readonly id: string;
  readonly title: string;
}

function GalleryPageContents({ pathname }: { readonly pathname: string }) {
  const [headings, setHeadings] = useState<readonly GalleryPageHeading[]>([]);

  useEffect(() => {
    const main = document.querySelector(".gallery-main");
    if (!main) {
      setHeadings([]);
      return;
    }

    const updateHeadings = () => {
      const pageHeadings = Array.from(
        main.querySelectorAll<HTMLElement>("h2[id]"),
      ).flatMap((heading) => {
        const title = heading.textContent.trim();
        return title ? [{ id: heading.id, title }] : [];
      });

      setHeadings((currentHeadings) =>
        currentHeadings.length === pageHeadings.length &&
        currentHeadings.every((heading, index) => {
          const pageHeading = pageHeadings.at(index);
          return (
            pageHeading !== undefined &&
            heading.id === pageHeading.id &&
            heading.title === pageHeading.title
          );
        })
          ? currentHeadings
          : pageHeadings,
      );
    };

    const observer = new MutationObserver(updateHeadings);
    observer.observe(main, { childList: true, subtree: true });
    updateHeadings();

    return () => {
      observer.disconnect();
    };
  }, [pathname]);

  if (headings.length === 0) {
    return null;
  }

  return (
    <aside aria-label="On this page" className="gallery-toc">
      <p className="gallery-toc-title">On this page</p>
      <nav aria-label="Page contents">
        <ul>
          {headings.map(({ id, title }) => (
            <li key={id}>
              <a href={`#${id}`}>{title}</a>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}

export function GalleryLayout() {
  const [navigationOpen, setNavigationOpen] = useState(false);
  const [theme, setTheme] = useState<Theme>("light");
  const [mobileViewport, setMobileViewport] = useState(
    () => window.matchMedia("(max-width: 60rem)").matches,
  );
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const sidebarRef = useRef<HTMLElement>(null);
  const mainRef = useRef<HTMLElement>(null);
  const routeFocusRef = useRef<string | null>(null);
  const pathname = useRouterState({
    select: (routerState) => routerState.location.pathname,
  });
  const drawerOpen = navigationOpen && mobileViewport;

  useEffect(() => {
    const media = window.matchMedia("(max-width: 60rem)");
    const updateViewport = () => {
      setMobileViewport(media.matches);
      if (!media.matches) {
        setNavigationOpen(false);
        if (document.activeElement === menuButtonRef.current) {
          mainRef.current?.focus();
        }
      }
    };

    media.addEventListener("change", updateViewport);
    updateViewport();
    return () => {
      media.removeEventListener("change", updateViewport);
    };
  }, []);

  useEffect(() => {
    setNavigationOpen(false);
    if (routeFocusRef.current === pathname) {
      mainRef.current?.focus();
      routeFocusRef.current = null;
    }
  }, [pathname]);

  useEffect(() => {
    if (!drawerOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    sidebarRef.current?.querySelector<HTMLAnchorElement>("a")?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [drawerOpen]);

  useEffect(() => {
    if (!drawerOpen) {
      return;
    }

    const handleDrawerKeydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setNavigationOpen(false);
        menuButtonRef.current?.focus();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const links = Array.from(
        sidebarRef.current?.querySelectorAll<HTMLAnchorElement>("a") ?? [],
      );
      const first = links[0];
      const last = links.at(-1);
      const menu = menuButtonRef.current;
      if (!first || !last || !menu) {
        return;
      }

      if (event.shiftKey && document.activeElement === menu) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        menu.focus();
      } else if (
        document.activeElement !== menu &&
        !sidebarRef.current?.contains(document.activeElement)
      ) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleDrawerKeydown);
    return () => {
      document.removeEventListener("keydown", handleDrawerKeydown);
    };
  }, [drawerOpen]);

  const closeForRoute = (destination: string) => {
    if (!drawerOpen) {
      return;
    }

    routeFocusRef.current = destination;
    setNavigationOpen(false);
    if (destination === pathname) {
      mainRef.current?.focus();
      routeFocusRef.current = null;
    }
  };

  return (
    <div className="gallery-shell" data-theme={theme}>
      <a
        className="gallery-skip-link"
        href="#gallery-main"
        inert={drawerOpen}
        onClick={() => mainRef.current?.focus()}
      >
        Skip to content
      </a>
      <header className="gallery-header">
        <div className="gallery-header-inner">
          <Link
            aria-label="OpenNihongo Design System home"
            className="gallery-brand"
            inert={drawerOpen}
            onClick={() => {
              setNavigationOpen(false);
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
          <div className="gallery-header-actions">
            <IconButton
              aria-label={
                theme === "light"
                  ? "Switch to dark theme"
                  : "Switch to light theme"
              }
              className="gallery-theme-toggle"
              icon={theme === "light" ? "moon" : "sun"}
              inert={drawerOpen}
              onClick={() => {
                setTheme((currentTheme) =>
                  currentTheme === "light" ? "dark" : "light",
                );
              }}
              size="compact"
              variant="secondary"
            />
            <button
              aria-controls="gallery-documentation-navigation"
              aria-expanded={drawerOpen}
              aria-label={drawerOpen ? "Close navigation" : "Open navigation"}
              className="gallery-menu-toggle"
              onClick={() => {
                setNavigationOpen(!drawerOpen);
                if (drawerOpen) {
                  menuButtonRef.current?.focus();
                }
              }}
              ref={menuButtonRef}
              type="button"
            >
              <span aria-hidden="true" className="gallery-menu-icon" />
              <span>{drawerOpen ? "Close" : "Menu"}</span>
            </button>
          </div>
        </div>
      </header>

      <div className="gallery-layout">
        <aside
          className={`gallery-sidebar${drawerOpen ? " gallery-sidebar--open" : ""}`}
          id="gallery-documentation-navigation"
          ref={sidebarRef}
        >
          <nav
            aria-label="Design system navigation"
            className="gallery-navigation"
          >
            <Link
              activeOptions={{ exact: true }}
              activeProps={{ "aria-current": "page" }}
              onClick={() => {
                closeForRoute(galleryNavigation.overview.to);
              }}
              to={galleryNavigation.overview.to}
            >
              {galleryNavigation.overview.label}
            </Link>
            {galleryNavigation.sections.map((section) => (
              <div className="gallery-navigation-section" key={section.id}>
                <p className="gallery-navigation-section-title">
                  {section.label}
                </p>
                {section.links.length > 0 && (
                  <ul>
                    {section.links.map((link) => (
                      <li key={link.id}>
                        <Link
                          activeOptions={{ exact: true }}
                          activeProps={{ "aria-current": "page" }}
                          onClick={() => {
                            closeForRoute(link.to);
                          }}
                          to={link.to}
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </nav>
        </aside>

        {drawerOpen && (
          <button
            aria-label="Close navigation"
            aria-hidden="true"
            className="gallery-sidebar-backdrop"
            onClick={() => {
              setNavigationOpen(false);
              menuButtonRef.current?.focus();
            }}
            tabIndex={-1}
            type="button"
          />
        )}

        <div className="gallery-content-layout" inert={drawerOpen}>
          <main
            className="gallery-main"
            id="gallery-main"
            ref={mainRef}
            tabIndex={-1}
          >
            <span aria-hidden="true" id="top" />
            <Outlet />
          </main>
          <GalleryPageContents pathname={pathname} />
        </div>
      </div>

      <footer className="gallery-footer" inert={drawerOpen}>
        <span>OpenNihongo Design System</span>
        <span>Made for steady progress.</span>
      </footer>
    </div>
  );
}
