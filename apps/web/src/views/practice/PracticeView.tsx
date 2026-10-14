import { normalizeKanaAnswer } from "@opennihongo/core";
import { ExercisePracticeView } from "./interaction/ExercisePracticeView";
import {
  createKanaPracticeSession,
  type KanaPracticeOptions,
} from "./session/createKanaPracticeSession";

export function PracticeView({
  mode,
  onChangeOptions,
  ...search
}: Omit<KanaPracticeOptions, "revision"> & { onChangeOptions?: () => void }) {
  return (
    <ExercisePracticeView
      reading={mode === "reading"}
      difficulty={search.difficulty}
      fast={search.fast}
      search={search}
      createSession={(revision, sessionId) =>
        createKanaPracticeSession({ mode, ...search, revision }, sessionId)
      }
      normalizeAnswer={normalizeKanaAnswer}
      scriptLabel={
        search.scripts.length === 2
          ? "Kana"
          : search.scripts[0] === "hiragana"
            ? "Hiragana"
            : "Katakana"
      }
      onChangeOptions={onChangeOptions}
    />
  );
}
