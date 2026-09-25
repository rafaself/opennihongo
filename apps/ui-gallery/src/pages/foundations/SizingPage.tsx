import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Button, Stack } from "@opennihongo/ui";
import { GalleryDocumentationPage } from "../../layouts/GalleryDocumentationPage";
import "./SizingPage.css";

type SizeAppearance = "square" | "control-height" | "track";

interface GalleryToken {
  readonly name: string;
  readonly appearance?: SizeAppearance;
}

interface TokenGroup {
  readonly title: string;
  readonly description: string;
  readonly tokens: readonly GalleryToken[];
}

const sizeGroups: readonly TokenGroup[] = [
  {
    title: "Primitive sizes",
    description: "Intrinsic measurements used by shared semantic aliases.",
    tokens: ["8", "16", "20", "24", "40", "44", "48"].map((size) => ({
      name: `--ns-primitive-size-${size}`,
    })),
  },
  {
    title: "Control and pointer targets",
    description: "Shared control heights and pointer-target guidance.",
    tokens: [
      {
        name: "--ns-size-control-height-compact",
        appearance: "control-height",
      },
      {
        name: "--ns-size-control-height-standard",
        appearance: "control-height",
      },
      {
        name: "--ns-size-control-height-comfortable",
        appearance: "control-height",
      },
      { name: "--ns-size-pointer-target-minimum" },
      { name: "--ns-size-pointer-target-comfortable" },
    ],
  },
  {
    title: "Indicators and avatars",
    description: "Reusable dimensions for progress, loading, and identity UI.",
    tokens: [
      { name: "--ns-size-progress-track", appearance: "track" },
      { name: "--ns-size-progress-ring-small" },
      { name: "--ns-size-progress-ring-medium" },
      { name: "--ns-size-progress-ring-large" },
      { name: "--ns-size-spinner-small" },
      { name: "--ns-size-spinner-medium" },
      { name: "--ns-size-spinner-large" },
      { name: "--ns-size-avatar-small" },
      { name: "--ns-size-avatar-medium" },
      { name: "--ns-size-avatar-large" },
      { name: "--ns-size-icon-box-small" },
      { name: "--ns-size-icon-box-medium" },
      { name: "--ns-size-icon-box-large" },
    ],
  },
];

const radiusGroups: readonly TokenGroup[] = [
  {
    title: "Primitive radii",
    description: "The underlying corner values, including the full radius.",
    tokens: ["0", "1", "2", "3", "4", "full"].map((step) => ({
      name: `--ns-primitive-radius-${step}`,
    })),
  },
  {
    title: "Shared radius aliases",
    description: "Role-neutral aliases and common control and card shapes.",
    tokens: ["none", "sm", "md", "lg", "xl", "pill", "control", "card"].map(
      (step) => ({ name: `--ns-radius-${step}` }),
    ),
  },
];

const borderTokens = [
  "--ns-primitive-border-width-1",
  "--ns-primitive-border-width-2",
  "--ns-primitive-border-width-3",
  "--ns-border-width-subtle",
  "--ns-border-width-standard",
  "--ns-border-width-emphasis",
  "--ns-border-width-focus",
] as const;

function SizeTokenRow({ token }: { readonly token: GalleryToken }) {
  const sampleRef = useRef<HTMLSpanElement>(null);
  const [dimensions, setDimensions] = useState("");
  const appearance = token.appearance ?? "square";
  const sampleStyle: CSSProperties =
    appearance === "control-height"
      ? { blockSize: `var(${token.name})` }
      : appearance === "track"
        ? { blockSize: `var(${token.name})` }
        : { blockSize: `var(${token.name})`, inlineSize: `var(${token.name})` };

  useEffect(() => {
    const sample = sampleRef.current;
    if (sample) {
      const { height, width } = window.getComputedStyle(sample);
      setDimensions(`${width} × ${height}`);
    }
  }, []);

  return (
    <li className="gallery-sizing-token-row">
      <code>{token.name}</code>
      <span
        aria-hidden="true"
        className={`gallery-sizing-sample gallery-sizing-sample--${appearance}`}
        ref={sampleRef}
        style={sampleStyle}
      />
      <span className="gallery-sizing-value">{dimensions || "—"}</span>
    </li>
  );
}

