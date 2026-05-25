import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './translations/en.json';
import fr from './translations/fr.json';
import ar from './translations/ar.json';

i18n
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v3',
    resources: {
      en: { translation: en },
      fr: { translation: fr },
      ar: { translation: ar },
    },
    lng: 'en', // Langue par défaut
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React gère déjà la protection XSS
    },
  });

export default i18n;
