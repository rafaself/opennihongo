export type ParticleReference = Readonly<{ sourceId: string; locator: string }>;
export type ParticleSource = Readonly<{
  id: string;
  title: string;
  institution: string;
  url: string;
  accessedOn: string;
}>;
export type ParticleHighlight = Readonly<{
  text: string;
  particleId: string;
  explanation: string;
}>;
export type ParticleToken = string | ParticleHighlight;
export type ParticleExample = Readonly<{
  id: string;
  label: string;
  japanese: string;
  reading: string;
  translation: string;
  context: string;
  tokens: readonly ParticleToken[];
}>;
export type ParticleCheck = Readonly<{
  prompt: string;
  options: readonly Readonly<{ particleId: string; explanation: string }>[];
}>;
export type ParticleLesson = Readonly<{
  id: string;
  glyph: string;
  reading: string;
  title: string;
  role: string;
  summary: string;
  minutes: number;
  paragraphs: readonly string[];
  note: string;
  relatedIds: readonly string[];
  examples: readonly ParticleExample[];
  check: ParticleCheck;
  references: readonly ParticleReference[];
}>;
export type ParticleCatalog = Readonly<{
  lessons: readonly ParticleLesson[];
  sources: readonly ParticleSource[];
}>;
