// @vitest-environment jsdom
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { ActionsAndFormsPage } from "./ActionsAndFormsPage";

describe("ActionsAndFormsPage", () => {
  beforeAll(() => {
    Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
      configurable: true,
      value: vi.fn(),
    });
  });

  afterEach(cleanup);

  it("documents accessible controls and caller-owned action behavior", () => {
    render(<ActionsAndFormsPage />);

    expect(
      screen.getByRole("heading", { name: "Actions & Forms" }),
    ).toBeTruthy();
    expect(
      screen
        .getByRole("button", { name: "Bookmark lesson" })
        .getAttribute("aria-label"),
    ).toBe("Bookmark lesson");
    expect(
      screen.getByLabelText(/Email address/).getAttribute("aria-describedby"),
    ).toBe("email-address-description");
    const weeklySummary = screen.getByLabelText("Weekly progress summary");
    expect(weeklySummary).toBeInstanceOf(HTMLInputElement);
    expect(
      weeklySummary instanceof HTMLInputElement && weeklySummary.checked,
    ).toBe(true);
    expect(
      within(screen.getByRole("radiogroup", { name: "RadioGroup selection" }))
        .getByRole("radio", { name: "Hiragana" })
        .getAttribute("aria-checked"),
    ).toBe("true");
    const segmentedControl = screen.getByRole("radiogroup", {
      name: "Kana scripts",
    });
    expect(
      within(segmentedControl)
        .getByRole("radio", { name: "Hiragana" })
        .getAttribute("aria-checked"),
    ).toBe("true");
    expect(screen.queryByRole("radio", { name: "Dark theme" })).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Continue lesson" }));
    expect(
      screen.getByRole("status", { name: "Action feedback" }).textContent,
    ).toContain("Continue lesson selected.");

    const reminders = screen.getByRole("switch", { name: "Daily reminders" });
    expect(reminders.getAttribute("aria-checked")).toBe("true");
    fireEvent.click(reminders);
    expect(reminders.getAttribute("aria-checked")).toBe("false");
    expect(
      screen.getByRole("status", { name: "Reminder setting" }).textContent,
    ).toContain("Daily reminders are off.");
  });

  it("opens the writing-system Select with the keyboard", () => {
    render(<ActionsAndFormsPage />);

    const select = screen.getByRole("combobox", { name: "Writing system" });
    expect(select.textContent).toContain("Hiragana");

    fireEvent.keyDown(select, { key: "ArrowDown" });
    expect(screen.getByRole("listbox")).toBeTruthy();
    expect(screen.getByRole("option", { name: "Katakana" })).toBeTruthy();
  });
});
