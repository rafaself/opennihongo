import type { ComponentPropsWithoutRef, ReactNode } from "react";
import "./action-card.css";

export type ActionCardProps = Omit<
  ComponentPropsWithoutRef<"button">,
  "children"
> & {
  /** Optional, decorative illustration or icon shown above the title. */
  media?: ReactNode;
  /** Short visible name and primary accessible text for the action. */
  title: ReactNode;
  /** Optional secondary detail displayed below the title. */
  description?: ReactNode;
};

/** A full-card native button for choices with a title and optional detail. */
export function ActionCard({
  className,
  description,
  media,
  title,
  type = "button",
  ...props
}: ActionCardProps) {
  const classes = ["ns-action-card", className].filter(Boolean).join(" ");

  return (
    <button {...props} className={classes} type={type}>
      {media != null && (
        <span aria-hidden="true" className="ns-action-card__media">
          {media}
        </span>
      )}
      <span className="ns-action-card__title">{title}</span>
      {description != null && (
        <span className="ns-action-card__description">{description}</span>
      )}
    </button>
  );
}
