import type { KanaPracticeMode } from "@opennihongo/content";
import { useSearch } from "@tanstack/react-router";
import { PracticeView } from "../../views/practice/PracticeView";

export function KanaPracticePage({ mode }: { mode: KanaPracticeMode }) {
  const { script, category } = useSearch({
    from:
      mode === "reading" ? "/practice/kana/reading" : "/practice/kana/matching",
  });
  return (
    <PracticeView
      category={category}
      key={`${mode}:${script}:${category}`}
      mode={mode}
      script={script}
    />
  );
}
