// Owns the model registry state. Several actions (load, add, update, remove)
// go through useReducer; saving to localStorage happens whenever the user changed something.

import { useEffect, useMemo, useReducer, useState } from 'react';
import { getModels, resetModels, saveModels } from '../api/models';
import { initialModelsState, modelsReducer } from '../reducers/modelsReducer';
import type { ModelsState } from '../reducers/modelsReducer';
import type { MlModel } from '../types';
import { errorMessage } from '../utils/guards';

export interface ModelActions {
  add: (model: MlModel) => void;
  update: (model: MlModel) => void;
  remove: (id: string) => void;
  /** Throws away the user's changes and loads the sample data again. */
  reset: () => Promise<void>;
  retry: () => void;
}

export interface UseModelsResult {
  state: ModelsState;
  actions: ModelActions;
}

export function useModels(notify: (message: string) => void): UseModelsResult {
  const [state, dispatch] = useReducer(modelsReducer, initialModelsState);
  const [attempt, setAttempt] = useState(0);

  // initial load (and "Try again")
  useEffect(() => {
    let cancelled = false;
    getModels()
      .then(items => {
        if (!cancelled) dispatch({ type: 'load/success', items });
      })
      .catch((error: unknown) => {
        if (!cancelled) dispatch({ type: 'load/error', message: errorMessage(error) });
      });
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  // persist user changes only (the seed data is never written back)
  useEffect(() => {
    if (state.status === 'ready' && state.dirty && !saveModels(state.items)) {
      notify('Changes could not be saved in this browser.');
    }
  }, [state.status, state.dirty, state.items, notify]);

  const actions = useMemo<ModelActions>(
    () => ({
      add: model => dispatch({ type: 'add', model }),
      update: model => dispatch({ type: 'update', model }),
      remove: id => dispatch({ type: 'remove', id }),
      reset: async () => {
        try {
          dispatch({ type: 'load/success', items: await resetModels() });
        } catch (error: unknown) {
          dispatch({ type: 'load/error', message: errorMessage(error) });
        }
      },
      retry: () => {
        dispatch({ type: 'load/start' });
        setAttempt(value => value + 1);
      }
    }),
    []
  );

  return { state, actions };
}
