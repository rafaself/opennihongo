import { afterEach, beforeEach, expect, it, vi } from "vitest";
import {
  playJapaneseAudioAsset,
  playJapanesePronunciation,
} from "./pronunciation";

class FakeAudio extends EventTarget {
  readonly pause = vi.fn();
  readonly play = vi.fn(() => Promise.resolve());
  constructor(readonly source: string) {
    super();
  }
}

const audioElements: FakeAudio[] = [];
const cancel = vi.fn();
const speak = vi.fn();

beforeEach(() => {
  class AudioFactory extends FakeAudio {
    constructor(source: string) {
      super(source);
      audioElements.push(this);
    }
  }
  class Utterance {
    lang = "";
    constructor(readonly text: string) {}
  }
  vi.stubGlobal("Audio", AudioFactory);
  vi.stubGlobal("speechSynthesis", { cancel, speak });
  vi.stubGlobal("SpeechSynthesisUtterance", Utterance);
});
afterEach(() => {
  playJapanesePronunciation("");
  audioElements.length = 0;
  vi.clearAllMocks();
  vi.unstubAllGlobals();
});

it("speaks Japanese and stops the previous recorded pronunciation", () => {
  expect(playJapaneseAudioAsset("/first.opus")).toBe(true);
  playJapanesePronunciation("っか");
  expect(audioElements[0]?.pause).toHaveBeenCalledOnce();
  expect(speak).toHaveBeenCalledWith(
    expect.objectContaining({ text: "っか", lang: "ja-JP" }),
  );
  expect(cancel).toHaveBeenCalledTimes(2);
});

it("keeps the newest recording active when an older recording ends", () => {
  playJapaneseAudioAsset("/first.opus");
  playJapaneseAudioAsset("/second.opus");
  expect(audioElements[0]?.pause).toHaveBeenCalledOnce();
  audioElements[0]?.dispatchEvent(new Event("ended"));
  playJapanesePronunciation("あ");
  expect(audioElements[1]?.pause).toHaveBeenCalledOnce();
});

it("releases ended recordings and handles failed playback", async () => {
  playJapaneseAudioAsset("/first.opus");
  audioElements[0]?.dispatchEvent(new Event("ended"));
  playJapanesePronunciation("あ");
  expect(audioElements[0]?.pause).not.toHaveBeenCalled();
  const rejectPlayback = vi.fn(() => Promise.reject(new Error("Blocked")));
  class BlockedAudio extends FakeAudio {
    override readonly play = rejectPlayback;
    constructor(source: string) {
      super(source);
      audioElements.push(this);
    }
  }
  vi.stubGlobal("Audio", BlockedAudio);
  expect(playJapaneseAudioAsset("/blocked.opus")).toBe(true);
  await Promise.resolve();
  expect(rejectPlayback).toHaveBeenCalledOnce();
  playJapanesePronunciation("あ");
  expect(audioElements[1]?.pause).not.toHaveBeenCalled();
});

it("keeps a newer recording active when an older playback fails", async () => {
  let reject: (reason: Error) => void = () => {};
  class DelayedAudio extends FakeAudio {
    override readonly play = vi.fn(
      () =>
        new Promise<void>((_resolve, rejectPlayback) => {
          reject = rejectPlayback;
        }),
    );
    constructor(source: string) {
      super(source);
      audioElements.push(this);
    }
  }
  vi.stubGlobal("Audio", DelayedAudio);
  playJapaneseAudioAsset("/first.opus");
  const rejectFirst = reject;
  playJapaneseAudioAsset("/second.opus");
  rejectFirst(new Error("Blocked"));
  await Promise.resolve();
  playJapanesePronunciation("あ");
  expect(audioElements[1]?.pause).toHaveBeenCalledOnce();
});

it("tolerates environments without recorded audio or speech APIs", () => {
  vi.stubGlobal("Audio", undefined);
  expect(playJapaneseAudioAsset("/first.opus")).toBe(false);
  vi.stubGlobal("speechSynthesis", undefined);
  expect(() => {
    playJapanesePronunciation("あ");
  }).not.toThrow();
  vi.stubGlobal("speechSynthesis", { cancel, speak });
  vi.stubGlobal("SpeechSynthesisUtterance", undefined);
  expect(() => {
    playJapanesePronunciation("あ");
  }).not.toThrow();
  expect(speak).not.toHaveBeenCalled();
});
