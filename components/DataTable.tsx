import React from 'react';
import type { CsvData, Suggestion } from '../types';

interface DataTableProps {
  csvData: CsvData;
  highlightedSuggestion: Suggestion | null;
}

const DataTable: React.FC<DataTableProps> = ({ csvData, highlightedSuggestion }) => {
  const highlightedColIndex = highlightedSuggestion ? csvData.header.indexOf(highlightedSuggestion.column_name) : -1;
  const highlightedRowIndex = highlightedSuggestion?.row_index;

  return (
    <div className="flex-grow overflow-auto">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50 sticky top-0 z-20">
          <tr>
            <th className="px-4 py-2 text-left font-semibold text-slate-500 w-16 sticky left-0 bg-slate-50 z-30">#</th>
            {csvData.header.map((col, index) => (
              <th
                key={index}
                className={`px-4 py-2 text-left font-semibold text-slate-600 whitespace-nowrap transition-colors ${
                  index === highlightedColIndex ? 'bg-slate-200/60' : ''
                }`}
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-slate-100">
          {csvData.rows.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className={`transition-colors ${
                rowIndex === highlightedRowIndex ? 'bg-slate-100' : 'hover:bg-slate-50'
              }`}
            >
              <td className={`px-4 py-2 font-mono text-xs text-slate-400 sticky left-0 z-10 transition-colors ${rowIndex === highlightedRowIndex ? 'bg-slate-100' : 'bg-white'}`}>
                {rowIndex + 1}
              </td>
              {row.map((cell, cellIndex) => (
                <td
                  key={cellIndex}
                  className={`px-4 py-2 whitespace-nowrap transition-colors ${
                    cellIndex === highlightedColIndex ? 'bg-slate-100/60' : ''
                  } ${
                    cellIndex === highlightedColIndex && rowIndex === highlightedRowIndex ? 'ring-2 ring-slate-400 ring-inset' : ''
                  }`}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;