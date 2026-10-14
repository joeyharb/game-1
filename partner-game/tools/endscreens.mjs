// Check the end screens: final report, completion card, print view, CSV (developer tool).
// node endscreens.mjs [--size phone|laptop] [--state all|partial]
import { chromium, devices } from './node_modules/playwright/index.mjs';
import { mkdirSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const size = arg('size', 'laptop'), stateArg = arg('state', 'all'), tag = `end-${size}-${stateArg}`;
const shots = join(here, '../../production/qa/evidence/last-mile-heroes/full'); mkdirSync(shots, { recursive: true });
const ctxOpts = size === 'phone'
  ? { viewport: { width: 375, height: 812 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, userAgent: devices['Pixel 5'].userAgent, acceptDownloads: true }
  : { viewport: { width: 1366, height: 800 }, deviceScaleFactor: 1, acceptDownloads: true };
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await (await browser.newContext(ctxOpts)).newPage();
const errors = [];
page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
const file = 'file://' + join(here, '../index.html');
await page.goto(file); await page.evaluate(() => { try { localStorage.clear(); } catch (e) {} }); await page.goto(file); await page.waitForTimeout(800);
await page.evaluate((all) => {
  const s = window.LMH.store(), C = window.CONTENT;
  s.player = { name: 'Achol "AJ" Deng, Jr.', org: '=Test Org, South', state: 'Upper Nile' }; s.track = 'WASH';
  C.missions.forEach((M, i) => {
    if (!all && i >= 4) return;
    const stars = [3, 2, 3, 1, 3, 2, 3][i];
    s.missions[M.id] = { completed: true, best: { score: 1000 + i * 100, stars, accuracy: 0.9, track: 'WASH', date: '2026-10-1' + i + 'T10:00:00Z' },
      last: { mistakes: i % 2 ? [{ id: 'x', ref: 'SOP §4.7' }, { id: 'y', ref: 'AG Art. 3' }] : [], finishedAt: '2026-10-1' + i + 'T10:00:00Z' } };
  });
  s.badges = ['site-boss', 'hot-streak'];
}, stateArg === 'all');
await page.evaluate(() => window.LMH.screens.final()); await page.waitForTimeout(1200);
await page.screenshot({ path: join(shots, `${tag}-01-final.png`), fullPage: false });
const cardEnabled = await page.evaluate(() => !document.querySelector('#f-card').disabled);
console.log('card button enabled:', cardEnabled);
const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 5000 }), page.click('#f-csv')]);
const p = join(shots, `${tag}.csv`); await dl.saveAs(p);
console.log('csv file:', dl.suggestedFilename()); console.log(readFileSync(p, 'utf8'));
if (cardEnabled) {
  await page.click('#f-card'); await page.waitForTimeout(500);
  await page.screenshot({ path: join(shots, `${tag}-02-card.png`) });
  await page.evaluate(() => { window.print = () => {}; }); await page.click('#c-print');
  await page.emulateMedia({ media: 'print' }); await page.waitForTimeout(300);
  await page.screenshot({ path: join(shots, `${tag}-03-print.png`) });
  await page.pdf({ path: join(shots, `${tag}-card.pdf`), format: 'A4', landscape: true, printBackground: true }).catch((e) => console.log('pdf skipped:', e.message));
  await page.emulateMedia({ media: 'screen' });
  await page.keyboard.press('Escape'); await page.waitForTimeout(300);
  console.log('card closed by Escape:', !(await page.$('#modal-root .overlay')));
}
console.log('errors:', errors.length ? errors : 'none');
await browser.close();
process.exit(errors.length ? 1 : 0);
