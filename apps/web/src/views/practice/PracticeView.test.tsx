import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RouterProvider } from "@tanstack/react-router";
import { afterEach, describe, expect, it, vi } from "vitest";
import { router } from "../../app/router";

const audioCacheMock = vi.hoisted(() => ({
  preload: vi.fn((audioIds: readonly string[]) =>
    Promise.resolve(new Set(audioIds)),
  ),
  play: vi.fn(),
  dispose: vi.fn(),
}));

vi.mock("./audio/audioCache", () => ({
  createExerciseAudioCache: vi.fn(() => audioCacheMock),
}));

async function openPractice() {
  render(<RouterProvider router={router} />);
  await router.navigate({ to: "/practice" });
}

async function renderPractice() {
  await openPractice();
  await screen.findByRole("heading", {
    name: "Which reading matches this word?",
  });
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  vi.unstubAllGlobals();
});

describe("PracticeView", () => {
  it("runs reading, kana choice, typed reading, and matching exercises", async () => {
    const user = userEvent.setup();

    await renderPractice();
    await user.click(
      screen.getByRole("button", { name: "Play pronunciation for そと" }),
    );
    expect(audioCacheMock.play).toHaveBeenCalledWith("kana.word.soto");

    await user.click(screen.getByRole("button", { name: "soto" }));
    await user.click(screen.getByRole("button", { name: "Check answer" }));
    expect(screen.getByRole("status").textContent).toContain("That’s right!");
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "Continue" }),
    );
    await user.click(screen.getByRole("button", { name: "Continue" }));

    await screen.findByRole("heading", {
      name: "Choose the characters for “soto”:",
    });
    expect(audioCacheMock.dispose).toHaveBeenCalledOnce();
    await user.click(screen.getByRole("button", { name: "はと" }));
    await user.click(screen.getByRole("button", { name: "Check answer" }));
    expect(screen.getByRole("status").textContent).toContain(
      "The correct answer is そと.",
    );
    await user.click(screen.getByRole("button", { name: "Continue" }));

    await screen.findByRole("heading", {
      name: "What is the corresponding sound?",
    });
    await user.type(
      screen.getByRole("textbox", {
        name: "Type the romaji reading for しびゅら",
      }),
      "SHIBYURA",
    );
    await user.click(screen.getByRole("button", { name: "Check answer" }));
    expect(screen.getByRole("status").textContent).toContain("That’s right!");
    await user.click(screen.getByRole("button", { name: "Continue" }));

    await screen.findByRole("heading", {
      name: "Match the pairs:",
    });
    await user.click(screen.getByRole("button", { name: "soto" }));
    await user.click(screen.getByRole("button", { name: "はと" }));

    await user.click(screen.getByRole("button", { name: "そと" }));
    await user.click(screen.getByRole("button", { name: "soto" }));
    await user.click(screen.getByRole("button", { name: "hato" }));
    await user.click(screen.getByRole("button", { name: "はと" }));
    await user.click(screen.getByRole("button", { name: "sato" }));
    await user.click(screen.getByRole("button", { name: "さと" }));
    await user.click(screen.getByRole("button", { name: "mimi" }));
    await user.click(screen.getByRole("button", { name: "みみ" }));
    await user.click(screen.getByRole("button", { name: "neko" }));
    await user.click(screen.getByRole("button", { name: "ねこ" }));
    await user.click(screen.getByRole("button", { name: "Check answer" }));
    expect(screen.getByRole("status").textContent).toContain("That’s right!");
    await user.click(screen.getByRole("button", { name: "See results" }));

    const resultsHeading = await screen.findByRole("heading", {
      name: "Practice complete!",
    });
    expect(document.activeElement).toBe(resultsHeading);
    expect(screen.getByText("7 / 8")).toBeTruthy();
    expect(screen.getByText("88%")).toBeTruthy();

    await user.click(screen.getByRole("button", { name: "Practice again" }));
    await screen.findByRole("heading", {
      name: "Which reading matches this word?",
    });
    expect(screen.getByRole("progressbar").getAttribute("aria-valuenow")).toBe(
      "0",
    );
  }, 10_000);

  it("lets the learner skip an exercise", async () => {
    const user = userEvent.setup();
    await renderPractice();
    await user.click(
      screen.getByRole("button", { name: "Play pronunciation for そと" }),
    );

    await user.click(screen.getByRole("button", { name: "Skip" }));
    await screen.findByRole("heading", {
      name: "Choose the characters for “soto”:",
    });
    await user.click(screen.getByRole("button", { name: "Skip" }));
    await screen.findByRole("heading", {
      name: "What is the corresponding sound?",
    });
    await user.click(screen.getByRole("button", { name: "Skip" }));
    await screen.findByRole("heading", {
      name: "Match the pairs:",
    });
    await user.click(screen.getByRole("button", { name: "Skip" }));
    await screen.findByRole("heading", { name: "Practice complete!" });
    expect(screen.getByText("0 / 8")).toBeTruthy();
    expect(screen.getByText("0%")).toBeTruthy();
  });

  it("celebrates a perfect session with complete stats", async () => {
    const user = userEvent.setup();
    await renderPractice();
    await user.click(screen.getByRole("button", { name: "soto" }));
    await user.click(screen.getByRole("button", { name: "Check answer" }));
    await user.click(screen.getByRole("button", { name: "Continue" }));
    await user.click(screen.getByRole("button", { name: "そと" }));
    await user.click(screen.getByRole("button", { name: "Check answer" }));
    await user.click(screen.getByRole("button", { name: "Continue" }));
    await user.type(
      screen.getByRole("textbox", {
        name: "Type the romaji reading for しびゅら",
      }),
      "shibyura",
    );
    await user.click(screen.getByRole("button", { name: "Check answer" }));
    await user.click(screen.getByRole("button", { name: "Continue" }));
    for (const [romaji, hiragana] of [
      ["soto", "そと"],
      ["hato", "はと"],
      ["sato", "さと"],
      ["mimi", "みみ"],
      ["neko", "ねこ"],
    ] as const) {
      await user.click(screen.getByRole("button", { name: romaji }));
      await user.click(screen.getByRole("button", { name: hiragana }));
    }
    await user.click(screen.getByRole("button", { name: "Check answer" }));
    await user.click(screen.getByRole("button", { name: "See results" }));

    await screen.findByRole("heading", { name: "Perfect practice!" });
    expect(screen.getByText("8 / 8")).toBeTruthy();
    expect(screen.getByText("100%")).toBeTruthy();
  });

  it("waits for active exercise audio before exposing the exercise", async () => {
    const user = userEvent.setup();
    let finishPreload: (audioIds: ReadonlySet<string>) => void = () => {};
    audioCacheMock.preload.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          finishPreload = (audioIds) => {
            resolve(new Set(audioIds));
          };
        }),
    );

    await openPractice();
    expect(screen.getByRole("status").textContent).toContain(
      "Preparing pronunciation audio…",
    );
    expect(audioCacheMock.preload).toHaveBeenCalledWith(["kana.word.soto"]);
    expect(
      screen.queryByRole("button", { name: "Play pronunciation for そと" }),
    ).toBeNull();

    finishPreload(new Set(["kana.word.soto"]));
    await user.click(
      await screen.findByRole("button", {
        name: "Play pronunciation for そと",
      }),
    );
    expect(audioCacheMock.play).toHaveBeenCalledWith("kana.word.soto");
  });

  it("hides pronunciation controls when exercise audio is unavailable", async () => {
    audioCacheMock.preload.mockResolvedValueOnce(new Set());

    await renderPractice();

    expect(
      screen.queryByRole("button", { name: "Play pronunciation for そと" }),
    ).toBeNull();
  });
});
