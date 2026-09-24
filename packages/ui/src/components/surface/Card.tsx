import {
  createElement,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from "react";
import { Surface, type SurfaceVariant } from "./Surface";
import "./card.css";

export type CardElement = "article" | "div" | "section";

export type CardVariant = SurfaceVariant;

type CardOwnProps<As extends CardElement> = {
  as?: As;
  children?: ReactNode;
  className?: string;
  variant?: CardVariant;
};

type CardInteractionProp =
  | "onClick"
  | "onClickCapture"
  | "onDoubleClick"
  | "onDoubleClickCapture"
  | "onKeyDown"
  | "onKeyDownCapture"
  | "onKeyPress"
  | "onKeyPressCapture"
  | "onKeyUp"
  | "onKeyUpCapture"
  | "role"
  | "tabIndex";

/**
 * A static content container. Use `article` for self-contained content and a
 * labelled `section` for a named region. Compose explicit links or Buttons
 * inside the card when an action is needed; the card root is not interactive.
 */
export type CardProps<As extends CardElement = "div"> = CardOwnProps<As> &
  Omit<
    ComponentPropsWithoutRef<As>,
    keyof CardOwnProps<As> | CardInteractionProp
  >;

/** Renders static content on the shared Surface foundation. */
export function Card<As extends CardElement = "div">({
  as,
  children,
  className,
  variant = "default",
  ...props
}: CardProps<As>) {
  const element = as ?? "div";
  const classes = ["ns-card", className].filter(Boolean).join(" ");

  return createElement(
    element,
    { ...props, className: classes },
    <Surface className="ns-card__surface" elevation="card" variant={variant}>
      {children}
    </Surface>,
  );
}
