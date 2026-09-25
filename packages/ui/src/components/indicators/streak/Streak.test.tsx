import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Streak } from "./Streak";

afterEach(cleanup);

describe("Streak", () => {
  it.each([
    ["active", "Active"],
    ["at-risk", "At risk"],
    ["protected", "Protected"],
    ["completed", "Completed"],
    ["inactive", "Inactive"],
  ] as const)("announces the %s state as text", (state, stateLabel) => {
    render(<Streak count={8} label="Current streak" state={state} />);

    const status = screen.getByRole("status", { name: "Current streak" });

    expect(status).toHaveAttribute("aria-live", "polite");
    expect(status).toHaveAttribute("aria-atomic", "true");
    expect(within(status).getByText("8")).toBeVisible();
    expect(within(status).getByText("days")).toBeVisible();
    expect(within(status).getByText(stateLabel)).toBeVisible();
  });

  it("supports a caller-provided unit and a visible accessible label", () => {
    render(
      <Streak count={4} label="Review streak" state="active" unit="lessons" />,
    );

    const status = screen.getByRole("status", { name: "Review streak" });

    expect(within(status).getByText("4")).toBeVisible();
    expect(within(status).getByText("lessons")).toBeVisible();
    expect(within(status).getByText("Active")).toBeVisible();
  });

  it("supports a localized visible and announced state label", () => {
    render(
      <Streak
        count={4}
        label="連続学習日数"
        state="at-risk"
        stateLabel="要注意"
        unit="日"
      />,
    );

    expect(
      within(screen.getByRole("status", { name: "連続学習日数" })).getByText(
        "要注意",
      ),
    ).toBeVisible();
  });
});
