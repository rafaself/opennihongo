import { useState } from "react";
import { Button, type ButtonVariant } from "@opennihongo/ui";
import "./PlaygroundPage.css";

const buttonVariants: readonly ButtonVariant[] = ["primary", "secondary"];

export function PlaygroundPage() {
  const [variant, setVariant] = useState<ButtonVariant>("primary");

  return (
    <article aria-labelledby="playground-title" className="gallery-playground">
      <header className="gallery-playground-heading">
        <p className="gallery-eyebrow">Design System / Playground</p>
        <h1 id="playground-title">Playground</h1>
        <p>
          Explore a public component API with a local control. Changes here are
          temporary and stay within this gallery page.
        </p>
      </header>

      <section aria-labelledby="button-playground-title">
        <div className="gallery-playground-section-heading">
          <p className="gallery-eyebrow">Interactive example</p>
          <h2 id="button-playground-title">Button variant</h2>
        </div>

        <div className="gallery-playground-workbench">
          <fieldset className="gallery-playground-controls">
            <legend>Choose a variant</legend>
            <p>Select a presentation state for the example button.</p>
            {buttonVariants.map((buttonVariant) => (
              <label className="gallery-playground-option" key={buttonVariant}>
                <input
                  checked={variant === buttonVariant}
                  name="button-variant"
                  onChange={() => {
                    setVariant(buttonVariant);
                  }}
                  type="radio"
                  value={buttonVariant}
                />
                <span>{buttonVariant}</span>
              </label>
            ))}
          </fieldset>

          <div
            aria-label="Button preview"
            className="gallery-playground-preview"
          >
            <Button variant={variant}>Continue lesson</Button>
          </div>
        </div>
      </section>
    </article>
  );
}
