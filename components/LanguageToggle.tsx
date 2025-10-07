import React from 'react';
import { useTranslation } from 'react-i18next';

export const LanguageToggle: React.FC = () => {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'zh-TW' : 'en';
    i18n.changeLanguage(newLang);
  };

  const currentLang = i18n.language === 'zh-TW' ? 'ZH' : 'EN';

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border-2 border-green-500 rounded-full hover:bg-green-50 transition-all shadow-md hover:shadow-lg"
      title={i18n.language === 'en' ? 'Switch to Traditional Chinese' : '切換至英文'}
    >
      <span className="text-xl">🌐</span>
      <span className="font-semibold text-green-700">{currentLang}</span>
    </button>
  );
};
