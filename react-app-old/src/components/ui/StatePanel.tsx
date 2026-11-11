import type { ReactElement } from 'react';

interface StatePanelProps {
  kind: 'loading' | 'error' | 'empty';
  message: string;
  action?: { label: string; onClick: () => void };
}

/** The one place that knows how loading / error / empty look. */
export function StatePanel({ kind, message, action }: StatePanelProps): ReactElement {
  return (
    <div className={`state state--${kind}`} role={kind === 'error' ? 'alert' : 'status'}>
      {kind === 'loading' && <span className="spinner" aria-hidden="true" />}
      <p>{message}</p>
      {action !== undefined && (
        <button type="button" className="btn btn--primary state__action" onClick={action.onClick}>
          {action.label}
        </button>
      )}
    </div>
  );
}
