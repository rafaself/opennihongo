/** Stable failure reasons for invalid or impossible exercise generation. */
export type ExerciseGenerationErrorCode =
  "invalid-configuration" | "insufficient-source-items";

/**
 * A domain error raised when a generator cannot honor its configuration with
 * the supplied source items. Messages may provide context for the caller.
 */
export class ExerciseGenerationError extends Error {
  constructor(
    readonly code: ExerciseGenerationErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "ExerciseGenerationError";
  }
}
