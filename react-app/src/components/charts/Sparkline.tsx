import { useId } from 'react';
import type { ReactElement } from 'react';
import type { SparkKind } from '../../types';

const SPARK = { width: 190, height: 50, pad: 3, minSpan: 6 } as const;

/** "x,y L x,y ..." for the series. Flat series stay gentle instead of being stretched. */
function sparkPoints(series: readonly number[]): string {
  const { width, height, pad, minSpan } = SPARK;
  const max = Math.max(...series);
  const min = Math.min(...series);
  const middle = (max + min) / 2;
  const span = Math.max(max - min, minSpan);
  const lastIndex = Math.max(series.length - 1, 1);

  return series
    .map((value, index) => {
      const x = (index / lastIndex) * width;
      const y = height - pad - ((value - middle) / span + 0.5) * (height - pad * 2);
      return `${x},${y}`;
    })
    .join(' L');
}

interface SparklineProps {
  series: readonly number[];
  kind: SparkKind;
}

/** Tiny decorative chart inside a StatCard (hidden from screen readers; the number is the real content). */
export function Sparkline({ series, kind }: SparklineProps): ReactElement {
  const gradientId = `spark-${useId().replace(/[^\w-]/g, '')}`;
  const { width, height } = SPARK;
  const points = sparkPoints(series);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          {kind === 'line' ? (
            <>
              <stop offset="0" stopColor="#bfe6e0" stopOpacity={0.5} />
              <stop offset="1" stopColor="#fff" stopOpacity={0} />
            </>
          ) : (
            <>
              <stop offset="0" stopColor="#5fe0d0" />
              <stop offset="1" stopColor="#d4f6f1" stopOpacity={0.5} />
            </>
          )}
        </linearGradient>
      </defs>

      {kind === 'line' ? (
        <>
          <path d={`M${points} L${width},${height} L0,${height}Z`} fill={`url(#${gradientId})`} />
          <path
            d={`M${points}`}
            fill="none"
            stroke="#134b4a"
            strokeWidth={1.6}
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        </>
      ) : (
        <path d={`M0,${height} L${points} L${width},${height}Z`} fill={`url(#${gradientId})`} opacity={0.85} />
      )}
    </svg>
  );
}
