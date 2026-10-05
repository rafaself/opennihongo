import type { ParticleCatalog, ParticleLesson } from "./types";
import { foundationParticles } from "./lessons/foundations";
import { placeParticles } from "./lessons/places";
import { connectionParticles } from "./lessons/connections";
import { conversationParticles } from "./lessons/conversation";
import { particleSources } from "./sources";
import { assertParticleCatalog } from "./validation";

export const particleLessons: readonly ParticleLesson[] = [
  ...foundationParticles,
  ...placeParticles,
  ...connectionParticles,
  ...conversationParticles,
];
export const particleCatalog: ParticleCatalog = {
  lessons: particleLessons,
  sources: particleSources,
};
assertParticleCatalog(particleCatalog);

export const particleIntroduction = {
  summary:
    "Small words, useful clues. Particles follow a word or phrase and help show how it connects to the rest of a sentence.",
  paragraphs: [
    "Think of a particle as a signpost. It can point to the topic, something being acted on, a place, or a question. Start by noticing what each one does in a whole sentence.",
    "One particle can have several jobs. These lessons introduce common beginner uses, with context instead of a single English translation to memorize.",
  ],
} as const;
