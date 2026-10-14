// Regenerates question_map.md from content.js.
// Usage (from the pipeline-runner folder): node tools/make_question_map.js .
const path = require('path'), fs = require('fs');
const dir = path.resolve(process.argv[2] || '.');
global.window = {}; require(path.join(dir, 'content.js'));
const C = window.GAME_CONTENT;
const cell = s => String(s == null ? '' : s).replace(/\|/g, '/').replace(/\s+/g, ' ').trim();
const out = [];
let total = 0;
const P = (...l) => out.push(...l);
P('# Question map', '',
  'Every playable item in `content.js`, the mission it belongs to, and its source.',
  '"SOP" is the IOM South Sudan Core Pipeline Operations SOP (Draft 1, September 2026). "Budget tool" and sheet names refer to CP Budget Tool v2 (October 2026). Both files are in `../source/`.', '',
  'This file is generated from `content.js`. After editing, regenerate it with `node tools/make_question_map.js .` (needs Node.js), or edit the rows by hand.', '');
for (const L of C.levels) {
  P(`## Mission ${L.number}: ${L.title} (${L.mission})`, '');
  if (L.mission === 'route') {
    P(`${L.routes.length} routes, ${L.routesPerRun} per run (the route marked "always" is in every run). Each correct stop is one scored move.`, '', '| ID | Route | Stops in order | Source |', '|---|---|---|---|');
    L.routes.forEach(r => { P(`| ${r.id}${r.always ? ' (always)' : ''} | ${cell(r.title)} | ${cell(r.stops.join(' > '))} | ${cell(r.ref)} |`); total++; });
  } else if (L.mission === 'catch') {
    P(`${L.tasks.length} task cards, ${L.cardsPerRun} per run.`, '', '| ID | Task | Owner | Source |', '|---|---|---|---|');
    L.tasks.forEach(t => { P(`| ${t.id} | ${cell(t.task)} | ${cell(t.role)} | ${cell(t.ref)} |`); total++; });
  } else if (L.mission === 'inspect') {
    P(`${L.docs.length} forms, ${L.docsPerRun} per run (at least one clean form each run).`, '', '| ID | Form | Problem line (or clean) | Source |', '|---|---|---|---|');
    L.docs.forEach(d => { const e = d.fields.find(f => f.error); P(`| ${d.id} | ${cell(d.title)} | ${e ? cell(e.label + ': ' + e.value) + (e.critical ? ' (critical ' + e.critical + ')' : '') : 'Clean: approve'} | ${cell(d.ref)} |`); total++; });
  } else if (L.mission === 'buffer') {
    P(`${L.months} monthly decisions on one stream (SNFI or WASH, random), plus ${L.eventsPerRun} call events from a pool of ${L.events.length}.`, '',
      '| ID | Item | Right move | Source |', '|---|---|---|---|');
    P(`| Monthly | Healthy band | Business as usual | ${cell(L.ref)} |`, `| Monthly | Consuming buffer, no order on the way | Start replenishment | ${cell(L.ref)} |`,
      `| Monthly | Consuming buffer, order on the way | Carry on (or order) | ${cell(L.ref)} |`, `| Monthly | Urgent replenishment | Escalate and ration | ${cell(L.ref)} |`);
    total += 4;
    L.events.forEach(e => { const r = e.options.find(o => o.correct); const crit = e.options.filter(o => o.critical).map(o => o.critical); P(`| ${e.id} | ${cell(e.prompt)}${crit.length ? ' (critical ' + crit.join(', ') + ')' : ''} | ${cell(r.text)} | ${cell(e.ref)} |`); total++; });
  } else if (L.mission === 'pack') {
    P(`${L.items.length} items, ${L.itemsPerRun} per run, then one bonus card.`, '', '| ID | Item | Right box(es) | Source |', '|---|---|---|---|');
    L.items.forEach(i => { P(`| ${i.id} | ${cell(i.name)} | ${cell(i.kits.map(k => L.boxes.find(b => b.id === k).label).join(' or '))} | ${cell(L.ref)} |`); total++; });
    const b = L.bonus; P(`| ${b.id} | ${cell(b.prompt)} | ${cell(b.options.find(o => o.correct).text)} | ${cell(b.ref)} |`); total++;
  } else if (L.mission === 'budget') {
    P(`${L.challenges.length} challenges, ${L.challengesPerRun} per run. The right answer (which bars grow) is calculated by the game from the budget tool logic.`, '', '| ID | Change | Bars that grow | Source |', '|---|---|---|---|');
    const calc = (m, inp) => { let sup = 0, t = 0; Object.keys(m.kits).forEach(k => { const n = Math.round(inp.hh * (inp.share[k] || 0)); sup += n * m.kits[k].cost * ((inp.priceMul && inp.priceMul[k]) || 1); t += n * m.kits[k].kg / 1000; });
      const B1 = sup * (1 + m.insurancePct + m.lossPct), full = Math.floor(t / m.truckMT), rem = t - full * m.truckMT, tr = full + (rem > 1e-9 ? 1 : 0);
      const B2 = full * m.truck40Rate + (rem > 1e-9 ? (rem <= 25 ? Math.min(m.truck25Rate, m.truck40Rate) : m.truck40Rate) : 0) + tr * m.loadingPerTruck;
      const Cw = t * m.warehousePerMT, A = inp.staffMonthly * inp.months * inp.staffPct, D = inp.trips * m.tripRate + inp.nights * m.dsaRate, E = Math.round(inp.hh * inp.pdmShare) * m.pdmPerHH;
      return { A, B1, B2, C: Cw, D, E, G: (A + B1 + B2 + Cw + D + E) * m.pscPct }; };
    const apply = (b, ch) => { const x = JSON.parse(JSON.stringify(b)); if (ch.hhFactor) x.hh = Math.round(x.hh * ch.hhFactor); if (ch.priceUp) { x.priceMul = {}; x.priceMul[ch.priceUp.kit] = 1 + ch.priceUp.pct; }
      if (ch.shift) { const f = ch.shift.hh / x.hh; x.share[ch.shift.from] -= f; x.share[ch.shift.to] = (x.share[ch.shift.to] || 0) + f; } if (ch.staffPct != null) x.staffPct = ch.staffPct; if (ch.pdmShare != null) x.pdmShare = ch.pdmShare; if (ch.extraTrips) x.trips += ch.extraTrips; if (ch.months) x.months = ch.months; return x; };
    const base = calc(L.model, L.model.base);
    L.challenges.forEach(c => { const a = calc(L.model, apply(L.model.base, c.change)); const g = L.bars.filter(b => a[b.id] > base[b.id] * (1 + 1e-9) + 1e-9).map(b => b.label); P(`| ${c.id} | ${cell(c.prompt)} | ${cell(g.join(', '))} | ${cell(c.ref)} |`); total++; });
  } else if (L.mission === 'convoy') {
    P(`${L.scenarios.length} branching scenarios; one per run. Each checkpoint is one decision.`, '', '| ID | Scenario | Decision | Source |', '|---|---|---|---|');
    L.scenarios.forEach(sc => Object.entries(sc.nodes).forEach(([nid, n]) => { const crit = [...new Set(n.options.filter(o => o.critical).map(o => o.critical))]; P(`| ${sc.id}/${nid} | ${cell(sc.title)} | ${cell(n.text)}${crit.length ? ' (critical ' + crit.join(', ') + ')' : ''} | ${cell(n.ref)} |`); total++; }));
  }
  P('');
}
P('## Critical rules', '', '| ID | Rule | Source |', '|---|---|---|');
Object.entries(C.criticalRules).forEach(([id, r]) => P(`| ${id} | ${cell(r.title)} | ${cell(r.ref)} |`));
P('', `Total: ${total} playable items.`, '');
fs.writeFileSync(path.join(dir, 'question_map.md'), out.join('\n'));
console.log('rows', total);
