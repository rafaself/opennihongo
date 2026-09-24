import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Switch } from "./Switch";

describe("Switch", () => {
  it("exposes its labeled state and toggles with native Space and Enter keys", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();

    render(
      <label>
        Reduce motion
        <Switch defaultChecked={false} onCheckedChange={onCheckedChange} />
      </label>,
    );

    const control = screen.getByRole("switch", { name: "Reduce motion" });

    expect(control).toHaveAttribute("aria-checked", "false");
    await user.tab();
    expect(control).toHaveFocus();

    await user.keyboard(" ");
    expect(control).toHaveAttribute("aria-checked", "true");
    expect(onCheckedChange).toHaveBeenLastCalledWith(true);

    await user.keyboard("{Enter}");
    expect(control).toHaveAttribute("aria-checked", "false");
    expect(onCheckedChange).toHaveBeenLastCalledWith(false);
  });

  it("keeps controlled state in sync with its checked prop", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();

    render(
      <label>
        Sync now
        <Switch checked={false} onCheckedChange={onCheckedChange} />
      </label>,
    );

    const control = screen.getByRole("switch", { name: "Sync now" });

    await user.click(control);

    expect(control).toHaveAttribute("aria-checked", "false");
    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  it("does not toggle or receive focus when disabled", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();

    render(
      <label>
        Unavailable setting
        <Switch disabled onCheckedChange={onCheckedChange} />
      </label>,
    );

    const control = screen.getByRole("switch", {
      name: "Unavailable setting",
    });

    expect(control).toBeDisabled();
    expect(control).toHaveAttribute("aria-checked", "false");

    await user.click(control);
    await user.tab();

    expect(control).not.toHaveFocus();
    expect(control).toHaveAttribute("aria-checked", "false");
    expect(onCheckedChange).not.toHaveBeenCalled();
  });
});
