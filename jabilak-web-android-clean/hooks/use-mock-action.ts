import { useCallback, useState } from "react";

export function useMockAction(delayMs = 650) {
  const [busy, setBusy] = useState(false);

  const run = useCallback(async <T,>(action: () => T | Promise<T>) => {
    if (busy) return undefined;
    setBusy(true);
    await new Promise((resolve) => setTimeout(resolve, delayMs));
    try {
      return await action();
    } finally {
      setBusy(false);
    }
  }, [busy, delayMs]);

  return { busy, run };
}
