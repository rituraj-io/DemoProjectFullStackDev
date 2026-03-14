'use client';

import { useEffect, useLayoutEffect } from 'react';
import { I18nextProvider } from 'react-i18next';

import i18n from '@/app/i18n/config';


/** RTL languages that require dir="rtl" on the document root */
const RTL_LANGUAGES = new Set(['ar']);


/**
 * Syncs the document's `dir` and `lang` attributes to match the
 * current i18next language. Runs on mount and on every language change.
 */
function applyDocumentDirection(lang: string) {
    const dir = RTL_LANGUAGES.has(lang) ? 'rtl' : 'ltr';
    document.documentElement.setAttribute('dir', dir);
    document.documentElement.setAttribute('lang', lang);
}


/**
 * Re-applies the saved theme from localStorage onto <html>.
 * The inline script in layout.tsx sets it before first paint, but
 * Next.js hydration can strip it when reconciling the <html> element.
 * useLayoutEffect runs synchronously before the browser repaints,
 * so the user never sees a flash.
 */
function restoreTheme() {
    try {
        const theme = localStorage.getItem('theme');

        if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.documentElement.setAttribute('data-theme', 'dark');
        }
    } catch { /* localStorage unavailable */ }
}


/**
 * Client-side i18n wrapper — initializes translations and keeps
 * the HTML dir/lang attributes in sync with the active language.
 * Also restores the saved theme after hydration.
 */
export default function I18nProvider({ children }: { children: React.ReactNode }) {
    /* Restore theme synchronously before the browser repaints */
    useLayoutEffect(() => {
        restoreTheme();
    }, []);


    useEffect(() => {
        applyDocumentDirection(i18n.language);

        const handleChange = (lang: string) => applyDocumentDirection(lang);
        i18n.on('languageChanged', handleChange);

        return () => {
            i18n.off('languageChanged', handleChange);
        };
    }, []);

    return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
