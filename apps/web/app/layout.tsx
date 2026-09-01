import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Inter } from 'next/font/google';
import './globals.css';
import { Nav } from '../components/Nav';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  display: 'swap',
  preload: false,
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  preload: false,
});

export const metadata: Metadata = {
  title: 'Soul Tribe: Friendship-First Social Platform',
  description: 'Six people. One good Saturday. Soul Tribe holds the history of your adult friendships.',
};

import { AuthProvider } from '../lib/authContext';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${jakarta.variable} ${inter.variable}`}>
      <body className="bg-[#0D1D15] text-[#F3F0E9] antialiased selection:bg-[#016401]/30 selection:text-[#F3F0E9]">
        <AuthProvider>
          <main className="min-h-screen pb-20">{children}</main>
          <Nav />
        </AuthProvider>
      </body>
    </html>
  );
}
