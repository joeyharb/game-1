// Automated play-test for Last Mile Heroes (developer tool, not part of the game).
// node playtest.mjs [--size phone|laptop] [--gfx high|low|2d] [--track SNFI|WASH]
//                   [--mode perfect|mistakes|critical] [--throttle 4] [--timescale 2]
//                   [--shots dir] [--tag name] [--perfonly 1]
// Plays Mission 6 through the real buttons, takes screenshots, and reports
// errors and performance (real fps, main-thread ms per frame, draw calls).
import { chromium, devices } from './node_modules/playwright/index.mjs';
import { mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const size = arg('size', 'laptop'), gfx = arg('gfx', 'high'), trk = arg('track', 'SNFI'), mode = arg('mode', 'perfect');
const timescale = arg('timescale', ''), throttle = Number(arg('throttle', '1')), perfOnly = !!arg('perfonly', '');
const tag = arg('tag', `${size}-${gfx}-${trk}-${mode}`);
const shots = arg('shots', join(here, '../../production/qa/evidence/last-mile-heroes')); mkdirSync(shots, { recursive: true });
const qs = [gfx === '2d' ? 'gfx=2d' : '', timescale ? 'timescale=' + timescale : ''].filter(Boolean).join('&');
const file = 'file://' + join(here, '../index.html') + (qs ? '?' + qs : '');

const ctxOpts = size === 'phone'
  ? { viewport: { width: 375, height: 812 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, userAgent: devices['Pixel 5'].userAgent }
  : { viewport: { width: 1366, height: 800 }, deviceScaleFactor: 1 };
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] });
const context = await browser.newContext(ctxOpts);
const page = await context.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
const cdp = await context.newCDPSession(page);
const wait = (ms) => page.waitForTimeout(ms);
const shot = async (name) => { if (perfOnly) return; const p = join(shots, `${tag}-${name}.png`); await page.screenshot({ path: p }); console.log('  shot', p.split('/').pop()); };
const log = (...a) => console.log(...a);
const done = async (code) => { log('errors:', errors.length ? errors : 'none'); await browser.close(); process.exit(code); };

await page.goto(file);
await page.evaluate(() => { try { localStorage.clear(); } catch (e) {} });
await page.goto(file);
await wait(1200);
log('mode:', await page.evaluate(() => window.LMH.mode()), '| default quality:', await page.evaluate(() => window.LMH.quality()));
if (gfx !== '2d') { await page.click(`.seg button[data-q="${gfx}"]`); await wait(300); }
await shot('01-home');
await page.click('#h-start'); await wait(200);
log('empty-form hint:', await page.textContent('#h-hint'));
await page.fill('#f-name', 'Test Player'); await page.fill('#f-org', 'Test Organisation'); await page.selectOption('#f-state', 'Jonglei');
await page.click(`.track[data-track="${trk}"]`);
await page.click('#h-start'); await wait(1300);
await shot('02-map');
await page.click('#m-play'); await wait(600);
await shot('03-intro');
// Escape on the intro must close it (no soft-lock), then reopen
await page.keyboard.press('Escape'); await wait(300);
log('intro closed by Escape:', !(await page.$('#modal-root .overlay')));
await page.click('#m-play'); await wait(500);
await page.click('#i-go'); await wait(1300);
await shot('04-announce');

// ---------- Phase 1: announce ----------
const chips = await page.evaluate(() => Array.from(document.querySelectorAll('#chips .mchip')).map((b) => b.dataset.id));
const items = await page.evaluate(() => window.CONTENT.missions.find((m) => m.id === 'M6').announce.items.map((x) => ({ id: x.id, correct: !!x.correct, critical: x.critical || null })));
const byId = Object.fromEntries(items.map((x) => [x.id, x]));
if (mode === 'critical') {
  const crit = chips.find((id) => byId[id].critical);
  if (!crit) { log('no critical chip drawn this run'); await done(0); }
  log('clicking critical chip', crit);
  await page.click(`#chips .mchip[data-id="${crit}"]`); await wait(700); await shot('05-critical-stamp');
  await wait(2200); await shot('06-critical-card');
  await page.keyboard.press('Escape'); await wait(900); await shot('07-results-critical');
  log('results title:', await page.textContent('.page h2'));
  log('anyCritical saved:', await page.evaluate(() => window.LMH.store().anyCritical));
  await done(errors.length ? 1 : 0);
}
let wrongDone = false;
for (const id of chips) {
  if (!byId[id].correct) {
    if (mode === 'mistakes' && !byId[id].critical && !wrongDone) { await page.click(`#chips .mchip[data-id="${id}"]`); await wait(600); wrongDone = true; await shot('05-wrong-chip'); }
    continue;
  }
  await page.click(`#chips .mchip[data-id="${id}"]`); await wait(220);
}
await wait(900); await shot('05-broadcast');
await wait(1700);

