import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import {
  Toast,
  ToastAction,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "./Toast";

describe("Toast", () => {
  afterEach(cleanup);

  it("announces its title and message politely and can be dismissed by name", async () => {
    const user = userEvent.setup();

    render(
      <ToastProvider duration={Infinity}>
        <Toast defaultOpen variant="success">
          <div>
            <ToastTitle>Progress saved</ToastTitle>
            <ToastDescription>
              Your study progress is up to date.
            </ToastDescription>
          </div>
          <ToastClose />
        </Toast>
        <ToastViewport />
      </ToastProvider>,
    );

    const announcement = await screen.findByRole("status");
    expect(announcement).toHaveAttribute("aria-live", "polite");
    await waitFor(() => {
      expect(announcement).toHaveTextContent(
        /Notification.*Progress saved.*Your study progress is up to date\./,
      );
    });

    const dismissButton = screen.getByRole("button", {
      name: "Dismiss notification",
    });
    await user.tab();
    await user.tab();
    expect(dismissButton).toHaveFocus();
    await user.keyboard("{Enter}");

    await waitFor(() => {
      expect(screen.queryByRole("listitem")).not.toBeInTheDocument();
    });
  });

  it("supports a custom portal host and assertive notification actions", async () => {
    const user = userEvent.setup();
    const portalContainer = document.createElement("div");
    document.body.append(portalContainer);

    render(
      <ToastProvider duration={Infinity}>
        <Toast announcement="assertive" defaultOpen>
          <ToastTitle>Sync failed</ToastTitle>
          <ToastAction altText="Retry synchronization">Retry</ToastAction>
        </Toast>
        <ToastViewport portalContainer={portalContainer} />
      </ToastProvider>,
    );

    const announcement = await screen.findByText("Sync failed");
    expect(announcement).toHaveTextContent("Sync failed");
    expect(portalContainer).toContainElement(announcement);

    const retryButton = screen.getByRole("button", { name: "Retry" });
    retryButton.focus();
    await user.keyboard("{Enter}");
    portalContainer.remove();
  });
});
