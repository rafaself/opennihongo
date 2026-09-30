import "./practiceTestHelpers";
import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";
import { router } from "../../../app/router";
import { openQuiz, question, requireValue } from "./quizTestHelpers";
import {
  audioCacheMock,
  chartAudioMock,
  pronunciationMock,
} from "./practiceTestHelpers";

it("starts with setup, validates URL choices, and stores direction and Fast mode", async () => {
  const user = userEvent.setup();
  await openQuiz({ direction: "invalid", fast: "invalid" });
  expect(document.title).toBe("Kana quiz · OpenNihongo");
  expect(
    screen.getByRole("radio", { name: "Random" }).getAttribute("aria-checked"),
  ).toBe("true");
  expect(
    screen
      .getByRole("switch", { name: "Fast mode" })
      .getAttribute("aria-checked"),
  ).toBe("false");
  expect(
    screen.queryByRole("navigation", { name: "Primary navigation" }),
  ).toBeNull();
  await user.click(screen.getByRole("radio", { name: "Romaji → Character" }));
  await user.click(screen.getByRole("switch", { name: "Fast mode" }));
  expect(router.state.location.search).toMatchObject({
    direction: "romaji",
    fast: true,
  });
  await user.click(screen.getByRole("link", { name: "Leave practice" }));
  await screen.findByRole("heading", { name: "Practice", level: 1 });
  expect(router.state.location.search).toEqual({
    script: "katakana",
    category: "small-tsu",
  });
  expect(
    screen.getByRole("link", { name: "Play Kana quiz" }).getAttribute("href"),
  ).toContain("/practice/kana/quiz");
});

it("preserves both settings when direction and Fast mode change together", async () => {
  await openQuiz({ direction: "romaji", fast: true });
  fireEvent.click(screen.getByRole("radio", { name: "Character → Romaji" }));
  fireEvent.click(screen.getByRole("switch", { name: "Fast mode" }));
  await waitFor(() => {
    expect(router.state.location.search).toMatchObject({
      direction: "character",
      fast: false,
    });
  });
});

it("checks a changeable choice once, reveals wrong answers, skips, scores, and replays", async () => {
  const user = userEvent.setup();
  await openQuiz({ direction: "character" });
  await user.click(screen.getByRole("button", { name: "Start quiz" }));
  await screen.findByRole("heading", { name: "Choose the correct answer" });
  const exercise = question(0);
  const group = within(screen.getByRole("group", { name: "Answer options" }));
  const correct = requireValue(
    exercise.options.find(({ id }) => id === exercise.correctOptionId),
  );
  const wrong = requireValue(
    exercise.options.find(({ id }) => id !== exercise.correctOptionId),
  );
  expect(group.getAllByRole("button")).toHaveLength(4);
  expect(group.getAllByRole("button")[0]).toBe(document.activeElement);
  expect(
    screen.getByRole<HTMLButtonElement>("button", { name: "Check answer" })
      .disabled,
  ).toBe(true);
  await user.click(group.getByRole("button", { name: wrong.text }));
  await user.click(group.getByRole("button", { name: correct.text }));
  expect(
    group
      .getByRole("button", { name: correct.text })
      .getAttribute("aria-pressed"),
  ).toBe("true");
  await user.keyboard("{Enter}");
  expect(screen.getByRole("status").textContent).toContain("That’s right!");
  expect(
    group
      .getAllByRole<HTMLButtonElement>("button")
      .every((button) => button.disabled),
  ).toBe(true);
  await user.click(screen.getByRole("button", { name: "Continue" }));
  const next = question(1);
  await screen.findByText(next.prompt.text);
  const nextWrong = requireValue(
    next.options.find(({ id }) => id !== next.correctOptionId),
  );
  await user.click(screen.getByRole("button", { name: nextWrong.text }));
  await user.click(screen.getByRole("button", { name: "Check answer" }));
  expect(screen.getByRole("status").textContent).toContain(
    requireValue(next.options.find(({ id }) => id === next.correctOptionId))
      .text,
  );
  await user.click(screen.getByRole("button", { name: "Continue" }));
  await screen.findByText(question(2).prompt.text);
  await user.click(screen.getByRole("button", { name: "Skip" }));
  await screen.findByText(question(3).prompt.text);
  await user.click(screen.getByRole("button", { name: "Skip" }));
  const title = await screen.findByRole("heading", {
    name: "Practice complete!",
  });
  expect(title).toBe(document.activeElement);
  expect(screen.getByLabelText("Session results").textContent).toContain(
    "1 / 4",
  );
  await user.click(screen.getByRole("button", { name: "Practice again" }));
  await screen.findByText(question(0, "character", 1).prompt.text);
  expect(screen.getByRole("progressbar").getAttribute("aria-valuenow")).toBe(
    "0",
  );
  for (let index = 0; index < 4; index++) {
    await user.click(screen.getByRole("button", { name: "Skip" }));
    if (index < 3)
      await screen.findByText(question(index + 1, "character", 1).prompt.text);
  }
  await screen.findByRole("heading", { name: "Practice complete!" });
  await user.click(screen.getByRole("button", { name: "Change options" }));
  await screen.findByRole("heading", { name: "Set up your Kana quiz" });
  expect(
    screen
      .getByRole("radio", { name: "Character → Romaji" })
      .getAttribute("aria-checked"),
  ).toBe("true");
}, 10000);

it("plays prompt recordings and authored speech fallback without exposing the inverse answer", async () => {
  const user = userEvent.setup();
  await openQuiz({ direction: "romaji" });
  await user.click(screen.getByRole("button", { name: "Start quiz" }));
  const first = question(0, "romaji");
  await user.click(
    await screen.findByRole("button", {
      name: `Play pronunciation for ${first.prompt.text}`,
    }),
  );
  expect(audioCacheMock.play).toHaveBeenCalledWith(first.sourceItemIds[0]);
  await router.navigate({ to: "/practice" });
  chartAudioMock.mockReturnValue(undefined);
  await router.navigate({
    to: "/practice/kana/quiz",
    search: { script: "katakana", category: "small-tsu", direction: "romaji" },
  });
  await user.click(await screen.findByRole("button", { name: "Start quiz" }));
  await user.click(
    await screen.findByRole("button", {
      name: `Play pronunciation for ${first.prompt.text}`,
    }),
  );
  expect(pronunciationMock).toHaveBeenCalledWith(
    first.prompt.text === "kk"
      ? "ッカ"
      : first.prompt.text === "ss"
        ? "ッサ"
        : first.prompt.text === "tt"
          ? "ッタ"
          : "ッパ",
  );
});

it("cancels speech fallback when advancing and leaving the quiz", async () => {
  const user = userEvent.setup();
  const cancel = vi.fn();
  vi.stubGlobal("speechSynthesis", { cancel });
  chartAudioMock.mockReturnValue(undefined);
  await openQuiz({ direction: "romaji" });
  await user.click(screen.getByRole("button", { name: "Start quiz" }));
  await user.click(
    await screen.findByRole("button", {
      name: `Play pronunciation for ${question(0, "romaji").prompt.text}`,
    }),
  );
  await user.click(screen.getByRole("button", { name: "Skip" }));
  await screen.findByText(question(1, "romaji").prompt.text);
  expect(cancel).toHaveBeenCalledOnce();
  await user.click(screen.getByRole("link", { name: "Leave practice" }));
  await screen.findByRole("heading", { name: "Practice", level: 1 });
  expect(cancel).toHaveBeenCalledTimes(2);
  vi.unstubAllGlobals();
});
