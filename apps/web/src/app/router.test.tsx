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
  });

  it("renders upcoming sections and supports mobile menu dismissal", async () => {
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
    await screen.findByRole("heading", { name: "Practice" });
    expect(document.title).toBe("Practice · OpenNihongo");
    expect(
      screen
        .getByRole("button", { name: "Open menu" })
        .getAttribute("aria-expanded"),
    ).toBe("false");
    expect(document.activeElement).toBe(screen.getByRole("main"));

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
});
