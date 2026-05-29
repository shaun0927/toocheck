import type { MetadataRoute } from 'next';
import { SITE } from '@/lib/site/config';

// #16 SEO-2: 크롤 정책 + 사이트맵 위치 고지. 네이버 Yeti도 sitemap 줄을 읽는다.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/correction', '/preview'],
      },
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  };
}