function RadiusTokenRow({ token }: { readonly token: GalleryToken }) {
  const sampleRef = useRef<HTMLSpanElement>(null);
  const [radius, setRadius] = useState("");

  useEffect(() => {
    const sample = sampleRef.current;
    if (sample) {
      setRadius(window.getComputedStyle(sample).borderTopLeftRadius);
    }
  }, []);

  return (
    <li className="gallery-geometry-token-row">
      <code>{token.name}</code>
      <span
        aria-hidden="true"
        className="gallery-radius-sample"
        ref={sampleRef}
        style={{ borderRadius: `var(${token.name})` }}
      />
      <span className="gallery-sizing-value">{radius || "—"}</span>
    </li>
  );
}

function BorderTokenRow({ token }: { readonly token: string }) {
  const sampleRef = useRef<HTMLSpanElement>(null);
  const [width, setWidth] = useState("");

  useEffect(() => {
    const sample = sampleRef.current;
    if (sample) {
      setWidth(window.getComputedStyle(sample).borderTopWidth);
    }
  }, []);

  return (
    <li className="gallery-geometry-token-row">
      <code>{token}</code>
      <span
        aria-hidden="true"
        className="gallery-border-sample"
        ref={sampleRef}
        style={{
          borderStyle: "var(--ns-border-style-solid)",
          borderWidth: `var(${token})`,
        }}
      />
      <span className="gallery-sizing-value">{width || "—"}</span>
    </li>
  );
}

function BorderStyleNote() {
  const sampleRef = useRef<HTMLSpanElement>(null);
  const [style, setStyle] = useState("");

  useEffect(() => {
    const sample = sampleRef.current;
    if (sample) setStyle(window.getComputedStyle(sample).borderTopStyle);
  }, []);

  return (
    <p className="gallery-border-style-note">
      Shared style: <code>--ns-border-style-solid</code> — resolved as{" "}
      <span
        ref={sampleRef}
        style={{ borderStyle: "var(--ns-border-style-solid)" }}
      >
        {style || "—"}
      </span>
    </p>
  );
}

function TokenGroupSection({
  group,
  kind,
}: {
  readonly group: TokenGroup;
  readonly kind: "size" | "radius";
}) {
  const headingId = `${kind}-${group.title.toLowerCase().replaceAll(" ", "-")}`;

  return (
    <section aria-labelledby={headingId} className="gallery-geometry-group">
      <header className="gallery-geometry-group-heading">
        <h4 id={headingId}>{group.title}</h4>
        <p>{group.description}</p>
      </header>
      <ul className="gallery-geometry-token-list">
        {group.tokens.map((token) =>
          kind === "size" ? (
            <SizeTokenRow key={token.name} token={token} />
          ) : (
            <RadiusTokenRow key={token.name} token={token} />
          ),
        )}
      </ul>
    </section>
  );
}

