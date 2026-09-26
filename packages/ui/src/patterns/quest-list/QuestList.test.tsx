import "@testing-library/jest-dom/vitest";
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { QuestList } from "./QuestList";

describe("QuestList", () => {
  it("exposes the supplied time, quest progress, and reward labels", () => {
    render(
      <QuestList
        headingLevel={3}
        items={[
          {
            id: "xp",
            icon: <span>⚡</span>,
            title: "Gain 50 XP",
            progress: 12,
            goal: 50,
            reward: { icon: <span>★</span>, label: "Bronze chest" },
          },
          {
            id: "lessons",
            icon: <span>◎</span>,
            title: "Finish three lessons",
            progress: 0,
            goal: 3,
          },
        ]}
        remainingTime="58 minutes left"
        title="Daily quests"
      />,
    );

    const region = screen.getByRole("region", { name: "Daily quests" });
    expect(within(region).getByRole("heading", { level: 3 })).toHaveTextContent(
      "Daily quests",
    );
    expect(within(region).getByText("58 minutes left")).toBeVisible();
    expect(within(region).getAllByRole("listitem")).toHaveLength(2);
    expect(
      within(region).getByRole("progressbar", { name: "Gain 50 XP" }),
    ).toHaveAttribute("aria-valuenow", "12");
    expect(
      within(region).getByRole("progressbar", { name: "Gain 50 XP" }),
    ).toHaveAttribute("aria-valuemax", "50");
    expect(within(region).getByText("12 / 50")).toBeVisible();
    expect(
      within(region).getByRole("img", { name: "Bronze chest" }),
    ).toBeVisible();
    expect(
      within(region).getByRole("progressbar", { name: "Finish three lessons" }),
    ).toHaveAttribute("aria-valuenow", "0");
  });

  it("allows localized value and progress labels", () => {
    render(
      <QuestList
        items={[
          {
            id: "xp",
            icon: <span>⚡</span>,
            title: "Ganhe 50 XP",
            progress: 12,
            goal: 50,
            progressLabel: "Progresso da missão de XP",
            valueLabel: "12 de 50",
          },
        ]}
        title="Missões do dia"
      />,
    );

    expect(
      screen.getByRole("progressbar", { name: "Progresso da missão de XP" }),
    ).toBeVisible();
    expect(screen.getByText("12 de 50")).toBeVisible();
  });

  it("rejects progress that cannot match the displayed goal", () => {
    expect(() =>
      render(
        <QuestList
          items={[
            {
              id: "xp",
              icon: <span>⚡</span>,
              title: "Gain XP",
              progress: 6,
              goal: 5,
            },
          ]}
          title="Daily quests"
        />,
      ),
    ).toThrow("QuestList progress must be within its positive goal.");
  });
});
