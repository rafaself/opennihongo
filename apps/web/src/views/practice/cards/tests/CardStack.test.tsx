import {
  openCards,
  kanaCardCollectionId,
  cardAudio as audioCacheMock,
  speech as pronunciationMock,
} from "./cardStackTestHelpers";
import { act, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";
import { router } from "../../../../app/router";
import { createCardStackSession } from "../createCardStackSession";
import { getKanaCards, getWordCards } from "../cardStackContent";
import {
  saveAppPreferences,
  defaultAppPreferences,
} from "../../../../app/preferences";

it("reveals before self-rating, records recall and skips, and replays with a fresh hidden answer", async () => {
  const user = userEvent.setup();
  await openCards();
  const session = createCardStackSession(
    getKanaCards({ scripts: ["katakana"], categories: ["small-tsu"] }),
    kanaCardCollectionId,
    0,
    "test-session",
  );
  expect(screen.getByText("1/4")).toBeTruthy();
  expect(screen.queryByRole("button", { name: /Got it/ })).toBeNull();
  expect(screen.queryByText(session.exercises[0]?.back.text ?? "")).toBeNull();
  await user.keyboard("1");
  expect(screen.getByText("1/4")).toBeTruthy();
  await user.click(screen.getByRole("button", { name: "Reveal answer" }));
  expect(screen.getByRole("status").textContent).toContain(
    session.exercises[0]?.back.text,
  );
  await user.click(screen.getByRole("button", { name: /Got it/ }));
  await screen.findByRole("button", { name: "Reveal answer" });
  expect(screen.getByText("2/4")).toBeTruthy();
  await user.keyboard("{Enter}");
  await user.keyboard("1");
  await screen.findByRole("button", { name: "Reveal answer" });
  await user.click(screen.getByRole("button", { name: "Skip" }));
  await screen.findByRole("button", { name: "Reveal answer" });
  await user.keyboard(" ");
  await user.keyboard("2");
  const heading = await screen.findByRole("heading", {
    name: "Practice complete!",
  });
  expect(document.activeElement).toBe(heading);
  expect(screen.getByText("Remembered")).toBeTruthy();
  expect(screen.getByText("2 / 4")).toBeTruthy();
  expect(screen.getByText("Recall")).toBeTruthy();
  expect(screen.getByText("50%")).toBeTruthy();
  expect(screen.getByText(/1 marked for practice.*1 skipped/)).toBeTruthy();
  await user.click(screen.getByRole("button", { name: "Practice again" }));
  const reveal = await screen.findByRole("button", { name: "Reveal answer" });
  expect(document.activeElement).toBe(reveal);
  expect(screen.getByText("1/4")).toBeTruthy();
  const replay = createCardStackSession(
    getKanaCards({ scripts: ["katakana"], categories: ["small-tsu"] }),
    kanaCardCollectionId,
    1,
    "test-session",
  );
  expect(screen.getByText(replay.exercises[0]?.front.text ?? "")).toBeTruthy();
  expect(screen.queryByText(replay.exercises[0]?.back.text ?? "")).toBeNull();
});

it("completes the word collection using the same card interaction and preserves hub selections", async () => {
  const user = userEvent.setup();
  await openCards("words");
  const session = createCardStackSession(
    getWordCards(),
    "words:beginner",
    0,
    "test-session",
  );
  for (const card of session.exercises) {
    await screen.findByRole("button", { name: "Reveal answer" });
    expect(screen.getByText(card.front.text)).toBeTruthy();
    await user.click(
      screen.getByRole("button", { name: /Play pronunciation/ }),
    );
    expect(audioCacheMock.play).toHaveBeenLastCalledWith(card.sourceItemIds[0]);
    await user.click(screen.getByRole("button", { name: "Reveal answer" }));
    expect(screen.getByRole("status").textContent).toContain(card.back.text);
    expect(screen.getByText(card.back.supportingText ?? "")).toBeTruthy();
    await user.click(screen.getByRole("button", { name: /Got it/ }));
  }
  await screen.findByRole("heading", { name: "Perfect practice!" });
  expect(screen.getByText("5 / 5")).toBeTruthy();
  await user.click(screen.getByRole("link", { name: "Back to Practice" }));
  await screen.findByRole("heading", { name: "Practice", level: 1 });
  expect(router.state.location.search).toMatchObject({
    scripts: ["katakana"],
    categories: ["small-tsu"],
  });
  const link = screen.getByRole("link", { name: "Play word cards" });
  await user.click(link);
  await screen.findByRole("button", { name: "Reveal answer" });
  expect(screen.getByText("1/5")).toBeTruthy();
});

it("ignores held or modified shortcuts and scores each card once", async () => {
  await openCards();
  const key = (init: KeyboardEventInit) => {
    act(() => {
      window.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Enter", bubbles: true, ...init }),
      );
    });
  };
  for (const init of [
    { repeat: true },
    { ctrlKey: true },
    { altKey: true },
    { metaKey: true },
    { isComposing: true },
  ]) {
    key(init);
    expect(screen.queryByRole("button", { name: /Got it/ })).toBeNull();
  }
  await userEvent
    .setup()
    .click(screen.getByRole("button", { name: "Reveal answer" }));
  act(() => {
    for (let index = 0; index < 3; index += 1)
      window.dispatchEvent(
        new KeyboardEvent("keydown", { key: "2", bubbles: true }),
      );
  });
  await screen.findByRole("button", { name: "Reveal answer" });
  expect(screen.getByText("2/4")).toBeTruthy();
});

