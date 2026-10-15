// Build the player guide and answer key booklet (LastMileHeroes_Guide.pdf) from src/content.js.
// node answer-key.mjs   (run again after editing the content)
import { chromium } from './node_modules/playwright/index.mjs';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const here = dirname(fileURLToPath(import.meta.url));
const sandbox = { window: {} }; vm.runInNewContext(readFileSync(join(here, '../src/content.js'), 'utf8'), sandbox);
const C = sandbox.window.CONTENT, T = C.tracks;
const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
// Fill track placeholders; when SNFI and WASH differ, show both.
const fillT = (s, k) => String(s).replace(/\{deadline\}/g, T[k].reportDeadline).replace(/\{report\}/g, T[k].report).replace(/\{cluster\}/g, T[k].cluster)
  .replace(/\{demo\}/g, T[k].demo).replace(/\{kit\}/g, 'The kit').replace(/\{ngo\}/g, C.ngo.name).replace(/\{hh\}/g, 'the number of households').replace(/\{people\}/g, 'the number of people').replace(/\{assessed\}/g, 'recent');
const fill = (s) => { const a = fillT(s, 'SNFI'), b = fillT(s, 'WASH'); return a === b ? esc(a) : `<b>SNFI:</b> ${esc(a)} <b>WASH:</b> ${esc(b)}`; };
const right = (E) => E.options.filter((o) => o.correct).map((o) => fill(o.text)).join(' / ');
const ref = (r) => r ? `<span class="ref">${esc(r)}</span>` : '';
const tag = (t) => t ? `<span class="tk">${t}</span> ` : '';
const qa = (rows) => `<table class="qa">${rows.map((r) => `<tr><td class="id">${esc(r.id || '')}</td><td>${tag(r.track)}${fill(r.q)}</td><td class="a">${r.a}${ref(r.ref)}</td></tr>`).join('')}</table>`;
const events = (list, track) => qa(list.map((E) => ({ id: E.id, q: E.prompt || E.text, a: right(E), ref: E.ref, track: E.track || track })));
const M = Object.fromEntries(C.missions.map((m) => [m.id, m]));
const sec = (m, steps, body) => `<section class="mission" style="--mc:${m.color}"><h2><span class="n">${m.number}</span>${esc(m.title)} <small>${esc(m.place)} · ${esc(m.topic)}</small></h2>` +
  `<p class="goal">${esc(m.intro)}</p><div class="walk"><b>Walkthrough</b><ol>${steps.map((x) => `<li>${x}</li>`).join('')}</ol>` +
  ((m.rulesInPlay || []).length ? `<p class="rip">Critical rules in play: ${m.rulesInPlay.map((r) => `<span class="crit">${r}</span> ${esc(C.criticalRules[r].title)}`).join(' · ')}</p>` : '') + `</div>` +
  `<h3 class="ans">Answers</h3>${body}</section>`;
const ul = (items) => `<ul>${items.map((x) => `<li>${x}</li>`).join('')}</ul>`;
const h3 = (t) => `<h3>${t}</h3>`;
const parts = [];
const S = C.settings, st = S.stars, pct = (x) => Math.round(x * 100) + '%';
const ruleText = { start: 'from the start', flawless: 'finish any mission without losing a life', noCritical: 'finish missions without ever breaking a critical rule', allMissions: 'finish every mission' };
const howRule = (r) => { const [k, a] = String(r).split(':'); if (k === 'missionDone') return `finish Mission ${a.slice(1)}`; if (k === 'stars3') return `3 stars on Mission ${a.slice(1)}`; if (k === 'streak') return `${a} right moves in a row`; return ruleText[k] || r; };

/* ---------- Cover ---------- */
parts.push(`<section class="cover"><div class="band"></div><p class="kick">IOM South Sudan Core Pipeline · SNFI and WASH</p><h1>Last Mile Heroes</h1><p class="sub">Player guide and answer key</p>
<p class="blurb">How to play, how to pass every mission, and all the right answers, with the source for each.</p>
<div class="mlist">${C.missions.map((m) => `<div style="--mc:${m.color}"><span class="n">${m.number}</span>${esc(m.title)}<small>${esc(m.topic)}</small></div>`).join('')}</div>
<p class="ver">Game version ${esc(C.meta.version)} · For facilitators and players · ${esc(C.meta.cardNote)}</p></section>`);

