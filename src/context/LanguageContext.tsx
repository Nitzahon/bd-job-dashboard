import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Language, Direction } from '../types';
import { getLocaleInfoFromUrl, updateUrlWithLanguage } from '../services/localizationService';

interface LanguageContextType {
  language: Language;
  direction: Direction;
  changeLanguage: (language: Language) => void;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps): React.ReactElement {
  const { i18n } = useTranslation();
  
  // Get initial locale info from URL
  const [localeInfo, setLocaleInfo] = useState(() => getLocaleInfoFromUrl());
  
  const { language, direction, isRTL } = localeInfo;

  // Listen for URL changes (browser navigation) and custom language change events
  useEffect(() => {
    const handleLanguageChange = () => {
      setLocaleInfo(getLocaleInfoFromUrl());
    };
    
    const handlePopState = () => {
      setLocaleInfo(getLocaleInfoFromUrl());
    };

    // Listen for our custom language change events
    window.addEventListener('languagechange', handleLanguageChange);
    
    // Listen for browser navigation (back/forward)
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('languagechange', handleLanguageChange);
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Update i18n language when language changes
  useEffect(() => {
    if (i18n.language !== language) {
      i18n.changeLanguage(language);
    }
  }, [language, i18n]);

  // Update document direction and lang attribute
  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = direction;
    document.body.dir = direction;
  }, [language, direction]);

  const changeLanguage = useCallback((newLang: Language) => {
    updateUrlWithLanguage(newLang);
    // The languagechange event will trigger and update our state
  }, []);

  const contextValue: LanguageContextType = useMemo(() => ({
    language,
    direction,
    changeLanguage,
    isRTL
  }), [language, direction, changeLanguage, isRTL]);

  return (
    <LanguageContext.Provider value={contextValue}>
      <div className={`app-container ${isRTL ? 'rtl' : 'ltr'}`}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
