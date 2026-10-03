import { useEffect } from "react";

const navigationKeys = new Set([
  "Tab",
  "ArrowLeft",
  "ArrowRight",
  "ArrowUp",
  "ArrowDown",
]);

export function useFocusNavigation() {
  useEffect(() => {
    const root = document.documentElement;
    const attribute = "data-focus-navigation";
    const previous = root.getAttribute(attribute);
    root.setAttribute(attribute, "false");

    function handleKeyDown(event: KeyboardEvent) {
      if (event.altKey || event.ctrlKey || event.metaKey || event.isComposing)
        return;
      root.setAttribute(attribute, String(navigationKeys.has(event.key)));
    }

    function handlePointerDown() {
      root.setAttribute(attribute, "false");
    }

    document.addEventListener("keydown", handleKeyDown, true);
    document.addEventListener("pointerdown", handlePointerDown, true);
    return () => {
      document.removeEventListener("keydown", handleKeyDown, true);
      document.removeEventListener("pointerdown", handlePointerDown, true);
      if (previous === null) root.removeAttribute(attribute);
      else root.setAttribute(attribute, previous);
    };
  }, []);
}
