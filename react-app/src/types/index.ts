// Types the UI works with. The raw API response shapes live in src/api/dto.ts;
// src/api/mappers.ts converts them into these types, so components never see the API format.

import type { ReactNode } from 'react';
import type { ALL_CATEGORIES, PERIOD_OPTIONS, RANGE_OPTIONS, SORT_KEYS } from '../constants';

/* ---------- unions derived from constants ---------- */
export type SortKey = (typeof SORT_KEYS)[number];
export type RangeKey = (typeof RANGE_OPTIONS)[number]['value'];
export type PeriodKey = (typeof PERIOD_OPTIONS)[number]['value'];
export type SortDir = 'asc' | 'desc';
/** 'all' or the name of a model type that exists in the data. */
export type CategoryFilter = typeof ALL_CATEGORIES | (string & {});

/* ---------- metric cards ---------- */
export type IconName =
  | 'search' | 'close' | 'bell' | 'calendar' | 'refresh' | 'export'
  | 'history' | 'plus' | 'chevron' | 'bars' | 'trend' | 'gauge'
  | 'coin' | 'up' | 'down' | 'logout';

export type SparkKind = 'area' | 'line';
/** "percent": the value is already 0–100.  "ratio": the value is 0–1. */
export type MetricUnit = 'percent' | 'ratio';
/** "percent": relative change in %.  "absolute": difference in the metric's own unit. */
export type ChangeUnit = 'percent' | 'absolute';

export interface Metric {
  key: string;
  title: string;
  icon: IconName;
  spark: SparkKind;
  value: number;
  unit: MetricUnit;
  /** Change versus the previous period, or null when the API has none. */
  change: number | null;
  changeUnit: ChangeUnit;
  /** Optional trend for the small chart. Cards without it simply show no sparkline. */
  series: number[] | null;
}

export interface MetricsData {
  metrics: Metric[];
  /** ISO timestamp of when the pipeline produced these numbers. */
  generatedAt: string;
}

/* ---------- charts ---------- */
export interface ForecastMethod {
  name: string;
  description: string;
}

export interface RevenuePoint {
  /** "2026-05" */
  month: string;
  /** "May" (or "Jan ’27" when the chart spans two years) */
  label: string;
  /** US dollars */
  value: number;
  isForecast: boolean;
}

export interface RevenueForecast {
  points: RevenuePoint[];
  method: ForecastMethod;
  generatedAt: string;
}

export interface DemandPoint {
  /** "Tue" */
  label: string;
  /** "Tue, 11 Nov" – used in tooltips */
  caption: string;
  value: number;
  color: string;
}

export interface DemandForecast {
  days: DemandPoint[];
  method: ForecastMethod;
  generatedAt: string;
}

/* ---------- ML model registry ---------- */
export type ModelState = 'active' | 'training' | 'pending' | 'other';

export interface MlModel {
  id: string;
  name: string;
  type: string;
  /** Percent (0–100), or null when the model has no accuracy yet. */
  accuracy: number | null;
  /** Exactly the text the API sent, e.g. "Training 75%". Shown in the table. */
  statusLabel: string;
  state: ModelState;
  /** 0–100 while training, otherwise null. */
  progress: number | null;
  version: string | null;
  /** ISO timestamp, or null when unknown. */
  updatedAt: string | null;
}

/** One page of the model list, as the API sends it (items, total, page, size). */
export interface ModelsPage {
  items: MlModel[];
  total: number;
  page: number;
  size: number;
}

export interface AppNotification {
  id: string;
  text: string;
}

/* ---------- login ---------- */
export interface LoginValues {
  email: string;
  password: string;
}

export type LoginErrors = Partial<Record<keyof LoginValues, string>>;

/* ---------- user settings (persisted) ---------- */
export interface Settings {
  range: RangeKey;
  category: CategoryFilter;
  revRange: PeriodKey;
  query: string;
  sortKey: SortKey | null;
  sortDir: SortDir;
  showAll: boolean;
}

/* ---------- UI helpers ---------- */
export type FetchState<T> =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; data: T };

export interface SelectOption<V extends string = string> {
  value: V;
  label: string;
}

export interface Column<T> {
  key: string;
  header: string;
  sortable?: boolean;
  rowHeader?: boolean;
  render: (row: T) => ReactNode;
}

export interface TooltipState {
  text: string;
  x: number;
  y: number;
}

/** Shared with every page through React Router's <Outlet context>. */
export interface LayoutContext {
  settings: Settings;
  updateSettings: (patch: Partial<Settings>) => void;
  notify: (message: string) => void;
}
