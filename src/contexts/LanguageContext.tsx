// Copyright (c) 2025 Wings8 Technology.
// Distributed under the license specified in the root directory of this project.

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import {
  localeFor,
  lookupTranslation,
  setI18nLang,
  Lang,
  TranslationParams,
} from '@/i18n/translations';

interface LanguageContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string, params?: TranslationParams) => string;
  locale: string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANG_STORAGE_KEY = 'wings8os_lang';

// Initial language: persist the user's choice; Wings8 defaults to English
// regardless of the browser/system locale.
function detectInitialLang(): Lang {
  try {
    const saved = localStorage.getItem(LANG_STORAGE_KEY);
    if (saved === 'en' || saved === 'fr') {
      return saved;
    }
  } catch {
    /* storage unavailable */
  }
  return 'en';
}

export function LanguageProvider({ children }: { readonly children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(detectInitialLang);

  useEffect(() => {
    document.documentElement.lang = lang;
    setI18nLang(lang);
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem(LANG_STORAGE_KEY, l);
    } catch {
      /* stockage indisponible */
    }
  }, []);

  const t = useCallback(
    (key: string, params?: TranslationParams) => {
      const value = lookupTranslation(lang, key) ?? lookupTranslation('en', key) ?? key;
      if (!params) {
        return value;
      }
      return value.replace(/\{(\w+)\}/g, (match, param: string) =>
        Object.prototype.hasOwnProperty.call(params, param) ? String(params[param]) : match
      );
    },
    [lang]
  );

  const value = useMemo(() => ({ lang, setLang, t, locale: localeFor(lang) }), [lang, t, setLang]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

// Le provider et le hook cohabitent volontairement dans ce fichier.
// eslint-disable-next-line react-refresh/only-export-components
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
