import React, { useState } from 'react';
import { generateDiagramCode } from './services/geminiDiagramService';
import { useLanguage } from './i18n/LanguageContext';
import DiagramPreview from './components/DiagramPreview';

const FLOWCHART_EXAMPLE = `graph TD
    A[Start] --> B{User logs in};
    B -- Success --> C[Redirect to Dashboard];
    B -- Failure --> D[Show error message];
    C --> E[User can access profile];
    C --> F[User can log out];
    D --> B;
    E --> C;
    F --> G[End];
`;

const SEQUENCE_EXAMPLE = `sequenceDiagram
    participant User
    participant WebServer
    participant Database
    User->>WebServer: POST /login (username, password)
    WebServer->>Database: SELECT user WHERE username=?
    Database-->>WebServer: User record
    alt credentials valid
        WebServer-->>User: 200 OK (Login successful)
    else credentials invalid
        WebServer-->>User: 401 Unauthorized (Invalid credentials)
    end
`;

const CLASS_EXAMPLE = `classDiagram
    class Animal {
      +String name
      +int age
      +void eat()
      +void sleep()
    }
    class Dog {
      +String breed
      +void bark()
    }
    class Cat {
      +String color
      +void meow()
    }
    Animal <|-- Dog
    Animal <|-- Cat
`;

type ActiveTab = 'diagram' | 'code';

interface DiagramGeneratorAppProps {
  onOpenSettings: () => void;
}

export default function DiagramGeneratorApp({ onOpenSettings }: DiagramGeneratorAppProps) {
  const { t, language } = useLanguage();
  const [userInput, setUserInput] = useState('');
  const [diagramCode, setDiagramCode] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('diagram');
  const [isCopied, setIsCopied] = useState(false);

  const handleGenerate = async () => {
    if (!userInput.trim()) return;
    setIsLoading(true);
    setError(null);
    setDiagramCode('');
    setActiveTab('diagram');
    try {
      const code = await generateDiagramCode(userInput, language);
      setDiagramCode(code.trim());
    } catch (e: any) {
      setError(e.message || 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCopyCode = () => {
    navigator.clipboard.writeText(diagramCode);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };
  
  return (
    <div className="flex flex-col h-full bg-gray-900">
      <div className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8 animate-fade-in-up">
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">{t('diagramGenerator.title')}</h2>
          <p className="mt-2 max-w-2xl mx-auto text-md text-gray-400">{t('diagramGenerator.subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:items-start">
          {/* Left Panel: Input */}
          <div className="bg-gray-800 rounded-lg shadow-lg p-6 flex flex-col animate-fade-in-left">
            <textarea
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder={t('diagramGenerator.inputPlaceholder')}
              className="w-full flex-grow bg-gray-900 text-gray-200 rounded-md p-4 border border-gray-700 focus:ring-2 focus:ring-violet-500 focus:outline-none resize-none"
              rows={15}
            />
             <div className="mt-4">
                <p className="text-sm text-gray-400 mb-2">{t('diagramGenerator.tryExample.title')}</p>
                <div className="flex flex-wrap gap-2">
                    <button onClick={() => setUserInput(FLOWCHART_EXAMPLE)} className="text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-full px-3 py-1 transition-colors">
                        {t('diagramGenerator.tryExample.flowchart')}
                    </button>
                    <button onClick={() => setUserInput(SEQUENCE_EXAMPLE)} className="text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-full px-3 py-1 transition-colors">
                        {t('diagramGenerator.tryExample.sequence')}
                    </button>
                    <button onClick={() => setUserInput(CLASS_EXAMPLE)} className="text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-full px-3 py-1 transition-colors">
                        {t('diagramGenerator.tryExample.class')}
                    </button>
                </div>
            </div>
            <button
              onClick={handleGenerate}
              disabled={isLoading}
              className="mt-4 w-full py-3 px-4 bg-violet-600 text-white font-semibold rounded-md shadow-md hover:bg-violet-700 disabled:bg-violet-800 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? t('diagramGenerator.generatingButton') : t('diagramGenerator.generateButton')}
            </button>
          </div>

          {/* Right Panel: Output */}
          <div className="bg-gray-800 rounded-lg shadow-lg p-1 sm:p-2 flex flex-col animate-fade-in-right">
            {error && (() => {
              const isApiKeyError = error.includes('API key is not configured');
              return (
                <div className="m-4 p-4 bg-red-900/50 border border-red-700 text-red-300 rounded-md">
                  <h3 className="font-bold">{t('diagramGenerator.error')}</h3>
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
                        {t('diagramGenerator.tryAgain')}
                      </button>
                    )}
                  </div>
                </div>
              );
            })()}
            
            {diagramCode && (
               <div className="flex flex-col h-full">
                <div className="flex border-b border-gray-700 px-2 sm:px-4">
                  {['diagram', 'code'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab as ActiveTab)}
                      className={`py-3 px-4 text-sm font-medium transition-colors ${
                        activeTab === tab
                          ? 'text-violet-400 border-b-2 border-violet-400'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      {t(`diagramGenerator.${tab}Tab` as any)}
                    </button>
                  ))}
                </div>

                <div className="flex-grow overflow-y-auto">
                  {activeTab === 'diagram' && (
                      <div className="p-4 bg-gray-700 rounded-b-lg">
                        <DiagramPreview diagramCode={diagramCode} />
                      </div>
                  )}

                  {activeTab === 'code' && (
                    <div className="p-4 h-full flex flex-col">
                        <div className="bg-gray-900 rounded-lg overflow-hidden flex-grow flex flex-col">
                            <div className="bg-gray-900 px-4 py-2 flex justify-between items-center border-b border-gray-700">
                                <p className="text-sm text-gray-400">Mermaid.js Code</p>
                                <button onClick={handleCopyCode} className="px-3 py-1 text-xs bg-gray-700 text-gray-200 rounded hover:bg-gray-600">
                                    {isCopied ? t('diagramGenerator.copied') : t('diagramGenerator.copyCode')}
                                </button>
                            </div>
                            <pre className="text-sm text-gray-300 p-4 overflow-auto flex-grow">
                                <code className="font-mono">{diagramCode}</code>
                            </pre>
                        </div>
                    </div>
                  )}
                </div>
               </div>
            )}

            {!isLoading && !diagramCode && !error && (
              <div className="text-center text-gray-500 flex flex-col items-center justify-center h-full p-6">
                <p>Your generated diagram will appear here.</p>
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