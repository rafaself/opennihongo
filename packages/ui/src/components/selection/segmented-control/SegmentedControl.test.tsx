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

function setOptionLayout(
  option: HTMLElement,
  {
    left,
    width,
    height = 32,
  }: { left: number; width: number; height?: number },
) {
  Object.defineProperties(option, {
    offsetHeight: { configurable: true, value: height },
    offsetLeft: { configurable: true, value: left },
    offsetTop: { configurable: true, value: 4 },
    offsetWidth: { configurable: true, value: width },
  });
}

function dispatchWindowResize() {
  window.dispatchEvent(new Event("resize"));
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
    const indicator = group.querySelector(".ns-segmented-control__indicator");

    expect(group).toHaveAttribute("data-orientation", "horizontal");
    expect(indicator).toHaveAttribute("aria-hidden", "true");
    expect(indicator).not.toHaveAttribute("data-ready", "true");
    expect(hiragana).toBeChecked();
    expect(katakana).not.toBeChecked();

    setOptionLayout(hiragana, { left: 8, width: 78 });
    setOptionLayout(katakana, { left: 92, width: 82 });
    dispatchWindowResize();
    await waitFor(() => {
      expect(indicator).toHaveAttribute("data-ready", "true");
      expect(
        group.style.getPropertyValue("--ns-segmented-control-indicator-x"),
      ).toBe("8px");
      expect(
        group.style.getPropertyValue("--ns-segmented-control-indicator-width"),
      ).toBe("78px");
    });

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
    await waitFor(() => {
      expect(
        group.style.getPropertyValue("--ns-segmented-control-indicator-x"),
      ).toBe("92px");
    });
  });

  it("moves focus and selection with horizontal arrow keys", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();

    render(<InteractiveControl onValueChange={onValueChange} />);

    const hiragana = screen.getByRole("radio", { name: "Hiragana" });
    const katakana = screen.getByRole("radio", { name: "Katakana" });
    const group = screen.getByRole("radiogroup", { name: "Kana scripts" });
    setOptionLayout(hiragana, { left: 8, width: 78 });
    setOptionLayout(katakana, { left: 92, width: 82 });
    dispatchWindowResize();

    await user.tab();
    expect(hiragana).toHaveFocus();

    await user.keyboard("{ArrowRight>}");
    await waitFor(() => expect(katakana).toBeChecked());
    await user.keyboard("{/ArrowRight}");
    expect(onValueChange).toHaveBeenCalledWith("katakana");
    expect(katakana).toHaveFocus();
    await waitFor(() => {
      expect(
        group.style.getPropertyValue("--ns-segmented-control-indicator-x"),
      ).toBe("92px");
    });
  });
});
