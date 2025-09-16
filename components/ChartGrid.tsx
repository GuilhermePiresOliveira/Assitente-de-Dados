import React from 'react';
import Papa from 'papaparse';
import { ChartSuggestion, DataRow } from '../types';
import { ChartCard } from './ChartCard';
import { ExportIcon } from './icons';

interface ChartGridProps {
  suggestions: ChartSuggestion[];
  data: DataRow[];
  t: (key: string) => string;
  palette: string[];
}

export const ChartGrid: React.FC<ChartGridProps> = ({ suggestions, data, t, palette }) => {
  const handleExport = () => {
    if (data.length === 0) {
      return;
    }

    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'dashboard_data.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const isDataEmpty = !data || data.length === 0;

  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('chartgrid.title')}</h2>
        <button
          onClick={handleExport}
          disabled={data.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-gray-400 dark:disabled:bg-gray-800 disabled:cursor-not-allowed disabled:text-gray-600 dark:disabled:text-gray-500 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-900 focus:ring-indigo-500"
        >
          <ExportIcon className="h-5 w-5" />
          <span>{t('chartgrid.export')}</span>
        </button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
        {suggestions.map((suggestion, index) => (
          <ChartCard 
            key={index} 
            suggestion={suggestion} 
            data={data} 
            t={t} 
            index={index}
            palette={palette}
            isLoading={isDataEmpty}
          />
        ))}
      </div>
    </div>
  );
};
