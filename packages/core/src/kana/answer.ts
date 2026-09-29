import type { KanaItem } from "./types";

export function normalizeKanaAnswer(input: string): string {
  return input.trim().normalize("NFKC").trim().toLowerCase();
}

export function checkKanaAnswer(item: KanaItem, input: string): boolean {
  return normalizeKanaAnswer(input) === normalizeKanaAnswer(item.romanization);
}
