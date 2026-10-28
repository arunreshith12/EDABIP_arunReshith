// The one layout that wraps every page: skip link, top bar, page area, footer and toast.
// It also owns the persisted settings and shares them with the page through <Outlet context>.

import { useCallback, useMemo } from 'react';
import type { ReactElement } from 'react';
import { Outlet } from 'react-router-dom';
import { STORAGE_KEYS } from '../../constants';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { useToast } from '../../hooks/useToast';
import type { LayoutContext, Settings } from '../../types';
import { DEFAULT_SETTINGS, parseSettings } from '../../utils/settings';
import { Toast } from '../ui/Toast';
import { Footer } from './Footer';
import { Topbar } from './Topbar';

export function Layout(): ReactElement {
  const [settings, setSettings] = useLocalStorage<Settings>(STORAGE_KEYS.settings, parseSettings, () => DEFAULT_SETTINGS);
  const { message, visible, show } = useToast();

  const updateSettings = useCallback(
    (patch: Partial<Settings>): void => setSettings(current => ({ ...current, ...patch })),
    [setSettings]
  );

  const context = useMemo<LayoutContext>(
    () => ({ settings, updateSettings, notify: show }),
    [settings, updateSettings, show]
  );

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to main content
      </a>
      <Topbar query={settings.query} onQueryChange={query => updateSettings({ query })} />
      <main id="main" className="page">
        <Outlet context={context} />
        <Footer />
      </main>
      <Toast message={message} visible={visible} />
    </>
  );
}
