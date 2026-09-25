import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Button } from "../../button/Button";
import { QuestCard } from "./QuestCard";

describe("QuestCard", () => {
  it("exposes caller progress and incomplete status and supports the supplied action", async () => {
    const user = userEvent.setup();
    const handleContinue = vi.fn();

    render(
      <QuestCard
        action={<Button onClick={handleContinue}>Continue quest</Button>}
        description="Practice a few words each day."
        goal={5}
        progress={2}
        progressLabel="Word practice progress"
        status="incomplete"
        title="Daily practice"
      />,
    );

    const quest = screen.getByRole("article", {
      name: "Daily practice Incomplete",
    });

    expect(quest).toHaveAccessibleDescription("Practice a few words each day.");
    expect(screen.getByText("Incomplete")).toBeVisible();
    expect(screen.getByText("2 / 5")).toBeVisible();
    expect(
      screen.getByRole("progressbar", { name: "Word practice progress" }),
    ).toHaveAttribute("aria-valuenow", "2");
    expect(
      screen.getByRole("progressbar", { name: "Word practice progress" }),
    ).toHaveAttribute("aria-valuemax", "5");

    await user.click(screen.getByRole("button", { name: "Continue quest" }));
    expect(handleContinue).toHaveBeenCalledOnce();
  });

  it("presents the caller-supplied completed status and reward metadata", () => {
    render(
      <QuestCard
        goal={3}
        progress={3}
        reward={{
          category: "xp",
          label: "Quest reward",
          state: "earned",
          value: "+30 XP",
        }}
        status="completed"
        statusLabel="Done"
        title="First lesson"
      />,
    );

    expect(
      screen.getByRole("article", { name: "First lesson Done" }),
    ).toHaveAttribute("data-status", "completed");
    expect(screen.getByText("Done")).toBeVisible();
    expect(
      screen.getByRole("article", { name: "Quest reward Earned" }),
    ).toBeVisible();
    expect(screen.getByText("+30 XP")).toBeVisible();
  });

  it.each([
    [
      <QuestCard goal={1} progress={0} status="incomplete" title=" " />,
      "title",
    ],
    [
      <QuestCard
        goal={1}
        progress={0}
        status="incomplete"
        statusLabel=" "
        title="Daily practice"
      />,
      "status label",
    ],
    [
      <QuestCard
        goal={1}
        progress={0}
        progressLabel=" "
        status="incomplete"
        title="Daily practice"
      />,
      "progress label",
    ],
    [
      <QuestCard
        goal={0}
        progress={0}
        status="incomplete"
        title="Daily practice"
      />,
      "finite progress and a positive goal",
    ],
  ] as const)("rejects invalid %s", (element, message) => {
    expect(() => render(element)).toThrow(message);
  });
});
