// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { PlaygroundPage } from "./PlaygroundPage";

const root = document.documentElement;
let originalTheme: string | null;
let originalMotion: string | null;

function restoreAttribute(name: string, value: string | null) {
  if (value === null) {
    root.removeAttribute(name);
  } else {
    root.setAttribute(name, value);
  }
}

describe("PlaygroundPage presentation controls", () => {
  beforeEach(() => {
    originalTheme = root.getAttribute("data-theme");
    originalMotion = root.getAttribute("data-motion");
  });

  afterEach(() => {
    cleanup();
    restoreAttribute("data-theme", originalTheme);
    restoreAttribute("data-motion", originalMotion);
  });

  it("applies the selected shared theme and restores the prior theme on exit", () => {
    const { unmount } = render(<PlaygroundPage />);

    expect(root.getAttribute("data-theme")).toBe("light");
    fireEvent.click(screen.getByRole("radio", { name: "Dark" }));
    expect(root.getAttribute("data-theme")).toBe("dark");

    unmount();
    expect(root.getAttribute("data-theme")).toBe(originalTheme);
  });

  it("simulates reduced motion and resets to the light theme and system preference", () => {
    render(<PlaygroundPage />);

    fireEvent.click(screen.getByRole("radio", { name: "Dark" }));
    fireEvent.click(screen.getByRole("radio", { name: "Reduced motion" }));
    expect(root.getAttribute("data-motion")).toBe("reduced");
    expect(
      screen.getByRole("status", { name: "Presentation settings" }).textContent,
    ).toContain("Reduced motion simulation is on");

    fireEvent.click(
      screen.getByRole("button", { name: "Reset global controls" }),
    );

    expect(root.getAttribute("data-theme")).toBe("light");
    expect(root.getAttribute("data-motion")).toBe(originalMotion);
    expect(
      screen.getByRole("radio", { name: "System preference" }),
    ).toHaveProperty("checked", true);
  });
});
