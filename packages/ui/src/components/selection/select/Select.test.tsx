import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { FormField } from "../../form-field/FormField";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./Select";

describe("Select", () => {
  beforeAll(() => {
    Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
      configurable: true,
      value: vi.fn(),
    });
  });

  afterEach(cleanup);

  it("supports accessible naming, keyboard selection, Escape, and focus return", async () => {
    const user = userEvent.setup();

    render(
      <Select defaultValue="hiragana">
        <FormField id="script" label="Writing system">
          <SelectTrigger>
            <SelectValue placeholder="Choose a writing system" />
          </SelectTrigger>
        </FormField>
        <SelectContent>
          <SelectItem value="hiragana">Hiragana</SelectItem>
          <SelectItem value="katakana">Katakana</SelectItem>
          <SelectItem value="kanji">Kanji</SelectItem>
        </SelectContent>
      </Select>,
    );

    const trigger = screen.getByRole("combobox", { name: "Writing system" });

    expect(trigger).toHaveTextContent("Hiragana");

    await user.tab();
    expect(trigger).toHaveFocus();
    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    await user.keyboard("{ArrowDown}{Enter}");

    expect(trigger).toHaveTextContent("Katakana");
    expect(trigger).toHaveFocus();

    await user.keyboard("{ArrowDown}");
    await user.keyboard("{Escape}");

    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it("composes invalid state and error description with FormField", () => {
    render(
      <Select>
        <FormField
          error="Choose a writing system."
          id="invalid-script"
          label="Writing system"
        >
          <SelectTrigger>
            <SelectValue placeholder="Choose a writing system" />
          </SelectTrigger>
        </FormField>
        <SelectContent>
          <SelectItem value="hiragana">Hiragana</SelectItem>
        </SelectContent>
      </Select>,
    );

    const trigger = screen.getByRole("combobox", { name: "Writing system" });

    expect(trigger).toHaveAttribute("aria-invalid", "true");
    expect(trigger).toHaveAttribute("aria-describedby", "invalid-script-error");
    expect(screen.getByText("Choose a writing system.")).toBeInTheDocument();
  });

  it("does not open when the root is disabled", () => {
    render(
      <Select disabled>
        <FormField id="disabled-script" label="Writing system">
          <SelectTrigger>
            <SelectValue placeholder="Choose a writing system" />
          </SelectTrigger>
        </FormField>
        <SelectContent>
          <SelectItem value="hiragana">Hiragana</SelectItem>
        </SelectContent>
      </Select>,
    );

    const trigger = screen.getByRole("combobox", { name: "Writing system" });

    expect(trigger).toBeDisabled();
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });
});
