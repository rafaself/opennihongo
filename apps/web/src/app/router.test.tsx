import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type {
  appendLearningRecord,
  LearningHistory,
} from "@opennihongo/persistence";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { RouterProvider } from "@tanstack/react-router";
import { router } from "./router";

const storage = vi.hoisted(() => ({
  loadLearningHistory: vi.fn<() => Promise<LearningHistory>>(),
  appendLearningRecord: vi.fn<typeof appendLearningRecord>(),
}));

vi.mock("@opennihongo/persistence", () => storage);

async function renderHome() {
  render(<RouterProvider router={router} />);
  await router.navigate({ to: "/" });
  await screen.findByRole("heading", {
    name: "Make steady progress, one step at a time.",
  });
}

function installSpeechMocks() {
  const cancel = vi.fn();
  const speak = vi.fn();
  class FakeUtterance {
    lang = "";
    constructor(readonly text: string) {}
  }
  Object.defineProperty(window, "speechSynthesis", {
    configurable: true,
    value: { cancel, speak },
  });
  vi.stubGlobal("SpeechSynthesisUtterance", FakeUtterance);
  return { cancel, speak };
}

beforeEach(() => {
  storage.loadLearningHistory
    .mockReset()
    .mockResolvedValue({ records: [], baselines: [] });
  storage.appendLearningRecord.mockReset().mockResolvedValue(undefined);
});

afterEach(() => {
  cleanup();
  Reflect.deleteProperty(window, "speechSynthesis");
  vi.unstubAllGlobals();
});

