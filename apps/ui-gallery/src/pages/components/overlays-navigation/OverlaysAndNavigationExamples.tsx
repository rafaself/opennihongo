import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { DialogExample } from "./DialogExample";
import { PopoverExample } from "./PopoverExample";
import { TabsExample } from "./TabsExample";
import { ToastExample } from "./ToastExample";
import { TooltipExample } from "./TooltipExample";

type MotionMode = "system" | "reduced";

function setMotionMode(mode: MotionMode | null) {
  if (mode === "reduced") {
    document.documentElement.setAttribute("data-motion", "reduced");
  } else {
    document.documentElement.removeAttribute("data-motion");
  }
}

export function OverlaysAndNavigationExamples() {
  const [motionMode, setMotionModeState] = useState<MotionMode>("system");
  const [portalContainer, setPortalContainer] = useState<
    HTMLElement | undefined
  >();
  const originalMotionMode = useRef<string | null>(null);
  const capturePortalContainer = useCallback((node: HTMLDivElement | null) => {
    setPortalContainer(node ?? undefined);
  }, []);

  useLayoutEffect(() => {
    originalMotionMode.current =
      document.documentElement.getAttribute("data-motion");

    return () => {
      const originalMode = originalMotionMode.current;
      if (originalMode === null) {
        document.documentElement.removeAttribute("data-motion");
      } else {
        document.documentElement.setAttribute("data-motion", originalMode);
      }
      originalMotionMode.current = null;
    };
  }, []);

  useLayoutEffect(() => {
    setMotionMode(motionMode);
  }, [motionMode]);

  return (
    <>
      <fieldset className="gallery-preview-controls">
        <legend>Preview motion</legend>
        {(
          [
            ["system", "System preference"],
            ["reduced", "Reduced motion"],
          ] as const
        ).map(([value, label]) => (
          <label key={value}>
            <input
              checked={motionMode === value}
              name="overlays-navigation-motion"
              onChange={() => {
                setMotionModeState(value);
              }}
              type="radio"
              value={value}
            />
            {label}
          </label>
        ))}
      </fieldset>
      <div className="gallery-doc-example-grid">
        <TooltipExample portalContainer={portalContainer} />
        <PopoverExample portalContainer={portalContainer} />
        <DialogExample portalContainer={portalContainer} />
        <TabsExample />
        <ToastExample portalContainer={portalContainer} />
      </div>
      <div
        className="gallery-overlay-portal-host"
        ref={capturePortalContainer}
      />
    </>
  );
}
