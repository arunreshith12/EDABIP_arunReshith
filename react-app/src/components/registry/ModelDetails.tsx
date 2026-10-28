import type { ReactElement } from 'react';
import type { MlModel } from '../../types';
import { formatPercent } from '../../utils/format';
import { statusLabel } from '../../utils/models';

interface ModelDetailsProps {
  model: MlModel;
  onClose: () => void;
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
        <dd>{statusLabel(model)}</dd>
        <dt>Version</dt>
        <dd>{model.version}</dd>
        <dt>Last updated</dt>
        <dd>{model.updated}</dd>
      </dl>
      <div className="dialog-actions">
        <button type="button" className="btn btn--primary" onClick={onClose}>
          Close
        </button>
      </div>
    </>
  );
}
