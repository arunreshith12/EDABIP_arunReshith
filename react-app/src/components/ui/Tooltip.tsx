import type { ReactElement } from 'react';
import type { TooltipState } from '../../types';

interface TooltipProps {
  tip: TooltipState | null;
}

/** Floating label that follows the mouse (or sits above a focused chart element). */
export function Tooltip({ tip }: TooltipProps): ReactElement | null {
  if (tip === null) return null;
  return (
    <div className="tooltip" role="status" style={{ left: tip.x, top: tip.y }}>
      {tip.text}
    </div>
  );
}
