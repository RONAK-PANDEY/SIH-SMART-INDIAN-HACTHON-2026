import React, { createContext, useContext, useState } from 'react';
export type SupportedLanguage = 'en' | 'hi' | 'pb';
const I18nContext = createContext<{ lang: SupportedLanguage; setLang: (l: SupportedLanguage) => void; t: (k: string) => string }>({ lang: 'en', setLang: () => {}, t: (k) => k });
export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<SupportedLanguage>('en');
  return <I18nContext.Provider value={{ lang, setLang, t: (k) => k }}>{children}</I18nContext.Provider>;
};
export const useTranslation = () => useContext(I18nContext);
