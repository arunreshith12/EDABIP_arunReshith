import { useId } from 'react';
import type { ReactElement } from 'react';
import { useTooltip } from '../../hooks/useTooltip';
import { niceCeil } from '../../utils/format';
import { baselineY, createYScale, smoothPath } from '../../utils/chart';
import type { ChartBox, Point } from '../../utils/chart';
import { Tooltip } from '../ui/Tooltip';
import { ChartAxes } from './ChartAxes';

const BOX: ChartBox = { width: 820, height: 340, left: 78, right: 28, top: 20, bottom: 52 };

interface LineChartProps {
  labels: readonly string[];
  values: readonly number[];
  /** Text for tooltips and screen readers, e.g. 80 -> "$80K". */
  formatValue: (value: number) => string;
  formatTick: (value: number) => string;
  xTitle?: string;
  yTitle?: string;
}

/** Smooth area chart with a focusable, hoverable dot for every data point. */
export function LineChart({ labels, values, formatValue, formatTick, xTitle, yTitle }: LineChartProps): ReactElement {
  const gradientId = `area-${useId().replace(/[^\w-]/g, '')}`;
  const { tip, bind } = useTooltip();

  const yMax = niceCeil(Math.max(...values));
  const y = createYScale(BOX, yMax);
  const baseline = baselineY(BOX);
  const xAt = (index: number): number =>
    BOX.left + (index / Math.max(labels.length - 1, 1)) * (BOX.width - BOX.left - BOX.right);

  const points: Point[] = values.map((value, index) => ({ x: xAt(index), y: y(value) }));
  const curve = smoothPath(points);
  const first = points[0];
  const last = points[points.length - 1];

  return (
    <>
      <svg viewBox={`0 0 ${BOX.width} ${BOX.height}`}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#a8ffff" />
            <stop offset="1" stopColor="#5c8a88" />
          </linearGradient>
        </defs>

        <ChartAxes box={BOX} yMax={yMax} formatTick={formatTick} />

        {first !== undefined && last !== undefined && (
          <path d={`${curve} L${last.x},${baseline} L${first.x},${baseline}Z`} fill={`url(#${gradientId})`} opacity={0.9} />
        )}
        <path d={curve} fill="none" stroke="#0e3938" strokeWidth={2} />

        {labels.map((label, index) => {
          const point = points[index];
          const description = `${label}: ${formatValue(values[index] ?? 0)}`;
          return (
            <g key={label}>
              <text x={xAt(index)} y={baseline + 18} textAnchor="middle">
                {label}
              </text>
              {point !== undefined && (
                <circle
                  className="dot"
                  cx={point.x}
                  cy={point.y}
                  r={5}
                  tabIndex={0}
                  role="img"
                  aria-label={description}
                  {...bind(description)}
                />
              )}
            </g>
          );
        })}

        {xTitle !== undefined && (
          <text className="axis-title" x={(BOX.left + BOX.width - BOX.right) / 2} y={BOX.height - 8} textAnchor="middle">
            {xTitle}
          </text>
        )}
        {yTitle !== undefined && (
          <text
            className="axis-title"
            transform={`translate(14 ${(BOX.top + baseline) / 2}) rotate(-90)`}
            textAnchor="middle"
          >
            {yTitle}
          </text>
        )}
      </svg>
      <Tooltip tip={tip} />
    </>
  );
}
