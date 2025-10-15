import React, { useState, useCallback } from 'react';
import { FormDefinition } from './types';
import { generateFormDefinition } from './services/geminiService';
import { createGoogleForm } from './services/googleFormService';
import FormPreview from './components/FormPreview';
import GuidePage from './components/GuidePage';
import { SparklesIcon, AlertTriangleIcon, GoogleIcon, CopyIcon, CheckIcon, SettingsIcon, ChevronLeftIcon, QuestionMarkCircleIcon } from './components/icons';
import { isGeminiConfigured as checkGeminiConfig } from './services/configService';
import { useLanguage } from './i18n/LanguageContext';

const exampleInputs = {
  markdown: `
# Course Feedback Survey

Please provide your honest feedback to help us improve.

---

### 1. What is your name? (Short Answer)

### 2. What did you enjoy most about the course? (Paragraph)

### 3. How would you rate the overall quality of the course?
- [ ] Excellent
- [ ] Good
- [ ] Average
- [ ] Poor

### 4. Which topics would you like to see more of? (Checkboxes)
- [ ] Advanced React Hooks
- [ ] State Management with Redux
- [ ] UI/UX Design Principles
- [ ] Performance Optimization

### 5. Please review this course diagram.
![Diagram](https://picsum.photos/600/400)
  `,
  json: `
{
  "title": "New Employee Onboarding",
  "description": "Please complete this form before your first day.",
  "questions": [
    {
      "title": "Full Name",
      "type": "SHORT_ANSWER",
      "required": true
    },
    {
      "title": "Dietary Restrictions or Allergies",
      "type": "PARAGRAPH"
    },
    {
      "title": "T-Shirt Size",
      "type": "MULTIPLE_CHOICE",
      "options": ["Small", "Medium", "Large", "X-Large"]
    },
    {
      "title": "Please look at our company logo and describe your first impression.",
      "imageUrl": "https://picsum.photos/seed/logo/500/300"
    }
  ]
}
  `,
  html: `
<h1>Website Feedback Form</h1>
<p>Help us improve our website by answering a few questions.</p>

<h2>What is your email address?</h2>
<p>(Short Answer)</p>

<h2>On a scale of 1 to 5, how easy was it to navigate the site?</h2>
<ul>
    <li>1 (Very Difficult)</li>
    <li>2</li>
    <li>3</li>
    <li>4</li>
    <li>5 (Very Easy)</li>
</ul>

<h2>Which features do you use most often? (Select all that apply)</h2>
<ul>
    <li>Dashboard</li>
    <li>Analytics</li>
    <li>User Profiles</li>
    <li>Settings</li>
</ul>
  `,
};

interface FormGeneratorAppProps {
  onNavigateHome: () => void;
  isGoogleReady: boolean;
  isSignedIn: boolean;
  isGoogleConfigAvailable: boolean;
  onSignIn: () => void;
}

