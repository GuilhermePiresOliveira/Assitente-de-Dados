import React, { useState, useCallback, useMemo, createContext, useContext, ReactNode, useEffect } from 'react';
import { DataInput } from './components/DataInput';
import { Loader } from './components/Loader';
import { Welcome } from './components/Welcome';
import { Dashboard } from './components/Dashboard';
import { FeedbackPopup } from './components/FeedbackPopup';
import { DashboardLayout, DataRow, ActiveFilters, ColorPalette, LayoutStyle, PALETTES } from './types';
import { parseData } from './utils/dataParser';
import { getDashboardLayout } from './services/geminiService';
import { SunIcon, MoonIcon, MessageSquareIcon } from './components/icons';

// 1. I18N and Context Setup
// =========================
type Language = 'en' | 'pt';
type Translations = {
  [key: string]: { [lang in Language]: string; };
};

const translations: Translations = {
  'app.title': { en: 'Data Visualization Assistant', pt: 'Assistente de Visualização de Dados' },
  'app.subtitle': { en: 'Let AI design an interactive dashboard from your raw data.', pt: 'Deixe a IA projetar um dashboard interativo a partir de seus dados brutos.' },
  'app.creator': { en: 'Created with love by Guilherme Pires', pt: 'Criado com amor por Guilherme Pires' },
  'app.error.oops': { en: 'Oops! Something went wrong.', pt: 'Ops! Algo deu errado.' },
  'app.error.failedToGenerate': { en: 'Failed to generate dashboard.', pt: 'Falha ao gerar o dashboard.' },
  'datainput.paste': { en: 'Paste Data', pt: 'Colar Dados' },
  'datainput.upload': { en: 'Upload File', pt: 'Carregar Arquivo' },
  'datainput.placeholder': { en: 'Paste your CSV or JSON data here...', pt: 'Cole seus dados CSV ou JSON aqui...' },
  'datainput.upload.selectFile': { en: 'Select a File', pt: 'Selecionar Arquivo' },
  'datainput.upload.drag': { en: 'or drag and drop', pt: 'ou arraste e solte' },
  'datainput.upload.types': { en: 'CSV or JSON files', pt: 'Arquivos CSV ou JSON' },
  'datainput.upload.processing': { en: 'Processing', pt: 'Processando' },
  'datainput.button.generating': { en: 'Generating...', pt: 'Gerando...' },
  'datainput.button.generate': { en: 'Generate Dashboard', pt: 'Gerar Dashboard' },
  'datainput.example.title': { en: 'Or try an example dataset:', pt: 'Ou experimente um conjunto de dados de exemplo:' },
  'datainput.example.sales': { en: 'E-commerce Sales', pt: 'Vendas E-commerce' },
  'datainput.example.marketing': { en: 'Marketing Campaigns', pt: 'Campanhas de Marketing' },
  'datainput.options.palette': { en: 'Color Palette', pt: 'Paleta de Cores' },
  'datainput.options.palette.indigo': { en: 'Indigo', pt: 'Índigo' },
  'datainput.options.palette.emerald': { en: 'Emerald', pt: 'Esmeralda' },
  'datainput.options.palette.crimson': { en: 'Crimson', pt: 'Carmesim' },
  'datainput.options.palette.sky': { en: 'Sky', pt: 'Céu' },
  'datainput.options.layout': { en: 'Layout Style', pt: 'Estilo do Layout' },
  'datainput.options.layout.standard': { en: 'Standard', pt: 'Padrão' },
  'datainput.options.layout.compact': { en: 'Compact', pt: 'Compacto' },
  'datainput.options.layout.kpi-focused': { en: 'KPI Focused', pt: 'Focado em KPIs' },
  'loader.message.parsing': { en: 'Parsing and analyzing your data...', pt: 'Analisando seus dados...' },
  'loader.message.designing': { en: 'Designing your new dashboard...', pt: 'Projetando seu novo dashboard...' },
  'loader.submessage': { en: 'This may take a moment...', pt: 'Isso pode levar um momento...' },
  'welcome.title': { en: 'Unlock Insights from Your Data', pt: 'Desvende Insights dos Seus Dados' },
  'welcome.subtitle': { en: 'Stop guessing what to ask your data. Our AI-powered assistant analyzes your dataset and instantly designs a complete, interactive dashboard to reveal hidden patterns and trends.', pt: 'Pare de adivinhar o que perguntar aos seus dados. Nosso assistente com IA analisa seu conjunto de dados e projeta instantaneamente um dashboard completo e interativo para revelar padrões e tendências ocultas.' },
  'welcome.step1.title': { en: '1. Provide Data', pt: '1. Forneça os Dados' },
  'welcome.step1.desc': { en: 'Easily upload a CSV/JSON file or simply paste your raw data into the text box.', pt: 'Carregue facilmente um arquivo CSV/JSON ou simplesmente cole seus dados brutos na caixa de texto.' },
  'welcome.step2.title': { en: '2. Get Suggestions', pt: '2. Obtenha Sugestões' },
  'welcome.step2.desc': { en: 'Our AI designs a full dashboard with relevant KPIs, filters, and charts.', pt: 'Nossa IA projeta um dashboard completo com KPIs, filtros e gráficos relevantes.' },
  'welcome.step3.title': { en: '3. Explore Your Dashboard', pt: '3. Explore Seu Dashboard' },
  'welcome.step3.desc': { en: 'Interact with dynamically generated charts and filter your data to find insights.', pt: 'Interaja com gráficos gerados dinamicamente e filtre seus dados para encontrar insights.' },
  'chartgrid.title': { en: 'AI-Powered Insights', pt: 'Insights Gerados por IA' },
  'chartgrid.export': { en: 'Export CSV', pt: 'Exportar CSV' },
  'chartcard.insight': { en: 'Insight:', pt: 'Insight:' },
  'chartcard.details.title': { en: 'Chart Details', pt: 'Detalhes do Gráfico' },
  'chartcard.details.question': { en: 'Business Question', pt: 'Pergunta de Negócio' },
  'chartcard.details.rationale': { en: 'Chart Rationale', pt: 'Justificativa do Gráfico' },
  'chartcard.details.metrics': { en: 'Metrics & Logic', pt: 'Métricas e Lógica' },
  'chartcard.details.xaxis': { en: 'X-Axis (Dimension)', pt: 'Eixo X (Dimensão)' },
  'chartcard.details.yaxis': { en: 'Y-Axis (Measure)', pt: 'Eixo Y (Métrica)' },
  'chartcard.details.namekey': { en: 'Category (Slices)', pt: 'Categoria (Fatias)' },
  'chartcard.details.datakey': { en: 'Value (Size)', pt: 'Valor (Tamanho)' },
  'chartcard.details.logic.bar_line_scatter': { en: "Plots '{yAxis}' against '{xAxis}'.", pt: "Plota '{yAxis}' em função de '{xAxis}'." },
  'chartcard.details.logic.pie': { en: "Each slice represents a '{nameKey}', with its size determined by the sum of '{dataKey}'. Formula: SUM({dataKey})", pt: "Cada fatia representa um '{nameKey}', com o tamanho determinado pela soma de '{dataKey}'. Fórmula: SUM({dataKey})" },
  'chartcard.details.logic.treemap': { en: "Each rectangle represents a '{nameKey}', with its area determined by the sum of '{dataKey}'. Formula: SUM({dataKey})", pt: "Cada retângulo representa um '{nameKey}', com sua área determinada pela soma de '{dataKey}'. Fórmula: SUM({dataKey})" },
  'filtercontrols.title': { en: 'Filters:', pt: 'Filtros:' },
  'filtercontrols.all': { en: 'All', pt: 'Todos' },
  'history.undo': { en: 'Undo Filter Change', pt: 'Desfazer Alteração de Filtro' },
  'history.redo': { en: 'Redo Filter Change', pt: 'Refazer Alteração de Filtro' },
  'kpipanel.tooltip.aggregation': { en: 'Aggregation:', pt: 'Agregação:' },
  'kpipanel.details.title': { en: 'KPI Details', pt: 'Detalhes do KPI' },
  'kpipanel.details.question': { en: 'Business Question', pt: 'Pergunta de Negócio' },
  'kpipanel.details.logic': { en: 'Business Logic', pt: 'Lógica de Negócio' },
  'kpipanel.details.formula': { en: 'Formula', pt: 'Fórmula' },
  'kpipanel.logic.sum': { en: "Calculates the total sum of the '{column}' column.", pt: "Calcula a soma total da coluna '{column}'." },
  'kpipanel.logic.average': { en: "Calculates the average value of the '{column}' column.", pt: "Calcula o valor médio da coluna '{column}'." },
  'kpipanel.logic.count': { en: 'Counts the total number of records.', pt: 'Conta o número total de registros.' },
  'kpipanel.logic.uniqueCount': { en: "Counts the number of unique values in the '{column}' column.", pt: "Conta o número de valores únicos na coluna '{column}'." },
  'datatable.title': { en: 'Filtered Data', pt: 'Dados Filtrados' },
  'datatable.search': { en: 'Search table...', pt: 'Pesquisar na tabela...' },
  'datatable.noData': { en: 'No matching records found.', pt: 'Nenhum registro correspondente encontrado.' },
  'datatable.pagination.showing': { en: 'Showing', pt: 'Mostrando' },
  'datatable.pagination.of': { en: 'of', pt: 'de' },
  'datatable.pagination.results': { en: 'results', pt: 'resultados' },
  'datatable.pagination.previous': { en: 'Previous', pt: 'Anterior' },
  'datatable.pagination.next': { en: 'Next', pt: 'Próximo' },
  'feedback.button.tooltip': { en: 'Leave Feedback', pt: 'Deixar Feedback' },
  'feedback.popup.title': { en: 'Share Your Feedback', pt: 'Compartilhe Seu Feedback' },
  'feedback.popup.rating': { en: 'How would you rate your experience?', pt: 'Como você avalia sua experiência?' },
  'feedback.popup.placeholder': { en: 'Tell us what you liked or what could be improved...', pt: 'Diga-nos o que você gostou ou o que poderia ser melhorado...' },
  'feedback.popup.button.cancel': { en: 'Cancel', pt: 'Cancelar' },
  'feedback.popup.button.submit': { en: 'Submit Feedback', pt: 'Enviar Feedback' },
  'feedback.popup.thanks.title': { en: 'Thank You!', pt: 'Obrigado!' },
  'feedback.popup.thanks.message': { en: 'Your feedback helps us improve.', pt: 'Seu feedback nos ajuda a melhorar.' },
  'feedback.popup.thanks.button.close': { en: 'Close', pt: 'Fechar' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, params?: { [key: string]: string | number }) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within a LanguageProvider');
  return context;
};

