import React, { useState, useEffect } from 'react';
import HomePage from './components/HomePage';
import FormGeneratorApp from './FormGeneratorApp';
import ApiKeyModal from './components/ApiKeyModal';
import Header from './components/Header';
import { getApiKeys, saveApiKeys, isGoogleConfigured as checkGoogleConfig, ApiKeys } from './services/configService';
import { initGoogleClient, signIn, signOut } from './services/googleFormService';

type View = 'home' | 'formGenerator';

export default function App() {
  const [currentView, setCurrentView] = useState<View>('home');
  
  // Shared state lifted up from FormGeneratorApp
  const [isApiModalOpen, setIsApiModalOpen] = useState(false);
  const [apiKeys, setApiKeys] = useState(getApiKeys());
  const [isGoogleConfigAvailable, setIsGoogleConfigAvailable] = useState(false);
  const [isGoogleReady, setIsGoogleReady] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);

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
    switch (currentView) {
      case 'formGenerator':
        return <FormGeneratorApp 
                  onNavigateHome={() => navigateTo('home')}
                  isGoogleReady={isGoogleReady} 
                  isSignedIn={isSignedIn} 
                  isGoogleConfigAvailable={isGoogleConfigAvailable} 
                  onSignIn={signIn}
                />;
      case 'home':
      default:
        return <HomePage onNavigateToTool={() => navigateTo('formGenerator')} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 flex flex-col">
      <Header 
        onNavigateHome={() => navigateTo('home')}
        onOpenSettings={() => setIsApiModalOpen(true)}
        isGoogleReady={isGoogleReady}
        isSignedIn={isSignedIn}
        isGoogleConfigAvailable={isGoogleConfigAvailable}
        onSignIn={signIn}
        onSignOut={signOut}
        showLanguageToggle={currentView === 'home'}
      />
      
      <main className="flex-grow">
        {renderContent()}
      </main>

      <ApiKeyModal
        isOpen={isApiModalOpen}
        initialKeys={apiKeys}
        onSave={handleSaveApiKeys}
        onClose={() => setIsApiModalOpen(false)}
      />
    </div>
  );
}