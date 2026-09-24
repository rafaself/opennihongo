import type { ButtonProps, ButtonSize } from "../Button";
import { Button } from "../Button";
import { Icon, type IconName } from "../../icons/Icon";
import type { IconSize } from "../../icons/IconBase";

const iconSizes: Record<ButtonSize, IconSize> = {
  compact: "small",
  standard: "medium",
  comfortable: "large",
};

export type IconButtonProps = Omit<
  ButtonProps,
  "aria-label" | "aria-labelledby" | "children"
> & {
  /** Accessible name for the action; required because the control has no text. */
  "aria-label": string;
  /** Name of a registered first-party functional icon. */
  icon: IconName;
};

/** An icon-only action that shares Button's interaction and sizing contract. */
export function IconButton({
  "aria-label": ariaLabel,
  className,
  icon,
  loading = false,
  size = "standard",
  ...props
}: IconButtonProps) {
  if (!ariaLabel.trim()) {
    throw new Error("IconButton requires a non-empty aria-label.");
  }

  const classes = ["ns-button--icon", className].filter(Boolean).join(" ");

  return (
    <Button
      {...props}
      aria-label={ariaLabel}
      className={classes}
      loading={loading}
      size={size}
    >
      {!loading && <Icon name={icon} size={iconSizes[size]} />}
    </Button>
  );
}