export default function FormGeneratorApp({ onNavigateHome, isGoogleReady, isSignedIn, isGoogleConfigAvailable, onSignIn }: FormGeneratorAppProps) {
  const { t, language } = useLanguage();
  const [userInput, setUserInput] = useState<string>(exampleInputs.markdown);
  const [formDefinition, setFormDefinition] = useState<FormDefinition | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showGuide, setShowGuide] = useState(false);
  
  const [isCreatingForm, setIsCreatingForm] = useState(false);
  const [createdFormUrl, setCreatedFormUrl] = useState<string | null>(null);
  const [googleError, setGoogleError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const resetState = () => {
    setFormDefinition(null);
    setError(null);
    setGoogleError(null);
    setCreatedFormUrl(null);
    setIsCreatingForm(false);
  };

  const handleGenerate = useCallback(async () => {
    if (!checkGeminiConfig()) {
      setError(t('error.geminiNotConfigured'));
      return;
    }
    if (!userInput.trim()) {
      setError(t('error.inputEmpty'));
      return;
    }
    resetState();
    setIsLoading(true);

    try {
      const definition = await generateFormDefinition(userInput, language);
      setFormDefinition(definition);
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      if (errorMessage.includes('API key not valid')) {
        setError(t('error.geminiApiKeyInvalid'));
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  }, [userInput, t, language]);
  
  const handleCreateGoogleForm = async () => {
    if (!formDefinition) return;
    setIsCreatingForm(true);
    setGoogleError(null);
    try {
      const url = await createGoogleForm(formDefinition);
      setCreatedFormUrl(url);
    } catch(err) {
      console.error(err);
      setGoogleError(err instanceof Error ? err.message : t('error.googleFormCreation'));
    } finally {
      setIsCreatingForm(false);
    }
  };

  const handleCopyToClipboard = () => {
    if (!createdFormUrl) return;
    navigator.clipboard.writeText(createdFormUrl).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  const handleExampleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const key = e.target.value as keyof typeof exampleInputs;
    if (key) {
      setUserInput(exampleInputs[key]);
      resetState();
    }
  };

  if (showGuide) {
    return <GuidePage onBack={() => setShowGuide(false)} />;
  }

  return (
    <>
      <div className="bg-gray-800/50 border-b border-gray-700">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
              <button onClick={onNavigateHome} className="flex items-center gap-1 text-sm text-gray-300 hover:text-violet-400 transition-colors">
                  <ChevronLeftIcon className="w-5 h-5" />
                  {t('formGenerator.backToHome')}
              </button>
              <h2 className="font-bold text-lg text-white">{t('homepage.tool1.title')}</h2>
              <button onClick={() => setShowGuide(true)} className="text-gray-400 hover:text-violet-400" title={t('formGenerator.guideButton')}>
                  <QuestionMarkCircleIcon className="w-6 h-6" />
              </button>
          </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto bg-gray-800 rounded-lg shadow-xl p-6 sm:p-8">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-white">{t('main.title')}</h2>
            <p className="mt-2 text-lg text-gray-400">{t('main.subtitle')}</p>
          </div>
          
          <div className="mb-4">
            <label htmlFor="example-select" className="block text-sm font-medium text-gray-300 mb-1">
              {t('main.loadExample')}
            </label>
            <select
              id="example-select"
              onChange={handleExampleChange}
              className="w-full p-2 border border-gray-600 rounded-md shadow-sm focus:ring-violet-500 focus:border-violet-500 bg-gray-700 text-white"
              defaultValue="markdown"
            >
              <option value="markdown">{t('main.exampleMarkdown')}</option>
              <option value="json">{t('main.exampleJson')}</option>
              <option value="html">{t('main.exampleHtml')}</option>
            </select>
          </div>

          <div>
            <label htmlFor="user-input" className="block text-sm font-medium text-gray-300 mb-1">
              {t('main.inputLabel')}
            </label>
            <textarea
              id="user-input"
              rows={12}
              className="w-full p-3 border border-gray-600 rounded-md shadow-sm focus:ring-violet-500 focus:border-violet-500 text-sm font-mono bg-gray-700 text-gray-200 placeholder-gray-400"
              placeholder={t('main.inputPlaceholder')}
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
            />
          </div>
          
          <div className="mt-6 flex justify-center">
            <button
              onClick={handleGenerate}
              disabled={isLoading}
              className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-violet-600 hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-violet-500 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {t('main.generating')}...
                </>
              ) : (
                <>
                  <SparklesIcon className="w-5 h-5 mr-2" />
                  {t('main.generateButton')}
                </>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="max-w-4xl mx-auto mt-6 bg-red-900/30 border-l-4 border-red-500 text-red-400 p-4 rounded-md" role="alert">
            <div className="flex">
              <div className="py-1"><AlertTriangleIcon className="h-6 w-6 text-red-500 mr-4"/></div>
              <div>
                <p className="font-bold">{t('error.previewTitle')}</p>
                <p>{error}</p>
              </div>
            </div>
          </div>
        )}
        
        {formDefinition && (
          <div className="mt-8">
            <h3 className="text-2xl font-bold text-center mb-4 text-white">{t('preview.title')}</h3>
            <FormPreview definition={formDefinition} />
            
            <div className="max-w-3xl mx-auto mt-6 bg-gray-800 rounded-lg shadow-lg p-6 text-center">
            {!isGoogleConfigAvailable ? (
                  <div className="flex flex-col items-center justify-center gap-4">
                    <AlertTriangleIcon className="h-8 w-8 text-yellow-500"/>
                    <h4 className="font-bold text-white">{t('google.notConfiguredTitle')}</h4>
                    <p className="text-sm text-gray-400">
                      {t('google.notConfiguredBody')}
                    </p>
                    <button
                      onClick={() => setShowGuide(true)}
                      className="mt-2 inline-flex items-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-violet-600 hover:bg-violet-700"
                    >
                      <QuestionMarkCircleIcon className="w-5 h-5" />
                      {t('google.configureKeysButton')}
                    </button>
                  </div>
              ) : !createdFormUrl ? (
                <>
                  <h4 className="text-xl font-bold text-white">{t('google.readyTitle')}</h4>
                  {!isSignedIn ? (
                    <div className="mt-4">
                      <p className="text-gray-400 mb-4">{t('google.signInPrompt')}</p>
                      <button onClick={onSignIn} disabled={!isGoogleReady} className="inline-flex items-center gap-2 px-6 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-gray-800 bg-white hover:bg-gray-200 disabled:bg-gray-400 disabled:cursor-not-allowed">
                        <GoogleIcon className="w-5 h-5" />
                        {t('google.signInButton')}
                      </button>
                    </div>
                  ) : (
                    <div className="mt-4">
                      <p className="text-gray-400 mb-4">{t('google.createPrompt')}</p>
                      <button
                          onClick={handleCreateGoogleForm}
                          disabled={isCreatingForm}
                          className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-green-500 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
                        >
                          {isCreatingForm ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              {t('google.creatingButton')}...
                            </>
                          ) : t('google.createButton')}
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div>
                    <h4 className="text-2xl font-bold text-green-400">{t('google.successTitle')}</h4>
                    <p className="mt-2 text-gray-300">{t('google.successBody')}</p>
                    <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                        <input
                            type="text"
                            readOnly
                            value={createdFormUrl}
                            className="w-full flex-1 p-2 border border-gray-600 rounded-md bg-gray-700 text-white text-center sm:text-left"
                        />
                        <button
                            onClick={handleCopyToClipboard}
                            className="inline-flex items-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-violet-600 hover:bg-violet-700"
                        >
                          {isCopied ? <CheckIcon className="w-5 h-5" /> : <CopyIcon className="w-5 h-5" />}
                          {isCopied ? t('google.copiedButton') : t('google.copyLinkButton')}
                        </button>
                    </div>
                    <button onClick={() => { setUserInput(''); resetState(); }} className="mt-6 text-sm text-violet-400 hover:underline">
                        {t('google.createAnotherButton')}
                    </button>
                </div>
              )}
            </div>
          </div>
        )}
        
        {googleError && (
          <div className="max-w-4xl mx-auto mt-6 bg-red-900/30 border-l-4 border-red-500 text-red-400 p-4 rounded-md" role="alert">
            <div className="flex">
              <div className="py-1"><AlertTriangleIcon className="h-6 w-6 text-red-500 mr-4"/></div>
              <div>
                <p className="font-bold">{t('error.googleApiTitle')}</p>
                <p>{googleError}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}