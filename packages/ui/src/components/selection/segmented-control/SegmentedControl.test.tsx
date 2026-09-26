import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  SegmentedControl,
  type SegmentedControlProps,
} from "./SegmentedControl";

const options = [
  { value: "hiragana", label: "Hiragana" },
  { value: "katakana", label: "Katakana" },
] as const;

function renderControl(
  value: SegmentedControlProps<(typeof options)[number]["value"]>["value"],
  onValueChange: SegmentedControlProps<
    (typeof options)[number]["value"]
  >["onValueChange"],
) {
  return render(
    <SegmentedControl
      aria-label="Kana scripts"
      onValueChange={onValueChange}
      options={options}
      value={value}
    />,
  );
}

function InteractiveControl({
  onValueChange,
}: {
  onValueChange: (value: "hiragana" | "katakana") => void;
}) {
  const [value, setValue] =
    useState<(typeof options)[number]["value"]>("hiragana");

  return (
    <SegmentedControl
      aria-label="Kana scripts"
      onValueChange={(nextValue) => {
        onValueChange(nextValue);
        setValue(nextValue);
      }}
      options={options}
      value={value}
    />
  );
}

describe("SegmentedControl", () => {
  afterEach(cleanup);

  it("exposes a named radio group and reports controlled click changes", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { rerender } = renderControl("hiragana", onValueChange);

    const group = screen.getByRole("radiogroup", { name: "Kana scripts" });
    const hiragana = screen.getByRole("radio", { name: "Hiragana" });
    const katakana = screen.getByRole("radio", { name: "Katakana" });

    expect(group).toHaveAttribute("data-orientation", "horizontal");
    expect(hiragana).toBeChecked();
    expect(katakana).not.toBeChecked();

    await user.click(katakana);
    expect(onValueChange).toHaveBeenLastCalledWith("katakana");
    rerender(
      <SegmentedControl
        aria-label="Kana scripts"
        onValueChange={onValueChange}
        options={options}
        value="katakana"
      />,
    );
    expect(katakana).toBeChecked();
  });

  it("moves focus and selection with horizontal arrow keys", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();

    render(<InteractiveControl onValueChange={onValueChange} />);

    const hiragana = screen.getByRole("radio", { name: "Hiragana" });
    const katakana = screen.getByRole("radio", { name: "Katakana" });

    await user.tab();
    expect(hiragana).toHaveFocus();

    await user.keyboard("{ArrowRight>}");
    await waitFor(() => expect(katakana).toBeChecked());
    await user.keyboard("{/ArrowRight}");
    expect(onValueChange).toHaveBeenCalledWith("katakana");
    expect(katakana).toHaveFocus();
  });
});
