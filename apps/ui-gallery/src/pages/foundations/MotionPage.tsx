import { useState } from "react";
import type { CSSProperties } from "react";
import { Button, Celebration } from "@opennihongo/ui";
import { GalleryDocumentationPage } from "../../layouts/GalleryDocumentationPage";
import "./MotionPage.css";

const durations = [
  {
    label: "Instant",
    token: "--ns-motion-duration-instant",
  },
  { label: "Fast", token: "--ns-motion-duration-fast" },
  { label: "Normal", token: "--ns-motion-duration-normal" },
  { label: "Slow", token: "--ns-motion-duration-slow" },
  {
    label: "Celebration",
    token: "--ns-motion-duration-celebration",
  },
  {
    label: "Indeterminate",
    token: "--ns-motion-duration-indeterminate",
  },
] as const;

const easings = [
  {
    label: "Standard",
    token: "--ns-motion-easing-standard",
    description: "Routine state changes",
  },
  {
    label: "Enter",
    token: "--ns-motion-easing-enter",
    description: "Elements arriving into view",
  },
  {
    label: "Exit",
    token: "--ns-motion-easing-exit",
    description: "Elements leaving view",
  },
  {
    label: "Spring",
    token: "--ns-motion-easing-spring",
    description: "A restrained overshoot",
  },
  {
    label: "Bounce",
    token: "--ns-motion-easing-bounce",
    description: "Expressive reward feedback",
  },
] as const;

