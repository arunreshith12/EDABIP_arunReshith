// Generic "load data" hook: returns a loading / error / success state.
//
//  - `load` should be wrapped in useCallback by the caller: when its identity
//    changes (for example a new period was chosen) the data is fetched again.
//  - `reloadKey` lets a parent force a refetch (the Refresh button).
//  - `enabled: false` postpones the request (used by the notifications menu).
//
// The loading state is *derived* (not stored), so the effect never has to call
// setState synchronously.

import { useCallback, useEffect, useState } from 'react';
import type { FetchState } from '../types';
import { errorMessage } from '../utils/guards';

interface Settled<T> {
  load: () => Promise<T>;
  requestId: string;
  state: FetchState<T>;
}

interface UseFetchOptions {
  enabled?: boolean;
  reloadKey?: number;
}

export interface UseFetchResult<T> {
  state: FetchState<T>;
  /** Fetch again, e.g. from a "Try again" button. */
  reload: () => void;
}

export function useFetch<T>(
  load: () => Promise<T>,
  { enabled = true, reloadKey = 0 }: UseFetchOptions = {}
): UseFetchResult<T> {
  const [attempt, setAttempt] = useState(0);
  const [settled, setSettled] = useState<Settled<T> | null>(null);
  const requestId = `${reloadKey}:${attempt}`;

  useEffect(() => {
    if (!enabled) return undefined;
    let cancelled = false;

    load()
      .then(data => {
        if (!cancelled) setSettled({ load, requestId, state: { status: 'success', data } });
      })
      .catch((error: unknown) => {
        if (!cancelled) setSettled({ load, requestId, state: { status: 'error', message: errorMessage(error) } });
      });

    return () => {
      cancelled = true; // ignore answers that arrive after the inputs changed or the component unmounted
    };
  }, [load, requestId, enabled]);

  const isCurrent = settled !== null && settled.load === load && settled.requestId === requestId;
  const state: FetchState<T> = isCurrent ? settled.state : { status: 'loading' };

  const reload = useCallback((): void => setAttempt(value => value + 1), []);
  return { state, reload };
}
