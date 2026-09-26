// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { KanaItem, KanaProgress } from "@opennihongo/core";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { KanaPage } from "./KanaPage";

const storage = vi.hoisted(() => ({
  loadKanaProgress: vi.fn<() => Promise<KanaProgress[]>>(),
  saveKanaAnswer:
    vi.fn<
      (
        item: KanaItem,
        correct: boolean,
        answeredAt: string,
      ) => Promise<KanaProgress>
    >(),
}));

vi.mock("@opennihongo/persistence", () => storage);

beforeEach(() => {
  storage.loadKanaProgress.mockReset().mockResolvedValue([]);
  storage.saveKanaAnswer.mockReset().mockImplementation((item, correct) =>
    Promise.resolve({
      itemId: item.id,
      correctCount: Number(correct),
      incorrectCount: Number(!correct),
      lastAnsweredAt: "2026-09-26T00:00:00.000Z",
    }),
  );
});

afterEach(cleanup);

describe("first hiragana session", () => {
  it("shows previously practiced vowels from local progress", async () => {
    storage.loadKanaProgress.mockResolvedValue([
      {
        itemId: "kana.hiragana.a",
        correctCount: 1,
        incorrectCount: 0,
        lastAnsweredAt: "2026-09-26T00:00:00.000Z",
      },
    ]);
    render(<KanaPage />);

    await screen.findByText(/1 practiced on this device/i);
  });

  it("checks all five vowels, saves answers, and summarizes the session", async () => {
    const user = userEvent.setup();
    render(<KanaPage />);

    await screen.findByText("あ");
    for (const [index, answer] of [" A ", "i", "u", "e", "o"].entries()) {
      await user.type(screen.getByRole("textbox", { name: /romaji/i }), answer);
      await user.click(screen.getByRole("button", { name: /check answer/i }));
      await screen.findByText("Correct!");
      if (index < 4) {
        await user.click(screen.getByRole("button", { name: /next kana/i }));
      } else {
        await user.click(screen.getByRole("button", { name: /see results/i }));
      }
    }

    screen.getByRole("heading", { name: /session complete/i });
    screen.getByText(/5 of 5 correct/i);
    expect(storage.saveKanaAnswer).toHaveBeenCalledTimes(5);
    expect(storage.saveKanaAnswer.mock.calls[0]?.[1]).toBe(true);
  });

  it("shows the expected answer and records an incorrect response", async () => {
    const user = userEvent.setup();
    render(<KanaPage />);

    await screen.findByText("あ");
    await user.type(screen.getByRole("textbox", { name: /romaji/i }), "o");
    await user.click(screen.getByRole("button", { name: /check answer/i }));

    await screen.findByText(/the answer is a/i);
    expect(storage.saveKanaAnswer.mock.calls[0]?.[1]).toBe(false);
  });

  it("keeps the session usable when progress cannot load", async () => {
    storage.loadKanaProgress.mockRejectedValue(
      new Error("storage unavailable"),
    );
    render(<KanaPage />);

    expect((await screen.findByRole("alert")).textContent).toMatch(
      /progress could not be loaded/i,
    );
    screen.getByText("あ");
    expect(
      screen.getByRole("textbox", { name: /romaji/i }).hasAttribute("disabled"),
    ).toBe(false);
  });

  it("reports a failed save and still lets the learner continue", async () => {
    const user = userEvent.setup();
    storage.saveKanaAnswer.mockRejectedValue(new Error("storage unavailable"));
    render(<KanaPage />);

    await screen.findByText("あ");
    await user.type(screen.getByRole("textbox", { name: /romaji/i }), "a");
    await user.click(screen.getByRole("button", { name: /check answer/i }));

    expect((await screen.findByRole("alert")).textContent).toMatch(
      /answer could not be saved/i,
    );
    await user.click(screen.getByRole("button", { name: /next kana/i }));
    screen.getByText("い");
  });
});
