import { useSyncExternalStore } from "react";
import type { HTMLAttributes } from "react";
import "./celebration.css";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeToReducedMotion(onChange: () => void): () => void {
  if (
    typeof window === "undefined" ||
    typeof window.matchMedia !== "function"
  ) {
    return () => {};
  }

  const mediaQuery = window.matchMedia(REDUCED_MOTION_QUERY);
  mediaQuery.addEventListener("change", onChange);
  return () => {
    mediaQuery.removeEventListener("change", onChange);
  };
}

function getReducedMotionSnapshot(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia(REDUCED_MOTION_QUERY).matches
  );
}

export type CelebrationProps = HTMLAttributes<HTMLSpanElement> & {
  /** Caller-controlled state that starts the short-lived emphasis effect. */
  active: boolean;
};

/** Adds a restrained, one-shot scale and glow emphasis to its children. */
export function Celebration({
  active,
  children,
  className,
  ...props
}: CelebrationProps) {
  const prefersReducedMotion = useSyncExternalStore(
    subscribeToReducedMotion,
    getReducedMotionSnapshot,
    () => false,
  );
  const classes = ["ns-celebration", className].filter(Boolean).join(" ");

  return (
    <span
      {...props}
      className={classes}
      data-active={active && !prefersReducedMotion}
    >
      {children}
    </span>
  );
}
