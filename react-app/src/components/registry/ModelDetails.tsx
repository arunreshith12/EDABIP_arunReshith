import type { ReactElement } from 'react';
import type { MlModel } from '../../types';
import { formatPercent } from '../../utils/format';

interface ModelDetailsProps {
  model: MlModel;
  onClose: () => void;
}

/** Date + time as the user's browser shows it; the API sends an ISO timestamp. */
function formatUpdated(updatedAt: string | null): string {
  if (updatedAt === null) return '-';
  const date = new Date(updatedAt);
  return Number.isNaN(date.getTime()) ? updatedAt : date.toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' });
}

/** Read-only details, shown inside a Modal. */
export function ModelDetails({ model, onClose }: ModelDetailsProps): ReactElement {
  return (
    <>
      <dl>
        <dt>Type</dt>
        <dd>{model.type}</dd>
        <dt>Accuracy</dt>
        <dd>{formatPercent(model.accuracy)}</dd>
        <dt>Status</dt>
        <dd>{model.statusLabel}</dd>
        <dt>Version</dt>
        <dd>{model.version ?? '-'}</dd>
        <dt>Last updated</dt>
        <dd>{formatUpdated(model.updatedAt)}</dd>
      </dl>
      <div className="dialog-actions">
        <button type="button" className="btn btn--primary" onClick={onClose}>
          Close
        </button>
      </div>
    </>
  );
}
