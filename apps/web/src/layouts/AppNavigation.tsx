import { Link } from "@tanstack/react-router";
import { AppNavIcon, type AppNavIconName } from "./AppNavIcon";

const upcomingSections: readonly {
  label: string;
  icon: AppNavIconName;
}[] = [
  { label: "Kana", icon: "kana" },
  { label: "Practice", icon: "practice" },
  { label: "Progress", icon: "progress" },
  { label: "Quests", icon: "quests" },
  { label: "Library", icon: "library" },
];

export function AppNavigation({ onNavigate }: { onNavigate: () => void }) {
  return (
    <nav aria-label="Primary navigation" className="app-navigation">
      <ul className="app-navigation__list">
        <li>
          <Link
            activeOptions={{ exact: true }}
            activeProps={{ "aria-current": "page" }}
            className="app-navigation__item"
            onClick={onNavigate}
            to="/"
          >
            <AppNavIcon name="learn" />
            <span className="app-navigation__label">Learn</span>
          </Link>
        </li>
        {upcomingSections.map(({ icon, label }) => (
          <li key={label}>
            <span
              aria-disabled="true"
              className="app-navigation__item app-navigation__item--upcoming"
              title={`${label} coming soon`}
            >
              <AppNavIcon name={icon} />
              <span className="app-navigation__label">{label}</span>
              <span className="app-navigation__soon">Soon</span>
            </span>
          </li>
        ))}
      </ul>
    </nav>
  );
}
