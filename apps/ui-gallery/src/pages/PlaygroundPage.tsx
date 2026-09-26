import { useLayoutEffect, useRef, useState } from "react";
import {
  Button,
  Celebration,
  Spinner,
  type ButtonVariant,
} from "@opennihongo/ui";
import { PlaygroundSplitWorkbench } from "./playground/PlaygroundSplitWorkbench";
import "./PlaygroundPage.css";

const buttonVariants: readonly ButtonVariant[] = ["primary", "secondary"];

type MotionMode = "system" | "reduced";

function setRootAttribute(name: string, value: string | null) {
  if (value === null) {
    document.documentElement.removeAttribute(name);
  } else {
    document.documentElement.setAttribute(name, value);
  }
}

export function PlaygroundPage() {
  const [variant, setVariant] = useState<ButtonVariant>("primary");
  const [motionMode, setMotionMode] = useState<MotionMode>("system");
  const [celebrationRevision, setCelebrationRevision] = useState(0);
  const initialMotionMode = useRef<string | null>(null);

  useLayoutEffect(() => {
    initialMotionMode.current =
      document.documentElement.getAttribute("data-motion");

    return () => {
      const initialMode = initialMotionMode.current;
      if (initialMode === null) {
        document.documentElement.removeAttribute("data-motion");
      } else {
        document.documentElement.setAttribute("data-motion", initialMode);
      }

      initialMotionMode.current = null;
    };
  }, []);

  useLayoutEffect(() => {
    setRootAttribute(
      "data-motion",
      motionMode === "reduced" ? "reduced" : null,
    );
  }, [motionMode]);

  function resetMotionControl() {
    setMotionMode("system");
  }

  return (
    <article aria-labelledby="playground-title" className="gallery-playground">
      <header className="gallery-playground-heading">
        <p className="gallery-eyebrow">Design System / Playground</p>
        <h1 id="playground-title">Playground</h1>
        <p>
          Preview reduced-motion behavior across the Gallery, then explore a
          public component API. The temporary motion simulation resets when you
          leave the Playground.
        </p>
      </header>

      <section aria-labelledby="presentation-controls-title">
        <div className="gallery-playground-section-heading">
          <p className="gallery-eyebrow">Motion preview</p>
          <h2 id="presentation-controls-title">Motion preference</h2>
        </div>

        <PlaygroundSplitWorkbench
          controls={
            <>
              <fieldset className="gallery-playground-controls">
                <legend>Motion preference</legend>
                <p>
                  System follows your browser setting. Reduced simulates the
                  shared reduced-motion mode.
                </p>
                {(
                  [
                    ["system", "System preference"],
                    ["reduced", "Reduced motion"],
                  ] as const
                ).map(([value, label]) => (
                  <label className="gallery-playground-option" key={value}>
                    <input
                      checked={motionMode === value}
                      name="gallery-motion"
                      onChange={() => {
                        setMotionMode(value);
                      }}
                      type="radio"
                      value={value}
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </fieldset>

              <p
                aria-label="Motion settings"
                aria-live="polite"
                className="gallery-playground-status"
                role="status"
              >
                {motionMode === "reduced"
                  ? "Reduced motion simulation is on."
                  : "Following the system motion preference."}
              </p>
              <Button onClick={resetMotionControl} variant="secondary">
                Reset motion setting
              </Button>
            </>
          }
          preview={
            <>
              <p className="gallery-playground-preview-label">
                Shared motion examples
              </p>
              <div className="gallery-playground-motion-example">
                <Spinner aria-label="Loading next lesson" />
                <span>Loading next lesson</span>
              </div>
              <div className="gallery-playground-celebration-example">
                <Celebration
                  active={celebrationRevision > 0}
                  key={celebrationRevision}
                >
                  Daily goal complete
                </Celebration>
                <Button
                  onClick={() => {
                    setCelebrationRevision((revision) => revision + 1);
                  }}
                  variant="secondary"
                >
                  Replay celebration
                </Button>
              </div>
            </>
          }
          previewLabel="Motion examples"
          previewLayout="stacked"
        />
      </section>

      <section aria-labelledby="button-playground-title">
        <div className="gallery-playground-section-heading">
          <p className="gallery-eyebrow">Interactive example</p>
          <h2 id="button-playground-title">Button variant</h2>
        </div>

        <PlaygroundSplitWorkbench
          controls={
            <fieldset className="gallery-playground-controls">
              <legend>Choose a variant</legend>
              <p>Select a presentation state for the example button.</p>
              {buttonVariants.map((buttonVariant) => (
                <label
                  className="gallery-playground-option"
                  key={buttonVariant}
                >
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
          }
          preview={<Button variant={variant}>Continue lesson</Button>}
          previewLabel="Button preview"
        />
      </section>
    </article>
  );
}
