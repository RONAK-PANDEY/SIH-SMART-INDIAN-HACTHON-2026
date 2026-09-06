import React, { createContext, useContext, useState, useEffect } from 'react';

export type SupportedLanguage = 
  | 'en' // English
  | 'hi' // Hindi
  | 'pb' // Punjabi
  | 'bn' // Bengali
  | 'ta' // Tamil
  | 'te' // Telugu
  | 'mr' // Marathi
  | 'gu' // Gujarati
  | 'kn' // Kannada
  | 'ml' // Malayalam
  | 'or'; // Odia

export interface LanguageInfo {
  code: SupportedLanguage;
  name: string;
  native: string;
}

export const SUPPORTED_LANGUAGES: LanguageInfo[] = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
  { code: 'pb', name: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు' },
  { code: 'mr', name: 'Marathi', native: 'मराठी' },
  { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી' },
  { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'ml', name: 'Malayalam', native: 'മലയാളം' },
  { code: 'or', name: 'Odia', native: 'ଓଡ଼ିଆ' },
];

const translations: Record<SupportedLanguage, Record<string, string>> = {
  en: {
    hero_title: 'Smart OPD Queue & Instant Emergency Triage',
    hero_subtitle: 'Skip long waiting lines at hospitals. Get real-time queue tokens with AI triage & government e-KYC.',
    check_symptoms: 'Check Symptoms & Triage',
    book_token: 'Book OPD Token',
    track_queue: 'Track Live Queue',
    dashboard: 'Dashboard',
    my_token: 'My QR Token',
    health_records: 'Prescriptions & Billing',
    ambulance: '108 Ambulance',
    profile: 'Profile',
    login: 'Login / Register',
    dept_recommender: 'Direct Department Recommender',
    select_problem: 'Select your health problem to directly match department',
    emergency_call: 'Emergency Ambulance: 108',
  },
  hi: {
    hero_title: 'स्मार्ट ओपीडी कतार एवं त्वरित आपातकालीन ट्राइएज',
    hero_subtitle: 'अस्पतालों में लंबी कतारों से बचें। एआई ट्राइएज और सरकारी ई-केवाईसी के साथ रीयल-टाइम टोकन प्राप्त करें।',
    check_symptoms: 'लक्षण जांचें और ट्राइएज करें',
    book_token: 'ओपीडी टोकन बुक करें',
    track_queue: 'लाइव कतार देखें',
    dashboard: 'डैशबोर्ड',
    my_token: 'मेरा क्यूआर पास',
    health_records: 'पर्चे एवं बिलिंग',
    ambulance: '108 एम्बुलेंस',
    profile: 'प्रोफ़ाइल',
    login: 'लॉग इन / पंजीकरण',
    dept_recommender: 'प्रत्यक्ष विभाग अनुशंसाकर्ता',
    select_problem: 'विभाग से मिलान करने के लिए अपनी स्वास्थ्य समस्या चुनें',
    emergency_call: 'आपातकालीन एम्बुलेंस: 108',
  },
  pb: {
    hero_title: 'ਸਮਾਰਟ ਓਪੀਡੀ ਕਤਾਰ ਅਤੇ ਤੁਰੰਤ ਐਮਰਜੈਂਸੀ ਟ੍ਰਾਈਏਜ',
    hero_subtitle: 'ਹਸਪਤਾਲਾਂ ਵਿੱਚ ਲੰਬੀਆਂ ਲਾਈਨਾਂ ਤੋਂ ਬਚੋ। ਏਆਈ ਟ੍ਰਾਈਏਜ ਨਾਲ ਰੀਅਲ-ਟਾਈਮ ਟੋਕਨ ਪ੍ਰਾਪਤ ਕਰੋ।',
    check_symptoms: 'ਲੱਛਣਾਂ ਦੀ ਜਾਂਚ ਕਰੋ',
    book_token: 'ਓਪੀਡੀ ਟੋਕਨ ਬੁੱਕ ਕਰੋ',
    track_queue: 'ਲਾਈਵ ਕਤਾਰ ਟਰੈਕ ਕਰੋ',
    dashboard: 'ਡੈਸ਼ਬੋਰਡ',
    my_token: 'ਮੇਰਾ ਕਿਊਆਰ ਟੋਕਨ',
    health_records: 'ਪਰਚੀਆਂ ਅਤੇ ਬਿਲਿੰਗ',
    ambulance: '108 ਐਂਬੂਲੈਂਸ',
    profile: 'ਪ੍ਰੋਫਾਈਲ',
    login: 'ਲਾਗਇਨ / ਰਜਿਸਟਰ',
    dept_recommender: 'ਸਿੱਧਾ ਵਿਭਾਗ ਸਿਫਾਰਸ਼ਕਰਤਾ',
    select_problem: 'ਸਿਹਤ ਸਮੱਸਿਆ ਚੁਣੋ',
    emergency_call: 'ਐਮਰਜੈਂਸੀ ਐਂਬੂਲੈਂਸ: 108',
  },
  bn: {
    hero_title: 'স্মার্ট ওপিডি সারি এবং দ্রুত জরুরি ট্রায়াজ',
    hero_subtitle: 'হাসপাতালে দীর্ঘ লাইন এড়িয়ে চলুন। এআই ট্রায়াজের মাধ্যমে রিয়েল-টাইম টোকেন পান।',
    check_symptoms: 'লক্ষণ পরীক্ষা ও ট্রায়াজ',
    book_token: 'ওপিডি টোকেন বুক করুন',
    track_queue: 'লাইভ সারি দেখুন',
    dashboard: 'ড্যাশবোর্ড',
    my_token: 'আমার কিউআর টোকেন',
    health_records: 'প্রেসক্রিপশন ও বিলিং',
    ambulance: '১০৮ অ্যাম্বুলেন্স',
    profile: 'প্রোফাইল',
    login: 'লগইন / নিবন্ধন',
    dept_recommender: 'বিভাগ সুপারিশকারী',
    select_problem: 'বিভাগ মেলানোর জন্য আপনার স্বাস্থ্য সমস্যা নির্বাচন করুন',
    emergency_call: 'জরুরি অ্যাম্বুলেন্স: ১০৮',
  },
  ta: {
    hero_title: 'ஸ்மார்ட் ஓபிடி வரிசை & அவசர சிகிச்சை முன்னுரிமை',
    hero_subtitle: 'மருத்துவமனைகளில் நீண்ட வரிசைகளைத் தவிர்க்கவும். நிகழ்நேர டோக்கன்களைப் பெறுங்கள்.',
    check_symptoms: 'அறிகுறிகளைச் சரிபார்க்கவும்',
    book_token: 'டோக்கன் முன்பதிவு',
    track_queue: 'நேரலை வரிசை',
    dashboard: 'டாஷ்போர்டு',
    my_token: 'எனது QR டோக்கன்',
    health_records: 'மருந்துச் சீட்டு & கட்டணம்',
    ambulance: '108 ஆம்புலன்ஸ்',
    profile: 'சுயவிவரம்',
    login: 'உள்நுழைவு',
    dept_recommender: 'துறை பரிந்துரையாளர்',
    select_problem: 'உங்கள் சுகாதாரப் பிரச்சனையைத் தேர்ந்தெடுக்கவும்',
    emergency_call: 'அவசர ஆம்புலன்ஸ்: 108',
  },
  te: {
    hero_title: 'స్మార్ట్ ఒపిడి క్యూ & తక్షణ ఎమర్జెన్సీ ట్రియాజ్',
    hero_subtitle: 'ఆసుపత్రులలో పొడవైన క్యూలను నివారించండి. నిజ-సమయ క్యూ టోకెన్లను పొందండి.',
    check_symptoms: 'లక్షణాలను తనిఖీ చేయండి',
    book_token: 'ఓపిడి టోకెన్ బుక్ చేయండి',
    track_queue: 'లైవ్ క్యూ ట్రాక్ చేయండి',
    dashboard: 'డాష్‌బోర్డ్',
    my_token: 'నా QR టోకెన్',
    health_records: 'ప్రిస్క్రిప్షన్లు & బిల్లింగ్',
    ambulance: '108 అంబులెన్స్',
    profile: 'ప్రొఫైల్',
    login: 'లాగిన్ / రిజిస్టర్',
    dept_recommender: 'ప్రత్యక్ష విభాగాన్ని ఎంచుకోండి',
    select_problem: 'మీ ఆరోగ్య సమస్యను ఎంచుకోండి',
    emergency_call: 'అత్యవసర అంబులెన్స్: 108',
  },
  mr: {
    hero_title: 'स्मार्ट ओपीडी रांग आणि त्वरित आपत्कालीन ट्रायज',
    hero_subtitle: 'रुग्णालयातील लांब रांगा टाळा. एआय ट्रायजसह रिअल-टाइम टोकन मिळवा.',
    check_symptoms: 'लक्षणे तपासा',
    book_token: 'ओपीडी टोकन बुक करा',
    track_queue: 'थेट रांग पहा',
    dashboard: 'डॅशबोर्ड',
    my_token: 'माझे क्यूआर टोकन',
    health_records: 'प्रिस्क्रिप्शन आणि बिलिंग',
    ambulance: '108 रुग्णवाहिका',
    profile: 'प्रोफाइल',
    login: 'लॉगिन / नोंदणी',
    dept_recommender: 'थेट विभाग शिफारस',
    select_problem: 'तुमची आरोग्य समस्या निवडा',
    emergency_call: 'आपत्कालीन रुग्णवाहिका: 108',
  },
  gu: {
    hero_title: 'સ્માર્ટ ઓપીડી કતાર અને ત્વરિત ઇમરજન્સી ટ્રાયેજ',
    hero_subtitle: 'હોસ્પિટલોમાં લાંબી લાઇનો ટાળો. એઆઇ ટ્રાયેજ સાથે રીઅલ-ટાઇમ ટોકન મેળવો.',
    check_symptoms: 'લક્ષણો તપાસો',
    book_token: 'ઓપીડી ટોકન બુક કરો',
    track_queue: 'લાઇવ કતાર ટ્રેક કરો',
    dashboard: 'ડેશબોર્ડ',
    my_token: 'મારું ક્યૂઆર ટોકન',
    health_records: 'દવાઓ અને બિલિંગ',
    ambulance: '108 એમ્બ્યુલન્સ',
    profile: 'પ્રોફાઇલ',
    login: 'લૉગિન / રજીસ્ટર',
    dept_recommender: 'ડિપાર્ટમેન્ટ ભલામણકર્તા',
    select_problem: 'તમારી સ્વાસ્થ્ય સમસ્યા પસંદ કરો',
    emergency_call: 'ઇમરજન્સી એમ્બ્યુલન્સ: 108',
  },
  kn: {
    hero_title: 'ಸ್ಮಾರ್ಟ್ ಒಪಿಡಿ ಸರತಿ ಸಾಲು & ತುರ್ತು ಟ್ರಯಾಜ್',
    hero_subtitle: 'ಆಸ್ಪತ್ರೆಗಳಲ್ಲಿ ದೀರ್ಘ ಸರತಿ ಸಾಲುಗಳನ್ನು ತಪ್ಪಿಸಿ. ನೈಜ-ಸಮಯದ ಟೋಕನ್‌ಗಳನ್ನು ಪಡೆಯಿರಿ.',
    check_symptoms: 'ರೋಗಲಕ್ಷಣಗಳನ್ನು ಪರಿಶೀಲಿಸಿ',
    book_token: 'ಒಪಿಡಿ ಟೋಕನ್ ಕಾಯ್ದಿರಿಸಿ',
    track_queue: 'ಲೈವ್ ಸರತಿ ಸಾಲು',
    dashboard: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
    my_token: 'ನನ್ನ QR ಟೋಕನ್',
    health_records: 'ಪ್ರಿಸ್ಕ್ರಿಪ್ಷನ್‌ಗಳು ಮತ್ತು ಬಿಲ್ಲಿಂಗ್',
    ambulance: '108 ಆಂಬ್ಯುಲೆನ್ಸ್',
    profile: 'ಪ್ರೊಫೈಲ್',
    login: 'ಲಾಗಿನ್ / ನೋಂದಣಿ',
    dept_recommender: 'ವಿಭಾಗ ಶಿಫಾರಸುಗಾರ',
    select_problem: 'ನಿಮ್ಮ ಆರೋಗ್ಯ ಸಮಸ್ಯೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ',
    emergency_call: 'ತುರ್ತು ಆಂಬ್ಯುಲೆನ್ಸ್: 108',
  },
  ml: {
    hero_title: 'സ്മാർട്ട് ഒപിഡി ക്യൂ & തത്സമയ എമർജൻസി ട്രയേജ്',
    hero_subtitle: 'ആശുപത്രികളിലെ നീണ്ട ക്യൂ ഒഴിവാക്കുക. തത്സമയ ടോക്കണുകൾ നേടുക.',
    check_symptoms: 'ലക്ഷണങ്ങൾ പരിശോധിക്കുക',
    book_token: 'ഒപിഡി ടോക്കൺ ബുക്ക് ചെയ്യുക',
    track_queue: 'തത്സമയ ക്യൂ ട്രാക്ക് ചെയ്യുക',
    dashboard: 'ഡാഷ്‌ബോർഡ്',
    my_token: 'എന്റെ QR ടോക്കൺ',
    health_records: 'കുറിപ്പടികളും ബില്ലിംഗും',
    ambulance: '108 ആംബുലൻസ്',
    profile: 'പ്രൊഫൈൽ',
    login: 'ലോഗിൻ / രജിസ്റ്റർ',
    dept_recommender: 'വിഭാഗം ശുപാർശകൻ',
    select_problem: 'നിങ്ങളുടെ ആരോഗ്യ പ്രശ്നം തിരഞ്ഞെടുക്കുക',
    emergency_call: 'അടിയന്തര ആംബുലൻസ്: 108',
  },
  or: {
    hero_title: 'ସ୍ମାର୍ଟ ଓପିଡି ଧାଡ଼ି ଏବଂ ଜରୁରୀକାଳୀନ ଟ୍ରାଇଜ୍',
    hero_subtitle: 'ଡାକ୍ତରଖାନାରେ ଲମ୍ବା ଧାଡ଼ି ଏଡ଼ାନ୍ତୁ। ଏଆଇ ସହିତ ରିଅଲ-ଟାଇମ୍ ଟୋକନ୍ ପାଆନ୍ତୁ।',
    check_symptoms: 'ଲକ୍ଷଣ ଯାଞ୍ଚ କରନ୍ତୁ',
    book_token: 'ଓପିଡି ଟୋକନ୍ ବୁକ୍ କରନ୍ତୁ',
    track_queue: 'ଲାଇଭ୍ ଧାଡ଼ି ଦେଖନ୍ତୁ',
    dashboard: 'ଡ୍ୟାସବୋର୍ଡ',
    my_token: 'ମୋର କ୍ୟୁଆର ଟୋକନ୍',
    health_records: 'ପ୍ରେସକ୍ରିପସନ୍ ଏବଂ ବିଲିଂ',
    ambulance: '୧୦୮ ଆମ୍ବୁଲାନ୍ସ',
    profile: 'ପ୍ରୋଫାଇଲ୍',
    login: 'ଲଗଇନ୍ / ପଞ୍ଜିକରଣ',
    dept_recommender: 'ବିଭାଗ ସୁପାରିଶକାରୀ',
    select_problem: 'ଆପଣଙ୍କ ସ୍ୱାସ୍ଥ୍ୟ ସମସ୍ୟା ଚୟନ କରନ୍ତୁ',
    emergency_call: 'ଜରୁରୀକାଳୀନ ଆମ୍ବୁଲାନ୍ସ: ୧୦୮',
  }
};

interface I18nContextType {
  lang: SupportedLanguage;
  setLang: (lang: SupportedLanguage) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType>({
  lang: 'en',
  setLang: () => {},
  t: (key) => key,
});

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<SupportedLanguage>(() => {
    const saved = localStorage.getItem('smartcare_lang');
    return (saved as SupportedLanguage) || 'en';
  });

  const setLang = (newLang: SupportedLanguage) => {
    setLangState(newLang);
    localStorage.setItem('smartcare_lang', newLang);
  };

  const t = (key: string): string => {
    return translations[lang]?.[key] || translations.en?.[key] || key;
  };

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useTranslation = () => useContext(I18nContext);

export const LanguageSwitcherPill: React.FC = () => {
  const { lang, setLang } = useTranslation();
  const [open, setOpen] = useState(false);

  const current = SUPPORTED_LANGUAGES.find(l => l.code === lang) || SUPPORTED_LANGUAGES[0];

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 bg-white/90 hover:bg-white text-slate-800 border border-slate-200 px-3 py-1.5 rounded-full text-xs font-bold shadow-xs transition"
      >
        <span>🌐</span>
        <span>{current.native} ({current.name})</span>
        <span className="text-[10px] text-slate-400">▼</span>
      </button>

      {open && (
        <div 
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-transparent"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="absolute right-4 top-14 w-60 bg-white rounded-2xl shadow-2xl border border-slate-200 p-2 z-50 max-h-80 overflow-y-auto"
          >
            <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
              Select Language / भाषा चुनें
            </div>
            <div className="space-y-1 mt-1">
              {SUPPORTED_LANGUAGES.map((l) => (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => {
                    setLang(l.code);
                    setOpen(false);
                  }}
                  className={`w-full px-3 py-2 rounded-xl text-left text-xs transition flex items-center justify-between ${
                    lang === l.code
                      ? 'bg-blue-600 text-white font-bold'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="font-bold">{l.native}</span>
                  <span className={`text-[11px] ${lang === l.code ? 'text-blue-100' : 'text-slate-400'}`}>
                    {l.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
