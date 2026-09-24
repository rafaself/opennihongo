import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Skeleton } from "./Skeleton";

afterEach(cleanup);

describe("Skeleton", () => {
  it("is decorative and hidden from assistive technology", () => {
    const { container } = render(<Skeleton />);
    const skeleton = container.querySelector(".ns-skeleton");

    expect(skeleton).toHaveAttribute("aria-hidden", "true");
    expect(skeleton).toHaveAttribute("data-shape", "text");
    expect(skeleton).toHaveAttribute("data-size", "medium");
  });

  it.each([
    ["text", "small"],
    ["rectangular", "large"],
    ["circular", "medium"],
  ] as const)("supports the %s shape at %s size", (shape, size) => {
    const { container } = render(<Skeleton shape={shape} size={size} />);

    expect(container.querySelector(".ns-skeleton")).toHaveAttribute(
      "data-shape",
      shape,
    );
    expect(container.querySelector(".ns-skeleton")).toHaveAttribute(
      "data-size",
      size,
    );
  });

  it("preserves consumer dimensions and leaves loading semantics to its region", () => {
    render(
      <section aria-busy="true" aria-label="Profile" role="region">
        <p role="status">Loading profile</p>
        <Skeleton
          shape="rectangular"
          style={{ blockSize: "8rem", inlineSize: "12rem" }}
        />
      </section>,
    );

    expect(screen.getByRole("status")).toHaveTextContent("Loading profile");
    expect(screen.getByRole("region", { name: "Profile" })).toHaveAttribute(
      "aria-busy",
      "true",
    );
    expect(
      screen.getByRole("region").querySelector(".ns-skeleton"),
    ).toHaveStyle({
      blockSize: "8rem",
      inlineSize: "12rem",
    });
  });
});
