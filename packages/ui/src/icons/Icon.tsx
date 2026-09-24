import type { ReactNode, SVGProps } from "react";

export type IconSize = "small" | "medium" | "large";

export type IconProps = Omit<
  SVGProps<SVGSVGElement>,
  | "children"
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
  size?: IconSize;
};

const iconBoxSizes: Record<IconSize, string> = {
  small: "var(--ns-size-icon-box-small, 16px)",
  medium: "var(--ns-size-icon-box-medium, 20px)",
  large: "var(--ns-size-icon-box-large, 24px)",
};

type IconElementProps = IconProps & {
  children: ReactNode;
};

export function Icon({
  children,
  className,
  size = "medium",
  style,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  ...props
}: IconElementProps) {
  const hasAccessibleName = Boolean(ariaLabel || ariaLabelledBy);

  return (
    <svg
      {...props}
      aria-hidden={hasAccessibleName ? undefined : true}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      className={className}
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
