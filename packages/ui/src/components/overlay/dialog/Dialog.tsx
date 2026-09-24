import type { ComponentPropsWithoutRef } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import "./dialog.css";

export type DialogProps = Omit<
  ComponentPropsWithoutRef<typeof DialogPrimitive.Root>,
  "modal"
>;

/** Modal dialog with the shared focus, dismissal, and scroll-lock behavior. */
export function Dialog(props: DialogProps) {
  return <DialogPrimitive.Root {...props} modal />;
}

export type DialogTriggerProps = ComponentPropsWithoutRef<
  typeof DialogPrimitive.Trigger
>;

/** Trigger that opens or closes its containing dialog. */
export const DialogTrigger = DialogPrimitive.Trigger;

export type DialogContentProps = Omit<
  ComponentPropsWithoutRef<typeof DialogPrimitive.Content>,
  "style"
> & {
  /** Stable host-owned portal mount. Defaults to the current document body. */
  portalContainer?: HTMLElement;
};

/** Portaled modal surface with the shared backdrop and dialog layer. */
export function DialogContent({
  children,
  className,
  portalContainer,
  ...props
}: DialogContentProps) {
  const classes = ["ns-dialog__content", className].filter(Boolean).join(" ");

  return (
    <DialogPrimitive.Portal container={portalContainer}>
      <DialogPrimitive.Overlay className="ns-dialog__overlay" />
      <DialogPrimitive.Content {...props} className={classes}>
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

export type DialogTitleProps = ComponentPropsWithoutRef<
  typeof DialogPrimitive.Title
>;

/** Accessible name for the containing dialog. */
export function DialogTitle({ className, ...props }: DialogTitleProps) {
  const classes = ["ns-dialog__title", className].filter(Boolean).join(" ");

  return <DialogPrimitive.Title {...props} className={classes} />;
}

export type DialogDescriptionProps = ComponentPropsWithoutRef<
  typeof DialogPrimitive.Description
>;

/** Optional supporting description announced with the dialog title. */
export function DialogDescription({
  className,
  ...props
}: DialogDescriptionProps) {
  const classes = ["ns-dialog__description", className]
    .filter(Boolean)
    .join(" ");

  return <DialogPrimitive.Description {...props} className={classes} />;
}

export type DialogCloseProps = ComponentPropsWithoutRef<
  typeof DialogPrimitive.Close
>;

/** Control that closes its containing dialog. */
export const DialogClose = DialogPrimitive.Close;
