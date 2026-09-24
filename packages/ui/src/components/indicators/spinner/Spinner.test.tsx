import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Spinner } from "./Spinner";

afterEach(cleanup);

describe("Spinner", () => {
  it("announces its accessible name as a polite status and hides the graphic", () => {
    render(<Spinner aria-label="Saving lesson" />);

    const status = screen.getByRole("status", { name: "Saving lesson" });
    expect(status).toHaveAttribute("aria-live", "polite");
    expect(status).toHaveAttribute("aria-atomic", "true");
    expect(status.querySelector(".ns-spinner__indicator")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  });

  it("accepts its accessible name through aria-labelledby", () => {
    render(
      <>
        <span id="loading-label">Saving lesson</span>
        <Spinner aria-labelledby="loading-label" />
      </>,
    );

    expect(screen.getByRole("status", { name: "Saving lesson" })).toBeVisible();
  });

  it("rejects an empty accessible name", () => {
    expect(() => render(<Spinner aria-label="  " />)).toThrow(
      "Spinner requires a non-empty accessible name.",
    );
  });

  it("exposes the shared semantic size and color selections", () => {
    render(<Spinner aria-label="Loading" color="secondary" size="large" />);

    expect(screen.getByRole("status", { name: "Loading" })).toHaveAttribute(
      "data-size",
      "large",
    );
    expect(screen.getByRole("status", { name: "Loading" })).toHaveAttribute(
      "data-color",
      "secondary",
    );
  });
});
