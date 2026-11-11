import type { ReactElement, ReactNode } from 'react';
import type { FetchState } from '../../types';
import { StatePanel } from '../ui/StatePanel';

interface AsyncContentProps<T> {
  state: FetchState<T>;
  /** Render function: only called with data when loading succeeded and it is not empty. */
  children: (data: T) => ReactNode;
  isEmpty?: (data: T) => boolean;
  loadingMessage?: string;
  emptyMessage: string;
  errorMessage: string;
  onRetry?: () => void;
}

const isEmptyList = (data: unknown): boolean => Array.isArray(data) && data.length === 0;

/** Shows the loading / error / empty panel, or the real content. Used by every data section. */
export function AsyncContent<T>({
  state,
  children,
  isEmpty = isEmptyList,
  loadingMessage = 'Loading…',
  emptyMessage,
  errorMessage,
  onRetry
}: AsyncContentProps<T>): ReactElement {
  if (state.status === 'loading') return <StatePanel kind="loading" message={loadingMessage} />;

  if (state.status === 'error') {
    return (
      <StatePanel
        kind="error"
        message={`${errorMessage} (${state.message})`}
        action={onRetry === undefined ? undefined : { label: 'Try again', onClick: onRetry }}
      />
    );
  }

  if (isEmpty(state.data)) return <StatePanel kind="empty" message={emptyMessage} />;
  return <>{children(state.data)}</>;
}
