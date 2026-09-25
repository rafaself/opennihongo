import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Button } from "../../components/button/Button";
import { Progress } from "../../components/indicators/progress/Progress";
import { LessonCompleted } from "./LessonCompleted";

describe("LessonCompleted", () => {
  afterEach(cleanup);

  it("renders caller data accessibly and keeps supplied actions operable", async () => {
    const onContinue = vi.fn();
    const onReview = vi.fn();
    const user = userEvent.setup();

    render(
      <LessonCompleted
        description="You completed the unit."
        primaryAction={<Button onClick={onContinue}>Continue</Button>}
        progress={<Progress aria-label="Lesson progress" max={4} value={3} />}
        rewards={<span>125 XP earned</span>}
        secondaryAction={
          <Button onClick={onReview} variant="secondary">
            Review again
          </Button>
        }
        title="Lesson complete"
      />,
    );

    expect(
      screen.getByRole("region", { name: "Lesson complete" }),
    ).toHaveTextContent("You completed the unit.");
    expect(
      screen.getByRole("progressbar", { name: "Lesson progress" }),
    ).toHaveAttribute("aria-valuenow", "3");
    expect(screen.getByText("125 XP earned")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Continue" }));
    await user.click(screen.getByRole("button", { name: "Review again" }));

    expect(onContinue).toHaveBeenCalledOnce();
    expect(onReview).toHaveBeenCalledOnce();
  });

  it("renders a rewards summary when no progress content is supplied", () => {
    render(
      <LessonCompleted
        primaryAction={<Button>Continue</Button>}
        rewards={<span>25 XP earned</span>}
        title="Lesson complete"
      />,
    );

    expect(
      screen.getByRole("region", { name: "Lesson complete" }),
    ).toHaveTextContent("25 XP earned");
  });

  it("requires a non-empty accessible heading", () => {
    expect(() =>
      render(
        <LessonCompleted primaryAction={<Button>Continue</Button>} title=" " />,
      ),
    ).toThrow("LessonCompleted requires a non-empty title.");
  });
});