function SizingExamples() {
  return (
    <Stack className="gallery-sizing-examples" gap="6">
      <section aria-labelledby="sizing-tokens-title">
        <header className="gallery-geometry-section-heading">
          <h3 id="sizing-tokens-title">Sizing tokens</h3>
          <p>
            Each sample uses the named token. Resolved dimensions are read from
            the browser after the public stylesheet is applied.
          </p>
        </header>
        <div className="gallery-geometry-groups">
          {sizeGroups.map((group) => (
            <TokenGroupSection group={group} key={group.title} kind="size" />
          ))}
        </div>
      </section>

      <section aria-labelledby="radius-tokens-title">
        <header className="gallery-geometry-section-heading">
          <h3 id="radius-tokens-title">Radius and shape</h3>
          <p>
            Compare corner treatments on token-sized samples, including pill and
            fully rounded shapes.
          </p>
        </header>
        <div className="gallery-geometry-groups">
          {radiusGroups.map((group) => (
            <TokenGroupSection group={group} key={group.title} kind="radius" />
          ))}
        </div>
        <div
          aria-label="Full and pill shape examples"
          className="gallery-shape-examples"
        >
          <span className="gallery-pill-shape">Pill shape</span>
          <span
            aria-label="Circular full shape"
            className="gallery-full-shape"
            role="img"
          />
        </div>
      </section>

      <section aria-labelledby="border-tokens-title">
        <header className="gallery-geometry-section-heading">
          <h3 id="border-tokens-title">Border treatments</h3>
          <p>
            Border samples share a solid style and semantic color; only the
            selected token changes the width.
          </p>
        </header>
        <ul className="gallery-geometry-token-list">
          {borderTokens.map((token) => (
            <BorderTokenRow key={token} token={token} />
          ))}
        </ul>
        <BorderStyleNote />
      </section>

      <section aria-labelledby="control-geometry-title">
        <header className="gallery-geometry-section-heading">
          <h3 id="control-geometry-title">Control and touch targets</h3>
          <p>
            These controls render through the public component API, so their
            geometry stays owned by the component and shared tokens.
          </p>
        </header>
        <div className="gallery-control-samples">
          <Button size="compact" variant="secondary">
            Compact
          </Button>
          <Button size="standard">Standard</Button>
          <Button size="comfortable" variant="secondary">
            Comfortable
          </Button>
        </div>
        <p className="gallery-touch-guidance">
          Pointer-target aliases identify a minimum target and a more
          comfortable target. Prefer{" "}
          <code>--ns-size-pointer-target-comfortable</code> for primary touch
          actions when layout allows, and don’t shrink below{" "}
          <code>--ns-size-pointer-target-minimum</code>.
        </p>
      </section>
    </Stack>
  );
}

export function SizingPage() {
  return (
    <GalleryDocumentationPage
      examples={<SizingExamples />}
      eyebrow="Foundations / Sizing, radius, and borders"
      guidance={[
        {
          title: "Use shared dimensions",
          content: (
            <p>
              Choose a supported size token for controls, pointer targets,
              indicators, and avatars. Component APIs remain responsible for
              applying their own sizing contracts.
            </p>
          ),
        },
        {
          title: "Match shape and border emphasis",
          content: (
            <p>
              Use radius aliases for recurring geometry and border-width aliases
              to communicate emphasis. Keep color choices in semantic color
              tokens rather than inventing geometry-specific colors.
            </p>
          ),
        },
      ]}
      id="sizing"
      notes={[
        {
          title: "Token layers",
          content: (
            <p>
              Primitive dimensions live in <code>--ns-primitive-size-*</code>,
              <code> --ns-primitive-radius-*</code>, and
              <code> --ns-primitive-border-width-*</code>. Public aliases live
              in <code>--ns-size-*</code>, <code>--ns-radius-*</code>, and
              <code>--ns-border-*</code> in the shared stylesheet.
            </p>
          ),
        },
        {
          title: "Avoid duplicate measurements",
          content: (
            <p>
              Reuse a supported token when its value matches the intended
              geometry. Don’t introduce a one-off dimension or override a
              component-specific size from a documentation page.
            </p>
          ),
        },
      ]}
      practices={{
        doItems: [
          "Use the comfortable pointer target token when the interaction and available space support it.",
          "Use full radius for circular shapes and pill radius for capsule-shaped controls.",
        ],
        dontItems: [
          "Redefine Button or other component sizing in the Gallery.",
          "Use arbitrary radii or border widths when a shared token expresses the intent.",
        ],
      }}
      summary="Browse supported sizing, radius, and border tokens with live samples that resolve from the public Design System stylesheet."
      title="Sizing, radius, and borders"
    />
  );
}
