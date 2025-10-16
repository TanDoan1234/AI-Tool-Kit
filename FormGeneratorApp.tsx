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
  onOpenSettings: () => void;
}

type ActiveTab = 'preview' | 'google-form' | 'apps-script';

export default function FormGeneratorApp({
  isGoogleReady,
  isSignedIn,
  isGoogleConfigAvailable,
  onSignIn,
  onOpenSettings
}: FormGeneratorAppProps) {
  const { t, language } = useLanguage();

  const formExamples = {
    en: {
      markdown: `# Event Registration
Sign up for our annual tech conference!

## Personal Information
Question 1: Full Name (Short Answer, required)
Question 2: Email Address (Short Answer, required)

## T-Shirt Size
Question 3: What's your t-shirt size? (Multiple Choice)
- Small
- Medium
- Large
- X-Large

![T-shirt graphic](https://via.placeholder.com/400x200.png/94a3e9/ffffff?text=Cool+T-Shirt)

Question 4: Please list any dietary restrictions. (Paragraph)
`,
      json: `{
  "requests": [
    {
      "createItem": {
        "item": {
          "title": "Question 1: Your Name",
          "questionItem": { "question": { "required": true, "textQuestion": {} } }
        }
      }
    },
    {
      "createItem": {
        "item": {
          "title": "Question 2: Your primary development area?",
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
}`,
      html: `<form>
  <h1>Website Feedback</h1>
  <p>Help us improve by answering a few questions.</p>
  
  <label for="email">Question 1: Your Email:</label>
  <input type="email" id="email" name="email" required>
  
  <p>Question 2: Which features do you use? (Check all that apply)</p>
  <input type="checkbox" id="feature1" value="Dashboard">
  <label for="feature1">Dashboard</label><br>
  <input type="checkbox" id="feature2" value="Analytics">
  <label for="feature2">Analytics</label><br>
  
  <label for="comments">Question 3: Any other suggestions?</label>
  <textarea id="comments" rows="5"></textarea>
</form>
`
    },
    vi: {
      markdown: `# Đăng ký sự kiện
Đăng ký tham gia hội nghị công nghệ hàng năm của chúng tôi!

## Thông tin cá nhân
Câu 1: Họ và tên (Trả lời ngắn, bắt buộc)
Câu 2: Địa chỉ Email (Trả lời ngắn, bắt buộc)

## Cỡ áo
Câu 3: Cỡ áo của bạn là gì? (Trắc nghiệm)
- Nhỏ (S)
- Vừa (M)
- Lớn (L)
- Rất lớn (XL)

![Hình áo thun](https://via.placeholder.com/400x200.png/94a3e9/ffffff?text=Ao+Thun+Dep)

Câu 4: Vui lòng liệt kê bất kỳ yêu cầu nào về chế độ ăn uống. (Đoạn văn)
`,
      json: `{
  "requests": [
    {
      "createItem": {
        "item": {
          "title": "Câu 1: Tên của bạn",
          "questionItem": { "question": { "required": true, "textQuestion": {} } }
        }
      }
    },
    {
      "createItem": {
        "item": {
          "title": "Câu 2: Lĩnh vực phát triển chính của bạn là gì?",
          "questionItem": {
            "question": {
              "choiceQuestion": {
                "type": "RADIO",
                "options": [{ "value": "Giao diện người dùng (Frontend)" }, { "value": "Hệ thống (Backend)" }, { "value": "Di động (Mobile)" }, { "value": "Vận hành (DevOps)" }]
              }
            }
          }
        }
      }
    }
  ]
}`,
      html: `<form>
  <h1>Phản hồi về trang web</h1>
  <p>Giúp chúng tôi cải thiện bằng cách trả lời một vài câu hỏi.</p>
  
  <label for="email">Câu 1: Email của bạn:</label>
  <input type="email" id="email" name="email" required>
  
  <p>Câu 2: Bạn sử dụng những tính năng nào? (Chọn tất cả các mục phù hợp)</p>
  <input type="checkbox" id="feature1" value="Bảng điều khiển">
  <label for="feature1">Bảng điều khiển</label><br>
  <input type="checkbox" id="feature2" value="Phân tích">
  <label for="feature2">Phân tích</label><br>
  
  <label for="comments">Câu 3: Bạn có đề xuất nào khác không?</label>
  <textarea id="comments" rows="5"></textarea>
</form>
`
    }
  };

  const quizExamples = {
    en: {
      markdown: `# Vietnam History Quiz
Test your knowledge of Vietnamese history.

## Multiple Choice
Question 1: What was the ancient name of Hanoi? (Multiple Choice, required)
- Gia Định
- Thăng Long*
- Phú Xuân

Question 2: Which dynasty unified Vietnam in the 11th century? (Multiple Choice)
- Trần Dynasty
- Lê Dynasty
- Lý Dynasty*

## Checkboxes
Question 3: Which of the following cities have been capitals of Vietnam at some point in history? (Checkboxes, required)
- Huế*
- Sài Gòn
- Hoa Lư*
- Đà Nẵng
`,
      json: `{
  "title": "Basic Math Quiz",
  "isQuiz": true,
  "sections": [{
    "title": "Arithmetic",
    "questions": [
      {
        "title": "Question 1: What is 2 + 2?",
        "type": "MULTIPLE_CHOICE",
        "options": ["3", "4*", "5"],
        "required": true
      },
      {
        "title": "Question 2: Which numbers are even?",
        "type": "CHECKBOXES",
        "options": ["1", "2*", "3", "4*"]
      }
    ]
  }]
}`,
      html: `<form>
  <h1>Capital Cities Quiz</h1>
  <p>Question 1: What is the capital of France? (required)</p>
  <input type="radio" name="q1"> London<br>
  <input type="radio" name="q1"> Berlin<br>
  <input type="radio" name="q1"> Paris*<br>
  
  <p>Question 2: Which of these are countries in Asia?</p>
  <input type="checkbox"> Japan*<br>
  <input type="checkbox"> Brazil<br>
  <input type="checkbox"> Vietnam*<br>
</form>
`
    },
    vi: {
      markdown: `# Trắc nghiệm Lịch sử Việt Nam
Kiểm tra kiến thức của bạn về lịch sử Việt Nam.

## Trắc nghiệm
Câu 1: Tên gọi xưa của Hà Nội là gì? (Trắc nghiệm, bắt buộc)
- Gia Định
- Thăng Long*
- Phú Xuân

Câu 2: Triều đại nào đã thống nhất Việt Nam vào thế kỷ 11? (Trắc nghiệm)
- Nhà Trần
- Nhà Lê
- Nhà Lý*

## Hộp kiểm
Câu 3: Thành phố nào sau đây đã từng là thủ đô của Việt Nam trong lịch sử? (Hộp kiểm, bắt buộc)
- Huế*
- Sài Gòn
- Hoa Lư*
- Đà Nẵng
`,
      json: `{
  "title": "Bài kiểm tra Toán cơ bản",
  "isQuiz": true,
  "sections": [{
    "title": "Số học",
    "questions": [
      {
        "title": "Câu 1: 2 + 2 bằng mấy?",
        "type": "MULTIPLE_CHOICE",
        "options": ["3", "4*", "5"],
        "required": true
      },
      {
        "title": "Câu 2: Số nào là số chẵn?",
        "type": "CHECKBOXES",
        "options": ["1", "2*", "3", "4*"]
      }
    ]
  }]
}`,
      html: `<form>
  <h1>Trắc nghiệm Thủ đô các nước</h1>
  <p>Câu 1: Thủ đô của Pháp là gì? (bắt buộc)</p>
  <input type="radio" name="q1"> Luân Đôn<br>
  <input type="radio" name="q1"> Berlin<br>
  <input type="radio" name="q1"> Paris*<br>
  
  <p>Câu 2: Nước nào sau đây thuộc châu Á?</p>
  <input type="checkbox"> Nhật Bản*<br>
  <input type="checkbox"> Brazil<br>
  <input type="checkbox"> Việt Nam*<br>
</form>
`
    }
  };

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
  
  // Advanced & Quiz Options State
  const [shouldCreateSheet, setShouldCreateSheet] = useState(false);
  const [isQuiz, setIsQuiz] = useState(false);
  const [defaultPoints, setDefaultPoints] = useState(10);


  const currentExamples = isQuiz ? quizExamples[language] : formExamples[language];

  const getFullDefinition = (baseDefinition: FormDefinition): FormDefinition => {
    return {
      ...baseDefinition,
      isQuiz: isQuiz,
      quizSettings: isQuiz ? {
        releaseScoreImmediately: true,
        showCorrectAnswers: false,
        showPointValues: false,
      } : undefined
    };
  };

  useEffect(() => {
    if (formDefinition) {
      const fullDefinition = getFullDefinition(formDefinition);
      const script = generateAppsScriptCode(fullDefinition, language, { shouldCreateSheet });
      setGeneratedScript(script);
    } else {
      setGeneratedScript('');
    }
    setFormUrl(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formDefinition, language, shouldCreateSheet, isQuiz]);

  const handleGenerate = async () => {
    if (!userInput.trim()) return;
    setIsLoading(true);
    setError(null);
    setFormDefinition(null);
    setActiveTab('preview');
    try {
      const definition = await generateFormDefinition(userInput, language, { isQuiz, defaultPoints });
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
      const fullDefinition = getFullDefinition(formDefinition);
      const url = await createGoogleForm(fullDefinition);
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:items-start">
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
                    <button onClick={() => setUserInput(currentExamples.markdown)} className="text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-full px-3 py-1 transition-colors">
                        {t('formGenerator.tryExample.markdown')}
                    </button>
                    <button onClick={() => setUserInput(currentExamples.json)} className="text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-full px-3 py-1 transition-colors">
                        {t('formGenerator.tryExample.json')}
                    </button>
                    <button onClick={() => setUserInput(currentExamples.html)} className="text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-full px-3 py-1 transition-colors">
                        {t('formGenerator.tryExample.html')}
                    </button>
                </div>
            </div>
            <div className="my-4 p-4 border border-gray-700 rounded-lg w-full text-left bg-gray-800/50 space-y-4">
                <div>
                    <h4 className="font-semibold text-white mb-3">{t('formGenerator.quiz.title')}</h4>
                    <div className="flex items-start">
                         <input
                            id="isQuiz"
                            type="checkbox"
                            checked={isQuiz}
                            onChange={(e) => setIsQuiz(e.target.checked)}
                            className="h-4 w-4 rounded border-gray-500 text-violet-600 focus:ring-violet-500 bg-gray-700 mt-1"
                        />
                         <div className="ml-3 text-sm">
                            <label htmlFor="isQuiz" className="font-medium text-gray-300 cursor-pointer">
                                {t('formGenerator.quiz.makeQuizLabel')}
                            </label>
                            <p className="text-gray-500 text-xs mt-1">
                                {t('formGenerator.quiz.makeQuizNote')}
                            </p>
                        </div>
                    </div>
                    {isQuiz && (
                        <div className="mt-4 pl-7 animate-fade-in-fast">
                            <label htmlFor="defaultPoints" className="block text-sm font-medium text-gray-300">
                                {t('formGenerator.quiz.defaultPointsLabel')}
                            </label>
                            <div className="mt-1 flex rounded-md shadow-sm">
                                <input
                                    type="number"
                                    id="defaultPoints"
                                    value={defaultPoints}
                                    onChange={(e) => setDefaultPoints(Number(e.target.value) >= 0 ? Number(e.target.value) : 0)}
                                    className="block w-24 rounded-l-md border-gray-500 bg-gray-700 text-white focus:border-violet-500 focus:ring-violet-500 sm:text-sm p-2"
                                    min="0"
                                />
                                <span className="inline-flex items-center rounded-r-md border border-l-0 border-gray-500 bg-gray-600 px-3 text-sm text-gray-300">
                                    {t('formGenerator.quiz.points')}
                                </span>
                            </div>
                        </div>
                    )}
                </div>
                <div className="pt-4 border-t border-gray-700">
                    <h4 className="font-semibold text-white mb-3">{t('formGenerator.advancedOptions.title')}</h4>
                    <div className="flex items-start">
                        <input
                            id="createSheet"
                            type="checkbox"
                            checked={shouldCreateSheet}
                            onChange={(e) => setShouldCreateSheet(e.target.checked)}
                            className="h-4 w-4 rounded border-gray-500 text-violet-600 focus:ring-violet-500 bg-gray-700 mt-1"
                        />
                        <div className="ml-3 text-sm">
                            <label htmlFor="createSheet" className="font-medium text-gray-300 cursor-pointer">
                                {t('formGenerator.advancedOptions.createSheetLabel')}
                            </label>
                            <p className="text-gray-500 text-xs mt-1">
                                {t('formGenerator.advancedOptions.appsScriptOnlyNote')}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            <button
              onClick={handleGenerate}
              disabled={isLoading}
              className="w-full py-3 px-4 bg-violet-600 text-white font-semibold rounded-md shadow-md hover:bg-violet-700 disabled:bg-violet-800 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? t('formGenerator.generatingButton') : t('formGenerator.generateButton')}
            </button>
          </div>

          {/* Right Panel: Output */}
          <div className="bg-gray-800 rounded-lg shadow-lg p-1 sm:p-2 flex flex-col animate-fade-in-right">
            {error && (() => {
              const isApiKeyError = error.includes('API key is not configured');
              return (
                <div className="m-4 p-4 bg-red-900/50 border border-red-700 text-red-300 rounded-md">
                  <h3 className="font-bold">{t('formGenerator.error')}</h3>
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
                        {t('formGenerator.tryAgain')}
                      </button>
                    )}
                  </div>
                </div>
              );
            })()}
            
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
                        <h3 className="text-xl font-bold text-white mb-2">Create your form instantly</h3>
                        

                         {!isGoogleConfigAvailable ? (
                             <p className="max-w-md text-yellow-400 bg-yellow-900/30 p-3 rounded-md mt-2">
                                {t('formGenerator.googleConfigWarning')}
                            </p>
                         ) : (
                            <>
                                {formUrl ? (
                                    <div className="p-4 bg-green-900/50 border border-green-700 text-green-300 rounded-md mt-2">
                                        <p className="font-bold">{t('formGenerator.formCreatedSuccess')}</p>
                                        <a href={formUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                                            {t('formGenerator.viewForm')}
                                        </a>
                                    </div>
                                ) : (
                                     <button
                                        onClick={handleCreateGoogleForm}
                                        disabled={isCreatingForm || !isGoogleReady}
                                        className="mt-2 inline-flex items-center gap-2 px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-gray-800 bg-white hover:bg-gray-200 disabled:bg-gray-400 disabled:cursor-wait transition-colors"
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
                    <svg className="animate-spin h-10 w-10 text-violet-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 2000/svg">
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