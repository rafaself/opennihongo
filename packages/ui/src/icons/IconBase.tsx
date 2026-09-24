import type { ReactNode, SVGProps } from "react";
import "./icon.css";

export type IconSize = "small" | "medium" | "large";

export type IconColor =
  "inherit" | "primary" | "secondary" | "tertiary" | "inverse";

export type IconComponentProps = Omit<
  SVGProps<SVGSVGElement>,
  | "children"
  | "color"
  | "dangerouslySetInnerHTML"
  | "fill"
  | "height"
  | "aria-hidden"
  | "focusable"
  | "role"
  | "size"
  | "stroke"
  | "strokeLinecap"
  | "strokeLinejoin"
  | "strokeWidth"
  | "tabIndex"
  | "title"
  | "viewBox"
  | "width"
> & {
  color?: IconColor;
  size?: IconSize;
};

const iconBoxSizes: Record<IconSize, string> = {
  small: "var(--ns-size-icon-box-small, 16px)",
  medium: "var(--ns-size-icon-box-medium, 20px)",
  large: "var(--ns-size-icon-box-large, 24px)",
};

type IconBaseProps = IconComponentProps & {
  children: ReactNode;
};

export function IconBase({
  children,
  className,
  color = "inherit",
  size = "medium",
  style,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  ...props
}: IconBaseProps) {
  const hasAccessibleName = Boolean(ariaLabel || ariaLabelledBy);

  return (
    <svg
      {...props}
      aria-hidden={hasAccessibleName ? undefined : true}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      className={["ns-icon", className].filter(Boolean).join(" ")}
      data-color={color}
      fill="none"
      focusable={false}
      role={hasAccessibleName ? "img" : undefined}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      style={{
        display: "inline-block",
        flexShrink: 0,
        height: iconBoxSizes[size],
        verticalAlign: "-0.125em",
        width: iconBoxSizes[size],
        ...style,
      }}
      viewBox="0 0 24 24"
    >
      {children}
    </svg>
  );
}
