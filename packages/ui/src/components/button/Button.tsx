import type { ButtonHTMLAttributes } from "react";
import "./button.css";

export type ButtonVariant = "primary" | "secondary";
export type ButtonSize = "compact" | "standard" | "comfortable";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  /** Announces this message while the button is loading. */
  loadingAnnouncement?: string;
  /** Prevents activation and exposes an accessible loading status. */
  loading?: boolean;
  size?: ButtonSize;
  variant?: ButtonVariant;
};

export function Button({
  "aria-busy": ariaBusy,
  children,
  className,
  disabled = false,
  loading = false,
  loadingAnnouncement = "Loading",
  size = "standard",
  type = "button",
  variant = "primary",
  ...props
}: ButtonProps) {
  const classes = ["ns-button", className].filter(Boolean).join(" ");

  return (
    <>
      <button
        {...props}
        aria-busy={loading ? true : ariaBusy}
        className={classes}
        data-loading={loading ? "true" : undefined}
        data-size={size}
        data-variant={variant}
        disabled={disabled || loading}
        type={type}
      >
        {loading && <span aria-hidden="true" className="ns-button__spinner" />}
        {children}
      </button>
      {loading && (
        <span
          aria-atomic="true"
          aria-live="polite"
          className="ns-button__status"
          role="status"
        >
          {loadingAnnouncement}
        </span>
      )}
    </>
  );
}
