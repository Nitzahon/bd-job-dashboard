import { Language, Direction } from '../types';

export interface LocaleInfo {
  language: Language;
  direction: Direction;
  isRTL: boolean;
}

/**
 * Extracts language information from the current URL
 * Follows the pattern:
 * - /he/... -> Hebrew (RTL)
 * - /... (no language prefix) -> English (LTR, default)
 */
export function getLocaleInfoFromUrl(): LocaleInfo {
  const pathname = window.location.pathname;
  
  // Check if URL starts with a language code
  const langMatch = pathname.match(/^\/([a-z]{2})(\/|$)/);
  const extractedLang = langMatch ? langMatch[1] : null;
  
  // Validate and set language (default to English)
  const language: Language = extractedLang === 'he' ? 'he' : 'en';
  
  // Determine direction based on language
  const direction: Direction = language === 'he' ? 'rtl' : 'ltr';
  const isRTL = direction === 'rtl';
  
  return {
    language,
    direction,
    isRTL
  };
}

/**
 * Updates the URL with a new language code
 * @param newLanguage - The language to switch to
 */
export function updateUrlWithLanguage(newLanguage: Language): void {
  const currentPath = window.location.pathname;
  
  // Remove current language from path if it exists
  const pathWithoutLang = currentPath.replace(/^\/[a-z]{2}(\/|$)/, '/');
  
  // Build new path
  let newPath: string;
  if (newLanguage === 'en') {
    // English is default, no language code in URL
    newPath = pathWithoutLang === '/' ? '/' : pathWithoutLang;
  } else {
    // Other languages get language code prefix
    newPath = `/${newLanguage}${pathWithoutLang === '/' ? '' : pathWithoutLang}`;
  }
  
  // Clean up double slashes
  newPath = newPath.replace(/\/+/g, '/');
  
  // Update URL without triggering a page reload
  window.history.replaceState(null, '', newPath);
  
  // Trigger a custom event to notify components of language change
  window.dispatchEvent(new CustomEvent('languagechange', { 
    detail: { language: newLanguage } 
  }));
}

/**
 * Validates if a string is a supported language code
 */
export function isValidLanguage(lang: string): lang is Language {
  return lang === 'en' || lang === 'he';
}
