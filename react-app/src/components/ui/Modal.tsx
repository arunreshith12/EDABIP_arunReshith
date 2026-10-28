import { useEffect, useId, useRef } from 'react';
import type { ReactElement, ReactNode } from 'react';

interface ModalProps {
  open: boolean;
  title: string;
  /** Called when the dialog closes (Escape key or programmatically). */
  onClose: () => void;
  children: ReactNode;
}

/**
 * Wraps the native <dialog>, so focus trapping, the Escape key and the
 * backdrop come from the browser. Children are only mounted while open, which
 * means a form inside always starts fresh.
 */
export function Modal({ open, title, onClose, children }: ModalProps): ReactElement {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog === null) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog ref={dialogRef} aria-labelledby={titleId} onClose={onClose}>
      {open && (
        <div>
          <h2 id={titleId}>{title}</h2>
          {children}
        </div>
      )}
    </dialog>
  );
}
