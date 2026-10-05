import type { ParticleToken } from "./types";

export function reconstructParticleSentence(
  tokens: readonly ParticleToken[],
): string {
  return tokens
    .map((token) => (typeof token === "string" ? token : token.text))
    .join("");
}
