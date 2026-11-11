import { useId, useMemo, useState } from 'react';
import type { ReactElement } from 'react';
import { PREVIEW_ROWS, SORT_KEYS } from '../../constants';
import type { Column, FetchState, MlModel, Settings } from '../../types';
import { formatPercent } from '../../utils/format';
import { filterModels, sortModels } from '../../utils/models';
import { AsyncContent } from '../common/AsyncContent';
import { DataTable } from '../common/DataTable';
import { Icon } from '../ui/Icon';
import { Modal } from '../ui/Modal';
import { StatePanel } from '../ui/StatePanel';
import { ModelDetails } from './ModelDetails';

interface ModelRegistryProps {
  state: FetchState<MlModel[]>;
  onRetry: () => void;
  settings: Settings;
  onSettingsChange: (patch: Partial<Settings>) => void;
}

/** The registry is read-only (the API has no write endpoints): search, filter, sort and view details. */
export function ModelRegistry({ state, onRetry, settings, onSettingsChange }: ModelRegistryProps): ReactElement {
  const titleId = useId();
  const [selected, setSelected] = useState<MlModel | null>(null);
  const { query, category, sortKey, sortDir, showAll } = settings;

  const models = useMemo(() => (state.status === 'success' ? state.data : []), [state]);
  const filtered = useMemo(
    () => sortModels(filterModels(models, { query, category }), sortKey, sortDir),
    [models, query, category, sortKey, sortDir]
  );

  const columns = useMemo<Column<MlModel>[]>(
    () => [
      { key: 'name', header: 'Model Name', sortable: true, rowHeader: true, render: model => model.name },
      { key: 'type', header: 'Type', sortable: true, render: model => model.type },
      { key: 'accuracy', header: 'Accuracy', sortable: true, render: model => formatPercent(model.accuracy) },
      {
        key: 'status',
        header: 'Status',
        render: model => <span className={`status status--${model.state}`}>{model.statusLabel}</span>
      },
      {
        key: 'action',
        header: 'Action',
        render: model => (
          <div className="row-actions">
            <button type="button" aria-label={`View ${model.name}`} onClick={() => setSelected(model)}>
              View
            </button>
          </div>
        )
      }
    ],
    []
  );

  const handleSort = (key: string): void => {
    const next = SORT_KEYS.find(candidate => candidate === key);
    if (next === undefined) return;
    onSettingsChange({ sortKey: next, sortDir: sortKey === next && sortDir === 'asc' ? 'desc' : 'asc' });
  };

  const clearFilters = (): void => onSettingsChange({ query: '', category: 'all' });
  const visible = showAll ? filtered : filtered.slice(0, PREVIEW_ROWS);

  return (
    <section className="card registry" aria-labelledby={titleId}>
      <header className="registry__head">
        <h2 id={titleId}>ML Model Registry</h2>
        <div className="registry__tools">
          {filtered.length > PREVIEW_ROWS && (
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

      <div className="table-wrap">
        <AsyncContent
          state={state}
          onRetry={onRetry}
          loadingMessage="Loading models…"
          isEmpty={list => list.length === 0}
          emptyMessage="No models are registered yet."
          errorMessage="Could not load the model registry."
        >
          {() =>
            filtered.length === 0 ? (
              <StatePanel
                kind="empty"
                message="No models match your search or filter."
                action={{ label: 'Clear filters', onClick: clearFilters }}
              />
            ) : (
              <DataTable
                caption="Registered machine learning models"
                columns={columns}
                rows={visible}
                sortKey={sortKey}
                sortDir={sortDir}
                onSort={handleSort}
              />
            )
          }
        </AsyncContent>
      </div>

      <Modal open={selected !== null} title={selected?.name ?? 'Model'} onClose={() => setSelected(null)}>
        {selected !== null && <ModelDetails model={selected} onClose={() => setSelected(null)} />}
      </Modal>
    </section>
  );
}
