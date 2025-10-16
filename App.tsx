import React, { useState, useEffect } from 'react';
import HomePage from './components/HomePage';
// FIX: Corrected import to resolve module error.
import FormGeneratorApp from './FormGeneratorApp';
import DiagramGeneratorApp from './DiagramGeneratorApp';
import DocstringGeneratorApp from './DocstringGeneratorApp';
import DataTransformerApp from './DataTransformerApp';
import SqlQueryWriterApp from './SqlQueryWriterApp';
import UnitTestGeneratorApp from './UnitTestGeneratorApp';
import ApiKeyModal from './components/ApiKeyModal';
import Header from './components/Header';
import { getApiKeys, saveApiKeys, isGoogleConfigured as checkGoogleConfig, ApiKeys } from './services/configService';
import { initGoogleClient, signIn, signOut } from './services/googleFormService';
import { useLanguage } from './i18n/LanguageContext';

type View = 'home' | 'formGenerator' | 'diagramGenerator' | 'docstringGenerator' | 'dataTransformer' | 'sqlQueryWriter' | 'unitTestGenerator';

// A simple loading spinner component for the language change overlay
const LoadingSpinner: React.FC = () => (
  <svg className="animate-spin h-10 w-10 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);


export default function App() {
  const [currentView, setCurrentView] = useState<View>('home');
  
  // Shared state lifted up from FormGeneratorApp
  const [isApiModalOpen, setIsApiModalOpen] = useState(false);
  const [apiKeys, setApiKeys] = useState(getApiKeys());
  const [isGoogleConfigAvailable, setIsGoogleConfigAvailable] = useState(false);
  const [isGoogleReady, setIsGoogleReady] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);

  const { isLoading: isLanguageLoading, t } = useLanguage(); // Get loading state from context

  useEffect(() => {
    const googleConf = checkGoogleConfig();
    setIsGoogleConfigAvailable(googleConf);

    if (googleConf) {
      initGoogleClient((isReady, isAuthenticated) => {
        setIsGoogleReady(isReady);
        setIsSignedIn(isAuthenticated);
      });
    } else {
      setIsGoogleReady(false);
      setIsSignedIn(false);
    }
  }, []);

  const handleSaveApiKeys = (keys: ApiKeys) => {
    saveApiKeys(keys);
    setIsApiModalOpen(false);
    window.location.reload();
  };

  const navigateTo = (view: View) => {
    setCurrentView(view);
  };
  
  const renderContent = () => {
    const onOpenSettings = () => setIsApiModalOpen(true);

    switch (currentView) {
      case 'formGenerator':
        return <FormGeneratorApp 
                  isGoogleReady={isGoogleReady} 
                  isSignedIn={isSignedIn} 
                  isGoogleConfigAvailable={isGoogleConfigAvailable} 
                  onSignIn={signIn}
                  onOpenSettings={onOpenSettings}
                />;
      case 'diagramGenerator':
        return <DiagramGeneratorApp onOpenSettings={onOpenSettings} />;
      case 'docstringGenerator':
        return <DocstringGeneratorApp onOpenSettings={onOpenSettings} />;
      case 'dataTransformer':
        return <DataTransformerApp onOpenSettings={onOpenSettings} />;
      case 'sqlQueryWriter':
        return <SqlQueryWriterApp onOpenSettings={onOpenSettings} />;
      case 'unitTestGenerator':
        return <UnitTestGeneratorApp onOpenSettings={onOpenSettings} />;
      case 'home':
      default:
        return <HomePage 
                  onNavigateToFormTool={() => navigateTo('formGenerator')} 
                  onNavigateToDiagramTool={() => navigateTo('diagramGenerator')}
                  onNavigateToDocstringTool={() => navigateTo('docstringGenerator')}
                  onNavigateToDataTransformerTool={() => navigateTo('dataTransformer')}
                  onNavigateToSqlQueryWriterTool={() => navigateTo('sqlQueryWriter')}
                  onNavigateToUnitTestGeneratorTool={() => navigateTo('unitTestGenerator')}
               />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 flex flex-col">
       {isLanguageLoading && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-80 flex flex-col items-center justify-center z-[100]" aria-live="polite" aria-busy="true">
          <LoadingSpinner />
          <p className="mt-4 text-white">{t('header.loading')}...</p>
        </div>
      )}
      
      {/* This wrapper handles the fade transition for the main content */}
      <div className={`flex flex-col flex-grow transition-opacity duration-300 ease-in-out ${isLanguageLoading ? 'opacity-0' : 'opacity-100'}`}>
        <Header 
          onNavigateHome={() => navigateTo('home')}
          onOpenSettings={() => setIsApiModalOpen(true)}
          isGoogleReady={isGoogleReady}
          isSignedIn={isSignedIn}
          isGoogleConfigAvailable={isGoogleConfigAvailable}
          onSignIn={signIn}
          onSignOut={signOut}
          showLanguageToggle={true}
          showHomeButton={currentView !== 'home'}
        />
        
        <main className="flex-grow">
          {renderContent()}
        </main>
      </div>

      {/* API Key modal is kept outside the transitioning wrapper */}
      <ApiKeyModal
        isOpen={isApiModalOpen}
        initialKeys={apiKeys}
        onSave={handleSaveApiKeys}
        onClose={() => setIsApiModalOpen(false)}
      />
    </div>
  );
}