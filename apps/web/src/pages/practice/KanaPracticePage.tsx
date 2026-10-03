import type { KanaPracticeMode } from "@opennihongo/content";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { PracticeView } from "../../views/practice/PracticeView";

export function KanaPracticePage({ mode }: { mode: KanaPracticeMode }) {
  const from =
    mode === "reading"
      ? "/practice/kana/reading"
      : mode === "matching"
        ? "/practice/kana/matching"
        : "/practice/kana/quiz";
  const search = useSearch({ from });
  const navigate = useNavigate();
  return (
    <PracticeView
      {...search}
      key={`${mode}:${JSON.stringify(search)}`}
      mode={mode}
      onChangeOptions={() => {
        void navigate({
          to: "/practice/kana/$game/setup",
          params: { game: mode },
          search,
        });
      }}
    />
  );
}
