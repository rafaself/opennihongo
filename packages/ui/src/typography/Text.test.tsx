import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Text } from "./Text";

describe("Text", () => {
  it("keeps visual typography independent from accessible element semantics", () => {
    render(
      <>
        <Text as="h1" variant="body">
          Unit overview
        </Text>
        <Text as="p" variant="heading">
          More prominent paragraph
        </Text>
        <Text variant="heading">Default semantic heading</Text>
      </>,
    );

    expect(
      screen.getByRole("heading", { level: 1, name: "Unit overview" }),
    ).toHaveClass("ns-text-body");

    const paragraph = screen.getByText("More prominent paragraph");
    expect(paragraph.tagName).toBe("P");
    expect(paragraph).toHaveClass("ns-text-heading");
    expect(
      screen.queryByRole("heading", { name: "More prominent paragraph" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        level: 2,
        name: "Default semantic heading",
      }),
    ).toBeInTheDocument();
  });
});
