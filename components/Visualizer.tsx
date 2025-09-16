import React, { useMemo, useState, useEffect } from 'react';
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
  
const ChartLoader: React.FC = () => (
    <div className="flex items-center justify-center h-full w-full">
        <div className="w-8 h-8 border-4 border-t-indigo-500 border-gray-200 dark:border-gray-600 rounded-full animate-spin"></div>
    </div>
);

const ChartErrorMessage: React.FC<{ message: string }> = ({ message }) => (
    <div className="flex items-center justify-center h-full w-full text-center text-red-600 dark:text-red-400 p-4 bg-red-50 dark:bg-red-900/30 rounded-lg border border-red-200 dark:border-red-800">
        <div>
            <p className="font-bold text-base">Chart Error</p>
            <p className="text-sm mt-1">{message}</p>
        </div>
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
  const [isLoading, setIsLoading] = useState(true);
  const { theme } = useTheme();
  const { chartType } = suggestion;
  
  const tickColor = theme === 'dark' ? '#a0aec0' : '#4a5568';
  const gridColor = theme === 'dark' ? '#4a5568' : '#e2e8f0';
  const legendColor = theme === 'dark' ? '#e2e8f0' : '#374151';

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(timer);
  }, [suggestion, data]);

  const chartData = useMemo(() => {
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
  }, [data, suggestion, chartType]);
  
  const totalForPercent = useMemo(() => {
      if (chartType === 'pie' || chartType === 'treemap') {
          return (chartData as AggregatedData[]).reduce((sum, entry) => sum + (entry.value || 0), 0);
      }
      return 0;
  }, [chartData, chartType]);

  const validationError = useMemo(() => {
    // If there's no data, we can't validate, but it's not an error state.
    // The chart will simply render as empty.
    if (data.length === 0) {
        return null;
    }

    const columns = Object.keys(data[0] || {});

    const checkMeasureColumnType = (columnName: string) => {
        // Find a row with a non-empty value in the column to check its type.
        const sampleRow = data.find(row => row[columnName] != null && row[columnName] !== '');
        if (sampleRow && typeof sampleRow[columnName] !== 'number') {
            return `The suggested measure column ('${columnName}') contains non-numeric data, which cannot be plotted.`;
        }
        return null;
    };

    switch (chartType) {
        case 'bar':
        case 'line':
        case 'scatter':
        case 'horizontalBar': {
            const slSuggestion = suggestion as BarLineScatterSuggestion;
            const { xAxis, yAxis } = slSuggestion;

            if (!xAxis) return `Chart configuration is missing the required 'xAxis' property.`;
            if (!yAxis) return `Chart configuration is missing the required 'yAxis' property.`;

            if (!columns.includes(xAxis)) return `The specified xAxis column ('${xAxis}') does not exist in the data.`;
            if (!columns.includes(yAxis)) return `The specified yAxis column ('${yAxis}') does not exist in the data.`;
            
            return checkMeasureColumnType(yAxis);
        }
        case 'pie':
        case 'treemap': {
            const pSuggestion = suggestion as PieSuggestion | TreemapSuggestion;
            const { nameKey, dataKey } = pSuggestion;

            if (!nameKey) return `Chart configuration is missing the required 'nameKey' property.`;
            if (!dataKey) return `Chart configuration is missing the required 'dataKey' property.`;

            if (!columns.includes(nameKey)) return `The specified nameKey column ('${nameKey}') does not exist in the data.`;
            if (!columns.includes(dataKey)) return `The specified dataKey column ('${dataKey}') does not exist in the data.`;

            return checkMeasureColumnType(dataKey);
        }
        default:
            return null;
    }
  }, [suggestion, data, chartType]);


  if (isLoading) {
    return <ChartLoader />;
  }
  
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

    const tooltipContent = <CustomTooltip chartType={chartType} total={totalForPercent} />;
    const mainColor = palette[0];
    const secondaryColor = palette[1];
    const scatterColor = palette[2];

    switch (suggestion.chartType) {
      case 'bar':
        return (
          <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis dataKey={slSuggestion.xAxis} {...commonAxisProps} angle={-20} textAnchor="end" />
            <YAxis {...commonAxisProps} />
            <Tooltip content={tooltipContent} cursor={{ fill: `${mainColor}20` }} />
            <Legend {...commonLegendProps} />
            <Bar dataKey={slSuggestion.yAxis} fill={mainColor} name={slSuggestion.yAxis} />
          </BarChart>
        );
      case 'horizontalBar':
        return (
            <BarChart layout="vertical" data={chartData} margin={{ top: 5, right: 20, left: 30, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis type="number" {...commonAxisProps} />
              <YAxis dataKey={slSuggestion.xAxis} type="category" {...commonAxisProps} width={100} tick={{fontSize: 10}} />
              <Tooltip content={tooltipContent} cursor={{ fill: `${mainColor}20` }} />
              <Legend {...commonLegendProps} />
              <Bar dataKey={slSuggestion.yAxis} fill={mainColor} name={slSuggestion.yAxis} />
            </BarChart>
        );
      case 'line':
        return (
          <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis dataKey={slSuggestion.xAxis} {...commonAxisProps} angle={-20} textAnchor="end"/>
            <YAxis {...commonAxisProps}/>
            <Tooltip content={tooltipContent} cursor={{ stroke: secondaryColor, strokeWidth: 1 }} />
            <Legend {...commonLegendProps}/>
            <Line type="monotone" dataKey={slSuggestion.yAxis} name={slSuggestion.yAxis} stroke={secondaryColor} strokeWidth={2} dot={{ r: 2, fill: secondaryColor }} activeDot={{ r: 6, stroke: secondaryColor }} />
          </LineChart>
        );
      case 'pie':
        return (
          <PieChart margin={{ top: 0, right: 5, left: 5, bottom: 25 }}>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={'80%'}
              fill={mainColor}
              dataKey="value"
              nameKey="name"
              label={({ percent }: any) => (percent * 100) > 4 ? `${(percent * 100).toFixed(0)}%` : null}
              fontSize={11}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={palette[index % palette.length]} />
              ))}
            </Pie>
            <Tooltip content={tooltipContent} />
            <Legend {...commonLegendProps}/>
          </PieChart>
        );
      case 'treemap':
        return (
            <Treemap
                width={400}
                height={200}
                data={chartData as any[]}
                dataKey="value"
                nameKey="name"
                aspectRatio={4 / 3}
                stroke="#fff"
                fill={mainColor}
                content={<CustomizedTreemapContent palette={palette} />}
                isAnimationActive={true}
                animationDuration={500}
            />
        );
      case 'scatter':
        return (
          <ScatterChart margin={{ top: 5, right: 20, left: 0, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis type="number" dataKey={slSuggestion.xAxis} name={slSuggestion.xAxis} {...commonAxisProps}/>
            <YAxis type="number" dataKey={slSuggestion.yAxis} name={slSuggestion.yAxis} {...commonAxisProps}/>
            <Tooltip content={tooltipContent} cursor={{ strokeDasharray: '3 3' }} />
            <Legend {...commonLegendProps} />
            <Scatter name="Data points" data={chartData} fill={scatterColor} />
          </ScatterChart>
        );
      default:
        return <div className="text-red-500 dark:text-red-400">Unsupported chart type</div>;
    }
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      {renderChart()}
    </ResponsiveContainer>
  );
};
