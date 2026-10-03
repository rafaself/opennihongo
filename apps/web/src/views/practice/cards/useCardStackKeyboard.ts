import { useEffect } from "react";

export function useCardStackKeyboard({
  active,
  revealed,
  onReveal,
  onRate,
}: {
  active: boolean;
  revealed: boolean;
  onReveal: () => void;
  onRate: (remembered: boolean) => void;
}) {
  useEffect(() => {
    if (!active) return;
    function handleKey(event: KeyboardEvent) {
      if (
        event.repeat ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey ||
        event.isComposing ||
        event.defaultPrevented
      )
        return;
      const target = event.target;
      if (
        target instanceof HTMLElement &&
        (target.isContentEditable ||
          target.closest(
            "input, textarea, select, a[href], [contenteditable='true']",
          ))
      )
        return;
      if (revealed && (event.key === "1" || event.key === "2")) {
        event.preventDefault();
        onRate(event.key === "2");
      } else if (!revealed && (event.key === " " || event.key === "Enter")) {
        // Focused buttons keep native activation, including pronunciation and Skip.
        if (target instanceof HTMLElement && target.closest("button")) return;
        event.preventDefault();
        onReveal();
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => {
      window.removeEventListener("keydown", handleKey);
    };
  }, [active, revealed, onReveal, onRate]);
}
