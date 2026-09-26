// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { PlaygroundPage } from "./PlaygroundPage";

const root = document.documentElement;
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
    originalMotion = root.getAttribute("data-motion");
  });

  afterEach(() => {
    cleanup();
    restoreAttribute("data-motion", originalMotion);
  });

  it("leaves theme ownership to the gallery shell", () => {
    render(<PlaygroundPage />);

    expect(screen.queryByRole("radio", { name: "Light" })).toBeNull();
    expect(screen.queryByRole("radio", { name: "Dark" })).toBeNull();
    expect(screen.queryByRole("radio", { name: "Color theme" })).toBeNull();
  });

  it("uses the same accessible split-workbench structure for both examples", () => {
    render(<PlaygroundPage />);

    expect(screen.getByRole("group", { name: "Motion examples" })).toBeTruthy();
    expect(screen.getByRole("group", { name: "Button preview" })).toBeTruthy();
  });

  it("simulates reduced motion and resets to system preference", () => {
    render(<PlaygroundPage />);

    fireEvent.click(screen.getByRole("radio", { name: "Reduced motion" }));
    expect(root.getAttribute("data-motion")).toBe("reduced");
    expect(
      screen.getByRole("status", { name: "Motion settings" }).textContent,
    ).toContain("Reduced motion simulation is on");

    fireEvent.click(
      screen.getByRole("button", { name: "Reset motion setting" }),
    );

    expect(root.getAttribute("data-motion")).toBe(originalMotion);
    expect(
      screen.getByRole("radio", { name: "System preference" }),
    ).toHaveProperty("checked", true);
  });
});
