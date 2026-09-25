import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Button } from "../../components/button/Button";
import { DailyGoalCompleted } from "./DailyGoalCompleted";

describe("DailyGoalCompleted", () => {
  afterEach(() => {
    cleanup();
  });

  it("presents supplied completion, progress, rewards, and operable actions", async () => {
    const onContinue = vi.fn();
    const onReview = vi.fn();
    const user = userEvent.setup();

    render(
      <DailyGoalCompleted
        completionLabel="Goal completed"
        description="You met today's study target."
        goal={{
          description: "Words practiced during today's session.",
          label: "Practice 20 words",
          max: 20,
          value: 20,
          valueLabel: "20 of 20",
        }}
        heading="Daily goal complete"
        primaryAction={<Button onClick={onContinue}>Continue learning</Button>}
        rewards={[
          {
            category: "xp",
            label: "Experience points",
            state: "earned",
            value: "+50 XP",
          },
          {
            category: "streak",
            label: "Learning streak",
            state: "earned",
            value: "7 days",
          },
        ]}
        secondaryAction={
          <Button onClick={onReview} variant="secondary">
            Review progress
          </Button>
        }
      />,
    );

    const region = screen.getByRole("region", { name: "Daily goal complete" });
    expect(region).toHaveTextContent("You met today's study target.");
    expect(region).toHaveTextContent("Goal completed");
    expect(
      screen.getByRole("progressbar", { name: "Practice 20 words" }),
    ).toHaveAttribute("aria-valuenow", "20");
    expect(
      screen.getByRole("progressbar", { name: "Practice 20 words" }),
    ).toHaveAttribute("aria-describedby");
    expect(screen.getByText("20 of 20")).toBeVisible();

    const xpReward = screen.getByRole("article", {
      name: "Experience points Earned",
    });
    const streakReward = screen.getByRole("article", {
      name: "Learning streak Earned",
    });
    expect(within(xpReward).getByText("+50 XP")).toBeVisible();
    expect(within(streakReward).getByText("7 days")).toBeVisible();

    await user.click(screen.getByRole("button", { name: "Continue learning" }));
    await user.click(screen.getByRole("button", { name: "Review progress" }));
    expect(onContinue).toHaveBeenCalledOnce();
    expect(onReview).toHaveBeenCalledOnce();
  });

  it("keeps completion presentation caller-controlled instead of deriving it from progress", () => {
    render(
      <DailyGoalCompleted
        celebration={false}
        completionLabel="Completed"
        goal={{ label: "Practice words", max: 20, value: 8 }}
        heading="Daily goal complete"
        primaryAction={<Button>Continue</Button>}
        rewards={[
          {
            category: "xp",
            label: "Experience points",
            state: "earned",
            value: "+50 XP",
          },
        ]}
      />,
    );

    expect(screen.getByText("Completed")).toBeVisible();
    expect(
      screen.getByRole("progressbar", { name: "Practice words" }),
    ).toHaveAttribute("aria-valuenow", "8");
    expect(
      screen
        .getByRole("region", { name: "Daily goal complete" })
        .querySelector(".ns-celebration"),
    ).toHaveAttribute("data-active", "false");
  });
});
