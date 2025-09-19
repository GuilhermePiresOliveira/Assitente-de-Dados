import React, { useState, useRef, useCallback } from 'react';
import { UploadIcon, ClipboardIcon, SparklesIcon, UploadCloudIcon, FileIcon, XIcon } from './icons';
import { ColorPalette, LayoutStyle, PALETTES } from '../types';

// --- Start: Example Data ---
export interface ExampleDataset {
    id: string;
    name: string;
    format: 'CSV' | 'JSON';
    data: string;
}

export const ecommerceSalesData = `OrderID,Product,Category,Price,Quantity,OrderDate,Country
1001,Laptop,Electronics,1200,1,2023-01-15,USA
1002,Smartphone,Electronics,800,2,2023-01-17,Canada
1003,Book,Books,25,5,2023-01-20,USA
1004,Headphones,Electronics,150,1,2023-01-22,UK
1005,T-shirt,Apparel,30,3,2023-02-01,Germany
1006,Laptop,Electronics,1250,1,2023-02-05,USA
1007,Book,Books,22,2,2023-02-10,Canada
1008,Coffee Maker,Home Goods,80,1,2023-02-12,USA
1009,T-shirt,Apparel,35,4,2023-02-18,UK
1010,Smartphone,Electronics,820,1,2023-03-01,Germany
1011,Desk Chair,Furniture,250,1,2023-03-02,USA
1012,Book,Books,19,3,2023-03-05,UK
1013,Headphones,Electronics,160,2,2023-03-10,Canada
1014,Laptop,Electronics,1150,1,2023-03-12,Germany
1015,T-shirt,Apparel,30,5,2023-03-20,USA`;

export const marketingCampaignData = `[
  {"campaignId": "MKT01", "channel": "Facebook", "spend": 500, "clicks": 1200, "conversions": 60, "date": "2023-03-01"},
  {"campaignId": "MKT02", "channel": "Google Ads", "spend": 800, "clicks": 2500, "conversions": 85, "date": "2023-03-01"},
  {"campaignId": "MKT03", "channel": "Email", "spend": 200, "clicks": 900, "conversions": 75, "date": "2023-03-02"},
  {"campaignId": "MKT04", "channel": "Facebook", "spend": 550, "clicks": 1400, "conversions": 65, "date": "2023-03-03"},
  {"campaignId": "MKT05", "channel": "Instagram", "spend": 400, "clicks": 1800, "conversions": 55, "date": "2023-03-04"},
  {"campaignId": "MKT06", "channel": "Google Ads", "spend": 850, "clicks": 2600, "conversions": 92, "date": "2023-03-04"},
  {"campaignId": "MKT07", "channel": "Email", "spend": 250, "clicks": 1100, "conversions": 90, "date": "2023-03-05"},
  {"campaignId": "MKT08", "channel": "Instagram", "spend": 420, "clicks": 2000, "conversions": 60, "date": "2023-03-06"},
  {"campaignId": "MKT09", "channel": "Facebook", "spend": 600, "clicks": 1550, "conversions": 70, "date": "2023-03-07"},
  {"campaignId": "MKT10", "channel": "Google Ads", "spend": 900, "clicks": 2800, "conversions": 105, "date": "2023-03-08"}
]`;

export const exampleDatasets: ExampleDataset[] = [
    { id: 'ecommerce_sales', name: 'E-commerce Sales', data: ecommerceSalesData, format: 'CSV' },
    { id: 'marketing_campaigns', name: 'Marketing Campaigns', data: marketingCampaignData, format: 'JSON' }
];

const exampleDatasetTranslations: { [key: string]: string } = {
    'ecommerce_sales': 'datainput.example.sales',
    'marketing_campaigns': 'datainput.example.marketing',
};
// --- End: Example Data ---

interface DataInputProps {
  rawData: string;
  onRawDataChange: (data: string) => void;
  onGenerate: () => void;
  isLoading: boolean;
  colorPalette: ColorPalette;
  onColorPaletteChange: (palette: ColorPalette) => void;
  layoutStyle: LayoutStyle;
  onLayoutStyleChange: (style: LayoutStyle) => void;
  t: (key: string) => string;
}

enum InputMode {
  Paste = 'paste',
  Upload = 'upload',
}

