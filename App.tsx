import React, { useState, useCallback } from 'react';
import type { ParseResult } from 'papaparse';
import DataImportScreen from './components/DataImportScreen';
import DataCleaningWorkbench from './components/DataCleaningWorkbench';
import { getCleaningSuggestions } from './services/geminiService';
import type { Suggestion, TransformationLogEntry, CsvData } from './types';
import { generatePseudoCode } from './utils/codeGenerator';

const App: React.FC = () => {
  const [csvData, setCsvData] = useState<CsvData | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [transformationLog, setTransformationLog] = useState<TransformationLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleDataUpload = useCallback(async (results: ParseResult<string[]>, name: string) => {
    setIsLoading(true);
    setError(null);
    setSuggestions([]);
    setTransformationLog([]);
    
    const header = results.data[0];
    const data = results.data.slice(1).filter(row => row.length === header.length);

    const structuredData = { header, rows: data };
    setCsvData(structuredData);
    setFileName(name);

    try {
      const aiSuggestions = await getCleaningSuggestions(structuredData);
      setSuggestions(aiSuggestions);
    } catch (e) {
      console.error(e);
      setError('Failed to get cleaning suggestions from AI. Please check the API key and try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleApproveSuggestion = useCallback((suggestion: Suggestion, suggestionIndex: number) => {
    if (!csvData) return;

    // Create a deep copy to avoid direct state mutation
    const newCsvData: CsvData = {
      header: [...csvData.header],
      rows: csvData.rows.map(row => [...row]),
    };
    
    const colIndex = newCsvData.header.indexOf(suggestion.column_name);
    if (colIndex === -1) return;

    if(suggestion.row_index !== undefined && suggestion.row_index !== null) {
      // Apply change to a specific cell
      newCsvData.rows[suggestion.row_index][colIndex] = suggestion.suggested_value!;
    } else {
       // Apply change to the whole column based on original value
      newCsvData.rows.forEach(row => {
        if(row[colIndex] === suggestion.original_value) {
          row[colIndex] = suggestion.suggested_value!;
        }
      });
    }

    setCsvData(newCsvData);

    const newLogEntry: TransformationLogEntry = {
      id: Date.now(),
      description: suggestion.description,
      suggestion,
      timestamp: new Date().toISOString(),
      pseudoCode: generatePseudoCode(suggestion),
    };

    setTransformationLog(prevLog => [newLogEntry, ...prevLog]);
    setSuggestions(prev => prev.filter((_, index) => index !== suggestionIndex));

  }, [csvData]);
  
  const handleRejectSuggestion = useCallback((suggestionIndex: number) => {
    setSuggestions(prev => prev.filter((_, index) => index !== suggestionIndex));
  }, []);

  const resetState = () => {
    setCsvData(null);
    setFileName('');
    setSuggestions([]);
    setTransformationLog([]);
    setIsLoading(false);
    setError(null);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-slate-200 p-3 px-6 flex justify-between items-center z-10">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">✨</span>
          <h1 className="text-lg font-semibold text-slate-900">Aura</h1>
        </div>
        {csvData && (
          <button 
            onClick={resetState}
            className="text-sm border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-semibold py-1.5 px-3 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2">
            Load New Dataset
          </button>
        )}
      </header>

      <main className="flex-grow">
        {!csvData ? (
          <DataImportScreen onDataUpload={handleDataUpload} />
        ) : (
          <DataCleaningWorkbench
            fileName={fileName}
            csvData={csvData}
            suggestions={suggestions}
            transformationLog={transformationLog}
            onApproveSuggestion={handleApproveSuggestion}
            onRejectSuggestion={handleRejectSuggestion}
            isLoading={isLoading}
            error={error}
          />
        )}
      </main>
    </div>
  );
};

export default App;