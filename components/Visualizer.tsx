import React from 'react';
import { useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Treemap,
} from 'recharts';
import { ChartSuggestion, DataRow, BarLineScatterSuggestion, PieSuggestion, TreemapSuggestion } from '../types';
import { aggregateData, AggregatedData, aggregateBarChartData } from '../utils/chartUtils';
import { useTheme } from '../App';

interface VisualizerProps {
  suggestion: ChartSuggestion;
  data: DataRow[];
  palette: string[];
}

const CustomTooltip = ({ active, payload, label, chartType, total }: any) => {
    if (active && payload && payload.length) {
      const wrapperClass = "bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-sm shadow-lg";

      if (chartType === 'pie' || chartType === 'treemap') {
        const data = payload[0];
        // Pie charts provide `percent`. For Treemaps, we calculate it.
        const percentage = data.percent ? (data.percent * 100).toFixed(1) : (total > 0 ? ((data.value / total) * 100).toFixed(1) : '0');
        return (
          <div className={wrapperClass}>
            <p className="label text-gray-900 dark:text-white font-bold">{data.name}</p>
            <p style={{ color: data.color }} className="text-gray-700 dark:text-gray-300">
                <span className="font-semibold">Value: </span>{data.value.toLocaleString()}
            </p>
             <p style={{ color: data.color }} className="text-gray-700 dark:text-gray-300">
                <span className="font-semibold">Share: </span>{percentage}%
            </p>
          </div>
        );
      }
      
      return (
        <div className={wrapperClass}>
          <p className="label text-gray-900 dark:text-white font-bold">{`${label}`}</p>
          {payload.map((pld: any, index: number) => (
            <p key={index} style={{ color: pld.color }} className="text-gray-700 dark:text-gray-300">
                <span style={{ fontWeight: 'bold' }}>{pld.name}: </span>
                {typeof pld.value === 'number' ? pld.value.toLocaleString() : pld.value}
            </p>
          ))}
        </div>
      );
    }
  
    return null;
  };
  
const ChartErrorMessage: React.FC<{ message: string }> = ({ message }) => (
    <div className="flex flex-col items-center justify-center h-full w-full text-center text-red-600 dark:text-red-400 p-4 bg-red-50 dark:bg-red-900/30 rounded-lg border border-red-200 dark:border-red-800">
        <div className="font-bold text-base mb-1">⚠️ Chart Generation Failed</div>
        <p className="text-sm">The AI's suggestion for this chart was invalid with the current data.</p>
        <p className="text-xs mt-2 text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 p-2 rounded">
          <strong>Details:</strong> {message}
        </p>
    </div>
);

const CustomizedTreemapContent = (props: any) => {
    const { depth, x, y, width, height, index, name, value, palette } = props;
    const textFits = width > 50 && height > 20;

    return (
        <g>
            <title>{`${name}: ${value?.toLocaleString()}`}</title>
            <rect
                x={x}
                y={y}
                width={width}
                height={height}
                style={{
                    fill: palette[index % palette.length],
                    stroke: '#fff',
                    strokeWidth: 2 / (depth + 1e-10),
                    strokeOpacity: 1 / (depth + 1e-10),
                }}
            />
            {textFits && (
                <text
                    x={x + width / 2}
                    y={y + height / 2 + 5} // +5 to center vertically a bit better
                    textAnchor="middle"
                    fill="#fff"
                    fontSize={14}
                    stroke="rgba(0,0,0,0.5)"
                    strokeWidth={0.5}
                >
                    {name}
                </text>
            )}
        </g>
    );
};

