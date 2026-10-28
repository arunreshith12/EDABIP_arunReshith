import type { ReactElement } from 'react';
import { assetUrl } from '../../utils/format';
import { NotificationsMenu } from './NotificationsMenu';
import { SearchBox } from './SearchBox';

interface TopbarProps {
  query: string;
  onQueryChange: (query: string) => void;
}

export function Topbar({ query, onQueryChange }: TopbarProps): ReactElement {
  return (
    <header className="topbar">
      <SearchBox query={query} onQueryChange={onQueryChange} />
      <div className="topbar__actions">
        <NotificationsMenu />
        <button type="button" className="avatar" aria-label="Account menu">
          <img src={assetUrl('assets/logo-dark.svg')} alt="" />
        </button>
      </div>
    </header>
  );
}
