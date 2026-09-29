import type { RandomSource } from "./random-source";

/**
 * A deterministic Mulberry32 source seeded by the FNV-1a hash of a string's
 * UTF-16 code units. The algorithm and string hashing are stable so a seed and
 * call sequence can be reproduced within a supported application version.
 */
export class SeededRandomSource implements RandomSource {
  private state: number;

  constructor(seed: string) {
    this.state = hashSeed(seed);
  }

  next(): number {
    this.state = (this.state + 0x6d2b79f5) >>> 0;

    let value = this.state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);

    return ((value ^ (value >>> 14)) >>> 0) / 0x1_0000_0000;
  }
}

function hashSeed(seed: string): number {
  let state = 0x811c9dc5;

  for (let index = 0; index < seed.length; index += 1) {
    state = Math.imul(state ^ seed.charCodeAt(index), 0x01000193);
  }

  return state >>> 0;
}
