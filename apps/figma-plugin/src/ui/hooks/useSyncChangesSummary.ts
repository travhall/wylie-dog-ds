import { useCallback, useRef, useState } from "preact/hooks";
import type { SyncChangeSummary } from "../../plugin/sync/change-summary";

/**
 * Holds the "what a pull changed" list between the moment the user resolves
 * conflicts and the moment Figma finishes importing.
 *
 * - `remember(changes)` is called when conflicts are resolved (pass null for
 *   operations that do not need a summary).
 * - `handleMessage(msg)` is fed every plugin message. A successful import
 *   promotes the remembered changes into `summary` and returns true, so the
 *   caller can skip the generic import summary. A failed import or an error
 *   discards them, because nothing was applied.
 */
export function useSyncChangesSummary() {
  const pending = useRef<SyncChangeSummary | null>(null);
  const [summary, setSummary] = useState<SyncChangeSummary | null>(null);

  const remember = useCallback((changes: SyncChangeSummary | null) => {
    pending.current = changes;
  }, []);

  const dismiss = useCallback(() => setSummary(null), []);

  const handleMessage = useCallback(
    (msg: { type?: string; result?: { success?: boolean } }): boolean => {
      if (msg.type === "tokens-imported" && msg.result?.success) {
        if (!pending.current) return false;
        setSummary(pending.current);
        pending.current = null;
        return true;
      }
      if (
        msg.type === "tokens-imported" ||
        msg.type === "import-error" ||
        msg.type === "error"
      ) {
        pending.current = null;
      }
      return false;
    },
    []
  );

  return { summary, remember, dismiss, handleMessage };
}
