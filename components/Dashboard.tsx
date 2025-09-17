import React from 'react';
import { DashboardLayout, DataRow, ActiveFilters } from '../types';
import { KPIPanel } from './KPIPanel';
import { FilterControls } from './FilterControls';
import { ChartGrid } from './ChartGrid';
import { DataTable } from './DataTable';
import { HistoryControls } from './HistoryControls';
import { RefreshIcon } from './icons';

// --- Start: AutoRefreshControl Component ---
interface AutoRefreshControlProps {
    interval: number; // in milliseconds, 0 for off
    onIntervalChange: (interval: number) => void;
    isRefreshing: boolean;
    t: (key: string, params?: { [key: string]: string | number }) => string;
}

const REFRESH_OPTIONS = [
    { labelKey: 'dashboard.refresh.off', value: 0 },
    { labelKey: 'dashboard.refresh.interval', value: 15000, seconds: 15 },
    { labelKey: 'dashboard.refresh.interval', value: 30000, seconds: 30 },
    { labelKey: 'dashboard.refresh.interval', value: 60000, seconds: 60 },
];

const AutoRefreshControl: React.FC<AutoRefreshControlProps> = ({ interval, onIntervalChange, isRefreshing, t }) => {
    return (
        <div className="flex items-center gap-2">
            <label htmlFor="refresh-interval" className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">{t('dashboard.refresh.title')}:</label>
            <div className="relative">
                <select
                    id="refresh-interval"
                    value={interval}
                    onChange={(e) => onIntervalChange(Number(e.target.value))}
                    className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2 pr-8 transition"
                    aria-label={t('dashboard.refresh.title')}
                >
                    {REFRESH_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>
                            {opt.value === 0 ? t(opt.labelKey) : t(opt.labelKey, { seconds: opt.seconds })}
                        </option>
                    ))}
                </select>
                 {isRefreshing && (
                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none" title={t('dashboard.refresh.tooltip.refreshing')}>
                        <RefreshIcon className="h-4 w-4 text-indigo-500 animate-spin" />
                    </div>
                )}
            </div>
        </div>
    );
};
// --- End: AutoRefreshControl Component ---


interface DashboardProps {
    layout: DashboardLayout;
    data: DataRow[];
    originalData: DataRow[];
    activeFilters: ActiveFilters;
    onFilterChange: (filterKey: string, value: string) => void;
    onUndo: () => void;
    onRedo: () => void;
    canUndo: boolean;
    canRedo: boolean;
    palette: string[];
    t: (key: string, params?: { [key: string]: string | number }) => string;
    refreshInterval: number;
    onIntervalChange: (interval: number) => void;
    isRefreshing: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
    layout, 
    data, 
    originalData, 
    activeFilters, 
    onFilterChange, 
    t, 
    onUndo, 
    onRedo, 
    canUndo, 
    canRedo, 
    palette,
    refreshInterval,
    onIntervalChange,
    isRefreshing
}) => {
  return (
    <div className="mt-8 space-y-6 animate-fade-in">
      {layout.kpis && layout.kpis.length > 0 && (
        <KPIPanel kpis={layout.kpis} data={data} t={t} />
      )}
      
      {layout.filters && layout.filters.length > 0 && (
        <div className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-4 animate-fade-in-up flex flex-wrap justify-between items-center gap-4" style={{ animationDelay: '100ms' }}>
            <FilterControls 
                filters={layout.filters} 
                data={originalData} 
                activeFilters={activeFilters}
                onFilterChange={onFilterChange}
                t={t}
            />
            <div className="flex items-center gap-4">
                <AutoRefreshControl
                    interval={refreshInterval}
                    onIntervalChange={onIntervalChange}
                    isRefreshing={isRefreshing}
                    t={t}
                />
                <HistoryControls
                    onUndo={onUndo}
                    onRedo={onRedo}
                    canUndo={canUndo}
                    canRedo={canRedo}
                    t={t}
                />
            </div>
        </div>
      )}

      {layout.charts && layout.charts.length > 0 && (
        <ChartGrid 
            suggestions={layout.charts} 
            data={data} 
            t={t} 
            palette={palette}
        />
      )}

      <DataTable data={data} t={t} />
    </div>
  );
};
