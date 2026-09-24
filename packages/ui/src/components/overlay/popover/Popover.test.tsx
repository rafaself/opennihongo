import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { Popover, PopoverContent, PopoverTrigger } from "./Popover";

describe("Popover", () => {
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

  afterEach(cleanup);

  it("opens from the keyboard and dismisses with Escape while returning focus", async () => {
    const user = userEvent.setup();

    render(
      <Popover>
        <PopoverTrigger>Open reference</PopoverTrigger>
        <PopoverContent aria-label="Reference details">
          <button type="button">Follow reference</button>
        </PopoverContent>
      </Popover>,
    );

    const trigger = screen.getByRole("button", { name: "Open reference" });

    await user.tab();
    expect(trigger).toHaveFocus();
    await user.keyboard("{Enter}");

    expect(
      await screen.findByRole("dialog", { name: "Reference details" }),
    ).toBeInTheDocument();
    await user.keyboard("{Escape}");

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it("dismisses after an outside interaction", async () => {
    const user = userEvent.setup();

    render(
      <>
        <button type="button">Outside action</button>
        <Popover>
          <PopoverTrigger>Open reference</PopoverTrigger>
          <PopoverContent aria-label="Reference details">
            Reference content
          </PopoverContent>
        </Popover>
      </>,
    );

    await user.click(screen.getByRole("button", { name: "Open reference" }));
    expect(
      await screen.findByRole("dialog", { name: "Reference details" }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Outside action" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("mounts content in a host-selected portal container", async () => {
    const user = userEvent.setup();
    const portalContainer = document.createElement("div");
    document.body.append(portalContainer);
    const { container } = render(
      <Popover>
        <PopoverTrigger>Open reference</PopoverTrigger>
        <PopoverContent
          aria-label="Reference details"
          portalContainer={portalContainer}
        >
          Reference content
        </PopoverContent>
      </Popover>,
    );

    try {
      await user.click(screen.getByRole("button", { name: "Open reference" }));
      const content = await screen.findByRole("dialog", {
        name: "Reference details",
      });

      expect(portalContainer).toContainElement(content);
      expect(container).not.toContainElement(content);
    } finally {
      cleanup();
      portalContainer.remove();
    }
  });
});
