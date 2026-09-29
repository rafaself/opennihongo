import { describe, expect, it } from "vitest";
import { SeededRandomSource, shuffle, type RandomSource } from "../src";

describe("SeededRandomSource", () => {
  it("reproduces the stable sequence for the same seed", () => {
    const first = new SeededRandomSource("session.seed");
    const second = new SeededRandomSource("session.seed");
    const values = Array.from({ length: 5 }, () => first.next());

    expect(values).toEqual([
      0.556945288553834, 0.8363524114247411, 0.7109879376366735,
      0.2486820761114359, 0.7365507208742201,
    ]);
    expect(Array.from({ length: 5 }, () => second.next())).toEqual(values);
  });

  it("returns values in the half-open unit interval for string seeds", () => {
    for (const seed of ["", "42", "session.seed", "🙂"] as const) {
      const random = new SeededRandomSource(seed);

      for (let index = 0; index < 256; index += 1) {
        const value = random.next();

        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThan(1);
      }
    }
  });
});

describe("shuffle", () => {
  it("returns a deterministic permutation without mutating its input", () => {
    const items = ["a", "b", "c", "d", "e", "f"];
    const shuffled = shuffle(items, new SeededRandomSource("session.seed"));

    expect(shuffled).toEqual(["f", "b", "a", "c", "e", "d"]);
    expect(shuffle(items, new SeededRandomSource("session.seed"))).toEqual(
      shuffled,
    );
    expect([...shuffled].sort()).toEqual(items);
    expect(items).toEqual(["a", "b", "c", "d", "e", "f"]);
    expect(shuffled).not.toBe(items);
  });

  it("does not consume randomness for empty or single-item inputs", () => {
    let calls = 0;
    const random: RandomSource = {
      next() {
        calls += 1;
        return 0.5;
      },
    };

    expect(shuffle([], random)).toEqual([]);
    expect(shuffle(["only"], random)).toEqual(["only"]);
    expect(calls).toBe(0);
  });

  it("rejects a source value outside the required range", () => {
    for (const value of [-0.1, 1, Number.NaN]) {
      const random: RandomSource = { next: () => value };

      expect(() => shuffle(["first", "second"], random)).toThrow(RangeError);
    }
  });
});
