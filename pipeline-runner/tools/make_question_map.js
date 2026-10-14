// Regenerates question_map.md from content.js.
// Usage (from the pipeline-runner folder): node tools/make_question_map.js .
const path = require('path'), fs = require('fs');
const dir = path.resolve(process.argv[2]);
global.window = {}; require(path.join(dir, 'content.js'));
const C = window.GAME_CONTENT;
const cell = s => String(s).replace(/\|/g, '/').replace(/\s+/g, ' ').trim();
const typeName = { order: 'Order (drag and drop)', choice: 'Choice', match: 'Match', spot: 'Spot the error' };
let out = [];
out.push('# Question map');
out.push('');
out.push('Every question in `content.js`, its level, and the source it was taken from.');
out.push('"SOP" is the IOM South Sudan Core Pipeline Operations SOP (Draft 1, September 2026). "Budget tool" and sheet names refer to CP Budget Tool v2 (October 2026). Both files are in `../source/`.');
out.push('');
out.push('This file is generated from `content.js`. After editing questions, regenerate it with `node tools/make_question_map.js .` (needs Node.js), or edit the rows by hand.');
out.push('');
let total = 0;
for (const L of C.levels) {
  out.push(`## Level ${L.number}: ${L.title}`);
  out.push('');
  if (L.questions) {
    const multi = L.questions.length;
    out.push(`${multi} questions in the pool, ${L.questionsPerRun} drawn at random per run${L.questions.some(q => q.always) ? ' (questions marked "always" appear every run)' : ''}.`);
    out.push('');
    out.push('| ID | Type | Question | Source |');
    out.push('|---|---|---|---|');
    for (const q of L.questions) {
      let t = typeName[q.type] + (q.multi ? ', several answers' : '');
      let crit = [];
      (q.options || []).forEach(o => o.critical && crit.push(o.critical));
      ((q.doc && q.doc.fields) || []).forEach(f => f.critical && crit.push(f.critical));
      out.push(`| ${q.id}${q.always ? ' (always)' : ''} | ${t}${crit.length ? '; critical ' + [...new Set(crit)].join(', ') : ''} | ${cell(q.prompt)} | ${cell(q.ref)} |`);
      total++;
    }
  } else {
    out.push(`${L.scenarios.length} branching scenarios; one is picked at random per run.`);
    out.push('');
    out.push('| ID | Scenario | Decision | Source |');
    out.push('|---|---|---|---|');
    for (const sc of L.scenarios) for (const [nid, n] of Object.entries(sc.nodes)) {
      const crit = [...new Set(n.options.filter(o => o.critical).map(o => o.critical))];
      out.push(`| ${sc.id}/${nid} | ${cell(sc.title)} | ${cell(n.text)}${crit.length ? ' (critical ' + crit.join(', ') + ')' : ''} | ${cell(n.ref)} |`);
      total++;
    }
  }
  out.push('');
}
out.push('## Critical rules');
out.push('');
out.push('| ID | Rule | Source |');
out.push('|---|---|---|');
for (const [id, r] of Object.entries(C.criticalRules)) out.push(`| ${id} | ${cell(r.title)} | ${cell(r.ref)} |`);
out.push('');
out.push(`Total: ${total} questions and decisions.`);
out.push('');
fs.writeFileSync(path.join(dir, 'question_map.md'), out.join('\n'));
console.log('rows', total);
