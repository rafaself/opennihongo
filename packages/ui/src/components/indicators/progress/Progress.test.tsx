import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Progress } from "./Progress";

afterEach(cleanup);

describe("Progress", () => {
  it("clamps its value and exposes an accessible name and range", () => {
    render(<Progress aria-label="Course progress" max={80} value={120} />);

    const progress = screen.getByRole("progressbar", {
      name: "Course progress",
    });

    expect(progress).toHaveAttribute("aria-valuemin", "0");
    expect(progress).toHaveAttribute("aria-valuemax", "80");
    expect(progress).toHaveAttribute("aria-valuenow", "80");
    expect(progress.firstElementChild).toHaveStyle({ width: "100%" });
  });

  it("clamps negative values to an empty progress state", () => {
    render(<Progress aria-label="Course progress" value={-10} />);

    const progress = screen.getByRole("progressbar", {
      name: "Course progress",
    });

    expect(progress).toHaveAttribute("aria-valuenow", "0");
    expect(progress).toHaveAttribute("aria-valuemax", "100");
    expect(progress.firstElementChild).toHaveStyle({ width: "0%" });
  });

  it.each([Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])(
    "treats non-finite value %s as empty progress",
    (value) => {
      render(<Progress aria-label="Course progress" value={value} />);

      expect(
        screen.getByRole("progressbar", { name: "Course progress" }),
      ).toHaveAttribute("aria-valuenow", "0");
    },
  );

  it.each([0, -10, Number.NaN, Number.POSITIVE_INFINITY])(
    "uses the default maximum when max is invalid (%s)",
    (max) => {
      render(<Progress aria-label="Course progress" max={max} value={50} />);

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
        <span id="lesson-progress-label">Lesson progress</span>
        <Progress aria-labelledby="lesson-progress-label" value={35} />
      </>,
    );

    expect(
      screen.getByRole("progressbar", { name: "Lesson progress" }),
    ).toHaveAttribute("aria-valuenow", "35");
  });
});
