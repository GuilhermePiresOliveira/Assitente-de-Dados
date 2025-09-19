import { GoogleGenAI, Type } from "@google/genai";
import { DashboardLayout, DataRow, ColorPalette, LayoutStyle } from '../types';
import { inferSchema } from '../utils/dataParser';

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        kpis: {
            type: Type.ARRAY,
            description: "A list of 3-4 key performance indicators (KPIs).",
            items: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING, description: "The name of the KPI, e.g., 'Total Revenue'." },
                    businessQuestion: { type: Type.STRING, description: "A question that this KPI answers, explaining its relevance. e.g., 'What is the total revenue generated?'" },
                    kpiKey: { type: Type.STRING, description: "The column name to perform the calculation on." },
                    aggregation: { type: Type.STRING, enum: ['sum', 'average', 'count', 'uniqueCount'], description: "The aggregation method." },
                    prefix: { type: Type.STRING, description: "Optional prefix for the value, e.g., '$'." },
                    suffix: { type: Type.STRING, description: "Optional suffix for the value, e.g., '%'." },
                },
                required: ["title", "businessQuestion", "kpiKey", "aggregation"]
            }
        },
        charts: {
            type: Type.ARRAY,
            description: "A list of 4-6 diverse and meaningful chart suggestions.",
            items: {
                type: Type.OBJECT,
                properties: {
                    businessQuestion: { type: Type.STRING, description: "The business question this chart answers. Phrase as a question, e.g., 'What are the top 5 performing products?'." },
                    insight: { type: Type.STRING, description: "A one-sentence insight answering the business question based on the visualization." },
                    chartRationale: { type: Type.STRING, description: "A brief explanation of why this specific chart type (e.g., bar, line) is the most effective choice for answering the business question and visualizing the data." },
                    chartType: { type: Type.STRING, enum: ['bar', 'line', 'pie', 'scatter', 'horizontalBar', 'treemap'], description: "The type of chart to use." },
                    xAxis: { type: Type.STRING, description: "The column name for the X-axis (for bar, line, scatter charts)." },
                    yAxis: { type: Type.STRING, description: "The column name for the Y-axis (for bar, line, scatter charts)." },
                    aggregation: { type: Type.STRING, enum: ['sum'], description: "Optional: specify 'sum' if the y-axis values must be summed for each unique x-axis value (e.g., total sales per product). Omit if no aggregation is needed (e.g., for time series)." },
                    nameKey: { type: Type.STRING, description: "The column name for category labels (for pie charts)." },
                    dataKey: { type: Type.STRING, description: "The column name for numeric values (for pie charts)." },
                },
                required: ["businessQuestion", "insight", "chartType", "chartRationale"]
            }
        },
        filters: {
            type: Type.ARRAY,
            description: "A list of 1-3 column names suitable for filtering the dashboard.",
            items: {
                type: Type.OBJECT,
                properties: {
                    column: { type: Type.STRING, description: "The name of a categorical or date column to use as a filter." }
                },
                required: ["column"]
            }
        }
    },
    required: ["kpis", "charts", "filters"]
};

