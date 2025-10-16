import React from 'react';
import type { FormDefinition } from '../types';
import QuestionCard from './QuestionCard';
import { useLanguage } from '../i18n/LanguageContext';

interface FormPreviewProps {
  definition: FormDefinition;
}

const FormPreview: React.FC<FormPreviewProps> = ({ definition }) => {
  const { t } = useLanguage();
  return (
    <div className="max-w-3xl mx-auto border-t-[10px] border-violet-600 bg-gray-800 rounded-lg shadow-lg">
      <div className="p-6 border-b border-gray-700">
        <h1 className="text-3xl font-normal text-white mb-2">{definition.title}</h1>
        <p className="text-xs text-red-400 mt-4">{t('preview.required')}</p>
      </div>
      <div className="p-2 sm:p-4 bg-gray-900">
        {definition.sections.map((section, sectionIndex) => (
          <React.Fragment key={sectionIndex}>
            {sectionIndex > 0 && (
                <div className="my-4 p-4 rounded-md border-2 border-dashed border-gray-600 bg-gray-800 text-center">
                    <p className="text-sm font-medium text-gray-400">{t('preview.pageBreak')}</p>
                </div>
            )}
             <div className="bg-gray-800 rounded-lg overflow-hidden mb-4">
               {section.title && (
                <div className="px-6 py-4 border-b border-gray-700">
                  <h2 className="text-xl font-medium text-white">{section.title}</h2>
                  {section.description && <p className="text-sm text-gray-400 mt-1">{section.description}</p>}
                </div>
              )}
               <div className="p-1">
                {section.questions.map((question, questionIndex) => (
                  <QuestionCard key={questionIndex} question={question} />
                ))}
              </div>
            </div>
          </React.Fragment>
        ))}
      </div>
       <div className="p-6 flex items-center justify-between">
        <button
          type="button"
          className="px-6 py-2 bg-violet-600 text-white font-medium rounded-md shadow-sm hover:bg-violet-700"
        >
          {t('preview.submit')}
        </button>
        <a href="#" className="text-violet-400 text-sm hover:underline hover:text-violet-300">
          {t('preview.clear')}
        </a>
      </div>
    </div>
  );
};

export default FormPreview;