import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FormField } from "../form-field/FormField";
import { Input } from "./Input";

describe("Input", () => {
  it("composes with FormField labels, descriptions, and errors", () => {
    const description = "Use the email address associated with your account.";
    const error = "Enter a valid email address.";

    render(
      <FormField
        description={description}
        error={error}
        id="email"
        label="Email address"
      >
        <Input autoComplete="email" name="email" required type="email" />
      </FormField>,
    );

    const input = screen.getByRole("textbox", { name: "Email address" });

    expect(input).toHaveAttribute("id", "email");
    expect(input).toHaveAttribute("name", "email");
    expect(input).toHaveAttribute("autocomplete", "email");
    expect(input).toBeRequired();
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAccessibleDescription(`${description} ${error}`);
  });

  it("preserves native disabled behavior and the FormField label", () => {
    render(
      <FormField id="query" label="Query">
        <Input
          disabled
          htmlSize={32}
          placeholder="Search terms"
          size="comfortable"
        />
      </FormField>,
    );

    const input = screen.getByRole("textbox", { name: "Query" });

    expect(input).toBeDisabled();
    expect(input).toHaveAttribute("placeholder", "Search terms");
    expect(input).toHaveAttribute("size", "32");
    expect(input).toHaveAttribute("data-size", "comfortable");
  });
});
