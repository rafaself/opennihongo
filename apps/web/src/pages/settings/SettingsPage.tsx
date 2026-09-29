import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Surface, Switch } from "@opennihongo/ui";
import {
  readAppPreferences,
  saveAppPreferences,
  type AppPreferences,
  type ThemePreference,
} from "../../app/preferences";
import "./SettingsPage.css";

export function SettingsPage() {
  const [preferences, setPreferences] = useState(readAppPreferences);

  function updatePreferences(changes: Partial<AppPreferences>) {
    const next = { ...preferences, ...changes };
    setPreferences(next);
    saveAppPreferences(next);
  }

  return (
    <section aria-labelledby="settings-title" className="settings-page">
      <header className="settings-page__header">
        <p className="settings-page__eyebrow">Your learning space</p>
        <h1 id="settings-title">Settings</h1>
        <p>Choose how OpenNihongo looks and supports your study routine.</p>
      </header>

      <div className="settings-page__layout">
        <div className="settings-page__preferences">
          <p className="settings-page__section-label">Preferences</p>

          <section
            aria-labelledby="settings-experience"
            className="settings-page__section"
            id="experience"
          >
            <h2 id="settings-experience">Experience</h2>
            <div className="settings-page__row">
              <div className="settings-page__row-copy">
                <h3 id="settings-motion-label">Reduce motion</h3>
                <p>Limit animations and transitions throughout the app.</p>
              </div>
              <Switch
                aria-labelledby="settings-motion-label"
                checked={preferences.reduceMotion}
                onCheckedChange={(reduceMotion) => {
                  updatePreferences({ reduceMotion });
                }}
              />
            </div>
          </section>

          <section
            aria-labelledby="settings-visual"
            className="settings-page__section"
            id="visual"
          >
            <h2 id="settings-visual">Visual</h2>
            <div className="settings-page__row settings-page__row--select">
              <div className="settings-page__row-copy">
                <label htmlFor="settings-theme">Color theme</label>
                <p>Use your system appearance or choose a theme.</p>
              </div>
              <select
                id="settings-theme"
                onChange={(event) => {
                  updatePreferences({
                    theme: event.target.value as ThemePreference,
                  });
                }}
                value={preferences.theme}
              >
                <option value="system">System default</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>
          </section>

          <section
            aria-labelledby="settings-japanese"
            className="settings-page__section"
            id="japanese"
          >
            <h2 id="settings-japanese">Japanese</h2>
            <div className="settings-page__row">
              <div className="settings-page__row-copy">
                <h3 id="settings-romaji-label">Show romaji</h3>
                <p>Show Latin readings alongside kana in your Words library.</p>
              </div>
              <Switch
                aria-labelledby="settings-romaji-label"
                checked={preferences.showRomaji}
                onCheckedChange={(showRomaji) => {
                  updatePreferences({ showRomaji });
                }}
              />
            </div>
          </section>
        </div>

        <aside
          aria-label="Settings information"
          className="settings-page__aside"
        >
          <Surface className="settings-page__card" elevation="card">
            <h2>Settings</h2>
            <nav aria-label="Settings sections">
              <a href="#experience">Experience</a>
              <a href="#visual">Visual</a>
              <a href="#japanese">Japanese</a>
            </nav>
          </Surface>
          <Surface className="settings-page__card" elevation="card">
            <h2>Saved on this device</h2>
            <p>
              Your preferences stay in this browser and are not sent to an
              account.
            </p>
            <Link to="/acknowledgements">About OpenNihongo</Link>
          </Surface>
        </aside>
      </div>
    </section>
  );
}
