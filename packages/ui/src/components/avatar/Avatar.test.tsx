import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Avatar } from "./Avatar";

afterEach(cleanup);

describe("Avatar", () => {
  it("shows the provided fallback when its image fails to load", () => {
    const { container } = render(
      <Avatar alt="Yuki Tanaka" fallback="YT" src="/avatar.png" />,
    );
    const image = container.querySelector("img");

    expect(image).toBeInTheDocument();
    if (!image) {
      throw new Error("Expected the avatar image to render.");
    }

    fireEvent.error(image);

    expect(container.querySelector("img")).not.toBeInTheDocument();
    expect(screen.getByText("YT")).toBeInTheDocument();
    expect(
      screen.getByRole("img", { name: "Yuki Tanaka" }),
    ).toBeInTheDocument();
  });

  it("shows fallback content when no image source is provided", () => {
    render(<Avatar alt="Yuki Tanaka" fallback="YT" />);

    expect(screen.getByText("YT")).toBeInTheDocument();
    expect(
      screen.getByRole("img", { name: "Yuki Tanaka" }),
    ).toBeInTheDocument();
  });

  it("keeps fallback visible until the image loads", () => {
    const { container } = render(
      <Avatar alt="Yuki Tanaka" fallback="YT" src="/avatar.png" />,
    );
    const image = container.querySelector("img");

    expect(screen.getByText("YT")).toBeInTheDocument();
    if (!image) {
      throw new Error("Expected the avatar image to render.");
    }

    fireEvent.load(image);

    expect(screen.queryByText("YT")).not.toBeInTheDocument();
    expect(image).toHaveAttribute("data-loaded", "true");
  });

  it("keeps avatars decorative when surrounding text already names the person", () => {
    const { container } = render(<Avatar alt="" fallback="YT" />);

    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(container.querySelector(".ns-avatar")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  });

  it.each(["small", "medium", "large"] as const)(
    "supports the %s semantic size",
    (size) => {
      const { container } = render(<Avatar alt="Yuki Tanaka" size={size} />);

      expect(container.querySelector(".ns-avatar")).toHaveAttribute(
        "data-size",
        size,
      );
    },
  );
});
