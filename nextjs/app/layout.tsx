import type { Metadata } from "next";
import { DM_Sans, Geist_Mono, Noto_Sans_Arabic } from "next/font/google";
import "./globals.css";

import I18nProvider from "./components/I18nProvider";


const dmSans = DM_Sans({
    variable: "--font-dm-sans",
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
});


const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});


const notoArabic = Noto_Sans_Arabic({
    variable: "--font-noto-arabic",
    subsets: ["arabic"],
    weight: ["400", "500", "600", "700"],
});


export const metadata: Metadata = {
    title: { default: "Dashboard", template: "%s | Upwork App" },
    description: "API metrics dashboard",
};


/**
 * Root layout — applies fonts globally and injects theme hydration script
 * to prevent flash of unstyled content on page load.
 */
export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html suppressHydrationWarning>
            <head>
                {/* Inline script to restore saved theme + language direction before first paint */}
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
                            (function() {
                                try {
                                    var theme = localStorage.getItem('theme');
                                    if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                                        document.documentElement.setAttribute('data-theme', 'dark');
                                    }
                                    var lang = localStorage.getItem('lang') || 'en';
                                    document.documentElement.setAttribute('lang', lang);
                                    document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
                                    document.documentElement.setAttribute('data-hydrated', '');
                                } catch(e) {}
                            })();
                        `,
                    }}
                />
            </head>
            <body
                className={`${dmSans.variable} ${geistMono.variable} ${notoArabic.variable} font-sans antialiased`}
            >
                <I18nProvider>{children}</I18nProvider>
            </body>
        </html>
    );
}