function MotionDurationScale({ showEnd }: { readonly showEnd: boolean }) {
  const rootStyles = getComputedStyle(document.documentElement);

  return (
    <ol
      aria-label="Shared motion durations"
      className="gallery-motion-duration-list"
      data-active={showEnd}
    >
      {durations.map(({ label, token }) => {
        const resolvedValue = rootStyles.getPropertyValue(token).trim();

        return (
          <li className="gallery-motion-duration-row" key={token}>
            <div className="gallery-motion-token-label">
              <strong>{label}</strong>
              <code>{token}</code>
            </div>
            <span
              aria-hidden="true"
              className="gallery-motion-track"
              style={
                {
                  "--gallery-motion-duration": `var(${token})`,
                } as CSSProperties
              }
            >
              <span className="gallery-motion-marker" />
            </span>
            <span className="gallery-motion-value">
              {resolvedValue ? `${resolvedValue} resolved` : "Unavailable"}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

function EasingExamples({ showEnd }: { readonly showEnd: boolean }) {
  return (
    <ul
      aria-label="Shared easing examples"
      className="gallery-motion-easing-grid"
      data-active={showEnd}
    >
      {easings.map(({ label, token, description }) => (
        <li className="gallery-motion-easing-card" key={token}>
          <div className="gallery-motion-token-label">
            <strong>{label}</strong>
            <code>{token}</code>
          </div>
          <span
            aria-hidden="true"
            className="gallery-motion-track gallery-motion-easing-track"
            style={
              {
                "--gallery-motion-easing": `var(${token})`,
              } as CSSProperties
            }
          >
            <span className="gallery-motion-marker" />
          </span>
          <p>{description}</p>
        </li>
      ))}
    </ul>
  );
}

function CelebrationPreview({
  reduced = false,
}: {
  readonly reduced?: boolean;
}) {
  const [active, setActive] = useState(false);
  const className = reduced
    ? "gallery-motion-preview gallery-motion-preview--reduced"
    : "gallery-motion-preview";

  return (
    <section
      aria-label={
        reduced ? "Reduced motion example" : "Standard motion example"
      }
      className={className}
    >
      <div className="gallery-motion-preview-heading">
        <h4>{reduced ? "Reduced motion" : "Standard motion"}</h4>
        <p>
          {reduced
            ? "The same completion stays visible without a moving emphasis."
            : "Trigger a short celebration, then trigger it again to compare."}
        </p>
      </div>
      <div className="gallery-motion-preview-stage">
        <Celebration active={active}>
          <div className="gallery-motion-reward">
            <span aria-hidden="true">✓</span>
            <strong>Lesson complete</strong>
            <small>5 cards reviewed</small>
          </div>
        </Celebration>
      </div>
      <Button
        onClick={() => {
          setActive((current) => !current);
        }}
        variant="secondary"
      >
        {active ? "Reset example" : "Show completion feedback"}
      </Button>
    </section>
  );
}

function MotionExamples() {
  const [showEnd, setShowEnd] = useState(false);

  return (
    <div className="gallery-motion-examples">
      <section aria-labelledby="gallery-motion-duration-heading">
        <div className="gallery-motion-section-heading">
          <h3 id="gallery-motion-duration-heading">Duration scale</h3>
          <p>
            Shared aliases resolve to these primitive values. Use the timing
            control below to move each marker; its duration comes from the
            token.
          </p>
        </div>
        <MotionDurationScale showEnd={showEnd} />
      </section>

      <section aria-labelledby="gallery-motion-easing-heading">
        <div className="gallery-motion-section-heading">
          <h3 id="gallery-motion-easing-heading">Easing curves</h3>
          <p>
            Each marker travels the same distance and duration, using its named
            easing token so the curve is easy to compare.
          </p>
        </div>
        <EasingExamples showEnd={showEnd} />
      </section>

      <Button
        aria-pressed={showEnd}
        onClick={() => {
          setShowEnd((current) => !current);
        }}
        variant="secondary"
      >
        {showEnd ? "Reset timing examples" : "Run timing examples"}
      </Button>

      <section aria-labelledby="gallery-motion-tactile-heading">
        <div className="gallery-motion-section-heading">
          <h3 id="gallery-motion-tactile-heading">
            Tactile and celebratory feedback
          </h3>
          <p>
            Press the button to feel its small shared-token offset. The
            celebration uses the same duration and bounce easing shown above.
          </p>
        </div>
        <div className="gallery-motion-feedback-grid">
          <div className="gallery-motion-tactile-card">
            <h4>Press state</h4>
            <p>Hold the control to inspect its tactile response.</p>
            <Button>Press and hold</Button>
            <code>--ns-motion-press-offset</code>
          </div>
          <CelebrationPreview />
        </div>
      </section>

      <section aria-labelledby="gallery-motion-reduced-heading">
        <div className="gallery-motion-section-heading">
          <h3 id="gallery-motion-reduced-heading">
            Reduced-motion alternative
          </h3>
          <p>
            Compare the same content with emphasis removed. The reduced preview
            maps shared timing aliases to instant, removes the press offset, and
            keeps the completion state visible. The page also honors the
            operating-system preference through the shared stylesheet.
          </p>
        </div>
        <div className="gallery-motion-feedback-grid">
          <CelebrationPreview />
          <CelebrationPreview reduced />
        </div>
      </section>
    </div>
  );
}

export function MotionPage() {
  return (
    <GalleryDocumentationPage
      examples={<MotionExamples />}
      eyebrow="Foundations / Motion"
      guidance={[
        {
          title: "Use intent-based timing aliases",
          content: (
            <p>
              Use fast and normal for routine interface feedback, slow for
              larger transitions, and celebration only for brief, meaningful
              milestones. Keep motion finite and tied to a user action.
            </p>
          ),
        },
        {
          title: "Keep motion supplementary",
          content: (
            <p>
              Preserve the same information and actions when motion is reduced.
              Avoid relying on movement, color, or timing as the only way to
              understand a state change.
            </p>
          ),
        },
      ]}
      id="motion"
      notes={[
        {
          title: "Shared token layers",
          content: (
            <p>
              Primitive durations and curves use{" "}
              <code>--ns-primitive-motion-*</code>. Components consume semantic{" "}
              <code>--ns-motion-*</code> aliases from{" "}
              <code>@opennihongo/ui/styles.css</code>.
            </p>
          ),
        },
        {
          title: "Reduced motion",
          content: (
            <p>
              The shared stylesheet follows <code>prefers-reduced-motion</code>:
              timing becomes instant, tactile translation is removed, and spring
              and bounce curves use standard easing.
            </p>
          ),
        },
      ]}
      practices={{
        doItems: [
          "Use shared duration and easing aliases for interface feedback.",
          "Keep celebratory motion short, optional, and user-triggered.",
        ],
        dontItems: [
          "Add gallery-only timing values when a shared token expresses the intent.",
          "Use continuous or autoplaying animation for documentation examples.",
        ],
      }}
      summary="Compare shared durations and easing curves with tactile feedback, a finite celebration, and a reduced-motion alternative. The examples read the Design System motion tokens directly."
      title="Motion and reduced motion"
    />
  );
}
