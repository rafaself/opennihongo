import { Button, Tooltip, TooltipProvider } from "@opennihongo/ui";

type TooltipExampleProps = {
  readonly portalContainer: HTMLElement | undefined;
};

export function TooltipExample({ portalContainer }: TooltipExampleProps) {
  return (
    <article className="gallery-doc-example-card">
      <h3>Tooltip</h3>
      <p>Tab to the control to reveal its brief supplemental description.</p>
      <div className="gallery-doc-example-stage">
        <TooltipProvider delayDuration={0}>
          <Tooltip
            content="Saves this lesson for later."
            delayDuration={0}
            {...(portalContainer ? { portalContainer } : {})}
          >
            <Button variant="secondary">Save lesson</Button>
          </Tooltip>
        </TooltipProvider>
      </div>
    </article>
  );
}
