import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LeaderboardItem } from "./LeaderboardItem";

describe("LeaderboardItem", () => {
  it("exposes rank and participant text and marks the current user accessibly", () => {
    render(
      <ol>
        <LeaderboardItem
          change={{ direction: "up", label: "Up 2 places" }}
          isCurrentUser
          participantName="Emi Tanaka"
          rank={2}
          score="1,240 XP"
        />
      </ol>,
    );

    const item = screen.getByRole("listitem", {
      name: "Rank 2 Emi Tanaka You Up 2 places Score 1,240 XP",
    });

    expect(item).toHaveAttribute("aria-current", "true");
    expect(screen.getByText("Rank 2")).toBeVisible();
    expect(screen.getByText("Emi Tanaka")).toBeVisible();
    expect(screen.getByText("You")).toBeVisible();
    expect(screen.getByText("Up 2 places")).toBeVisible();
  });

  it("does not mark other participants as current users", () => {
    render(
      <ol>
        <LeaderboardItem participantName="Aki Sato" rank="1" score={980} />
      </ol>,
    );

    const item = screen.getByRole("listitem", {
      name: "Rank 1 Aki Sato Score 980",
    });

    expect(item).not.toHaveAttribute("aria-current");
  });
});
