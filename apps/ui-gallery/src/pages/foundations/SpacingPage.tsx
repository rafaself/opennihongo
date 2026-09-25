import { useEffect, useRef, useState } from "react";
import { Grid, Inline, Stack } from "@opennihongo/ui";
import { GalleryDocumentationPage } from "../../layouts/GalleryDocumentationPage";
import "./SpacingPage.css";

const spacingSteps = [
  "1",
  "2",
  "2-5",
  "3",
  "4",
  "5",
  "6",
  "8",
  "12",
  "16",
] as const;

function SpacingScaleRow({
  step,
}: {
  readonly step: (typeof spacingSteps)[number];
}) {
  const token = `--ns-space-${step}`;
  const primitive = `--ns-primitive-space-${step}`;
  const markerRef = useRef<HTMLSpanElement>(null);
  const [effectiveValue, setEffectiveValue] = useState("");

  useEffect(() => {
    const marker = markerRef.current;
    if (marker) setEffectiveValue(window.getComputedStyle(marker).width);
  }, []);

  return (
    <li className="gallery-spacing-scale-row">
      <div className="gallery-spacing-scale-name">
        <strong>{step.replace("-", ".")}</strong>
        <code>{token}</code>
      </div>
      <span aria-hidden="true" className="gallery-spacing-scale-track">
        <span
          className="gallery-spacing-scale-marker"
          ref={markerRef}
          style={{ width: `var(${token})` }}
        />
      </span>
      <dl className="gallery-spacing-scale-details">
        <div>
          <dt>Primitive</dt>
          <dd>
            <code>{primitive}</code>
          </dd>
        </div>
        <div>
          <dt>Effective</dt>
          <dd>{effectiveValue || "Reading computed value…"}</dd>
        </div>
      </dl>
    </li>
  );
}

function SpacingScale() {
  return (
    <section
      aria-labelledby="spacing-scale-title"
      className="gallery-spacing-scale-section"
    >
      <div className="gallery-spacing-section-heading">
        <h3 id="spacing-scale-title">Supported spacing scale</h3>
        <p>
          Each bar uses its shared spacing token for its width. The effective
          value is read from the browser after CSS resolves the token.
        </p>
      </div>
      <ol
        aria-label="Supported spacing tokens"
        className="gallery-spacing-scale"
      >
        {spacingSteps.map((step) => (
          <SpacingScaleRow key={step} step={step} />
        ))}
      </ol>
    </section>
  );
}

function LayoutExamples() {
  return (
    <section
      aria-labelledby="spacing-layouts-title"
      className="gallery-spacing-layouts"
    >
      <div className="gallery-spacing-section-heading">
        <h3 id="spacing-layouts-title">Spacing in layout</h3>
        <p>
          Public layout primitives apply the same spacing aliases as the scale
          above.
        </p>
      </div>
      <Grid className="gallery-spacing-example-grid" columns={2} gap="4">
        <article className="gallery-spacing-example-card">
          <h4>Stack · gap 3</h4>
          <p>Separate related content in a vertical sequence.</p>
          <div className="gallery-spacing-example-stage">
            <Stack className="gallery-spacing-demo-stack" gap="3">
              <span className="gallery-spacing-demo-item">Study heading</span>
              <span className="gallery-spacing-demo-item">
                Review five vocabulary cards.
              </span>
              <span className="gallery-spacing-demo-item">Continue</span>
            </Stack>
          </div>
        </article>

        <article className="gallery-spacing-example-card">
          <h4>Inline · gap 2.5</h4>
          <p>Keep related metadata together across available width.</p>
          <div className="gallery-spacing-example-stage">
            <Inline className="gallery-spacing-demo-inline" gap="2-5">
              <span className="gallery-spacing-demo-item">N5</span>
              <span className="gallery-spacing-demo-item">Vocabulary</span>
              <span className="gallery-spacing-demo-item">12 cards</span>
            </Inline>
          </div>
        </article>

        <article className="gallery-spacing-example-card gallery-spacing-example-card-wide">
          <h4>Grid · gap 4</h4>
          <p>Give each repeated item consistent room in both directions.</p>
          <div className="gallery-spacing-example-stage">
            <Grid className="gallery-spacing-demo-grid" columns={3} gap="4">
              <span className="gallery-spacing-demo-item">Kana</span>
              <span className="gallery-spacing-demo-item">Kanji</span>
              <span className="gallery-spacing-demo-item">Grammar</span>
            </Grid>
          </div>
        </article>
      </Grid>
    </section>
  );
}

function SpacingExamples() {
  return (
    <Stack className="gallery-spacing-examples" gap="6">
      <SpacingScale />
      <LayoutExamples />
    </Stack>
  );
}

export function SpacingPage() {
  return (
    <GalleryDocumentationPage
      examples={<SpacingExamples />}
      eyebrow="Foundations / Spacing"
      guidance={[
        {
          title: "Keep layout on the shared scale",
          content: (
            <p>
              Choose the closest <code>--ns-space-*</code> token for padding,
              gaps, and separation. The compact scale follows quarter-rem steps
              while leaving room for small details and broad section spacing.
            </p>
          ),
        },
        {
          title: "Let layout primitives own gaps",
          content: (
            <p>
              Use <code>Stack</code> for vertical groups, <code>Inline</code>
              for wrapping rows, and <code>Grid</code> for repeated two-axis
              layouts. Their <code>gap</code> props consume the shared spacing
              aliases directly.
            </p>
          ),
        },
      ]}
      id="spacing"
      notes={[
        {
          title: "Token layers",
          content: (
            <p>
              Primitive values use <code>--ns-primitive-space-*</code>. Shared
              role-neutral aliases use <code>--ns-space-*</code> and resolve to
              the same values. Both are available through
              <code> @opennihongo/ui/styles.css</code>.
            </p>
          ),
        },
        {
          title: "Avoid one-off spacing",
          content: (
            <p>
              Prefer an existing step when a value is close enough. Arbitrary
              spacing creates competing rhythms and should be reserved for a
              demonstrated need that the shared scale cannot express.
            </p>
          ),
        },
      ]}
      practices={{
        doItems: [
          "Use a shared spacing alias for component and page layout.",
          "Use Stack, Inline, and Grid gap props for common arrangements.",
        ],
        dontItems: [
          "Add one-off margins or gaps when an existing token expresses the intended rhythm.",
          "Use the same large gap everywhere; choose a step that reflects the relationship between items.",
        ],
      }}
      summary="Explore the complete shared spacing scale and see how its tokens shape vertical, inline, and grid layouts. Each value resolves from the public Design System stylesheet."
      title="Spacing"
    />
  );
}
