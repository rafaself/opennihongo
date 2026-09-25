import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Button } from "../../components/button/Button";
import { AchievementUnlocked } from "./AchievementUnlocked";

describe("AchievementUnlocked", () => {
  it("exposes the supplied achievement state and activates the supplied action", async () => {
    const onContinue = vi.fn();
    const user = userEvent.setup();

    render(
      <AchievementUnlocked
        achievement={{ state: "unlocked", title: "Kana explorer" }}
        heading="Achievement unlocked"
        primaryAction={<Button onClick={onContinue}>Continue</Button>}
      />,
    );

    expect(
      screen.getByRole("region", { name: "Achievement unlocked" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("group", { name: "Kana explorer Unlocked" }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Continue" }));

    expect(onContinue).toHaveBeenCalledOnce();
  });

  it("requires a visible region heading", () => {
    expect(() =>
      render(
        <AchievementUnlocked
          achievement={{ state: "unlocked", title: "Kana explorer" }}
          heading=" "
          primaryAction={<Button>Continue</Button>}
        />,
      ),
    ).toThrow("AchievementUnlocked requires a non-empty heading.");
  });
});
