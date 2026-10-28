// Grid lines, y-axis ticks and the two axis lines. Used by every chart.

import type { ReactElement } from 'react';
import { baselineY, createYScale, yTicks } from '../../utils/chart';
import type { ChartBox } from '../../utils/chart';

interface ChartAxesProps {
  box: ChartBox;
  yMax: number;
  formatTick: (value: number) => string;
}

export function ChartAxes({ box, yMax, formatTick }: ChartAxesProps): ReactElement {
  const y = createYScale(box, yMax);
  const baseline = baselineY(box);

  return (
    <>
      {yTicks(yMax).map(value => (
        <g key={value}>
          <line className="grid" x1={box.left} x2={box.width - box.right} y1={y(value)} y2={y(value)} />
          <line className="axis" x1={box.left - 5} x2={box.left} y1={y(value)} y2={y(value)} />
          <text x={box.left - 10} y={y(value) + 4} textAnchor="end">
            {formatTick(value)}
          </text>
        </g>
      ))}
      <line className="axis" x1={box.left} x2={box.left} y1={box.top} y2={baseline} />
      <line className="axis" x1={box.left} x2={box.width - box.right} y1={baseline} y2={baseline} />
    </>
  );
}
