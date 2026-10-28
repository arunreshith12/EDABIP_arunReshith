import { useState } from 'react';
import type { ReactElement } from 'react';
import { useOutletContext } from 'react-router-dom';
import { refreshDashboardData } from '../api/refresh';
import { DemandChartCard } from '../components/dashboard/DemandChartCard';
import { MetricsSection } from '../components/dashboard/MetricsSection';
import { PageHeader } from '../components/dashboard/PageHeader';
import { RevenueChartCard } from '../components/dashboard/RevenueChartCard';
import { WelcomeCard } from '../components/dashboard/WelcomeCard';
import { ModelRegistry } from '../components/registry/ModelRegistry';
import { STORAGE_KEYS } from '../constants';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useModels } from '../hooks/useModels';
import { useNow } from '../hooks/useNow';
import type { CategoryFilter, LayoutContext, PeriodKey, RangeKey } from '../types';
import { downloadCsv } from '../utils/csv';
import { timeAgo } from '../utils/format';
import { parseTimestamp } from '../utils/settings';

const MINUTE_MS = 60_000;
const CSV_HEADER = ['Model Name', 'Type', 'Accuracy', 'Status'] as const;

export function DashboardPage(): ReactElement {
  useDocumentTitle('Analytics | EDABIP');
  const { settings, updateSettings, notify } = useOutletContext<LayoutContext>();

  const [refreshToken, setRefreshToken] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useLocalStorage<number>(STORAGE_KEYS.refreshed, parseTimestamp, () => Date.now());
  const now = useNow(MINUTE_MS);
  const { state: modelsState, actions } = useModels(notify);

  /* ---------- handlers ---------- */
  const handleRangeChange = (range: RangeKey): void => {
    updateSettings({ range });
    notify(`Showing metrics for the last ${range} days`);
  };

  const handleRefresh = async (): Promise<void> => {
    setRefreshing(true);
    try {
      await refreshDashboardData(); // re-download the JSON, bypassing the cache
      setRefreshToken(token => token + 1); // every section loads again
      setLastRefreshed(Date.now());
      notify('Dashboard refreshed');
    } finally {
      setRefreshing(false);
    }
  };

  const handleExport = (): void => {
    if (modelsState.status !== 'ready') {
      notify('Models are still loading.');
      return;
    }
    const rows = modelsState.items.map(model => [model.name, model.type, model.accuracy ?? '-', model.status]);
    downloadCsv('ml-model-registry.csv', [CSV_HEADER, ...rows]);
    notify('Exported ml-model-registry.csv');
  };

  return (
    <>
      <PageHeader refreshedAgo={timeAgo(lastRefreshed, now)} onExport={handleExport} />

      <WelcomeCard
        range={settings.range}
        category={settings.category}
        refreshing={refreshing}
        onRangeChange={handleRangeChange}
        onCategoryChange={(category: CategoryFilter) => updateSettings({ category })}
        onRefresh={() => void handleRefresh()}
      />

      <MetricsSection range={settings.range} refreshToken={refreshToken} />

      <section className="charts">
        <RevenueChartCard
          period={settings.revRange}
          onPeriodChange={(revRange: PeriodKey) => updateSettings({ revRange })}
          refreshToken={refreshToken}
        />
        <DemandChartCard
          period={settings.demRange}
          onPeriodChange={(demRange: PeriodKey) => updateSettings({ demRange })}
          refreshToken={refreshToken}
          onAssistant={() => notify('AI assistant coming soon')}
        />
      </section>

      <ModelRegistry
        state={modelsState}
        settings={settings}
        onSettingsChange={updateSettings}
        actions={actions}
        notify={notify}
      />
    </>
  );
}
