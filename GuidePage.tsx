import React from 'react';
import { useLanguage } from '../i18n/LanguageContext';

interface GuidePageProps {
  onBack: () => void;
}

const GuideLink: React.FC<{ href: string; children: React.ReactNode }> = ({ href, children }) => (
  <a href={href} target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:underline font-medium">
    {children}
  </a>
);

const GuideCard: React.FC<{ title: string; step: number; children: React.ReactNode }> = ({ title, step, children }) => (
  <div className="bg-gray-800 rounded-lg shadow-xl p-6 sm:p-8 mb-8">
    <h2 className="text-2xl font-bold text-violet-400 mb-4">
      <span className="text-gray-500 font-mono text-xl mr-3">{step}.</span>{title}
    </h2>
    <div className="space-y-4 text-gray-300 leading-relaxed">{children}</div>
  </div>
);


const GuidePage: React.FC<GuidePageProps> = ({ onBack }) => {
  const { t } = useLanguage();
  return (
    <div className="bg-gray-900 text-gray-200">
      <header className="bg-gray-800 shadow-lg border-b border-gray-700 sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-200">{t('guide.header.title')}</h1>
          <button
            onClick={onBack}
            className="px-4 py-2 bg-violet-600 text-white font-medium rounded-md shadow-sm hover:bg-violet-700"
          >
            {t('guide.header.backButton')}
          </button>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gray-800 rounded-lg p-6 mb-8 text-center">
            <h2 className="text-3xl font-bold text-white">{t('guide.main.title')}</h2>
            <p className="mt-2 text-lg text-gray-400">
              {t('guide.main.subtitle')}
            </p>
          </div>

          <GuideCard title={t('guide.step1.title')} step={1}>
            <p>{t('guide.step1.p1')}</p>
            <ol className="list-decimal list-inside space-y-2 pl-4">
              <li>
                {t('guide.step1.li1.text')}{' '}
                <GuideLink href="https://aistudio.google.com/app/apikey">Google AI Studio</GuideLink>.
              </li>
              <li>{t('guide.step1.li2')}</li>
              <li>{t('guide.step1.li3.text')} <strong className="text-white">"{t('guide.step1.li3.button')}"</strong>.</li>
              <li>{t('guide.step1.li4.text')} <strong className="text-white">"{t('guide.step1.li4.field')}"</strong> {t('guide.step1.li4.location')}</li>
            </ol>
          </GuideCard>

          <GuideCard title={t('guide.step2.title')} step={2}>
            <p>{t('guide.step2.p1')}</p>

            <h3 className="text-xl font-semibold text-white pt-4 border-t border-gray-700">{t('guide.step2_1.title')}</h3>
            <ol className="list-decimal list-inside space-y-2 pl-4">
              <li>
                {t('guide.step2_1.li1.text')} <GuideLink href="https://console.cloud.google.com/">{t('guide.step2_1.li1.link')}</GuideLink>.
              </li>
              <li>{t('guide.step2_1.li2.text')} <strong className="text-white">"{t('guide.step2_1.li2.button')}"</strong>.</li>
              <li>{t('guide.step2_1.li3.text')} <strong className="text-white">"{t('guide.step2_1.li3.button')}"</strong>.</li>
            </ol>
            
            <h3 className="text-xl font-semibold text-white pt-4 border-t border-gray-700 mt-6">{t('guide.step2_2.title')}</h3>
            <ol className="list-decimal list-inside space-y-2 pl-4">
                <li>{t('guide.step2_2.li1')}</li>
                <li>{t('guide.step2_2.li2')}</li>
                <li>{t('guide.step2_2.li3.text')} <strong className="text-white">"{t('guide.step2_2.li3.button')}"</strong> {t('guide.step2_2.li3.wait')}</li>
            </ol>

            <h3 className="text-xl font-semibold text-white pt-4 border-t border-gray-700 mt-6">{t('guide.step2_3.title')}</h3>
             <ol className="list-decimal list-inside space-y-2 pl-4">
                <li>{t('guide.step2_3.li1.text')} <GuideLink href="https://console.cloud.google.com/apis/credentials">{t('guide.step2_3.li1.link')}</GuideLink>.</li>
                <li>{t('guide.step2_3.li2.text')} <strong className="text-white">"{t('guide.step2_3.li2.button1')}"</strong> {t('guide.step2_3.li2.and')} <strong className="text-white">"{t('guide.step2_3.li2.button2')}"</strong>.</li>
                <li>{t('guide.step2_3.li3.text')} <strong className="text-white">{t('guide.step2_3.li3.field')}</strong>.</li>
             </ol>

            <h3 className="text-xl font-semibold text-white pt-4 border-t border-gray-700 mt-6">{t('guide.step2_4.title')}</h3>
             <p>{t('guide.step2_4.p1')}</p>
             <ol className="list-decimal list-inside space-y-2 pl-4">
                <li>{t('guide.step2_4.li1.text')} <strong className="text-white">"{t('guide.step2_4.li1.screen')}"</strong>.</li>
                <li>{t('guide.step2_4.li2.text')} <strong className="text-white">"{t('guide.step2_4.li2.type')}"</strong> {t('guide.step2_4.li2.and')} <strong className="text-white">"{t('guide.step2_4.li2.button')}"</strong>.</li>
                <li>{t('guide.step2_4.li3')}</li>
                <li>{t('guide.step2_4.li4')}</li>
                <li className="p-3 bg-yellow-900/30 border-l-4 border-yellow-500 rounded-md">
                    <strong className="text-yellow-400">{t('guide.step2_4.li5.crucial')}</strong> {t('guide.step2_4.li5.text1')} <strong className="text-white">"{t('guide.step2_4.li5.button')}"</strong>. {t('guide.step2_4.li5.text2')}
                </li>
                 <li>{t('guide.step2_4.li6')}</li>
            </ol>

            <h3 className="text-xl font-semibold text-white pt-4 border-t border-gray-700 mt-6">{t('guide.step2_5.title')}</h3>
            <p>{t('guide.step2_5.p1')}</p>
            <ol className="list-decimal list-inside space-y-2 pl-4">
                <li>{t('guide.step2_5.li1.text')} <GuideLink href="https://console.cloud.google.com/apis/credentials">{t('guide.step2_5.li1.link')}</GuideLink> {t('guide.step2_5.li1.page')}</li>
                <li>{t('guide.step2_5.li2.text')} <strong className="text-white">"{t('guide.step2_5.li2.button1')}"</strong> {t('guide.step2_5.li2.and')} <strong className="text-white">"{t('guide.step2_5.li2.button2')}"</strong>.</li>
                <li>{t('guide.step2_5.li3.text')} <strong className="text-white">"{t('guide.step2_5.li3.type')}"</strong>.</li>
                <li className="p-3 bg-yellow-900/30 border-l-4 border-yellow-500 rounded-md">
                    <strong className="text-yellow-400">{t('guide.step2_5.li4.crucial')}</strong> {t('guide.step2_5.li4.text1')} <strong className="text-white">"+ ADD URI"</strong>. {t('guide.step2_5.li4.text2')} <code className="bg-gray-700 px-1 rounded">http://localhost:3000</code>.
                </li>
                <li>{t('guide.step2_5.li5')}</li>
                <li>{t('guide.step2_5.li6.text')} <strong className="text-white">"{t('guide.step2_5.li6.button')}"</strong>.</li>
                <li>{t('guide.step2_5.li7.text')} <strong className="text-white">{t('guide.step2_5.li7.field1')}</strong>. {t('guide.step2_5.li7.text2')} <strong className="text-white">{t('guide.step2_5.li7.field2')}</strong>.</li>
            </ol>
          </GuideCard>
           <GuideCard title={t('guide.step3.title')} step={3}>
                <p>{t('guide.step3.p1')}</p>
                <ol className="list-decimal list-inside space-y-2 pl-4">
                    <li>{t('guide.step3.li1')}</li>
                    <li>{t('guide.step3.li2')}</li>
                    <li>{t('guide.step3.li3')}</li>
                    <li>{t('guide.step3.li4.text')} <strong className="text-white">"{t('guide.step3.li4.button')}"</strong>. {t('guide.step3.li4.text2')}</li>
                    <li>{t('guide.step3.li5')}</li>
                </ol>
           </GuideCard>
        </div>
      </main>
    </div>
  );
};

export default GuidePage;