import type { KanaAudioId } from "@opennihongo/core";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  createExerciseAudioCache,
  type ExerciseAudioCache,
} from "./audioCache";

type LoadedAudio = Readonly<{
  key: string;
  audioIds: ReadonlySet<KanaAudioId>;
}>;

const emptyAudioIds: ReadonlySet<KanaAudioId> = new Set();

export function useExerciseAudio(
  audioIds: readonly KanaAudioId[],
  exerciseKey: string,
  active: boolean,
) {
  const [loadedAudio, setLoadedAudio] = useState<LoadedAudio>();
  const cacheRef = useRef<ExerciseAudioCache | null>(null);
  const audioKey = `${exerciseKey}:${audioIds.join("\u0000")}`;

  useEffect(() => {
    if (!active || audioIds.length === 0) {
      cacheRef.current = null;
      return;
    }

    const cache = createExerciseAudioCache();
    cacheRef.current = cache;
    let current = true;

    void cache.preload(audioIds).then((availableAudioIds) => {
      if (current) {
        setLoadedAudio({ key: audioKey, audioIds: availableAudioIds });
      }
    });

    return () => {
      current = false;
      if (cacheRef.current === cache) {
        cacheRef.current = null;
      }
      cache.dispose();
    };
  }, [active, audioIds, audioKey]);

  const playAudio = useCallback((audioId: KanaAudioId) => {
    cacheRef.current?.play(audioId);
  }, []);

  const isReady =
    !active || audioIds.length === 0 || loadedAudio?.key === audioKey;

  return {
    isReady,
    loadedAudioIds:
      loadedAudio?.key === audioKey ? loadedAudio.audioIds : emptyAudioIds,
    playAudio,
  };
}
