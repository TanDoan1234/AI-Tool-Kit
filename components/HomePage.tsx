import React from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { DocumentTextIcon, ChartBarIcon } from './icons';

interface HomePageProps {
  onNavigateToFormTool: () => void;
  onNavigateToDiagramTool: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ onNavigateToFormTool, onNavigateToDiagramTool }) => {
  const { t } = useLanguage();

  return (
    <div className="w-full bg-gradient-to-b from-gray-900 via-violet-900/20 to-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight">{t('homepage.title')}</h2>
            <p className="mt-4 max-w-2xl mx-auto text-lg sm:text-xl text-gray-400">{t('homepage.author')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in-up animation-delay-200">
            {/* Form Tool Card */}
            <div 
                onClick={onNavigateToFormTool}
                className="group bg-gray-800 rounded-lg shadow-xl p-6 flex flex-col items-center text-center cursor-pointer border-2 border-gray-700/50 hover:border-violet-500 hover:shadow-violet-500/20 transform hover:-translate-y-1 transition-all duration-300"
            >
                <div className="p-4 bg-gray-700 rounded-full mb-4 group-hover:bg-violet-600 transition-colors">
                    <DocumentTextIcon className="w-8 h-8 text-violet-400 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{t('homepage.tool1.title')}</h3>
                <p className="text-gray-400 flex-grow">{t('homepage.tool1.description')}</p>
                <span className="mt-6 inline-block text-sm font-medium text-violet-400 group-hover:underline">
                    {t('homepage.launchTool')} &rarr;
                </span>
            </div>

            {/* Diagram Tool Card */}
            <div 
                onClick={onNavigateToDiagramTool}
                className="group bg-gray-800 rounded-lg shadow-xl p-6 flex flex-col items-center text-center cursor-pointer border-2 border-gray-700/50 hover:border-violet-500 hover:shadow-violet-500/20 transform hover:-translate-y-1 transition-all duration-300"
            >
                <div className="p-4 bg-gray-700 rounded-full mb-4 group-hover:bg-violet-600 transition-colors">
                    <ChartBarIcon className="w-8 h-8 text-violet-400 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{t('homepage.tool2.title')}</h3>
                <p className="text-gray-400 flex-grow">{t('homepage.tool2.description')}</p>
                <span className="mt-6 inline-block text-sm font-medium text-violet-400 group-hover:underline">
                    {t('homepage.launchTool')} &rarr;
                </span>
            </div>
            
            {/* Placeholder for future tools */}
            <div 
                className="group bg-gray-800 rounded-lg shadow-xl p-6 flex flex-col items-center justify-center text-center border-2 border-dashed border-gray-700"
            >
                <p className="text-gray-500">{t('homepage.comingSoon')}</p>
            </div>
        </div>
      </div>

       <footer className="text-center py-6 text-gray-500 text-sm">
        <p>&copy; {new Date().getFullYear()} Tân Đoàn. All Rights Reserved.</p>
      </footer>
    </div>
  );
};

export default HomePage;