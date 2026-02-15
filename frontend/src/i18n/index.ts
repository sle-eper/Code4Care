import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import en, { type TranslationKey } from './en';
import fr from './fr';
import ar from './ar';

export type Lang = 'en' | 'fr' | 'ar';

const translations: Record<Lang, Record<TranslationKey, string>> = { en, fr, ar };

interface I18nContextValue {
  lang: Lang;
  dir: 'ltr' | 'rtl';
  setLang: (l: Lang) => void;
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

const STORAGE_KEY = 'c4c_lang';

function getInitialLang(): Lang {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'en' || saved === 'fr' || saved === 'ar') return saved;
  } catch { /* ignore */ }
  return 'en';
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(getInitialLang);
  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try { localStorage.setItem(STORAGE_KEY, l); } catch { /* ignore */ }
  }, []);

  // Apply dir attribute to <html> whenever language changes
  useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.lang = lang;
  }, [lang, dir]);

  const t = useCallback(
    (key: TranslationKey, vars?: Record<string, string | number>): string => {
      let str = translations[lang]?.[key] ?? translations.en[key] ?? key;
      if (vars) {
        Object.entries(vars).forEach(([k, v]) => {
          str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
        });
      }
      return str;
    },
    [lang],
  );

  const value = React.useMemo(() => ({ lang, dir, setLang, t }), [lang, dir, setLang, t]);

  return React.createElement(I18nContext.Provider, { value }, children);
}

export function useT() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useT must be used within <LanguageProvider>');
  return ctx;
}

export type { TranslationKey };
