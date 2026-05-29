import type { MetadataRoute } from 'next';
import { SITE } from '@/lib/site/config';
import {
  getDistrictSourceCheckedAt,
  listCandidates,
  listDistricts,
  listElections,
} from '@/mocks/loader';

// #16 SEO-2: 정적 페이지 + 전 선거구·후보를 열거한다.
// loader는 서버 전용 순수 함수(번들 JSON) → 빌드 타임 1회 정적 생성. 네이티브 의존성 없음.
// 규모(~8,800)는 단일 사이트맵 한도(5만 URL/50MB) 이내. 초과 시 generateSitemaps()로 분할.
export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [
    { url: `${SITE.url}/`, changeFrequency: 'daily', priority: 1 },
    { url: `${SITE.url}/districts`, changeFrequency: 'daily', priority: 0.8 },
    { url: `${SITE.url}/principles`, changeFrequency: 'monthly', priority: 0.3 },
  ];

  for (const election of listElections()) {
    for (const district of listDistricts(election.id)) {
      const lastModified = getDistrictSourceCheckedAt(district.id) ?? undefined;
      entries.push({
        url: `${SITE.url}/districts/${district.id}`,
        lastModified,
        changeFrequency: 'daily',
        priority: 0.7,
      });
      entries.push({
        url: `${SITE.url}/districts/${district.id}/compare`,
        lastModified,
        changeFrequency: 'daily',
        priority: 0.6,
      });
      for (const candidate of listCandidates(district.id)) {
        entries.push({
          url: `${SITE.url}/candidates/${candidate.id}`,
          lastModified,
          changeFrequency: 'daily',
          priority: 0.6,
        });
      }
    }
  }

  return entries;
}
