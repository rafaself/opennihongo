import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Achievement } from "./Achievement";

describe("Achievement", () => {
  it("exposes its caller-supplied state and progress values to assistive technology", () => {
    render(
      <Achievement
        description="Collect kana challenge badges."
        progress={{
          current: 3,
          label: "3 of 5 kana challenges",
          target: 5,
        }}
        state="in-progress"
        title="Kana explorer"
      />,
    );

    const achievement = screen.getByRole("group", {
      name: "Kana explorer In progress",
    });

    expect(achievement).toHaveAccessibleDescription(
      "Collect kana challenge badges.",
    );
    expect(screen.getByText("In progress")).toBeVisible();
    expect(
      screen.getByRole("progressbar", { name: "3 of 5 kana challenges" }),
    ).toHaveAttribute("aria-valuenow", "3");
    expect(
      screen.getByRole("progressbar", { name: "3 of 5 kana challenges" }),
    ).toHaveAttribute("aria-valuemax", "5");
  });

  it("communicates the locked state with a visible text label", () => {
    render(<Achievement state="locked" title="First steps" />);

    expect(
      screen.getByRole("group", { name: "First steps Locked" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Locked")).toBeVisible();
  });

  it.each([
    [<Achievement state="locked" title=" " />, "non-empty title"],
    [
      <Achievement state="locked" stateLabel=" " title="First steps" />,
      "non-empty state label",
    ],
    [
      <Achievement
        progress={{ current: 1, label: " ", target: 2 }}
        state="in-progress"
        title="First steps"
      />,
      "progress requires a non-empty label",
    ],
  ] as const)("rejects invalid visible content (%s)", (element, message) => {
    expect(() => render(element)).toThrow(message);
  });
});
