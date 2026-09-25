import { GalleryDocumentationPage } from "../../layouts/GalleryDocumentationPage";
import { ActionsAndFormsExamples } from "./ActionsAndFormsExamples";

export function ActionsAndFormsPage() {
  return (
    <GalleryDocumentationPage
      examples={<ActionsAndFormsExamples />}
      eyebrow="Components / Actions & Forms"
      guidance={[
        {
          title: "Name controls and connect descriptions",
          content: (
            <p>
              Give every control a caller-owned accessible name. Use FormField
              to connect labels, descriptions, required state, and errors to
              compatible inputs and triggers.
            </p>
          ),
        },
        {
          title: "Keep action behavior with the caller",
          content: (
            <p>
              Buttons and icon buttons perform only the actions supplied by
              their owner. Choose a clear text label for buttons and a concise
              <code> aria-label</code> for icon-only actions.
            </p>
          ),
        },
        {
          title: "Support keyboard selection",
          content: (
            <p>
              Tab to a radio group and use the arrow keys to move between
              choices. Focus the Select trigger and press Arrow Down to open its
              options; use the arrow keys and Enter to choose, or Escape to
              close.
            </p>
          ),
        },
      ]}
      id="actions-and-forms"
      notes={[
        {
          title: "Public import",
          content: (
            <p>
              Examples use the supported <code>@opennihongo/ui</code> package
              exports. Import only the controls used by your view.
            </p>
          ),
        },
        {
          title: "Theme and state",
          content: (
            <p>
              Control colors, borders, focus, and disabled or invalid states
              come from the shared semantic tokens. The Gallery supplies the
              examples and layout, not alternate control styles or application
              rules.
            </p>
          ),
        },
      ]}
      practices={{
        doItems: [
          "Describe the action or setting in its accessible label.",
          "Keep errors and helper text associated with their control.",
        ],
        dontItems: [
          "Rely on placeholder text as the only label.",
          "Add application validation or business rules to shared controls.",
        ],
      }}
      summary="Live examples of shared action and form controls, using the public UI package and caller-provided labels, state, and behavior."
      title="Actions & Forms"
    />
  );
}
