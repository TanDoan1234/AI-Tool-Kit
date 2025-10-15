import React, { useState, useEffect } from 'react';
import type { FormDefinition } from './types';
import { generateFormDefinition } from './services/geminiService';
import { createGoogleForm } from './services/googleFormService';
import { generateAppsScriptCode } from './services/appsScriptService';
import FormPreview from './components/FormPreview';
import GuidePage from './components/GuidePage';
import { useLanguage } from './i18n/LanguageContext';
import { CodeIcon, GoogleIcon } from './components/icons';

interface FormGeneratorAppProps {
  isGoogleReady: boolean;
  isSignedIn: boolean;
  isGoogleConfigAvailable: boolean;
  onSignIn: () => void;
}

const MARKDOWN_EXAMPLE = `# Event Registration
Sign up for our annual tech conference!

## Personal Information
* Full Name (Short Answer, required)
* Email Address (Short Answer, required)

## T-Shirt Size
What's your t-shirt size? (Multiple Choice)
- Small
- Medium
- Large
- X-Large

![T-shirt graphic](https://via.placeholder.com/400x200.png/94a3e9/ffffff?text=Cool+T-Shirt)

## Dietary Restrictions
Please list any dietary restrictions. (Paragraph)
`;

const JSON_EXAMPLE = `{
  "requests": [
    {
      "createItem": {
        "item": {
          "title": "Your Name",
          "questionItem": { "question": { "required": true, "textQuestion": {} } }
        }
      }
    },
    {
      "createItem": {
        "item": {
          "title": "Your primary development area?",
          "questionItem": {
            "question": {
              "choiceQuestion": {
                "type": "RADIO",
                "options": [{ "value": "Frontend" }, { "value": "Backend" }, { "value": "Mobile" }, { "value": "DevOps" }]
              }
            }
          }
        }
      }
    }
  ]
}`;

const HTML_EXAMPLE = `<form>
  <h1>Website Feedback</h1>
  <p>Help us improve by answering a few questions.</p>
  
  <label for="email">Your Email:</label>
  <input type="email" id="email" name="email" required>
  
  <p>Which features do you use? (Check all that apply)</p>
  <input type="checkbox" id="feature1" value="Dashboard">
  <label for="feature1">Dashboard</label><br>
  <input type="checkbox" id="feature2" value="Analytics">
  <label for="feature2">Analytics</label><br>
  
  <label for="comments">Any other suggestions?</label>
  <textarea id="comments" rows="5"></textarea>
</form>
`;

type ActiveTab = 'preview' | 'google-form' | 'apps-script';

