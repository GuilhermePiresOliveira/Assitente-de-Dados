

export type DataRow = { [key: string]: string | number };

export type DataType = 'Numeric' | 'Categorical' | 'Date' | 'Unknown';

export interface DataSchema {
  name: string;
  type: DataType;
  example: string | number;
}

export interface BaseChartSuggestion {
  businessQuestion: string;
  insight: string;
  chartRationale: string;
}

export interface BarLineScatterSuggestion extends BaseChartSuggestion {
  chartType: 'bar' | 'line' | 'scatter' | 'horizontalBar';
  xAxis: string;
  yAxis: string;
  aggregation?: 'sum';
}

export interface PieSuggestion extends BaseChartSuggestion {
  chartType: 'pie';
  nameKey: string;
  dataKey: string;
}

export interface TreemapSuggestion extends BaseChartSuggestion {
  chartType: 'treemap';
  nameKey: string;
  dataKey: string;
}

export type ChartSuggestion = BarLineScatterSuggestion | PieSuggestion | TreemapSuggestion;

export type AggregationType = 'sum' | 'average' | 'count' | 'uniqueCount';

export interface KPISuggestion {
    title: string;
    businessQuestion: string;
    kpiKey: string;
    aggregation: AggregationType;
    prefix?: string;
    suffix?: string;
}

export interface FilterSuggestion {
    column: string;
}

export interface DashboardLayout {
    kpis: KPISuggestion[];
    charts: ChartSuggestion[];
    filters: FilterSuggestion[];
}

export interface ActiveFilters {
  [key: string]: string;
}

// New Types for Customization
export type ColorPalette = 'indigo' | 'emerald' | 'crimson' | 'sky';
export type LayoutStyle = 'standard' | 'compact' | 'kpi-focused';

export const PALETTES: { [key in ColorPalette]: string[] } = {
    indigo: ['#5A67D8', '#818CF8', '#A78BFA', '#C4B5FD', '#E0E7FF', '#3730A3', '#4338CA'],
    emerald: ['#10B981', '#34D399', '#6EE7B7', '#A7F3D0', '#D1FAE5', '#047857', '#059669'],
    crimson: ['#DC2626', '#EF4444', '#F87171', '#FCA5A5', '#FEE2E2', '#991B1B', '#B91C1C'],
    sky: ['#0EA5E9', '#38BDF8', '#7DD3FC', '#BAE6FD', '#E0F2FE', '#0369A1', '#075985'],
};