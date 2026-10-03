export function normalizeKanaAnswer(input: string): string {
  return input.trim().normalize("NFKC").trim().toLowerCase();
}
