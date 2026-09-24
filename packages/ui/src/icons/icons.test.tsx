import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  CheckIcon,
  CloseIcon,
  Icon,
  StarIcon,
  type IconComponentProps,
} from "@opennihongo/ui/icons";

type AssertFalse<T extends false> = T;
type HasDangerouslySetInnerHTML =
  "dangerouslySetInnerHTML" extends keyof IconComponentProps ? true : false;

export type IconPropsRejectDangerouslySetInnerHTML =
  AssertFalse<HasDangerouslySetInnerHTML>;

describe("functional icon registry", () => {
  it("renders only the selected named icons", () => {
    const { container } = render(
      <>
        <CheckIcon />
        <CloseIcon />
        <StarIcon />
      </>,
    );

    const icons = container.querySelectorAll("svg");
    expect(icons).toHaveLength(3);
    expect(icons[0]?.querySelector("path")).toHaveAttribute(
      "d",
      "m5 12 4 4L19 6",
    );
    expect(icons[1]?.querySelector("path")).toHaveAttribute(
      "d",
      "M6 6 18 18M18 6 6 18",
    );
    expect(icons[2]?.querySelector("path")).toHaveAttribute(
      "d",
      "m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3Z",
    );
  });

  it("renders names from the canonical icon registry", () => {
    const { container } = render(
      <>
        <Icon name="check" />
        <Icon name="close" />
        <Icon name="star" />
      </>,
    );

    const icons = container.querySelectorAll("svg");
    expect(icons).toHaveLength(3);
    expect(icons[0]?.querySelector("path")).toHaveAttribute(
      "d",
      "m5 12 4 4L19 6",
    );
    expect(icons[1]?.querySelector("path")).toHaveAttribute(
      "d",
      "M6 6 18 18M18 6 6 18",
    );
    expect(icons[2]?.querySelector("path")).toHaveAttribute(
      "d",
      "m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3Z",
    );
  });

  it("supports semantic colors and accessible names on registered icons", () => {
    render(
      <>
        <span id="dismiss-label">Dismiss</span>
        <Icon
          aria-labelledby="dismiss-label"
          color="secondary"
          name="close"
          size="large"
        />
      </>,
    );

    const icon = screen.getByRole("img", { name: "Dismiss" });
    expect(icon).not.toHaveAttribute("aria-hidden");
    expect(icon).toHaveAttribute("data-color", "secondary");
    expect(icon).toHaveStyle({
      width: "var(--ns-size-icon-box-large, 24px)",
      height: "var(--ns-size-icon-box-large, 24px)",
    });
  });

  it("keeps name-selected icons decorative by default", () => {
    const { container } = render(<Icon name="check" />);
    const icon = container.querySelector("svg");

    expect(icon).toHaveAttribute("aria-hidden", "true");
    expect(icon).toHaveAttribute("focusable", "false");
    expect(icon).toHaveAttribute("data-color", "inherit");
    expect(icon).not.toHaveAttribute("role", "img");
  });

  it("hides decorative icons from assistive technology by default", () => {
    const { container } = render(<CheckIcon />);
    const icon = container.querySelector("svg");

    expect(icon).toHaveAttribute("aria-hidden", "true");
    expect(icon).toHaveAttribute("focusable", "false");
    expect(icon).not.toHaveAttribute("role", "img");
  });

  it("supports a meaningful accessible name and semantic size", () => {
    render(<CheckIcon aria-label="Completed" size="large" />);

    const icon = screen.getByRole("img", { name: "Completed" });
    expect(icon).not.toHaveAttribute("aria-hidden");
    expect(icon).toHaveStyle({
      width: "var(--ns-size-icon-box-large, 24px)",
      height: "var(--ns-size-icon-box-large, 24px)",
      verticalAlign: "-0.125em",
    });
    expect(icon).toHaveAttribute("viewBox", "0 0 24 24");
    expect(icon).toHaveAttribute("stroke", "currentColor");
    expect(icon).toHaveAttribute("stroke-width", "2");
  });
});
