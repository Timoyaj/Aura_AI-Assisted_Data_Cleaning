import React, { useCallback, useState } from 'react';
import Papa, { type ParseResult } from 'papaparse';
import { useGooglePicker } from '../hooks/useGooglePicker';

interface DataImportScreenProps {
  onDataUpload: (results: ParseResult<string[]>, fileName: string) => void;
}

const DataImportScreen: React.FC<DataImportScreenProps> = ({ onDataUpload }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [url, setUrl] = useState('');
  const [isUrlLoading, setIsUrlLoading] = useState(false);
  const [isDriveLoading, setIsDriveLoading] = useState(false);

  const handleParseComplete = (results: ParseResult<string[]>, fileName: string) => {
    if (results.errors.length > 0) {
      console.error("Parsing errors:", results.errors);
      alert(`Error parsing file: ${results.errors[0].message}`);
      return;
    }
    if (results.data.length === 0) {
      alert('The selected file is empty.');
      return;
    }
    onDataUpload(results, fileName);
  };

  const { openPicker, isReady: isDriveReady } = useGooglePicker({
    onFilePicked: ({ name, content }) => {
      setIsDriveLoading(true);
      try {
        Papa.parse<string[]>(content, {
          complete: (results) => handleParseComplete(results, name),
          skipEmptyLines: true,
        });
      } catch (error) {
        alert(`Error processing file from Google Drive: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
        setIsDriveLoading(false);
      }
    },
    onAuthFailed: () => {
      setIsDriveLoading(false);
      alert("Google Drive authentication failed. Please ensure pop-ups are enabled and try again.");
    }
  });

  const handleFile = (file: File | null) => {
    if (file) {
      if (!file.name.toLowerCase().endsWith('.csv')) {
        alert('Please upload a valid CSV file. Support for other formats is coming soon.');
        return;
      }
      Papa.parse(file, {
        complete: (results: ParseResult<string[]>) => {
          handleParseComplete(results, file.name);
        },
        error: (error: Error) => {
          alert(`Error parsing CSV: ${error.message}`);
        },
        skipEmptyLines: true,
      });
    }
  };

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  }, [onDataUpload]);

  const handleUrlImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    setIsUrlLoading(true);
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.statusText}`);
      }
      const text = await response.text();
      const fileName = url.substring(url.lastIndexOf('/') + 1) || 'data_from_url.csv';
       Papa.parse(text, {
        complete: (results: ParseResult<string[]>) => {
          handleParseComplete(results, fileName);
        },
        error: (error: Error) => {
          alert(`Error parsing CSV from URL: ${error.message}`);
        },
        skipEmptyLines: true,
      });
    } catch (error) {
      alert(`Could not import from URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsUrlLoading(false);
    }
  };
  
  const handleDriveClick = () => {
    setIsDriveLoading(true);
    openPicker();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)] p-4 sm:p-8 bg-slate-100">
      <div className="text-center max-w-2xl mb-12">
        <span className="text-6xl">✨</span>
        <h1 className="text-4xl font-bold text-slate-900 mt-4 mb-2">Welcome to Aura</h1>
        <p className="text-lg text-slate-600">The Analyst's Workbench for clean, trustworthy data. Get started by importing a dataset.</p>
      </div>
      
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Panel: File Upload */}
        <div className="bg-white p-6 rounded-lg border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900 mb-1">Upload a File</h2>
          <p className="text-sm text-slate-500 mb-4">Drag & drop or select a file from your computer.</p>
          <div 
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-300 ${isDragging ? 'border-slate-400 bg-slate-100' : 'border-slate-300 bg-white'}`}
          >
            <input
              type="file"
              id="file-upload"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              accept=".csv"
              onChange={(e) => handleFile(e.target.files ? e.target.files[0] : null)}
            />
            <div className="flex flex-col items-center text-slate-500 pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-10 w-10 mb-3 text-slate-400"><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7"/><path d="M18 8V2h-6"/><path d="m22 6-6-6"/></svg>
              <p className="font-semibold text-slate-700">
                <label htmlFor="file-upload" className="text-slate-900 hover:underline font-semibold cursor-pointer">
                  Click to upload
                </label> or drag and drop
              </p>
              <p className="text-sm mt-1 text-slate-500">CSV files supported. Excel & SPSS coming soon.</p>
            </div>
          </div>
        </div>

        {/* Right Panel: Other Sources */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg border border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900 mb-1">Import from URL</h2>
            <p className="text-sm text-slate-500 mb-4">Paste a link to a raw CSV file.</p>
            <form onSubmit={handleUrlImport} className="flex items-center space-x-2">
              <input 
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/data.csv"
                className="w-full px-3 py-1.5 border border-slate-300 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 transition"
              />
              <button type="submit" disabled={isUrlLoading || !url} className="px-4 py-1.5 bg-slate-900 text-white font-semibold rounded-md hover:bg-slate-800 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2">
                {isUrlLoading ? 'Loading...' : 'Import'}
              </button>
            </form>
          </div>

          <div className="bg-white p-6 rounded-lg border border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900 mb-1">Connect a Source</h2>
            <p className="text-sm text-slate-500 mb-4">Import from cloud storage or data platforms.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <button onClick={handleDriveClick} disabled={!isDriveReady || isDriveLoading} className="flex items-center justify-center space-x-2 w-full px-4 py-2 border border-slate-300 bg-white font-semibold rounded-md hover:bg-slate-100 disabled:bg-slate-200 disabled:text-slate-500 disabled:cursor-not-allowed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2">
                  <svg className="w-5 h-5" role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>Google Drive</title><path d="M2.992 15.27L0 20.468l6.383 3.538 3.013-5.22zM9.39 12.01L6.38 6.78 3.004 12l3.375 5.25zM10.59 12l3.38-5.858-6.38-3.538L4.62 7.828zM14.63 17.228l3.01-5.22-3.01-5.22-2.955 5.115zM18.625 8.732l-3.01-5.22-6.38 3.538 2.96 5.12zM15.405 24l6.38-3.538-2.96-5.115-3.01 5.22z" fill="#4285F4"/></svg>
                  <span className="text-slate-700">{isDriveLoading ? 'Loading...' : 'Google Drive'}</span>
              </button>
               <button disabled className="flex items-center justify-center space-x-2 w-full px-4 py-2 border border-slate-200 bg-slate-50 font-semibold rounded-md disabled:cursor-not-allowed">
                  <svg className="w-5 h-5 text-slate-400" role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>Dropbox</title><path d="M12 0L2.143 6.391l9.857 6.391L12 19.172l9.857-6.39L12 6.391zM2.143 17.609L12 24l9.857-6.391L12 11.218z" fill="currentColor"/></svg>
                  <span className="text-slate-400">Dropbox</span>
              </button>
                <button disabled className="col-span-1 sm:col-span-2 flex items-center justify-center space-x-2 w-full px-4 py-2 border border-slate-200 bg-slate-50 font-semibold rounded-md disabled:cursor-not-allowed">
                  <span className="text-slate-400">Qualtrics (Coming Soon)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataImportScreen;