import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { KanaItem, KanaProgress } from "@opennihongo/core";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { RouterProvider } from "@tanstack/react-router";
import { router } from "./router";

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
      screen.getByRole("link", { name: "Learn hiragana" }).getAttribute("href"),
    ).toBe("/kana/lesson");

    await user.click(screen.getByRole("link", { name: "Learn hiragana" }));

    await screen.findByRole("heading", { name: "Learn the five vowels" });
    expect(document.title).toBe("Kana · OpenNihongo");
    expect(
      screen.queryByRole("navigation", { name: "Primary navigation" }),
    ).toBeNull();
    expect(screen.queryByRole("button", { name: "Open menu" })).toBeNull();
    await user.click(screen.getByRole("link", { name: "Leave lesson" }));
    await screen.findByRole("heading", {
      name: "Make steady progress, one step at a time.",
    });
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
      screen.getByRole("button", { name: "Play pronunciation for きゃ, kya" }),
    ).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "Play pronunciation for ああ, aa" }),
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
      screen.getByRole("button", { name: "Play pronunciation for あ, a" }),
    );
    expect(speech.cancel).toHaveBeenCalledOnce();
    expect(speech.speak).not.toHaveBeenCalled();
    expect(audioElements).toHaveLength(1);
    expect(audioElements[0]?.src).toContain(
      "kana.chart.hiragana.a.nemo-10000.opus",
    );
    expect(audioElements[0]?.play).toHaveBeenCalledOnce();

    await user.click(
      screen.getByRole("button", { name: "Play pronunciation for た, ta" }),
    );
    expect(audioElements[0]?.pause).toHaveBeenCalledOnce();
    expect(speech.speak).toHaveBeenCalledOnce();
    expect(speech.speak.mock.calls[0]?.[0]).toMatchObject({
      text: "た",
      lang: "ja-JP",
    });
    expect(storage.saveKanaAnswer).not.toHaveBeenCalled();

    await user.click(screen.getByRole("radio", { name: "Hiragana" }));
    await user.keyboard("{ArrowRight>}");
    await screen.findByRole("heading", { name: "Let's learn Katakana!" });
    await user.keyboard("{/ArrowRight}");
    expect(
      screen
        .getByRole("radio", { name: "Katakana" })
        .getAttribute("aria-checked"),
    ).toBe("true");
    expect(
      screen.getAllByRole("button", { name: /Play pronunciation for/ }),
    ).toHaveLength(113);
    expect(
      screen.getByRole("button", { name: "Play pronunciation for ア, a" }),
    ).toBeTruthy();
    await user.click(
      screen.getByRole("button", { name: "Play pronunciation for ア, a" }),
    );
    expect(audioElements).toHaveLength(1);
    expect(speech.speak).toHaveBeenCalledTimes(2);
    expect(speech.speak.mock.calls[1]?.[0]).toMatchObject({
      text: "ア",
      lang: "ja-JP",
    });

    await user.click(screen.getByRole("link", { name: "Learn characters" }));
    await screen.findByRole("heading", { name: "Learn the five vowels" });
    expect(document.title).toBe("Kana · OpenNihongo");
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
      name: "Which reading matches this word?",
    });
    expect(document.title).toBe("Practice · OpenNihongo");
    expect(
      screen.queryByRole("navigation", { name: "Primary navigation" }),
    ).toBeNull();
    expect(screen.queryByRole("button", { name: "Open menu" })).toBeNull();
    expect(document.activeElement).toBe(screen.getByRole("main"));

    await user.click(screen.getByRole("link", { name: "Leave practice" }));
    await screen.findByRole("heading", {
      name: "Make steady progress, one step at a time.",
    });
    await user.click(screen.getByRole("link", { name: /Progress/ }));
    await screen.findByRole("heading", { name: "Progress" });
    await user.click(screen.getByRole("link", { name: /Quests/ }));
    await screen.findByRole("heading", { name: "Quests" });
    await user.click(screen.getByRole("link", { name: /Library/ }));
    await screen.findByRole("heading", { name: "Library" });
  });

  it("renders the not-found route and sets its document title", async () => {
    await renderHome();

    await router.navigate({ to: "/not-a-route" as never });

    await screen.findByRole("heading", { name: "This page doesn't exist." });
    await waitFor(() => {
      expect(document.title).toBe("Page not found · OpenNihongo");
    });
    expect(
      screen.getByRole("link", { name: "Back to Learn" }).getAttribute("href"),
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
