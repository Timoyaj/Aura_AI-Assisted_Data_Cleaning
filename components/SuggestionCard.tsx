import React from 'react';
import type { Suggestion } from '../types';

interface SuggestionCardProps {
  suggestion: Suggestion;
  onApprove: () => void;
  onReject: () => void;
  onSelect: (suggestion: Suggestion | null) => void;
}

const SuggestionCard: React.FC<SuggestionCardProps> = ({ suggestion, onApprove, onReject, onSelect }) => {
  const getSuggestionTypePill = (type: Suggestion['suggestion_type']) => {
    switch(type) {
      case 'STANDARDIZE_TEXT':
        return <span className="text-xs font-medium bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">Standardize</span>;
      case 'FLAG_OUTLIER':
        return <span className="text-xs font-medium bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">Outlier</span>;
      case 'FIX_FORMAT':
        return <span className="text-xs font-medium bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">Format</span>;
      default:
        return <span className="text-xs font-medium bg-slate-200 text-slate-800 px-2 py-0.5 rounded-full">General</span>;
    }
  };

  return (
    <div 
        className="p-4 hover:bg-slate-50/50"
        onMouseEnter={() => onSelect(suggestion)}
        onMouseLeave={() => onSelect(null)}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center space-x-2">
           {getSuggestionTypePill(suggestion.suggestion_type)}
           <span className="text-sm font-semibold text-slate-800">Column: '{suggestion.column_name}'</span>
           {suggestion.row_index !== undefined && <span className="text-sm text-slate-500">Row: {suggestion.row_index + 1}</span>}
        </div>
      </div>
      
      <p className="text-slate-700 mb-2">{suggestion.description}</p>
      
      {suggestion.original_value !== undefined && suggestion.suggested_value !== undefined && (
          <div className="flex items-center space-x-2 text-sm bg-slate-100 p-2 rounded-md border border-slate-200">
              <span className="line-through text-red-600 font-mono text-xs">{`'${suggestion.original_value}'`}</span>
              <span className="text-slate-400">&rarr;</span>
              <span className="font-semibold text-green-700 font-mono text-xs">{`'${suggestion.suggested_value}'`}</span>
          </div>
      )}

      <p className="text-xs text-slate-500 mt-2 italic">
        <strong>Rationale:</strong> {suggestion.rationale}
      </p>

      <div className="flex items-center justify-end space-x-2 mt-4">
        <button
          onClick={onReject}
          className="px-3 py-1 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
        >
          Reject
        </button>
        <button
          onClick={onApprove}
          className="px-3 py-1 text-sm font-semibold text-white bg-slate-900 border border-slate-900 rounded-md hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
        >
          Approve
        </button>
      </div>
    </div>
  );
};

export default SuggestionCard;