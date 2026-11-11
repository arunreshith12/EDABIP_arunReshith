import { useEffect, useId, useRef, useState } from 'react';
import type { ReactElement } from 'react';
import { getNotifications } from '../../api/notifications';
import { useFetch } from '../../hooks/useFetch';
import { AsyncContent } from '../common/AsyncContent';
import { Icon } from '../ui/Icon';

/** Bell button + dropdown. The list is only requested the first time the menu opens. */
export function NotificationsMenu(): ReactElement {
  const [open, setOpen] = useState(false);
  const [requested, setRequested] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const panelId = useId();
  const { state, reload } = useFetch(getNotifications, { enabled: requested });

  // close on outside click or Escape (listeners exist only while the menu is open)
  useEffect(() => {
    if (!open) return undefined;

    const handlePointerDown = (event: MouseEvent): void => {
      if (event.target instanceof Node && rootRef.current !== null && !rootRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  const toggle = (): void => {
    setOpen(current => !current);
    setRequested(true);
  };

  return (
    <div className="notif" ref={rootRef}>
      <button
        type="button"
        className="icon-btn"
        aria-label="Notifications"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        onClick={toggle}
      >
        <Icon name="bell" />
      </button>

      {open && (
        <div className="notif__panel" id={panelId}>
          <h2>Notifications</h2>
          <AsyncContent
            state={state}
            onRetry={reload}
            emptyMessage="You are all caught up."
            errorMessage="Could not load notifications."
          >
            {items => (
              <ul>
                {items.map(item => (
                  <li key={item.id}>{item.text}</li>
                ))}
              </ul>
            )}
          </AsyncContent>
        </div>
      )}
    </div>
  );
}
