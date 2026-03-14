import type { Metadata } from "next";
import { DM_Sans, Geist_Mono } from "next/font/google";
import "./globals.css";


const dmSans = DM_Sans({
    variable: "--font-dm-sans",
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
});


const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});


export const metadata: Metadata = {
    title: "Dashboard",
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
        <html lang="en" suppressHydrationWarning>
            <head>
                {/* Inline script to restore saved theme before first paint */}
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
                            (function() {
                                try {
                                    var theme = localStorage.getItem('theme');
                                    if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                                        document.documentElement.setAttribute('data-theme', 'dark');
                                    }
                                } catch(e) {}
                            })();
                        `,
                    }}
                />
            </head>
            <body
                className={`${dmSans.variable} ${geistMono.variable} font-sans antialiased`}
            >
                {children}
            </body>
        </html>
    );
}
