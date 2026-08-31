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
  title: 'Soul Tribe — Friendship-First Social Platform',
  description: 'Six people. One good Saturday. Soul Tribe holds the history of your adult friendships.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${jakarta.variable} ${inter.variable}`}>
      <body className="bg-[#E5D7C7] text-[#3D2E24] antialiased selection:bg-[#C85A32]/20 selection:text-[#C85A32]">
        <main className="min-h-screen pb-20">{children}</main>
        <Nav />
      </body>
    </html>
  );
}