export const Visualizer: React.FC<VisualizerProps> = ({ suggestion, data, palette }) => {
  const { theme } = useTheme();
  
  const tickColor = theme === 'dark' ? '#a0aec0' : '#4a5568';
  const gridColor = theme === 'dark' ? '#4a5568' : '#e2e8f0';
  const legendColor = theme === 'dark' ? '#e2e8f0' : '#374151';

  const validationError = useMemo(() => {
    // No error if there's no data to render. The chart will just be empty.
    if (data.length === 0) {
      return null;
    }

    const columns = Object.keys(data[0] || {});

    // Scans the entire dataset for a given column to ensure all values are numeric.
    const isMeasureColumnNumeric = (columnName: string): { valid: boolean; sample?: any } => {
      for (const row of data) {
        const value = row[columnName];
        if (value !== null && value !== undefined && typeof value !== 'number') {
          return { valid: false, sample: value }; // Found a non-numeric value
        }
      }
      return { valid: true };
    };
    
    const { chartType } = suggestion;

    if (!chartType) {
        return "The AI suggestion is missing a 'chartType'.";
    }

    switch (chartType) {
      case 'bar':
      case 'line':
      case 'scatter':
      case 'horizontalBar': {
        const slSuggestion = suggestion as BarLineScatterSuggestion;
        const { xAxis, yAxis } = slSuggestion;

        if (!xAxis) return `Configuration is missing the required 'xAxis' property.`;
        if (!yAxis) return `Configuration is missing the required 'yAxis' property.`;
        if (!columns.includes(xAxis)) return `The specified dimension column ('${xAxis}') does not exist in the data.`;
        if (!columns.includes(yAxis)) return `The specified measure column ('${yAxis}') does not exist in the data.`;
        
        const validation = isMeasureColumnNumeric(yAxis);
        if (!validation.valid) {
          return `The measure column ('${yAxis}') contains non-numeric data (e.g., "${validation.sample}"), which cannot be plotted.`;
        }
        break;
      }
      case 'pie':
      case 'treemap': {
        const pSuggestion = suggestion as PieSuggestion | TreemapSuggestion;
        const { nameKey, dataKey } = pSuggestion;

        if (!nameKey) return `Configuration is missing the 'nameKey' property for chart labels.`;
        if (!dataKey) return `Configuration is missing the 'dataKey' property for chart values.`;
        if (!columns.includes(nameKey)) return `The specified category column ('${nameKey}') does not exist in the data.`;
        if (!columns.includes(dataKey)) return `The specified value column ('${dataKey}') does not exist in the data.`;

        const validation = isMeasureColumnNumeric(dataKey);
        if (!validation.valid) {
          return `The value column ('${dataKey}') contains non-numeric data (e.g., "${validation.sample}"), which cannot be plotted.`;
        }
        break;
      }
    }
    return null; // All checks passed
  }, [suggestion, data]);


  const chartData = useMemo(() => {
    if (validationError) return []; // Don't compute data if validation failed

    const { chartType } = suggestion;
    if (chartType === 'pie' || chartType === 'treemap') {
      return aggregateData(data, (suggestion as PieSuggestion | TreemapSuggestion).nameKey, (suggestion as PieSuggestion | TreemapSuggestion).dataKey);
    }

    if ((chartType === 'bar' || chartType === 'horizontalBar' || chartType === 'line') && data.length > 0) {
        const chartSuggestion = suggestion as BarLineScatterSuggestion;
        const { xAxis, yAxis } = chartSuggestion;
        
        let applyAggregation = chartSuggestion.aggregation === 'sum';

        // Heuristic fallback: if aggregation is not specified, check if the dimension (xAxis) has duplicates.
        // If it does, aggregation is needed.
        if (!applyAggregation && xAxis && data.length > 0) {
            const xValues = new Set(data.map(d => d[xAxis]));
            if (xValues.size < data.length) {
                console.warn(`Heuristic applied: Aggregating data for chart "${chartSuggestion.businessQuestion}" as its dimension ('${xAxis}') has duplicate values.`);
                applyAggregation = true;
            }
        }

        if (applyAggregation) {
            return aggregateBarChartData(data, xAxis, yAxis);
        }
    }

    // For scatter plots or charts without aggregation
    return data;
  }, [data, suggestion, validationError]);
  
  const totalForPercent = useMemo(() => {
      const { chartType } = suggestion;
      if (chartType === 'pie' || chartType === 'treemap') {
          return (chartData as AggregatedData[]).reduce((sum, entry) => sum + (entry.value || 0), 0);
      }
      return 0;
  }, [chartData, suggestion]);
  
  const dataChecksum = useMemo(() => {
    // Creates a simple, fast checksum of the data to use as a key.
    // This forces the chart to re-mount when data changes, avoiding complex update bugs.
    if (!data || data.length === 0) {
      return 'no-data';
    }
    const firstRow = JSON.stringify(data[0]);
    const lastRow = JSON.stringify(data[data.length - 1]);
    return `${data.length}-${firstRow}-${lastRow}`;
  }, [data]);

  if (validationError) {
      return <ChartErrorMessage message={validationError} />;
  }

  const renderChart = () => {
    const slSuggestion = suggestion as BarLineScatterSuggestion;
    const commonAxisProps = {
        stroke: tickColor,
        fontSize: 12,
        tick: { fill: tickColor }
    };
    const commonLegendProps = {
        verticalAlign: 'bottom' as const,
        wrapperStyle: { color: legendColor, fontSize: '12px', paddingTop: '10px' }
    };

    const tooltipContent = <CustomTooltip chartType={suggestion.chartType} total={totalForPercent} />;
    const mainColor = palette[0];
    const secondaryColor = palette[1];
    const scatterColor = palette[2];

    switch (suggestion.chartType) {
      case 'bar':
        return (
          // Fix: The 'animationDuration' prop is not valid on BarChart. Use 'isAnimationActive={false}' to disable animations.
          <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis dataKey={slSuggestion.xAxis} {...commonAxisProps} angle={-20} textAnchor="end" />
            <YAxis {...commonAxisProps} />
            <Tooltip content={tooltipContent} cursor={{ fill: `${mainColor}20` }} isAnimationActive={false} animationDuration={0} />
            <Legend {...commonLegendProps} />
            {/* FIX: Moved isAnimationActive to the Bar component to resolve TS error */}
            <Bar dataKey={slSuggestion.yAxis} fill={mainColor} name={slSuggestion.yAxis} isAnimationActive={false} />
          </BarChart>
        );
      case 'horizontalBar':
        return (
            // Fix: The 'animationDuration' prop is not valid on BarChart. Use 'isAnimationActive={false}' to disable animations.
            <BarChart layout="vertical" data={chartData} margin={{ top: 5, right: 20, left: 30, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis type="number" {...commonAxisProps} />
              <YAxis dataKey={slSuggestion.xAxis} type="category" {...commonAxisProps} width={100} tick={{fontSize: 10}} />
              <Tooltip content={tooltipContent} cursor={{ fill: `${mainColor}20` }} isAnimationActive={false} animationDuration={0} />
              <Legend {...commonLegendProps} />
              {/* FIX: Moved isAnimationActive to the Bar component to resolve TS error */}
              <Bar dataKey={slSuggestion.yAxis} fill={mainColor} name={slSuggestion.yAxis} isAnimationActive={false} />
            </BarChart>
        );
      case 'line':
        return (
          // Fix: The 'animationDuration' prop is not valid on LineChart. Use 'isAnimationActive={false}' to disable animations.
          <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis dataKey={slSuggestion.xAxis} {...commonAxisProps} angle={-20} textAnchor="end"/>
            <YAxis {...commonAxisProps}/>
            <Tooltip content={tooltipContent} cursor={{ stroke: secondaryColor, strokeWidth: 1 }} isAnimationActive={false} animationDuration={0} />
            <Legend {...commonLegendProps}/>
            {/* FIX: Moved isAnimationActive to the Line component to resolve TS error */}
            <Line type="monotone" dataKey={slSuggestion.yAxis} name={slSuggestion.yAxis} stroke={secondaryColor} strokeWidth={2} dot={{ r: 2, fill: secondaryColor }} activeDot={{ r: 6, stroke: secondaryColor }} isAnimationActive={false} />
          </LineChart>
        );
      case 'pie':
        return (
          // Fix: The 'animationDuration' prop is not valid on PieChart. Use 'isAnimationActive={false}' to disable animations.
          <PieChart margin={{ top: 0, right: 5, left: 5, bottom: 25 }}>
            <Pie
              // FIX: Cast chartData to any[] to resolve typing issue with recharts.
              data={chartData as any[]}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={'80%'}
              fill={mainColor}
              dataKey="value"
              nameKey="name"
              label={({ percent }: any) => (percent * 100) > 4 ? `${(percent * 100).toFixed(0)}%` : null}
              fontSize={11}
              // FIX: Moved isAnimationActive to the Pie component to resolve TS error
              isAnimationActive={false}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={palette[index % palette.length]} />
              ))}
            </Pie>
            <Tooltip content={tooltipContent} isAnimationActive={false} animationDuration={0} />
            <Legend {...commonLegendProps}/>
          </PieChart>
        );
      case 'treemap':
        return (
            <Treemap
                data={chartData as any[]}
                dataKey="value"
                nameKey="name"
                aspectRatio={4 / 3}
                stroke="#fff"
                fill={mainColor}
                content={<CustomizedTreemapContent palette={palette} />}
                isAnimationActive={false}
            />
        );
      case 'scatter':
        return (
          // Fix: The 'animationDuration' prop is not valid on ScatterChart. Use 'isAnimationActive={false}' to disable animations.
          <ScatterChart margin={{ top: 5, right: 20, left: 0, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis type="number" dataKey={slSuggestion.xAxis} name={slSuggestion.xAxis} {...commonAxisProps}/>
            <YAxis type="number" dataKey={slSuggestion.yAxis} name={slSuggestion.yAxis} {...commonAxisProps}/>
            <Tooltip content={tooltipContent} cursor={{ strokeDasharray: '3 3' }} isAnimationActive={false} animationDuration={0} />
            <Legend {...commonLegendProps} />
            {/* FIX: Moved isAnimationActive to the Scatter component to resolve TS error */}
            <Scatter name="Data points" data={chartData} fill={scatterColor} isAnimationActive={false} />
          </ScatterChart>
        );
      default:
        // The type of `suggestion` is narrowed to `never` here because all valid `chartType` cases are handled.
        // We cast to `any` to still be able to display the unexpected chartType for debugging purposes.
        return <div className="text-red-500 dark:text-red-400">Unsupported chart type: {(suggestion as any).chartType}</div>;
    }
  };
  
  const ChartComponent = renderChart();

  return (
    <ResponsiveContainer width="100%" height="100%" key={dataChecksum}>
      {ChartComponent}
    </ResponsiveContainer>
  );
};