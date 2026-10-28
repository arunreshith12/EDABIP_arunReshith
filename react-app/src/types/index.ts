import type { ReactNode } from 'react';
import type { MODEL_STATUSES, MODEL_TYPES, PERIOD_OPTIONS, RANGE_OPTIONS, SORT_KEYS } from '../constants';

/* ---------- unions derived from constants ---------- */
export type ModelType = (typeof MODEL_TYPES)[number];
export type ModelStatus = (typeof MODEL_STATUSES)[number];
export type SortKey = (typeof SORT_KEYS)[number];
export type RangeKey = (typeof RANGE_OPTIONS)[number]['value'];
export type PeriodKey = (typeof PERIOD_OPTIONS)[number]['value'];
export type SortDir = 'asc' | 'desc';
export type CategoryFilter = 'all' | ModelType;

/* ---------- metric cards (data/metrics.json) ---------- */
export type IconName =
  | 'search' | 'close' | 'bell' | 'calendar' | 'refresh' | 'export'
  | 'history' | 'plus' | 'chevron' | 'bars' | 'trend' | 'gauge'
  | 'coin' | 'up' | 'down';

export type Tone = 'good' | 'bad' | 'info';
export type SparkKind = 'area' | 'line';

export interface Trend {
  text: string;
  tone: Tone;
  icon: IconName | null;
}

export interface Metric {
  id: string;
  title: string;
  icon: IconName;
  spark: SparkKind;
  values: Record<RangeKey, string>;
  trend: Trend;
  series: number[];
}

/* ---------- charts (data/revenue.json, data/demand.json) ---------- */
export interface RevenueSeries {
  labels: string[];
  values: number[];
}

export interface RevenueData {
  unit: string;
  ranges: Record<PeriodKey, RevenueSeries>;
}

export interface DemandPoint {
  label: string;
  value: number;
  color: string;
}

export interface DemandData {
  ranges: Record<PeriodKey, DemandPoint[]>;
}

/* ---------- ML model registry (data/models.json) ---------- */
export interface MlModel {
  id: string;
  name: string;
  type: ModelType;
  accuracy: number | null;
  status: ModelStatus;
  progress: number | null;
  version: string;
  updated: string;
}

/** Raw text typed into the add / edit form. Validated before becoming an MlModel. */
export interface ModelFormValues {
  name: string;
  type: string;
  accuracy: string;
  status: string;
  progress: string;
}

export type ModelFormErrors = Partial<Record<keyof ModelFormValues, string>>;

export interface AppNotification {
  id: string;
  text: string;
}

/* ---------- user settings (persisted) ---------- */
export interface Settings {
  range: RangeKey;
  category: CategoryFilter;
  revRange: PeriodKey;
  demRange: PeriodKey;
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
