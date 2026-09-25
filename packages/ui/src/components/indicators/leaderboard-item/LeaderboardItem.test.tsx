import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { LeaderboardItem } from "./LeaderboardItem";

afterEach(cleanup);

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

  it.each([
    ["participant name", { participantName: " " }, "participant name"],
    ["rank", { rank: " " }, "finite rank"],
    ["score", { score: Number.POSITIVE_INFINITY }, "finite score"],
    ["visible labels", { rankLabel: " " }, "rank and score labels"],
    [
      "current-user label",
      { isCurrentUser: true, currentUserLabel: " " },
      "current-user label",
    ],
    [
      "change label",
      { change: { direction: "up", label: " " } },
      "change label",
    ],
  ] as const)("requires a valid %s", (_field, props, message) => {
    expect(() =>
      render(
        <ol>
          <LeaderboardItem
            participantName="Emi"
            rank={1}
            score={10}
            {...props}
          />
        </ol>,
      ),
    ).toThrow(message);
  });

  it("uses the supplied avatar image when an image URL is provided", () => {
    const { container } = render(
      <ol>
        <LeaderboardItem
          avatarSrc="/emi.png"
          participantName="Emi Tanaka"
          rank={1}
          score={980}
        />
      </ol>,
    );

    expect(container.querySelector("img")).toHaveAttribute("src", "/emi.png");
  });
});
