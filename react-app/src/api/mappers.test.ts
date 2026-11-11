import { describe, expect, it } from 'vitest';
import { mapDemand, mapMetrics, mapModelsPage, mapRevenue, parseStatus } from './mappers';

describe('parseStatus', () => {
  it('reads training progress', () => expect(parseStatus('Training 75%')).toMatchObject({ state: 'training', progress: 75 }));
  it('reads Active and Pending', () => {
    expect(parseStatus('Active').state).toBe('active');
    expect(parseStatus('Pending').state).toBe('pending');
  });
  it('keeps unknown statuses visible', () => expect(parseStatus('Retired').state).toBe('other'));
});

describe('mapMetrics', () => {
  it('names the exact bad field', () => {
    const raw = { range: 30, generated_at: '2026-11-10T00:00:00Z', metrics: [{ key: 'accuracy', label: 'A', unit: 'percent', value: 'high', change: 1, change_unit: 'percent' }] };
    expect(() => mapMetrics(raw)).toThrow(/value/);
  });
  it('rejects a body that is not an object', () => expect(() => mapMetrics(null)).toThrow());
});

describe('mapRevenue', () => {
  const raw = {
    currency: 'USD',
    generated_at: '2026-11-10T00:00:00Z',
    method: { name: 'Linear trend', description: 'x' },
    points: [
      { month: '2026-12', value: 3, kind: 'forecast' },
      { month: '2026-11', value: 2, kind: 'actual' },
      { month: '2027-01', value: 4, kind: 'forecast' }
    ]
  };
  it('sorts by month and flags forecasts', () => {
    const { points } = mapRevenue(raw);
    expect(points.map(p => p.month)).toEqual(['2026-11', '2026-12', '2027-01']);
    expect(points.map(p => p.isForecast)).toEqual([false, true, true]);
  });
  it('adds the year when the range spans two years', () => {
    expect(mapRevenue(raw).points[2].label).toContain('27');
  });
  it('rejects an unknown kind', () => {
    expect(() => mapRevenue({ ...raw, points: [{ month: '2026-11', value: 1, kind: 'guess' }] })).toThrow(/kind/);
  });
});

describe('mapDemand', () => {
  it('labels days by weekday', () => {
    const { days: points } = mapDemand({
      generated_at: '2026-11-10T00:00:00Z',
      method: { name: 'm', description: 'd' },
      days: [{ date: '2026-11-11', predicted_demand: 35000 }]
    });
    expect(points[0].label).toBe('Wed');
  });
});

describe('mapModelsPage', () => {
  it('allows null accuracy', () => {
    const page = mapModelsPage({ items: [{ id: 1, name: 'M', type: 'T', accuracy: null, status: 'Pending' }], total: 1, page: 1, size: 100 });
    expect(page.items[0].accuracy).toBeNull();
  });
});
