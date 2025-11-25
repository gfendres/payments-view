import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${outfit.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

