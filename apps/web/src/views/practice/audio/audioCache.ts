import type { KanaAudioId } from "@opennihongo/core";
import { getAudioAsset } from "@opennihongo/audio-assets";

type AudioResource = Readonly<{
  audio: HTMLAudioElement;
  objectUrl: string;
}>;

export type ExerciseAudioCache = Readonly<{
  preload: (
    audioIds: readonly KanaAudioId[],
  ) => Promise<ReadonlySet<KanaAudioId>>;
  play: (audioId: KanaAudioId) => void;
  dispose: () => void;
}>;

type AudioCacheRuntime = Readonly<{
  getAudioAsset: (audioId: string) => string | undefined;
  fetchAudio: (url: string, signal: AbortSignal) => Promise<Response>;
  createAudioElement: () => HTMLAudioElement;
  createObjectUrl: (blob: Blob) => string;
  revokeObjectUrl: (url: string) => void;
}>;

const browserRuntime: AudioCacheRuntime = {
  getAudioAsset,
  fetchAudio: (url, signal) => globalThis.fetch(url, { signal }),
  createAudioElement: () => new Audio(),
  createObjectUrl: (blob) => URL.createObjectURL(blob),
  revokeObjectUrl: (url) => {
    URL.revokeObjectURL(url);
  },
};

function waitForPlayableAudio(
  audio: HTMLAudioElement,
  signal: AbortSignal,
): Promise<void> {
  return new Promise((resolve, reject) => {
    function cleanUp() {
      audio.removeEventListener("loadeddata", handleReady);
      audio.removeEventListener("canplay", handleReady);
      audio.removeEventListener("error", handleError);
      signal.removeEventListener("abort", handleAbort);
    }

    function handleReady() {
      cleanUp();
      resolve();
    }

    function handleError() {
      cleanUp();
      reject(new Error("The pronunciation audio could not be decoded."));
    }

    function handleAbort() {
      cleanUp();
      reject(new Error("The pronunciation audio preload was canceled."));
    }

    audio.addEventListener("loadeddata", handleReady);
    audio.addEventListener("canplay", handleReady);
    audio.addEventListener("error", handleError);
    signal.addEventListener("abort", handleAbort, { once: true });

    if (signal.aborted) {
      handleAbort();
    } else if (audio.readyState >= 2) {
      handleReady();
    } else {
      audio.load();
    }
  });
}

function releaseResource(
  resource: AudioResource,
  runtime: AudioCacheRuntime,
): void {
  resource.audio.pause();
  resource.audio.removeAttribute("src");
  resource.audio.load();
  runtime.revokeObjectUrl(resource.objectUrl);
}

export function createExerciseAudioCache(
  runtime: AudioCacheRuntime = browserRuntime,
): ExerciseAudioCache {
  const controller = new AbortController();
  const resources = new Map<KanaAudioId, AudioResource>();
  const pendingResources = new Set<AudioResource>();
  const lifecycle = { disposed: false };
  let preloadPromise: Promise<ReadonlySet<KanaAudioId>> | undefined;

  async function preloadAudio(audioId: KanaAudioId): Promise<void> {
    const url = runtime.getAudioAsset(audioId);
    if (!url) {
      return;
    }

    let resource: AudioResource | undefined;
    try {
      const response = await runtime.fetchAudio(url, controller.signal);
      if (!response.ok) {
        return;
      }

      const blob = await response.blob();
      resource = {
        audio: runtime.createAudioElement(),
        objectUrl: runtime.createObjectUrl(blob),
      };
      pendingResources.add(resource);
      resource.audio.preload = "auto";
      resource.audio.src = resource.objectUrl;
      await waitForPlayableAudio(resource.audio, controller.signal);
      if (!pendingResources.delete(resource)) {
        return;
      }

      resources.set(audioId, resource);
      resource = undefined;
    } catch {
      // Assets that are absent or unavailable do not get a playback control.
    } finally {
      if (resource && pendingResources.delete(resource)) {
        releaseResource(resource, runtime);
      }
    }
  }

  function preload(
    audioIds: readonly KanaAudioId[],
  ): Promise<ReadonlySet<KanaAudioId>> {
    if (lifecycle.disposed) {
      return Promise.resolve(new Set());
    }
    if (preloadPromise) {
      return preloadPromise;
    }

    preloadPromise = Promise.all([...new Set(audioIds)].map(preloadAudio)).then(
      () => new Set(resources.keys()),
    );
    return preloadPromise;
  }

  function play(audioId: KanaAudioId): void {
    const resource = resources.get(audioId);
    if (lifecycle.disposed || !resource) {
      return;
    }

    try {
      resource.audio.currentTime = 0;
      void resource.audio.play().catch(() => undefined);
    } catch {
      // A media element can become unavailable while the session is closing.
    }
  }

  function dispose(): void {
    if (lifecycle.disposed) {
      return;
    }
    lifecycle.disposed = true;
    controller.abort();
    for (const resource of resources.values()) {
      releaseResource(resource, runtime);
    }
    for (const resource of pendingResources) {
      releaseResource(resource, runtime);
    }
    resources.clear();
    pendingResources.clear();
  }

  return { preload, play, dispose };
}
