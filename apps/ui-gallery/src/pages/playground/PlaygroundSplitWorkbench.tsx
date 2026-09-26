import type { ReactNode } from "react";
import "./PlaygroundSplitWorkbench.css";

type PreviewLayout = "centered" | "stacked";

interface PlaygroundSplitWorkbenchProps {
  readonly controls: ReactNode;
  readonly preview: ReactNode;
  readonly previewLabel: string;
  readonly previewLayout?: PreviewLayout;
}

export function PlaygroundSplitWorkbench({
  controls,
  preview,
  previewLabel,
  previewLayout = "centered",
}: PlaygroundSplitWorkbenchProps) {
  return (
    <div className="gallery-playground-split-workbench">
      <div className="gallery-playground-split-workbench-controls">
        {controls}
      </div>
      <div
        aria-label={previewLabel}
        className="gallery-playground-split-workbench-preview"
        data-layout={previewLayout}
        role="group"
      >
        {preview}
      </div>
    </div>
  );
}