// ---------- Phase 2: build ----------
await shot('06-build');
const defs = await page.evaluate(() => window.CONTENT.missions.find((m) => m.id === 'M6').stations.map((s) => ({ id: s.id, kind: s.kind, order: s.order || 0 })));
const clickPlot = async (want) => {
  const btns = await page.$$(want === '+' ? '.plotnum.side' : '.plotnum:not(.side)');
  for (const b of btns) { if (!(await b.isVisible())) continue; if (want === '+' || (await b.textContent()).trim() === String(want)) { await b.click(); return true; } }
  return false;
};
let firstWrong = mode === 'mistakes';
for (const d of defs) {
  await page.click(`#tray .scard[data-id="${d.id}"]`); await wait(120);
  if (firstWrong && d.kind === 'path' && d.order < 5) {
    await clickPlot(d.order + 1); await wait(500); await shot('07-wrong-plot'); firstWrong = false;
  }
  await clickPlot(d.kind === 'path' ? d.order : '+'); await wait(320);
}
await wait(500); await shot('08-site-built');
await wait(1700);
await shot('08b-ready');
await page.click('#go'); await wait(400);

// ---------- Phase 3: rush ----------
const wantLabel = { 'Needs registration': 'Registration and ID check', 'Has a complaint or question': 'Complaints desk', 'Feels faint in the heat': 'Water and first aid', 'Not on the list': 'Complaints desk', 'A household on the list cannot reach the site': 'Door-to-door team' };
const perf = []; let shotRush = 0, answered = 0, routed = 0, wrongEv = mode === 'mistakes', paused = false;
if (throttle > 1) await cdp.send('Emulation.setCPUThrottlingRate', { rate: throttle });
const t0 = Date.now();
while (Date.now() - t0 < 600000) {
  const state = await page.evaluate(() => { const r = window.LMH.run(); if (!r || !r.debug || !r.debug.st) return { gone: true, page: !!document.querySelector('.page') }; const st = r.debug.st;
    return { phase: st.phase, ended: r.ended, ev: !!document.querySelector('#ev-opts .opt:not([disabled])'), page: !!document.querySelector('.page'), stats: window.LMH.stats(), t: st.rushT, people: st.people.length }; });
  if (state.gone || state.page) break;
  if (state.ev) {
    const pickIdx = await page.evaluate((mistake) => { const E = window.LMH.run().debug.st.cur; const btns = Array.from(document.querySelectorAll('#ev-opts .opt')).filter((b) => !b.disabled);
      let i = btns.findIndex((b) => E.options[Number(b.dataset.i)].correct);
      if (mistake) { const j = btns.findIndex((b) => { const o = E.options[Number(b.dataset.i)]; return !o.correct && !o.critical; }); if (j >= 0) i = j; }
      return Number(btns[i].dataset.i); }, wrongEv);
    if (answered === 0) await shot('10-event');
    await page.click(`#ev-opts .opt[data-i="${pickIdx}"]`); answered++;
    if (wrongEv) { wrongEv = false; await wait(500); await shot('11-event-wrong'); } else if (answered === 1) { await wait(400); await shot('11-event-feedback'); }
    await wait(600); continue;
  }
  if (state.phase === 'rush') {
    if (state.t > 6) perf.push(state.stats);
    if (!shotRush && state.t > 10 && state.people >= 3) { shotRush = 1; await shot('09-rush'); }
    // pause menu check once: Escape opens pause, Escape resumes (no soft-lock)
    if (!paused && state.t > 20) { paused = true; await page.keyboard.press('Escape'); await wait(300); const open = !!(await page.$('#modal-root .overlay')); await shot('09b-pause'); await page.keyboard.press('Escape'); await wait(300); log('pause opens/closes with Escape:', open, !(await page.$('#modal-root .overlay'))); }
    if (perfOnly) { if (perf.length >= 25) break; await wait(400); continue; }
    const bubs = await page.$$('.bub[aria-label]');
    for (const b of bubs.slice(0, 2)) {
      const lab = await b.getAttribute('aria-label'); const target = wantLabel[lab]; if (!target) continue;
      try { await b.click({ timeout: 600 }); } catch (e) { continue; }
      if (!shotRush && size === 'phone') { shotRush = 1; await shot('09-rush-selected'); }
      const lbls = await page.$$('.lbl.tap');
      for (const l of lbls) { if ((await l.textContent()).trim() === target) { try { await l.click({ timeout: 600 }); routed++; } catch (e) {} break; } }
    }
  }
  await wait(200);
}
if (throttle > 1) await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
const mean = (k) => perf.length ? perf.reduce((a, b) => a + b[k], 0) / perf.length : 0;
if (perf.length) {
  const s0 = perf[perf.length - 1];
  log(`perf (rush, ${perf.length} samples, CPU throttle x${throttle}): fps avg ${mean('fps').toFixed(1)} min ${Math.min(...perf.map((x) => x.fps)).toFixed(1)} | main-thread ms/frame avg ${mean('cpuMs').toFixed(1)} max ${Math.max(...perf.map((x) => x.cpuMs)).toFixed(1)} | draw calls ${s0.calls} | triangles ${s0.triangles} | ${s0.mode}/${s0.quality} pixelRatio ${s0.pixelRatio} viewport ${s0.W}x${s0.H}`);
}
if (perfOnly) await done(errors.length ? 1 : 0);
await wait(2500);
await shot('12-results');
const res = await page.evaluate(() => ({ title: document.querySelector('.page h2') && document.querySelector('.page h2').textContent, last: window.LMH.store().missions.M6 && window.LMH.store().missions.M6.last, badges: window.LMH.store().badges }));
log('routed:', routed, '| events answered:', answered);
log('result:', res.title, res.last && { status: res.last.status, score: res.last.score, correct: res.last.correct, total: res.last.total, stars: res.last.stars, livesLeft: 3 - res.last.livesLost }, '| badges:', res.badges.join(','));
await done(errors.length ? 1 : 0);
