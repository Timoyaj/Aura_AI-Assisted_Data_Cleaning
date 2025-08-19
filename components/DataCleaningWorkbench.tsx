import React, { useState } from 'react';
import type { CsvData, Suggestion, TransformationLogEntry } from '../types';
import DataTable from './DataTable';
import SuggestionsPanel from './SuggestionsPanel';
import TransformationLog from './TransformationLog';

interface DataCleaningWorkbenchProps {
  fileName: string;
  csvData: CsvData;
  suggestions: Suggestion[];
  transformationLog: TransformationLogEntry[];
  onApproveSuggestion: (suggestion: Suggestion, index: number) => void;
  onRejectSuggestion: (index: number) => void;
  isLoading: boolean;
  error: string | null;
}

const DataCleaningWorkbench: React.FC<DataCleaningWorkbenchProps> = ({
  fileName,
  csvData,
  suggestions,
  transformationLog,
  onApproveSuggestion,
  onRejectSuggestion,
  isLoading,
  error,
}) => {
  const [selectedSuggestion, setSelectedSuggestion] = useState<Suggestion | null>(null);

  return (
    <div className="h-[calc(100vh-61px)] grid grid-cols-12 grid-rows-6 gap-4 p-4 bg-slate-100">
      {/* Data Table */}
      <div className="col-span-12 row-span-4 lg:col-span-8 bg-white rounded-lg border border-slate-200 overflow-hidden flex flex-col">
        <div className="p-3 border-b border-slate-200 bg-slate-50/50">
            <h2 className="font-semibold text-slate-800">{fileName}</h2>
            <p className="text-sm text-slate-500">{csvData.rows.length} rows &times; {csvData.header.length} columns</p>
        </div>
        <DataTable csvData={csvData} highlightedSuggestion={selectedSuggestion} />
      </div>

      {/* Suggestions Panel */}
      <div className="col-span-12 row-span-2 lg:row-span-6 lg:col-span-4 bg-white rounded-lg border border-slate-200 overflow-hidden flex flex-col">
        <SuggestionsPanel
          suggestions={suggestions}
          onApprove={onApproveSuggestion}
          onReject={onRejectSuggestion}
          onSelect={setSelectedSuggestion}
          isLoading={isLoading}
          error={error}
        />
      </div>

      {/* Transformation Log */}
      <div className="col-span-12 row-span-2 lg:col-span-8 bg-white rounded-lg border border-slate-200 overflow-hidden flex flex-col">
        <TransformationLog logEntries={transformationLog} />
      </div>
    </div>
  );
};

export default DataCleaningWorkbench;