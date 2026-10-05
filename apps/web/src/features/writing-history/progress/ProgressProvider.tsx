import {
  createContext,
  useContext,
  useEffect,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { Button } from "@opennihongo/ui";
import { createWritingHistoryProgressStore } from "./store";

const ProgressContext = createContext<ReturnType<
  typeof createWritingHistoryProgressStore
> | null>(null);

export function WritingHistoryProgressProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [store] = useState(() => createWritingHistoryProgressStore());
  useEffect(() => {
    void store.load();
  }, [store]);
  const state = useSyncExternalStore(store.subscribe, store.getSnapshot);
  return (
    <ProgressContext value={store}>
      <div className="writing-history">
        <div aria-live="polite" className="history-storage-status">
          {!state.ready && <p>Loading saved reading progress…</p>}
          {state.saving && <p>Saving reading progress…</p>}
          {state.error !== null && (
            <div className="history-storage-error" role="alert">
              <p>
                {state.error === "load"
                  ? "Saved reading progress could not be loaded."
                  : "Reading progress could not be saved on this device."}{" "}
                You can keep reading. Changes are kept for this visit.
              </p>
              <Button
                onClick={() => {
                  void store.retry();
                }}
                variant="secondary"
              >
                Retry saving progress
              </Button>
            </div>
          )}
        </div>
        {children}
      </div>
    </ProgressContext>
  );
}

export function useWritingHistoryProgress() {
  const store = useContext(ProgressContext);
  if (store === null)
    throw new Error("Writing history requires its progress provider.");
  const state = useSyncExternalStore(store.subscribe, store.getSnapshot);
  return { ...state, visit: store.visit, markRead: store.markRead };
}
