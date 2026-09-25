// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { ContentAndProgressPage } from "./ContentAndProgressPage";

describe("ContentAndProgressPage", () => {
  afterEach(cleanup);

  it("documents representative content and progress components accessibly", () => {
    render(<ContentAndProgressPage />);

    expect(
      screen.getByRole("heading", { name: "Content & Progress" }),
    ).toBeTruthy();
    expect(
      screen.getByRole("article", { name: "Lesson summary" }),
    ).toBeTruthy();
    expect(screen.getByText("Complete")).toBeTruthy();
    expect(screen.getByRole("img", { name: "Yuki Tanaka" })).toBeTruthy();
    expect(screen.getByRole("separator")).toBeTruthy();

    const courseProgress = screen.getByRole("progressbar", {
      name: "Course completion",
    });
    expect(courseProgress.getAttribute("aria-valuenow")).toBe("8");
    expect(courseProgress.getAttribute("aria-valuemax")).toBe("12");

    const vocabularyProgress = screen.getByRole("progressbar", {
      name: "Vocabulary set completion",
    });
    expect(vocabularyProgress.getAttribute("aria-valuenow")).toBe("21");

    expect(
      screen
        .getByRole("region", { name: "Loading lesson preview" })
        .getAttribute("aria-busy"),
    ).toBe("true");
    expect(screen.getByRole("status", { name: "Saving lesson" })).toBeTruthy();
    expect(screen.getByText("Saving lesson…")).toBeTruthy();
    expect(screen.getByText("Loading lesson preview")).toBeTruthy();
  });

  it("scopes the live examples to the selected shared theme", () => {
    const { container } = render(<ContentAndProgressPage />);
    const preview = container.querySelector("[data-theme]");

    expect(preview?.getAttribute("data-theme")).toBe("light");

    fireEvent.click(screen.getByRole("radio", { name: "Dark theme" }));
    expect(preview?.getAttribute("data-theme")).toBe("dark");
  });
});
