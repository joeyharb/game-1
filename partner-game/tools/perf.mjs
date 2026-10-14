// Performance sample for any mission on a throttled phone profile (developer tool).
// node perf.mjs --mission M5 [--throttle 6] [--gfx low] [--seconds 10]
// Reports real fps, main-thread ms per frame (the useful figure: SwiftShader renders on the
// CPU, so its fps is pessimistic), draw calls and triangles.
import { chromium, devices } from './node_modules/playwright/index.mjs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const here = dirname(fileURLToPath(import.meta.url));
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const mission = arg('mission', 'M5'), throttle = Number(arg('throttle', '6')), gfx = arg('gfx', 'low'), secs = Number(arg('seconds', '10'));
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const ctx = await browser.newContext({ viewport: { width: 375, height: 812 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, userAgent: devices['Pixel 5'].userAgent });
const page = await ctx.newPage(); const cdp = await ctx.newCDPSession(page);
const errors = []; page.on('pageerror', (e) => errors.push(e.message));
const file = 'file://' + join(here, '../index.html');
await page.goto(file); await page.evaluate(() => localStorage.clear()); await page.goto(file); await page.waitForTimeout(800);
await page.evaluate(([g]) => { const s = window.LMH.store(); s.player = { name: 'P', org: 'O', state: 'Lakes' }; s.track = 'SNFI'; window.LMH.gfx.setQuality(g); }, [gfx]);
await page.evaluate((m) => window.LMH.start(m), mission); await page.waitForTimeout(1500);
// get past a first event or start button so the busy part runs
for (let k = 0; k < 3; k++) {
  if (await page.$('#m7-go')) await page.click('#m7-go');
  const opt = await page.$('#ev-opts .opt'); if (opt) { await page.evaluate(() => { const E = window.LMH.run().debug.cur; const b = Array.from(document.querySelectorAll('#ev-opts .opt')).find((x) => E.options[Number(x.dataset.i)].correct); if (b) b.click(); }); }
  await page.waitForTimeout(1500);
}
await cdp.send('Emulation.setCPUThrottlingRate', { rate: throttle });
await page.waitForTimeout(2000);
const perf = [];
for (let i = 0; i < secs * 2; i++) { perf.push(await page.evaluate(() => window.LMH.stats())); await page.waitForTimeout(500); }
await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
const mean = (k) => perf.reduce((a, b) => a + (b[k] || 0), 0) / perf.length, s0 = perf[perf.length - 1];
console.log(`${mission} phone ${gfx} x${throttle}: fps avg ${mean('fps').toFixed(1)} | main-thread ms/frame avg ${mean('cpuMs').toFixed(1)} max ${Math.max(...perf.map((x) => x.cpuMs || 0)).toFixed(1)} | draw calls ${s0.calls} | triangles ${s0.triangles}`);
console.log('errors:', errors.length ? errors : 'none');
await browser.close();
