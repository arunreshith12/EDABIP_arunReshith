import type { ReactElement } from 'react';
import { Icon } from '../ui/Icon';

interface PageHeaderProps {
  /** e.g. "2h ago" */
  refreshedAgo: string;
  onExport: () => void;
}

export function PageHeader({ refreshedAgo, onExport }: PageHeaderProps): ReactElement {
  return (
    <div className="page__head">
      <h1>Analytics</h1>
      <div className="page__head-right">
        <p className="refreshed">
          <Icon name="history" />
          <span>Last Refreshed: {refreshedAgo}</span>
        </p>
        <button type="button" className="btn btn--primary" onClick={onExport}>
          <Icon name="export" />
          Export
        </button>
      </div>
    </div>
  );
}
