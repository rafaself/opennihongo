import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RouterProvider } from "@tanstack/react-router";
import { afterEach, expect, it } from "vitest";
import { router } from "../../app/router";
import {
  applyAppPreferences,
  defaultAppPreferences,
  readAppPreferences,
} from "../../app/preferences";

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  applyAppPreferences(defaultAppPreferences);
});

it("persists theme, motion, and romaji choices and applies them to the Words library", async () => {
  const user = userEvent.setup();
  render(<RouterProvider router={router} />);
  await router.navigate({ to: "/settings" });
  await screen.findByRole("heading", { name: "Settings", level: 1 });
  await user.selectOptions(
    screen.getByRole("combobox", { name: "Color theme" }),
    "dark",
  );
  await user.click(screen.getByRole("switch", { name: "Reduce motion" }));
  await user.click(screen.getByRole("switch", { name: "Show romaji" }));
  expect(readAppPreferences()).toEqual({
    theme: "dark",
    reduceMotion: true,
    showRomaji: false,
  });
  expect(document.documentElement.dataset["theme"]).toBe("dark");
  expect(document.documentElement.dataset["motion"]).toBe("reduced");
  await user.click(screen.getByRole("link", { name: "Words" }));
  await screen.findByRole("heading", { name: "Words" });
  expect(screen.queryByText("soto")).toBeNull();
  expect(screen.getByRole("heading", { name: "そと" })).toBeTruthy();
  await user.click(screen.getByRole("link", { name: "Settings" }));
  await screen.findByRole("heading", { name: "Settings", level: 1 });
  expect(
    screen
      .getByRole("switch", { name: "Reduce motion" })
      .getAttribute("aria-checked"),
  ).toBe("true");
  expect(
    screen
      .getByRole("switch", { name: "Show romaji" })
      .getAttribute("aria-checked"),
  ).toBe("false");
  expect(
    screen.getByRole<HTMLSelectElement>("combobox", { name: "Color theme" })
      .value,
  ).toBe("dark");
  await user.click(screen.getByRole("switch", { name: "Show romaji" }));
  await user.click(screen.getByRole("link", { name: "Words" }));
  await screen.findByRole("heading", { name: "Words" });
  expect(screen.getByText("soto")).toBeTruthy();
});
