import { describe, expect, it } from "vitest";
import { createWordsPracticeSession } from "./createWordsPracticeSession";

describe("createWordsPracticeSession", () => {
  it("creates two distinct deterministic matching rounds from the five words", () => {
    const first = createWordsPracticeSession(4);
    const repeated = createWordsPracticeSession(4);
    const [staticRound, rollingRound] = first.rounds;

    expect(first).toEqual(repeated);
    expect(staticRound.id).not.toBe(rollingRound.id);
    expect(staticRound.pairs.map(({ sourceItemId }) => sourceItemId)).toEqual(
      expect.arrayContaining([
        "kana.word.soto",
        "kana.word.hato",
        "kana.word.sato",
        "kana.word.mimi",
        "kana.word.neko",
      ]),
    );
    expect(new Set(staticRound.pairs.map(({ id }) => id)).size).toBe(5);
    expect(new Set(rollingRound.pairs.map(({ id }) => id)).size).toBe(5);
    expect(staticRound.pairs[0]?.id).toBe(rollingRound.pairs[0]?.id);
  });
});
