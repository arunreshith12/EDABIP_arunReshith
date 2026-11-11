// The shapes the API sends (see docs/api-contract.md). Field names are the API's
// (snake_case). Responses arrive as `unknown` and are checked in mappers.ts; these
// interfaces document the contract and are used by the mock server and the tests.

export interface MetricDto {
  key: string;
  label: string;
  /** percent: 0–100, ratio: 0–1 */
  unit: 'percent' | 'ratio';
  value: number;
  /** Change versus the previous period. */
  change: number | null;
  change_unit: 'percent' | 'absolute' | null;
  /** Optional values for the small chart, oldest first. */
  trend?: number[] | null;
}

export interface MetricsResponseDto {
  range: number;
  generated_at: string;
  metrics: MetricDto[];
}

export interface ForecastMethodDto {
  name: string;
  description: string;
}

export interface RevenuePointDto {
  /** "2026-05" */
  month: string;
  /** US dollars */
  value: number;
  kind: 'actual' | 'forecast';
}

export interface RevenueResponseDto {
  currency: 'USD';
  generated_at: string;
  method: ForecastMethodDto;
  points: RevenuePointDto[];
}

export interface DemandDayDto {
  /** "2026-11-11" */
  date: string;
  /** US dollars */
  predicted_demand: number;
}

export interface DemandResponseDto {
  generated_at: string;
  method: ForecastMethodDto;
  days: DemandDayDto[];
}

export interface ModelDto {
  id: string | number;
  name: string;
  type: string;
  /** Percent 0–100, null while unknown. */
  accuracy: number | null;
  /** Display text: "Active", "Pending" or "Training 75%". */
  status: string;
  version?: string | null;
  updated_at?: string | null;
}

export interface PageDto<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
}

export interface TokenResponseDto {
  access_token: string;
  token_type: string;
}
