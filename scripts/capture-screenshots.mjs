import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';

const BASE = 'http://localhost:3000';
const OUT = 'docs/screenshots';
mkdirSync(OUT, { recursive: true });

const shots = [
  { name: 'home', url: '/', },
  { name: 'compare', url: '/districts/dist_3_3110000/compare' },
  { name: 'candidate', url: '/candidates/100157144' },
];

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1280, height: 900 },
  deviceScaleFactor: 2,
});

for (const s of shots) {
  await page.goto(BASE + s.url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);
  const path = `${OUT}/${s.name}.png`;
  await page.screenshot({ path });
  console.log('saved', path);
}

await browser.close();
