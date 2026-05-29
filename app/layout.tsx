import type { Metadata, Viewport } from 'next';
import { Bebas_Neue, JetBrains_Mono, Space_Grotesk } from 'next/font/google';
import { SITE } from '@/lib/site/config';
import { SiteHeader } from '@/components/layout/Header';
import { SiteFooter } from '@/components/layout/Footer';
import { KakaoInit } from '@/components/layout/KakaoInit';
import './globals.css';

const bebas = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-display-en',
});

const mono = JetBrains_Mono({
  weight: ['400', '500'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
});

const body = Space_Grotesk({
  weight: ['400', '500', '600'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-body',
});

const TITLE = `${SITE.nameKo} · ${SITE.nameShort}`;

// 검색엔진 소유권 인증 — 값이 주입된 경우에만 메타 태그를 출력(빈 값이면 미출력).
// 토큰은 구글 서치콘솔 / 네이버 서치어드바이저 등록 시 발급받아 env로 주입한다(#16 SEO-3).
const naverVerification = process.env.NAVER_SITE_VERIFICATION;
const googleVerification = process.env.GOOGLE_SITE_VERIFICATION;
const verification: Metadata['verification'] | undefined =
  naverVerification || googleVerification
    ? {
        ...(googleVerification ? { google: googleVerification } : {}),
        ...(naverVerification
          ? { other: { 'naver-site-verification': naverVerification } }
          : {}),
      }
    : undefined;

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: TITLE,
    template: `%s · ${SITE.nameKo}`,
  },
  description: SITE.disclaimerLong,
  applicationName: SITE.nameKo,
  keywords: ['선거', '후보자', '공개자료', '정치적 중립', '비교'],
  alternates: {
    // metadataBase 기준 상대경로 — 페이지별 canonical은 각 라우트에서 덮어쓴다(#16 SEO-4).
    canonical: './',
  },
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: SITE.url,
    siteName: SITE.nameKo,
    title: TITLE,
    description: SITE.disclaimerShort,
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: SITE.disclaimerShort,
  },
  // #16 SEO-1: 공개 경로 색인 허용. 비공개 경로(/correction·/preview)는 각 라우트에서 noindex.
  robots: {
    index: true,
    follow: true,
  },
  ...(verification ? { verification } : {}),
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#050505',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="ko"
      suppressHydrationWarning
      className={`${bebas.variable} ${mono.variable} ${body.variable}`}
    >
      <body className="flex min-h-screen flex-col bg-bg text-ink antialiased">
        {process.env.NEXT_PUBLIC_KAKAO_JS_KEY ? (
          <KakaoInit jsKey={process.env.NEXT_PUBLIC_KAKAO_JS_KEY} />
        ) : null}
        <SiteHeader />
        <div className="flex-1">{children}</div>
        <SiteFooter />
      </body>
    </html>
  );
}