const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('pt');
  
  const t = (key: string, params?: { [key: string]: string | number }): string => {
    let translation = translations[key]?.[language] || key;
    if (params) {
      Object.keys(params).forEach(paramKey => {
        translation = translation.replace(`{${paramKey}}`, String(params[paramKey]));
      });
    }
    return translation;
  };

  return <LanguageContext.Provider value={{ language, setLanguage, t }}>{children}</LanguageContext.Provider>;
};

// 2. Theme Context
// =================
type Theme = 'light' | 'dark';
interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = (): ThemeContextType => {
    const context = useContext(ThemeContext);
    if (!context) throw new Error('useTheme must be used within a ThemeProvider');
    return context;
}

const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [theme, setTheme] = useState<Theme>(() => {
        const storedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        return (storedTheme as Theme) || (prefersDark ? 'dark' : 'light');
    });

    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

// 3. Main App Component
const AppContent: React.FC = () => {
  const [rawData, setRawData] = useState<string>('');
  const [parsedData, setParsedData] = useState<DataRow[]>([]);
  const [dashboardLayout, setDashboardLayout] = useState<DashboardLayout | null>(null);
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>({});
  
  // Undo/Redo state
  const [filterHistory, setFilterHistory] = useState<ActiveFilters[]>([{}]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Customization state
  const [colorPalette, setColorPalette] = useState<ColorPalette>('indigo');
  const [layoutStyle, setLayoutStyle] = useState<LayoutStyle>('standard');

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const hasSeenPopup = localStorage.getItem('hasSeenFeedbackPopup');
    if (!hasSeenPopup) {
      const timer = setTimeout(() => {
        setIsFeedbackOpen(true);
        localStorage.setItem('hasSeenFeedbackPopup', 'true');
      }, 5000); // 5 seconds delay

      return () => clearTimeout(timer);
    }
  }, []); // Empty dependency array ensures this runs only once on mount

  const handleGenerate = useCallback(async () => {
    if (!rawData) {
      setError('Please provide some data first.');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setDashboardLayout(null);
    setActiveFilters({});
    
    // Reset filter history
    setFilterHistory([{}]);
    setHistoryIndex(0);
    
    try {
      setLoadingMessage('loader.message.parsing');
      const data = parseData(rawData);
      if (data.length === 0) {
        throw new Error("No data could be parsed. Please check the format.");
      }
      setParsedData(data);
      
      setLoadingMessage('loader.message.designing');
      const { layout, error: apiError } = await getDashboardLayout(data, language, colorPalette, layoutStyle);

      if (apiError) {
        setError(apiError);
        setDashboardLayout(null);
      } else {
        setDashboardLayout(layout);
      }
      
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      console.error("An unexpected error occurred in handleGenerate:", e);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  }, [rawData, language, colorPalette, layoutStyle]);

  const handleFilterChange = (filterKey: string, value: string) => {
    // This creates a new state based on the current one
    const newActiveFilters = {
      ...activeFilters,
      [filterKey]: value
    };

    // Prune the history if we've undone and are now making a new change
    const newHistory = [...filterHistory.slice(0, historyIndex + 1), newActiveFilters];
    
    setFilterHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setActiveFilters(newActiveFilters);
  };

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < filterHistory.length - 1;

  const handleUndo = useCallback(() => {
    if (canUndo) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setActiveFilters(filterHistory[newIndex]);
    }
  }, [canUndo, historyIndex, filterHistory]);

  const handleRedo = useCallback(() => {
      if (canRedo) {
          const newIndex = historyIndex + 1;
          setHistoryIndex(newIndex);
          setActiveFilters(filterHistory[newIndex]);
      }
  }, [canRedo, historyIndex, filterHistory]);
  
  const filteredData = useMemo(() => {
    if (Object.keys(activeFilters).length === 0) {
      return parsedData;
    }
    return parsedData.filter(row => {
      return Object.entries(activeFilters).every(([key, value]) => {
        return value === 'all' || String(row[key]) === value;
      });
    });
  }, [parsedData, activeFilters]);

  return (
    <>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-200 font-sans p-4 sm:p-6 lg:p-8 transition-colors duration-300">
        <div className="max-w-7xl mx-auto">
          <header className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight animate-gradient-text">
                {t('app.title')}
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                {t('app.subtitle')}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <p className="hidden sm:block text-sm text-gray-500 dark:text-gray-400">
                {t('app.creator')}
              </p>
              <button onClick={toggleTheme} className="p-2 rounded-full text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors">
                  {theme === 'light' ? <MoonIcon className="h-6 w-6" /> : <SunIcon className="h-6 w-6" />}
              </button>
              <div className="flex items-center bg-gray-200 dark:bg-gray-800 rounded-full p-1 border border-gray-300 dark:border-gray-700">
                  <button onClick={() => setLanguage('en')} className={`px-3 py-1 text-sm font-semibold rounded-full transition-colors ${language === 'en' ? 'bg-indigo-600 text-white' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-700'}`}>EN</button>
                  <button onClick={() => setLanguage('pt')} className={`px-3 py-1 text-sm font-semibold rounded-full transition-colors ${language === 'pt' ? 'bg-indigo-600 text-white' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-700'}`}>PT</button>
              </div>
            </div>
          </header>

          <main>
            <DataInput
              rawData={rawData}
              onRawDataChange={setRawData}
              onGenerate={handleGenerate}
              isLoading={isLoading}
              colorPalette={colorPalette}
              onColorPaletteChange={setColorPalette}
              layoutStyle={layoutStyle}
              onLayoutStyleChange={setLayoutStyle}
              t={t}
            />
            
            {error && (
              <div className="mt-6 bg-red-100 dark:bg-red-900/50 border border-red-300 dark:border-red-700 text-red-800 dark:text-red-300 px-4 py-3 rounded-lg text-left">
                <p className="font-semibold">{t('app.error.oops')}</p>
                <p className="text-sm mt-1 whitespace-pre-wrap">{`${t('app.error.failedToGenerate')} ${error}`}</p>
              </div>
            )}

            {isLoading && <Loader message={loadingMessage} t={t} />}

            {!isLoading && dashboardLayout && (
              <Dashboard 
                layout={dashboardLayout}
                data={filteredData}
                originalData={parsedData}
                activeFilters={activeFilters}
                onFilterChange={handleFilterChange}
                onUndo={handleUndo}
                onRedo={handleRedo}
                canUndo={canUndo}
                canRedo={canRedo}
                palette={PALETTES[colorPalette]}
                t={t}
              />
            )}

            {!isLoading && !dashboardLayout && !error && (
              <Welcome t={t} />
            )}
          </main>
        </div>
      </div>
      <button
        onClick={() => setIsFeedbackOpen(true)}
        title={t('feedback.button.tooltip')}
        className="fixed bottom-6 right-6 bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:bg-indigo-700 transition-all transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 z-40"
      >
        <MessageSquareIcon className="h-6 w-6" />
      </button>
      <FeedbackPopup 
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
        t={t}
      />
    </>
  );
};

// 4. App Wrapper with Providers
const App: React.FC = () => (
    <ThemeProvider>
      <LanguageProvider>
          <AppContent />
      </LanguageProvider>
    </ThemeProvider>
);


export default App;
