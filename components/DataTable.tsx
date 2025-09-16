import React, { useState, useMemo } from 'react';
import { DataRow } from '../types';
import { ArrowUpIcon, ArrowDownIcon, SearchIcon } from './icons';

interface DataTableProps {
    data: DataRow[];
    t: (key: string) => string;
}

const ROWS_PER_PAGE = 10;

export const DataTable: React.FC<DataTableProps> = ({ data, t }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'ascending' | 'descending' } | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    
    const headers = useMemo(() => (data.length > 0 ? Object.keys(data[0]) : []), [data]);

    const filteredData = useMemo(() => {
        if (!searchTerm) return data;
        const lowercasedTerm = searchTerm.toLowerCase();
        return data.filter(row => 
            Object.values(row).some(value => 
                String(value).toLowerCase().includes(lowercasedTerm)
            )
        );
    }, [data, searchTerm]);
    
    const sortedData = useMemo(() => {
        let sortableItems = [...filteredData];
        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                const valA = a[sortConfig.key];
                const valB = b[sortConfig.key];
                
                // Basic numeric comparison
                const numA = parseFloat(String(valA));
                const numB = parseFloat(String(valB));

                if (!isNaN(numA) && !isNaN(numB)) {
                    if (numA < numB) return sortConfig.direction === 'ascending' ? -1 : 1;
                    if (numA > numB) return sortConfig.direction === 'ascending' ? 1 : -1;
                    return 0;
                }
                
                // Fallback to string comparison
                if (String(valA).toLowerCase() < String(valB).toLowerCase()) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (String(valA).toLowerCase() > String(valB).toLowerCase()) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [filteredData, sortConfig]);

    const totalPages = Math.ceil(sortedData.length / ROWS_PER_PAGE);

    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * ROWS_PER_PAGE;
        return sortedData.slice(startIndex, startIndex + ROWS_PER_PAGE);
    }, [sortedData, currentPage]);
    

    const requestSort = (key: string) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
        setCurrentPage(1); // Reset to first page on sort
    };

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
        setCurrentPage(1); // Reset to first page on search
    };

    if (data.length === 0) {
        return null; // Don't render the table if there's no initial data
    }

    return (
        <div className="mt-8 bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-4 sm:p-6 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('datatable.title')}</h2>
                <div className="relative w-full sm:w-auto">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <SearchIcon className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder={t('datatable.search')}
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 p-2.5"
                    />
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-700 dark:text-gray-300">
                    <thead className="text-xs text-gray-500 dark:text-gray-400 uppercase bg-gray-50 dark:bg-gray-700/50">
                        <tr>
                            {headers.map((key) => (
                                <th key={key} scope="col" className="px-6 py-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" onClick={() => requestSort(key)}>
                                    <div className="flex items-center gap-2">
                                        {key}
                                        {sortConfig?.key === key ? (
                                            sortConfig.direction === 'ascending' ? <ArrowUpIcon className="h-4 w-4" /> : <ArrowDownIcon className="h-4 w-4" />
                                        ) : null}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedData.length > 0 ? (
                            paginatedData.map((row, index) => (
                                <tr key={index} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                    {headers.map(header => (
                                        <td key={header} className="px-6 py-4 whitespace-nowrap">
                                            {String(row[header])}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={headers.length} className="text-center py-8 px-6 text-gray-500 dark:text-gray-400">
                                    {t('datatable.noData')}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            
            <nav className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-3 md:space-y-0 p-4" aria-label="Table navigation">
                <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                    {t('datatable.pagination.showing')}
                    <span className="font-semibold text-gray-900 dark:text-white mx-1">
                        {sortedData.length > 0 ? (currentPage - 1) * ROWS_PER_PAGE + 1 : 0}-
                        {Math.min(currentPage * ROWS_PER_PAGE, sortedData.length)}
                    </span>
                    {t('datatable.pagination.of')}
                    <span className="font-semibold text-gray-900 dark:text-white mx-1">{sortedData.length}</span>
                     {t('datatable.pagination.results')}
                </span>
                <ul className="inline-flex items-stretch -space-x-px">
                    <li>
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="flex items-center justify-center h-full py-1.5 px-3 ml-0 rounded-l-lg border bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                           {t('datatable.pagination.previous')}
                        </button>
                    </li>
                    <li>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages || totalPages === 0}
                            className="flex items-center justify-center h-full py-1.5 px-3 leading-tight rounded-r-lg border bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {t('datatable.pagination.next')}
                        </button>
                    </li>
                </ul>
            </nav>
        </div>
    );
};