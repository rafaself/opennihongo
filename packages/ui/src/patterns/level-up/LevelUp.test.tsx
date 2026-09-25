import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Button } from "../../components/button/Button";
import { LevelUp } from "./LevelUp";

describe("LevelUp", () => {
  afterEach(cleanup);

  it("exposes the supplied level context and activates the supplied action", async () => {
    const onContinue = vi.fn();
    const user = userEvent.setup();

    render(
      <LevelUp
        heading="Level up"
        newLevel={{ label: "Level", value: 6 }}
        previousLevel={{ label: "Level", value: 5 }}
        primaryAction={<Button onClick={onContinue}>Continue</Button>}
      />,
    );

    expect(
      screen.getByRole("region", { name: "Level up" }),
    ).toBeInTheDocument();
    expect(
      within(screen.getByRole("group", { name: "Previous level" })).getByText(
        "5",
      ),
    ).toBeInTheDocument();
    expect(
      within(screen.getByRole("group", { name: "New level" })).getByText("6"),
    ).toBeInTheDocument();

    await user.tab();
    expect(screen.getByRole("button", { name: "Continue" })).toHaveFocus();
    await user.keyboard("{Enter}");

    expect(onContinue).toHaveBeenCalledOnce();
  });

  it("supports localized captions and accessible names", () => {
    render(
      <LevelUp
        heading="レベルアップ"
        newLevel={{ label: "レベル", value: 6 }}
        newLevelLabel="新しいレベル"
        previousLevel={{ label: "レベル", value: 5 }}
        previousLevelLabel="前のレベル"
        primaryAction={<Button>続ける</Button>}
        rewards={<span>報酬</span>}
        rewardsHeading="獲得報酬"
      />,
    );

    expect(
      within(screen.getByRole("group", { name: "前のレベル" })).getByText(
        "前のレベル",
      ),
    ).toBeVisible();
    expect(
      within(screen.getByRole("group", { name: "新しいレベル" })).getByText(
        "新しいレベル",
      ),
    ).toBeVisible();
    expect(screen.getByRole("heading", { name: "獲得報酬" })).toBeVisible();
  });

  it("supports compact presentation and optional visible explanation", () => {
    render(
      <LevelUp
        description="You reached the next study milestone."
        heading="Level up"
        newLevel={{ label: "Level", value: 6 }}
        previousLevel={{ label: "Level", value: 5 }}
        primaryAction={<Button>Continue</Button>}
        size="compact"
      />,
    );

    expect(screen.getByRole("region", { name: "Level up" })).toHaveAttribute(
      "data-size",
      "compact",
    );
    expect(
      screen.getByText("You reached the next study milestone."),
    ).toBeVisible();
  });

  it.each([
    [
      <LevelUp
        heading=" "
        newLevel={{ label: "Level", value: 6 }}
        previousLevel={{ label: "Level", value: 5 }}
        primaryAction={<Button>Continue</Button>}
      />,
      "non-empty heading",
    ],
    [
      <LevelUp
        heading="Level up"
        newLevel={{ label: "Level", value: 6 }}
        newLevelLabel=" "
        previousLevel={{ label: "Level", value: 5 }}
        primaryAction={<Button>Continue</Button>}
      />,
      "level labels must be non-empty",
    ],
    [
      <LevelUp
        heading="Level up"
        newLevel={{ label: "Level", value: 6 }}
        previousLevel={{ label: "Level", value: 5 }}
        primaryAction={<Button>Continue</Button>}
        rewards={<span>10 XP</span>}
        rewardsHeading=" "
      />,
      "non-empty rewards heading",
    ],
  ] as const)("requires a valid %s", (element, message) => {
    expect(() => render(element)).toThrow(message);
  });
});
