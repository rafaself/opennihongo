import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Badge } from "./Badge";

describe("Badge", () => {
  it("renders a neutral, non-interactive label by default", () => {
    render(
      <Badge className="custom-badge" id="review-status">
        In review
      </Badge>,
    );

    const badge = screen.getByText("In review");
    expect(badge.tagName).toBe("SPAN");
    expect(badge).toHaveClass("ns-badge", "custom-badge");
    expect(badge).toHaveAttribute("data-variant", "neutral");
    expect(badge).toHaveAttribute("id", "review-status");
    expect(badge).not.toHaveAttribute("tabindex");
  });

  it.each(["success", "warning", "info", "danger"] as const)(
    "renders the %s semantic treatment",
    (variant) => {
      render(<Badge variant={variant}>{variant}</Badge>);

      expect(screen.getByText(variant)).toHaveAttribute(
        "data-variant",
        variant,
      );
    },
  );
});
