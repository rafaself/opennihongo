import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { DialogExample } from "./DialogExample";
import { PopoverExample } from "./PopoverExample";
import { TabsExample } from "./TabsExample";
import { ToastExample } from "./ToastExample";
import { TooltipExample } from "./TooltipExample";

const themes = [
  { value: "light", label: "Light theme" },
  { value: "dark", label: "Dark theme" },
] as const;

type Theme = (typeof themes)[number]["value"];
type MotionMode = "system" | "reduced";

function setMotionMode(mode: MotionMode | null) {
  if (mode === "reduced") {
    document.documentElement.setAttribute("data-motion", "reduced");
  } else {
    document.documentElement.removeAttribute("data-motion");
  }
}

export function OverlaysAndNavigationExamples() {
  const [theme, setTheme] = useState<Theme>("light");
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
      <fieldset>
        <legend>Preview theme</legend>
        {themes.map(({ value, label }) => (
          <label key={value}>
            <input
              checked={theme === value}
              name="overlays-navigation-theme"
              onChange={() => {
                setTheme(value);
              }}
              type="radio"
              value={value}
            />
            {label}
          </label>
        ))}
      </fieldset>
      <fieldset>
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
      <div className="gallery-doc-example-grid" data-theme={theme}>
        <TooltipExample portalContainer={portalContainer} />
        <PopoverExample portalContainer={portalContainer} />
        <DialogExample portalContainer={portalContainer} />
        <TabsExample />
        <ToastExample portalContainer={portalContainer} />
      </div>
      <div
        className="gallery-overlay-portal-host"
        data-theme={theme}
        ref={capturePortalContainer}
      />
    </>
  );
}
