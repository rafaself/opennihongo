import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { ProgressRing } from "./ProgressRing";

afterEach(cleanup);

describe("ProgressRing", () => {
  it("exposes an accessible determinate range and keeps centered content accessible", () => {
    render(
      <ProgressRing
        aria-label="Course progress"
        max={80}
        size="large"
        value={40}
      >
        Review set
      </ProgressRing>,
    );

    const progress = screen.getByRole("progressbar", {
      name: "Course progress",
    });
    const centeredContent = screen.getByText("Review set");

    expect(progress).toHaveAttribute("aria-valuemin", "0");
    expect(progress).toHaveAttribute("aria-valuemax", "80");
    expect(progress).toHaveAttribute("aria-valuenow", "40");
    expect(centeredContent).toBeVisible();
    expect(progress).not.toContainElement(centeredContent);
    expect(progress.parentElement).toHaveClass("ns-progress-ring--large");
  });

  it("clamps finite values and uses the same default maximum as Progress", () => {
    render(<ProgressRing aria-label="Course progress" value={120} />);

    const progress = screen.getByRole("progressbar", {
      name: "Course progress",
    });

    expect(progress).toHaveAttribute("aria-valuemax", "100");
    expect(progress).toHaveAttribute("aria-valuenow", "100");
    expect(progress.parentElement).toHaveAttribute("data-size", "medium");
  });

  it.each([Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])(
    "treats non-finite value %s as empty progress",
    (value) => {
      render(<ProgressRing aria-label="Course progress" value={value} />);

      expect(
        screen.getByRole("progressbar", { name: "Course progress" }),
      ).toHaveAttribute("aria-valuenow", "0");
    },
  );

  it.each([0, -10, Number.NaN, Number.POSITIVE_INFINITY])(
    "uses the default maximum when max is invalid (%s)",
    (max) => {
      render(
        <ProgressRing aria-label="Course progress" max={max} value={50} />,
      );

      const progress = screen.getByRole("progressbar", {
        name: "Course progress",
      });

      expect(progress).toHaveAttribute("aria-valuemax", "100");
      expect(progress).toHaveAttribute("aria-valuenow", "50");
    },
  );

  it("accepts an accessible name through aria-labelledby", () => {
    render(
      <>
        <span id="lesson-progress-ring-label">Lesson progress</span>
        <ProgressRing aria-labelledby="lesson-progress-ring-label" value={35} />
      </>,
    );

    expect(
      screen.getByRole("progressbar", { name: "Lesson progress" }),
    ).toHaveAttribute("aria-valuenow", "35");
  });
});
