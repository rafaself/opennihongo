import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { Button } from "../../button/Button";
import { Tooltip, TooltipProvider } from "./Tooltip";

describe("Tooltip", () => {
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

  it("opens on keyboard focus and dismisses with Escape without replacing the trigger name", async () => {
    const user = userEvent.setup();

    render(
      <TooltipProvider delayDuration={0} skipDelayDuration={0}>
        <Tooltip content="Saves this lesson for later">
          <Button>Save lesson</Button>
        </Tooltip>
      </TooltipProvider>,
    );

    const trigger = screen.getByRole("button", { name: "Save lesson" });

    expect(trigger).toHaveAccessibleName("Save lesson");
    await user.tab();

    const tooltip = await screen.findByRole("tooltip");
    expect(trigger).toHaveFocus();
    expect(trigger).toHaveAccessibleName("Save lesson");
    expect(tooltip).toHaveTextContent("Saves this lesson for later");
    expect(trigger).toHaveAttribute("aria-describedby", tooltip.id);

    await user.keyboard("{Escape}");

    await waitFor(() =>
      expect(screen.queryByRole("tooltip")).not.toBeInTheDocument(),
    );
    expect(trigger).toHaveFocus();
    expect(trigger).toHaveAccessibleName("Save lesson");
  });

  it("opens on pointer hover and dismisses with Escape", async () => {
    const user = userEvent.setup();

    render(
      <TooltipProvider>
        <Tooltip content="Supplementary description" delayDuration={0}>
          <button type="button">More details</button>
        </Tooltip>
      </TooltipProvider>,
    );

    const trigger = screen.getByRole("button", { name: "More details" });

    await user.hover(trigger);
    expect(await screen.findByRole("tooltip")).toHaveTextContent(
      "Supplementary description",
    );

    await user.keyboard("{Escape}");
    await waitFor(() =>
      expect(screen.queryByRole("tooltip")).not.toBeInTheDocument(),
    );
  });

  it("renders into a stable host-supplied portal container", async () => {
    const user = userEvent.setup();
    const portalContainer = document.createElement("div");
    document.body.append(portalContainer);

    render(
      <TooltipProvider>
        <Tooltip
          content="Supplementary description"
          delayDuration={0}
          portalContainer={portalContainer}
        >
          <button type="button">More details</button>
        </Tooltip>
      </TooltipProvider>,
    );

    await user.hover(screen.getByRole("button", { name: "More details" }));

    expect(await screen.findByRole("tooltip")).toHaveTextContent(
      "Supplementary description",
    );
    expect(portalContainer).toContainElement(screen.getByRole("tooltip"));
    portalContainer.remove();
  });
});
