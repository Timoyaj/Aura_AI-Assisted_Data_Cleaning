import React, { useState } from 'react';
import type { TransformationLogEntry } from '../types';

interface TransformationLogProps {
  logEntries: TransformationLogEntry[];
}

type Tab = 'Log' | 'R' | 'Python';

const TransformationLog: React.FC<TransformationLogProps> = ({ logEntries }) => {
  const [activeTab, setActiveTab] = useState<Tab>('Log');

  const TabButton = ({ tabName }: { tabName: Tab }) => (
    <button
      onClick={() => setActiveTab(tabName)}
      className={`px-4 py-2 text-sm font-semibold transition-colors ${
        activeTab === tabName
          ? 'text-slate-900 border-b-2 border-slate-800'
          : 'text-slate-500 hover:text-slate-700'
      }`}
    >
      {tabName === 'Log' ? 'Transformation Log' : `Generated Code (${tabName})`}
    </button>
  );

  return (
    <div className="flex flex-col h-full">
      <div className="border-b border-slate-200 bg-slate-50/50">
        <nav className="flex space-x-2 px-3">
          <TabButton tabName="Log" />
          <TabButton tabName="R" />
          <TabButton tabName="Python" />
        </nav>
      </div>
      <div className="flex-grow overflow-y-auto p-4">
        {logEntries.length === 0 && (
          <div className="text-center text-slate-500 flex flex-col items-center justify-center h-full">
            <p className="font-semibold text-slate-700">No Transformations Applied</p>
            <p className="text-sm">Approve an AI suggestion to see it logged here.</p>
          </div>
        )}

        {activeTab === 'Log' && logEntries.length > 0 && (
          <ul className="space-y-3">
            {logEntries.map(entry => (
              <li key={entry.id} className="flex items-start space-x-3 text-sm">
                <div className="flex-shrink-0 pt-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                </div>
                <div>
                  <p className="text-slate-800">{entry.description}</p>
                  <p className="text-xs text-slate-400">{new Date(entry.timestamp).toLocaleTimeString()}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
        
        {(activeTab === 'R' || activeTab === 'Python') && logEntries.length > 0 && (
          <pre className="bg-slate-900 text-slate-100 p-4 rounded-md text-sm whitespace-pre-wrap overflow-x-auto">
            <code>
              {logEntries.map(e => e.pseudoCode[activeTab === 'R' ? 'r' : 'python']).reverse().join('\n')}
            </code>
          </pre>
        )}
      </div>
    </div>
  );
};

export default TransformationLog;