it("cancels playback on exit and uses authored speech when a recording cannot load", async () => {
  audioCacheMock.preload.mockResolvedValue(new Set());
  const cancel = vi.fn();
  vi.stubGlobal("speechSynthesis", { cancel });
  try {
    await openCards();
    const first = createCardStackSession(
      getKanaCards({ scripts: ["katakana"], categories: ["small-tsu"] }),
      kanaCardCollectionId,
      0,
      "test-session",
    ).exercises[0];
    const source = getKanaCards({
      scripts: ["katakana"],
      categories: ["small-tsu"],
    }).find(({ id }) => id === first?.sourceItemIds[0]);
    const user = userEvent.setup();
    await user.click(
      screen.getByRole("button", { name: /Play pronunciation/ }),
    );
    expect(pronunciationMock).toHaveBeenCalledWith(source?.pronunciationText);
    await user.click(screen.getByRole("link", { name: "Leave practice" }));
    await screen.findByRole("heading", { name: "Practice", level: 1 });
    expect(audioCacheMock.dispose).toHaveBeenCalled();
    expect(cancel).toHaveBeenCalled();
    expect(router.state.location.search).toMatchObject({
      scripts: ["katakana"],
      categories: ["small-tsu"],
    });
  } finally {
    vi.unstubAllGlobals();
  }
});

it("offers the selected Kana stack from the hub and restores a hidden first card on re-entry", async () => {
  const user = userEvent.setup();
  await openCards();
  expect(document.title).toBe("Kana cards · OpenNihongo");
  expect(
    screen.queryByRole("navigation", { name: "Primary navigation" }),
  ).toBeNull();
  await user.click(screen.getByRole("button", { name: "Reveal answer" }));
  await user.click(screen.getByRole("link", { name: "Leave practice" }));
  const kana = within(await screen.findByRole("region", { name: "Kana" }));
  const card = kana
    .getByRole("heading", { name: "Kana cards" })
    .closest("article");
  expect(card?.textContent).toContain("Recall");
  await user.click(kana.getByRole("link", { name: "Set up Kana cards" }));
  await user.click(
    await screen.findByRole("button", { name: "Start Kana cards" }),
  );
  await screen.findByRole("button", { name: /Play pronunciation/ });
  expect(screen.getByText("1/4")).toBeTruthy();
  expect(screen.getByRole("button", { name: "Reveal answer" })).toBeTruthy();
  expect(screen.queryByRole("button", { name: /Got it/ })).toBeNull();
});

it("respects the romaji preference on the revealed word face", async () => {
  saveAppPreferences({ ...defaultAppPreferences, showRomaji: false });
  try {
    await openCards("words");
    const first = createCardStackSession(
      getWordCards(),
      "words:beginner",
      0,
      "test-session",
    ).exercises[0];
    await userEvent
      .setup()
      .click(screen.getByRole("button", { name: "Reveal answer" }));
    expect(screen.getByRole("status").textContent).toContain(first?.back.text);
    expect(screen.queryByText(first?.back.supportingText ?? "")).toBeNull();
  } finally {
    window.localStorage.clear();
  }
});

it("keeps native Enter activation for pronunciation and visible focus during Tab navigation", async () => {
  await openCards();
  const user = userEvent.setup();
  const button = screen.getByRole("button", { name: /Play pronunciation/ });
  button.focus();
  await user.keyboard("{Enter}");
  expect(audioCacheMock.play).toHaveBeenCalledOnce();
  expect(screen.queryByRole("button", { name: /Got it/ })).toBeNull();
  await user.tab();
  expect(document.documentElement.getAttribute("data-focus-navigation")).toBe(
    "true",
  );
  expect(document.activeElement).toBe(
    screen.getByRole("button", { name: "Skip" }),
  );
  await user.tab();
  expect(document.activeElement).toBe(
    screen.getByRole("button", { name: "Reveal answer" }),
  );
});
