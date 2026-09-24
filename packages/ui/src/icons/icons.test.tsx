import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CheckIcon, CloseIcon } from "@opennihongo/ui/icons";

describe("functional icon registry", () => {
  it("renders only the selected named icons", () => {
    const { container } = render(
      <>
        <CheckIcon />
        <CloseIcon />
      </>,
    );

    const icons = container.querySelectorAll("svg");
    expect(icons).toHaveLength(2);
    expect(icons[0]?.querySelector("path")).toHaveAttribute(
      "d",
      "m5 12 4 4L19 6",
    );
    expect(icons[1]?.querySelector("path")).toHaveAttribute(
      "d",
      "M6 6 18 18M18 6 6 18",
    );
  });

  it("hides decorative icons from assistive technology by default", () => {
    const { container } = render(<CheckIcon />);
    const icon = container.querySelector("svg");

    expect(icon).toHaveAttribute("aria-hidden", "true");
    expect(icon).toHaveAttribute("focusable", "false");
    expect(icon).not.toHaveAttribute("role", "img");
  });

  it("supports a meaningful accessible name and semantic size", () => {
    render(<CheckIcon aria-label="Completed" size="large" />);

    const icon = screen.getByRole("img", { name: "Completed" });
    expect(icon).not.toHaveAttribute("aria-hidden");
    expect(icon).toHaveStyle({
      width: "var(--ns-size-icon-box-large, 24px)",
      height: "var(--ns-size-icon-box-large, 24px)",
      verticalAlign: "-0.125em",
    });
    expect(icon).toHaveAttribute("viewBox", "0 0 24 24");
    expect(icon).toHaveAttribute("stroke", "currentColor");
    expect(icon).toHaveAttribute("stroke-width", "2");
  });
});
