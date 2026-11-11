// Turns raw API JSON (snake_case, see docs/api-contract.md) into the types the UI uses.
// Every field is checked on the way in: if the API breaks the contract, the user sees
// an error state that names the exact field, instead of a half-drawn chart.

import { DEMAND_COLORS } from '../constants';
import type {
  DemandForecast,
  DemandPoint,
  ForecastMethod,
  Metric,
  MetricsData,
  MlModel,
  ModelState,
  ModelsPage,
  RevenueForecast,
  RevenuePoint
} from '../types';
import { describeDate, monthName } from '../utils/format';
import { metricStyle } from '../utils/metricStyle';
import { asArray, asNumber, asNumberOrNull, asOneOf, asRecord, asString, asStringOrNull, shapeError } from './parse';

const MONTH_PATTERN = /^(\d{4})-(0[1-9]|1[0-2])$/;
const TRAINING_PATTERN = /^Training\s+(\d{1,3})\s*%$/i;
const FALLBACK_BAR_COLOR = 'var(--ch-mint)';

function mapMethod(raw: unknown): ForecastMethod {
  const method = asRecord(raw, 'method');
  return { name: asString(method.name, 'method.name'), description: asString(method.description, 'method.description') };
}

/* ---------- GET /analytics/metrics ---------- */

function mapMetric(raw: unknown, index: number): Metric {
  const path = `metrics[${index}]`;
  const item = asRecord(raw, path);
  const key = asString(item.key, `${path}.key`);

  const trend =
    item.trend === null || item.trend === undefined
      ? null
      : asArray(item.trend, `${path}.trend`).map((point, i) => asNumber(point, `${path}.trend[${i}]`));

  return {
    key,
    title: asString(item.label, `${path}.label`),
    ...metricStyle(key),
    value: asNumber(item.value, `${path}.value`),
    unit: asOneOf(item.unit, ['percent', 'ratio'] as const, `${path}.unit`),
    change: asNumberOrNull(item.change, `${path}.change`),
    changeUnit:
      item.change_unit === null || item.change_unit === undefined
        ? 'percent'
        : asOneOf(item.change_unit, ['percent', 'absolute'] as const, `${path}.change_unit`),
    series: trend !== null && trend.length >= 2 ? trend : null // one point cannot make a line
  };
}

export function mapMetrics(raw: unknown): MetricsData {
  const body = asRecord(raw, 'response');
  return {
    metrics: asArray(body.metrics, 'metrics').map(mapMetric),
    generatedAt: asString(body.generated_at, 'generated_at')
  };
}

/* ---------- GET /analytics/revenue-forecast ---------- */

interface ParsedMonth {
  month: string;
  year: number;
  monthNumber: number;
  value: number;
  isForecast: boolean;
}

function parseRevenuePoint(raw: unknown, index: number): ParsedMonth {
  const path = `points[${index}]`;
  const item = asRecord(raw, path);
  const month = asString(item.month, `${path}.month`);
  const match = MONTH_PATTERN.exec(month);
  if (match === null) throw shapeError(`${path}.month`, 'a month like "2026-05"');

  return {
    month,
    year: Number(match[1]),
    monthNumber: Number(match[2]),
    value: asNumber(item.value, `${path}.value`),
    isForecast: asOneOf(item.kind, ['actual', 'forecast'] as const, `${path}.kind`) === 'forecast'
  };
}

/** "May", or "Jan ’27" for the first point and every January when the chart crosses a year. */
const monthLabel = (point: ParsedMonth, withYear: boolean): string =>
  withYear ? `${monthName(point.monthNumber)} ’${String(point.year).slice(-2)}` : monthName(point.monthNumber);

export function mapRevenue(raw: unknown): RevenueForecast {
  const body = asRecord(raw, 'response');
  const parsed = asArray(body.points, 'points')
    .map(parseRevenuePoint)
    .sort((a, b) => a.month.localeCompare(b.month));

  const firstYear = parsed[0]?.year;
  const spansYears = parsed.some(point => point.year !== firstYear);

  const points: RevenuePoint[] = parsed.map((point, index) => ({
    month: point.month,
    label: monthLabel(point, spansYears && (index === 0 || point.monthNumber === 1)),
    value: point.value,
    isForecast: point.isForecast
  }));

  return { points, method: mapMethod(body.method), generatedAt: asString(body.generated_at, 'generated_at') };
}

/* ---------- GET /analytics/demand-prediction ---------- */

function mapDemandDay(raw: unknown, index: number): DemandPoint {
  const path = `days[${index}]`;
  const item = asRecord(raw, path);
  const date = asString(item.date, `${path}.date`);
  const parts = describeDate(date);
  if (parts === null) throw shapeError(`${path}.date`, 'a date like "2026-11-11"');

  return {
    label: parts.weekday,
    caption: `${parts.weekday}, ${parts.day} ${parts.month}`,
    value: asNumber(item.predicted_demand, `${path}.predicted_demand`),
    color: DEMAND_COLORS.at(index % DEMAND_COLORS.length) ?? FALLBACK_BAR_COLOR
  };
}

export function mapDemand(raw: unknown): DemandForecast {
  const body = asRecord(raw, 'response');
  // sort the raw rows by date first, so bar colours follow the day order
  const rows = asArray(body.days, 'days')
    .map((entry, index) => ({ entry, date: asString(asRecord(entry, `days[${index}]`).date, `days[${index}].date`) }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return {
    days: rows.map((row, index) => mapDemandDay(row.entry, index)),
    method: mapMethod(body.method),
    generatedAt: asString(body.generated_at, 'generated_at')
  };
}

/* ---------- GET /analytics/models ---------- */

/** "Training 75%" -> training + 75.  "Active" / "Pending" are known states; anything else is shown as sent. */
export function parseStatus(status: string): { state: ModelState; progress: number | null } {
  const training = TRAINING_PATTERN.exec(status.trim());
  if (training !== null) return { state: 'training', progress: Math.min(100, Number(training[1])) };

  const text = status.trim().toLowerCase();
  if (text === 'active') return { state: 'active', progress: null };
  if (text === 'pending') return { state: 'pending', progress: null };
  return { state: 'other', progress: null };
}

function mapModel(raw: unknown, index: number): MlModel {
  const path = `items[${index}]`;
  const item = asRecord(raw, path);
  const status = asString(item.status, `${path}.status`);

  if (typeof item.id !== 'string' && typeof item.id !== 'number') throw shapeError(`${path}.id`, 'text or a number');

  return {
    id: String(item.id),
    name: asString(item.name, `${path}.name`),
    type: asString(item.type, `${path}.type`),
    accuracy: asNumberOrNull(item.accuracy, `${path}.accuracy`),
    statusLabel: status,
    ...parseStatus(status),
    version: asStringOrNull(item.version, `${path}.version`),
    updatedAt: asStringOrNull(item.updated_at, `${path}.updated_at`)
  };
}

export function mapModelsPage(raw: unknown): ModelsPage {
  const body = asRecord(raw, 'response');
  return {
    items: asArray(body.items, 'items').map(mapModel),
    total: asNumber(body.total, 'total'),
    page: asNumber(body.page, 'page'),
    size: asNumber(body.size, 'size')
  };
}
