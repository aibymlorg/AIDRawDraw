import React from 'react';
import { useTranslation } from 'react-i18next';
import { LanguageToggle } from './LanguageToggle';

const PaintBrushIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 md:h-12 md:w-12 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
    <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
    <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
  </svg>
);

const SparklesIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m1-12a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1h-6a1 1 0 01-1-1V6zM17 3a1 1 0 011-1h.01a1 1 0 011 1v.01a1 1 0 01-1 1H18a1 1 0 01-1-1V3zm1 14a1 1 0 011-1h.01a1 1 0 011 1v.01a1 1 0 01-1 1H18a1 1 0 01-1-1v-.01z" />
  </svg>
);


export const Header: React.FC = () => {
  const { t } = useTranslation();

  return (
    <header className="text-center my-6 md:my-8">
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-green-200/50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1"></div>
          <div className="flex items-center justify-center gap-4 flex-1">
            <PaintBrushIcon />
            <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 via-emerald-500 to-teal-500">
              KnowKidDraw
            </h1>
            <SparklesIcon />
          </div>
          <div className="flex-1 flex justify-end">
            <LanguageToggle />
          </div>
        </div>
        <p className="text-lg text-gray-700 font-medium">{t('subtitle')} 🌿🎨</p>
      </div>
    </header>
  );
};