/* ---------- How the game works ---------- */
parts.push(`<section class="intro"><h2>How the game works</h2>
<h3>Start</h3><ol><li>Open <b>index.html</b>. Type your name, organisation and state, and choose your track: <b>SNFI</b> or <b>WASH</b>.</li>
<li>Settings: <b>Graphics</b> Low is smoother on phones. <b>Relaxed pace</b> gives ${S.relaxedPaceFactor}× more time in the timed parts. Sound on or off.</li>
<li>Tap <b>Start the journey</b>. Missions open one after the other on the map. A finished mission can be replayed at any time.</li></ol>
<h3>Controls</h3><ul><li>Tap or click everything: people, documents, buttons, stations.</li><li>Walk: tap the ground, or use the arrow keys or WASD.</li><li>Pause: the pause button or Escape. The pause menu has sound, restart and back to the map.</li></ul>
<h3>Lives, points and stars</h3><ul>
<li><b>${S.livesPerMission} lives</b> per mission. A wrong move costs a life and shows a short explanation with its source. Small slips (the wrong desk, a carton that is fine) cost no life. Out of lives: try the mission again.</li>
<li><b>Points:</b> ${S.pointsPerCorrect} per right move, plus up to ${S.streakBonusMax} extra for a streak of right moves in a row.</li>
<li><b>Stars</b> come from the share of right moves: 1 star from ${pct(st.one)}, 2 from ${pct(st.two)}, 3 from ${pct(st.three)}.</li></ul>
<h3>Critical rules</h3><p>Breaking one of the 8 critical rules <b>stops the mission at once</b>, with a short scene and the rule. It is not a failure: read the rule and play again. They are listed on the next page.</p>
<h3>Badges and rewards</h3><table class="qa">${C.badges.map((b) => `<tr><td class="id">${esc(b.title)}</td><td>${esc(b.desc)}</td></tr>`).join('')}${(C.unlocks || []).map((u) => `<tr><td class="id">${esc(u.label)}</td><td>Unlocked: ${esc(howRule(u.rule))}</td></tr>`).join('')}</table>
<h3>Your results</h3><p>On the map, <b>My report</b> shows your score, stars per mission, topics to review and badges. After all ${C.missions.length} missions: the <b>completion card</b> (print or save as PDF) and <b>Download results (CSV)</b> to send to the CP team.</p></section>`);


/* ---------- Critical rules ---------- */
parts.push(`<section class="rules"><h2>The 8 critical rules: never break them</h2><p>Each one stops the mission at once. Wrong options that break a rule are marked like this: <span class="crit">R1</span>.</p><table class="qa">${Object.keys(C.criticalRules).map((k) => { const r = C.criticalRules[k]; return `<tr><td class="id">${k}</td><td><b>${esc(r.title)}.</b> ${esc(r.rule)}</td><td class="a">${ref(r.ref)}</td></tr>`; }).join('')}</table></section>`);

/* ---------- M1 ---------- */
{ const m = M.M1, good = m.docs.filter((d) => d.good), bad = m.docs.filter((d) => !d.good);
  parts.push(sec(m, [
    'Tap the ground to walk (arrow keys or WASD on a laptop). Tap a glowing document to walk to it and pick it up.',
    `Pick up the ${good.length} right documents and leave the wrong ones: a wrong pick costs a life, and one is a critical rule.`,
    'Majok stops you with a shortcut after your 2nd and 4th right document: answer it.',
    'Walk to the <b>Cluster desk</b> with the full file. The cluster validates it in 3 to 5 working days (the calendar runs by itself).',
    'Walk to the <b>IOM CP desk</b> and answer the 3 sign-up questions.'], h3('Collect the partner file') + `<div class="cols"><div><b class="ok">Pick up (all of them)</b>${ul(good.map((d) => esc(d.text)))}</div><div><b class="no">Leave on the ground</b>${ul(bad.map((d) => esc(d.text) + (d.critical ? ` <span class="crit">${d.critical}</span>` : '')))}</div></div>` +
    `<p>Then take the file to the <b>Cluster desk first</b>, then to the <b>IOM CP desk</b>. ${ref(m.clusterFirst.ref)}</p>` +
    h3('At the IOM CP desk') + events(m.signup) + h3('Majok\'s shortcuts (2 per run)') + events(m.events))); }

