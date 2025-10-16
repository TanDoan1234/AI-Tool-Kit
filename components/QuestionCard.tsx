import React from 'react';
import { Question, QuestionType } from '../types';
import { useLanguage } from '../i18n/LanguageContext';

interface QuestionCardProps {
  question: Question;
}

const CheckCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
);


const QuestionCard: React.FC<QuestionCardProps> = ({ question }) => {
  const { t } = useLanguage();

  const renderQuestionInput = (q: Question) => {
    switch (q.type) {
      case QuestionType.SHORT_ANSWER:
        return (
          <input
            type="text"
            placeholder={t('question.yourAnswer')}
            className="w-full sm:w-1/2 mt-3 p-2 border-b-2 border-gray-500 focus:border-violet-500 outline-none bg-transparent text-gray-100 transition-colors"
          />
        );
      case QuestionType.PARAGRAPH:
        return (
          <textarea
            placeholder={t('question.yourAnswer')}
            rows={4}
            className="w-full mt-3 p-2 border-b-2 border-gray-500 focus:border-violet-500 outline-none bg-transparent text-gray-100 transition-colors"
          />
        );
      case QuestionType.MULTIPLE_CHOICE:
        return (
          <div className="mt-3 space-y-3">
            {q.options?.map((option, index) => {
              const isCorrect = (q.correctAnswers || []).includes(option);
              return (
                <div key={index} className="flex items-center">
                  <input type="radio" name={q.title} id={`${q.title}-${index}`} className="h-5 w-5 text-violet-500 focus:ring-violet-600 border-gray-500 bg-gray-700" />
                  <label htmlFor={`${q.title}-${index}`} className={`ml-3 block text-sm ${isCorrect ? 'text-green-400 font-medium' : 'text-gray-300'}`}>
                    {option}
                  </label>
                  {isCorrect && <CheckCircleIcon className="w-5 h-5 text-green-500 ml-2" />}
                </div>
              );
            })}
          </div>
        );
      case QuestionType.CHECKBOXES:
        return (
          <div className="mt-3 space-y-3">
            {q.options?.map((option, index) => {
               const isCorrect = (q.correctAnswers || []).includes(option);
               return (
                <div key={index} className="flex items-center">
                    <input type="checkbox" id={`${q.title}-${index}`} className="h-5 w-5 text-violet-500 focus:ring-violet-600 border-gray-500 rounded bg-gray-700" />
                    <label htmlFor={`${q.title}-${index}`} className={`ml-3 block text-sm ${isCorrect ? 'text-green-400 font-medium' : 'text-gray-300'}`}>
                    {option}
                    </label>
                    {isCorrect && <CheckCircleIcon className="w-5 h-5 text-green-500 ml-2" />}
                </div>
               );
            })}
          </div>
        );
      case QuestionType.IMAGE_DISPLAY:
        return null; // Image is handled separately
      default:
        return <p className="text-red-500 text-sm mt-2">Unknown question type: {q.type}</p>;
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-md p-6 mb-4">
        <div className="flex justify-between items-start">
            <h2 className="text-base text-gray-100 flex-1">
                {question.title}
                {question.required && <span className="text-red-400 ml-1">*</span>}
            </h2>
            {question.points && question.points > 0 && (
                <span className="ml-4 text-xs font-semibold text-gray-400 bg-gray-700 px-2 py-1 rounded-md">
                    {question.points} {t('formGenerator.quiz.points')}
                </span>
            )}
        </div>


      {question.imageUrl && (
        <div className="mt-4 flex justify-center">
          <img 
            src={question.imageUrl} 
            alt={question.title || "Question related image"}
            className="max-w-full h-auto max-h-80 object-contain rounded-md border border-gray-600" 
          />
        </div>
      )}

      {renderQuestionInput(question)}
    </div>
  );
};

export default QuestionCard;