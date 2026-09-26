import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { RouterProvider } from "@tanstack/react-router";
import { router } from "./router";

async function renderHome() {
  render(<RouterProvider router={router} />);
  await router.navigate({ to: "/" });
  await screen.findByRole("heading", {
    name: "Make steady progress, one step at a time.",
  });
}

afterEach(() => {
  cleanup();
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
    ).toBe("/kana");

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
