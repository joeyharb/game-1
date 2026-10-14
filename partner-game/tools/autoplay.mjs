// Autoplay any mission through the real buttons (developer tool).
// node autoplay.mjs --mission M1 [--size phone|laptop] [--gfx high|low|2d] [--track SNFI|WASH]
//                   [--mode perfect|mistakes] [--timescale 2] [--shots dir] [--tag name]
import { chromium, devices } from './node_modules/playwright/index.mjs';
import { mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const mission = arg('mission', 'M1'), size = arg('size', 'laptop'), gfx = arg('gfx', 'low'), trk = arg('track', 'SNFI'), mode = arg('mode', 'perfect');
const timescale = arg('timescale', '2'), tag = arg('tag', `${mission}-${size}-${gfx}-${trk}-${mode}`);
const shots = arg('shots', join(here, '../../production/qa/evidence/last-mile-heroes/full')); mkdirSync(shots, { recursive: true });
const qs = [gfx === '2d' ? 'gfx=2d' : '', timescale ? 'timescale=' + timescale : ''].filter(Boolean).join('&');
const file = 'file://' + join(here, '../index.html') + (qs ? '?' + qs : '');
const ctxOpts = size === 'phone'
  ? { viewport: { width: 375, height: 812 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, userAgent: devices['Pixel 5'].userAgent }
  : { viewport: { width: 1366, height: 800 }, deviceScaleFactor: 1 };
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await (await browser.newContext(ctxOpts)).newPage();
const errors = [];
page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
const wait = (ms) => page.waitForTimeout(ms);
const taken = new Set();
const shot = async (name) => { if (taken.has(name)) return; taken.add(name); await page.screenshot({ path: join(shots, `${tag}-${name}.png`) }); };
const log = (...a) => console.log(...a);
let wrongLeft = mode === 'mistakes' ? 1 : 0;

await page.goto(file);
await page.evaluate(() => { try { localStorage.clear(); } catch (e) {} });
await page.goto(file); await wait(800);
await page.evaluate(([t, g]) => { const s = window.LMH.store(); s.player = { name: 'Test Player', org: 'Test Org', state: 'Jonglei' }; s.track = t; if (g !== '2d') window.LMH.gfx.setQuality(g); }, [trk, gfx]);
await page.evaluate((m) => window.LMH.start(m), mission);
await wait(1200); await shot('01-start');

const clickText = async (sel, text) => { for (const el of await page.$$(sel)) { if (!(await el.isVisible())) continue; const t = (await el.textContent()).replace(/\s+/g, ' ').trim(); if (t === text || t.includes(text)) { try { await el.click({ timeout: 800, force: true }); return true; } catch (e) { return false; } } } return false; };
async function answerChoice() {
  const has = await page.$('#ev-opts .opt:not([disabled])'); if (!has) return false;
  const idx = await page.evaluate((wrong) => { const E = window.LMH.run().debug.cur; const btns = Array.from(document.querySelectorAll('#ev-opts .opt')).filter((b) => !b.disabled);
    let i = btns.findIndex((b) => E.options[Number(b.dataset.i)].correct);
    if (wrong) { const j = btns.findIndex((b) => { const o = E.options[Number(b.dataset.i)]; return !o.correct && !o.critical; }); if (j >= 0) i = j; }
    return Number(btns[i].dataset.i); }, wrongLeft > 0);
  await shot('02-choice');
  await page.click(`#ev-opts .opt[data-i="${idx}"]`); if (wrongLeft > 0) { wrongLeft--; await wait(300); await shot('03-wrong-feedback'); }
  await wait(500); return true;
}
const state = () => page.evaluate(() => { const r = window.LMH.run(); return { page: !!document.querySelector('.page'), ended: !r || r.ended, phase: r && r.debug && r.debug.st ? r.debug.st.phase : '', busy: r && r.debug && r.debug.st ? !!r.debug.st.busy : false }; });

const t0 = Date.now(); let n = 0;
while (Date.now() - t0 < 420000) {
  const s = await state(); if (s.page) break;
  if (await answerChoice()) continue;
  n++;
  if (mission === 'M1') {
    const next = await page.evaluate(() => { const st = window.LMH.run().debug.st; if (st.phase !== 'collect' || st.busy) return { phase: st.phase, busy: st.busy }; const d = st.docs.find((p) => !p.taken && p.d.good); return { phase: st.phase, doc: d ? d.d.text : null }; });
    if (next.phase === 'collect' && !next.busy) {
      if (next.doc) { if (await clickText('.lbl.doc', next.doc)) await wait(1500); if (n === 3) await shot('04-collect'); }
      else { await clickText('.lbl.tap', 'Cluster desk'); await wait(2500); }
    } else if (next.phase === 'signup' && !next.busy) { await clickText('.lbl.tap', 'IOM CP desk'); await wait(2500); }
  } else if (mission === 'M2') {
    const b = await page.$('.bub[aria-label="Visit this household"]');
    const busy = await page.evaluate(() => window.LMH.run().debug.st.busy);
    if (b && !busy) { try { await b.click({ timeout: 800 }); } catch (e) {} await wait(1500); await shot('04-visit'); }
  } else if (mission === 'M3') {
    const nx = await page.evaluate(() => { const r = window.LMH.run(), st = r.debug.st; if (st.phase !== 'build') return { phase: st.phase };
      const slot = r.debug.M.slots.find((s) => !st.filled[s.id]); if (slot) { const p = st.pieces.find((x) => x.slot === slot.id && x.ok && !x.used); return { phase: 'build', piece: p.id, slot: slot.label }; }
      if (!st.hubOk) return { phase: 'build', hub: r.debug.sc.hub }; return { phase: 'build', send: true }; });
    if (nx.piece) { await page.click(`#tray .scard[data-id="${nx.piece}"]`); await wait(150); await clickText('.lbl.slot', nx.slot); await wait(300); await shot('04-build'); }
    else if (nx.hub) { await clickText('.lbl.tap', nx.hub); await wait(500); }
    else if (nx.send) { await shot('05-ready'); await page.click('#send'); await wait(1500); await shot('06-review'); }
  }
  await wait(300);
}
await wait(2600); await shot('09-results');
const res = await page.evaluate((m) => { const L = window.LMH.store().missions[m]; return { title: document.querySelector('.page h2') && document.querySelector('.page h2').textContent, last: L && L.last }; }, mission);
log(tag, '→', res.title, res.last ? `score ${res.last.score} ${res.last.correct}/${res.last.total} stars ${res.last.stars} livesLost ${res.last.livesLost}` : '(no result)');
log('errors:', errors.length ? errors : 'none');
await browser.close();
process.exit(errors.length || !res.last ? 1 : 0);
