import { useEffect, useRef, useState } from "react";
import { Text, type TextVariant } from "@opennihongo/ui";
import { GalleryDocumentationPage } from "../layouts/GalleryDocumentationPage";
import "./TypographyPage.css";

const typographyStyles: readonly {
  readonly variant: TextVariant;
  readonly label: string;
  readonly sample: string;
}[] = [
  {
    variant: "display",
    label: "Display",
    sample: "Make every lesson count.",
  },
  {
    variant: "heading",
    label: "Heading",
    sample: "Daily progress",
  },
  {
    variant: "body",
    label: "Body",
    sample:
      "Review kana, kanji, and vocabulary at a pace that helps each new idea settle.",
  },
  {
    variant: "label",
    label: "Label",
    sample: "TODAY'S STUDY GOAL",
  },
  {
    variant: "caption",
    label: "Caption",
    sample: "Updated a moment ago · 24 cards reviewed",
  },
];

interface TypographyMetrics {
  readonly size: string;
  readonly weight: string;
  readonly lineHeight: string;
}

function readMetric(element: HTMLElement, token: string) {
  return window.getComputedStyle(element).getPropertyValue(token).trim();
}

function TypographyStylePreview({
  variant,
  label,
  sample,
  theme,
}: {
  readonly variant: TextVariant;
  readonly label: string;
  readonly sample: string;
  readonly theme: "light" | "dark";
}) {
  const previewRef = useRef<HTMLElement>(null);
  const [metrics, setMetrics] = useState<TypographyMetrics>();
  const tokenPrefix = `--ns-text-${variant}`;

  useEffect(() => {
    const element = previewRef.current?.querySelector<HTMLElement>(
      `.ns-text-${variant}`,
    );
    if (!element) return;

    setMetrics({
      size: readMetric(element, `${tokenPrefix}-size`),
      weight: readMetric(element, `${tokenPrefix}-weight`),
      lineHeight: readMetric(element, `${tokenPrefix}-line-height`),
    });
  }, [tokenPrefix, variant]);

  const metricId = `typography-${theme}-${variant}`;

  return (
    <article
      aria-labelledby={`${metricId}-label`}
      className="gallery-typography-style"
      ref={previewRef}
    >
      <div className="gallery-typography-sample">
        <Text
          as="span"
          className="gallery-typography-style-label"
          id={`${metricId}-label`}
          variant="label"
        >
          {label}
        </Text>
        <Text as="p" variant={variant}>
          {sample}
        </Text>
      </div>
      <dl
        aria-label={`${label} typography tokens`}
        className="gallery-typography-metrics"
      >
        <div>
          <dt>Size</dt>
          <dd>
            <code>{tokenPrefix}-size</code>
            <span>{metrics?.size ?? "—"}</span>
          </dd>
        </div>
        <div>
          <dt>Weight</dt>
          <dd>
            <code>{tokenPrefix}-weight</code>
            <span>{metrics?.weight ?? "—"}</span>
          </dd>
        </div>
        <div>
          <dt>Line height</dt>
          <dd>
            <code>{tokenPrefix}-line-height</code>
            <span>{metrics?.lineHeight ?? "—"}</span>
          </dd>
        </div>
      </dl>
    </article>
  );
}

function ThemePreview({ theme }: { readonly theme: "light" | "dark" }) {
  const previewRef = useRef<HTMLElement>(null);
  const [fontFamily, setFontFamily] = useState("");
  const themeLabel = theme === "light" ? "Light theme" : "Dark theme";

  useEffect(() => {
    const element = previewRef.current?.querySelector<HTMLElement>(".ns-text");
    if (element) setFontFamily(window.getComputedStyle(element).fontFamily);
  }, []);

  return (
    <section
      aria-labelledby={`typography-${theme}-title`}
      className="gallery-typography-theme"
      data-theme={theme}
      ref={previewRef}
    >
      <header className="gallery-typography-theme-heading">
        <h3 id={`typography-${theme}-title`}>{themeLabel}</h3>
        <Text as="p" color="secondary" variant="caption">
          The same token-backed styles on this theme's text colors.
        </Text>
        <div className="gallery-typography-family">
          <Text as="span" variant="label">
            Font family
          </Text>
          <code>{fontFamily || "Loading computed font stack…"}</code>
        </div>
      </header>
      <div className="gallery-typography-styles">
        {typographyStyles.map((style) => (
          <TypographyStylePreview
            key={style.variant}
            {...style}
            theme={theme}
          />
        ))}
      </div>
    </section>
  );
}

function TypographyExamples() {
  return (
    <div className="gallery-typography-examples">
      <div className="gallery-typography-theme-grid">
        <ThemePreview theme="light" />
        <ThemePreview theme="dark" />
      </div>
      <p className="gallery-typography-source">
        Samples render through the public <code>Text</code> component from{" "}
        <code>@opennihongo/ui</code>. Size, weight, and line-height values are
        read from the active semantic CSS tokens.
      </p>
    </div>
  );
}

export function TypographyPage() {
  return (
    <GalleryDocumentationPage
      examples={<TypographyExamples />}
      eyebrow="Foundations / Typography"
      guidance={[
        {
          title: "Build a clear hierarchy",
          content: (
            <p>
              Use display for the page's main statement, heading for sections,
              body for reading, label for concise interface names, and caption
              for supporting details. Keep the content's heading outline
              meaningful with the <code>Text</code> component's <code>as</code>
              prop.
            </p>
          ),
        },
        {
          title: "Use the shared font stack",
          content: (
            <p>
              The Design System uses <code>--ns-font-sans</code>, backed by its
              primitive sans-serif stack. Let semantic styles set size, weight,
              and line height so examples and product UI stay consistent.
            </p>
          ),
        },
      ]}
      id="typography"
      notes={[
        {
          title: "Semantic variants",
          content: (
            <ul>
              {typographyStyles.map(({ variant }) => (
                <li key={variant}>
                  <code>Text variant="{variant}"</code> uses the matching{" "}
                  <code>--ns-text-{variant}-*</code> tokens.
                </li>
              ))}
            </ul>
          ),
        },
        {
          title: "Theme inspection",
          content: (
            <p>
              Each preview scopes the shared light or dark theme tokens. Compare
              the same samples in both panels to check their text contrast and
              hierarchy against the actual theme backgrounds.
            </p>
          ),
        },
      ]}
      practices={{
        doItems: [
          "Choose a variant by the content's role and keep heading levels in a logical order.",
          "Use body for paragraphs and reserve labels and captions for short supporting content.",
        ],
        dontItems: [
          "Create one-off font-size, weight, or line-height variants in a product or gallery page.",
          "Use display or heading styling on every element just to make it prominent.",
        ],
      }}
      summary="See the shared font family and five semantic text styles in representative interface content. Live token values and paired light and dark previews make the type hierarchy easy to inspect."
      title="Typography"
    />
  );
}
