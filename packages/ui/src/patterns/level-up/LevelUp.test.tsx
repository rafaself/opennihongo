import "@testing-library/jest-dom/vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Button } from "../../components/button/Button";
import { LevelUp } from "./LevelUp";

describe("LevelUp", () => {
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
});