export const DataInput: React.FC<DataInputProps> = ({ 
    rawData, 
    onRawDataChange, 
    onGenerate, 
    isLoading,
    colorPalette,
    onColorPaletteChange,
    layoutStyle,
    onLayoutStyleChange,
    t 
}) => {
  const [inputMode, setInputMode] = useState<InputMode>(InputMode.Paste);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleClearFile = useCallback(() => {
    setUploadedFileName(null);
    onRawDataChange('');
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  }, [onRawDataChange]);

  const processFile = (file: File | null) => {
    if (!file) return;

    if (!file.type.includes('csv') && !file.type.includes('json') && !file.name.endsWith('.csv') && !file.name.endsWith('.json')) {
      console.error("Unsupported file type");
      return;
    }

    const reader = new FileReader();

    reader.onloadstart = () => {
      setIsUploading(true);
      setUploadProgress(0);
      setUploadedFileName(file.name);
    };

    reader.onprogress = (event) => {
      if (event.lengthComputable) {
        const progress = (event.loaded / event.total) * 100;
        setUploadProgress(progress);
      }
    };

    reader.onload = (e) => {
      const text = e.target?.result as string;
      onRawDataChange(text);
      setUploadProgress(100);
    };
    
    reader.onloadend = () => {
      setTimeout(() => {
        setIsUploading(false);
      }, 500);
    };

    reader.onerror = () => {
      console.error("Error reading file");
      setIsUploading(false);
      handleClearFile();
    };

    reader.readAsText(file);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    processFile(event.target.files?.[0] ?? null);
    if(event.target) event.target.value = '';
  };
  
  const handleDragEnter = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDraggingOver(true);
  };
  
  const handleDragLeave = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDraggingOver(false);
  };
  
  const handleDragOver = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault(); 
    event.stopPropagation();
  };
  
  const handleDrop = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDraggingOver(false);
    processFile(event.dataTransfer.files?.[0] ?? null);
  };
  
  const handleExampleClick = (data: string) => {
    handleClearFile();
    onRawDataChange(data);
    setInputMode(InputMode.Paste);
  };

  const handleTextAreaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onRawDataChange(e.target.value);
      if (uploadedFileName) {
          handleClearFile();
      }
  };

  const renderUploadContent = () => {
    if (isUploading) {
      return (
        <div className="flex flex-col items-center justify-center w-full h-48 px-4 animate-fade-in">
          <p className="mb-2 text-base font-medium text-gray-800 dark:text-gray-200">
            {t('datainput.upload.processing')}
          </p>
          <p className="mb-4 text-sm text-gray-600 dark:text-gray-400 truncate max-w-full px-4">{uploadedFileName}</p>
          <div className="w-full max-w-xs bg-gray-200 rounded-full dark:bg-gray-700">
            <div 
              className="bg-gradient-to-r from-indigo-500 to-purple-600 h-4 rounded-full flex items-center justify-center text-xs font-bold text-white transition-all duration-300 ease-out"
              style={{ width: `${uploadProgress}%` }}
            >
              {uploadProgress > 10 && `${Math.round(uploadProgress)}%`}
            </div>
          </div>
        </div>
      );
    }

    if (uploadedFileName) {
        return (
            <div className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-indigo-300 dark:border-indigo-700 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
                <div className="flex items-center gap-3">
                    <FileIcon className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                    <span className="font-medium text-gray-800 dark:text-gray-200 truncate max-w-xs">{uploadedFileName}</span>
                    <button 
                        onClick={handleClearFile} 
                        className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
                        aria-label="Clear file"
                    >
                        <XIcon className="h-5 w-5" />
                    </button>
                </div>
            </div>
        )
    }

    return (
        <label
            htmlFor="dropzone-file"
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer transition-all duration-300
            ${isDraggingOver 
                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/50' 
                : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 hover:border-indigo-500'}`
            }
        >
          <div className="flex flex-col items-center justify-center text-center p-4">
            <button
              type="button"
              onClick={(e) => {
                  e.preventDefault();
                  fileInputRef.current?.click();
              }}
              disabled={isLoading}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <UploadCloudIcon className="h-5 w-5" />
              <span>{t('datainput.upload.selectFile')}</span>
            </button>
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">{t('datainput.upload.drag')}</p>
            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">{t('datainput.upload.types')}</p>
          </div>
          <input id="dropzone-file" type="file" className="hidden" accept=".csv,.json" onChange={handleFileChange} ref={fileInputRef} disabled={isLoading} />
        </label>
    );
  };


  return (
    <div className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-6 mb-8 shadow-lg animate-fade-in">
      <div className="relative border-b border-gray-200 dark:border-gray-700 mb-4">
          <div className="flex items-center">
            <button
              onClick={() => setInputMode(InputMode.Paste)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors focus:outline-none z-10 ${
                inputMode === InputMode.Paste ? 'text-indigo-600 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white'
              }`}
            >
              <ClipboardIcon className="h-5 w-5" />
              {t('datainput.paste')}
            </button>
            <button
              onClick={() => setInputMode(InputMode.Upload)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors focus:outline-none z-10 ${
                inputMode === InputMode.Upload ? 'text-indigo-600 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white'
              }`}
            >
              <UploadIcon className="h-5 w-5" />
              {t('datainput.upload')}
            </button>
          </div>
          <div 
            className="absolute bottom-[-1px] h-0.5 bg-indigo-500 dark:bg-indigo-400 transition-all duration-300 ease-in-out"
            style={{ 
                left: inputMode === InputMode.Paste ? '0' : 'calc(var(--paste-width, 110px))', 
                width: inputMode === InputMode.Paste ? 'var(--paste-width, 110px)' : 'var(--upload-width, 125px)' 
            }}
            ref={el => {
                if (!el) return;
                const pasteButton = el.previousElementSibling?.children[0];
                const uploadButton = el.previousElementSibling?.children[1];
                if (pasteButton) el.style.setProperty('--paste-width', `${pasteButton.clientWidth}px`);
                if (uploadButton) el.style.setProperty('--upload-width', `${uploadButton.clientWidth}px`);
            }}
          ></div>
      </div>

      {inputMode === InputMode.Paste ? (
        <textarea
          value={rawData}
          className="w-full h-48 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md p-3 text-gray-700 dark:text-gray-300 font-mono text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
          placeholder={t('datainput.placeholder')}
          onChange={handleTextAreaChange}
          disabled={isLoading}
        ></textarea>
      ) : (
        <div className="flex items-center justify-center w-full">
            {renderUploadContent()}
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700/50">
        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-2">{t('datainput.example.title')}</p>
        <div className="flex justify-center flex-wrap gap-3">
            {exampleDatasets.map((dataset) => (
                <button 
                    key={dataset.id}
                    onClick={() => handleExampleClick(dataset.data)}
                    disabled={isLoading}
                    className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-semibold rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 transition-all transform hover:scale-105"
                >
                    {t(exampleDatasetTranslations[dataset.id])} ({dataset.format})
                </button>
            ))}
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700/50 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Color Palette Selector */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">{t('datainput.options.palette')}</h3>
          <div className="flex flex-wrap gap-3">
            {(Object.keys(PALETTES) as ColorPalette[]).map((paletteKey) => (
              <button
                key={paletteKey}
                type="button"
                onClick={() => onColorPaletteChange(paletteKey)}
                className={`w-full sm:w-auto flex-grow text-center px-3 py-2 text-sm font-semibold rounded-md transition-all duration-200 border-2 ${
                  colorPalette === paletteKey
                    ? 'border-indigo-500 dark:border-indigo-400 ring-2 ring-indigo-500/50 dark:ring-indigo-400/50'
                    : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <div className="flex -space-x-1">
                    {PALETTES[paletteKey].slice(0, 4).map((color) => (
                      <div
                        key={color}
                        className="w-4 h-4 rounded-full border-2 border-white dark:border-gray-800"
                        style={{ backgroundColor: color }}
                      ></div>
                    ))}
                  </div>
                  <span className="capitalize text-gray-700 dark:text-gray-300">{t(`datainput.options.palette.${paletteKey}`)}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Layout Style Selector */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">{t('datainput.options.layout')}</h3>
          <div className="flex flex-wrap gap-2 bg-gray-100 dark:bg-gray-900 p-1 rounded-lg">
            {(['standard', 'compact', 'kpi-focused'] as LayoutStyle[]).map(styleKey => (
              <button
                key={styleKey}
                type="button"
                onClick={() => onLayoutStyleChange(styleKey)}
                className={`w-full sm:w-auto flex-grow px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
                  layoutStyle === styleKey
                    ? 'bg-white dark:bg-indigo-600 text-indigo-700 dark:text-white shadow'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-gray-700/50'
                }`}
              >
                {t(`datainput.options.layout.${styleKey}`)}
              </button>
            ))}
          </div>
        </div>
      </div>


      <div className="mt-6 flex justify-end">
        <button
          onClick={onGenerate}
          disabled={isLoading || !rawData}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-900 focus:ring-indigo-500"
        >
          {isLoading ? (
            t('datainput.button.generating')
          ) : (
            <>
              <SparklesIcon className="h-5 w-5" />
              {t('datainput.button.generate')}
            </>
          )}
        </button>
      </div>
    </div>
  );
};
