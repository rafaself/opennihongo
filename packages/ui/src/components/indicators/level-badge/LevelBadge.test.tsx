import "@testing-library/jest-dom/vitest";
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LevelBadge } from "./LevelBadge";

describe("LevelBadge", () => {
  it("presents the caller-provided label and value as a non-interactive badge", () => {
    render(<LevelBadge label="レベル" value={12} />);

    const label = screen.getByText("レベル");
    const badge = label.closest(".ns-level-badge");

    expect(badge).toHaveAttribute("data-variant", "neutral");
    expect(badge).toHaveAttribute("data-size", "normal");
    expect(within(badge as HTMLElement).getByText("12")).toBeVisible();
    expect(badge?.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
    expect(badge?.tagName).toBe("SPAN");
  });

  it("renders optional caller-provided tier treatment", () => {
    render(
      <LevelBadge
        label="Level"
        tier={{ label: "Gold", variant: "warning" }}
        value="A2"
      />,
    );

    const tier = screen.getByText("Gold").closest(".ns-badge");
    expect(tier).toHaveAttribute("data-variant", "warning");
  });

  it("supports a compact presentation without changing supplied data", () => {
    render(
      <LevelBadge
        label="Rank"
        size="compact"
        tier={{ label: "Bronze" }}
        value={3}
      />,
    );

    const badge = screen.getByText("Rank").closest(".ns-level-badge");
    expect(badge).toHaveAttribute("data-size", "compact");
    expect(screen.getByText("3")).toBeVisible();
    expect(screen.getByText("Bronze")).toBeVisible();
  });
});
