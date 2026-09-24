import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { IconButton, type IconButtonProps } from "./IconButton";

type AssertTrue<T extends true> = T;
type HasRequiredAccessibleName = IconButtonProps extends {
  "aria-label": string;
}
  ? true
  : false;

export type IconButtonRequiresAccessibleName =
  AssertTrue<HasRequiredAccessibleName>;

afterEach(cleanup);

describe("IconButton", () => {
  it("exposes its accessible name on the button and hides the icon", () => {
    render(<IconButton aria-label="Close dialog" icon="close" />);

    const button = screen.getByRole("button", { name: "Close dialog" });
    expect(button).toHaveAttribute("aria-label", "Close dialog");
    expect(button.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  });

  it("rejects an empty accessible name", () => {
    expect(() => render(<IconButton aria-label="  " icon="close" />)).toThrow(
      "IconButton requires a non-empty aria-label.",
    );
  });

  it("uses the canonical icon size associated with its Button size", () => {
    render(
      <>
        <IconButton aria-label="Remove compact" icon="close" size="compact" />
        <IconButton aria-label="Remove standard" icon="close" />
        <IconButton
          aria-label="Remove comfortable"
          icon="close"
          size="comfortable"
        />
      </>,
    );

    expect(
      screen
        .getByRole("button", { name: "Remove compact" })
        .querySelector("svg"),
    ).toHaveStyle({ width: "var(--ns-size-icon-box-small, 16px)" });
    expect(
      screen
        .getByRole("button", { name: "Remove standard" })
        .querySelector("svg"),
    ).toHaveStyle({ width: "var(--ns-size-icon-box-medium, 20px)" });
    expect(
      screen
        .getByRole("button", { name: "Remove comfortable" })
        .querySelector("svg"),
    ).toHaveStyle({ width: "var(--ns-size-icon-box-large, 24px)" });
  });

  it("does not activate when disabled", async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();

    render(
      <IconButton
        aria-label="Close dialog"
        disabled
        icon="close"
        onClick={onClick}
      />,
    );

    const button = screen.getByRole("button", { name: "Close dialog" });
    expect(button).toBeDisabled();

    await user.click(button);

    expect(onClick).not.toHaveBeenCalled();
  });

  it("preserves its accessible name and announces loading", () => {
    render(<IconButton aria-label="Close dialog" icon="close" loading />);

    const button = screen.getByRole("button", { name: "Close dialog" });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
    expect(button.querySelector("svg")).not.toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Loading");
  });
});
