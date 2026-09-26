import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RouterProvider } from "@tanstack/react-router";
import { afterEach, describe, expect, it, vi } from "vitest";
import { router } from "../../app/router";

async function renderPractice() {
  render(<RouterProvider router={router} />);
  await router.navigate({ to: "/practice" });
  await screen.findByRole("heading", {
    name: "Which reading matches this word?",
  });
}

afterEach(() => {
  cleanup();
  Reflect.deleteProperty(window, "speechSynthesis");
  vi.unstubAllGlobals();
});

describe("PracticeView", () => {
  it("runs reading, kana choice, typed reading, and matching exercises", async () => {
    const user = userEvent.setup();
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

    await renderPractice();
    await user.click(
      screen.getByRole("button", { name: "Play pronunciation for そと" }),
    );
    expect(cancel).toHaveBeenCalledOnce();
    expect(speak).toHaveBeenCalledOnce();
    expect(speak.mock.calls[0]?.[0]).toMatchObject({
      text: "そと",
      lang: "ja-JP",
    });

    await user.click(screen.getByRole("button", { name: "soto" }));
    await user.click(screen.getByRole("button", { name: "Check answer" }));
    expect(screen.getByRole("status").textContent).toContain("That’s right!");
    expect(document.activeElement?.textContent).toBe("That’s right!");
    await user.click(screen.getByRole("button", { name: "Continue" }));

    await screen.findByRole("heading", {
      name: "Choose the characters for “soto”:",
    });
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
  });

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
});
