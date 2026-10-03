import {
  createLearningRecord,
  type ExerciseResult,
  type ExerciseSession,
  type LearningRecord,
} from "@opennihongo/core";
import { appendLearningRecord } from "@opennihongo/persistence";
import { useEffect, useRef, useState } from "react";

/** App composition for device writes. Session transitions and progress rules stay in core. */
export function useLearningRecorder() {
  const records = useRef(new Map<string, LearningRecord>());
  const saved = useRef(new Set<string>());
  const failures = useRef(new Map<string, LearningRecord>());
  const writes = useRef(new Map<string, Promise<void>>());
  const active = useRef(false);
  const [savedRecords, setSavedRecords] = useState<readonly LearningRecord[]>(
    [],
  );
  const [status, setStatus] = useState({ saving: false, failedCount: 0 });
  useEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
    };
  }, []);

  function updateStatus() {
    if (active.current)
      setStatus({
        saving: writes.current.size > 0,
        failedCount: failures.current.size,
      });
  }
  function persist(record: LearningRecord): Promise<void> {
    if (saved.current.has(record.id)) return Promise.resolve();
    const existing = writes.current.get(record.id);
    if (existing !== undefined) return existing;
    const write = appendLearningRecord(record)
      .then(() => {
        saved.current.add(record.id);
        failures.current.delete(record.id);
        if (active.current)
          setSavedRecords((previous) => [...previous, record]);
      })
      .catch(() => {
        failures.current.set(record.id, record);
      })
      .finally(() => {
        writes.current.delete(record.id);
        updateStatus();
      });
    writes.current.set(record.id, write);
    updateStatus();
    return write;
  }
  function recordResult(
    session: Pick<ExerciseSession, "id" | "profileId">,
    result: ExerciseResult,
  ): Promise<void> {
    const key = JSON.stringify([session.id, result.exerciseId]);
    let record = records.current.get(key);
    if (record === undefined) {
      record = createLearningRecord({
        id: crypto.randomUUID(),
        sessionId: session.id,
        profileId: session.profileId,
        occurredAt: new Date().toISOString(),
        result,
      });
      records.current.set(key, record);
    }
    return persist(record);
  }
  async function retry() {
    await Promise.all([...failures.current.values()].map(persist));
  }
  return { ...status, savedRecords, recordResult, retry };
}
