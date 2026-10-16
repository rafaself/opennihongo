import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RouterProvider } from "@tanstack/react-router";
import { afterEach, beforeAll, expect, it, vi } from "vitest";

let router: typeof import("./router").router;

beforeAll(async () => {
  vi.stubEnv("PROD", true);
  window.history.replaceState(
    null,
    "",
    "/opennihongo/#/kanji/kanji.character.u4e00",
  );
  vi.spyOn(window, "scrollTo").mockImplementation(() => undefined);
  Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
    configurable: true,
    value: vi.fn(),
  });
  ({ router } = await import("./router"));
});

afterEach(() => {
  cleanup();
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
  Reflect.deleteProperty(HTMLElement.prototype, "scrollIntoView");
  window.history.replaceState(null, "", "/");
});

it("opens a shared production link and keeps navigation under the Pages path", async () => {
  const user = userEvent.setup();
  render(<RouterProvider router={router} />);

  await screen.findByRole("heading", { name: "一 · one", level: 1 });
  await user.click(screen.getByRole("link", { name: "Skip to content" }));
  expect(document.activeElement).toBe(screen.getByRole("main"));
  expect(window.location.hash).toContain("#/kanji/kanji.character.u4e00");
  await user.click(screen.getByRole("link", { name: "Next: 二" }));
  await screen.findByRole("heading", { name: "二 · two", level: 1 });
  expect(window.location.pathname).toBe("/opennihongo/");
  expect(window.location.hash).toBe("#/kanji/kanji.character.u4e8c");

  await user.click(
    screen.getByRole("link", { name: "Practice this character" }),
  );
  await screen.findByRole("heading", { name: "Set up Kanji reading" });
  expect(screen.getByRole("checkbox", { name: "二 (two)" })).toHaveProperty(
    "checked",
    true,
  );
  expect(window.location.pathname).toBe("/opennihongo/");
  expect(window.location.search).toBe("");
  expect(window.location.hash).toContain("#/practice/kanji/reading/setup?");

  await user.click(screen.getByRole("link", { name: "Settings" }));
  await screen.findByRole("heading", { name: "Settings", level: 1 });
  await user.click(screen.getByRole("link", { name: "Japanese" }));
  expect(window.location.hash).toBe("#/settings#japanese");
  expect(screen.getByRole("switch", { name: "Show romaji" })).toBeTruthy();
});
