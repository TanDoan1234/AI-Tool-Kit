import React, { useState, useEffect, useRef } from 'react';
import { performConversion, ConversionResult } from './services/fileConverterService';
import { useLanguage } from './i18n/LanguageContext';

declare const Prism: any;

interface FileConverterAppProps {
  onOpenSettings: () => void;
}

export default function FileConverterApp({ onOpenSettings }: FileConverterAppProps) {
  const { t } = useLanguage();
  const [inputContent, setInputContent] = useState<string | ArrayBuffer>('');
  const [inputFile, setInputFile] = useState<File | null>(null);
  const [targetFormat, setTargetFormat] = useState('html');
  const [result, setResult] = useState<ConversionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const codeBlockRef = useRef<HTMLElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (result && !result.isBinary && codeBlockRef.current) {
      Prism.highlightElement(codeBlockRef.current);
    }
  }, [result]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setInputFile(file);
      setError(null);
      setResult(null);

      const reader = new FileReader();
      reader.onload = (e) => {
        setInputContent(e.target?.result || '');
      };
      reader.onerror = () => {
        setError('Error reading file.');
      };

      if (file.name.toLowerCase().endsWith('.docx')) {
        reader.readAsArrayBuffer(file);
      } else {
        reader.readAsText(file);
      }
    }
    if (event.target) {
      event.target.value = '';
    }
  };

  const detectPastedFormat = (text: string): string => {
    const trimmed = text.trim();
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) return 'json';
    if (trimmed.startsWith('<')) return 'html';
    // Could add more checks for markdown, csv etc.
    return 'txt';
  };

  const handleConvert = async () => {
    if (!inputContent) return;
    
    const filename = inputFile?.name || `pasted-content.${detectPastedFormat(inputContent as string)}`;
    if (!filename) {
        setError("Could not determine input format. Please upload a file.");
        return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      const conversionResult = await performConversion({
        content: inputContent,
        filename: filename,
        outputFormat: targetFormat
      });
      setResult(conversionResult);
    } catch (e: any) {
      setError(e.message || 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (!result || result.isBinary) return;
    navigator.clipboard.writeText(result.content);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const formatOptions = ['html', 'md', 'txt', 'json', 'csv', 'pdf', 'docx'];

  return (
    <div className="flex flex-col h-full bg-gray-900">
      <div className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8 animate-fade-in-up">
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">{t('fileConverter.title')}</h2>
          <p className="mt-2 max-w-2xl mx-auto text-md text-gray-400">{t('fileConverter.subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:items-start">
          {/* Left Panel: Input */}
          <div className="bg-gray-800 rounded-lg shadow-lg p-6 flex flex-col animate-fade-in-left">
            <div className="flex flex-col flex-grow">
              <label htmlFor="inputContent" className="text-sm font-medium text-gray-300 mb-2">Source Content</label>
              <textarea
                id="inputContent"
                value={typeof inputContent === 'string' ? inputContent : `(DOCX file loaded: ${inputFile?.name})`}
                onChange={(e) => {
                    setInputContent(e.target.value);
                    setInputFile(null); // Clear file if user types
                }}
                placeholder={t('fileConverter.inputPlaceholder')}
                className="w-full flex-grow bg-gray-900 text-gray-200 rounded-md p-4 border border-gray-700 focus:ring-2 focus:ring-violet-500 focus:outline-none resize-none font-mono text-sm"
                rows={15}
                disabled={inputContent instanceof ArrayBuffer}
              />
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept=".docx,.md,.html,.txt,.json,.csv"
              />
            </div>
             <div className="mt-4 flex flex-col sm:flex-row gap-4">
                <div className='flex-grow'>
                    <label htmlFor="targetFormat" className="block text-sm font-medium text-gray-300 mb-2">
                        {t('fileConverter.targetFormatLabel')}
                    </label>
                    <select
                        id="targetFormat"
                        value={targetFormat}
                        onChange={(e) => setTargetFormat(e.target.value)}
                        className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                    >
                        {formatOptions.map(format => (
                            <option key={format} value={format}>
                                {t(`fileConverter.formats.${format}` as any)}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="flex-shrink-0 self-end">
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full sm:w-auto mt-1 sm:mt-7 py-2 px-4 border border-gray-600 text-sm font-medium rounded-md text-gray-300 bg-gray-700 hover:bg-gray-600"
                    >
                       {t('fileConverter.uploadButton')}
                    </button>
                </div>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-right">{t('fileConverter.supportedFiles')}</p>
            <button
              onClick={handleConvert}
              disabled={isLoading}
              className="mt-4 w-full py-3 px-4 bg-violet-600 text-white font-semibold rounded-md shadow-md hover:bg-violet-700 disabled:bg-violet-800 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? t('fileConverter.convertingButton') : t('fileConverter.convertButton')}
            </button>
          </div>

          {/* Right Panel: Output */}
          <div className="bg-gray-800 rounded-lg shadow-lg p-1 sm:p-2 flex flex-col animate-fade-in-right">
            {error && (
                <div className="m-4 p-4 bg-red-900/50 border border-red-700 text-red-300 rounded-md">
                  <h3 className="font-bold">{t('fileConverter.error')}</h3>
                  <p className="text-sm">{error}</p>
                  <div className="mt-3">
                      <button onClick={() => setError(null)} className="text-sm underline hover:text-white">
                        {t('fileConverter.tryAgain')}
                      </button>
                  </div>
                </div>
              )}
            
            {result && (
               <div className="p-0 h-full flex flex-col">
                   <div className="bg-gray-900 rounded-lg overflow-hidden flex-grow flex flex-col">
                       <div className="bg-gray-900/80 backdrop-blur-sm px-4 py-2 flex justify-between items-center border-b border-gray-700">
                           <p className="text-sm text-gray-400">{t('fileConverter.outputTitle')} <span className="text-xs bg-gray-700 text-gray-300 rounded-full px-2 py-0.5 ml-2">{result.format}</span></p>
                           <button onClick={handleCopyCode} disabled={result.isBinary} className="px-3 py-1 text-xs bg-gray-700 text-gray-200 rounded hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed">
                               {isCopied ? t('fileConverter.copied') : t('fileConverter.copyCode')}
                           </button>
                       </div>

                       {result.isBinary ? (
                         <div className="p-4 text-center text-gray-300 flex-grow flex flex-col justify-center items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                           <p className='font-semibold'>{result.content}</p>
                           <p className="text-xs text-gray-500 mt-2">Your download should have started automatically.</p>
                         </div>
                       ) : (
                         <pre className="text-sm text-gray-300 overflow-auto flex-grow m-0">
                           <code ref={codeBlockRef} className={`language-${result.format}`}>
                            {result.content}
                           </code>
                         </pre>
                       )}
                   </div>
               </div>
            )}

            {!isLoading && !result && !error && (
              <div className="text-center text-gray-500 flex flex-col items-center justify-center h-full p-6">
                <p>Your converted content will appear here.</p>
              </div>
            )}

             {isLoading && (
                 <div className="flex items-center justify-center h-full">
                    <svg className="animate-spin h-10 w-10 text-violet-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                 </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}