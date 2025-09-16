import React from 'react';
import { KPISuggestion, DataRow } from '../types';
import { calculateKPI } from '../utils/chartUtils';
import { InfoIcon } from './icons';

interface KPIPanelProps {
    kpis: KPISuggestion[];
    data: DataRow[];
    t: (key: string, params?: { [key:string]: string | number }) => string;
}

export const KPIPanel: React.FC<KPIPanelProps> = ({ kpis, data, t }) => {
    const formatValue = (value: number) => {
        if (value >= 1000000) return `${(value / 1000000).toFixed(2)}M`;
        if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
        if (Number.isInteger(value)) return value.toString();
        return value.toFixed(2);
    }
    
    const getKPIDetails = (kpi: KPISuggestion) => {
        const logicKey = `kpipanel.logic.${kpi.aggregation}`;
        const logicDescription = t(logicKey, { column: kpi.kpiKey });
        
        let formula = '';
        switch (kpi.aggregation) {
            case 'sum':
            case 'average':
            case 'uniqueCount':
                formula = `${kpi.aggregation.toUpperCase()}(${kpi.kpiKey})`;
                break;
            case 'count':
                formula = 'COUNT(*)';
                break;
        }

        return { logicDescription, formula };
    }

    return (
        <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {kpis.map((kpi, index) => {
                    const value = calculateKPI(data, kpi.kpiKey, kpi.aggregation);
                    const { logicDescription, formula } = getKPIDetails(kpi);
                    const tooltipId = `kpi-tooltip-${index}`;

                    return (
                        <div 
                            key={kpi.title} 
                            className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow transition-all duration-300 hover:border-indigo-500 hover:shadow-indigo-500/10 hover:-translate-y-1 animate-fade-in-up"
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            <div className="flex justify-between items-start">
                                <h4 className="text-sm text-gray-500 dark:text-gray-400 font-medium truncate pr-2">{kpi.title}</h4>
                                <div className="relative group flex-shrink-0">
                                    <InfoIcon aria-describedby={tooltipId} className="h-5 w-5 text-gray-400 dark:text-gray-500 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors cursor-pointer"/>
                                    {/* Tooltip appears on icon hover */}
                                    <div
                                        id={tooltipId}
                                        role="tooltip"
                                        className="absolute bottom-full right-0 mb-2 w-80 p-4
                                                    bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-lg shadow-xl 
                                                    opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-10
                                                    transform scale-95 group-hover:scale-100"
                                    >
                                        <h5 className="text-base font-bold text-gray-900 dark:text-white mb-2 border-b border-gray-200 dark:border-gray-700 pb-2">{kpi.title}</h5>
                                        <div className="space-y-3 text-sm text-left">
                                            <div>
                                                <p className="font-semibold text-gray-700 dark:text-gray-300">{t('kpipanel.details.question')}:</p>
                                                <p className="mt-1 text-gray-500 dark:text-gray-400 italic">"{kpi.businessQuestion}"</p>
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-700 dark:text-gray-300">{t('kpipanel.tooltip.aggregation')}:</p>
                                                <p className="mt-1 text-gray-800 dark:text-gray-300 font-mono text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md inline-block">{kpi.aggregation}</p>
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-700 dark:text-gray-300">{t('kpipanel.details.logic')}:</p>
                                                <p className="mt-1 text-gray-500 dark:text-gray-400">{logicDescription}</p>
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-700 dark:text-gray-300">{t('kpipanel.details.formula')}:</p>
                                                <p className="mt-1 text-indigo-700 dark:text-indigo-300 font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md text-xs inline-block">{formula}</p>
                                            </div>
                                        </div>
                                        <div className="absolute right-3 top-full w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-gray-200 dark:border-t-gray-600"></div>
                                    </div>
                                </div>
                            </div>
                            <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">
                                {kpi.prefix}{formatValue(value)}{kpi.suffix}
                            </p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};