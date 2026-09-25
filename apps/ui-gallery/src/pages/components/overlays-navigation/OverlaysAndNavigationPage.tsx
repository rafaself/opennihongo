import { GalleryDocumentationPage } from "../../../layouts/GalleryDocumentationPage";
import { OverlaysAndNavigationExamples } from "./OverlaysAndNavigationExamples";

export function OverlaysAndNavigationPage() {
  return (
    <GalleryDocumentationPage
      examples={<OverlaysAndNavigationExamples />}
      eyebrow="Components / Overlays & Navigation"
      guidance={[
        {
          title: "Keep tooltip content supplemental",
          content: (
            <p>
              Tooltip describes a focusable control with brief plain text. It
              appears on hover or keyboard focus and closes with Escape. Keep
              required instructions and interactive content outside a tooltip.
            </p>
          ),
        },
        {
          title: "Choose the overlay that fits the task",
          content: (
            <p>
              Popover is a non-modal surface for a small interactive task;
              Dialog is modal, contains focus, and needs an accessible title and
              a clear close or recovery action. Both return focus when dismissed
              with Escape.
            </p>
          ),
        },
        {
          title: "Keep navigation local to its content",
          content: (
            <p>
              Tabs switch related panels without changing routes. Give the tab
              list an accessible label; arrow keys move between tabs, while Tab
              moves into the active panel.
            </p>
          ),
        },
        {
          title: "Treat toast as transient feedback",
          content: (
            <p>
              Toast announces brief feedback without taking focus. The sample
              uses an explicit close control and an infinite preview duration so
              its dismissal behavior can be explored at the reader’s pace.
            </p>
          ),
        },
      ]}
      id="overlays-and-navigation"
      notes={[
        {
          title: "Public component API",
          content: (
            <p>
              Examples use only the supported <code>@opennihongo/ui</code>
              exports. Triggers, sample text, toast duration, and dialog actions
              are supplied by this consumer page; the Gallery adds no product
              routing, notification policy, or business state.
            </p>
          ),
        },
        {
          title: "Theme and motion contracts",
          content: (
            <p>
              Theme is scoped with the shared <code>data-theme</code> attribute
              on both the examples and their stable portal host, so portaled
              content receives the same semantic tokens. The motion control
              exercises the shared <code>data-motion="reduced"</code> contract
              and restores the previous document setting when you leave this
              page; system reduced-motion preferences are also honored.
            </p>
          ),
        },
      ]}
      practices={{
        doItems: [
          "Use a Dialog for modal decisions and return focus to its trigger after dismissal.",
          "Keep toast content short and provide an accessible way to dismiss persistent feedback.",
        ],
        dontItems: [
          "Put required instructions or controls inside a tooltip.",
          "Use tabs to navigate to another route or as a substitute for page navigation.",
        ],
      }}
      summary="Live examples of shared overlays and local navigation, with their keyboard, focus, dismissal, theme, and reduced-motion behavior available for inspection."
      title="Overlays & Navigation"
    />
  );
}
