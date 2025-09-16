import { DataRow, AggregationType } from '../types';

export interface AggregatedData {
  name: string;
  value: number;
}

export const aggregateData = (data: DataRow[], nameKey: string, dataKey: string): AggregatedData[] => {
  if (!nameKey || !dataKey) return [];
  
  const aggregationMap: { [key: string]: number } = {};

  data.forEach(row => {
    const name = row[nameKey];
    const value = row[dataKey];
    
    if (typeof name === 'string' && typeof value === 'number') {
      if (aggregationMap[name]) {
        aggregationMap[name] += value;
      } else {
        aggregationMap[name] = value;
      }
    }
  });

  return Object.keys(aggregationMap)
    .map(key => ({
      name: key,
      value: aggregationMap[key],
    }))
    .sort((a, b) => b.value - a.value); // Sort for better visualization
};

export const aggregateBarChartData = (data: DataRow[], dimensionKey: string, measureKey: string): DataRow[] => {
    if (!dimensionKey || !measureKey || data.length === 0) return [];

    const aggregationMap = new Map<string | number, number>();

    data.forEach(row => {
        const dimensionValue = row[dimensionKey];
        const measureValue = row[measureKey];

        if (dimensionValue !== undefined && dimensionValue !== null && typeof measureValue === 'number' && !isNaN(measureValue)) {
            const currentSum = aggregationMap.get(dimensionValue) || 0;
            aggregationMap.set(dimensionValue, currentSum + measureValue);
        }
    });

    const aggregated = Array.from(aggregationMap.entries()).map(([dimension, measure]) => ({
        [dimensionKey]: dimension,
        [measureKey]: measure,
    }));
    
    // Sort descending by measure for better visualization
    return aggregated.sort((a, b) => (b[measureKey] as number) - (a[measureKey] as number));
};

export const calculateKPI = (data: DataRow[], key: string, aggregation: AggregationType): number => {
    if (data.length === 0 || !key) return 0;

    switch(aggregation) {
        case 'sum':
            return data.reduce((acc, row) => acc + (typeof row[key] === 'number' ? (row[key] as number) : 0), 0);
        case 'average':
            const sum = data.reduce((acc, row) => acc + (typeof row[key] === 'number' ? (row[key] as number) : 0), 0);
            const count = data.filter(row => typeof row[key] === 'number').length;
            return count > 0 ? sum / count : 0;
        case 'count':
            return data.length;
        case 'uniqueCount':
            const uniqueValues = new Set(data.map(row => row[key]));
            return uniqueValues.size;
        default:
            return 0;
    }
}