// useReducer is used for the registry because it has several related actions
// (load, add, update, remove). `dirty` tells the hook when to write to storage.

import type { MlModel } from '../types';

export interface ModelsState {
  status: 'loading' | 'ready' | 'error';
  items: MlModel[];
  error: string | null;
  /** true after a user change that has not been saved yet */
  dirty: boolean;
}

export type ModelsAction =
  | { type: 'load/start' }
  | { type: 'load/success'; items: MlModel[] }
  | { type: 'load/error'; message: string }
  | { type: 'add'; model: MlModel }
  | { type: 'update'; model: MlModel }
  | { type: 'remove'; id: string };

export const initialModelsState: ModelsState = { status: 'loading', items: [], error: null, dirty: false };

export function modelsReducer(state: ModelsState, action: ModelsAction): ModelsState {
  switch (action.type) {
    case 'load/start':
      return initialModelsState;
    case 'load/success':
      return { status: 'ready', items: action.items, error: null, dirty: false };
    case 'load/error':
      return { status: 'error', items: [], error: action.message, dirty: false };
    case 'add':
      return { ...state, items: [action.model, ...state.items], dirty: true };
    case 'update':
      return { ...state, items: state.items.map(m => (m.id === action.model.id ? action.model : m)), dirty: true };
    case 'remove':
      return { ...state, items: state.items.filter(m => m.id !== action.id), dirty: true };
  }
}
