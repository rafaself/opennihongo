import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Divider } from "./Divider";

afterEach(cleanup);

describe("Divider", () => {
  it("exposes a horizontal separator by default", () => {
    render(<Divider data-testid="lesson-divider" />);

    const separator = screen.getByRole("separator");
    expect(separator.tagName).toBe("HR");
    expect(separator).toHaveAttribute("aria-orientation", "horizontal");
    expect(separator).toHaveAttribute("data-testid", "lesson-divider");
  });

  it("hides decorative dividers from assistive technology", () => {
    render(<Divider decorative data-testid="decorative-divider" />);

    expect(screen.queryByRole("separator")).not.toBeInTheDocument();
    expect(screen.getByTestId("decorative-divider")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  });
});
