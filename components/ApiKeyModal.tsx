import React, { useState, useEffect } from 'react';
import { ApiKeys } from '../services/configService';
import { XIcon } from './icons';
import { useLanguage } from '../i18n/LanguageContext';

interface ApiKeyModalProps {
  isOpen: boolean;
  initialKeys: ApiKeys;
  onSave: (keys: ApiKeys) => void;
  onClose: () => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, initialKeys, onSave, onClose }) => {
  const { t } = useLanguage();
  const [keys, setKeys] = useState<ApiKeys>(initialKeys);

  useEffect(() => {
    setKeys(initialKeys);
  }, [initialKeys, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setKeys(prev => ({ ...prev, [name]: value.trim() }));
  };

  const handleSaveClick = () => {
    onSave(keys);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-lg relative text-gray-200">
        <div className="p-6 sm:p-8">
            <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white" aria-label={t('modal.close')}>
            <XIcon className="w-6 h-6" />
            </button>
            <h2 id="modal-title" className="text-2xl font-bold mb-4 text-violet-400">{t('modal.title')}</h2>
            <p className="text-sm text-gray-400 mb-6">
            {t('modal.subtitle')}
            </p>

            <div className="space-y-4">
            <div>
                <label htmlFor="geminiApiKey" className="block text-sm font-medium text-gray-300">
                {t('modal.geminiKeyLabel')}
                </label>
                <input
                type="password"
                id="geminiApiKey"
                name="geminiApiKey"
                value={keys.geminiApiKey}
                onChange={handleChange}
                className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                />
                <p className="mt-1 text-xs text-gray-500">
                {t('modal.geminiKeyHint')}{' '}
                <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:underline">
                    Google AI Studio
                </a>.
                </p>
            </div>
            <div>
                <label htmlFor="googleApiKey" className="block text-sm font-medium text-gray-300">
                {t('modal.googleApiLabel')}
                </label>
                <input
                type="password"
                id="googleApiKey"
                name="googleApiKey"
                value={keys.googleApiKey}
                onChange={handleChange}
                className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                />
                <p className="mt-1 text-xs text-gray-500">
                {t('modal.googleApiHint')}{' '}
                <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:underline">
                    Google Cloud Console
                </a>.
                </p>
            </div>
            <div>
                <label htmlFor="googleClientId" className="block text-sm font-medium text-gray-300">
                {t('modal.googleClientIdLabel')}
                </label>
                <input
                type="text"
                id="googleClientId"
                name="googleClientId"
                value={keys.googleClientId}
                onChange={handleChange}
                className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                />
                <p className="mt-1 text-xs text-gray-500">
                {t('modal.googleClientIdHint')}{' '}
                <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:underline">
                    {t('modal.cloudConsoleLink')}
                </a>.
                </p>
            </div>
            </div>
        </div>
        <div className="bg-gray-700 px-6 py-4 flex justify-end gap-4 rounded-b-lg">
            <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-600 rounded-md hover:bg-gray-500">
                {t('modal.cancel')}
            </button>
            <button onClick={handleSaveClick} className="px-6 py-2 text-sm font-medium text-white bg-violet-600 rounded-md hover:bg-violet-700">
                {t('modal.save')}
            </button>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyModal;