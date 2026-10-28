import type { ReactElement } from 'react';

interface ToastProps {
  message: string;
  visible: boolean;
}

export function Toast({ message, visible }: ToastProps): ReactElement {
  return (
    <div className={visible ? 'toast show' : 'toast'} role="status" aria-live="polite">
      {message}
    </div>
  );
}
