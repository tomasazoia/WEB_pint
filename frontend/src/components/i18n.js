import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './en/translation.json';
import pt from './pt/translation.json';
import es from './es/translation.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      pt: { translation: pt },
      es: { translation: es }
    },
    lng: 'pt', // Default language
    fallbackLng: 'en',
    interpolation: { escapeValue: false }
  });

export default i18n;
