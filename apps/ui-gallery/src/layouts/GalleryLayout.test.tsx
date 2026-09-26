// @vitest-environment jsdom
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import {
  createMemoryHistory,
  createRouter,
  RouterProvider,
} from "@tanstack/react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { router } from "../app/router";

let viewportListener: ((event: MediaQueryListEvent) => void) | undefined;
let mobile = true;

function setMobileViewport(value: boolean) {
  mobile = value;
  act(() => {
    viewportListener?.({ matches: value } as MediaQueryListEvent);
  });
}

async function renderGallery() {
  const testRouter = createRouter({
    routeTree: router.routeTree,
    history: createMemoryHistory({ initialEntries: ["/"] }),
  });
  render(<RouterProvider router={testRouter} />);
  await screen.findByRole("heading", {
    level: 1,
    name: "A considered foundation for learning.",
  });
  return testRouter;
}

describe("Gallery mobile navigation", () => {
  beforeEach(() => {
    mobile = true;
    viewportListener = undefined;
    vi.stubGlobal("scrollTo", vi.fn());
    vi.stubGlobal("matchMedia", (query: string) => ({
      get matches() {
        return mobile;
      },
      media: query,
      addEventListener: (_type: string, listener: typeof viewportListener) => {
        viewportListener = listener;
      },
      removeEventListener: () => {
        viewportListener = undefined;
      },
    }));
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("exposes a keyboard skip link that focuses the main landmark", async () => {
    await renderGallery();

    const skipLink = screen.getByRole("link", { name: "Skip to content" });
    const main = screen.getByRole("main");
    expect(skipLink.getAttribute("href")).toBe("#gallery-main");
    expect(main.getAttribute("id")).toBe("gallery-main");

    fireEvent.click(skipLink);
    expect(document.activeElement).toBe(main);
  });

  it("keeps the theme toggle in the header and preserves it across routes", async () => {
    const testRouter = await renderGallery();
    const shell = document.querySelector(".gallery-shell");

    expect(shell?.getAttribute("data-theme")).toBe("light");
    expect(
      screen.getAllByRole("button", { name: /Switch to .* theme/ }),
    ).toHaveLength(1);
    expect(
      screen
        .getByRole("button", { name: "Switch to dark theme" })
        .closest("header"),
    ).not.toBeNull();

    fireEvent.click(
      screen.getByRole("button", { name: "Switch to dark theme" }),
    );
    expect(shell?.getAttribute("data-theme")).toBe("dark");

    await act(async () => {
      await testRouter.navigate({ to: "/components/actions-and-forms" });
    });
    await screen.findByRole("heading", { name: "Actions & Forms" });

    expect(shell?.getAttribute("data-theme")).toBe("dark");
    expect(
      screen.getByRole("button", { name: "Switch to light theme" }),
    ).toBeTruthy();
    expect(screen.queryByRole("radio", { name: "Dark theme" })).toBeNull();
  });

  it("keeps focus in the drawer and makes background content inert", async () => {
    await renderGallery();

    fireEvent.click(screen.getByRole("button", { name: "Open navigation" }));

    const navigation = screen.getByRole("navigation", {
      name: "Design system navigation",
    });
    const menu = screen.getByRole("button", { name: "Close navigation" });
    const links = Array.from(navigation.querySelectorAll("a"));
    expect(document.activeElement).toBe(links[0]);
    expect(
      screen.getByRole("main", { hidden: true }).closest("[inert]"),
    ).not.toBeNull();
    expect(
      screen.getByRole("contentinfo", { hidden: true }).hasAttribute("inert"),
    ).toBe(true);
    expect(document.body.style.overflow).toBe("hidden");

    links.at(-1)?.focus();
    fireEvent.keyDown(document, { key: "Tab" });
    expect(document.activeElement).toBe(menu);
    fireEvent.keyDown(document, { key: "Tab", shiftKey: true });
    expect(document.activeElement).toBe(links.at(-1));

    fireEvent.keyDown(document, { key: "Escape" });
    await waitFor(() => {
      expect(document.activeElement).toBe(menu);
    });
    expect(screen.getByRole("main").closest("[inert]")).toBeNull();
    expect(document.body.style.overflow).toBe("");
  });

  it("focuses main content after selecting a route", async () => {
    const testRouter = await renderGallery();
    fireEvent.click(screen.getByRole("button", { name: "Open navigation" }));
    fireEvent.click(screen.getByRole("link", { name: "Spacing" }));

    await screen.findByRole("heading", { level: 1, name: "Spacing" });
    await waitFor(() => {
      expect(document.activeElement).toBe(screen.getByRole("main"));
    });
    expect(testRouter.state.location.pathname).toBe("/foundations/spacing");
  });

  it("closes an open drawer when the viewport grows to desktop", async () => {
    await renderGallery();
    fireEvent.click(screen.getByRole("button", { name: "Open navigation" }));
    setMobileViewport(false);

    await waitFor(() => {
      expect(
        screen
          .getByRole("button", { name: "Open navigation", hidden: true })
          .getAttribute("aria-expanded"),
      ).toBe("false");
    });
    expect(screen.getByRole("main").closest("[inert]")).toBeNull();
    expect(document.body.style.overflow).toBe("");
  });

  it("restores focus when the backdrop dismisses the drawer", async () => {
    await renderGallery();
    fireEvent.click(screen.getByRole("button", { name: "Open navigation" }));
    const backdrop = document.querySelector(".gallery-sidebar-backdrop");
    expect(backdrop).not.toBeNull();

    fireEvent.click(backdrop as Element);

    const menu = screen.getByRole("button", { name: "Open navigation" });
    expect(document.activeElement).toBe(menu);
    expect(document.body.style.overflow).toBe("");
  });
});
