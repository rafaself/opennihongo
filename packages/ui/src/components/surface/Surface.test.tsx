import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Surface } from "./Surface";

describe("Surface", () => {
  it("renders a flat structural surface by default", () => {
    render(<Surface aria-label="Vocabulary panel">Vocabulary</Surface>);

    const surface = screen.getByLabelText("Vocabulary panel");
    expect(surface.tagName).toBe("DIV");
    expect(surface).toHaveClass("ns-surface");
    expect(surface).toHaveAttribute("data-variant", "default");
    expect(surface).toHaveAttribute("data-elevation", "none");
  });

  it("exposes semantic surface and elevation variants", () => {
    render(
      <Surface
        aria-label="Raised vocabulary panel"
        className="custom-surface"
        elevation="interactive"
        id="vocabulary-panel"
        variant="raised"
      >
        Vocabulary
      </Surface>,
    );

    const surface = screen.getByLabelText("Raised vocabulary panel");
    expect(surface).toHaveAttribute("data-variant", "raised");
    expect(surface).toHaveAttribute("data-elevation", "interactive");
    expect(surface).toHaveAttribute("id", "vocabulary-panel");
    expect(surface).toHaveClass("ns-surface", "custom-surface");
  });
});
