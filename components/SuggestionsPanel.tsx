import React from 'react';
import type { Suggestion } from '../types';
import SuggestionCard from './SuggestionCard';

interface SuggestionsPanelProps {
  suggestions: Suggestion[];
  onApprove: (suggestion: Suggestion, index: number) => void;
  onReject: (index: number) => void;
  onSelect: (suggestion: Suggestion | null) => void;
  isLoading: boolean;
  error: string | null;
}

const LoadingSkeleton: React.FC = () => (
    <div className="p-4 space-y-4 border-t border-slate-200">
        {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse flex space-x-4">
                <div className="flex-1 space-y-3 py-1">
                    <div className="h-3 bg-slate-200 rounded w-3/4"></div>
                    <div className="space-y-2">
                        <div className="h-3 bg-slate-200 rounded"></div>
                        <div className="h-3 bg-slate-200 rounded w-5/6"></div>
                    </div>
                </div>
            </div>
        ))}
    </div>
);

const SuggestionsPanel: React.FC<SuggestionsPanelProps> = ({
  suggestions,
  onApprove,
  onReject,
  onSelect,
  isLoading,
  error
}) => {
  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-slate-200 bg-slate-50/50">
        <h2 className="font-semibold text-slate-800">AI Cleaning Suggestions</h2>
        <p className="text-sm text-slate-500">Review and approve changes. You are in control.</p>
      </div>
      <div className="flex-grow overflow-y-auto">
        {isLoading && <LoadingSkeleton />}
        {!isLoading && error && (
            <div className="p-4 m-4 text-center text-red-700 bg-red-50 rounded-lg border border-red-200">
                <h3 className="font-semibold">An Error Occurred</h3>
                <p className="text-sm">{error}</p>
            </div>
        )}
        {!isLoading && !error && suggestions.length === 0 && (
            <div className="p-8 text-center text-slate-500 flex flex-col items-center justify-center h-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="mt-2 font-semibold text-slate-700">All Clean!</h3>
                <p className="text-sm">The AI didn't find any immediate issues in the data sample.</p>
            </div>
        )}
        {!isLoading && !error && suggestions.length > 0 && (
          <ul className="divide-y divide-slate-200">
            {suggestions.map((suggestion, index) => (
              <li key={index}>
                <SuggestionCard
                  suggestion={suggestion}
                  onApprove={() => onApprove(suggestion, index)}
                  onReject={() => onReject(index)}
                  onSelect={onSelect}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default SuggestionsPanel;