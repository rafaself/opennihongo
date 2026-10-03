import { Button } from "@opennihongo/ui";
import type { useLearningRecorder } from "./useLearningRecorder";

export function LearningSaveStatus({
  recorder,
}: {
  recorder: ReturnType<typeof useLearningRecorder>;
}) {
  if (recorder.failedCount === 0) return null;
  return (
    <div className="practice-session__save-status">
      <p role="alert">
        Your answer could not be saved. You can still finish this session.
      </p>
      <Button
        variant="secondary"
        loading={recorder.saving}
        loadingAnnouncement="Retrying local save"
        onClick={() => {
          void recorder.retry();
        }}
      >
        Retry saving
      </Button>
    </div>
  );
}
