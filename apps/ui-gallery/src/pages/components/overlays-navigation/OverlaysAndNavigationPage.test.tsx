// @vitest-environment jsdom
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { OverlaysAndNavigationPage } from "./OverlaysAndNavigationPage";

let originalMotionMode: string | null = null;

beforeAll(() => {
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
});

beforeEach(() => {
  originalMotionMode = document.documentElement.getAttribute("data-motion");
});

afterEach(() => {
  cleanup();
  if (originalMotionMode === null) {
    document.documentElement.removeAttribute("data-motion");
  } else {
    document.documentElement.setAttribute("data-motion", originalMotionMode);
  }
});

describe("OverlaysAndNavigationPage", () => {
  it("shows all five public component examples and shared presentation controls", () => {
    render(<OverlaysAndNavigationPage />);

    expect(
      screen.getByRole("heading", { name: "Overlays & Navigation" }),
    ).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Tooltip" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Popover" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Dialog" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Tabs" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Toast" })).toBeTruthy();
    expect(screen.getByRole("radio", { name: "Dark theme" })).toBeTruthy();
    expect(screen.getByRole("radio", { name: "Reduced motion" })).toBeTruthy();
  });

  it("applies the shared theme to portaled content and restores motion settings", async () => {
    const { container } = render(<OverlaysAndNavigationPage />);
    const preview = container.querySelector(".gallery-doc-example-grid");
    const portalHost = container.querySelector(".gallery-overlay-portal-host");

    fireEvent.click(screen.getByRole("radio", { name: "Dark theme" }));
    expect(preview?.getAttribute("data-theme")).toBe("dark");
    expect(portalHost?.getAttribute("data-theme")).toBe("dark");

    fireEvent.click(screen.getByRole("radio", { name: "Reduced motion" }));
    expect(document.documentElement.getAttribute("data-motion")).toBe(
      "reduced",
    );

    fireEvent.focus(screen.getByRole("button", { name: "Save lesson" }));
    const tooltip = await screen.findByRole("tooltip");
    expect(portalHost?.contains(tooltip)).toBe(true);

    cleanup();
    expect(document.documentElement.getAttribute("data-motion")).toBe(
      originalMotionMode,
    );
  });

  it("opens tooltips on keyboard focus and dismisses them with Escape", async () => {
    render(<OverlaysAndNavigationPage />);

    fireEvent.focus(screen.getByRole("button", { name: "Save lesson" }));
    expect(await screen.findByRole("tooltip")).toBeTruthy();

    fireEvent.keyDown(document, { key: "Escape" });
    await waitFor(() => {
      expect(screen.queryByRole("tooltip")).toBeNull();
    });
  });

  it("opens and dismisses popovers with focus returned to the trigger", async () => {
    render(<OverlaysAndNavigationPage />);

    const trigger = screen.getByRole("button", { name: "Kana reference" });
    fireEvent.click(trigger);

    const popover = await screen.findByRole("dialog", {
      name: "Kana reference",
    });
    expect(popover).toBeTruthy();
    expect(document.activeElement).toBe(
      screen.getByRole("textbox", { name: "Reference search" }),
    );

    fireEvent.keyDown(document, { key: "Escape" });
    await waitFor(() => {
      expect(
        screen.queryByRole("dialog", { name: "Kana reference" }),
      ).toBeNull();
    });
    expect(document.activeElement).toBe(trigger);
  });

  it("contains dialog focus, dismisses with Escape, and restores trigger focus", async () => {
    render(<OverlaysAndNavigationPage />);

    const trigger = screen.getByRole("button", { name: "Study settings" });
    fireEvent.click(trigger);

    const dialog = await screen.findByRole("dialog", {
      name: "Study settings",
    });
    const saveButton = screen.getByRole("button", { name: "Save preferences" });
    expect(dialog).toBeTruthy();
    expect(document.activeElement).toBe(saveButton);

    fireEvent.keyDown(document, { key: "Escape" });
    await waitFor(() => {
      expect(
        screen.queryByRole("dialog", { name: "Study settings" }),
      ).toBeNull();
    });
    expect(document.activeElement).toBe(trigger);
  });

  it("switches related tab panels with arrow-key navigation", async () => {
    render(<OverlaysAndNavigationPage />);

    const hiragana = screen.getByRole("tab", { name: "Hiragana" });
    const katakana = screen.getByRole("tab", { name: "Katakana" });
    expect(hiragana.getAttribute("aria-selected")).toBe("true");

    fireEvent.keyDown(hiragana, { key: "ArrowRight" });
    await waitFor(() => {
      expect(katakana.getAttribute("aria-selected")).toBe("true");
    });
    expect(
      screen.getByText("Review the basic katakana syllabary."),
    ).toBeTruthy();
  });

  it("shows a toast and lets the reader dismiss it", async () => {
    render(<OverlaysAndNavigationPage />);

    fireEvent.click(
      screen.getByRole("button", { name: "Show preview notification" }),
    );
    expect(await screen.findByText("Preview saved")).toBeTruthy();

    fireEvent.click(
      screen.getByRole("button", { name: "Dismiss preview notification" }),
    );
    await waitFor(() => {
      expect(screen.queryByText("Preview saved")).toBeNull();
    });
  });
});
