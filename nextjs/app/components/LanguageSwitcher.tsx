'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';


/** Available languages with their display codes and native names */
const LANGUAGES = [
    { code: 'en', label: 'EN', name: 'English' },
    { code: 'ar', label: 'AR', name: 'العربية' },
    { code: 'es', label: 'ES', name: 'Español' },
] as const;


/**
 * Compact language switcher dropdown — displays the current language code
 * with a chevron, expanding to show all options on click.
 * Matches ThemeToggle height and uses existing CSS variables for theming.
 */
export default function LanguageSwitcher() {
    const { i18n } = useTranslation();
    const [open, setOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => setMounted(true), []);


    /** Close dropdown on outside click */
    useEffect(() => {
        if (!open) return;

        const handleClick = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };

        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setOpen(false);
        };

        document.addEventListener('mousedown', handleClick);
        document.addEventListener('keydown', handleEscape);

        return () => {
            document.removeEventListener('mousedown', handleClick);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [open]);


    /** Switch language and close dropdown */
    const selectLanguage = (code: string) => {
        i18n.changeLanguage(code);
        setOpen(false);
    };


    /* Hydration-safe placeholder — same pattern as ThemeToggle */
    if (!mounted) {
        return <div className="h-9 w-16 rounded-lg" style={{ background: 'var(--toggle-bg)' }} />;
    }

    const currentLabel = LANGUAGES.find(l => l.code === i18n.language)?.label ?? 'EN';

    return (
        <div ref={containerRef} className="relative">
            {/* Trigger button */}
            <button
                onClick={() => setOpen(prev => !prev)}
                aria-expanded={open}
                aria-haspopup="listbox"
                className="flex h-9 cursor-pointer items-center gap-1 rounded-lg px-2.5 text-sm font-medium transition-colors duration-200"
                style={{
                    background: 'var(--toggle-bg)',
                    color: 'var(--toggle-fg)',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--toggle-hover)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'var(--toggle-bg)')}>
                {currentLabel}
                <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>
                    <polyline points="6 9 12 15 18 9" />
                </svg>
            </button>


            {/* Dropdown menu */}
            {open && (
                <div
                    role="listbox"
                    className="absolute end-0 top-full z-20 mt-1 min-w-[140px] overflow-hidden rounded-lg py-1"
                    style={{
                        background: 'var(--bg-tertiary)',
                        boxShadow: 'var(--shadow-card)',
                    }}>
                    {LANGUAGES.map(lang => {
                        const isActive = i18n.language === lang.code;

                        return (
                            <button
                                key={lang.code}
                                role="option"
                                aria-selected={isActive}
                                onClick={() => selectLanguage(lang.code)}
                                className="flex w-full cursor-pointer items-center gap-2.5 px-3 py-2 text-sm transition-colors duration-150"
                                style={{ color: 'var(--text-primary)' }}
                                onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-hover)')}
                                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>

                                {/* Active indicator dot */}
                                <span
                                    className="h-2 w-2 shrink-0 rounded-full"
                                    style={{
                                        background: isActive ? 'var(--session-btn-start-bg)' : 'transparent',
                                    }}
                                />

                                <span className="font-medium">{lang.name}</span>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
