import { useState } from "react";
import {
  Button,
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@opennihongo/ui";

type ToastExampleProps = {
  readonly portalContainer: HTMLElement | undefined;
};

export function ToastExample({ portalContainer }: ToastExampleProps) {
  const [open, setOpen] = useState(false);

  return (
    <article className="gallery-doc-example-card">
      <h3>Toast</h3>
      <p>
        Focus the close control and press Enter to dismiss the notification.
      </p>
      <div className="gallery-doc-example-stage">
        <ToastProvider duration={Infinity}>
          <Button
            onClick={() => {
              setOpen(true);
            }}
            variant="secondary"
          >
            Show preview notification
          </Button>
          <Toast onOpenChange={setOpen} open={open} variant="success">
            <div>
              <ToastTitle>Preview saved</ToastTitle>
              <ToastDescription>
                Your example preferences are up to date.
              </ToastDescription>
            </div>
            <ToastClose aria-label="Dismiss preview notification" />
          </Toast>
          <ToastViewport
            aria-label="Preview notifications"
            {...(portalContainer ? { portalContainer } : {})}
          />
        </ToastProvider>
      </div>
    </article>
  );
}
