// useState that also saves to localStorage. Reading is validated by `parse`
// (so corrupted or old data falls back to the default), and every storage call
// is already wrapped in try/catch inside utils/storage.ts.

import { useEffect, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { readJson, writeJson } from '../utils/storage';

export function useLocalStorage<T>(
  key: string,
  parse: (raw: unknown) => T | null,
  createDefault: () => T
): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => parse(readJson(key)) ?? createDefault());

  useEffect(() => {
    writeJson(key, value);
  }, [key, value]);

  return [value, setValue];
}
