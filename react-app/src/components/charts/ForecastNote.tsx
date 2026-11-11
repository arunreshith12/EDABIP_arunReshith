import type { ReactElement } from 'react';
import type { ForecastMethod } from '../../types';

interface ForecastNoteProps {
  /** e.g. "Forecast method" */
  title: string;
  method: ForecastMethod;
  /** Show the Actual / Forecast key (revenue chart only). */
  showLegend?: boolean;
}

/** Under a forecast chart: says how the numbers were made, as the API describes it. */
export function ForecastNote({ title, method, showLegend = false }: ForecastNoteProps): ReactElement {
  return (
    <div className="chart-note">
      {showLegend && (
        <ul className="legend" aria-label="Chart key">
          <li>
            <span className="legend__swatch legend__swatch--actual" aria-hidden="true" />
            Actual
          </li>
          <li>
            <span className="legend__swatch legend__swatch--forecast" aria-hidden="true" />
            Forecast
          </li>
        </ul>
      )}
      <p>
        <strong>
          {title}: {method.name}.
        </strong>{' '}
        {method.description}
      </p>
    </div>
  );
}
