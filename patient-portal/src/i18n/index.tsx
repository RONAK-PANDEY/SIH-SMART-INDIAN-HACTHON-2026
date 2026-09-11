import React, { createContext, useContext, useState } from 'react';

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
    book_opd: 'Book OPD',
    track_queue: 'Track Live Queue',
    view_live_queue: 'View live queue',
    dashboard: 'Dashboard',
    my_token: 'My QR Token',
    show_qr_pass: 'Show QR pass',
    health_records: 'Prescriptions & Billing',
    records: 'Records',
    ambulance: '108 Ambulance',
    emergency_108: 'Emergency 108',
    profile: 'Profile',
    login: 'Login / Register',
    dept_recommender: 'Direct Department Recommender',
    select_problem: 'Select your health problem to directly match department',
    emergency_call: 'Emergency Ambulance: 108',
    quick_actions: 'Quick actions',
    need_help: 'Need help?',
    contact_hospital: 'Contact hospital',
    home: 'Home',
    queue: 'Queue',
    portals: 'Portals',
    switch_portal: 'Switch Portal',
    select_portal_platform: 'Select Portal Platform',
    patient_portal: 'Patient Portal',
    doctor_admin_panel: 'Doctor Admin Panel',
    government_sentinel_portal: 'Government Sentinel Portal',
    opd_status: 'Here’s your OPD status',
    slot: 'SLOT',
    next_slot: 'Next Slot',
    cancel_slot: 'Cancel This Slot',
    cancel_appointment: 'Cancel Appointment',
    estimated_turn: 'Estimated turn',
    patients_ahead: 'patients ahead',
    ai_triage: 'AI Triage',
    prescriptions: 'Prescriptions',
    select_language: 'Select Language',
    select_portal_language: 'Select Portal Language',
  },
  hi: {
    hero_title: 'स्मार्ट ओपीडी कतार एवं त्वरित आपातकालीन ट्राइएज',
    hero_subtitle: 'अस्पतालों में लंबी कतारों से बचें। एआई ट्राइएज और सरकारी ई-केवाईसी के साथ रीयल-टाइम टोकन प्राप्त करें।',
    check_symptoms: 'लक्षण जांचें और ट्राइएज करें',
    book_token: 'ओपीडी टोकन बुक करें',
    book_opd: 'ओपीडी बुक करें',
    track_queue: 'लाइव कतार देखें',
    view_live_queue: 'लाइव कतार देखें',
    dashboard: 'डैशबोर्ड',
    my_token: 'मेरा क्यूआर पास',
    show_qr_pass: 'क्यूआर पास दिखाएं',
    health_records: 'पर्चे एवं बिलिंग',
    records: 'रिकॉर्ड',
    ambulance: '108 एम्बुलेंस',
    emergency_108: 'आपातकालीन 108',
    profile: 'प्रोफ़ाइल',
    login: 'लॉग इन / पंजीकरण',
    dept_recommender: 'प्रत्यक्ष विभाग अनुशंसाकर्ता',
    select_problem: 'विभाग से मिलान करने के लिए अपनी स्वास्थ्य समस्या चुनें',
    emergency_call: 'आपातकालीन एम्बुलेंस: 108',
    quick_actions: 'त्वरित कार्य',
    need_help: 'सहायता चाहिए?',
    contact_hospital: 'अस्पताल संपर्क',
    home: 'होम',
    queue: 'कतार',
    portals: 'पोर्टल',
    switch_portal: 'पोर्टल बदलें',
    select_portal_platform: 'पोर्टल प्लेटफ़ॉर्म चुनें',
    patient_portal: 'मरीज़ पोर्टल',
    doctor_admin_panel: 'डॉक्टर एडमिन पैनल',
    government_sentinel_portal: 'सरकारी सेंटिनल पोर्टल',
    opd_status: 'यहाँ आपका ओपीडी स्टेटस है',
    slot: 'स्लॉट',
    next_slot: 'अगला स्लॉट',
    cancel_slot: 'यह स्लॉट रद्द करें',
    cancel_appointment: 'अपॉइंटमेंट रद्द करें',
    estimated_turn: 'अनुमानित समय',
    patients_ahead: 'मरीज़ आगे हैं',
    ai_triage: 'एआई ट्राइएज',
    prescriptions: 'दवाएं एवं पर्चे',
    select_language: 'भाषा चुनें',
    select_portal_language: 'पोर्टल की भाषा चुनें',
  },
  pb: {
    hero_title: 'ਸਮਾਰਟ ਓਪੀਡੀ ਕਤਾਰ ਅਤੇ ਤੁਰੰਤ ਐਮਰਜੈਂਸੀ ਟ੍ਰਾਈਏਜ',
    hero_subtitle: 'ਹਸਪਤਾਲਾਂ ਵਿੱਚ ਲੰਬੀਆਂ ਲਾਈਨਾਂ ਤੋਂ ਬਚੋ। ਏਆਈ ਟ੍ਰਾਈਏਜ ਨਾਲ ਰੀਅਲ-ਟਾਈਮ ਟੋਕਨ ਪ੍ਰਾਪਤ ਕਰੋ।',
    check_symptoms: 'ਲੱਛਣਾਂ ਦੀ ਜਾਂਚ ਕਰੋ',
    book_token: 'ਓਪੀਡੀ ਟੋਕਨ ਬੁੱਕ ਕਰੋ',
    book_opd: 'ਓਪੀਡੀ ਬੁੱਕ ਕਰੋ',
    track_queue: 'ਲਾਈਵ ਕਤਾਰ ਟਰੈਕ ਕਰੋ',
    view_live_queue: 'ਲਾਈਵ ਕਤਾਰ ਦੇਖੋ',
    dashboard: 'ਡੈਸ਼ਬੋਰਡ',
    my_token: 'ਮੇਰਾ ਕਿਊਆਰ ਟੋਕਨ',
    show_qr_pass: 'ਕਿਊਆਰ ਪਾਸ ਦਿਖਾਓ',
    health_records: 'ਪਰਚੀਆਂ ਅਤੇ ਬਿਲਿੰਗ',
    records: 'ਰਿਕਾਰਡ',
    ambulance: '108 ਐਂਬੂਲੈਂਸ',
    emergency_108: 'ਐਮਰਜੈਂਸੀ 108',
    profile: 'ਪ੍ਰੋਫਾਈਲ',
    login: 'ਲਾਗਇਨ / ਰਜਿਸਟਰ',
    dept_recommender: 'ਸਿੱਧਾ ਵਿਭਾਗ ਸਿਫਾਰਸ਼ਕਰਤਾ',
    select_problem: 'ਸਿਹਤ ਸਮੱਸਿਆ ਚੁਣੋ',
    emergency_call: 'ਐਮਰਜੈਂਸੀ ਐਂਬੂਲੈਂਸ: 108',
    quick_actions: 'ਤੁਰੰਤ ਕਾਰਵਾਈਆਂ',
    need_help: 'ਮਦਦ ਚਾਹੀਦੀ ਹੈ?',
    contact_hospital: 'ਹਸਪਤਾਲ ਨਾਲ ਸੰਪਰਕ ਕਰੋ',
    home: 'ਹੋਮ',
    queue: 'ਕਤਾਰ',
    portals: 'ਪੋਰਟਲ',
    switch_portal: 'ਪੋਰਟਲ ਬਦਲੋ',
    select_portal_platform: 'ਪੋਰਟਲ ਪਲੇਟਫਾਰਮ ਚੁਣੋ',
    patient_portal: 'ਮਰੀਜ਼ ਪੋਰਟਲ',
    doctor_admin_panel: 'ਡਾਕਟਰ ਐਡਮਿਨ ਪੈਨਲ',
    government_sentinel_portal: 'ਸਰਕਾਰੀ ਸੈਂਟੀਨਲ ਪੋਰਟਲ',
    opd_status: 'ਇੱਥੇ ਤੁਹਾਡੀ OPD ਸਥਿਤੀ ਹੈ',
    slot: 'ਸਲਾਟ',
    next_slot: 'ਅਗਲਾ ਸਲਾਟ',
    cancel_slot: 'ਇਹ ਸਲਾਟ ਰੱਦ ਕਰੋ',
    cancel_appointment: 'ਮੁਲਾਕਾਤ ਰੱਦ ਕਰੋ',
    estimated_turn: 'ਅਨੁਮਾਨਿਤ ਸਮਾਂ',
    patients_ahead: 'ਮਰੀਜ਼ ਅੱਗੇ ਹਨ',
    ai_triage: 'ਏਆਈ ਟ੍ਰਾਈਏਜ',
    prescriptions: 'ਦਵਾਈਆਂ ਅਤੇ ਪਰਚੀਆਂ',
    select_language: 'ਭਾਸ਼ਾ ਚੁਣੋ',
    select_portal_language: 'ਪੋਰਟਲ ਭਾਸ਼ਾ ਚੁਣੋ',
  },
  bn: {
    hero_title: 'স্মার্ট ওপিডি সারি এবং দ্রুত জরুরি ট্রায়াজ',
    hero_subtitle: 'হাসপাতালে দীর্ঘ লাইন এড়িয়ে চলুন। এআই ট্রায়াজের মাধ্যমে রিয়েল-টাইম টোকেন পান।',
    check_symptoms: 'লক্ষণ পরীক্ষা ও ট্রায়াজ',
    book_token: 'ওপিডি টোকেন বুক করুন',
    book_opd: 'ওপিডি বুক করুন',
    track_queue: 'লাইভ সারি দেখুন',
    view_live_queue: 'লাইভ সারি দেখুন',
    dashboard: 'ড্যাশবোর্ড',
    my_token: 'আমার কিউআর টোকেন',
    show_qr_pass: 'কিউআর পাস দেখান',
    health_records: 'প্রেসক্রিপশন ও বিলিং',
    records: 'রেকর্ড',
    ambulance: '১০৮ অ্যাম্বুলেন্স',
    emergency_108: 'জরুরি ১০৮',
    profile: 'প্রোফাইল',
    login: 'লগইন / নিবন্ধন',
    dept_recommender: 'বিভাগ সুপারিশকারী',
    select_problem: 'বিভাগ মেলানোর জন্য আপনার স্বাস্থ্য সমস্যা নির্বাচন করুন',
    emergency_call: 'জরুরি অ্যাম্বুলেন্স: ১০৮',
    quick_actions: 'দ্রুত কাজ',
    need_help: 'সাহায্য দরকার?',
    contact_hospital: 'হাসপাতালে যোগাযোগ',
    home: 'হোম',
    queue: 'সারি',
    portals: 'পোর্টাল',
    switch_portal: 'পোর্টাল পরিবর্তন',
    select_portal_platform: 'পোর্টাল প্ল্যাটফর্ম নির্বাচন',
    patient_portal: 'রোগীর পোর্টাল',
    doctor_admin_panel: 'ডাক্তার অ্যাডমিন প্যানেল',
    government_sentinel_portal: 'সরকারি সেন্টিনেল পোর্টাল',
    opd_status: 'এখানে আপনার ওপিডি স্ট্যাটাস',
    slot: 'স্লট',
    next_slot: 'পরবর্তী স্লট',
    cancel_slot: 'এই স্লট বাতিল করুন',
    cancel_appointment: 'অ্যাপয়েন্টমেন্ট বাতিল করুন',
    estimated_turn: 'আনুমানিক সময়',
    patients_ahead: 'জন রোগী এগিয়ে',
    ai_triage: 'এআই ট্রায়াজ',
    prescriptions: 'প্রেসক্রিপশন',
    select_language: 'ভাষা নির্বাচন করুন',
    select_portal_language: 'পোর্টালের ভাষা নির্বাচন',
  },
  ta: {
    hero_title: 'ஸ்மார்ட் ஓபிடி வரிசை & அவசர சிகிச்சை முன்னுரிமை',
    hero_subtitle: 'மருத்துவமனைகளில் நீண்ட வரிசைகளைத் தவிர்க்கவும்.',
    check_symptoms: 'அறிகுறிகளைச் சரிபார்க்கவும்',
    book_token: 'டோக்கன் முன்பதிவு',
    book_opd: 'ஓபிடி முன்பதிவு',
    track_queue: 'நேரலை வரிசை',
    view_live_queue: 'நேரலை வரிசை காண்க',
    dashboard: 'டாஷ்போர்டு',
    my_token: 'எனது QR டோக்கன்',
    show_qr_pass: 'QR பாஸ் காட்டு',
    health_records: 'மருந்துச் சீட்டு & கட்டணம்',
    records: 'பதிவுகள்',
    ambulance: '108 ஆம்புலன்ஸ்',
    emergency_108: 'அவசரம் 108',
    profile: 'சுயவிவரம்',
    login: 'உள்நுழைவு',
    dept_recommender: 'துறை பரிந்துரையாளர்',
    select_problem: 'உங்கள் சுகாதாரப் பிரச்சனையைத் தேர்ந்தெடுக்கவும்',
    emergency_call: 'அவசர ஆம்புலன்ஸ்: 108',
    quick_actions: 'விரைவு እርमங்கள்',
    need_help: 'உதவி தேவையா?',
    contact_hospital: 'மருத்துவமனை தொடர்பு',
    home: 'முகப்பு',
    queue: 'வரிசை',
    portals: 'தளங்கள்',
    switch_portal: 'தளம் மாற்று',
    select_portal_platform: 'தளத்தைத் தேர்ந்தெடுக்கவும்',
    patient_portal: 'நோயாளி தளம்',
    doctor_admin_panel: 'மருத்துவர் நிர்வாகம்',
    government_sentinel_portal: 'அரசு சென்டினல் தளம்',
    opd_status: 'உங்கள் OPD நிலை',
    slot: 'ஸ்லாட்',
    next_slot: 'அடுத்த ஸ்லாட்',
    cancel_slot: 'இந்த ஸ்லாட்டை ரத்து செய்',
    cancel_appointment: 'முன்பதிவை ரத்து செய்',
    estimated_turn: 'எதிர்பார்க்கப்படும் நேரம்',
    patients_ahead: 'நோயாளிகள் முன்னால்',
    ai_triage: 'AI முன்னுரிமை',
    prescriptions: 'மருந்துச்சீட்டுகள்',
    select_language: 'மொழியைத் தேர்ந்தெடு',
    select_portal_language: 'தள மொழியைத் தேர்ந்தெடு',
  },
  te: {
    hero_title: 'స్మార్ట్ ఒపిడి క్యూ & తక్షణ ఎమర్జెన్సీ ట్రియాజ్',
    hero_subtitle: 'ఆసుపత్రులలో పొడవైన క్యూలను నివారించండి.',
    check_symptoms: 'లక్షణాలను తనిఖీ చేయండి',
    book_token: 'ఓపిడి టోకెన్ బుక్ చేయండి',
    book_opd: 'ఓపిడి బుక్ చేయండి',
    track_queue: 'లైవ్ క్యూ ట్రాక్ చేయండి',
    view_live_queue: 'లైవ్ క్యూ చూడండి',
    dashboard: 'డాష్‌బోర్డ్',
    my_token: 'నా QR టోకెన్',
    show_qr_pass: 'QR పాస్ చూపించు',
    health_records: 'ప్రిస్క్రిప్షన్లు & బిల్లింగ్',
    records: 'రికార్డులు',
    ambulance: '108 అంబులెన్స్',
    emergency_108: 'ఎమర్జెన్సీ 108',
    profile: 'ప్రొఫైల్',
    login: 'లాగిన్ / రిజిస్టర్',
    dept_recommender: 'ప్రత్యక్ష విభాగాన్ని ఎంచుకోండి',
    select_problem: 'మీ ఆరోగ్య సమస్యను ఎంచుకోండి',
    emergency_call: 'అత్యవసర అంబులెన్స్: 108',
    quick_actions: 'త్వరిత చర్యలు',
    need_help: 'సహాయం కావాలా?',
    contact_hospital: 'ఆసుపత్రి సంప్రదించండి',
    home: 'హోమ్',
    queue: 'క్యూ',
    portals: 'పోర్టల్స్',
    switch_portal: 'పోర్టల్ మార్చండి',
    select_portal_platform: 'పోర్టల్ ఎంచుకోండి',
    patient_portal: 'పేషెంట్ పోర్టల్',
    doctor_admin_panel: 'డాక్టర్ అడ్మిన్ ప్యానెల్',
    government_sentinel_portal: 'ప్రభుత్వ సెంటినెల్ పోర్టల్',
    opd_status: 'మీ ఓపిడి స్థితి ఇక్కడ ఉంది',
    slot: 'స్లాట్',
    next_slot: 'తదుపరి స్లాట్',
    cancel_slot: 'ఈ స్లాట్ రద్దు చేయండి',
    cancel_appointment: 'అపాయింట్‌మెంట్ రద్దు చేయండి',
    estimated_turn: 'అంచనా సమయం',
    patients_ahead: 'రోగులు ముందు ఉన్నారు',
    ai_triage: 'AI ట్రియాజ్',
    prescriptions: 'ప్రిస్క్రిప్షన్లు',
    select_language: 'భాషను ఎంచుకోండి',
    select_portal_language: 'పోర్టల్ భాషను ఎంచుకోండి',
  },
  mr: {
    hero_title: 'स्मार्ट ओपीडी रांग आणि त्वरित आपत्कालीन ट्रायज',
    hero_subtitle: 'रुग्णालयातील लांब रांगा टाळा.',
    check_symptoms: 'लक्षणे तपासा',
    book_token: 'ओपीडी टोकन बुक करा',
    book_opd: 'ओपीडी बुक करा',
    track_queue: 'थेट रांग पहा',
    view_live_queue: 'थेट रांग पहा',
    dashboard: 'डॅशबोर्ड',
    my_token: 'माझे क्यूआर टोकन',
    show_qr_pass: 'क्यूआर पास दाखवा',
    health_records: 'प्रिस्क्रिप्शन आणि बिलिंग',
    records: 'रेकॉर्ड',
    ambulance: '108 रुग्णवाहिका',
    emergency_108: 'आपत्कालीन 108',
    profile: 'प्रोफाइल',
    login: 'लॉगिन / नोंदणी',
    dept_recommender: 'थेट विभाग शिफारस',
    select_problem: 'तुमची आरोग्य समस्या निवडा',
    emergency_call: 'आपत्कालीन रुग्णवाहिका: 108',
    quick_actions: 'जलद कृती',
    need_help: 'मदत हवी आहे?',
    contact_hospital: 'रुग्णालय संपर्क',
    home: 'होम',
    queue: 'रांग',
    portals: 'पोर्टल',
    switch_portal: 'पोर्टल बदला',
    select_portal_platform: 'पोर्टल प्लॅटफॉर्म निवडा',
    patient_portal: 'रुग्ण पोर्टल',
    doctor_admin_panel: 'डॉक्टर ॲडमिन पॅनेल',
    government_sentinel_portal: 'सरकारी सेंटिनेल पोर्टल',
    opd_status: 'येथे तुमची ओपीडी स्थिती आहे',
    slot: 'स्लॉट',
    next_slot: 'पुढील स्लॉट',
    cancel_slot: 'हा स्लॉट रद्द करा',
    cancel_appointment: 'अपॉइंटमेंट रद्द करा',
    estimated_turn: 'अंदाजित वेळ',
    patients_ahead: 'रुग्ण पुढे आहेत',
    ai_triage: 'एआय ट्रायज',
    prescriptions: 'औषधपत्रे',
    select_language: 'भाषा निवडा',
    select_portal_language: 'पोर्टलची भाषा निवडा',
  },
  gu: {
    hero_title: 'સ્માર્ટ ઓપીડી કતાર અને ત્વરિત ઇમરજન્સી ટ્રાયેજ',
    hero_subtitle: 'હોસ્પિટલોમાં લાંબી લાઇનો ટાળો.',
    check_symptoms: 'લક્ષણો તપાસો',
    book_token: 'ઓપીડી ટોકન બુક કરો',
    book_opd: 'ઓપીડી બુક કરો',
    track_queue: 'લાઇવ કતાર ટ્રેક કરો',
    view_live_queue: 'લાઇવ કતાર જુઓ',
    dashboard: 'ડેશબોર્ડ',
    my_token: 'મારું ક્યૂઆર ટોકન',
    show_qr_pass: 'ક્યૂઆર પાસ બતાવો',
    health_records: 'દવાઓ અને બિલિંગ',
    records: 'રેકોર્ડ',
    ambulance: '108 એમ્બ્યુલન્સ',
    emergency_108: 'ઇમરજન્સી 108',
    profile: 'પ્રોફાઇલ',
    login: 'લૉગિન / રજીસ્ટર',
    dept_recommender: 'ડિપાર્ટમેન્ટ ભલામણકર્તા',
    select_problem: 'તમારી સ્વાસ્થ્ય સમસ્યા પસંદ કરો',
    emergency_call: 'ઇમરજન્સી એમ્બ્યુલન્સ: 108',
    quick_actions: 'ઝડપી કાર્યો',
    need_help: 'મદદ જોઈએ છે?',
    contact_hospital: 'હોસ્પિટલ સંપર્ક',
    home: 'હોમ',
    queue: 'કતાર',
    portals: 'પોર્ટલ',
    switch_portal: 'પોર્ટલ બદલો',
    select_portal_platform: 'પોર્ટલ પ્લેટફોર્મ પસંદ કરો',
    patient_portal: 'દર્દી પોર્ટલ',
    doctor_admin_panel: 'ડૉક્ટર એડમિન પેનલ',
    government_sentinel_portal: 'સરકારી સેન્ટિનલ પોર્ટલ',
    opd_status: 'અહીં તમારી ઓપીડી સ્થિતિ છે',
    slot: 'સ્લોટ',
    next_slot: 'આગલો સ્લોટ',
    cancel_slot: 'આ સ્લોટ રદ કરો',
    cancel_appointment: 'અપોઇન્ટમેન્ટ રદ કરો',
    estimated_turn: 'અંદાજિત સમય',
    patients_ahead: 'દર્દીઓ આગળ છે',
    ai_triage: 'એઆઈ ટ્રાયેજ',
    prescriptions: 'દવાઓ અને પ્રિસ્ક્રિપ્શન',
    select_language: 'ભાષા પસંદ કરો',
    select_portal_language: 'પોર્ટલ ભાષા પસંદ કરો',
  },
  kn: {
    hero_title: 'ಸ್ಮಾರ್ಟ್ ಒಪಿಡಿ ಸರತಿ ಸಾಲು & ತುರ್ತು ಟ್ರಯಾಜ್',
    hero_subtitle: 'ಆಸ್ಪತ್ರೆಗಳಲ್ಲಿ ದೀರ್ಘ ಸರತಿ ಸಾಲುಗಳನ್ನು ತಪ್ಪಿಸಿ.',
    check_symptoms: 'ರೋಗಲಕ್ಷಣಗಳನ್ನು ಪರಿಶೀಲಿಸಿ',
    book_token: 'ಒಪಿಡಿ ಟೋಕನ್ ಕಾಯ್ದಿರಿಸಿ',
    book_opd: 'ಒಪಿಡಿ ಕಾಯ್ದಿರಿಸಿ',
    track_queue: 'ಲೈವ್ ಸರತಿ ಸಾಲು',
    view_live_queue: 'ಲೈವ್ ಸರತಿ ಸಾಲು ವೀಕ್ಷಿಸಿ',
    dashboard: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
    my_token: 'ನನ್ನ QR ಟೋಕನ್',
    show_qr_pass: 'QR ಪಾಸ್ ತೋರಿಸಿ',
    health_records: 'ಪ್ರಿಸ್ಕ್ರಿಪ್ಷನ್‌ಗಳು ಮತ್ತು ಬಿಲ್ಲಿಂಗ್',
    records: 'ದಾಖಲೆಗಳು',
    ambulance: '108 ಆಂಬ್ಯುಲೆನ್ಸ್',
    emergency_108: 'ತುರ್ತು 108',
    profile: 'ಪ್ರೊಫೈಲ್',
    login: 'ಲಾಗಿನ್ / ನೋಂದಣಿ',
    dept_recommender: 'ವಿಭಾಗ ಶಿಫಾರಸುಗಾರ',
    select_problem: 'ನಿಮ್ಮ ಆರೋಗ್ಯ ಸಮಸ್ಯೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ',
    emergency_call: 'ತುರ್ತು ಆಂಬ್ಯುಲೆನ್ಸ್: 108',
    quick_actions: 'ತ್ವರಿತ ಕ್ರಿಯೆಗಳು',
    need_help: 'ಸಹಾಯ ಬೇಕೇ?',
    contact_hospital: 'ಆಸ್ಪತ್ರೆ ಸಂಪರ್ಕಿಸಿ',
    home: 'ಹೋಮ್',
    queue: 'ಸರತಿ ಸಾಲು',
    portals: 'ಪೋರ್ಟಲ್‌ಗಳು',
    switch_portal: 'ಪೋರ್ಟಲ್ બદಲಿಸಿ',
    select_portal_platform: 'ಪೋರ್ಟಲ್ ಆಯ್ಕೆಮಾಡಿ',
    patient_portal: 'ರೋಗಿ ಪೋರ್ಟಲ್',
    doctor_admin_panel: 'ವೈದ್ಯರ ನಿರ್ವಹಣೆ',
    government_sentinel_portal: 'ಸರ್ಕಾರಿ ಸೆಂಟಿನೆಲ್ ಪೋರ್ಟಲ್',
    opd_status: 'ಇಲ್ಲಿ ನಿಮ್ಮ ಒಪಿಡಿ ಸ್ಥಿತಿ ಇದೆ',
    slot: 'ಸ್ಲಾಟ್',
    next_slot: 'ಮುಂದಿನ ಸ್ಲಾಟ್',
    cancel_slot: 'ಈ ಸ್ಲಾಟ್ ರದ್ದುಗೊಳಿಸಿ',
    cancel_appointment: 'ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್ ರದ್ದುಗೊಳಿಸಿ',
    estimated_turn: 'ಅಂದಾಜು ಸಮಯ',
    patients_ahead: 'ರೋಗಿಗಳು ಮುಂದಿದ್ದಾರೆ',
    ai_triage: 'AI ಟ್ರಯಾಜ್',
    prescriptions: 'ಪ್ರಿಸ್ಕ್ರಿಪ್ಷನ್‌ಗಳು',
    select_language: 'ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ',
    select_portal_language: 'ಪೋರ್ಟಲ್ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ',
  },
  ml: {
    hero_title: 'സ്മാർട്ട് ഒപിഡി ക്യൂ & തത്സമയ എമർജൻസി ട്രയേജ്',
    hero_subtitle: 'ആശുപത്രികളിലെ നീണ്ട ക്യൂ ഒഴിവാക്കുക.',
    check_symptoms: 'ലക്ഷണങ്ങൾ പരിശോധിക്കുക',
    book_token: 'ഒപിഡി ടോക്കൺ ബുക്ക് ചെയ്യുക',
    book_opd: 'ഒപിഡി ബുക്ക് ചെയ്യുക',
    track_queue: 'തത്സമയ ക്യൂ ട്രാക്ക് ചെയ്യുക',
    view_live_queue: 'തത്സമയ ക്യൂ കാണുക',
    dashboard: 'ഡാഷ്‌ബോർഡ്',
    my_token: 'എന്റെ QR ടോക്കൺ',
    show_qr_pass: 'QR പാസ് കാണിക്കുക',
    health_records: 'കുറിപ്പടികളും ബില്ലിംഗും',
    records: 'റെക്കോർഡുകൾ',
    ambulance: '108 ആംബുലൻസ്',
    emergency_108: 'അടിയന്തര 108',
    profile: 'പ്രൊഫൈൽ',
    login: 'ലോഗിൻ / രജിസ്റ്റർ',
    dept_recommender: 'വിഭാഗം ശുപാർശകൻ',
    select_problem: 'നിങ്ങളുടെ ആരോഗ്യ പ്രശ്നം തിരഞ്ഞെടുക്കുക',
    emergency_call: 'അടിയന്തര ആംബുലൻസ്: 108',
    quick_actions: 'ത്വരിത നടപടികൾ',
    need_help: 'സഹായം വേണോ?',
    contact_hospital: 'ആശുപത്രി ബന്ധപ്പെടുക',
    home: 'ഹോം',
    queue: 'ക്യൂ',
    portals: 'പോർട്ടലുകൾ',
    switch_portal: 'പോർട്ടൽ മാറ്റുക',
    select_portal_platform: 'പോർട്ടൽ തിരഞ്ഞെടുക്കുക',
    patient_portal: 'രോഗി പോർട്ടൽ',
    doctor_admin_panel: 'ഡോക്ടർ അഡ്മിൻ പാനൽ',
    government_sentinel_portal: 'ഗവൺമെന്റ് സെന്റിനൽ പോർട്ടൽ',
    opd_status: 'ഇതാ നിങ്ങളുടെ ഒപിഡി വിവരങ്ങൾ',
    slot: 'സ്ലോട്ട്',
    next_slot: 'അടുത്ത സ്ലോട്ട്',
    cancel_slot: 'ഈ സ്ലോട്ട് റദ്ദാക്കുക',
    cancel_appointment: 'അപ്പോയിന്റ്മെന്റ് റദ്ദാക്കുക',
    estimated_turn: 'പ്രതീക്ഷിത സമയം',
    patients_ahead: 'രോഗികൾ മുന്നിലുണ്ട്',
    ai_triage: 'AI ട്രയേജ്',
    prescriptions: 'കുറിപ്പടികൾ',
    select_language: 'ഭാഷ തിരഞ്ഞെടുക്കുക',
    select_portal_language: 'പോർട്ടൽ ഭാഷ തിരഞ്ഞെടുക്കുക',
  },
  or: {
    hero_title: 'ସ୍କାର୍ଟ ଓପିଡି ଧାଡ଼ି ଏବଂ ଜରୁରୀକାଳୀନ ଟ୍ରାଇଜ୍',
    hero_subtitle: 'ଡାକ୍ତରଖାନାରେ ଲମ୍ବା ଧାଡ଼ି ଏଡ଼ାନ୍ତୁ।',
    check_symptoms: 'ଲକ୍ଷଣ ଯାଞ୍ଚ କରନ୍ତୁ',
    book_token: 'ଓପିଡି ଟୋକନ୍ ବୁକ୍ କରନ୍ତୁ',
    book_opd: 'ଓପିଡି ବୁକ୍ କରନ୍ତୁ',
    track_queue: 'ଲାଇଭ୍ ଧାଡ଼ି ଦେଖନ୍ତୁ',
    view_live_queue: 'ଲାଇଭ୍ ଧାଡ଼ି ଦେଖନ୍ତୁ',
    dashboard: 'ଡ୍ୟାସବୋର୍ଡ',
    my_token: 'ମୋର କ୍ୟୁଆର ଟୋକନ୍',
    show_qr_pass: 'କ୍ୟୁଆର ପାସ୍ ଦେଖାନ୍ତୁ',
    health_records: 'ପ୍ରେସକ୍ରିପସନ୍ ଏବଂ ବିଲିଂ',
    records: 'ରେକର୍ଡ',
    ambulance: '୧୦୮ ଆମ୍ବୁଲାନ୍ସ',
    emergency_108: 'ଜରୁରୀକାଳୀନ ୧୦୮',
    profile: 'ପ୍ରୋଫାଇଲ୍',
    login: 'ଲଗଇନ୍ / ପଞ୍ଜିକରଣ',
    dept_recommender: 'ବିଭାଗ ସୁପାରିଶକାରୀ',
    select_problem: 'ଆପଣଙ୍କ ସ୍ୱାସ୍ଥ୍ୟ ସମସ୍ୟା ଚୟନ କରନ୍ତୁ',
    emergency_call: 'ଜରୁରୀକାଳୀନ ଆମ୍ବୁଲାନ୍ସ: ୧୦୮',
    quick_actions: 'ଦ୍ରୁତ କାର୍ଯ୍ୟ',
    need_help: 'ସାହାଯ୍ୟ ଦରକାର?',
    contact_hospital: 'ଡାକ୍ତରଖାନା ଯୋଗାଯୋଗ',
    home: 'ହୋମ୍',
    queue: 'ଧାଡ଼ି',
    portals: 'ପୋର୍ଟାଲ୍',
    switch_portal: 'ପୋର୍ଟାଲ୍ ବଦଳାନ୍ତୁ',
    select_portal_platform: 'ପୋର୍ଟାଲ୍ ଚୟନ କରନ୍ତୁ',
    patient_portal: 'ରୋଗୀ ପୋର୍ଟାଲ୍',
    doctor_admin_panel: 'ଡାକ୍ତର ଆଡମିନ୍ ପ୍ୟାନେଲ୍',
    government_sentinel_portal: 'ସରକାରୀ ସେଣ୍ଟିନେଲ୍ ପୋର୍ଟାଲ୍',
    opd_status: 'ଏଠାରେ ଆପଣଙ୍କ ଓପିଡି ସ୍ଥିତି',
    slot: 'ସ୍ଲଟ୍',
    next_slot: 'ପରବର୍ତ୍ତୀ ସ୍ଲଟ୍',
    cancel_slot: 'ଏହି ସ୍ଲଟ୍ ବାତିଲ୍ କରନ୍ତୁ',
    cancel_appointment: 'ଆପଏଣ୍ଟମେଣ୍ଟ ବାତିଲ୍ କରନ୍ତୁ',
    estimated_turn: 'ଆନୁମାନିକ ସମୟ',
    patients_ahead: 'ଜଣ ରୋଗୀ ଆଗରେ ଅଛନ୍ତି',
    ai_triage: 'ଏଆଇ ଟ୍ରାଇଜ୍',
    prescriptions: 'ପ୍ରେସକ୍ରିପସନ୍',
    select_language: 'ଭାଷା ଚୟନ କରନ୍ତୁ',
    select_portal_language: 'ପୋର୍ଟାଲ୍ ଭାଷା ଚୟନ କରନ୍ତୁ',
  }
};

interface I18nContextType {
  lang: SupportedLanguage;
  setLang: (lang: string) => void;
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
    if (saved === 'pa') return 'pb';
    return (saved as SupportedLanguage) || 'en';
  });

  const setLang = (newLang: string) => {
    let normalized = (newLang || '').toLowerCase().trim();
    if (normalized === 'pa') normalized = 'pb';
    const found = SUPPORTED_LANGUAGES.find(l => l.code === normalized || l.name.toLowerCase() === normalized);
    const targetCode = (found ? found.code : 'en') as SupportedLanguage;
    setLangState(targetCode);
    localStorage.setItem('smartcare_lang', targetCode);
  };

  const t = (key: string): string => {
    if (!key) return '';
    const langObj = translations[lang] || translations.en;
    if (langObj[key]) return langObj[key];
    
    // Normalize key to snake_case if passed raw phrase
    const snakeKey = key.toLowerCase().trim().replace(/[^a-z0-9]+/g, '_');
    if (langObj[snakeKey]) return langObj[snakeKey];
    if (translations.en[snakeKey]) return translations.en[snakeKey];
    if (translations.en[key]) return translations.en[key];

    return key;
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
        className="flex items-center gap-1.5 bg-white/90 dark:bg-slate-800/90 hover:bg-white text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-full text-xs font-bold shadow-xs transition cursor-pointer"
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
            className="absolute right-4 top-14 w-60 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-2 z-50 max-h-80 overflow-y-auto"
          >
            <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
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
                  className={`w-full px-3 py-2 rounded-xl text-left text-xs transition flex items-center justify-between cursor-pointer ${
                    lang === l.code
                      ? 'bg-blue-600 text-white font-bold'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
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
