/** Compare authored readings without erasing vowel length or small Kana. */
export function normalizeJapaneseReading(input: string): string {
  return input
    .normalize("NFKC")
    .trim()
    .toLowerCase()
    .replace(/[\u30a1-\u30f6]/gu, (character) =>
      String.fromCharCode(character.charCodeAt(0) - 0x60),
    );
}
