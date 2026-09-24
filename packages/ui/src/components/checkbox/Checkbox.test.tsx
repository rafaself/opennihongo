import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { FormField } from "../form-field/FormField";
import { Checkbox } from "./Checkbox";

describe("Checkbox", () => {
  it("supports an accessible FormField label and native checked interaction", async () => {
    const user = userEvent.setup();

    render(
      <FormField id="remember" label="Remember this choice">
        <Checkbox name="remember" />
      </FormField>,
    );

    const checkbox = screen.getByRole("checkbox", {
      name: "Remember this choice",
    });

    expect(checkbox).toHaveAttribute("id", "remember");
    expect(checkbox).not.toBeChecked();

    await user.click(checkbox);

    expect(checkbox).toBeChecked();
  });

  it("exposes indeterminate state and clears it on keyboard activation", async () => {
    const user = userEvent.setup();

    render(
      <label>
        <Checkbox indeterminate />
        Select all items
      </label>,
    );

    const checkbox = screen.getByRole("checkbox", {
      name: "Select all items",
    });

    expect(checkbox).toBePartiallyChecked();

    await user.tab();
    expect(checkbox).toHaveFocus();
    await user.keyboard(" ");

    expect(checkbox).toBeChecked();
    expect(checkbox).not.toBePartiallyChecked();
  });

  it("does not change when disabled", async () => {
    const user = userEvent.setup();

    render(
      <label>
        <Checkbox disabled />
        Unavailable choice
      </label>,
    );

    const checkbox = screen.getByRole("checkbox", {
      name: "Unavailable choice",
    });

    expect(checkbox).toBeDisabled();

    await user.click(checkbox);

    expect(checkbox).not.toBeChecked();
  });
});
