import Link from 'next/link';
import {
  HudLabel,
  RegionSearch,
} from '@/components/domain';
import { listDistricts, listElections } from '@/mocks/loader';
import type { District } from '@/types/domain';

export const metadata = {
  title: '지역 선택',
  description:
    '전국 시·도별 2026 지방선거 선거구 전체를 둘러보거나, 시·군·구·주소로 내 지역구 후보를 바로 찾아보세요.',
  alternates: { canonical: '/districts' },
};

export default function DistrictListPage() {
  const elections = listElections();
  const lookups = elections.map((e) => ({ election: e, districts: listDistricts(e.id) }));

  // #16 SEO-5: 시·도(region)별로 전 선거구 링크를 노출 → 크롤러가 링크만으로 전 선거구·후보 도달.
  const allDistricts = lookups.flatMap((l) => l.districts);
  const byRegion = new Map<string, District[]>();
  for (const d of allDistricts) {
    const list = byRegion.get(d.region);
    if (list) list.push(d);
    else byRegion.set(d.region, [d]);
  }
  const regions = [...byRegion.entries()];

  return (
    <main className="mx-auto max-w-3xl space-y-10 px-6 py-12 sm:py-16">
      <header className="space-y-3">
        <HudLabel tone="cyan">전국 시·군·구 검색 지원</HudLabel>
        <h1 className="display-ko text-4xl font-bold text-ink sm:text-5xl">
          내 지역 후보 찾기
        </h1>
        <p className="text-base leading-relaxed text-ink/75">
          시·군·구 이름만 입력하면 시·도지사·교육감·구청장·시·도의원·구의원 후보를 한 번에 보여줍니다.
          후보를 누르면 공개자료·공약이 담긴 상세 페이지로 이동합니다.
        </p>
      </header>

      <RegionSearch />

      <section className="space-y-2">
        <HudLabel tone="dim">등록된 선거 {elections.length}건</HudLabel>
        <ul className="label-ko divide-y divide-hair border border-hair text-ink/80">
          {lookups.map(({ election, districts }) => (
            <li key={election.id} className="flex flex-wrap items-center gap-3 px-3 py-2.5">
              <span className="text-cyan tabular-nums">{election.electionDate.replace(/-/g, '.')}</span>
              <span className="font-medium text-ink">{election.name}</span>
              <span className="ml-auto text-dim">지역 {districts.length}곳</span>
              <span className="text-lime">진행 중</span>
            </li>
          ))}
        </ul>
      </section>

      {/* 전체 지역 둘러보기 — 시·도별 접이식. 주소 검색이 어려운 경우·크롤러용 전체 색인. */}
      <section className="space-y-3">
        <HudLabel tone="cyan">전체 지역 둘러보기 · {allDistricts.length.toLocaleString()}곳</HudLabel>
        <p className="label-ko text-dim">
          시·도를 펼치면 해당 지역의 모든 선거구가 나옵니다. 선거구를 누르면 후보 목록으로 이동합니다.
        </p>
        <ul className="space-y-2">
          {regions.map(([region, list]) => (
            <li key={region} className="hud-panel">
              <details className="group">
                <summary className="flex cursor-pointer items-center justify-between gap-3 px-4 py-3 [&::-webkit-details-marker]:hidden">
                  <span className="font-ko font-semibold text-ink">{region}</span>
                  <span className="label-ko flex items-center gap-2 text-dim">
                    <span className="tabular-nums">{list.length}곳</span>
                    <span aria-hidden className="transition-transform group-open:rotate-180">▾</span>
                  </span>
                </summary>
                <ul className="label-ko grid gap-x-4 gap-y-1.5 border-t border-hair-soft px-4 py-3 text-ink/80 sm:grid-cols-2">
                  {list.map((d) => (
                    <li key={d.id}>
                      <Link
                        href={`/districts/${d.id}`}
                        className="inline-flex items-baseline gap-1.5 hover:text-cyan"
                      >
                        <span aria-hidden className="text-cyan/60">·</span>
                        <span>{d.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </details>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
