
import Papa from 'papaparse';
import { DataRow, DataSchema, DataType } from '../types';

// More robust date detection regex
const isDate = (s: string): boolean => {
    return !isNaN(Date.parse(s)) && (
      /^\d{4}-\d{2}-\d{2}/.test(s) || // YYYY-MM-DD
      /^\d{1,2}\/\d{1,2}\/\d{2,4}/.test(s) || // MM/DD/YYYY
      /^\d{2}-\w{3}-\d{4}/.test(s) // DD-MMM-YYYY
    );
};

export const parseData = (rawData: string): DataRow[] => {
  const trimmedData = rawData.trim();
  
  // Try to parse as JSON first
  if (trimmedData.startsWith('[') && trimmedData.endsWith(']')) {
    try {
      const jsonData = JSON.parse(trimmedData);
      if (Array.isArray(jsonData) && jsonData.every(item => typeof item === 'object' && item !== null)) {
        // Convert all values to appropriate types, as JSON doesn't have a number/string distinction as clear as CSV dynamicTyping
        return jsonData.map(row => {
          const newRow: DataRow = {};
          for (const key in row) {
            const value = row[key];
            if (typeof value === 'string') {
                const num = parseFloat(value);
                if (!isNaN(num) && isFinite(num) && String(num) === value) {
                    newRow[key] = num;
                } else {
                    newRow[key] = value;
                }
            } else {
                newRow[key] = value;
            }
          }
          return newRow;
        });
      }
    } catch (e) {
      // Not valid JSON, fall through to CSV parsing
    }
  }

  // Fallback to CSV parsing
  const result = Papa.parse(trimmedData, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: true, // Automatically convert numbers, booleans
  });

  if (result.errors.length > 0) {
    console.error('CSV Parsing errors:', result.errors);
    throw new Error(`CSV Parsing Error: ${result.errors[0].message}`);
  }
  
  return result.data as DataRow[];
};


export const inferSchema = (data: DataRow[]): DataSchema[] => {
  if (data.length === 0) {
    return [];
  }

  const firstRow = data[0];
  const headers = Object.keys(firstRow);

  return headers.map((header) => {
    let type: DataType = 'Unknown';
    let example: string | number = '';
    
    // Find the first non-null value to infer type and get an example
    for (const row of data) {
      const value = row[header];
      if (value !== null && value !== undefined && value !== '') {
        example = value;
        if (typeof value === 'number') {
          type = 'Numeric';
        } else if (typeof value === 'string' && isDate(value)) {
          type = 'Date';
        } else {
          type = 'Categorical';
        }
        break;
      }
    }
    
    // If all values are null/empty, we can't do much
    if (type === 'Unknown') {
        type = 'Categorical'; // Default to categorical
        example = 'N/A'
    }

    return {
      name: header,
      type: type,
      example: example,
    };
  });
};
