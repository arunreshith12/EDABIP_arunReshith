import type { ChangeUnit, MetricUnit } from '../types';

export const formatNumber = (value: number): string => value.toLocaleString('en-US');

export const formatPercent = (value: number | null): string =>
  value === null ? '-' : `${value.toFixed(1)}%`;

/** 98.4 (percent) -> "98.4%",  0.97 (ratio) -> "0.97" */
export const formatMetricValue = (value: number, unit: MetricUnit): string =>
  unit === 'percent' ? `${value.toFixed(1)}%` : value.toFixed(2);

/** +12 (percent) -> "+12.0%",  -0.02 (absolute) -> "-0.02",  0 -> "0" */
export function formatChange(change: number, unit: ChangeUnit): string {
  if (change === 0) return unit === 'percent' ? '0%' : '0';
  const sign = change > 0 ? '+' : '-';
  const size = Math.abs(change);
  return unit === 'percent' ? `${sign}${size.toFixed(1)}%` : `${sign}${size.toFixed(2)}`;
}

/** 83000 -> "$83K", 83400 -> "$83.4K" (used on chart axes and tooltips) */
export function formatUsdThousands(value: number): string {
  const thousands = value / 1000;
  const text = Number.isInteger(thousands) ? String(thousands) : thousands.toFixed(1);
  return `$${text}K`;
}

/** Axis tick: 0 stays "0". */
export const formatAxisUsd = (value: number): string => (value === 0 ? '0' : formatUsdThousands(value));

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as const;
const WEEKDAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

/** 1..12 -> "Jan".."Dec" */
export const monthName = (month: number): string => MONTH_NAMES.at(month - 1) ?? '';

/** "2026-11-11" -> { weekday: "Wed", day: 11, month: "Nov" } (UTC, so the time zone cannot shift the day). */
export function describeDate(isoDate: string): { weekday: string; day: number; month: string } | null {
  const date = new Date(`${isoDate}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return null;
  return {
    weekday: WEEKDAY_NAMES.at(date.getUTCDay()) ?? '',
    day: date.getUTCDate(),
    month: monthName(date.getUTCMonth() + 1)
  };
}

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
