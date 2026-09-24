import type { ComponentPropsWithoutRef, ReactNode } from "react";
import * as PortalPrimitive from "@radix-ui/react-portal";
import * as ToastPrimitive from "@radix-ui/react-toast";
import "./toast.css";

export type ToastVariant = "success" | "warning" | "danger" | "info";
export type ToastAnnouncement = "polite" | "assertive";

/** Sets the shared timeout, announcement label, and swipe behavior for toasts. */
export type ToastProviderProps = ComponentPropsWithoutRef<
  typeof ToastPrimitive.Provider
>;

/** Place once around the application content that may show toast feedback. */
export function ToastProvider({ children, ...props }: ToastProviderProps) {
  return (
    <ToastPrimitive.Provider {...props}>{children}</ToastPrimitive.Provider>
  );
}

export type ToastViewportProps = Omit<
  ComponentPropsWithoutRef<typeof ToastPrimitive.Viewport>,
  "style"
> & {
  /** Stable host-owned portal mount. Defaults to the current document body. */
  portalContainer?: HTMLElement;
};

/** Accessible region where toasts are stacked and announced to the user. */
export function ToastViewport({
  className,
  portalContainer,
  ...props
}: ToastViewportProps) {
  const classes = ["ns-toast__viewport", className].filter(Boolean).join(" ");

  return (
    <PortalPrimitive.Portal
      {...(portalContainer ? { container: portalContainer } : {})}
    >
      <ToastPrimitive.Viewport {...props} className={classes} />
    </PortalPrimitive.Portal>
  );
}

export type ToastProps = Omit<
  ComponentPropsWithoutRef<typeof ToastPrimitive.Root>,
  "style" | "type"
> & {
  /** Semantic feedback role; defaults to informational feedback. */
  variant?: ToastVariant;
  /** Screen reader announcement priority; routine notifications are polite. */
  announcement?: ToastAnnouncement;
};

/** Transient feedback that does not take focus or block page interaction. */
export function Toast({
  announcement = "polite",
  className,
  variant = "info",
  ...props
}: ToastProps) {
  const classes = ["ns-toast__toast", className].filter(Boolean).join(" ");

  return (
    <ToastPrimitive.Root
      {...props}
      className={classes}
      data-variant={variant}
      type={announcement === "assertive" ? "foreground" : "background"}
    />
  );
}

export type ToastTitleProps = ComponentPropsWithoutRef<
  typeof ToastPrimitive.Title
>;

/** Short heading included in the accessible toast announcement. */
export function ToastTitle({ className, ...props }: ToastTitleProps) {
  const classes = ["ns-toast__title", className].filter(Boolean).join(" ");

  return <ToastPrimitive.Title {...props} className={classes} />;
}

export type ToastDescriptionProps = ComponentPropsWithoutRef<
  typeof ToastPrimitive.Description
>;

/** Supporting message included in the accessible toast announcement. */
export function ToastDescription({
  className,
  ...props
}: ToastDescriptionProps) {
  const classes = ["ns-toast__description", className]
    .filter(Boolean)
    .join(" ");

  return <ToastPrimitive.Description {...props} className={classes} />;
}

export type ToastActionProps = ComponentPropsWithoutRef<
  typeof ToastPrimitive.Action
>;

/** Optional action that dismisses the toast and has an announcement alt text. */
export function ToastAction({ className, ...props }: ToastActionProps) {
  const classes = ["ns-toast__action", className].filter(Boolean).join(" ");

  return <ToastPrimitive.Action {...props} className={classes} />;
}

export type ToastCloseProps = ComponentPropsWithoutRef<
  typeof ToastPrimitive.Close
>;

/** Explicitly dismisses a toast; the default accessible name can be localized. */
export function ToastClose({
  "aria-label": ariaLabel,
  children,
  className,
  ...props
}: ToastCloseProps) {
  const classes = ["ns-toast__close", className].filter(Boolean).join(" ");
  const closeContent: ReactNode = children ?? <span aria-hidden="true">×</span>;

  return (
    <ToastPrimitive.Close
      {...props}
      aria-label={ariaLabel ?? "Dismiss notification"}
      className={classes}
    >
      {closeContent}
    </ToastPrimitive.Close>
  );
}
