import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en.json';
import ar from './locales/ar.json';
import es from './locales/es.json';


/**
 * Initializes i18next with language detector and all locale bundles.
 * Detector reads/writes to localStorage under the "lang" key,
 * falling back to English when no preference is saved.
 */
i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources: {
            en: { translation: en },
            ar: { translation: ar },
            es: { translation: es },
        },
        fallbackLng: 'en',
        interpolation: { escapeValue: false },
        detection: {
            order: ['localStorage'],
            lookupLocalStorage: 'lang',
            caches: ['localStorage'],
        },
    });


export default i18n;
