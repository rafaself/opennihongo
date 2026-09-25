import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Celebration } from "./Celebration";

const originalMatchMediaDescriptor = Object.getOwnPropertyDescriptor(
  window,
  "matchMedia",
);
const originalMotionMode = document.documentElement.getAttribute("data-motion");

function restoreMotionMode() {
  if (originalMotionMode === null) {
    document.documentElement.removeAttribute("data-motion");
  } else {
    document.documentElement.setAttribute("data-motion", originalMotionMode);
  }
}

describe("Celebration", () => {
  afterEach(() => {
    cleanup();
    if (originalMatchMediaDescriptor) {
      Object.defineProperty(window, "matchMedia", originalMatchMediaDescriptor);
    } else {
      Reflect.deleteProperty(window, "matchMedia");
    }
    restoreMotionMode();
  });

  it("activates only when requested by caller state", () => {
    render(
      <Celebration active>
        <span>Level 12</span>
      </Celebration>,
    );

    expect(screen.getByText("Level 12").parentElement).toHaveAttribute(
      "data-active",
      "true",
    );
  });

  it("suppresses the effect when reduced motion is preferred without hiding content", () => {
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: vi.fn(() => ({
        matches: true,
        media: "(prefers-reduced-motion: reduce)",
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    });

    render(<Celebration active>Milestone reached</Celebration>);

    expect(
      screen.getByText("Milestone reached").closest("[data-active]"),
    ).toHaveAttribute("data-active", "false");
    expect(screen.getByText("Milestone reached")).toBeVisible();
  });

  it("responds to the shared explicit reduced-motion mode", async () => {
    render(<Celebration active>Daily goal complete</Celebration>);

    const celebration = screen
      .getByText("Daily goal complete")
      .closest("[data-active]");
    expect(celebration).toHaveAttribute("data-active", "true");

    document.documentElement.setAttribute("data-motion", "reduced");

    await waitFor(() => {
      expect(celebration).toHaveAttribute("data-active", "false");
    });

    document.documentElement.removeAttribute("data-motion");

    await waitFor(() => {
      expect(celebration).toHaveAttribute("data-active", "true");
    });
  });
});
