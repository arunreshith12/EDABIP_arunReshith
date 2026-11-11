import { useId } from 'react';
import type { ReactElement } from 'react';
import { useTooltip } from '../../hooks/useTooltip';
import type { RevenuePoint } from '../../types';
import { baselineY, createYScale, smoothPath } from '../../utils/chart';
import type { ChartBox, Point } from '../../utils/chart';
import { niceCeil } from '../../utils/format';
import { Tooltip } from '../ui/Tooltip';
import { ChartAxes } from './ChartAxes';

const BOX: ChartBox = { width: 820, height: 340, left: 78, right: 28, top: 20, bottom: 52 };
const FORECAST_LABEL_OFFSET = 16;

interface LineChartProps {
  points: readonly RevenuePoint[];
  /** Text for tooltips and screen readers, e.g. 83000 -> "$83K". */
  formatValue: (value: number) => string;
  formatTick: (value: number) => string;
  xTitle?: string;
  yTitle?: string;
}

/** Index of the last actual (non-forecast) point, or -1 when every point is a forecast. */
const lastActualIndex = (points: readonly RevenuePoint[]): number =>
  points.reduce((last, point, index) => (point.isForecast ? last : index), -1);

/**
 * Smooth area chart. Actual months are a solid line with a filled area; forecast months
 * continue as a dashed line on a shaded "Forecast" band, with hollow dots, so a forecast
 * can never be mistaken for a measured value.
 */
export function LineChart({ points, formatValue, formatTick, xTitle, yTitle }: LineChartProps): ReactElement {
  const uid = useId().replace(/[^\w-]/g, '');
  const { tip, bind } = useTooltip();

  const yMax = niceCeil(Math.max(...points.map(point => point.value)));
  const y = createYScale(BOX, yMax);
  const baseline = baselineY(BOX);
  const xAt = (index: number): number =>
    BOX.left + (index / Math.max(points.length - 1, 1)) * (BOX.width - BOX.left - BOX.right);

  const coords: Point[] = points.map((point, index) => ({ x: xAt(index), y: y(point.value) }));
  const curve = smoothPath(coords);
  const first = coords[0];
  const last = coords[coords.length - 1];

  const actualEnd = lastActualIndex(points);
  const hasForecast = actualEnd < points.length - 1;
  const splitX = actualEnd >= 0 ? (coords[actualEnd]?.x ?? BOX.left) : BOX.left; // where "actual" ends
  const chartRight = BOX.width - BOX.right;

  const actualClip = `actual-${uid}`;
  const forecastClip = `forecast-${uid}`;
  const area = first !== undefined && last !== undefined ? `${curve} L${last.x},${baseline} L${first.x},${baseline}Z` : '';

  return (
    <>
      <svg viewBox={`0 0 ${BOX.width} ${BOX.height}`}>
        <defs>
          <linearGradient id={`area-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#a8ffff" />
            <stop offset="1" stopColor="#5c8a88" />
          </linearGradient>
          <linearGradient id={`forecast-area-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#a8ffff" stopOpacity={0.45} />
            <stop offset="1" stopColor="#5c8a88" stopOpacity={0.12} />
          </linearGradient>
          <clipPath id={actualClip}>
            <rect x={0} y={0} width={splitX} height={BOX.height} />
          </clipPath>
          <clipPath id={forecastClip}>
            <rect x={splitX} y={0} width={BOX.width - splitX} height={BOX.height} />
          </clipPath>
        </defs>

        <ChartAxes box={BOX} yMax={yMax} formatTick={formatTick} />

        {hasForecast && (
          <g className="forecast-band">
            <rect x={splitX} y={BOX.top} width={chartRight - splitX} height={baseline - BOX.top} />
            <text className="forecast-label" x={(splitX + chartRight) / 2} y={BOX.top + FORECAST_LABEL_OFFSET} textAnchor="middle">
              Forecast
            </text>
          </g>
        )}

        <path d={area} fill={`url(#area-${uid})`} opacity={0.9} clipPath={`url(#${actualClip})`} />
        {hasForecast && <path d={area} fill={`url(#forecast-area-${uid})`} clipPath={`url(#${forecastClip})`} />}
        <path d={curve} fill="none" stroke="#0e3938" strokeWidth={2} clipPath={`url(#${actualClip})`} />
        {hasForecast && (
          <path
            d={curve}
            fill="none"
            stroke="#0e3938"
            strokeWidth={2}
            strokeDasharray="7 5"
            clipPath={`url(#${forecastClip})`}
          />
        )}

        {points.map((point, index) => {
          const coord = coords[index];
          const description = `${point.label}: ${formatValue(point.value)}${point.isForecast ? ' (forecast)' : ''}`;
          return (
            <g key={point.month}>
              <text x={xAt(index)} y={baseline + 18} textAnchor="middle">
                {point.label}
              </text>
              {coord !== undefined && (
                <circle
                  className={point.isForecast ? 'dot dot--forecast' : 'dot'}
                  cx={coord.x}
                  cy={coord.y}
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
          <text className="axis-title" x={(BOX.left + chartRight) / 2} y={BOX.height - 8} textAnchor="middle">
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
