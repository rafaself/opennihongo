import { useEffect, useRef, useState } from "react";
import { GalleryDocumentationPage } from "../../../layouts/GalleryDocumentationPage";
import {
  accentPalettes,
  brandAndNeutralPalettes,
  colorSteps,
  semanticGroups,
} from "./colorTokens.data";
import type { ColorSample } from "./colorTokens.data";
import "./ColorTokensPage.css";

function PrimitivePalette({
  family,
  label,
  description,
}: {
  readonly family: string;
  readonly label: string;
  readonly description: string;
}) {
  return (
    <article className="gallery-color-palette">
      <div className="gallery-color-palette-heading">
        <h4>{label}</h4>
        <p>{description}</p>
      </div>
      <ol
        aria-label={`${label} primitive color scale`}
        className="gallery-color-scale"
      >
        {colorSteps.map((step) => {
          const token = `--ns-primitive-color-${family}-${step}`;
          return (
            <li className="gallery-color-step" key={token}>
              <PrimitiveColorChip token={token} />
              <span>{step}</span>
              <code>{token}</code>
            </li>
          );
        })}
      </ol>
    </article>
  );
}

function PrimitiveColorChip({ token }: { readonly token: string }) {
  const chipRef = useRef<HTMLSpanElement>(null);
  const [computedColor, setComputedColor] = useState("");

  useEffect(() => {
    const chip = chipRef.current;
    if (chip) {
      setComputedColor(window.getComputedStyle(chip).backgroundColor);
    }
  }, []);

  return (
    <>
      <span
        aria-hidden="true"
        className="gallery-color-chip"
        ref={chipRef}
        style={{ backgroundColor: `var(${token})` }}
      />
      {computedColor && <code>{computedColor}</code>}
    </>
  );
}

function SemanticPreview({ sample }: { readonly sample: ColorSample }) {
  return (
    <article className="gallery-color-semantic-card">
      <h6>{sample.label}</h6>
      <div
        aria-hidden="true"
        className={`gallery-color-semantic-swatch${sample.focus ? " is-focus" : ""}`}
        style={{
          backgroundColor: `var(${sample.background})`,
          borderColor: sample.border ? `var(${sample.border})` : undefined,
          color: `var(${sample.foreground})`,
          outlineColor: sample.focus ? "var(--ns-color-focus)" : undefined,
        }}
      >
        {!sample.swatchOnly && <span>Aa</span>}
      </div>
      <ul
        aria-label={`${sample.label} tokens`}
        className="gallery-color-token-list"
      >
        {sample.tokens.map((token) => (
          <li key={token}>
            <code>{token}</code>
          </li>
        ))}
      </ul>
    </article>
  );
}

function ThemePreview({ theme }: { readonly theme: "light" | "dark" }) {
  const title = theme === "light" ? "Light theme" : "Dark theme";

  return (
    <section
      aria-label={title}
      className="gallery-color-theme"
      data-theme={theme}
    >
      <h4>{title}</h4>
      {semanticGroups.map(({ title: groupTitle, samples }) => (
        <section
          aria-label={groupTitle}
          className="gallery-color-role-group"
          key={groupTitle}
        >
          <h5>{groupTitle}</h5>
          <div className="gallery-color-semantic-grid">
            {samples.map((sample) => (
              <SemanticPreview key={sample.label} sample={sample} />
            ))}
          </div>
        </section>
      ))}
    </section>
  );
}

function ColorExamples() {
  return (
    <div className="gallery-color-examples">
      <section aria-labelledby="color-primitives-title">
        <div className="gallery-color-section-heading">
          <h3 id="color-primitives-title">Primitive palettes</h3>
          <p>
            Each swatch resolves from the shared stylesheet. The gallery shows
            the CSS variable names without duplicating palette values.
          </p>
        </div>
        <div className="gallery-color-palette-grid">
          {brandAndNeutralPalettes.map((palette) => (
            <PrimitivePalette key={palette.family} {...palette} />
          ))}
        </div>
      </section>

      <section aria-labelledby="color-accents-title">
        <div className="gallery-color-section-heading">
          <h3 id="color-accents-title">Supporting functional accents</h3>
          <p>
            These restrained semantic accents communicate feedback and learning
            rewards. They are not additional brand colors.
          </p>
        </div>
        <div className="gallery-color-palette-grid gallery-color-palette-grid-accents">
          {accentPalettes.map(({ family, label, role }) => (
            <PrimitivePalette
              description={role}
              family={family}
              key={family}
              label={label}
            />
          ))}
        </div>
      </section>

      <section aria-labelledby="color-semantic-title">
        <div className="gallery-color-section-heading">
          <h3 id="color-semantic-title">Semantic roles by theme</h3>
          <p>
            Both previews use the live light and dark mappings. Components
            should consume these role names instead of selecting primitive
            palette steps directly.
          </p>
        </div>
        <div className="gallery-color-theme-grid">
          <ThemePreview theme="light" />
          <ThemePreview theme="dark" />
        </div>
      </section>
    </div>
  );
}

export function ColorTokensPage() {
  return (
    <GalleryDocumentationPage
      examples={<ColorExamples />}
      eyebrow="Foundations / Color"
      guidance={[
        {
          title: "Choose a semantic role",
          content: (
            <p>
              Use the <code>--ns-color-*</code> token that describes the
              interface role. Let the active theme choose its value.
            </p>
          ),
        },
        {
          title: "Keep color meaning clear",
          content: (
            <p>
              Reserve Hinomaru for brand actions and danger feedback. Use green,
              amber, blue, orange, and indigo only for their feedback or reward
              meanings.
            </p>
          ),
        },
      ]}
      id="color-tokens"
      notes={[
        {
          title: "Contrast",
          content: (
            <p>
              Check actual foreground and background pairs in their content
              context. WCAG 2.2 AA uses 4.5:1 for normal text, 3:1 for large
              text, and 3:1 for meaningful non-text indicators; exceptions may
              apply. See the W3C guidance for{" "}
              <a href="https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html">
                text contrast
              </a>{" "}
              and{" "}
              <a href="https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html">
                non-text contrast
              </a>
              . These token previews do not establish whole-product conformance.
            </p>
          ),
        },
        {
          title: "Source",
          content: (
            <p>
              The Design System owns the primitives and theme maps. Consume the
              public <code>@opennihongo/ui/styles.css</code> stylesheet; do not
              copy palette values into application or gallery styles.
            </p>
          ),
        },
      ]}
      practices={{
        doItems: [
          "Use semantic color roles and test foregrounds on the backgrounds where they appear.",
          "Pair status and reward colors with clear text or icon meaning.",
        ],
        dontItems: [
          "Use raw primitive color tokens to style product components.",
          "Treat feedback and reward accents as extensions of the brand palette.",
        ],
      }}
      summary="Explore the Hinomaru and Sumi primitive scales, functional accents, and live semantic color mappings for both themes. The swatches read from the shared Design System token source."
      title="Color system"
    />
  );
}
