import React, { useState, useEffect, useRef } from 'react';
import { transformData } from './services/geminiDataTransformerService';
import { useLanguage } from './i18n/LanguageContext';

// Let TypeScript know that Prism is available on the global scope
declare const Prism: any;

const JSON_TO_CSV_DATA = `{
  "users": [
    { "id": 1, "name": "Alice", "email": "alice@example.com", "role": "admin" },
    { "id": 2, "name": "Bob", "email": "bob@example.com", "role": "user" },
    { "id": 3, "name": "Charlie", "email": "charlie@example.com", "role": "user" }
  ]
}`;
const JSON_TO_CSV_INSTRUCTION = "Convert this JSON to a CSV format, including a header row.";

const JSON_TO_XML_DATA = `{
  "order": {
    "id": "A1234",
    "date": "2024-05-21",
    "customer": {
      "name": "John Doe",
      "email": "john.doe@email.com"
    },
    "items": [
      { "product": "Widget", "quantity": 2, "price": 10.50 },
      { "product": "Gadget", "quantity": 1, "price": 25.00 }
    ]
  }
}`;
const JSON_TO_XML_INSTRUCTION = "Convert this JSON object to an equivalent XML structure.";

interface GenerationResult {
  format: string;
  data: string;
}

interface DataTransformerAppProps {
  onOpenSettings: () => void;
}

export default function DataTransformerApp({ onOpenSettings }: DataTransformerAppProps) {
  const { t, language } = useLanguage();
  const [inputData, setInputData] = useState('');
  const [instruction, setInstruction] = useState('');
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const codeBlockRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (result && codeBlockRef.current) {
      Prism.highlightElement(codeBlockRef.current);
    }
  }, [result]);


  const handleGenerate = async () => {
    if (!inputData.trim() || !instruction.trim()) return;
    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      const generationResult = await transformData(inputData, instruction, language);
      setResult(generationResult);
    } catch (e: any)
    {
      setError(e.message || 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCopyCode = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.data);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };
  
  const handleExample = (data: string, instruction: string) => {
    setInputData(data);
    setInstruction(instruction);
  }

  return (
    <div className="flex flex-col h-full bg-gray-900">
      <div className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8 animate-fade-in-up">
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">{t('dataTransformer.title')}</h2>
          <p className="mt-2 max-w-2xl mx-auto text-md text-gray-400">{t('dataTransformer.subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
          {/* Left Panel: Input */}
          <div className="bg-gray-800 rounded-lg shadow-lg p-6 flex flex-col animate-fade-in-left">
            <div className="flex flex-col flex-grow">
                <label htmlFor="inputData" className="text-sm font-medium text-gray-300 mb-2">Source Data</label>
                <textarea
                    id="inputData"
                    value={inputData}
                    onChange={(e) => setInputData(e.target.value)}
                    placeholder={t('dataTransformer.inputDataPlaceholder')}
                    className="w-full flex-grow bg-gray-900 text-gray-200 rounded-md p-4 border border-gray-700 focus:ring-2 focus:ring-violet-500 focus:outline-none resize-none font-mono text-sm"
                    rows={12}
                />
            </div>
            <div className="mt-4">
                 <label htmlFor="instruction" className="text-sm font-medium text-gray-300 mb-2">Transformation Instruction</label>
                <textarea
                    id="instruction"
                    value={instruction}
                    onChange={(e) => setInstruction(e.target.value)}
                    placeholder={t('dataTransformer.instructionPlaceholder')}
                    className="w-full bg-gray-900 text-gray-200 rounded-md p-4 border border-gray-700 focus:ring-2 focus:ring-violet-500 focus:outline-none resize-none font-sans text-sm"
                    rows={3}
                />
            </div>
             <div className="mt-4">
                <p className="text-sm text-gray-400 mb-2">{t('dataTransformer.tryExample.title')}</p>
                <div className="flex flex-wrap gap-2">
                    <button onClick={() => handleExample(JSON_TO_CSV_DATA, JSON_TO_CSV_INSTRUCTION)} className="text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-full px-3 py-1 transition-colors">
                        {t('dataTransformer.tryExample.jsonToCsv')}
                    </button>
                    <button onClick={() => handleExample(JSON_TO_XML_DATA, JSON_TO_XML_INSTRUCTION)} className="text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-full px-3 py-1 transition-colors">
                        {t('dataTransformer.tryExample.jsonToXml')}
                    </button>
                </div>
            </div>
            <button
              onClick={handleGenerate}
              disabled={isLoading}
              className="mt-4 w-full py-3 px-4 bg-violet-600 text-white font-semibold rounded-md shadow-md hover:bg-violet-700 disabled:bg-violet-800 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? t('dataTransformer.generatingButton') : t('dataTransformer.generateButton')}
            </button>
          </div>

          {/* Right Panel: Output */}
          <div className="bg-gray-800 rounded-lg shadow-lg p-1 sm:p-2 flex flex-col animate-fade-in-right">
            {error && (() => {
              const isApiKeyError = error.includes('API key is not configured');
              return (
                <div className="m-4 p-4 bg-red-900/50 border border-red-700 text-red-300 rounded-md">
                  <h3 className="font-bold">{t('dataTransformer.error')}</h3>
                  <p className="text-sm">
                    {isApiKeyError ? t('errors.apiKeyMissing') : error}
                  </p>
                  <div className="mt-3">
                    {isApiKeyError ? (
                      <button
                        onClick={() => {
                          setError(null);
                          onOpenSettings();
                        }}
                        className="text-sm font-semibold text-white bg-violet-600 hover:bg-violet-700 px-4 py-2 rounded-md transition-colors"
                      >
                        {t('errors.goToSettings')}
                      </button>
                    ) : (
                      <button onClick={() => setError(null)} className="text-sm underline hover:text-white">
                        {t('dataTransformer.tryAgain')}
                      </button>
                    )}
                  </div>
                </div>
              );
            })()}
            
            {result && (
               <div className="p-0 h-full flex flex-col">
                   <div className="bg-gray-900 rounded-lg overflow-hidden flex-grow flex flex-col">
                       <div className="bg-gray-900/80 backdrop-blur-sm px-4 py-2 flex justify-between items-center border-b border-gray-700">
                           <p className="text-sm text-gray-400">{t('dataTransformer.outputTitle')} <span className="text-xs bg-gray-700 text-gray-300 rounded-full px-2 py-0.5 ml-2">{result.format}</span></p>
                           <button onClick={handleCopyCode} className="px-3 py-1 text-xs bg-gray-700 text-gray-200 rounded hover:bg-gray-600">
                               {isCopied ? t('dataTransformer.copied') : t('dataTransformer.copyCode')}
                           </button>
                       </div>
                       <pre className="text-sm text-gray-300 overflow-auto flex-grow m-0">
                           <code ref={codeBlockRef} className={`language-${result.format}`}>
                            {result.data}
                           </code>
                       </pre>
                   </div>
               </div>
            )}

            {!isLoading && !result && !error && (
              <div className="text-center text-gray-500 flex flex-col items-center justify-center h-full p-6">
                <p>Your transformed data will appear here.</p>
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