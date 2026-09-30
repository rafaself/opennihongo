import { afterEach, beforeEach, expect, it, vi } from "vitest";
import {
  applyAppPreferences,
  defaultAppPreferences,
  readAppPreferences,
  saveAppPreferences,
} from "./preferences";

const storageKey = "opennihongo.preferences.v1";

beforeEach(() => {
  window.localStorage.clear();
});
afterEach(() => {
  applyAppPreferences({ ...defaultAppPreferences, theme: "light" });
  delete document.documentElement.dataset["theme"];
  delete document.documentElement.dataset["motion"];
  window.localStorage.clear();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

it.each([null, "{", "null", "[]", "true", "42"])(
  "uses defaults for absent or invalid stored preferences: %s",
  (stored) => {
    if (stored !== null) window.localStorage.setItem(storageKey, stored);
    expect(readAppPreferences()).toEqual(defaultAppPreferences);
  },
);

it("reads supported values while defaulting invalid fields", () => {
  window.localStorage.setItem(
    storageKey,
    JSON.stringify({ theme: "dark", reduceMotion: true, showRomaji: false }),
  );
  expect(readAppPreferences()).toEqual({
    theme: "dark",
    reduceMotion: true,
    showRomaji: false,
  });
  window.localStorage.setItem(storageKey, JSON.stringify({ theme: "light" }));
  expect(readAppPreferences()).toEqual({
    ...defaultAppPreferences,
    theme: "light",
  });
  window.localStorage.setItem(
    storageKey,
    JSON.stringify({ theme: "unknown", reduceMotion: "yes", showRomaji: 0 }),
  );
  expect(readAppPreferences()).toEqual(defaultAppPreferences);
});

it("persists preferences and applies explicit theme and motion changes", () => {
  const preferences = {
    theme: "dark",
    reduceMotion: true,
    showRomaji: false,
  } as const;
  saveAppPreferences(preferences);
  expect(readAppPreferences()).toEqual(preferences);
  expect(document.documentElement.dataset["theme"]).toBe("dark");
  expect(document.documentElement.dataset["motion"]).toBe("reduced");
  saveAppPreferences({ ...preferences, theme: "light", reduceMotion: false });
  expect(document.documentElement.dataset["theme"]).toBe("light");
  expect(document.documentElement.dataset["motion"]).toBeUndefined();
});

it("continues applying preferences when browser storage is blocked", () => {
  vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
    throw new Error("Storage blocked");
  });
  expect(readAppPreferences()).toEqual(defaultAppPreferences);
  vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
    throw new Error("Storage blocked");
  });
  expect(() => {
    saveAppPreferences({ ...defaultAppPreferences, theme: "dark" });
  }).not.toThrow();
  expect(document.documentElement.dataset["theme"]).toBe("dark");
});

it("follows system appearance changes and detaches the listener for an explicit theme", () => {
  const query = Object.assign(new EventTarget(), { matches: true });
  const addListener = vi.spyOn(query, "addEventListener");
  const removeListener = vi.spyOn(query, "removeEventListener");
  const matchMedia = vi.fn(() => query);
  vi.stubGlobal("matchMedia", matchMedia);
  applyAppPreferences(defaultAppPreferences);
  expect(matchMedia).toHaveBeenCalledWith("(prefers-color-scheme: dark)");
  expect(document.documentElement.dataset["theme"]).toBe("dark");
  query.matches = false;
  query.dispatchEvent(new Event("change"));
  expect(document.documentElement.dataset["theme"]).toBe("light");
  applyAppPreferences({ ...defaultAppPreferences, theme: "dark" });
  expect(removeListener).toHaveBeenCalledWith(
    "change",
    addListener.mock.calls[0]?.[1],
  );
  query.dispatchEvent(new Event("change"));
  expect(document.documentElement.dataset["theme"]).toBe("dark");
  // A previously queued system change must not override an explicit theme.
  const previousListener = addListener.mock.calls[0]?.[1];
  if (typeof previousListener !== "function") {
    throw new Error("System appearance should register a change listener.");
  }
  previousListener.call(query, new Event("change"));
  expect(document.documentElement.dataset["theme"]).toBe("dark");
});

it("uses the light appearance when system theme detection is unavailable", () => {
  vi.stubGlobal("matchMedia", undefined);
  applyAppPreferences(defaultAppPreferences);
  expect(document.documentElement.dataset["theme"]).toBe("light");
});
