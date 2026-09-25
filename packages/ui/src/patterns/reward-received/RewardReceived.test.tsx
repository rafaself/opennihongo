import "@testing-library/jest-dom/vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Button } from "../../components/button/Button";
import { RewardReceived } from "./RewardReceived";

describe("RewardReceived", () => {
  it("exposes supplied reward information and activates the supplied action", async () => {
    const onContinue = vi.fn();
    const user = userEvent.setup();

    render(
      <RewardReceived
        celebration={false}
        description="Keep learning to earn more rewards."
        heading="Reward received"
        primaryAction={<Button onClick={onContinue}>Continue</Button>}
        reward={{
          category: "achievement",
          categoryLabel: "Achievement",
          label: "Kana explorer",
          state: "earned",
          value: "First milestone",
        }}
      />,
    );

    const region = screen.getByRole("region", { name: "Reward received" });
    expect(region).toBeInTheDocument();
    expect(region.querySelector(".ns-celebration")).toHaveAttribute(
      "data-active",
      "false",
    );
    expect(
      screen.getByText("Keep learning to earn more rewards."),
    ).toBeVisible();

    const reward = screen.getByRole("article", {
      name: "Kana explorer Earned",
    });
    expect(within(reward).getByText("Achievement")).toBeVisible();
    expect(within(reward).getByText("First milestone")).toBeVisible();

    await user.click(screen.getByRole("button", { name: "Continue" }));

    expect(onContinue).toHaveBeenCalledOnce();
  });

  it("requires a non-empty accessible heading", () => {
    expect(() =>
      render(
        <RewardReceived
          heading=" "
          primaryAction={<Button>Continue</Button>}
          reward={{
            category: "xp",
            label: "Experience points",
            state: "earned",
            value: "+10",
          }}
        />,
      ),
    ).toThrow("RewardReceived requires a non-empty heading.");
  });
});
