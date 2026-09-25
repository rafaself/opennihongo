import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Button } from "../../components/button/Button";
import { ProgressSummary } from "./ProgressSummary";

const metrics = [
  {
    badge: { label: "On track", variant: "success" as const },
    description: "Sections finished in this course.",
    id: "sections",
    label: "Sections completed",
    max: 12,
    value: 8,
    valueLabel: "8 of 12",
  },
  {
    id: "vocabulary",
    label: "Vocabulary reviewed",
    max: 100,
    value: 65,
    valueLabel: "65%",
  },
];

describe("ProgressSummary", () => {
  afterEach(() => {
    cleanup();
  });

  it("presents caller-supplied metrics and keeps optional actions operable", async () => {
    const onView = vi.fn();
    const user = userEvent.setup();

    render(
      <ProgressSummary
        actions={<Button onClick={onView}>View details</Button>}
        description="A snapshot of current study progress."
        metrics={metrics}
        title="Study progress"
      />,
    );

    expect(
      screen.getByRole("region", { name: "Study progress" }),
    ).toHaveTextContent("A snapshot of current study progress.");
    expect(
      screen.getByRole("progressbar", { name: "Sections completed" }),
    ).toHaveAttribute("aria-valuenow", "8");
    expect(
      screen.getByRole("progressbar", { name: "Vocabulary reviewed" }),
    ).toHaveAttribute("aria-valuemax", "100");
    expect(screen.getByText("8 of 12")).toBeInTheDocument();
    expect(screen.getByText("On track")).toHaveAttribute(
      "data-variant",
      "success",
    );

    await user.click(screen.getByRole("button", { name: "View details" }));
    expect(onView).toHaveBeenCalledOnce();
  });

  it("supports caller-selected ring indicators and preserves their supplied labels", () => {
    render(
      <ProgressSummary
        display="ring"
        metrics={metrics}
        title="Study progress"
      />,
    );

    expect(
      screen.getByRole("progressbar", { name: "Sections completed" }),
    ).toHaveAttribute("aria-valuemax", "12");
    expect(screen.getByText("8 of 12")).toBeInTheDocument();
    expect(
      screen.getByText("Sections finished in this course."),
    ).toBeInTheDocument();
  });
});
