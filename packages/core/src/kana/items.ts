import type { KanaItem } from "./types";
import { hiraganaSyllabary } from "./hiragana";

export const hiraganaVowels = [
  hiraganaSyllabary[0],
  hiraganaSyllabary[1],
  hiraganaSyllabary[2],
  hiraganaSyllabary[3],
  hiraganaSyllabary[4],
] as const satisfies readonly KanaItem[];
