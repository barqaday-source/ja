import { useCallback, useState } from "react";

/** Executes a real async repository action; it never fabricates or delays data. */
export function useAsyncAction(_legacyDelayMs?: number) {
  const [busy, setBusy] = useState(false);
  const run = useCallback(async <T,>(action: () => T | Promise<T>) => {
    if (busy) return undefined;
    setBusy(true);
    try { return await action(); } finally { setBusy(false); }
  }, [busy]);
  return { busy, run };
}
