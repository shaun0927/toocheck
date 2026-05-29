import { SITE } from '@/lib/site/config';
import type { Candidate, CandidateDisclosure, District } from '@/types/domain';

// #16 SEO-6: schema.org JSON-LD. 순수 문자열 직렬화 — 네이티브 의존성 없음(#70 §3 위반 X).
// 빈 필드는 모두 생략(빈칸 원칙). XSS 방지를 위해 '<'를 이스케이프.

type JsonObject = Record<string, unknown>;

export function JsonLd({ data }: { data: JsonObject | JsonObject[] }) {
  const json = JSON.stringify(data).replace(/</g, '\\u003c');
  // 서버 렌더 정적 문자열 → hydration 영향 없음.
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}

/** 후보 = Person. 구글 리치결과 비공식이나 AI·타 엔진이 인물로 이해. */
export function candidatePersonLd(
  c: Candidate,
  district: District | null,
  disclosure: CandidateDisclosure | null
): JsonObject {
  const isEdu = c.officeKind === 'education_superintendent';
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: c.name,
    url: `${SITE.url}/candidates/${c.id}`,
    ...(c.nameHanja ? { alternateName: c.nameHanja } : {}),
    ...(disclosure?.photoUrl ? { image: disclosure.photoUrl } : {}),
    ...(c.occupation ? { jobTitle: c.occupation } : {}),
    ...(district?.positionTitle
      ? { description: `${district.name} ${district.positionTitle} 후보 (기호 ${c.ballotNumber})` }
      : {}),
    ...(!isEdu && c.party
      ? { memberOf: { '@type': 'Organization', name: c.party } }
      : {}),
  };
}

/** 지역 후보 목록 = ItemList. */
export function candidateListLd(district: District, candidates: Candidate[]): JsonObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${district.name} 후보`,
    numberOfItems: candidates.length,
    itemListElement: candidates.map((c, i) => ({
      '@type': 'ListItem',
      position: c.ballotNumber ?? i + 1,
      name: c.name,
      url: `${SITE.url}/candidates/${c.id}`,
    })),
  };
}

/** 빵부스러기 네비게이션 = BreadcrumbList. items: [{name, path}] (path는 절대경로 prefix 제외). */
export function breadcrumbLd(items: { name: string; path: string }[]): JsonObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: `${SITE.url}${it.path}`,
    })),
  };
}

/** 홈 = WebSite. (실제 GET 검색 엔드포인트가 없어 SearchAction은 생략 — 정확성 우선.) */
export function websiteLd(): JsonObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE.nameKo,
    alternateName: SITE.nameEn,
    url: SITE.url,
    inLanguage: 'ko-KR',
  };
}

/** 운영 주체 = Organization. */
export function organizationLd(): JsonObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE.team,
    alternateName: SITE.nameEn,
    url: SITE.url,
    email: SITE.contactEmail,
    description: SITE.disclaimerShort,
  };
}

/** 서비스 원칙/FAQ = FAQPage. */
export function faqLd(qa: { q: string; a: string }[]): JsonObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: qa.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  };
}
