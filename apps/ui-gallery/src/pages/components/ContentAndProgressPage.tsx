import { GalleryDocumentationPage } from "../../layouts/GalleryDocumentationPage";
import { ContentAndProgressExamples } from "./ContentAndProgressExamples";

export function ContentAndProgressPage() {
  return (
    <GalleryDocumentationPage
      examples={<ContentAndProgressExamples />}
      eyebrow="Components / Content & Progress"
      guidance={[
        {
          title: "Keep content containers static",
          content: (
            <p>
              Card groups related content and remains non-interactive. Use a
              semantic element and label a section when its name helps orient
              readers. Badge is a concise status or category label; use a
              control when the user needs to act or change a choice.
            </p>
          ),
        },
        {
          title: "Give indicators accessible context",
          content: (
            <p>
              Progress and ProgressRing require an accessible name and expose
              their determinate value to assistive technology. Keep visible
              context nearby when it helps explain what is being measured.
              Avatar uses <code>alt</code> for identity, while Divider is a
              semantic separator unless it is purely decorative.
            </p>
          ),
        },
        {
          title: "Match the loading pattern to the work",
          content: (
            <p>
              Use Progress or ProgressRing when the current value is known;
              Spinner communicates indeterminate work and needs visible status
              text. Skeleton reserves a known content shape and stays hidden
              from assistive technology, so put <code>aria-busy</code> and a
              status message on the loading region.
            </p>
          ),
        },
      ]}
      id="content-and-progress"
      notes={[
        {
          title: "Public imports",
          content: (
            <p>
              The examples consume the documented components from{" "}
              <code>@opennihongo/ui</code>. Values and labels come from the
              caller; the Gallery does not add product rules or component
              styling.
            </p>
          ),
        },
        {
          title: "Theme behavior",
          content: (
            <p>
              Switch the preview between light and dark to see the shared
              <code> data-theme</code> contract in action. Components resolve
              the same semantic tokens used by application consumers.
            </p>
          ),
        },
      ]}
      practices={{
        doItems: [
          "Choose determinate progress only when a meaningful value is available.",
          "Keep loading announcements on the region that is busy.",
        ],
        dontItems: [
          "Make static cards or badges behave like interactive controls.",
          "Use a spinner as the only indication that work is in progress.",
        ],
      }}
      summary="Representative examples of shared content containers, status displays, progress indicators, and loading placeholders from the public UI package."
      title="Content & Progress"
    />
  );
}
