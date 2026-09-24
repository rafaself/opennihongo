import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FormField } from "./FormField";

describe("FormField", () => {
  it("labels its control and associates required, description, and error cues", () => {
    const description = "Use the email address associated with your account.";
    const error = "Enter a valid email address.";

    render(
      <FormField
        description={description}
        error={error}
        id="email"
        label="Email address"
        required
      >
        <input type="email" />
      </FormField>,
    );

    const control = screen.getByRole("textbox", {
      name: "Email address",
    });

    expect(control).toHaveAttribute("id", "email");
    expect(control).toBeRequired();
    expect(control).toHaveAttribute("aria-invalid", "true");
    expect(control).toHaveAttribute(
      "aria-describedby",
      "email-description email-error",
    );
    expect(control).toHaveAccessibleDescription(`${description} ${error}`);
    expect(screen.getByText("(required)")).toBeInTheDocument();
    expect(screen.getByText(error)).toBeInTheDocument();
  });

  it("keeps existing control description references when adding its own", () => {
    render(
      <>
        <p id="query-help">Enter a word or phrase.</p>
        <FormField
          description="Enter the term to look up."
          id="query"
          label="Query"
        >
          <input aria-describedby="query-help" />
        </FormField>
      </>,
    );

    const control = screen.getByRole("textbox", { name: "Query" });
    expect(control).toHaveAttribute(
      "aria-describedby",
      "query-help query-description",
    );
    expect(control).toHaveAccessibleDescription(
      "Enter a word or phrase. Enter the term to look up.",
    );
  });
});
