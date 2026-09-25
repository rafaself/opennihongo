import { useLayoutEffect, useRef, useState } from "react";
import {
  Button,
  Celebration,
  Spinner,
  type ButtonVariant,
} from "@opennihongo/ui";
import "./PlaygroundPage.css";

const buttonVariants: readonly ButtonVariant[] = ["primary", "secondary"];
const themes = ["light", "dark"] as const;

type GalleryTheme = (typeof themes)[number];
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
  const [theme, setTheme] = useState<GalleryTheme>("light");
  const [motionMode, setMotionMode] = useState<MotionMode>("system");
  const [celebrationRevision, setCelebrationRevision] = useState(0);
  const initialRootAttributes = useRef<{
    theme: string | null;
    motion: string | null;
  } | null>(null);

  useLayoutEffect(() => {
    initialRootAttributes.current = {
      theme: document.documentElement.getAttribute("data-theme"),
      motion: document.documentElement.getAttribute("data-motion"),
    };

    return () => {
      const initialAttributes = initialRootAttributes.current;
      if (!initialAttributes) return;

      setRootAttribute("data-theme", initialAttributes.theme);
      setRootAttribute("data-motion", initialAttributes.motion);
      initialRootAttributes.current = null;
    };
  }, []);

  useLayoutEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    setRootAttribute(
      "data-motion",
      motionMode === "reduced" ? "reduced" : null,
    );
  }, [motionMode, theme]);

  function resetPresentationControls() {
    setTheme("light");
    setMotionMode("system");
  }

  return (
    <article aria-labelledby="playground-title" className="gallery-playground">
      <header className="gallery-playground-heading">
        <p className="gallery-eyebrow">Design System / Playground</p>
        <h1 id="playground-title">Playground</h1>
        <p>
          Simulate shared presentation settings across the Gallery, then explore
          a public component API. These temporary controls reset when you leave
          the Playground.
        </p>
      </header>

      <section aria-labelledby="presentation-controls-title">
        <div className="gallery-playground-section-heading">
          <p className="gallery-eyebrow">Global presentation</p>
          <h2 id="presentation-controls-title">Theme and motion</h2>
        </div>

        <div className="gallery-playground-global-workbench">
          <div className="gallery-playground-global-controls">
            <fieldset className="gallery-playground-global-fieldset">
              <legend>Color theme</legend>
              <p>Set the shared semantic theme across the Gallery.</p>
              {themes.map((galleryTheme) => (
                <label className="gallery-playground-option" key={galleryTheme}>
                  <input
                    checked={theme === galleryTheme}
                    name="gallery-theme"
                    onChange={() => {
                      setTheme(galleryTheme);
                    }}
                    type="radio"
                    value={galleryTheme}
                  />
                  <span>{galleryTheme === "light" ? "Light" : "Dark"}</span>
                </label>
              ))}
            </fieldset>

            <fieldset className="gallery-playground-global-fieldset">
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
              aria-label="Presentation settings"
              aria-live="polite"
              className="gallery-playground-status"
              role="status"
            >
              Theme: {theme}.{" "}
              {motionMode === "reduced"
                ? "Reduced motion simulation is on."
                : "Following the system motion preference."}
            </p>
            <Button onClick={resetPresentationControls} variant="secondary">
              Reset global controls
            </Button>
          </div>

          <div className="gallery-playground-global-preview">
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
          </div>
        </div>
      </section>

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
