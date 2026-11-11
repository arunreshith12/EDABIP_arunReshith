export const formatNumber = (value: number): string => value.toLocaleString('en-US');

export const formatPercent = (value: number | null): string =>
  value === null ? '-' : `${value.toFixed(1)}%`;

/** "just now", "5m ago", "2h ago", "3d ago". `now` is passed in so this stays pure. */
export function timeAgo(timestamp: number, now: number): string {
  const minutes = Math.max(0, Math.floor((now - timestamp) / 60000));
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return hours < 24 ? `${hours}h ago` : `${Math.floor(hours / 24)}d ago`;
}

/** Round a maximum up to a "nice" axis end: 80 -> 100, 95000 -> 100000. */
export function niceCeil(max: number): number {
  if (max <= 0) return 1;
  const power = 10 ** Math.floor(Math.log10(max));
  const scaled = max / power;
  const nice = [1, 2, 2.5, 5, 10].find(step => scaled <= step) ?? 10;
  return nice * power;
}

/** Builds the URL for a file in /public, respecting Vite's base path. */
export const assetUrl = (path: string): string => `${import.meta.env.BASE_URL}${path}`;
