import type { ReactNode } from "react";
import "./KeyboardShortcut.css";

type KeyboardShortcutProps = Readonly<{
  children: ReactNode;
  className?: string;
}>;

export function KeyboardShortcut({
  children,
  className,
}: KeyboardShortcutProps) {
  const classes = ["keyboard-shortcut", className].filter(Boolean).join(" ");

  return (
    <span aria-hidden="true" className={classes}>
      {children}
    </span>
  );
}
