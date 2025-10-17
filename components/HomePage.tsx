import React, { useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { DocumentTextIcon, ChartBarIcon, GithubIcon, LinkedinIcon, GmailIcon, XIcon, CodeIcon, ArrowPathIcon, DatabaseIcon, ShieldCheckIcon, ArrowsRightLeftIcon } from './icons';

interface HomePageProps {
  onNavigateToFormTool: () => void;
  onNavigateToDiagramTool: () => void;
  onNavigateToDocstringTool: () => void;
  onNavigateToDataTransformerTool: () => void;
  onNavigateToSqlQueryWriterTool: () => void;
  onNavigateToUnitTestGeneratorTool: () => void;
  onNavigateToFileConverterTool: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ 
  onNavigateToFormTool, 
  onNavigateToDiagramTool, 
  onNavigateToDocstringTool, 
  onNavigateToDataTransformerTool,
  onNavigateToSqlQueryWriterTool,
  onNavigateToUnitTestGeneratorTool,
  onNavigateToFileConverterTool
}) => {
  const { t } = useLanguage();
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const qrCodeUrl = "https://i.ibb.co/VYnm5RB3/qr-code.jpg";

  const ToolCard: React.FC<{onClick: () => void; icon: React.ReactNode; titleKey: string; descriptionKey: string;}> = ({ onClick, icon, titleKey, descriptionKey }) => (
      <div 
        onClick={onClick}
        className="group bg-gray-800 rounded-lg shadow-xl p-6 flex flex-col items-center text-center cursor-pointer border-2 border-gray-700/50 hover:border-violet-500 hover:shadow-violet-500/20 transform hover:-translate-y-1 transition-all duration-300"
      >
          <div className="p-4 bg-gray-700 rounded-full mb-4 group-hover:bg-violet-600 transition-colors">
              {icon}
          </div>
          <h3 className="text-xl font-bold text-white mb-2">{t(titleKey as any)}</h3>
          <p className="text-gray-400 flex-grow text-sm">{t(descriptionKey as any)}</p>
          <span className="mt-6 inline-block text-sm font-medium text-violet-400 group-hover:underline">
              {t('homepage.launchTool')} &rarr;
          </span>
      </div>
  );

  return (
    <>
      <div className="w-full bg-gradient-to-b from-gray-900 via-violet-900/20 to-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center mb-16 animate-fade-in-up">
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight">{t('homepage.title')}</h2>
              <p className="mt-4 max-w-2xl mx-auto text-lg sm:text-xl text-gray-400">{t('homepage.author')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in-up animation-delay-200">
              <ToolCard
                  onClick={onNavigateToFormTool}
                  icon={<DocumentTextIcon className="w-8 h-8 text-violet-400 group-hover:text-white transition-colors" />}
                  titleKey="homepage.tool1.title"
                  descriptionKey="homepage.tool1.description"
              />
               <ToolCard
                  onClick={onNavigateToDiagramTool}
                  icon={<ChartBarIcon className="w-8 h-8 text-violet-400 group-hover:text-white transition-colors" />}
                  titleKey="homepage.tool2.title"
                  descriptionKey="homepage.tool2.description"
              />
              <ToolCard
                  onClick={onNavigateToDocstringTool}
                  icon={<CodeIcon className="w-8 h-8 text-violet-400 group-hover:text-white transition-colors" />}
                  titleKey="homepage.tool3.title"
                  descriptionKey="homepage.tool3.description"
              />
              <ToolCard
                  onClick={onNavigateToDataTransformerTool}
                  icon={<ArrowPathIcon className="w-8 h-8 text-violet-400 group-hover:text-white transition-colors" />}
                  titleKey="homepage.tool4.title"
                  descriptionKey="homepage.tool4.description"
              />
              <ToolCard
                  onClick={onNavigateToSqlQueryWriterTool}
                  icon={<DatabaseIcon className="w-8 h-8 text-violet-400 group-hover:text-white transition-colors" />}
                  titleKey="homepage.tool5.title"
                  descriptionKey="homepage.tool5.description"
              />
              <ToolCard
                  onClick={onNavigateToUnitTestGeneratorTool}
                  icon={<ShieldCheckIcon className="w-8 h-8 text-violet-400 group-hover:text-white transition-colors" />}
                  titleKey="homepage.tool6.title"
                  descriptionKey="homepage.tool6.description"
              />
              <ToolCard
                  onClick={onNavigateToFileConverterTool}
                  icon={<ArrowsRightLeftIcon className="w-8 h-8 text-violet-400 group-hover:text-white transition-colors" />}
                  titleKey="homepage.tool7.title"
                  descriptionKey="homepage.tool7.description"
              />
          </div>

          <div className="text-center mt-24 animate-fade-in-up animation-delay-400">
              <div className="flex justify-center items-center gap-8 mb-6">
                  <a href="https://github.com/TanDoan1234" target="_blank" rel="noopener noreferrer" title="GitHub" className="text-gray-400 hover:text-white transition-colors">
                      <GithubIcon className="w-8 h-8" />
                  </a>
                  <a href="https://linkedin.com/in/tandoanminh/" target="_blank" rel="noopener noreferrer" title="LinkedIn" className="text-gray-400 hover:text-white transition-colors">
                      <LinkedinIcon className="w-8 h-8" />
                  </a>
                  <a href="mailto:doanminhtan.dev@gmail.com" title="Gmail" className="text-gray-400 hover:text-white transition-colors">
                      <GmailIcon className="w-8 h-8" />
                  </a>
              </div>
              <p className="text-gray-300 mb-4">{t('homepage.donationPrompt')}</p>
              <div 
                className="inline-block p-2 bg-white rounded-xl shadow-md transform hover:-translate-y-2 hover:scale-105 transition-all duration-300 cursor-pointer"
                onClick={() => setIsQrModalOpen(true)}
                aria-label="View QR Code"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter') setIsQrModalOpen(true); }}
              >
                  <img src={qrCodeUrl} alt="QR Code for donation" className="w-48 h-48 rounded-lg" />
              </div>
          </div>
        </div>

        <footer className="text-center py-6 text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} Tân Đoàn. All Rights Reserved.</p>
        </footer>
      </div>

      {isQrModalOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4 animate-fade-in-fast"
          onClick={() => setIsQrModalOpen(false)}
          aria-modal="true"
          role="dialog"
        >
          <div 
            className="relative animate-modal-show"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white rounded-xl shadow-2xl p-4">
              <img src={qrCodeUrl} alt="Enlarged QR Code for donation" className="w-80 h-80 sm:w-96 sm:h-96 rounded-lg" />
            </div>
            <button 
              onClick={() => setIsQrModalOpen(false)} 
              className="absolute -top-3 -right-3 bg-gray-800 text-white rounded-full p-2 shadow-lg hover:bg-violet-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-white transition-colors"
              aria-label="Close QR Code view"
            >
              <XIcon className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default HomePage;