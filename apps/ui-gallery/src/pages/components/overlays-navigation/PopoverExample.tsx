import {
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@opennihongo/ui";

type PopoverExampleProps = {
  readonly portalContainer: HTMLElement | undefined;
};

export function PopoverExample({ portalContainer }: PopoverExampleProps) {
  return (
    <article className="gallery-doc-example-card">
      <h3>Popover</h3>
      <p>Open the interactive reference, then press Escape or click outside.</p>
      <div className="gallery-doc-example-stage">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="secondary">Kana reference</Button>
          </PopoverTrigger>
          <PopoverContent
            aria-label="Kana reference"
            {...(portalContainer ? { portalContainer } : {})}
          >
            <label>
              Search the reference
              <input aria-label="Reference search" defaultValue="あ" />
            </label>
          </PopoverContent>
        </Popover>
      </div>
    </article>
  );
}
