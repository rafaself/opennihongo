import { Button } from "@opennihongo/ui";
import { GalleryDocumentationPage } from "../layouts/GalleryDocumentationPage";

const buttonExamples = (
  <div className="gallery-doc-example-grid">
    <article className="gallery-doc-example-card">
      <h3>Primary action</h3>
      <p>Use for the main action in a view.</p>
      <div className="gallery-doc-example-stage">
        <Button>Continue lesson</Button>
      </div>
    </article>
    <article className="gallery-doc-example-card">
      <h3>Supporting action</h3>
      <p>Use when another action is available.</p>
      <div className="gallery-doc-example-stage">
        <Button variant="secondary">View details</Button>
      </div>
    </article>
    <article className="gallery-doc-example-card">
      <h3>Unavailable action</h3>
      <p>Disabled buttons explain that an action is not yet available.</p>
      <div className="gallery-doc-example-stage">
        <Button disabled>Complete previous step</Button>
      </div>
    </article>
  </div>
);

export function ButtonsPage() {
  return (
    <GalleryDocumentationPage
      examples={buttonExamples}
      eyebrow="Components / Buttons"
      guidance={[
        {
          title: "Choose a variant by priority",
          content: (
            <p>
              Give the most important action the primary treatment. Use the
              secondary variant for a supporting choice.
            </p>
          ),
        },
        {
          title: "Keep action labels clear",
          content: (
            <p>
              Use concise labels that describe the action and preserve the
              button’s built-in focus and disabled behavior.
            </p>
          ),
        },
      ]}
      id="buttons"
      notes={[
        {
          title: "Import",
          content: (
            <p>
              <code>@opennihongo/ui</code>
            </p>
          ),
        },
        {
          title: "API",
          content: (
            <ul>
              <li>
                <code>variant</code> accepts <code>primary</code> or{" "}
                <code>secondary</code>.
              </li>
              <li>
                Use <code>disabled</code> when the action cannot be taken.
              </li>
            </ul>
          ),
        },
      ]}
      practices={{
        doItems: [
          "Use one primary action when a view has a clear next step.",
          "Write action labels with a verb and a clear outcome.",
        ],
        dontItems: [
          "Use multiple primary buttons for equally weighted actions.",
          "Use a disabled state without explaining what is needed first.",
        ],
      }}
      summary="Buttons give learners clear, accessible actions. This page shows their live variants alongside usage guidance and the public API."
      title="Buttons"
    />
  );
}
