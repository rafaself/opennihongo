import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { navigationSections } from "../app/sections";
import { AppNavigation } from "./AppNavigation";
import "./AppLayout.css";

function AppBrand({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      aria-label="OpenNihongo home"
      className={`app-brand${compact ? " app-brand--compact" : ""}`}
      to="/"
    >
      <span aria-hidden="true" className="app-brand__mark">
        日
      </span>
      <span className="app-brand__name">OpenNihongo</span>
    </Link>
  );
}

export function AppLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const mainRef = useRef<HTMLElement>(null);
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  const previousPath = useRef(pathname);

  useEffect(() => {
    const normalizedPath =
      pathname === "/" ? pathname : pathname.replace(/\/+$/, "");
    const section = navigationSections.find(
      ({ path }) => path === normalizedPath,
    );
    document.title = `${section?.label ?? "Page not found"} · OpenNihongo`;

    if (previousPath.current !== pathname) {
      previousPath.current = pathname;
      mainRef.current?.focus();
    }
  }, [pathname]);

  return (
    <div className="app-shell">
      <a className="app-skip-link" href="#app-main">
        Skip to content
      </a>

      <header className="app-mobile-header">
        <AppBrand compact />
        <button
          aria-controls="app-sidebar"
          aria-expanded={menuOpen}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          className="app-mobile-header__button"
          onClick={() => {
            setMenuOpen((open) => !open);
          }}
          ref={menuButtonRef}
          type="button"
        >
          <span aria-hidden="true" className="app-mobile-header__icon">
            <span />
            <span />
            <span />
          </span>
          Menu
        </button>
      </header>

      <aside
        className="app-sidebar"
        data-open={menuOpen}
        id="app-sidebar"
        onKeyDown={(event) => {
          if (event.key === "Escape" && menuOpen) {
            setMenuOpen(false);
            menuButtonRef.current?.focus();
          }
        }}
      >
        <div className="app-sidebar__brand">
          <AppBrand />
        </div>
        <AppNavigation
          onNavigate={() => {
            setMenuOpen(false);
            mainRef.current?.focus();
          }}
        />
      </aside>

      <div className="app-shell__body">
        <main
          className="app-shell__main"
          id="app-main"
          ref={mainRef}
          tabIndex={-1}
        >
          <Outlet />
        </main>
        <footer className="app-shell__footer">
          A local-first Japanese learning space
        </footer>
      </div>
    </div>
  );
}
