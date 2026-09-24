import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { RewardCard } from "./RewardCard";

describe("RewardCard", () => {
  it("presents caller-supplied reward details and a visible state", () => {
    render(
      <RewardCard
        category="xp"
        categoryLabel="Experience"
        label="Lesson bonus"
        state="earned"
        stateLabel="Added to balance"
        value="+50 XP"
      />,
    );

    const card = screen.getByRole("article", {
      name: "Lesson bonus Added to balance",
    });

    expect(card).toHaveAttribute("data-category", "xp");
    expect(card).toHaveAttribute("data-state", "earned");
    expect(screen.getByText("Experience")).toBeVisible();
    expect(screen.getByText("+50 XP")).toBeVisible();
    expect(screen.getByText("Added to balance")).toBeVisible();
  });

  it("uses accessible labels and semantic markers for each supported category", () => {
    render(
      <>
        <RewardCard category="xp" label="XP reward" state="earned" value={50} />
        <RewardCard
          category="streak"
          label="Streak reward"
          state="preview"
          value="7 days"
        />
        <RewardCard
          category="achievement"
          label="Achievement reward"
          state="locked"
          value="Gold badge"
        />
      </>,
    );

    expect(
      screen.getByRole("article", { name: "XP reward Earned" }),
    ).toHaveAttribute("data-category", "xp");
    expect(
      screen.getByRole("article", { name: "Streak reward Preview" }),
    ).toHaveAttribute("data-category", "streak");
    expect(
      screen.getByRole("article", { name: "Achievement reward Locked" }),
    ).toHaveAttribute("data-category", "achievement");
  });

  it("rejects missing labels and display values", () => {
    expect(() =>
      render(
        <RewardCard category="xp" label=" " state="earned" value="50 XP" />,
      ),
    ).toThrow("RewardCard requires a non-empty label.");

    expect(() =>
      render(
        <RewardCard
          category="xp"
          label="Lesson bonus"
          state="earned"
          stateLabel=" "
          value="50 XP"
        />,
      ),
    ).toThrow("RewardCard requires a non-empty state label.");

    expect(() =>
      render(
        <RewardCard
          category="xp"
          categoryLabel=" "
          label="Lesson bonus"
          state="earned"
          value="50 XP"
        />,
      ),
    ).toThrow("RewardCard requires a non-empty category label.");

    expect(() =>
      render(
        <RewardCard
          category="xp"
          label="Lesson bonus"
          state="earned"
          value=" "
        />,
      ),
    ).toThrow("RewardCard requires a non-empty finite value.");

    expect(() =>
      render(
        <RewardCard
          category="xp"
          label="Lesson bonus"
          state="earned"
          value={Number.NaN}
        />,
      ),
    ).toThrow("RewardCard requires a non-empty finite value.");
  });
});
