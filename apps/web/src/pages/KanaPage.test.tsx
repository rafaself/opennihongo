// @vitest-environment jsdom
import { act, cleanup, render, screen } from "@testing-library/react";
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

    const heading = screen.getByRole("heading", { name: /session complete/i });
    expect(document.activeElement).toBe(heading);
    screen.getByText(/5 of 5 correct/i);
    expect(storage.saveKanaAnswer).toHaveBeenCalledTimes(5);
    expect(storage.saveKanaAnswer.mock.calls[0]?.[1]).toBe(true);
  });

  it("can start another session without discarding saved progress", async () => {
    const user = userEvent.setup();
    render(<KanaPage />);

    await screen.findByText("あ");
    for (const [index, answer] of ["a", "i", "u", "e", "o"].entries()) {
      await user.type(screen.getByRole("textbox", { name: /romaji/i }), answer);
      await user.click(screen.getByRole("button", { name: /check answer/i }));
      await screen.findByText("Correct!");
      await user.click(
        screen.getByRole("button", {
          name: index === 4 ? /see results/i : /next kana/i,
        }),
      );
    }

    await user.click(screen.getByRole("button", { name: /practice again/i }));
    screen.getByText("あ");
    screen.getByText(/character 1 of 5 · 5 practiced on this device/i);
    expect(document.activeElement).toBe(
      screen.getByRole("textbox", { name: /romaji/i }),
    );
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

  it("ignores a stale progress read after leaving the lesson", async () => {
    let resolveFirst!: (value: KanaProgress[]) => void;
    storage.loadKanaProgress.mockImplementationOnce(
      () =>
        new Promise<KanaProgress[]>((resolve) => {
          resolveFirst = resolve;
        }),
    );
    const first = render(<KanaPage />);
    first.unmount();

    render(<KanaPage />);
    await screen.findByText(/0 practiced on this device/i);
    await act(async () => {
      resolveFirst([
        {
          itemId: "kana.hiragana.a",
          correctCount: 1,
          incorrectCount: 0,
          lastAnsweredAt: "2026-09-26T00:00:00.000Z",
        },
      ]);
      await Promise.resolve();
    });

    screen.getByText(/0 practiced on this device/i);
  });

  it("ignores a stale storage error after leaving the lesson", async () => {
    let rejectFirst!: (reason: Error) => void;
    storage.loadKanaProgress.mockImplementationOnce(
      () =>
        new Promise<KanaProgress[]>((_resolve, reject) => {
          rejectFirst = reject;
        }),
    );
    const first = render(<KanaPage />);
    first.unmount();

    render(<KanaPage />);
    await screen.findByText(/0 practiced on this device/i);
    await act(async () => {
      rejectFirst(new Error("storage unavailable"));
      await Promise.resolve();
    });

    expect(screen.queryByRole("alert")).toBeNull();
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
