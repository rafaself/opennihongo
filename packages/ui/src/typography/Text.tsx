import {
  createElement,
  type ComponentPropsWithoutRef,
  type ElementType,
} from "react";
import "./text.css";

export type TextVariant = "display" | "heading" | "body" | "label" | "caption";

export type TextColor = "primary" | "secondary" | "tertiary" | "inverse";

const defaultElements: Record<TextVariant, ElementType> = {
  display: "h1",
  heading: "h2",
  body: "p",
  label: "span",
  caption: "small",
};

type TextOwnProps = {
  as?: ElementType;
  color?: TextColor;
  variant?: TextVariant;
};

export type TextProps<As extends ElementType = ElementType> = TextOwnProps &
  Omit<ComponentPropsWithoutRef<As>, keyof TextOwnProps> & { as?: As };

/**
 * Renders text with a semantic type and color role. `as` can override the
 * element selected for a typography variant when the document outline calls
 * for different semantics.
 */
export function Text<As extends ElementType = ElementType>({
  as,
  className,
  color = "primary",
  variant = "body",
  ...props
}: TextProps<As>) {
  const Component = as ?? defaultElements[variant];
  const classes = ["ns-text", `ns-text-${variant}`, className]
    .filter(Boolean)
    .join(" ");

  return createElement(Component, {
    ...props,
    className: classes,
    "data-color": color,
  });
}
