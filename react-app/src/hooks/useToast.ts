import { useCallback, useEffect, useRef, useState } from 'react';

interface ToastState {
  message: string;
  visible: boolean;
}

export interface UseToastResult extends ToastState {
  show: (message: string) => void;
}

const VISIBLE_MS = 2400;

export function useToast(): UseToastResult {
  const [toast, setToast] = useState<ToastState>({ message: '', visible: false });
  const timer = useRef<number | undefined>(undefined);

  const show = useCallback((message: string): void => {
    window.clearTimeout(timer.current);
    setToast({ message, visible: true });
    timer.current = window.setTimeout(() => setToast(current => ({ ...current, visible: false })), VISIBLE_MS);
  }, []);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  return { ...toast, show };
}
