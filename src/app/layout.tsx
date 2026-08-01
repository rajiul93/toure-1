import NextTopLoader from 'nextjs-toploader';
import type { Metadata } from 'next';
import SiteStructuredData from '@/components/site-structured-data';
import { createRootSiteMetadata } from '@/lib/metadata';
import { loadPublicConfigWithFallback } from '@/lib/public-config';
import { getSiteSeoFromDB } from '@/lib/services/site-seo.service';
import { Manrope, Pinyon_Script } from 'next/font/google';
import { Toaster } from 'sonner';
import './globals.css';

const manrope = Manrope({
  variable: '--font-manrope',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
});

const pinyonScript = Pinyon_Script({
  variable: '--font-pinyon-script',
  subsets: ['latin'],
  weight: '400',
});

export async function generateMetadata(): Promise<Metadata> {
  return createRootSiteMetadata();
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [, seoResult] = await Promise.all([
    loadPublicConfigWithFallback(),
    getSiteSeoFromDB().catch(() => null),
  ]);

  const language = seoResult?.global.language ?? 'en';

  return (
    <html
      lang={language}
      className={`${manrope.variable} ${pinyonScript.variable} h-full antialiased`}
    >
      <head>
        <link rel="preconnect" href="https://widgets.bokun.io" />
        <link rel="dns-prefetch" href="https://widgets.bokun.io" />
        <link
          rel="alternate"
          type="text/plain"
          href="/llms.txt"
          title="LLM site summary"
        />
        <SiteStructuredData />
      </head>
      <body className={`${manrope.className} min-h-full flex flex-col`}>
        <NextTopLoader
          color="#ff3737"
          initialPosition={0.08}
          crawlSpeed={200}
          height={2}
          showSpinner={false}
          zIndex={99999}
          shadow="0 0 10px #ff3737,0 0 5px #ff3737"
        />
        <Toaster />
        {children}
      </body>
    </html>
  );
}
