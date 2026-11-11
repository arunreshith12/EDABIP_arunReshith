// Runs the REAL api layer (client, analytics, auth, mappers) against the mock API's handler,
// so the contract in docs/api-contract.md is checked end to end without a network.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DEMO_EMAIL, DEMO_PASSWORD, DEMO_TOKEN, EXPIRED_TOKEN, handle } from '../../mock-api/handlers.ts';
import { getDemandForecast, getMetrics, getModels, getRevenueForecast } from './analytics';
import { login } from './auth';
import { ApiError } from './errors';
import { clearToken, getToken, setToken, wasSessionExpired } from './tokenStore';

let calls: { url: string; headers: Record<string, string> }[] = [];

beforeEach(() => {
  calls = [];
  vi.stubGlobal('localStorage', { getItem: () => null, setItem: () => undefined, removeItem: () => undefined });
  vi.stubGlobal('fetch', (input: string, init?: RequestInit) => {
    const url = new URL(input);
    const headers = (init?.headers ?? {}) as Record<string, string>;
    calls.push({ url: input, headers });
    const result = handle({
      method: init?.method ?? 'GET',
      path: url.pathname,
      query: Object.fromEntries(url.searchParams),
      headers: { authorization: headers.Authorization },
      body: typeof init?.body === 'string' ? (JSON.parse(init.body) as unknown) : null
    });
    return Promise.resolve(new Response(JSON.stringify(result.body), { status: result.status }));
  });
  setToken(DEMO_TOKEN);
});
afterEach(() => {
  clearToken();
  vi.unstubAllGlobals();
});

describe('API contract (mock)', () => {
  it('metrics: four cards, range goes in the query, Bearer header is sent', async () => {
    const data = await getMetrics('7');
    expect(data.metrics.map(m => m.key)).toEqual(['accuracy', 'precision', 'recall', 'f1']);
    expect(calls[0].url).toContain('/analytics/metrics?range=7');
    expect(calls[0].headers.Authorization).toBe(`Bearer ${DEMO_TOKEN}`);
  });

  it('metrics: a different range returns different data', async () => {
    const a = await getMetrics('7');
    const b = await getMetrics('90');
    expect(a.metrics[0].value).not.toBe(b.metrics[0].value);
  });

  it('revenue: actuals then forecast, method present', async () => {
    const data = await getRevenueForecast('6');
    expect(calls[0].url).toContain('months=6');
    expect(data.points.filter(p => !p.isForecast)).toHaveLength(6);
    expect(data.points.filter(p => p.isForecast)).toHaveLength(3);
    expect(data.method.name).not.toBe('');
  });

  it('demand: exactly seven days', async () => {
    expect((await getDemandForecast()).days).toHaveLength(7);
  });

  it('models: reads the paged list', async () => {
    const models = await getModels();
    expect(models).toHaveLength(6);
    expect(models.find(m => m.name === 'Demand Planner')).toMatchObject({ state: 'training', progress: 75 });
    expect(models.find(m => m.name === 'Customer Segmenter')?.accuracy).toBeNull();
  });

  it('401: an expired token clears the session and says so', async () => {
    setToken(EXPIRED_TOKEN);
    await expect(getMetrics('30')).rejects.toMatchObject({ status: 401 });
    expect(getToken()).toBeNull();
    expect(wasSessionExpired()).toBe(true);
  });

  it('422: bad parameter becomes an ApiError with the server message', async () => {
    const err = await getMetrics('5' as never).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).status).toBe(422);
    expect((err as ApiError).fieldErrors.range).toBeDefined();
  });

  it('login: success stores the token; wrong password keeps the generic server message', async () => {
    clearToken();
    await login({ email: DEMO_EMAIL, password: DEMO_PASSWORD });
    expect(getToken()).toBe(DEMO_TOKEN);
    expect(calls[0].headers.Authorization).toBeUndefined();

    clearToken();
    const err = await login({ email: DEMO_EMAIL, password: 'nope' }).catch((e: unknown) => e);
    expect((err as ApiError).status).toBe(401);
    expect((err as ApiError).message).toBe('Invalid email or password');
    expect(getToken()).toBeNull();
  });

  it('network failure: status 0 with a CORS hint', async () => {
    vi.stubGlobal('fetch', () => Promise.reject(new TypeError('Failed to fetch')));
    const err = await getMetrics('30').catch((e: unknown) => e);
    expect((err as ApiError).status).toBe(0);
    expect((err as ApiError).message).toMatch(/CORS/);
  });
});
