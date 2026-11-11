import { useEffect, useState } from 'react';

/** Current time in ms, refreshed every `intervalMs` (keeps "5m ago" labels fresh). */
export function useNow(intervalMs: number): number {
  const [now, setNow] = useState<number>(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs]);

  return now;
}
