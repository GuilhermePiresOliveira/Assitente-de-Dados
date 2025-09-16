import React from 'react';
import { ChartSuggestion, DataRow, BarLineScatterSuggestion, PieSuggestion, TreemapSuggestion } from '../types';
import { Visualizer } from './Visualizer';
import { LightBulbIcon, InfoIcon } from './icons';

interface ChartCardProps {
  suggestion: ChartSuggestion;
  data: DataRow[];
  t: (key: string, params?: { [key: string]: string | number }) => string;
  index: number;
  palette: string[];
  isLoading: boolean;
}

const ChartLoader: React.FC = () => (
    <div className="flex items-center justify-center h-full w-full">
        <div className="w-8 h-8 border-4 border-t-indigo-500 border-gray-200 dark:border-gray-600 rounded-full animate-spin"></div>
    </div>
);

const ChartDetailsTooltip: React.FC<{
    suggestion: ChartSuggestion;
    t: (key: string, params?: { [key: string]: string | number }) => string;
}> = ({ suggestion, t }) => {
    const { chartType } = suggestion;
    
    let dimension: { label: string; value: string; } | null = null;
    let measure: { label: string; value: string; } | null = null;
    let logicDescription = '';

    if (chartType === 'pie') {
        const pieSugg = suggestion as PieSuggestion;
        dimension = { label: t('chartcard.details.namekey'), value: pieSugg.nameKey };
        measure = { label: t('chartcard.details.datakey'), value: pieSugg.dataKey };
        logicDescription = t('chartcard.details.logic.pie', { nameKey: pieSugg.nameKey, dataKey: pieSugg.dataKey });
    } else if (chartType === 'treemap') {
        const treemapSugg = suggestion as TreemapSuggestion;
        dimension = { label: t('chartcard.details.namekey'), value: treemapSugg.nameKey };
        measure = { label: t('chartcard.details.datakey'), value: treemapSugg.dataKey };
        logicDescription = t('chartcard.details.logic.treemap', { nameKey: treemapSugg.nameKey, dataKey: treemapSugg.dataKey });
    } else {
        const blsSugg = suggestion as BarLineScatterSuggestion;
        dimension = { label: t('chartcard.details.xaxis'), value: blsSugg.xAxis };
        measure = { label: t('chartcard.details.yaxis'), value: blsSugg.yAxis };
        logicDescription = t('chartcard.details.logic.bar_line_scatter', { xAxis: blsSugg.xAxis, yAxis: blsSugg.yAxis });
    }
    
    return (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-80 p-3
                        bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-lg shadow-xl 
                        opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-10
                        transform scale-95 group-hover:scale-100">
            <h5 className="text-base font-bold text-gray-900 dark:text-white mb-2 border-b border-gray-200 dark:border-gray-700 pb-1">{t('chartcard.details.title')}</h5>
            <div className="space-y-3 text-sm">
                <div>
                    <p className="font-semibold text-gray-700 dark:text-gray-300">{t('chartcard.details.question')}:</p>
                    <p className="mt-1 text-gray-500 dark:text-gray-400 italic">"{suggestion.businessQuestion}"</p>
                </div>
                <div>
                    <p className="font-semibold text-gray-700 dark:text-gray-300">{t('chartcard.insight')}</p>
                    <p className="mt-1 text-gray-500 dark:text-gray-400">{suggestion.insight}</p>
                </div>
                <div>
                    <p className="font-semibold text-gray-700 dark:text-gray-300">{t('chartcard.details.rationale')}:</p>
                    <p className="text-gray-500 dark:text-gray-400">{suggestion.chartRationale}</p>
                </div>
                <div>
                    <p className="font-semibold text-gray-700 dark:text-gray-300">{t('chartcard.details.metrics')}:</p>
                    <div className="mt-1 text-gray-500 dark:text-gray-400 space-y-1">
                        {dimension && <p><span className="font-medium text-gray-800 dark:text-gray-200">{dimension.label}:</span> <code className="text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">{dimension.value}</code></p>}
                        {measure && <p><span className="font-medium text-gray-800 dark:text-gray-200">{measure.label}:</span> <code className="text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">{measure.value}</code></p>}
                        <p className="text-indigo-600 dark:text-indigo-300 text-xs pt-1">{logicDescription}</p>
                    </div>
                </div>
            </div>
            <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-gray-200 dark:border-t-gray-600"></div>
        </div>
    );
};

export const ChartCard: React.FC<ChartCardProps> = ({ suggestion, data, t, index, palette, isLoading }) => {
  return (
    <div 
      className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg p-4 flex flex-col h-[450px] transition-all duration-300 hover:border-indigo-500 hover:shadow-indigo-500/10 hover:-translate-y-1 animate-fade-in-up"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="flex-shrink-0 px-2 flex justify-between items-start gap-2">
        <div className="flex items-start gap-2 flex-grow min-w-0">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate pt-1 flex-shrink">{suggestion.businessQuestion}</h3>
          <div className="relative group flex-shrink-0 pt-1.5">
            <InfoIcon className="h-5 w-5 text-gray-400 dark:text-gray-500 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors cursor-pointer"/>
            <ChartDetailsTooltip suggestion={suggestion} t={t} />
          </div>
        </div>
      </div>
      <div className="flex-grow my-2 min-h-0">
        {isLoading ? <ChartLoader /> : <Visualizer suggestion={suggestion} data={data} palette={palette} />}
      </div>
      <div className="flex-shrink-0 px-2 mt-2">
         <div className="flex items-start gap-2 text-sm text-indigo-800 dark:text-indigo-200 bg-indigo-100 dark:bg-indigo-900/30 p-3 rounded-lg">
            <LightBulbIcon className="w-5 h-5 mt-0.5 flex-shrink-0 text-indigo-500 dark:text-indigo-400" />
            <p><span className='font-bold'>{t('chartcard.insight')}</span> {suggestion.insight}</p>
         </div>
      </div>
    </div>
  );
};
