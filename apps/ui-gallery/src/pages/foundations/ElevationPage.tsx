import { Surface } from "@opennihongo/ui";
import { GalleryDocumentationPage } from "../../layouts/GalleryDocumentationPage";
import "./ElevationPage.css";

const semanticSurfaces = [
  {
    label: "Canvas",
    token: "--ns-color-canvas",
    description: "The page backdrop behind content.",
  },
  {
    label: "Default",
    token: "--ns-color-surface",
    description: "The ordinary bounded content plane.",
  },
  {
    label: "Subtle",
    token: "--ns-color-surface-subtle",
    description: "A quieter supporting group.",
  },
  {
    label: "Raised",
    token: "--ns-color-surface-raised",
    description: "Content paired with an elevation cue.",
  },
] as const;

const elevationLevels = [
  { label: "None", token: "--ns-elevation-none" },
  { label: "Card", token: "--ns-elevation-card" },
  { label: "Interactive", token: "--ns-elevation-interactive" },
  { label: "Hover", token: "--ns-elevation-hover" },
  { label: "Pressed", token: "--ns-elevation-pressed" },
  { label: "Dialog", token: "--ns-elevation-dialog" },
  { label: "Overlay", token: "--ns-elevation-overlay" },
] as const;

function SemanticSurfaceGrid() {
  return (
    <div className="gallery-elevation-surface-grid">
      {semanticSurfaces.map(({ label, token, description }) => (
        <article className="gallery-elevation-surface-card" key={token}>
          <div
            aria-hidden="true"
            className="gallery-elevation-surface-swatch"
            style={{ backgroundColor: `var(${token})` }}
          >
            <span aria-hidden="true">Aa</span>
          </div>
          <h5>{label}</h5>
          <p>{description}</p>
          <code>{token}</code>
        </article>
      ))}
    </div>
  );
}

function SunkenComposition() {
  return (
    <article className="gallery-elevation-composition-card">
      <h5>Sunken area</h5>
      <p>
        A contextual well uses the canvas role inside an ordinary content
        surface; it does not add a separate sunken token.
      </p>
      <div className="gallery-elevation-sunken-well">
        <span>Review queue</span>
        <strong>5 cards due</strong>
      </div>
      <code>--ns-color-canvas inside --ns-color-surface</code>
    </article>
  );
}

function InteractiveComposition() {
  return (
    <article className="gallery-elevation-composition-card">
      <h5>Interactive surface</h5>
      <p>
        Hover or focus the disclosure, then press it to see the shared
        interactive, hover, and pressed elevation states.
      </p>
      <Surface
        className="gallery-elevation-interactive"
        elevation="interactive"
      >
        <details className="gallery-elevation-disclosure">
          <summary>Review today’s practice</summary>
          <p>
            Interactive surfaces contain a real control, not a clickable panel.
          </p>
        </details>
      </Surface>
      <code>--ns-elevation-interactive → hover → pressed</code>
    </article>
  );
}

function OverlayComposition() {
  return (
    <article className="gallery-elevation-composition-card">
      <h5>Overlay composition</h5>
      <p>
        The scrim belongs to a modal backdrop; floating content uses a raised
        surface and overlay elevation.
      </p>
      <div
        className="gallery-elevation-overlay-stage"
        role="img"
        aria-label="Raised overlay content over a modal scrim"
      >
        <div aria-hidden="true" className="gallery-elevation-overlay-scrim" />
        <div className="gallery-elevation-overlay-content">
          <strong>Lesson details</strong>
          <span>12 vocabulary cards</span>
        </div>
      </div>
      <code>--ns-color-overlay-backdrop · --ns-elevation-overlay</code>
    </article>
  );
}

function ElevationTokenGrid() {
  return (
    <div className="gallery-elevation-token-grid">
      {elevationLevels.map(({ label, token }) => (
        <article className="gallery-elevation-token-card" key={token}>
          <div
            aria-hidden="true"
            className="gallery-elevation-token-swatch"
            style={{ boxShadow: `var(${token})` }}
          >
            <span aria-hidden="true">Aa</span>
          </div>
          <h6>{label}</h6>
          <code>{token}</code>
        </article>
      ))}
    </div>
  );
}

function ThemePreview({ theme }: { readonly theme: "light" | "dark" }) {
  const title = theme === "light" ? "Light theme" : "Dark theme";

  return (
    <section
      aria-label={title}
      className="gallery-elevation-theme"
      data-theme={theme}
    >
      <header className="gallery-elevation-theme-heading">
        <h4>{title}</h4>
        <p>
          Surface colors and elevation resolve from this theme’s shared tokens.
        </p>
      </header>
      <section aria-label="Semantic surface roles">
        <h5 className="gallery-elevation-section-title">
          Semantic surface roles
        </h5>
        <SemanticSurfaceGrid />
      </section>
      <section aria-label="Surface compositions">
        <h5 className="gallery-elevation-section-title">
          Surface compositions
        </h5>
        <div className="gallery-elevation-composition-grid">
          <SunkenComposition />
          <InteractiveComposition />
          <OverlayComposition />
        </div>
      </section>
      <section aria-label="Semantic elevation levels">
        <h5 className="gallery-elevation-section-title">
          Semantic elevation levels
        </h5>
        <ElevationTokenGrid />
      </section>
    </section>
  );
}

function ThemeComparison() {
  return (
    <div className="gallery-elevation-theme-grid">
      <ThemePreview theme="light" />
      <ThemePreview theme="dark" />
    </div>
  );
}

export function ElevationPage() {
  return (
    <GalleryDocumentationPage
      examples={<ThemeComparison />}
      eyebrow="Foundations / Surfaces and elevation"
      guidance={[
        {
          title: "Choose a surface by background intent",
          content: (
            <p>
              Use canvas for open page areas, default or subtle for ordinary
              content, and raised for content that must read above its parent.
              Color alone does not create structural elevation.
            </p>
          ),
        },
        {
          title: "Compose exceptional contexts from existing roles",
          content: (
            <p>
              Sunken areas use contextual layering, interactive states use the
              interactive elevation token, and overlays combine raised content
              with the appropriate elevation and optional modal scrim. No
              separate sunken, interactive, or overlay surface alias is defined.
            </p>
          ),
        },
      ]}
      id="surfaces-elevation"
      notes={[
        {
          title: "Elevation does not set layer order",
          content: (
            <p>
              Use <code>--ns-elevation-dialog</code> for blocking dialog content
              and <code>--ns-elevation-overlay</code> for floating content.
              Stacking order comes from the layer tokens, and only a modal
              dialog uses <code>--ns-color-overlay-backdrop</code>.
            </p>
          ),
        },
        {
          title: "Keep interactive feedback tactile",
          content: (
            <p>
              Interactive controls move from <code>interactive</code> to
              <code> hover</code> and <code> pressed</code>. Pair a pressed
              shadow with a small downward translation, and keep disabled
              controls flat and stationary.
            </p>
          ),
        },
      ]}
      summary="Compare semantic surface roles, contextual surface compositions, and the shared elevation scale in light and dark themes. Every preview reads the Design System tokens directly."
      title="Surfaces and elevation"
    />
  );
}
