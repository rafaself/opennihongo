import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "./Dialog";

describe("Dialog", () => {
  afterEach(cleanup);

  it("opens by keyboard, traps focus, dismisses with Escape, and restores focus", async () => {
    const user = userEvent.setup();

    render(
      <Dialog>
        <DialogTrigger>Open lesson settings</DialogTrigger>
        <DialogContent>
          <DialogTitle>Lesson settings</DialogTitle>
          <DialogDescription>Change your study preferences.</DialogDescription>
          <button type="button">First action</button>
          <DialogClose asChild>
            <button type="button">Close settings</button>
          </DialogClose>
        </DialogContent>
      </Dialog>,
    );

    const trigger = screen.getByRole("button", {
      name: "Open lesson settings",
    });
    await user.tab();
    expect(trigger).toHaveFocus();
    await user.keyboard("{Enter}");

    const dialog = await screen.findByRole("dialog", {
      name: "Lesson settings",
      description: "Change your study preferences.",
    });
    const firstAction = screen.getByRole("button", { name: "First action" });
    const close = screen.getByRole("button", { name: "Close settings" });

    expect(dialog).toBeInTheDocument();
    expect(firstAction).toHaveFocus();
    await user.tab();
    expect(close).toHaveFocus();
    await user.tab();
    expect(firstAction).toHaveFocus();

    await user.keyboard("{Escape}");

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it("mounts modal content into the host-selected portal container", async () => {
    const user = userEvent.setup();
    const portalContainer = document.createElement("div");
    document.body.append(portalContainer);
    const { container } = render(
      <Dialog>
        <DialogTrigger>Open confirmation</DialogTrigger>
        <DialogContent portalContainer={portalContainer}>
          <DialogTitle>Confirm changes</DialogTitle>
          <DialogClose>Close confirmation</DialogClose>
        </DialogContent>
      </Dialog>,
    );

    try {
      await user.click(
        screen.getByRole("button", { name: "Open confirmation" }),
      );
      const dialog = await screen.findByRole("dialog", {
        name: "Confirm changes",
      });

      expect(portalContainer).toContainElement(dialog);
      expect(container).not.toContainElement(dialog);
    } finally {
      cleanup();
      portalContainer.remove();
    }
  });
});
