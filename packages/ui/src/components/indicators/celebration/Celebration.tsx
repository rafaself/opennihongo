import { useSyncExternalStore } from "react";
import type { HTMLAttributes } from "react";
import "./celebration.css";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeToReducedMotion(onChange: () => void): () => void {
  if (typeof window === "undefined") return () => {};

  const mediaQuery =
    typeof window.matchMedia === "function"
      ? window.matchMedia(REDUCED_MOTION_QUERY)
      : undefined;
  mediaQuery?.addEventListener("change", onChange);

  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributeFilter: ["data-motion"],
    attributes: true,
  });

  return () => {
    mediaQuery?.removeEventListener("change", onChange);
    observer.disconnect();
  };
}

function getReducedMotionSnapshot(): boolean {
  if (
    typeof document !== "undefined" &&
    document.documentElement.getAttribute("data-motion") === "reduced"
  ) {
    return true;
  }

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
