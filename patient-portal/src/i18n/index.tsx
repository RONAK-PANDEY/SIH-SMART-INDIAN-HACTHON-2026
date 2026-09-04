import React, { createContext, useContext, useState } from 'react';

export type SupportedLanguage = 'en' | 'hi' | 'pb';

const translations = {
  en: {
    hero_title: 'Smart OPD Queue & Instant Emergency Triage',
    hero_subtitle: 'Skip long waiting lines at hospitals. Get real-time queue tokens with AI triage.',
    check_symptoms: 'Check Symptoms & Triage',
    book_token: 'Book OPD Token',
    track_queue: 'Track Live Queue',
  },
  hi: {
    hero_title: 'स्मार्ट ओपीडी कतार एवं त्वरित आपातकालीन ट्राइएज',
    hero_subtitle: 'अस्पतालों में लंबी कतारों से बचें। एआई ट्राइएज के साथ रीयल-टाइम टोकन प्राप्त करें।',
    check_symptoms: 'लक्षण जांचें और ट्राइएज करें',
    book_token: 'ओपीडी टोकन बुक करें',
    track_queue: 'लाइव कतार देखें',
  },
  pb: {
    hero_title: 'ਸਮਾਰਟ ਓਪੀਡੀ ਕਤਾਰ ਅਤੇ ਤੁਰੰਤ ਐਮਰਜੈਂਸੀ ਟ੍ਰਾਈਏਜ',
    hero_subtitle: 'ਹਸਪਤਾਲਾਂ ਵਿੱਚ ਲੰਬੀਆਂ ਲਾਈਨਾਂ ਤੋਂ ਬਚੋ। ਏਆਈ ਟ੍ਰਾਈਏਜ ਨਾਲ ਰੀਅਲ-ਟਾਈਮ ਟੋਕਨ ਪ੍ਰਾਪਤ ਕਰੋ।',
    check_symptoms: 'ਲੱਛਣਾਂ ਦੀ ਜਾਂਚ ਕਰੋ',
    book_token: 'ਓਪੀਡੀ ਟੋਕਨ ਬੁੱਕ ਕਰੋ',
    track_queue: 'ਲਾਈਵ ਕਤਾਰ ਟਰੈਕ ਕਰੋ',
  },
};

interface I18nContextType {
  lang: SupportedLanguage;
  setLang: (lang: SupportedLanguage) => void;
  t: (key: keyof typeof translations.en) => string;
}

const I18nContext = createContext<I18nContextType>({
  lang: 'en',
  setLang: () => {},
  t: (key) => translations.en[key] || key,
});

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<SupportedLanguage>('en');

  const t = (key: keyof typeof translations.en) => {
    return translations[lang]?.[key] || translations.en[key] || key;
  };

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useTranslation = () => useContext(I18nContext);
