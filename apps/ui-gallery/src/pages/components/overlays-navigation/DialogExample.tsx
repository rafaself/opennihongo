import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@opennihongo/ui";

type DialogExampleProps = {
  readonly portalContainer: HTMLElement | undefined;
};

export function DialogExample({ portalContainer }: DialogExampleProps) {
  return (
    <article className="gallery-doc-example-card">
      <h3>Dialog</h3>
      <p>Open the modal, use Tab to move through it, and Escape to dismiss.</p>
      <div className="gallery-doc-example-stage">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="secondary">Study settings</Button>
          </DialogTrigger>
          <DialogContent {...(portalContainer ? { portalContainer } : {})}>
            <DialogTitle>Study settings</DialogTitle>
            <DialogDescription>
              Choose how you would like to review this lesson.
            </DialogDescription>
            <div
              style={{
                display: "flex",
                gap: "var(--ns-space-3)",
                marginTop: "var(--ns-space-4)",
              }}
            >
              <DialogClose asChild>
                <Button>Save preferences</Button>
              </DialogClose>
              <DialogClose asChild>
                <Button variant="secondary">Cancel</Button>
              </DialogClose>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </article>
  );
}
