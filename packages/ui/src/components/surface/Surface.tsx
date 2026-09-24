import type { HTMLAttributes } from "react";
import "./surface.css";

export type SurfaceVariant = "default" | "subtle" | "raised";

export type SurfaceElevation = "none" | "card" | "interactive";

export type SurfaceProps = HTMLAttributes<HTMLDivElement> & {
  /** Semantic background role for the structural surface. */
  variant?: SurfaceVariant;
  /**
   * Structural shadow role. Use `interactive` when the surface contains
   * interactive content; Surface itself remains a non-interactive container.
   */
  elevation?: SurfaceElevation;
};

export function Surface({
  className,
  elevation = "none",
  variant = "default",
  ...props
}: SurfaceProps) {
  const classes = ["ns-surface", className].filter(Boolean).join(" ");

  return (
    <div
      {...props}
      className={classes}
      data-elevation={elevation}
      data-variant={variant}
    />
  );
}
