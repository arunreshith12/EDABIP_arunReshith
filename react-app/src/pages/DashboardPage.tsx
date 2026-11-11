import { useCallback, useMemo, useState } from 'react';
import type { ReactElement } from 'react';
import { useOutletContext } from 'react-router-dom';
import { getMetrics, getModels } from '../api/analytics';
import { DemandChartCard } from '../components/dashboard/DemandChartCard';
import { MetricsSection } from '../components/dashboard/MetricsSection';
import { PageHeader } from '../components/dashboard/PageHeader';
import { RevenueChartCard } from '../components/dashboard/RevenueChartCard';
import { WelcomeCard } from '../components/dashboard/WelcomeCard';
import { ModelRegistry } from '../components/registry/ModelRegistry';
import { ALL_CATEGORIES } from '../constants';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useFetch } from '../hooks/useFetch';
import { useNow } from '../hooks/useNow';
import type { LayoutContext, PeriodKey, RangeKey, SelectOption, Settings } from '../types';
import { downloadCsv } from '../utils/csv';
import { timeAgo } from '../utils/format';
import { modelTypes } from '../utils/models';

const MINUTE_MS = 60_000;
const CSV_HEADER = ['Model Name', 'Type', 'Accuracy', 'Status'] as const;

export function DashboardPage(): ReactElement {
  useDocumentTitle('Analytics | EDABIP');
  const { settings, updateSettings, notify } = useOutletContext<LayoutContext>();

  const [refreshToken, setRefreshToken] = useState(0);
  const now = useNow(MINUTE_MS);

  // A new `range` gives a new function, so the metrics are requested again with ?range=<range>.
  const loadMetrics = useCallback(() => getMetrics(settings.range), [settings.range]);
  const metrics = useFetch(loadMetrics, { reloadKey: refreshToken });
  const models = useFetch(getModels, { reloadKey: refreshToken });

  /* ---------- values derived from the API data ---------- */
  const categoryOptions = useMemo<SelectOption[]>(
    () => [
      { value: ALL_CATEGORIES, label: 'All Categories' },
      ...(models.state.status === 'success' ? modelTypes(models.state.data) : []).map(type => ({ value: type, label: type }))
    ],
    [models.state]
  );

  // A saved category that is not in the data any more falls back to "all".
  const category = categoryOptions.some(option => option.value === settings.category) ? settings.category : ALL_CATEGORIES;
  const registrySettings = useMemo<Settings>(() => ({ ...settings, category }), [settings, category]);

  const refreshedAgo = metrics.state.status === 'success' ? timeAgo(Date.parse(metrics.state.data.generatedAt), now) : '-';
  const refreshing = metrics.state.status === 'loading';

  /* ---------- handlers ---------- */
  const handleRangeChange = (range: RangeKey): void => {
    updateSettings({ range });
    notify(`Showing metrics for the last ${range} days`);
  };

  const handleRefresh = (): void => {
    setRefreshToken(token => token + 1); // every section asks the API again
    notify('Refreshing data…');
  };

  const handleExport = (): void => {
    if (models.state.status !== 'success') {
      notify('Models are not loaded yet.');
      return;
    }
    const rows = models.state.data.map(model => [model.name, model.type, model.accuracy ?? '-', model.statusLabel]);
    downloadCsv('ml-model-registry.csv', [CSV_HEADER, ...rows]);
    notify('Exported ml-model-registry.csv');
  };

  return (
    <>
      <PageHeader refreshedAgo={refreshedAgo} onExport={handleExport} />

      <WelcomeCard
        range={settings.range}
        category={category}
        categoryOptions={categoryOptions}
        refreshing={refreshing}
        onRangeChange={handleRangeChange}
        onCategoryChange={nextCategory => updateSettings({ category: nextCategory })}
        onRefresh={handleRefresh}
      />

      <MetricsSection state={metrics.state} onRetry={metrics.reload} range={settings.range} />

      <section className="charts">
        <RevenueChartCard
          period={settings.revRange}
          onPeriodChange={(revRange: PeriodKey) => updateSettings({ revRange })}
          refreshToken={refreshToken}
        />
        <DemandChartCard refreshToken={refreshToken} onAssistant={() => notify('AI assistant coming soon')} />
      </section>

      <ModelRegistry state={models.state} onRetry={models.reload} settings={registrySettings} onSettingsChange={updateSettings} />
    </>
  );
}
