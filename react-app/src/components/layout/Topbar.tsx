import type { ReactElement } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { assetUrl } from '../../utils/format';
import { Icon } from '../ui/Icon';
import { NotificationsMenu } from './NotificationsMenu';
import { SearchBox } from './SearchBox';

interface TopbarProps {
  query: string;
  onQueryChange: (query: string) => void;
}

export function Topbar({ query, onQueryChange }: TopbarProps): ReactElement {
  const { isSignedIn, signOut } = useAuth();

  return (
    <header className="topbar">
      <SearchBox query={query} onQueryChange={onQueryChange} />
      <div className="topbar__actions">
        <NotificationsMenu />
        {isSignedIn && (
          <button type="button" className="icon-btn" aria-label="Sign out" title="Sign out" onClick={signOut}>
            <Icon name="logout" />
          </button>
        )}
        <button type="button" className="avatar" aria-label="Account menu">
          <img src={assetUrl('assets/logo-dark.svg')} alt="" />
        </button>
      </div>
    </header>
  );
}
