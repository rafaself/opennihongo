import type {
  ParticleExample,
  ParticleHighlight,
  ParticleReference,
  ParticleToken,
} from "../types";
import { reconstructParticleSentence } from "../sentences";

export function p(
  particleId: string,
  text: string,
  explanation: string,
): ParticleHighlight {
  return { particleId, text, explanation };
}
export function example(
  id: string,
  label: string,
  tokens: readonly ParticleToken[],
  reading: string,
  translation: string,
  context: string,
): ParticleExample {
  return {
    id,
    label,
    tokens,
    japanese: reconstructParticleSentence(tokens),
    reading,
    translation,
    context,
  };
}
export function cite(locator: string): readonly ParticleReference[] {
  return [{ sourceId: "irodori-grammar", locator }];
}