/* ---------- M2 ---------- */
{ const m = M.M2, O = m.outcomes, kinds = ['count', 'priority', 'assisted', 'refuse'];
  parts.push(sec(m, [
    'Tap a house with a <b>purple bubble</b>: you walk to its door.',
    'Choose <b>ask consent</b> first, every time. Writing names first costs a life.',
    'Then pick what to record: count the household, count it and note the vulnerability, skip it (already assisted), or record nothing (consent refused).',
    'After 5 households, walk to Nyakuoth and answer the cluster\'s questions, plus one for your track.'], h3('Each household (5 per run)') + `<p>First, always: <b>${esc(m.consent.ask)}</b>. ${ref(m.consent.ref)} Then choose by what you hear:</p>` +
    `<table class="qa">${kinds.map((k) => `<tr><td class="id">${k}</td><td>${m.households.filter((h) => h.kind === k).map((h) => esc(h.text)).join('<br>')}</td><td class="a">${esc(O[k].ok)}${O[k].critical ? ` <span class="crit">never: ${esc(O[k].bad)} (${O[k].critical})</span>` : ''}${ref(O[k].ref)}</td></tr>`).join('')}</table>` +
    h3('Report to the cluster (2 per run, plus your track\'s question)') + events(m.events) + events([m.trackEvents.SNFI], 'SNFI') + events([m.trackEvents.WASH], 'WASH'))); }

/* ---------- M3 ---------- */
{ const m = M.M3;
  const slotRows = []; m.slots.forEach((s) => Object.keys(s.pieces).forEach((k) => { const p = s.pieces[k].find((x) => x.ok); slotRows.push({ id: s.label, q: '', a: fill(p.text), ref: s.ref, track: k === 'ALL' ? '' : k }); }));
  parts.push(sec(m, [
    'Read the request card in the bottom panel: place, households, kit, date of assessment.',
    'Tap a piece in the tray, then its slot on the form board. Fill all 6 slots with the right pieces.',
    'Tap the hub on the map that covers the site.',
    'Tap <b>Send</b>. Watch the request pass the 3 review gates and answer the calls on the way.'], h3('Build the request: the right piece for each slot') + `<table class="qa">${slotRows.map((r) => `<tr><td class="id">${esc(r.id)}</td><td class="a">${tag(r.track)}${r.a}${ref(r.ref)}</td></tr>`).join('')}</table>` +
    h3('Pick the hub that covers the site') + `<table class="qa">${m.hubs.map((h) => `<tr><td class="id">${esc(h.id)}</td><td>${esc(h.covers)}${h.notTrack ? ` <span class="tk">not on ${h.notTrack}</span>` : ''}</td></tr>`).join('')}</table>` +
    `<p>Request cards: ${m.scenarios.map((s) => `${esc(s.place)} → <b>${esc(s.hub)}</b>`).filter((v, i, a) => a.indexOf(v) === i).join(' · ')}. ${ref(m.hubRef)}</p>` +
    `<p>Then tap <b>Send</b>. The review: ${m.gates.map((g) => `${esc(g.label)} (${esc(g.time)})`).join(', ')}. ${ref(m.gatesRef)}</p>` +
    h3('During the review (2 per run)') + events(m.events))); }

