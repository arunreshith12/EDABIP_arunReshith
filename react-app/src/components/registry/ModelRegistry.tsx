import { useId, useMemo, useState } from 'react';
import type { ReactElement } from 'react';
import { PREVIEW_ROWS, SORT_KEYS } from '../../constants';
import type { ModelActions } from '../../hooks/useModels';
import type { ModelsState } from '../../reducers/modelsReducer';
import type { Column, MlModel, Settings } from '../../types';
import { formatPercent } from '../../utils/format';
import { filterModels, sortModels, statusLabel } from '../../utils/models';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { DataTable } from '../common/DataTable';
import { Icon } from '../ui/Icon';
import { Modal } from '../ui/Modal';
import { StatePanel } from '../ui/StatePanel';
import { ModelDetails } from './ModelDetails';
import { ModelForm } from './ModelForm';

/** Which dialog is open. A single union means two dialogs can never be open at once. */
type DialogState =
  | { kind: 'none' }
  | { kind: 'add' }
  | { kind: 'edit'; model: MlModel }
  | { kind: 'view'; model: MlModel }
  | { kind: 'delete'; model: MlModel }
  | { kind: 'reset' };

interface ModelRegistryProps {
  state: ModelsState;
  settings: Settings;
  onSettingsChange: (patch: Partial<Settings>) => void;
  actions: ModelActions;
  notify: (message: string) => void;
}

export function ModelRegistry({ state, settings, onSettingsChange, actions, notify }: ModelRegistryProps): ReactElement {
  const titleId = useId();
  const [dialog, setDialog] = useState<DialogState>({ kind: 'none' });
  const { query, category, sortKey, sortDir, showAll } = settings;

  const closeDialog = (): void => setDialog({ kind: 'none' });

  /* ---------- filtered + sorted rows ---------- */
  const filtered = useMemo(
    () => sortModels(filterModels(state.items, { query, category }), sortKey, sortDir),
    [state.items, query, category, sortKey, sortDir]
  );
  const visible = showAll ? filtered : filtered.slice(0, PREVIEW_ROWS);

  /* ---------- table columns ---------- */
  const columns = useMemo<Column<MlModel>[]>(
    () => [
      { key: 'name', header: 'Model Name', sortable: true, rowHeader: true, render: model => model.name },
      { key: 'type', header: 'Type', sortable: true, render: model => model.type },
      { key: 'accuracy', header: 'Accuracy', sortable: true, render: model => formatPercent(model.accuracy) },
      {
        key: 'status',
        header: 'Status',
        render: model => <span className={`status status--${model.status.toLowerCase()}`}>{statusLabel(model)}</span>
      },
      {
        key: 'action',
        header: 'Action',
        render: model => (
          <div className="row-actions">
            <button type="button" aria-label={`View ${model.name}`} onClick={() => setDialog({ kind: 'view', model })}>
              View
            </button>
            <button type="button" aria-label={`Edit ${model.name}`} onClick={() => setDialog({ kind: 'edit', model })}>
              Edit
            </button>
            <button
              type="button"
              className="is-danger"
              aria-label={`Delete ${model.name}`}
              onClick={() => setDialog({ kind: 'delete', model })}
            >
              Delete
            </button>
          </div>
        )
      }
    ],
    []
  );

  /* ---------- handlers ---------- */
  const handleSort = (key: string): void => {
    const next = SORT_KEYS.find(candidate => candidate === key);
    if (next === undefined) return;
    onSettingsChange({ sortKey: next, sortDir: sortKey === next && sortDir === 'asc' ? 'desc' : 'asc' });
  };

  const handleSave = (model: MlModel): void => {
    if (dialog.kind === 'edit') {
      actions.update(model);
      notify('Model updated');
    } else {
      actions.add(model);
      notify('Model added');
    }
    closeDialog();
  };

  const handleDelete = (): void => {
    if (dialog.kind !== 'delete') return;
    actions.remove(dialog.model.id);
    notify('Model deleted');
    closeDialog();
  };

  const handleReset = async (): Promise<void> => {
    closeDialog();
    await actions.reset();
    notify('Sample data restored');
  };

  const clearFilters = (): void => onSettingsChange({ query: '', category: 'all' });

  /* ---------- what to show inside the table area ---------- */
  function renderBody(): ReactElement {
    if (state.status === 'loading') return <StatePanel kind="loading" message="Loading models…" />;

    if (state.status === 'error') {
      return (
        <StatePanel
          kind="error"
          message={`Could not load the model registry (${state.error ?? 'unknown error'}).`}
          action={{ label: 'Try again', onClick: actions.retry }}
        />
      );
    }

    if (filtered.length === 0) {
      return state.items.length > 0 ? (
        <StatePanel
          kind="empty"
          message="No models match your search or filter."
          action={{ label: 'Clear filters', onClick: clearFilters }}
        />
      ) : (
        <StatePanel
          kind="empty"
          message="No models yet. Add your first model to get started."
          action={{ label: 'Add Model', onClick: () => setDialog({ kind: 'add' }) }}
        />
      );
    }

    return (
      <DataTable
        caption="Registered machine learning models"
        columns={columns}
        rows={visible}
        sortKey={sortKey}
        sortDir={sortDir}
        onSort={handleSort}
      />
    );
  }

  const formOpen = dialog.kind === 'add' || dialog.kind === 'edit';

  return (
    <section className="card registry" aria-labelledby={titleId}>
      <header className="registry__head">
        <h2 id={titleId}>ML Model Registry</h2>
        <div className="registry__tools">
          <button type="button" className="btn btn--primary btn--sm" onClick={() => setDialog({ kind: 'add' })}>
            <Icon name="plus" />
            Add Model
          </button>
          <button type="button" className="link-btn" onClick={() => setDialog({ kind: 'reset' })}>
            Reset data
          </button>
          {state.status === 'ready' && filtered.length > PREVIEW_ROWS && (
            <button
              type="button"
              className="link-btn"
              aria-expanded={showAll}
              onClick={() => onSettingsChange({ showAll: !showAll })}
            >
              <span>{showAll ? 'Show Less' : 'View All'}</span>
              <Icon name="chevron" />
            </button>
          )}
        </div>
      </header>

      <div className="table-wrap">{renderBody()}</div>

      {/* add / edit */}
      <Modal open={formOpen} title={dialog.kind === 'edit' ? 'Edit Model' : 'Add Model'} onClose={closeDialog}>
        <ModelForm
          editing={dialog.kind === 'edit' ? dialog.model : null}
          models={state.items}
          onSubmit={handleSave}
          onCancel={closeDialog}
        />
      </Modal>

      {/* view */}
      <Modal open={dialog.kind === 'view'} title={dialog.kind === 'view' ? dialog.model.name : 'Model'} onClose={closeDialog}>
        {dialog.kind === 'view' && <ModelDetails model={dialog.model} onClose={closeDialog} />}
      </Modal>

      {/* delete / reset confirmations */}
      <ConfirmDialog
        open={dialog.kind === 'delete'}
        title="Delete model?"
        message={dialog.kind === 'delete' ? `"${dialog.model.name}" will be removed from the registry.` : ''}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={closeDialog}
      />
      <ConfirmDialog
        open={dialog.kind === 'reset'}
        title="Reset data?"
        message="This removes your changes and restores the original sample models."
        confirmLabel="Reset"
        onConfirm={() => void handleReset()}
        onCancel={closeDialog}
      />
    </section>
  );
}
