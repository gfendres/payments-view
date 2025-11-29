import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';

import { Providers } from '@/providers';

import './globals.css';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Gnosis Card Portfolio Dashboard',
  description: 'Track your Gnosis Pay card transactions, spending, and cashback rewards',
};

/**
 * Script to prevent flash of wrong theme
 * Runs before React hydration to set the correct theme class
 */
const themeScript = `
  (function() {
    const stored = localStorage.getItem('theme');
    const theme = stored === 'light' ? 'light' :
      stored === 'dark' ? 'dark' :
      stored === 'system' ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') :
      'dark';
    document.documentElement.classList.add(theme);
  })();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={`${outfit.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  );
}

