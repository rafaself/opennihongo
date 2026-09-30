import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { appSections, navigationSections } from "../app/sections";
import { AppNavigation } from "./AppNavigation";
import "./AppLayout.css";

function AppBrand({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      aria-label="OpenNihongo home"
      className={`app-brand${compact ? " app-brand--compact" : ""}`}
      to="/"
    >
      <img
        alt=""
        className="app-brand__mark"
        height="36"
        src={`${import.meta.env.BASE_URL}kitsune.svg`}
        width="36"
      />
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
  const activePath = pathname === "/" ? pathname : pathname.replace(/\/+$/, "");
  const lesson =
    activePath === "/kana/lesson" ||
    activePath === "/practice/kana/reading" ||
    activePath === "/practice/kana/matching" ||
    activePath === "/practice/kana/quiz" ||
    activePath === "/practice/words/matching";
  const previousPath = useRef(pathname);

  useEffect(() => {
    const section = navigationSections.find(({ path }) => path === activePath);
    const pageTitle =
      activePath === "/acknowledgements"
        ? "Acknowledgements & licenses"
        : activePath === "/kana/lesson"
          ? appSections.kana.label
          : activePath === "/practice/kana/reading"
            ? "Kana reading"
            : activePath === "/practice/kana/matching"
              ? "Kana matching"
              : activePath === "/practice/kana/quiz"
                ? "Kana quiz"
                : activePath === "/practice/words/matching"
                  ? "Word matching"
                  : (section?.label ?? "Page not found");
    document.title = `${pageTitle} · OpenNihongo`;

    if (previousPath.current !== pathname) {
      previousPath.current = pathname;
      mainRef.current?.focus();
    }
  }, [activePath, pathname]);

  return (
    <div className={`app-shell${lesson ? " app-shell--lesson" : ""}`}>
      <a className="app-skip-link" href="#app-main">
        Skip to content
      </a>

      {!lesson && (
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
      )}

      {!lesson && (
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
      )}

      <div className="app-shell__body">
        {activePath === "/kana/lesson" && (
          <Link className="app-shell__lesson-exit" to="/">
            Leave lesson
          </Link>
        )}
        <main
          className="app-shell__main"
          id="app-main"
          ref={mainRef}
          tabIndex={-1}
        >
          <Outlet />
        </main>
        {!lesson && (
          <footer className="app-shell__footer">
            <span>A local-first Japanese learning space</span>
            <Link className="app-shell__footer-link" to="/acknowledgements">
              Acknowledgements &amp; licenses
            </Link>
          </footer>
        )}
      </div>
    </div>
  );
}