/* ---------- M4 ---------- */
{ const m = M.M4, K = m.kitCheck;
  parts.push(sec(m, [
    'Tap a day on the calendar to book the collection.',
    'Tap <b>Drive in</b> (or the loading bay). Answer the call at the bay.',
    'Tap each torn or wet carton, then <b>Done checking</b>. Tapping a good carton does not cost a life.',
    'Tap the item that does not belong in the kit.',
    'Choose the document to sign: your truck turns your colour.'], ul([
    `<b>Book:</b> any day from <b>Day 1 to Day ${m.book.hold}</b>. Not today (24 hours' notice), not after Day ${m.book.hold} (the hold ends). ${ref(m.book.ok.ref)}`,
    `<b>Drive in</b> to the loading bay.`,
    `<b>Check the cartons:</b> tap the ${m.inspect.damaged} torn or wet (darker) cartons, then <b>Done checking</b>. ${ref(m.inspect.ok.ref)}`,
    `<b>Check the kit:</b> tap the item that is not in it. ${tag('SNFI')}${K.intruders.SNFI.map(esc).join(', ')} ${tag('WASH')}${K.intruders.WASH.map(esc).join(', ')} ${ref(K.ok.ref)}`,
    `<b>Sign:</b> ${right(m.sign)} ${ref(m.sign.ref)}`]) + h3('Calls at the warehouse (2 per run)') + events(m.events))); }

/* ---------- M5 ---------- */
{ const m = M.M5;
  parts.push(sec(m, [
    'Answer the first stop before you move.',
    'Change lane early to dodge mud and rocks: swipe, tap the left or right side of the screen, use the arrows on screen or the arrow keys.',
    'Answer the calls that stop the truck on the way.',
    'Reach the distribution site at 100%. There is no way to fail the drive: hits only slow you down.'], `<p>Swipe, tap a side or use the arrows to change lane early and dodge <b>mud and rocks</b> (+${m.obstacles.avoidPoints} each). Hitting one only slows you down.</p>` +
    h3('First stop, always') + events([m.first]) + h3('On the road (3 per run)') + events(m.events))); }

/* ---------- M6 ---------- */
{ const m = M.M6, A = m.announce, path = m.stations.filter((s) => s.kind === 'path').sort((a, b) => a.order - b.order), side = m.stations.filter((s) => s.kind !== 'path');
  parts.push(sec(m, [
    `<b>Announce:</b> tap the ${m.announce.items.filter((x) => x.correct).length} right messages to load the megaphone. It broadcasts by itself when it is full.`,
    '<b>Build:</b> tap a station card, then a glowing plot. Path stations go on the numbered plots in order; the others on the side plots (+). Leave the decoy cards in the tray.',
    `<b>Rush (${m.rush.seconds} seconds):</b> tap a person\'s bubble, then the station they need. Be quick: people leave when their ring runs out.`,
    'Answer the calls that pause the rush. The last call comes near the end.'], h3('1. Announce') + `<div class="cols"><div><b class="ok">Load these</b>${ul(A.items.filter((x) => x.correct).map((x) => esc(x.text)))}</div><div><b class="no">Never</b>${ul(A.items.filter((x) => !x.correct).map((x) => esc(x.text) + (x.critical ? ` <span class="crit">${x.critical}</span>` : '')))}</div></div>` +
    h3('2. Build the site') + `<p><b>Path, in order:</b> ${path.map((s) => `${s.order}. ${esc(s.label)}`).join(' → ')}. <b>Also place:</b> ${side.map((s) => esc(s.label)).join(', ')}. ${ref(m.stationsRef)}</p>` +
    `<p><b>Leave out:</b> ${m.decoys.map((d) => esc(d.label) + (d.critical ? ` <span class="crit">${d.critical}</span>` : '')).join(', ')}.</p>` +
    h3('3. The rush: tap the person, then the station') + `<table class="qa">
      <tr><td class="id">ID card</td><td>Arriving to collect</td><td class="a">Registration and ID check${ref(m.routing.register.ref)}</td></tr>
      <tr><td class="id">Speech</td><td>A question or complaint</td><td class="a">Complaints desk${ref(m.routing.complaint.ref)}</td></tr>
      <tr><td class="id">Drop</td><td>Feels faint in the heat</td><td class="a">Water and first aid${ref(m.routing.faint.ref)}</td></tr>
      <tr><td class="id">No entry</td><td>Not on the list</td><td class="a">Complaints desk, never the distribution point${ref(m.routing.notListedOk.ref)}</td></tr>
      <tr><td class="id">Pink house</td><td>A family on the list cannot reach the site</td><td class="a">Door-to-door team${ref(m.routing.door.ref)}</td></tr></table>` +
    h3('Calls during the day') + events(m.events))); }

