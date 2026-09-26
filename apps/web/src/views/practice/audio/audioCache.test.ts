import { afterEach, describe, expect, it, vi } from "vitest";
import { createExerciseAudioCache } from "./audioCache";

const getAudioAssetMock = vi.hoisted(() =>
  vi.fn((audioId: string) =>
    audioId === "kana.word.soto" ? "/audio/soto.opus" : undefined,
  ),
);

vi.mock("@opennihongo/audio-assets", () => ({
  getAudioAsset: getAudioAssetMock,
}));

class FakeAudio extends EventTarget {
  currentTime = 0;
  preload = "";
  readyState = 0;
  src = "";
  readonly load = vi.fn();
  readonly pause = vi.fn();
  readonly play = vi.fn(() => Promise.resolve());
  readonly removeAttribute = vi.fn((name: string) => {
    if (name === "src") {
      this.src = "";
    }
  });
}

function createRuntime(audio: FakeAudio) {
  const fetchAudio = vi.fn(() =>
    Promise.resolve(new Response(new Blob(["opus"]))),
  );
  const createObjectUrl = vi.fn(() => "blob:practice-audio");
  const revokeObjectUrl = vi.fn();
  const cache = createExerciseAudioCache({
    getAudioAsset: (audioId) =>
      audioId === "kana.word.soto" ? "/audio/soto.opus" : undefined,
    fetchAudio,
    createAudioElement: () => audio as unknown as HTMLAudioElement,
    createObjectUrl,
    revokeObjectUrl,
  });

  return { cache, fetchAudio, createObjectUrl, revokeObjectUrl };
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe("exercise audio cache", () => {
  it("waits for active assets before playback and reuses the preloaded resource", async () => {
    const audio = new FakeAudio();
    const { cache, fetchAudio, createObjectUrl, revokeObjectUrl } =
      createRuntime(audio);
    const preload = cache.preload([
      "kana.word.soto",
      "kana.word.soto",
      "kana.word.neko",
    ]);
    expect(cache.preload(["kana.word.soto"])).toBe(preload);
    let completed = false;
    void preload.then(() => {
      completed = true;
    });

    await vi.waitFor(() => {
      expect(audio.load).toHaveBeenCalledOnce();
    });
    expect(audio.preload).toBe("auto");
    expect(audio.load).toHaveBeenCalledOnce();
    expect(completed).toBe(false);

    audio.readyState = 2;
    audio.dispatchEvent(new Event("canplay"));
    await expect(preload).resolves.toEqual(new Set(["kana.word.soto"]));

    cache.play("kana.word.soto");
    cache.play("kana.word.soto");
    expect(audio.play).toHaveBeenCalledTimes(2);
    expect(fetchAudio).toHaveBeenCalledOnce();

    cache.dispose();
    expect(audio.pause).toHaveBeenCalledOnce();
    expect(audio.removeAttribute).toHaveBeenCalledWith("src");
    expect(revokeObjectUrl).toHaveBeenCalledWith("blob:practice-audio");
    expect(createObjectUrl).toHaveBeenCalledOnce();
    cache.dispose();
    cache.play("kana.word.soto");
    await expect(cache.preload(["kana.word.soto"])).resolves.toEqual(new Set());
    expect(audio.play).toHaveBeenCalledTimes(2);
  });

  it("releases an in-flight media resource when its exercise ends", async () => {
    const audio = new FakeAudio();
    const { cache, revokeObjectUrl } = createRuntime(audio);
    const preload = cache.preload(["kana.word.soto"]);

    await vi.waitFor(() => {
      expect(audio.load).toHaveBeenCalledOnce();
    });
    cache.dispose();

    await expect(preload).resolves.toEqual(new Set());
    expect(audio.pause).toHaveBeenCalledOnce();
    expect(audio.removeAttribute).toHaveBeenCalledWith("src");
    expect(revokeObjectUrl).toHaveBeenCalledWith("blob:practice-audio");
    expect(audio.play).not.toHaveBeenCalled();
  });

  it("does not expose unavailable assets for playback", async () => {
    const audio = new FakeAudio();
    const { cache, fetchAudio } = createRuntime(audio);
    const missingCache = createExerciseAudioCache({
      getAudioAsset: () => "/audio/missing.opus",
      fetchAudio: vi.fn(() =>
        Promise.resolve(new Response(null, { status: 404 })),
      ),
      createAudioElement: () => audio as unknown as HTMLAudioElement,
      createObjectUrl: vi.fn(() => "blob:missing-audio"),
      revokeObjectUrl: vi.fn(),
    });

    await expect(missingCache.preload(["kana.word.soto"])).resolves.toEqual(
      new Set(),
    );
    missingCache.play("kana.word.soto");
    expect(audio.play).not.toHaveBeenCalled();
    expect(fetchAudio).not.toHaveBeenCalled();
    cache.dispose();
    missingCache.dispose();
  });

  it("uses an already playable media element without waiting for another event", async () => {
    const audio = new FakeAudio();
    audio.readyState = 2;
    const { cache } = createRuntime(audio);

    await expect(cache.preload(["kana.word.soto"])).resolves.toEqual(
      new Set(["kana.word.soto"]),
    );
    expect(audio.load).not.toHaveBeenCalled();
    cache.dispose();
  });

  it("releases a response that the browser cannot decode", async () => {
    const audio = new FakeAudio();
    const { cache, revokeObjectUrl } = createRuntime(audio);
    const preload = cache.preload(["kana.word.soto"]);

    await vi.waitFor(() => {
      expect(audio.load).toHaveBeenCalledOnce();
    });
    audio.dispatchEvent(new Event("error"));

    await expect(preload).resolves.toEqual(new Set());
    expect(audio.pause).toHaveBeenCalledOnce();
    expect(revokeObjectUrl).toHaveBeenCalledWith("blob:practice-audio");
    cache.dispose();
  });

  it("continues when fetching an available asset fails", async () => {
    const audio = new FakeAudio();
    const cache = createExerciseAudioCache({
      getAudioAsset: () => "/audio/soto.opus",
      fetchAudio: vi.fn(() => Promise.reject(new Error("offline"))),
      createAudioElement: () => audio as unknown as HTMLAudioElement,
      createObjectUrl: vi.fn(() => "blob:unreachable-audio"),
      revokeObjectUrl: vi.fn(),
    });

    await expect(cache.preload(["kana.word.soto"])).resolves.toEqual(new Set());
    expect(audio.load).not.toHaveBeenCalled();
    cache.play("kana.word.soto");
    cache.dispose();
  });

  it("uses browser fetch and media APIs for the default runtime", async () => {
    const audio = new FakeAudio();
    audio.readyState = 2;
    const fetchAudio = vi.fn((url: string, options?: RequestInit) => {
      expect(url).toBe("/audio/soto.opus");
      expect(options?.signal).toBeInstanceOf(AbortSignal);
      return Promise.resolve(new Response(new Blob(["opus"])));
    });
    const createObjectUrl = vi.fn(() => "blob:browser-runtime-audio");
    const revokeObjectUrl = vi.fn();
    function AudioFactory() {
      return audio;
    }

    vi.stubGlobal("fetch", fetchAudio);
    vi.stubGlobal("Audio", AudioFactory);
    vi.stubGlobal("URL", {
      createObjectURL: createObjectUrl,
      revokeObjectURL: revokeObjectUrl,
    });
    getAudioAssetMock.mockReturnValue("/audio/soto.opus");

    const cache = createExerciseAudioCache();
    await expect(cache.preload(["kana.word.soto"])).resolves.toEqual(
      new Set(["kana.word.soto"]),
    );
    cache.play("kana.word.soto");
    cache.dispose();

    expect(fetchAudio).toHaveBeenCalledOnce();
    expect(audio.play).toHaveBeenCalledOnce();
    expect(createObjectUrl).toHaveBeenCalledOnce();
    expect(revokeObjectUrl).toHaveBeenCalledWith("blob:browser-runtime-audio");
  });

  it("does not restore a resource disposed while its readiness event is firing", async () => {
    const audio = new FakeAudio();
    const { cache, revokeObjectUrl } = createRuntime(audio);
    const preload = cache.preload(["kana.word.soto"]);

    await vi.waitFor(() => {
      expect(audio.load).toHaveBeenCalledOnce();
    });
    audio.addEventListener(
      "canplay",
      () => {
        cache.dispose();
      },
      { once: true },
    );
    audio.dispatchEvent(new Event("canplay"));

    await expect(preload).resolves.toEqual(new Set());
    expect(revokeObjectUrl).toHaveBeenCalledOnce();
    expect(audio.play).not.toHaveBeenCalled();
  });

  it("releases an asset response received after its exercise was disposed", async () => {
    const audio = new FakeAudio();
    let finishFetch: (response: Response) => void = () => {};
    const createObjectUrl = vi.fn(() => "blob:late-audio");
    const revokeObjectUrl = vi.fn();
    const cache = createExerciseAudioCache({
      getAudioAsset: () => "/audio/soto.opus",
      fetchAudio: () =>
        new Promise((resolve) => {
          finishFetch = resolve;
        }),
      createAudioElement: () => audio as unknown as HTMLAudioElement,
      createObjectUrl,
      revokeObjectUrl,
    });
    const preload = cache.preload(["kana.word.soto"]);

    cache.dispose();
    finishFetch(new Response(new Blob(["opus"])));

    await expect(preload).resolves.toEqual(new Set());
    expect(audio.load).toHaveBeenCalledOnce();
    expect(createObjectUrl).toHaveBeenCalledOnce();
    expect(revokeObjectUrl).toHaveBeenCalledWith("blob:late-audio");
  });

  it("ignores media playback errors after preload", async () => {
    const audio = new FakeAudio();
    const { cache } = createRuntime(audio);
    const preload = cache.preload(["kana.word.soto"]);

    await vi.waitFor(() => {
      expect(audio.load).toHaveBeenCalledOnce();
    });
    audio.dispatchEvent(new Event("loadeddata"));
    await preload;

    audio.play.mockRejectedValueOnce(new Error("playback was blocked"));
    cache.play("kana.word.soto");
    await Promise.resolve();
    audio.play.mockImplementationOnce(() => {
      throw new Error("media element was closed");
    });
    expect(() => {
      cache.play("kana.word.soto");
    }).not.toThrow();
    cache.dispose();
  });
});