describe("web application routes", () => {
  it("shows the learning home and opens the first Kana lesson", async () => {
    const user = userEvent.setup();
    await renderHome();
    expect(
      screen.getByRole("navigation", { name: "Primary navigation" }),
    ).toBeTruthy();
    expect(
      screen
        .getByRole("link", { name: "Start practicing" })
        .getAttribute("href"),
    ).toBe("/practice");

    await user.click(screen.getByRole("link", { name: "Start practicing" }));
    await screen.findByRole("heading", { name: "Practice", level: 1 });
    await user.click(screen.getByRole("link", { name: "Start first vowels" }));

    await screen.findByRole("heading", { name: "Learn the five vowels" });
    expect(document.title).toBe("First vowels · OpenNihongo");
    expect(
      screen.queryByRole("navigation", { name: "Primary navigation" }),
    ).toBeNull();
    expect(screen.queryByRole("button", { name: "Open menu" })).toBeNull();
    await user.click(screen.getByRole("link", { name: "Leave practice" }));
    await screen.findByRole("heading", { name: "Practice", level: 1 });
    expect(
      screen.getByRole("navigation", { name: "Primary navigation" }),
    ).toBeTruthy();
  });

  it("shows every chart tile, plays pronunciation, and opens the lesson", async () => {
    const user = userEvent.setup();
    const speech = installSpeechMocks();
    const audioElements: {
      src: string;
      play: ReturnType<typeof vi.fn>;
      pause: ReturnType<typeof vi.fn>;
    }[] = [];
    class FakeAudio {
      readonly play = vi.fn().mockResolvedValue(undefined);
      readonly pause = vi.fn();
      readonly addEventListener = vi.fn();

      constructor(readonly src: string) {
        audioElements.push(this);
      }
    }
    vi.stubGlobal("Audio", FakeAudio);
    await renderHome();

    await user.click(screen.getByRole("link", { name: "Kana" }));
    await screen.findByRole("heading", { name: "Let's learn Hiragana!" });
    const basic = within(
      screen.getByRole("region", { name: "Basic characters" }),
    );
    const combinations = within(
      screen.getByRole("region", { name: "Combinations" }),
    );
    const smallTsu = within(screen.getByRole("region", { name: "Small っ" }));
    const longVowels = within(
      screen.getByRole("region", { name: "Long vowels" }),
    );
    expect(
      screen
        .getByRole("radio", { name: "Hiragana" })
        .getAttribute("aria-checked"),
    ).toBe("true");
    expect(
      screen.getByRole("heading", { name: "Dakuon and handakuon" }),
    ).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Combinations" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Small っ" })).toBeTruthy();
    expect(
      combinations.getByRole("button", {
        name: "Play pronunciation for きゃ, kya",
      }),
    ).toBeTruthy();
    expect(
      longVowels.getByRole("button", {
        name: "Play pronunciation for ああ, aa",
      }),
    ).toBeTruthy();
    expect(
      screen.getAllByRole("button", { name: /Play pronunciation for/ }),
    ).toHaveLength(115);
    expect(document.querySelectorAll(".kana-chart__progress")).toHaveLength(
      115,
    );
    for (const strip of document.querySelectorAll(".kana-chart__progress")) {
      expect(strip.getAttribute("aria-hidden")).toBe("true");
    }

    await user.click(
      basic.getByRole("button", { name: "Play pronunciation for あ, a" }),
    );
    expect(speech.cancel).toHaveBeenCalledOnce();
    expect(speech.speak).not.toHaveBeenCalled();
    expect(audioElements).toHaveLength(1);
    expect(audioElements[0]?.src).toContain(
      "kana.chart.hiragana.a.nemo-10000.opus",
    );
    expect(audioElements[0]?.play).toHaveBeenCalledOnce();

    await user.click(
      basic.getByRole("button", { name: "Play pronunciation for た, ta" }),
    );
    expect(audioElements[0]?.pause).toHaveBeenCalledOnce();
    expect(audioElements).toHaveLength(2);
    expect(audioElements[1]?.src).toContain(
      "kana.chart.hiragana.ta.nemo-10000.opus",
    );
    expect(audioElements[1]?.play).toHaveBeenCalledOnce();

    await user.click(
      combinations.getByRole("button", {
        name: "Play pronunciation for きゃ, kya",
      }),
    );
    expect(audioElements[1]?.pause).toHaveBeenCalledOnce();
    expect(audioElements).toHaveLength(3);
    expect(audioElements[2]?.src).toContain(
      "kana.chart.hiragana.combinations.kya.nemo-10000.opus",
    );
    expect(audioElements[2]?.play).toHaveBeenCalledOnce();

    await user.click(
      smallTsu.getByRole("button", { name: "Play pronunciation for っ+k, kk" }),
    );
    expect(audioElements[2]?.pause).toHaveBeenCalledOnce();
    expect(audioElements).toHaveLength(4);
    expect(audioElements[3]?.src).toContain(
      "kana.chart.hiragana.small-tsu.kk.nemo-10000.opus",
    );

    await user.click(
      longVowels.getByRole("button", {
        name: "Play pronunciation for ああ, aa",
      }),
    );
    expect(audioElements[3]?.pause).toHaveBeenCalledOnce();
    expect(audioElements).toHaveLength(5);
    expect(audioElements[4]?.src).toContain(
      "kana.chart.hiragana.long-vowels.aa.nemo-10000.opus",
    );
    expect(speech.speak).not.toHaveBeenCalled();
    expect(storage.appendLearningRecord).not.toHaveBeenCalled();

    await user.click(screen.getByRole("radio", { name: "Hiragana" }));
    await user.keyboard("{ArrowRight>}");
    await screen.findByRole("heading", { name: "Let's learn Katakana!" });
    await user.keyboard("{/ArrowRight}");
    const katakanaBasic = within(
      screen.getByRole("region", { name: "Basic characters" }),
    );
    const katakanaLongVowels = within(
      screen.getByRole("region", { name: "Long vowels" }),
    );
    expect(
      screen
        .getByRole("radio", { name: "Katakana" })
        .getAttribute("aria-checked"),
    ).toBe("true");
    expect(
      screen.getAllByRole("button", { name: /Play pronunciation for/ }),
    ).toHaveLength(113);
    expect(
      katakanaBasic.getByRole("button", {
        name: "Play pronunciation for ア, a",
      }),
    ).toBeTruthy();
    await user.click(
      katakanaBasic.getByRole("button", {
        name: "Play pronunciation for ア, a",
      }),
    );
    expect(audioElements).toHaveLength(6);
    expect(audioElements[4]?.pause).toHaveBeenCalledOnce();
    expect(audioElements[5]?.src).toContain(
      "kana.chart.hiragana.a.nemo-10000.opus",
    );
    expect(audioElements[5]?.play).toHaveBeenCalledOnce();
    expect(speech.speak).not.toHaveBeenCalled();

    await user.click(
      katakanaLongVowels.getByRole("button", {
        name: "Play pronunciation for アー, aa",
      }),
    );
    expect(audioElements).toHaveLength(7);
    expect(audioElements[5]?.pause).toHaveBeenCalledOnce();
    expect(audioElements[6]?.src).toContain(
      "kana.chart.hiragana.long-vowels.aa.nemo-10000.opus",
    );
    expect(audioElements[6]?.play).toHaveBeenCalledOnce();
    expect(speech.speak).not.toHaveBeenCalled();

    await user.click(screen.getByRole("link", { name: "Practice Kana" }));
    await screen.findByRole("heading", { name: "Practice", level: 1 });
    expect(router.state.location.search).toMatchObject({
      scripts: ["katakana"],
      categories: ["basic"],
    });
  });

  it("opens Practice and upcoming sections, with mobile menu dismissal", async () => {
    const user = userEvent.setup();
    await renderHome();

    const menuButton = screen.getByRole("button", { name: "Open menu" });
    await user.click(menuButton);
    expect(menuButton.getAttribute("aria-expanded")).toBe("true");

    const sidebar = document.getElementById("app-sidebar");
    expect(sidebar).not.toBeNull();
    fireEvent.keyDown(sidebar as HTMLElement, { key: "Escape" });
    expect(
      screen
        .getByRole("button", { name: "Open menu" })
        .getAttribute("aria-expanded"),
    ).toBe("false");
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "Open menu" }),
    );

    await user.click(screen.getByRole("button", { name: "Open menu" }));
    await user.click(screen.getByRole("link", { name: /Practice/ }));
    await screen.findByRole("heading", {
      name: "Practice",
      level: 1,
    });
    expect(document.title).toBe("Practice · OpenNihongo");
    expect(
      screen.queryByRole("navigation", { name: "Primary navigation" }),
    ).not.toBeNull();
    expect(
      screen
        .getByRole("button", { name: "Open menu" })
        .getAttribute("aria-expanded"),
    ).toBe("false");
    expect(document.activeElement).toBe(screen.getByRole("main"));

    await user.click(screen.getByRole("link", { name: "Home" }));
    await screen.findByRole("heading", {
      name: "Make steady progress, one step at a time.",
    });
    await user.click(screen.getByRole("link", { name: /Progress/ }));
    await screen.findByRole("heading", { name: "Progress" });
    await router.navigate({ to: "/quests" });
    await screen.findByRole("heading", { name: "Quests" });
    await router.navigate({ to: "/library" });
    await screen.findByRole("heading", { name: "Library" });
  });

  it("opens vocabulary from Practice", async () => {
    const user = userEvent.setup();
    await renderHome();

    await user.click(screen.getByRole("link", { name: "Start practicing" }));
    await screen.findByRole("heading", { name: "Practice", level: 1 });
    await user.click(screen.getByRole("link", { name: "View vocabulary" }));

    await screen.findByRole("heading", { name: "Vocabulary" });
    expect(document.title).toBe("Vocabulary · OpenNihongo");
    expect(screen.getByText("5 words")).toBeTruthy();
    expect(
      screen
        .getByRole("link", { name: "Start word practice" })
        .getAttribute("href"),
    ).toBe("/practice/words/matching");
  });

  it("renders the not-found route and sets its document title", async () => {
    await renderHome();

    await router.navigate({ to: "/not-a-route" as never });

    await screen.findByRole("heading", { name: "This page doesn't exist." });
    await waitFor(() => {
      expect(document.title).toBe("Page not found · OpenNihongo");
    });
    expect(
      screen.getByRole("link", { name: "Back to Home" }).getAttribute("href"),
    ).toBe("/");
  });

  it("shows pronunciation voice attribution and license links in the app", async () => {
    const user = userEvent.setup();
    await renderHome();

    await user.click(
      screen.getByRole("link", { name: "Acknowledgements & licenses" }),
    );

    await screen.findByRole("heading", { name: "Pronunciation audio" });
    screen.getByText(/VOICEVOX Nemo Engine using VOICEVOX Nemo/);
    screen.getByText(/男声2 \/ ノーマル \(style ID 10000\)/);
    screen.getByText("VOICEVOX Nemo", { selector: "strong" });
    screen.getByText(/女声1 \/ ノーマル \(style ID 10005\)/);
    expect(
      screen
        .getByRole("link", { name: "VOICEVOX Nemo terms" })
        .getAttribute("href"),
    ).toBe("https://voicevox.hiroshiba.jp/nemo/term/");
    expect(
      screen
        .getByRole("link", { name: "VOICEVOX software terms" })
        .getAttribute("href"),
    ).toBe("https://voicevox.hiroshiba.jp/term/");
    expect(
      screen
        .getByRole("link", { name: "VOICEVOX Nemo Engine license" })
        .getAttribute("href"),
    ).toBe(
      "https://github.com/VOICEVOX/voicevox_nemo_engine/blob/master/LICENSE",
    );
    screen.getByRole("link", { name: "LGPL v3 text" });
  });
});
