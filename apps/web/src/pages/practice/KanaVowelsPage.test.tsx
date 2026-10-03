// @vitest-environment jsdom
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type {
  appendLearningRecord,
  LearningHistory,
} from "@opennihongo/persistence";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { RouterProvider } from "@tanstack/react-router";
import { router } from "../../app/router";

const storage = vi.hoisted(() => ({
  loadLearningHistory: vi.fn<() => Promise<LearningHistory>>(),
  appendLearningRecord: vi.fn<typeof appendLearningRecord>(),
}));

vi.mock("@opennihongo/persistence", () => storage);

beforeEach(() => {
  storage.loadLearningHistory
    .mockReset()
    .mockResolvedValue({ records: [], baselines: [] });
  storage.appendLearningRecord.mockReset().mockResolvedValue(undefined);
});

afterEach(async () => {
  await router.navigate({ to: "/" });
  cleanup();
});

async function renderSession() {
  const view = render(<RouterProvider router={router} />);
  await router.navigate({ to: "/practice/kana/vowels" });
  return view;
}

describe("first hiragana session", () => {
  it("keeps blank and whitespace answers unsubmitted", async () => {
    const user = userEvent.setup();
    await renderSession();
    await screen.findByText("あ");
    const input = screen.getByRole("textbox");
    const form = input.closest("form");
    if (!form) throw new Error("Expected the answer form");
    fireEvent.submit(form);
    await user.type(input, "   ");
    fireEvent.submit(form);
    expect(storage.appendLearningRecord).not.toHaveBeenCalled();
    expect(
      screen
        .getByRole("button", { name: /check answer/i })
        .hasAttribute("disabled"),
    ).toBe(true);
    expect(screen.queryByText("That’s right!")).toBeNull();
  });

  it.each(["success", "failure"])(
    "ignores a pending save %s after leaving and returning to the lesson",
    async (outcome) => {
      let finishSave!: () => void;
      storage.appendLearningRecord.mockImplementationOnce(
        () =>
          new Promise((resolve, reject) => {
            finishSave = () => {
              if (outcome === "success") resolve();
              else reject(new Error("storage unavailable"));
            };
          }),
      );
      const user = userEvent.setup();
      await renderSession();
      await screen.findByText("あ");
      await user.type(screen.getByRole("textbox"), "a");
      await user.click(screen.getByRole("button", { name: /check answer/i }));
      await router.navigate({ to: "/" });
      await router.navigate({ to: "/practice/kana/vowels" });
      await screen.findByText(/0 practiced on this device/i);
      await act(async () => {
        finishSave();
        await Promise.resolve();
      });
      expect(screen.getByRole<HTMLInputElement>("textbox").value).toBe("");
      expect(screen.getByRole("textbox").hasAttribute("disabled")).toBe(false);
      expect(screen.queryByRole("alert")).toBeNull();
      expect(screen.queryByText("That’s right!")).toBeNull();
      screen.getByText(/0 practiced on this device/i);
    },
  );

  it("submits and continues with Enter, preserving input and feedback focus", async () => {
    const user = userEvent.setup();
    await renderSession();
    await screen.findByText("あ");
    const input = screen.getByRole("textbox", { name: /romaji/i });
    expect(document.activeElement).toBe(input);
    await user.type(input, "Ａ");
    await user.keyboard("{Enter}");
    await screen.findByText("That’s right!");
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: /^continue$/i }),
    );
    await user.keyboard("{Enter}");
    await screen.findByText("い");
    await vi.waitFor(() => {
      expect(document.activeElement).toBe(
        screen.getByRole("textbox", { name: /romaji/i }),
      );
    });
    expect(storage.appendLearningRecord).toHaveBeenCalledOnce();
  });

  it("records one answer while storage is pending and ignores repeated submissions", async () => {
    let finishSave!: () => void;
    storage.appendLearningRecord.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          finishSave = () => {
            resolve();
          };
        }),
    );
    const user = userEvent.setup();
    await renderSession();
    await screen.findByText("あ");
    await user.type(screen.getByRole("textbox"), "a");
    const form = screen.getByRole("textbox").closest("form");
    if (!form) throw new Error("Expected the answer form");
    fireEvent.submit(form);
    fireEvent.submit(form);
    expect(storage.appendLearningRecord).toHaveBeenCalledOnce();
    expect(screen.getByRole("textbox").hasAttribute("disabled")).toBe(true);
    expect(screen.queryByText("That’s right!")).toBeNull();
    await act(async () => {
      finishSave();
      await Promise.resolve();
    });
    await screen.findByText("That’s right!");
    screen.getByText(/1 practiced on this device/i);
  });
  it("shows previously practiced vowels from local progress", async () => {
    storage.loadLearningHistory.mockResolvedValue({
      records: [],
      baselines: [
        {
          itemId: "kana.hiragana.a",
          correctCount: 1,
          incorrectCount: 0,
          lastPracticedAt: "2026-09-26T00:00:00.000Z",
        },
      ],
    });
    await renderSession();

    await screen.findByText(/1 practiced on this device/i);
  });

  it("checks all five vowels, saves answers, and summarizes the session", async () => {
    const user = userEvent.setup();
    await renderSession();

    await screen.findByText("あ");
    for (const [index, answer] of [" A ", "i", "u", "e", "o"].entries()) {
      await user.type(screen.getByRole("textbox", { name: /romaji/i }), answer);
      await user.click(screen.getByRole("button", { name: /check answer/i }));
      await screen.findByText("That’s right!");
      if (index < 4) {
        await user.click(screen.getByRole("button", { name: /^continue$/i }));
      } else {
        await user.click(screen.getByRole("button", { name: /see results/i }));
      }
    }

    const heading = screen.getByRole("heading", { name: /perfect practice/i });
    expect(document.activeElement).toBe(heading);
    screen.getByText("5 / 5");
    screen.getByText("100%");
    expect(storage.appendLearningRecord).toHaveBeenCalledTimes(5);
    expect(
      storage.appendLearningRecord.mock.calls[0]?.[0]?.result,
    ).toMatchObject({
      outcome: "correct",
      sourceItemResults: [
        { sourceItemId: "kana.hiragana.a", outcome: "correct" },
      ],
    });
  });

  it("can start another session without discarding saved progress", async () => {
    const user = userEvent.setup();
    await renderSession();

    await screen.findByText("あ");
    for (const [index, answer] of ["a", "i", "u", "e", "o"].entries()) {
      await user.type(screen.getByRole("textbox", { name: /romaji/i }), answer);
      await user.click(screen.getByRole("button", { name: /check answer/i }));
      await screen.findByText("That’s right!");
      await user.click(
        screen.getByRole("button", {
          name: index === 4 ? /see results/i : /^continue$/i,
        }),
      );
    }

    await user.click(screen.getByRole("button", { name: /practice again/i }));
    screen.getByText("あ");
    screen.getByText(/character 1 of 5 · 5 practiced on this device/i);
    expect(document.activeElement).toBe(
      screen.getByRole("textbox", { name: /romaji/i }),
    );
    await user.type(screen.getByRole("textbox"), "a");
    await user.keyboard("{Enter}");
    await screen.findByText("That’s right!");
    expect(storage.appendLearningRecord.mock.calls[5]?.[0]?.sessionId).not.toBe(
      storage.appendLearningRecord.mock.calls[0]?.[0]?.sessionId,
    );
  });

  it("shows the expected answer and records an incorrect response", async () => {
    const user = userEvent.setup();
    await renderSession();

    await screen.findByText("あ");
    await user.type(screen.getByRole("textbox", { name: /romaji/i }), "o");
    await user.click(screen.getByRole("button", { name: /check answer/i }));

    await screen.findByText(/the answer is a/i);
    expect(
      storage.appendLearningRecord.mock.calls[0]?.[0]?.result,
    ).toMatchObject({
      outcome: "incorrect",
      sourceItemResults: [
        { sourceItemId: "kana.hiragana.a", outcome: "incorrect" },
      ],
    });
  });

  it("keeps the session usable when progress cannot load", async () => {
    storage.loadLearningHistory.mockRejectedValue(
      new Error("storage unavailable"),
    );
    await renderSession();

    expect((await screen.findByRole("alert")).textContent).toMatch(
      /progress could not be loaded/i,
    );
    screen.getByText(/Progress unavailable on this device/);
    screen.getByText("あ");
    expect(
      screen.getByRole("textbox", { name: /romaji/i }).hasAttribute("disabled"),
    ).toBe(false);
  });

  it("keeps feedback usable when historical totals cannot be safely projected", async () => {
    storage.loadLearningHistory.mockResolvedValue({
      records: [],
      baselines: [
        {
          itemId: "kana.hiragana.a",
          correctCount: Number.MAX_SAFE_INTEGER,
          incorrectCount: 0,
          lastPracticedAt: "2026-09-26T00:00:00.000Z",
        },
      ],
    });
    const user = userEvent.setup();
    await renderSession();
    await user.type(await screen.findByRole("textbox"), "a");
    await user.keyboard("{Enter}");
    await screen.findByText("That’s right!");
    await screen.findByText(/Progress could not be calculated/);
    await user.click(screen.getByRole("button", { name: "Continue" }));
    screen.getByText("い");
    for (const [index, answer] of ["i", "u", "e", "o"].entries()) {
      await user.type(screen.getByRole("textbox"), answer);
      await user.keyboard("{Enter}");
      await screen.findByText("That’s right!");
      await user.click(
        screen.getByRole("button", {
          name: index === 3 ? "See results" : "Continue",
        }),
      );
    }
    screen.getByText("Local progress is unavailable.");
  });

  it("ignores a stale progress read after leaving the lesson", async () => {
    let resolveFirst!: (value: LearningHistory) => void;
    storage.loadLearningHistory.mockImplementationOnce(
      () =>
        new Promise<LearningHistory>((resolve) => {
          resolveFirst = resolve;
        }),
    );
    const first = await renderSession();
    first.unmount();

    await renderSession();
    await screen.findByText(/0 practiced on this device/i);
    await act(async () => {
      resolveFirst({
        records: [],
        baselines: [
          {
            itemId: "kana.hiragana.a",
            correctCount: 1,
            incorrectCount: 0,
            lastPracticedAt: "2026-09-26T00:00:00.000Z",
          },
        ],
      });
      await Promise.resolve();
    });

    screen.getByText(/0 practiced on this device/i);
  });

  it("ignores a stale storage error after leaving the lesson", async () => {
    let rejectFirst!: (reason: Error) => void;
    storage.loadLearningHistory.mockImplementationOnce(
      () =>
        new Promise<LearningHistory>((_resolve, reject) => {
          rejectFirst = reject;
        }),
    );
    const first = await renderSession();
    first.unmount();

    await renderSession();
    await screen.findByText(/0 practiced on this device/i);
    await act(async () => {
      rejectFirst(new Error("storage unavailable"));
      await Promise.resolve();
    });

    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("retries a failed answer after continuing without counting it before commit", async () => {
    storage.appendLearningRecord.mockRejectedValueOnce(new Error("quota"));
    const user = userEvent.setup();
    await renderSession();
    await user.type(await screen.findByRole("textbox"), "a");
    await user.keyboard("{Enter}");
    await screen.findByRole("alert");
    screen.getByText(/0 practiced on this device/);
    const failed = storage.appendLearningRecord.mock.calls[0]?.[0];
    await user.click(screen.getByRole("button", { name: "Continue" }));
    await user.click(screen.getByRole("button", { name: "Retry saving" }));
    await screen.findByText(/1 practiced on this device/);
    expect(storage.appendLearningRecord.mock.calls[1]?.[0]).toBe(failed);
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("reports a failed save and still lets the learner continue", async () => {
    const user = userEvent.setup();
    storage.appendLearningRecord.mockRejectedValue(
      new Error("storage unavailable"),
    );
    await renderSession();

    await screen.findByText("あ");
    await user.type(screen.getByRole("textbox", { name: /romaji/i }), "a");
    await user.click(screen.getByRole("button", { name: /check answer/i }));

    expect((await screen.findByRole("alert")).textContent).toMatch(
      /answer could not be saved/i,
    );
    await user.click(screen.getByRole("button", { name: /^continue$/i }));
    screen.getByText("い");
  });
});
