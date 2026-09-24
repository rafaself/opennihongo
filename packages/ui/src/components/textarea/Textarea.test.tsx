import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FormField } from "../form-field/FormField";
import { Textarea } from "./Textarea";

describe("Textarea", () => {
  it("composes with FormField labels, descriptions, and errors", () => {
    const description = "Share details that will help us improve the lesson.";
    const error = "Keep your feedback under 500 characters.";

    render(
      <FormField
        description={description}
        error={error}
        id="feedback"
        label="Feedback"
      >
        <Textarea maxLength={500} name="feedback" required />
      </FormField>,
    );

    const textarea = screen.getByRole("textbox", { name: "Feedback" });

    expect(textarea).toHaveAttribute("id", "feedback");
    expect(textarea).toHaveAttribute("name", "feedback");
    expect(textarea).toHaveAttribute("maxlength", "500");
    expect(textarea).toBeRequired();
    expect(textarea).toHaveAttribute("aria-invalid", "true");
    expect(textarea).toHaveAccessibleDescription(`${description} ${error}`);
  });

  it("preserves disabled behavior and exposes predictable sizing and resize defaults", () => {
    render(
      <FormField id="notes" label="Notes">
        <Textarea disabled size="comfortable" />
      </FormField>,
    );

    const textarea = screen.getByRole("textbox", { name: "Notes" });

    expect(textarea).toBeDisabled();
    expect(textarea).toHaveAttribute("rows", "4");
    expect(textarea).toHaveAttribute("data-size", "comfortable");
    expect(textarea).toHaveAttribute("data-resize", "vertical");
  });

  it("allows resizing to be disabled", () => {
    render(
      <FormField id="summary" label="Summary">
        <Textarea resize="none" rows={6} />
      </FormField>,
    );

    const textarea = screen.getByRole("textbox", { name: "Summary" });

    expect(textarea).toHaveAttribute("rows", "6");
    expect(textarea).toHaveAttribute("data-resize", "none");
  });
});
