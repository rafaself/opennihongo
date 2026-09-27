import type { KanaAudioId } from "@opennihongo/core";
import { Button } from "@opennihongo/ui";
import { playJapanesePronunciation } from "../../lib/pronunciation";

function SpeakerIcon() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="22"
      viewBox="0 0 24 24"
      width="22"
    >
      <path
        d="M4 10v4h4l5 4V6l-5 4H4Z"
        fill="currentColor"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <path
        d="M16 9a5 5 0 0 1 0 6m2-8a8 8 0 0 1 0 10"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

type PronunciationButtonProps = Readonly<{
  audioId?: KanaAudioId | undefined;
  text: string;
  onPlay: (audioId: KanaAudioId) => void;
}>;

export function PronunciationButton({
  audioId,
  text,
  onPlay,
}: PronunciationButtonProps) {
  return (
    <Button
      aria-label={`Play pronunciation for ${text}`}
      className="practice-session__audio"
      onClick={() => {
        if (audioId) {
          onPlay(audioId);
        } else {
          playJapanesePronunciation(text);
        }
      }}
      variant="secondary"
    >
      <SpeakerIcon />
    </Button>
  );
}
