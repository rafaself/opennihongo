import { particleLessons } from "./catalog";
import type { ParticleLesson } from "./types";

export function getParticleLesson(id: string): ParticleLesson | undefined {
  return particleLessons.find((lesson) => lesson.id === id);
}
