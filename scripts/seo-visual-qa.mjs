import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';

const BASE = 'http://localhost:3000';
const OUT = '/tmp/seo-qa';
mkdirSync(OUT, { recursive: true });

const PAGES = [
  { name: 'home', url: '/' },
  { name: 'districts', url: '/districts', expandDetails: true },
  { name: 'principles', url: '/principles', expandDetails: true },
  { name: 'candidate-normal', url: '/candidates/100157144' }, // 정원오
  { name: 'candidate-edu', url: '/candidates/100153800' },    // 김영배(교육감)
  { name: 'district', url: '/districts/dist_3_3110000' },
  { name: 'compare', url: '/districts/dist_3_3110000/compare' },
];

const VIEWPORTS = [
  { tag: 'desktop', width: 1280, height: 900 },
  { tag: 'mobile', width: 390, height: 844 },
];

const browser = await chromium.launch();
const results = [];

for (const vp of VIEWPORTS) {
  const ctx = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: 2,
  });
  for (const p of PAGES) {
    const page = await ctx.newPage();
    const consoleErrors = [];
    const pageErrors = [];
    page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()); });
    page.on('pageerror', (e) => pageErrors.push(String(e)));

    const resp = await page.goto(BASE + p.url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(400);
    if (p.expandDetails) {
      // 첫 details 펼쳐 확장 상태 확인
      await page.evaluate(() => {
        const d = document.querySelector('details');
        if (d) d.open = true;
      });
      await page.waitForTimeout(200);
    }

    // 가로 오버플로우(모바일 깨짐 신호)
    const overflow = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
      overflowPx: document.documentElement.scrollWidth - window.innerWidth,
    }));
    // 본문 텍스트 길이(빈 페이지/크래시 신호)
    const bodyLen = await page.evaluate(() => document.body.innerText.replace(/\s+/g, ' ').trim().length);
    // 에러 화면 문구 탐지
    const errMarker = await page.evaluate(() => {
      const t = document.body.innerText;
      return /Application error|Internal Server Error|This page could not be found|client-side exception/i.test(t);
    });

    const shot = `${OUT}/${vp.tag}-${p.name}.png`;
    await page.screenshot({ path: shot, fullPage: vp.tag === 'desktop' });

    results.push({
      vp: vp.tag, name: p.name, url: p.url,
      status: resp?.status() ?? 0,
      overflowPx: overflow.overflowPx,
      bodyLen, errMarker,
      consoleErrors: consoleErrors.length,
      pageErrors: pageErrors.length,
      consoleErrorSample: consoleErrors.slice(0, 3),
      pageErrorSample: pageErrors.slice(0, 3),
    });
    await page.close();
  }
  await ctx.close();
}

await browser.close();

console.log(JSON.stringify(results, null, 2));
// 요약
const bad = results.filter(r =>
  r.status !== 200 || r.errMarker || r.pageErrors > 0 || r.overflowPx > 2 || r.bodyLen < 200
);
console.log('\n=== 문제 의심 항목 ===');
console.log(bad.length ? JSON.stringify(bad.map(b => ({ vp: b.vp, name: b.name, status: b.status, overflowPx: b.overflowPx, errMarker: b.errMarker, pageErrors: b.pageErrors, bodyLen: b.bodyLen })), null, 2) : '없음 ✓');
