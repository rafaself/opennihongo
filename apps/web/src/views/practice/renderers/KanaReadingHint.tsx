import { Button } from "@opennihongo/ui";
import { useState } from "react";

export function KanaReadingHint({
  reading,
  disabled,
  onRequested,
}: {
  reading: string;
  disabled: boolean;
  onRequested: () => void;
}) {
  const [requested, setRequested] = useState(false);
  return requested ? (
    <p className="practice-session__hint" role="status">
      Hint: {reading.slice(0, 1)}
      {"·".repeat(Math.max(0, reading.length - 1))} ({reading.length}{" "}
      {reading.length === 1 ? "letter" : "letters"})
    </p>
  ) : (
    <Button
      variant="secondary"
      disabled={disabled}
      onClick={() => {
        setRequested(true);
        onRequested();
      }}
    >
      Show hint
    </Button>
  );
}
