import { vi } from "vitest";

// Presentation tests isolate asynchronous device storage. Persistence is covered
// by repository integration tests and the browser record/reload journey.
vi.mock("@opennihongo/persistence", () => ({
  appendLearningRecord: vi.fn().mockResolvedValue(undefined),
  loadLearningHistory: vi
    .fn()
    .mockResolvedValue({ records: [], baselines: [] }),
}));