/* ---------- M7 ---------- */
{ const m = M.M7, R = m.report;
  parts.push(sec(m, [
    'Tap <b>Start the clock</b>. The calendar runs to your track\'s deadline.',
    'Tap every right piece into the report before the clock runs out. The report sends itself when it is complete. A late report costs a life.',
    'The phone rings during the race and after it: answer the calls.',
    'Tap <b>Lead it</b> and answer every step of the final emergency. Every critical rule is in play.'], h3(`1. The report, before the deadline (SNFI ${esc(T.SNFI.reportDeadline)}, WASH ${esc(T.WASH.reportDeadline)})`) +
    `<div class="cols"><div><b class="ok">Add all of these</b>${ul(R.pieces.filter((p) => p.good).map((p) => esc(p.text)))}</div><div><b class="no">Never add</b>${ul(R.pieces.filter((p) => !p.good).map((p) => esc(p.text) + (p.critical ? ` <span class="crit">${p.critical}</span>` : '')))}</div></div>` +
    h3('2. The calls') + events([m.firstCall].concat(m.calls)) + events([m.pdmCall.SNFI], 'SNFI') + events([m.pdmCall.WASH], 'WASH') +
    h3('3. The final emergency (one per run)') + m.finales.map((F) => `<p class="fin"><b>${esc(F.title)}</b></p>` +
      qa(Object.keys(F.nodes).map((k) => { const N = F.nodes[k], back = /b$/.test(k); return { id: back ? '(if wrong)' : '', q: N.text, a: right(N), ref: N.ref }; }))).join(''))); }

parts.push(`<section class="pass"><h2>How to pass the whole game</h2>
<p>There is no pass or fail mark. You have finished when <b>all ${C.missions.length} missions are complete</b>: the map shows a tick on each stop, and the completion card unlocks.</p>
<ol><li><b>Never break a critical rule.</b> When a choice offers a shortcut (a fee, a favour, skipping a check, sharing data, adding names), it is a trap.</li>
<li><b>Follow the order of the process:</b> cluster before IOM, consent before data, check before you sign, report before the deadline.</li>
<li><b>Take your time</b> on the timed parts, or turn on <b>Relaxed pace</b>. Only Missions 5, 6 and 7 have a clock.</li>
<li><b>Read the feedback.</b> Every wrong move tells you why, with its source. The same questions come back in other runs.</li>
<li><b>For 3 stars</b>, get at least ${pct(st.three)} of the moves right in a mission. Replay any mission to raise your stars: the best run counts.</li>
<li><b>Get your card:</b> on the map, tap <b>My report</b>, then <b>Completion card</b>. Print it or save it as PDF, and send the CSV to the CP team.</li></ol>
<p class="note">The completion card is a training record, not a certification.</p></section>`);