export default function FormGeneratorApp({
  isGoogleReady,
  isSignedIn,
  isGoogleConfigAvailable,
  onSignIn
}: FormGeneratorAppProps) {
  const { t, language } = useLanguage();
  const [view, setView] = useState<'editor' | 'guide'>('editor');
  const [userInput, setUserInput] = useState('');
  const [formDefinition, setFormDefinition] = useState<FormDefinition | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedScript, setGeneratedScript] = useState('');
  const [activeTab, setActiveTab] = useState<ActiveTab>('preview');
  const [formUrl, setFormUrl] = useState<string | null>(null);
  const [isCreatingForm, setIsCreatingForm] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (formDefinition) {
      const script = generateAppsScriptCode(formDefinition);
      setGeneratedScript(script);
    } else {
      setGeneratedScript('');
    }
    setFormUrl(null);
  }, [formDefinition]);

  const handleGenerate = async () => {
    if (!userInput.trim()) return;
    setIsLoading(true);
    setError(null);
    setFormDefinition(null);
    setActiveTab('preview');
    try {
      const definition = await generateFormDefinition(userInput, language);
      setFormDefinition(definition);
    } catch (e: any) {
      setError(e.message || 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateGoogleForm = async () => {
    if (!formDefinition) return;
    if (!isGoogleConfigAvailable) {
        setError(t('formGenerator.googleConfigWarning'));
        return;
    }
    if (!isSignedIn) {
      onSignIn();
      return;
    }

    setIsCreatingForm(true);
    setError(null);
    setFormUrl(null);

    try {
      const url = await createGoogleForm(formDefinition);
      setFormUrl(url);
    } catch (e: any) {
      setError(e.message || 'An unknown error occurred while creating the form.');
    } finally {
      setIsCreatingForm(false);
    }
  };

  const handleCopyScript = () => {
    navigator.clipboard.writeText(generatedScript);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };
  
  if (view === 'guide') {
    return <GuidePage onBack={() => setView('editor')} />;
  }

  return (
    <div className="flex flex-col h-full bg-gray-900">
      <div className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8 animate-fade-in-up">
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">{t('formGenerator.title')}</h2>
          <p className="mt-2 max-w-2xl mx-auto text-md text-gray-400">{t('formGenerator.subtitle')}</p>
          <button onClick={() => setView('guide')} className="mt-4 text-violet-400 hover:text-violet-300 hover:underline">
            {t('formGenerator.guideButton')}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
          {/* Left Panel: Input */}
          <div className="bg-gray-800 rounded-lg shadow-lg p-6 flex flex-col animate-fade-in-left">
            <textarea
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder={t('formGenerator.inputPlaceholder')}
              className="w-full flex-grow bg-gray-900 text-gray-200 rounded-md p-4 border border-gray-700 focus:ring-2 focus:ring-violet-500 focus:outline-none resize-none"
              rows={15}
            />
             <div className="mt-4">
                <p className="text-sm text-gray-400 mb-2">{t('formGenerator.tryExample.title')}</p>
                <div className="flex flex-wrap gap-2">
                    <button onClick={() => setUserInput(MARKDOWN_EXAMPLE)} className="text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-full px-3 py-1 transition-colors">
                        {t('formGenerator.tryExample.markdown')}
                    </button>
                    <button onClick={() => setUserInput(JSON_EXAMPLE)} className="text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-full px-3 py-1 transition-colors">
                        {t('formGenerator.tryExample.json')}
                    </button>
                    <button onClick={() => setUserInput(HTML_EXAMPLE)} className="text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-full px-3 py-1 transition-colors">
                        {t('formGenerator.tryExample.html')}
                    </button>
                </div>
            </div>
            <button
              onClick={handleGenerate}
              disabled={isLoading}
              className="mt-4 w-full py-3 px-4 bg-violet-600 text-white font-semibold rounded-md shadow-md hover:bg-violet-700 disabled:bg-violet-800 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? t('formGenerator.generatingButton') : t('formGenerator.generateButton')}
            </button>
          </div>

          {/* Right Panel: Output */}
          <div className="bg-gray-800 rounded-lg shadow-lg p-1 sm:p-2 flex flex-col animate-fade-in-right">
            {error && (
              <div className="m-4 p-4 bg-red-900/50 border border-red-700 text-red-300 rounded-md">
                <h3 className="font-bold">{t('formGenerator.error')}</h3>
                <p className="text-sm">{error}</p>
                <button onClick={() => setError(null)} className="text-sm underline mt-2">{t('formGenerator.tryAgain')}</button>
              </div>
            )}
            
            {formDefinition && (
               <div className="flex flex-col h-full">
                <div className="flex border-b border-gray-700 px-2 sm:px-4">
                  {['preview', 'google-form', 'apps-script'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab as ActiveTab)}
                      className={`py-3 px-4 text-sm font-medium transition-colors ${
                        activeTab === tab
                          ? 'text-violet-400 border-b-2 border-violet-400'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      {t(`formGenerator.${tab.replace('-', '')}Tab` as any)}
                    </button>
                  ))}
                </div>

                <div className="flex-grow overflow-y-auto">
                  {activeTab === 'preview' && (
                      <div className="p-2 sm:p-4">
                        <FormPreview definition={formDefinition} />
                      </div>
                  )}

                  {activeTab === 'google-form' && (
                    <div className="p-6 text-center flex flex-col items-center justify-center h-full">
                        <GoogleIcon className="w-12 h-12 mb-4" />
                        <h3 className="text-xl font-bold text-white mb-4">Create your form instantly</h3>
                         {!isGoogleConfigAvailable ? (
                             <p className="max-w-md text-yellow-400 bg-yellow-900/30 p-3 rounded-md">
                                {t('formGenerator.googleConfigWarning')}
                            </p>
                         ) : (
                            <>
                                {formUrl ? (
                                    <div className="p-4 bg-green-900/50 border border-green-700 text-green-300 rounded-md">
                                        <p className="font-bold">{t('formGenerator.formCreatedSuccess')}</p>
                                        <a href={formUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                                            {t('formGenerator.viewForm')}
                                        </a>
                                    </div>
                                ) : (
                                     <button
                                        onClick={handleCreateGoogleForm}
                                        disabled={isCreatingForm || !isGoogleReady}
                                        className="inline-flex items-center gap-2 px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-gray-800 bg-white hover:bg-gray-200 disabled:bg-gray-400 disabled:cursor-wait transition-colors"
                                    >
                                        <GoogleIcon className="w-5 h-5" />
                                        {isCreatingForm 
                                            ? 'Creating...' 
                                            : isSignedIn ? t('formGenerator.createFormButton') : t('formGenerator.signInToCreate')}
                                    </button>
                                )}
                            </>
                         )}
                    </div>
                  )}

                  {activeTab === 'apps-script' && (
                    <div className="p-4 h-full flex flex-col">
                        <div className="bg-gray-900 rounded-lg overflow-hidden flex-grow flex flex-col">
                            <div className="bg-gray-900 px-4 py-2 flex justify-between items-center border-b border-gray-700">
                                <p className="text-sm text-gray-400">Google Apps Script</p>
                                <button onClick={handleCopyScript} className="px-3 py-1 text-xs bg-gray-700 text-gray-200 rounded hover:bg-gray-600">
                                    {isCopied ? t('formGenerator.copied') : t('formGenerator.copyCode')}
                                </button>
                            </div>
                            <pre className="text-sm text-gray-300 p-4 overflow-auto flex-grow">
                                <code className="font-mono">{generatedScript}</code>
                            </pre>
                        </div>
                         <div className="mt-4 p-4 bg-gray-700/50 rounded-lg text-sm">
                            <h4 className="font-bold text-white mb-2">{t('formGenerator.appsScriptInstructions.title')}</h4>
                            <ol className="list-decimal list-inside space-y-1 text-gray-300">
                                <li>{t('formGenerator.appsScriptInstructions.li1')}</li>
                                <li>{t('formGenerator.appsScriptInstructions.li2')}</li>
                                <li>{t('formGenerator.appsScriptInstructions.li3')}</li>
                                <li>{t('formGenerator.appsScriptInstructions.li4')}</li>
                                <li>{t('formGenerator.appsScriptInstructions.li5')}</li>
                                <li>{t('formGenerator.appsScriptInstructions.li6')}</li>
                            </ol>
                        </div>
                    </div>
                  )}
                </div>
               </div>
            )}

            {!isLoading && !formDefinition && !error && (
              <div className="text-center text-gray-500 flex flex-col items-center justify-center h-full p-6">
                <p>Your generated form preview will appear here.</p>
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