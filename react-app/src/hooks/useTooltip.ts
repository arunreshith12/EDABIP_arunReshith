// Tooltip state shared by the charts. `bind(text)` returns the mouse / keyboard
// handlers to spread onto an SVG shape.

import { useCallback, useState } from 'react';
import type { FocusEvent, MouseEvent } from 'react';
import type { TooltipState } from '../types';

export interface TooltipHandlers {
  onMouseMove: (event: MouseEvent<SVGElement>) => void;
  onMouseLeave: () => void;
  onFocus: (event: FocusEvent<SVGElement>) => void;
  onBlur: () => void;
}

export interface UseTooltipResult {
  tip: TooltipState | null;
  bind: (text: string) => TooltipHandlers;
}

export function useTooltip(): UseTooltipResult {
  const [tip, setTip] = useState<TooltipState | null>(null);
  const hide = useCallback((): void => setTip(null), []);

  const bind = useCallback(
    (text: string): TooltipHandlers => ({
      onMouseMove: event => setTip({ text, x: event.clientX, y: event.clientY }),
      onMouseLeave: hide,
      onFocus: event => {
        const box = event.currentTarget.getBoundingClientRect();
        setTip({ text, x: box.left + box.width / 2, y: box.top });
      },
      onBlur: hide
    }),
    [hide]
  );

  return { tip, bind };
}