const html = `<!doctype html><html><head><meta charset="utf-8"><title>Last Mile Heroes: player guide and answer key</title><style>
@page { size: A5; margin: 10mm 9mm 11mm; }
* { box-sizing: border-box; }
body { font: 8.2pt/1.32 Inter, "Segoe UI", Roboto, Arial, sans-serif; color: #14213D; margin: 0; }
header { border-bottom: 3px solid #0033A0; padding-bottom: 5px; margin-bottom: 7px; }
header h1 { font-size: 17pt; margin: 0; color: #0033A0; }
header p { margin: 2px 0 0; color: #4A5875; }
section { margin: 0 0 8px; break-inside: auto; }
h2 { font-size: 11pt; margin: 8px 0 4px; padding: 3px 6px; background: color-mix(in srgb, var(--mc, #0033A0) 14%, white); border-left: 5px solid var(--mc, #0033A0); break-after: avoid; }
h2 .n { display: inline-block; min-width: 18px; color: #fff; background: var(--mc); border-radius: 4px; text-align: center; margin-right: 6px; }
h2 small { font-weight: 600; color: #4A5875; font-size: 8pt; margin-left: 6px; }
.rules h2 { --mc: #C62E2E; }
h3 { font-size: 9pt; margin: 6px 0 2px; color: #0033A0; break-after: avoid; }
p { margin: 2px 0 4px; }
ul { margin: 2px 0 4px; padding-left: 15px; } li { margin: 0; }
table.qa { width: 100%; border-collapse: collapse; margin: 2px 0 4px; }
table.qa td { border-bottom: 1px solid #E3E8F1; padding: 2px 4px; vertical-align: top; }
table.qa tr { break-inside: avoid; }
td.id { width: 1%; white-space: nowrap; color: #7A859C; font-weight: 700; font-size: 7.6pt; }
td.a { width: 46%; font-weight: 600; color: #0B5D3B; }
.ref { display: inline-block; margin-left: 4px; font-size: 7pt; font-weight: 700; color: #6A4B00; background: #FFF4D6; border-radius: 3px; padding: 0 3px; white-space: nowrap; }
.tk { font-size: 7pt; font-weight: 800; color: #fff; background: #5B6475; border-radius: 3px; padding: 0 3px; }
.crit { font-size: 7pt; font-weight: 800; color: #fff; background: #C62E2E; border-radius: 3px; padding: 0 3px; }
.cols { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.ok { color: #12865A; } .no { color: #C62E2E; }
.fin { margin: 5px 0 1px; }
section.mission, section.intro, section.rules, section.pass { break-before: page; }
.cover { height: 182mm; display: flex; flex-direction: column; justify-content: center; text-align: center; position: relative; }
.cover .band { position: absolute; top: 0; left: 0; right: 0; height: 9mm; background: #0033A0; border-radius: 4px; }
.cover .kick { color: #0033A0; font-weight: 800; letter-spacing: .06em; text-transform: uppercase; font-size: 8pt; }
.cover h1 { font-size: 30pt; margin: 4px 0 0; color: #0033A0; }
.cover .sub { font-size: 14pt; font-weight: 700; margin: 2px 0 10px; }
.cover .blurb { color: #4A5875; margin: 0 8mm 10px; }
.cover .mlist { text-align: left; margin: 0 10mm; }
.cover .mlist div { padding: 3px 6px; border-left: 4px solid var(--mc); margin: 3px 0; background: color-mix(in srgb, var(--mc) 10%, white); font-weight: 700; }
.cover .mlist .n { display: inline-block; width: 16px; color: var(--mc); }
.cover .mlist small { font-weight: 500; color: #4A5875; margin-left: 6px; }
.cover .ver { margin-top: 12px; color: #7A859C; font-size: 7.4pt; }
.goal { font-style: italic; color: #4A5875; }
.walk { background: #F3F6FB; border-radius: 6px; padding: 4px 8px 2px; margin: 4px 0 6px; }
.walk ol { margin: 2px 0 3px; padding-left: 16px; } .walk li { margin: 1px 0; }
.rip { font-size: 7.4pt; margin: 2px 0 3px; }
h3.ans { border-bottom: 1.5px solid var(--mc); }
.intro h2, .pass h2 { --mc: #0033A0; }
.pass ol li { margin: 3px 0; }
.note { color: #C62E2E; font-weight: 700; }
footer { margin-top: 8px; color: #7A859C; font-size: 7.4pt; border-top: 1px solid #E3E8F1; padding-top: 4px; }
</style></head><body>
${parts.join('\n')}
<footer>Generated from the game content by <code>tools/answer-key.mjs</code>. Sources: SOP = IOM South Sudan Core Pipeline SOP (Draft 1, Sept 2026); AG = CP Distribution Agreement 2026; A1–A7 = its annexes; WS = WASH Cluster CP SOP (Jan 2026); IN/234 = IOM PSEA policy. All names in the game are fictional. ${esc(C.meta.cardNote)}</footer>
</body></html>`;

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const page = await browser.newPage(); await page.setContent(html, { waitUntil: 'load' });
await page.pdf({ path: join(here, '../LastMileHeroes_Guide.pdf'), format: 'A5', printBackground: true, displayHeaderFooter: true,
  headerTemplate: '<span></span>', footerTemplate: '<div style="font-size:7pt;color:#7A859C;width:100%;text-align:center">Last Mile Heroes · player guide · page <span class="pageNumber"></span> of <span class="totalPages"></span></div>',
  margin: { top: '10mm', bottom: '11mm', left: '9mm', right: '9mm' } });
await browser.close();
console.log('LastMileHeroes_Guide.pdf written');
