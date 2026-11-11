/**
 * Stand-in for the Analytics API, used until the real one is running.
 * It follows docs/api-contract.md. Pure functions only (no node imports) so tests can import it.
 */
export interface MockRequest {
  method: string;
  path: string;
  query: Record<string, string>;
  headers: Record<string, string | undefined>;
  body: unknown;
}
export interface MockResponse {
  status: number;
  body: unknown;
}

export const DEMO_EMAIL = 'demo@edabip.test';
export const DEMO_PASSWORD = 'Demo@1234'; // dummy credential for the mock only
export const DEMO_TOKEN = 'demo-token';
export const EXPIRED_TOKEN = 'demo-expired';

const NOW = (): Date => new Date();

const BASE: Record<string, { value: number; change: number }> = {
  '7': { value: 0.9, change: 0.3 },
  '30': { value: 0.92, change: 0.5 },
  '90': { value: 0.91, change: -0.2 }
};

function metrics(range: string): unknown {
  const shift = range === '90' ? -0.02 : 0;
  const trend = (start: number): number[] => Array.from({ length: 8 }, (_, i) => Math.round((start + i * 0.004) * 1000) / 1000);
  const mk = (key: string, label: string, value: number, change: number) => ({
    key,
    label,
    unit: 'percent',
    value: Math.round((value + shift) * 1000) / 10,
    change,
    change_unit: 'percent',
    trend: trend(value - 0.03 + shift)
  });
  const b = BASE[range] ?? BASE['30'];
  return {
    range: Number(range),
    generated_at: NOW().toISOString(),
    metrics: [
      mk('accuracy', 'Model Accuracy', b.value, b.change),
      mk('precision', 'Precision', b.value - 0.02, 0.4),
      mk('recall', 'Recall', b.value - 0.04, -0.3),
      mk('f1', 'F1 Score', b.value - 0.03, 0.1)
    ]
  };
}

function revenue(months: number): unknown {
  const now = NOW();
  const points: unknown[] = [];
  const actuals: number[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1 - i, 1));
    const value = Math.round(180_000 + (months - i) * 9_000 + ((d.getUTCMonth() * 7_919) % 14_000));
    actuals.push(value);
    points.push({ month: d.toISOString().slice(0, 7), value, kind: 'actual' });
  }
  // linear trend over the actuals, 3 months ahead
  const n = actuals.length;
  const xm = (n - 1) / 2;
  const ym = actuals.reduce((a, b) => a + b, 0) / n;
  const slope = n > 1 ? actuals.reduce((s, y, x) => s + (x - xm) * (y - ym), 0) / actuals.reduce((s, _y, x) => s + (x - xm) ** 2, 0) : 0;
  for (let k = 1; k <= 3; k++) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1 + k, 1));
    points.push({ month: d.toISOString().slice(0, 7), value: Math.round(ym + slope * (n - 1 + k - xm)), kind: 'forecast' });
  }
  return {
    currency: 'USD',
    generated_at: now.toISOString(),
    method: {
      name: 'Linear trend',
      description: 'Least-squares line fitted to the actual monthly revenue shown, extended 3 months. A simple estimate, not a guarantee.'
    },
    points
  };
}

const WEEKDAY_BASE = [60_000, 23_000, 35_000, 65_000, 95_000, 55_000, 45_000]; // Sun..Sat

function demand(): unknown {
  const now = NOW();
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1 + i));
    return { date: d.toISOString().slice(0, 10), predicted_demand: WEEKDAY_BASE[d.getUTCDay()] };
  });
  return {
    generated_at: now.toISOString(),
    method: { name: 'Same-weekday average', description: 'Average demand on the same weekday over the last 4 weeks.' },
    days
  };
}

const MODELS = [
  { id: 1, name: 'Churn Predictor', type: 'Classification', accuracy: 94.2, status: 'Active', version: 'v3.1', updated_at: '2026-11-02T09:30:00Z' },
  { id: 2, name: 'Revenue Forecaster', type: 'Forecasting', accuracy: 91.8, status: 'Active', version: 'v2.4', updated_at: '2026-11-05T14:10:00Z' },
  { id: 3, name: 'Demand Planner', type: 'Forecasting', accuracy: 89.5, status: 'Training 75%', version: 'v1.9', updated_at: '2026-11-09T08:00:00Z' },
  { id: 4, name: 'Fraud Detector', type: 'Anomaly Detection', accuracy: 97.1, status: 'Active', version: 'v4.0', updated_at: '2026-10-28T11:45:00Z' },
  { id: 5, name: 'Customer Segmenter', type: 'Clustering', accuracy: null, status: 'Pending', version: null, updated_at: null },
  { id: 6, name: 'Sentiment Analyzer', type: 'Classification', accuracy: 88.3, status: 'Training 40%', version: 'v1.2', updated_at: '2026-11-08T16:20:00Z' }
];

const bad = (loc: string[], msg: string): MockResponse => ({ status: 422, body: { detail: [{ loc: ['query', ...loc], msg, type: 'value_error' }] } });

export function handle(req: MockRequest): MockResponse {
  const { method, path, query } = req;

  if (method === 'POST' && path === '/auth/login') {
    const b = (req.body ?? {}) as Record<string, unknown>;
    if (typeof b.email !== 'string' || typeof b.password !== 'string' || b.email === '' || b.password === '') {
      return { status: 422, body: { detail: [{ loc: ['body', 'email'], msg: 'Email and password are required', type: 'value_error' }] } };
    }
    if (b.email !== DEMO_EMAIL || b.password !== DEMO_PASSWORD) return { status: 401, body: { detail: 'Invalid email or password' } };
    return { status: 200, body: { access_token: DEMO_TOKEN, token_type: 'bearer' } };
  }

  if (method !== 'GET' || !path.startsWith('/analytics/')) return { status: 404, body: { detail: 'Not found' } };

  const auth = req.headers.authorization ?? '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (token !== DEMO_TOKEN) return { status: 401, body: { detail: 'Not authenticated' } };

  switch (path) {
    case '/analytics/metrics': {
      const range = query.range ?? '30';
      if (!['7', '30', '90'].includes(range)) return bad(['range'], 'range must be one of 7, 30, 90');
      return { status: 200, body: metrics(range) };
    }
    case '/analytics/revenue-forecast': {
      const months = Number(query.months ?? '6');
      if (![3, 6, 12].includes(months)) return bad(['months'], 'months must be one of 3, 6, 12');
      return { status: 200, body: revenue(months) };
    }
    case '/analytics/demand-prediction':
      return { status: 200, body: demand() };
    case '/analytics/models': {
      const page = Number(query.page ?? '1');
      const size = Number(query.size ?? '10');
      if (!Number.isInteger(page) || page < 1) return bad(['page'], 'page must be >= 1');
      if (!Number.isInteger(size) || size < 1 || size > 100) return bad(['size'], 'size must be between 1 and 100');
      return { status: 200, body: { items: MODELS.slice((page - 1) * size, page * size), total: MODELS.length, page, size } };
    }
    default:
      return { status: 404, body: { detail: 'Not found' } };
  }
}
