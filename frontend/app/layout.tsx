import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import localFont from 'next/font/local';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['300', '400', '500', '600'],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  weight: ['400', '500'],
});

// Since we don't have local font files for Geist readily available, we will use a fallback or fetch it from a CDN if needed.
// For now, mapping Geist variable to standard system fonts, or we could just use Inter as fallback.
// Actually, to make it perfectly match the HTML which used Google Fonts API for Geist (Geist is now on Google Fonts!):
const geist = localFont({
  src: [
    {
      path: './fonts/Geist-Regular.woff2', // We'll assume these might fail but we'll provide a fallback in CSS
      weight: '400',
      style: 'normal',
    },
    {
      path: './fonts/Geist-SemiBold.woff2',
      weight: '600',
      style: 'normal',
    },
    {
      path: './fonts/Geist-Bold.woff2',
      weight: '700',
      style: 'normal',
    }
  ],
  variable: '--font-geist',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'ProductOps AI | OS v1.0',
  description: 'AI-powered product operations pipeline',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable} ${geist.variable} dark`} suppressHydrationWarning>
      <head>
        {/* Fallback to Google Fonts for Geist just in case local files are missing */}
        <link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;600;700;800&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL,GRAD,opsz@300,0..1,0,24&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-background text-on-background font-inter antialiased overflow-hidden relative">
        {children}
      </body>
    </html>
  );
}
