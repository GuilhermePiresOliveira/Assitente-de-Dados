

import React from 'react';
import { DashboardLayout, DataRow, ActiveFilters } from '../types';
import { KPIPanel } from './KPIPanel';
import { FilterControls } from './FilterControls';
import { ChartGrid } from './ChartGrid';
import { DataTable } from './DataTable';
import { HistoryControls } from './HistoryControls';

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
    t: (key: string) => string;
}

export const Dashboard: React.FC<DashboardProps> = ({ layout, data, originalData, activeFilters, onFilterChange, t, onUndo, onRedo, canUndo, canRedo, palette }) => {
  return (
    <div className="mt-8 space-y-6 animate-fade-in">
      {layout.kpis && layout.kpis.length > 0 && (
        <KPIPanel kpis={layout.kpis} data={data} t={t} />
      )}
      
      {layout.filters && layout.filters.length > 0 && (
        <div className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-4 animate-fade-in-up flex justify-between items-center" style={{ animationDelay: '100ms' }}>
            <FilterControls 
                filters={layout.filters} 
                data={originalData} 
                activeFilters={activeFilters}
                onFilterChange={onFilterChange}
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
