import React, { useMemo } from 'react';
import { FilterSuggestion, DataRow, ActiveFilters } from '../types';
import { FilterIcon } from './icons';

interface FilterControlsProps {
    filters: FilterSuggestion[];
    data: DataRow[];
    activeFilters: ActiveFilters;
    onFilterChange: (filterKey: string, value: string) => void;
    t: (key: string) => string;
}

export const FilterControls: React.FC<FilterControlsProps> = ({ filters, data, activeFilters, onFilterChange, t }) => {
    const filterOptions = useMemo(() => {
        const options: { [key: string]: string[] } = {};
        filters.forEach(filter => {
            const uniqueValues = Array.from(new Set(data.map(row => String(row[filter.column]))));
            options[filter.column] = uniqueValues.sort();
        });
        return options;
    }, [filters, data]);

    if (filters.length === 0) {
        return null;
    }

    return (
        <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                <FilterIcon className="h-5 w-5" />
                <span>{t('filtercontrols.title')}</span>
            </div>
            {filters.map(filter => (
                <div key={filter.column}>
                    <label htmlFor={`filter-${filter.column}`} className="sr-only">{filter.column}</label>
                    <select
                        id={`filter-${filter.column}`}
                        value={activeFilters[filter.column] || 'all'}
                        onChange={(e) => onFilterChange(filter.column, e.target.value)}
                        className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2 transition"
                    >
                        <option value="all">{t('filtercontrols.all')} {filter.column}</option>
                        {filterOptions[filter.column]?.map(option => (
                            <option key={option} value={option}>{option}</option>
                        ))}
                    </select>
                </div>
            ))}
        </div>
    );
};