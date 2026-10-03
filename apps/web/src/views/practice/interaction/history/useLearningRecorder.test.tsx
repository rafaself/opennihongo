import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import type { appendLearningRecord } from "@opennihongo/persistence";
import { useLearningRecorder } from "./useLearningRecorder";
import { LearningSaveStatus } from "./LearningSaveStatus";

const storage = vi.hoisted(() => ({
  appendLearningRecord: vi.fn<typeof appendLearningRecord>(),
}));
vi.mock("@opennihongo/persistence", () => storage);
const session = { id: "session-1", profileId: "profile-1" };
const result = {
  exerciseId: "e",
  outcome: "incorrect",
  attempts: 0,
  sourceItemResults: [{ sourceItemId: "future-item", outcome: "incorrect" }],
} as const;
function Harness() {
  const history = useLearningRecorder();
  return (
    <>
      <button
        onClick={() => {
          void history.recordResult(session, result);
        }}
      >
        Finish
      </button>
      <LearningSaveStatus recorder={history} />
      <span>Saved: {history.savedRecords.length}</span>
    </>
  );
}
beforeEach(() => storage.appendLearningRecord.mockReset().mockResolvedValue());
afterEach(cleanup);

it("records once and retries the same immutable record after a storage failure", async () => {
  storage.appendLearningRecord.mockRejectedValueOnce(new Error("quota"));
  const user = userEvent.setup();
  render(<Harness />);
  await user.click(screen.getByText("Finish"));
  await screen.findByRole("alert");
  screen.getByText("Saved: 0");
  const failedRecord = storage.appendLearningRecord.mock.calls[0]?.[0];
  await user.click(screen.getByRole("button", { name: /retry saving/i }));
  await screen.findByText("Saved: 1");
  expect(storage.appendLearningRecord.mock.calls[1]?.[0]).toBe(failedRecord);
  expect(screen.queryByRole("alert")).toBeNull();
  await user.click(screen.getByText("Finish"));
  expect(storage.appendLearningRecord).toHaveBeenCalledTimes(2);
});
it("shares an in-flight write for repeated completion notifications", async () => {
  let finish!: () => void;
  storage.appendLearningRecord.mockImplementationOnce(
    () =>
      new Promise<void>((resolve) => {
        finish = resolve;
      }),
  );
  const user = userEvent.setup();
  render(<Harness />);
  await user.click(screen.getByText("Finish"));
  await user.click(screen.getByText("Finish"));
  expect(storage.appendLearningRecord).toHaveBeenCalledOnce();
  finish();
  await waitFor(() => {
    expect(screen.getByText("Saved: 1")).toBeTruthy();
  });
});
it("does not update an unmounted recorder when a save completes", async () => {
  let finish!: () => void;
  storage.appendLearningRecord.mockImplementationOnce(
    () =>
      new Promise<void>((resolve) => {
        finish = resolve;
      }),
  );
  const user = userEvent.setup();
  const view = render(<Harness />);
  await user.click(screen.getByText("Finish"));
  view.unmount();
  finish();
  await Promise.resolve();
  render(<Harness />);
  screen.getByText("Saved: 0");
});
