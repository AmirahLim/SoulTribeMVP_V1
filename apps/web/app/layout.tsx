import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Nav } from '../components/Nav';

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
    <html lang="en" className={`${inter.variable}`}>
      <body className="bg-black text-[#F3F0E9] antialiased selection:bg-white/20 selection:text-white">
        <AuthProvider>
          <main className="min-h-screen pb-20">{children}</main>
          <Nav />
        </AuthProvider>
      </body>
    </html>
  );
}