export const getDashboardLayout = async (
  data: DataRow[],
  language: 'en' | 'pt',
  palette: ColorPalette,
  layoutStyle: LayoutStyle
): Promise<{ layout: DashboardLayout | null; error: string | null; }> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
    const schema = inferSchema(data);
    const schemaString = schema.map(s => `- ${s.name} (${s.type}, e.g., "${s.example}")`).join('\n');
    
    const languageInstruction = language === 'pt' 
      ? "IMPORTANT: Your entire response, including all text in the 'kpis' (especially 'title' and 'businessQuestion'), 'charts' (especially 'businessQuestion', 'insight', and 'chartRationale') sections, MUST be in Brazilian Portuguese."
      : "IMPORTANT: Your entire response, including all text in the 'kpis' (especially 'title' and 'businessQuestion'), 'charts' (especially 'businessQuestion', 'insight', and 'chartRationale') sections, MUST be in English.";

    const layoutInstruction = `
      - **Layout Style**: The user prefers a '${layoutStyle}' layout.
        - If 'standard', provide a balanced mix of KPIs and charts.
        - If 'compact', suggest more charts (5-6) and fewer KPIs (2-3) to maximize data density.
        - If 'kpi-focused', prioritize KPIs (4) and select charts that directly support them.
    `;
    
    const prompt = `
      You are an expert data analyst and dashboard designer. Your task is to create a configuration for a business intelligence dashboard based on a given data schema and user preferences.
      ${languageInstruction}

      **User Preferences:**
      ${layoutInstruction}

      The dashboard will have three main parts:
      1. A top row of KPIs.
      2. A set of 1-3 filters to slice the data.
      3. A grid of charts that tell a story about the data.

      Here is the data schema:
      ${schemaString}

      Based on this schema and the user preferences, provide a complete configuration for the dashboard.
      
      - **For KPIs**, choose high-level summary metrics and formulate a 'businessQuestion' that each KPI answers. For 'uniqueCount', apply it to a categorical column.
      - **For Filters**, choose categorical columns with a reasonable number of unique values (e.g., less than 20) that would be useful for segmenting the data.
      
      - **For Charts**, follow these rules meticulously to ensure a valid dashboard configuration. Failure to adhere to these property requirements will result in an error.
          - **MANDATORY Property Requirements by Chart Type**:
              - For \`chartType: 'bar'\`, \`chartType: 'line'\`, \`chartType: 'scatter'\`, or \`chartType: 'horizontalBar'\`: You MUST provide BOTH \`xAxis\` (a categorical or date column) AND \`yAxis\` (a numeric column).
              - For \`chartType: 'pie'\` or \`chartType: 'treemap'\`: You MUST provide BOTH \`nameKey\` (a categorical column) AND \`dataKey\` (a numeric column).

          - Each chart must answer a specific business question, provide a concise insight, and a rationale for the chart type choice.
          - ALWAYS select the single best chart type for the question and data. Do not suggest alternatives.
          
          - **Column Selection Rules**:
              - Each chart must have one 'dimension' (a 'Categorical' or 'Date' column) and one 'measure' (a 'Numeric' column).
              - The properties you use (\`xAxis\`, \`yAxis\`, \`nameKey\`, \`dataKey\`) MUST use column names that exist in the provided schema. Do not invent column names.

          - **DO NOT** swap 'xAxis' and 'yAxis' for horizontal bar charts. The frontend handles orientation. 'xAxis' is always the category, 'yAxis' is always the value.

          - **Aggregation Logic**:
              - For 'bar', 'line', and 'horizontalBar' charts, if the data needs to be summed up for each category on the x-axis, you MUST include the property 'aggregation' with the value 'sum'.
              - Example: If the data has multiple rows for each 'Product' and the question is 'Total sales per product', you MUST use 'aggregation: "sum"'.
              - Example: If the question is 'Sales over time' and each row is a unique date, you should OMIT 'aggregation'.
          
          - Provide a 'chartRationale' explaining why the chosen chart type is the best fit for the data and question (e.g., 'A bar chart is ideal for comparing totals across distinct categories.', 'A horizontal bar chart is excellent when category labels are long.', 'A line chart is best for showing a trend over time.', 'A pie chart is ideal for showing part-to-whole proportions.', 'A treemap is effective for showing part-to-whole relationships with many categories.').
          - Ensure all column names provided (e.g., for xAxis, kpiKey, dataKey) exist EXACTLY as specified in the schema. Do not invent new column names.

      Return the output as a single JSON object that strictly follows the provided schema. Do not include any introductory text, comments, or code block formatting. The entire output must be the JSON object itself.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });
    
    const jsonText = response.text.trim();
    const layout = JSON.parse(jsonText);
    return { layout: layout as DashboardLayout, error: null };

  } catch (e) {
    console.error("Error in getDashboardLayout:", e);
    
    let detailedError = "An unexpected error occurred while generating the dashboard.";
    if (e instanceof Error) {
        if (e.message.toLowerCase().includes('api key') || e.message.includes("API_KEY") || e.message.includes("provide an API key")) {
            detailedError = "Could not connect to the AI service due to a configuration issue. The required API Key is either missing or invalid. This is a platform-level problem that needs to be resolved by the administrator.";
        } else {
            detailedError = `Failed to get dashboard layout from the AI. Details: ${e.message}`;
        }
    }
    
    return { layout: null, error: detailedError };
  }
};