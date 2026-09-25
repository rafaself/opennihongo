import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { XPBar } from "./XPBar";

afterEach(cleanup);

describe("XPBar", () => {
  it("uses the supplied current and target values and accessible name", () => {
    render(
      <XPBar
        aria-label="XP to next level"
        current={35}
        target={80}
        text="35 of 80 XP"
      />,
    );

    const progress = screen.getByRole("progressbar", {
      name: "XP to next level",
    });

    expect(progress).toHaveAttribute("aria-valuenow", "35");
    expect(progress).toHaveAttribute("aria-valuemax", "80");
    expect(screen.getByText("35 of 80 XP")).toBeInTheDocument();
  });

  it("accepts a caller-normalized value and labelled-by reference", () => {
    render(
      <>
        <span id="xp-bar-label">Current XP progress</span>
        <XPBar aria-labelledby="xp-bar-label" max={100} value={60} />
      </>,
    );

    expect(
      screen.getByRole("progressbar", { name: "Current XP progress" }),
    ).toHaveAttribute("aria-valuenow", "60");
  });

  it("uses the default range when a normalized value has no maximum", () => {
    render(<XPBar aria-label="Current XP" value={12} />);

    expect(
      screen.getByRole("progressbar", { name: "Current XP" }),
    ).toHaveAttribute("aria-valuemax", "100");
  });
});
