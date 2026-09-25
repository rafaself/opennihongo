import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Button } from "./Button";

describe("Button", () => {
  it("activates with Enter and Space from the keyboard", async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();

    render(<Button onClick={onClick}>Continue</Button>);

    const button = screen.getByRole("button", { name: "Continue" });
    expect(button).toBeEnabled();
    await user.tab();
    expect(button).toHaveFocus();

    await user.keyboard("{Enter}");
    await user.keyboard(" ");

    expect(onClick).toHaveBeenCalledTimes(2);
  });

  it("prevents activation while disabled or loading and announces loading", async () => {
    const onDisabledClick = vi.fn();
    const onLoadingClick = vi.fn();
    const user = userEvent.setup();

    render(
      <>
        <Button disabled onClick={onDisabledClick}>
          Delete
        </Button>
        <Button loading onClick={onLoadingClick}>
          Save changes
        </Button>
      </>,
    );

    const disabledButton = screen.getByRole("button", { name: "Delete" });
    const loadingButton = screen.getByRole("button", {
      name: "Save changes",
    });

    expect(disabledButton).toBeDisabled();
    expect(loadingButton).toBeDisabled();
    expect(loadingButton).toHaveAttribute("aria-busy", "true");
    expect(screen.getByRole("status")).toHaveTextContent("Loading");

    await user.click(disabledButton);
    await user.click(loadingButton);

    expect(onDisabledClick).not.toHaveBeenCalled();
    expect(onLoadingClick).not.toHaveBeenCalled();
  });
});
