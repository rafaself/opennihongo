export type ThemePreference = "system" | "light" | "dark";

export type AppPreferences = Readonly<{
  theme: ThemePreference;
  reduceMotion: boolean;
  showRomaji: boolean;
}>;

const storageKey = "opennihongo.preferences.v1";

export const defaultAppPreferences: AppPreferences = {
  theme: "system",
  reduceMotion: false,
  showRomaji: true,
};

let systemThemeQuery: MediaQueryList | null = null;

function syncSystemTheme() {
  if (systemThemeQuery) {
    document.documentElement.dataset["theme"] = systemThemeQuery.matches
      ? "dark"
      : "light";
  }
}

export function readAppPreferences(): AppPreferences {
  try {
    const stored = window.localStorage.getItem(storageKey);
    if (!stored) return defaultAppPreferences;
    const parsed: unknown = JSON.parse(stored);
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      Array.isArray(parsed)
    ) {
      return defaultAppPreferences;
    }
    const values = parsed as Record<string, unknown>;
    const theme =
      values["theme"] === "light" || values["theme"] === "dark"
        ? values["theme"]
        : "system";
    return {
      theme,
      reduceMotion: values["reduceMotion"] === true,
      showRomaji: values["showRomaji"] !== false,
    };
  } catch {
    return defaultAppPreferences;
  }
}

export function applyAppPreferences(preferences: AppPreferences) {
  const root = document.documentElement;
  systemThemeQuery?.removeEventListener("change", syncSystemTheme);
  systemThemeQuery = null;

  if (
    preferences.theme === "system" &&
    typeof window.matchMedia === "function"
  ) {
    systemThemeQuery = window.matchMedia("(prefers-color-scheme: dark)");
    syncSystemTheme();
    systemThemeQuery.addEventListener("change", syncSystemTheme);
  } else {
    root.dataset["theme"] =
      preferences.theme === "system" ? "light" : preferences.theme;
  }

  if (preferences.reduceMotion) root.dataset["motion"] = "reduced";
  else delete root.dataset["motion"];
}

export function saveAppPreferences(preferences: AppPreferences) {
  applyAppPreferences(preferences);
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(preferences));
  } catch {
    // Preferences still apply for this session when browser storage is blocked.
  }
}
