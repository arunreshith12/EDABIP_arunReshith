// The ONLY place that knows where data comes from.
// To switch to a real backend: change VITE_API_BASE_URL (and, if the URLs
// differ, the file names used in the sibling files in this folder).

const BASE_URL: string = (import.meta.env.VITE_API_BASE_URL ?? '/data').replace(/\/$/, '');

const cache = new Map<string, unknown>();

export interface RequestOptions {
  /** Skip the cache and ask the server again. */
  force?: boolean;
}

export async function fetchJson<T>(resource: string, { force = false }: RequestOptions = {}): Promise<T> {
  const url = `${BASE_URL}/${resource}`;

  if (force) cache.delete(url);
  else if (cache.has(url)) return cache.get(url) as T;

  const response = await fetch(url, { cache: force ? 'no-store' : 'default' });
  if (!response.ok) throw new Error(`${url} returned ${response.status}`);

  const data = (await response.json()) as T;
  cache.set(url, data);
  return data;
}
