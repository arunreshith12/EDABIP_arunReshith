import { describe, expect, it } from 'vitest';
import type { MlModel } from '../types';
import { filterModels, modelNotifications, modelTypes, sortModels } from './models';
import { hasErrors, validateLogin } from './validators';

const m = (id: string, name: string, type: string, accuracy: number | null, state: MlModel['state'] = 'active', progress: number | null = null): MlModel => ({
  id, name, type, accuracy, statusLabel: state, state, progress, version: null, updatedAt: null
});
const list = [m('1', 'Beta', 'Forecasting', 90), m('2', 'Alpha', 'Classification', null), m('3', 'Gamma', 'Forecasting', 95, 'training', 40)];

describe('models utils', () => {
  it('filters by text and type', () => {
    expect(filterModels(list, { query: 'alp', category: 'all' })).toHaveLength(1);
    expect(filterModels(list, { query: '', category: 'Forecasting' })).toHaveLength(2);
  });
  it('sorts accuracy with null last in both directions', () => {
    expect(sortModels(list, 'accuracy', 'asc').map(x => x.id)).toEqual(['1', '3', '2']);
    expect(sortModels(list, 'accuracy', 'desc').map(x => x.id)).toEqual(['3', '1', '2']);
  });
  it('sorts by name', () => expect(sortModels(list, 'name', 'asc')[0].name).toBe('Alpha'));
  it('lists distinct types', () => expect(modelTypes(list)).toEqual(['Classification', 'Forecasting']));
  it('builds notifications from training models', () => expect(modelNotifications(list)[0].text).toContain('40%'));
});

describe('validateLogin', () => {
  it('requires both fields and a valid email', () => {
    expect(hasErrors(validateLogin({ email: '', password: '' }))).toBe(true);
    expect(hasErrors(validateLogin({ email: 'bad', password: 'x' }))).toBe(true);
    expect(hasErrors(validateLogin({ email: 'a@b.co', password: 'x' }))).toBe(false);
  });
});
