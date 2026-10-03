import { normalizePracticeSearch } from "../../../../app/practiceSearch";
import { kanaPracticeConfigurationId } from "../../session/createKanaPracticeSession";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { RouterProvider } from "@tanstack/react-router";
import { afterEach, beforeEach, expect, vi } from "vitest";
import { router } from "../../../../app/router";

const cardAudio = vi.hoisted(() => ({
  preload: vi.fn<(ids: readonly string[]) => Promise<ReadonlySet<string>>>(),
  play: vi.fn(),
  dispose: vi.fn(),
}));
const speech = vi.hoisted(() => vi.fn());
const asset = vi.hoisted(() => vi.fn<(id: string) => string | undefined>());
vi.mock("@opennihongo/audio-assets", () => ({
  getAudioAsset: asset,
  getKanaChartAudioAsset: asset,
}));
vi.mock("../../audio/audioCache", () => ({
  createExerciseAudioCache: () => cardAudio,
}));
vi.mock("../../../../lib/pronunciation", () => ({
  playJapanesePronunciation: speech,
}));

beforeEach(() => {
  asset.mockReset().mockImplementation((id) => `/audio/${id}.opus`);
  cardAudio.preload
    .mockReset()
    .mockImplementation((ids) => Promise.resolve(new Set(ids)));
});
afterEach(async () => {
  vi.useRealTimers();
  await router.navigate({ to: "/" });
  cleanup();
  vi.clearAllMocks();
  vi.restoreAllMocks();
});

export async function openCards(
  subject: "kana" | "words" = "kana",
  search: Record<string, unknown> = {},
) {
  render(<RouterProvider router={router} />);
  await router.navigate({
    to: subject === "kana" ? "/practice/kana/cards" : "/practice/words/cards",
    search: { scripts: ["katakana"], categories: ["small-tsu"], ...search },
  });
  await screen.findByRole("heading", {
    name: subject === "kana" ? "Kana cards" : "Word cards",
  });
  await waitFor(() => {
    expect(
      screen.getByRole<HTMLButtonElement>("button", { name: "Reveal answer" })
        .disabled,
    ).toBe(false);
  });
}

export { cardAudio, speech, asset };

export const kanaCardCollectionId = `kana:${kanaPracticeConfigurationId(normalizePracticeSearch({ scripts: ["katakana"], categories: ["small-tsu"] }))}`;
