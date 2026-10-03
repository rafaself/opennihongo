import { Link } from "@tanstack/react-router";
import { appSections, navigationSections } from "../app/sections";
import { AppNavIcon } from "./AppNavIcon";

export function AppNavigation({ onNavigate }: { onNavigate: () => void }) {
  return (
    <nav aria-label="Primary navigation" className="app-navigation">
      <ul className="app-navigation__list">
        {navigationSections.map(({ icon, label, path, status }) => (
          <li key={path}>
            <Link
              activeOptions={{
                exact: path !== appSections.practice.path,
                includeSearch: false,
              }}
              activeProps={{ "aria-current": "page" }}
              className="app-navigation__item"
              onClick={onNavigate}
              to={path}
            >
              <AppNavIcon name={icon} />
              <span className="app-navigation__label">{label}</span>
              {status === "upcoming" && (
                <span className="app-navigation__soon">Soon</span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
