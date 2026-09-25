import { GalleryDocumentationPage } from "../../layouts/GalleryDocumentationPage";
import { PatternsExamples } from "./PatternsExamples";

export function PatternsPage() {
  return (
    <GalleryDocumentationPage
      examples={<PatternsExamples />}
      eyebrow="Patterns / Catalog"
      guidance={[
        {
          title: "Keep values and actions caller-owned",
          content: (
            <p>
              Supply the displayed progress, reward data, labels, and actions
              from the owning feature. These compositions present that data;
              they do not decide completion, eligibility, progression, or
              persistence.
            </p>
          ),
        },
        {
          title: "Let content adapt to the viewport",
          content: (
            <p>
              The examples use a responsive grid that becomes a single column on
              narrow screens. Supply concise labels and values that can wrap
              without losing their meaning.
            </p>
          ),
        },
        {
          title: "Respect reduced motion",
          content: (
            <p>
              Celebration is opt-in on patterns that support it. Their motion
              follows the viewer&apos;s <code>prefers-reduced-motion</code>
              setting, while the supplied headings, values, rewards, and actions
              remain available.
            </p>
          ),
        },
      ]}
      id="patterns-catalog"
      notes={[
        {
          title: "Public import",
          content: (
            <p>
              Every example uses the public <code>@opennihongo/ui</code> entry.
              Feature-specific rules and state stay outside the Gallery and UI
              package.
            </p>
          ),
        },
      ]}
      practices={{
        doItems: [
          "Pass localized labels and representative caller-supplied data.",
          "Choose an action appropriate to the surrounding feature.",
        ],
        dontItems: [
          "Infer product rules from presentation values.",
          "Calculate, grant, or persist rewards in a reusable pattern.",
        ],
      }}
      summary="Browse reusable completion, achievement, progression, reward, and progress compositions. Each live example makes caller-provided content and actions visible without implementing product behavior."
      title="Patterns"
    />
  );
}
