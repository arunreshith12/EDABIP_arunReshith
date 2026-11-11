import type { ReactElement } from 'react';
import { RANGE_OPTIONS } from '../../constants';
import type { CategoryFilter, RangeKey, SelectOption } from '../../types';
import { Icon } from '../ui/Icon';
import { Select } from '../ui/Select';

interface WelcomeCardProps {
  range: RangeKey;
  category: CategoryFilter;
  /** "All Categories" plus the model types found in the registry. */
  categoryOptions: readonly SelectOption[];
  refreshing: boolean;
  onRangeChange: (range: RangeKey) => void;
  onCategoryChange: (category: CategoryFilter) => void;
  onRefresh: () => void;
}

export function WelcomeCard({
  range,
  category,
  categoryOptions,
  refreshing,
  onRangeChange,
  onCategoryChange,
  onRefresh
}: WelcomeCardProps): ReactElement {
  return (
    <section className="card welcome" aria-labelledby="welcome-title">
      <div className="welcome__text">
        <div className="welcome__title-row">
          <h2 id="welcome-title">Welcome Back, Alin!</h2>
          <span className="pill-live">
            <i aria-hidden="true" />
            Real Time
          </span>
        </div>
        <p>Stay Organised with real time insight, Monitor Your Business Performance and key Metrics.</p>
      </div>

      <div className="welcome__controls">
        <Select label="Date range" icon="calendar" value={range} options={RANGE_OPTIONS} onChange={onRangeChange} />
        <Select label="Category" value={category} options={categoryOptions} onChange={onCategoryChange} />
        <button
          type="button"
          className={refreshing ? 'btn btn--primary is-loading' : 'btn btn--primary'}
          onClick={onRefresh}
          disabled={refreshing}
        >
          <Icon name="refresh" />
          Refresh
        </button>
      </div>
    </section>
  );
}
