let activeAudio: HTMLAudioElement | undefined;

function stopActiveAudio(): void {
  activeAudio?.pause();
  activeAudio = undefined;
}

export function playJapanesePronunciation(text: string): void {
  stopActiveAudio();
  if (
    typeof window === "undefined" ||
    typeof window.speechSynthesis === "undefined" ||
    typeof SpeechSynthesisUtterance === "undefined"
  ) {
    return;
  }

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "ja-JP";
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}

export function playJapaneseAudioAsset(source: string): boolean {
  if (typeof window === "undefined" || typeof Audio === "undefined") {
    return false;
  }

  window.speechSynthesis.cancel();
  stopActiveAudio();

  const audio = new Audio(source);
  activeAudio = audio;
  audio.addEventListener(
    "ended",
    () => {
      if (activeAudio === audio) {
        activeAudio = undefined;
      }
    },
    { once: true },
  );
  void audio.play().catch(() => {
    if (activeAudio === audio) {
      activeAudio = undefined;
    }
  });
  return true;
}
