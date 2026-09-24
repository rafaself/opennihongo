import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Card } from "./Card";

describe("Card", () => {
  it("renders a static div on the shared card surface by default", () => {
    const { container } = render(<Card>Vocabulary practice</Card>);

    const card = container.firstElementChild;
    expect(card).toHaveProperty("tagName", "DIV");
    expect(card).toHaveClass("ns-card");
    expect(card).not.toHaveAttribute("role");
    expect(card).not.toHaveAttribute("tabindex");

    const surface = card?.firstElementChild;
    expect(surface).toHaveClass("ns-surface", "ns-card__surface");
    expect(surface).toHaveAttribute("data-variant", "default");
    expect(surface).toHaveAttribute("data-elevation", "card");
    expect(surface).toHaveTextContent("Vocabulary practice");
  });

  it("uses native article semantics and supports static presentation variants", () => {
    render(
      <Card
        aria-labelledby="vocabulary-title"
        as="article"
        className="lesson-card"
        id="vocabulary-card"
        variant="raised"
      >
        <h2 id="vocabulary-title">Vocabulary practice</h2>
        <a href="/lessons/vocabulary">Review lesson</a>
      </Card>,
    );

    const card = screen.getByRole("article", {
      name: "Vocabulary practice",
    });
    expect(card).toHaveAttribute("id", "vocabulary-card");
    expect(card).toHaveClass("ns-card", "lesson-card");

    const surface = card.firstElementChild;
    expect(surface).toHaveAttribute("data-variant", "raised");
    expect(surface).toHaveAttribute("data-elevation", "card");
    expect(screen.getByRole("link", { name: "Review lesson" })).toHaveAttribute(
      "href",
      "/lessons/vocabulary",
    );
  });

  it("supports a labelled section for a named content region", () => {
    render(
      <Card as="section" aria-labelledby="review-heading">
        <h2 id="review-heading">Review due today</h2>
      </Card>,
    );

    expect(
      screen.getByRole("region", { name: "Review due today" }),
    ).toBeInTheDocument();
  });
});
