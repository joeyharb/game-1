/* =============================================================================
 * 85 END OF THE GAME: final report, completion card (printable), CSV export
 * ========================================================================== */

/* Everything the end screens need, read from the saved progress. */
function journeySummary() {
  var d = Store.get(), list = C.missions.filter(isPlayable), mistakes = [], score = 0, stars = 0, done = 0;
  var rows = list.map(function (M) {
    var mr = d.missions[M.id] || {}, best = mr.best || null;
    if (mr.completed) done++;
    if (best) { score += best.score; stars += best.stars; }
    // topics to review come from the latest attempt at each mission
    if (mr.last && mr.last.mistakes) mistakes = mistakes.concat(mr.last.mistakes);
    return { M: M, completed: !!mr.completed, score: best ? best.score : 0, stars: best ? best.stars : 0, last: mr.last || null };
  });
  var lastDate = null;
  rows.forEach(function (r) { if (r.last && r.last.finishedAt && (!lastDate || r.last.finishedAt > lastDate)) lastDate = r.last.finishedAt; });
  return { d: d, rows: rows, score: score, stars: stars, maxStars: rows.length * 3, done: done, all: rows.length > 0 && done === rows.length,
           topics: groupRefs(mistakes), date: lastDate ? new Date(lastDate) : new Date() };
}
function longDate(dt) { try { return dt.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }); } catch (e) { return dt.toISOString().slice(0, 10); } }
function isoDate(dt) { var p = function (n) { return (n < 10 ? '0' : '') + n; }; return dt.getFullYear() + '-' + p(dt.getMonth() + 1) + '-' + p(dt.getDate()); }

/* ---------------- Final report screen ---------------- */
function finalReport() {
  run = null; clearScreenTimers(); clearUI(); resetAcronyms();
  setMissionColor(document.body, '#0033A0');
  var J = journeySummary(), p = J.d.player, t = track();
  ui().innerHTML = '<div class="page"><section class="card">' +
    '<h2 style="font-size:28px;margin-bottom:2px">' + (J.all ? 'Journey complete!' : 'Your journey so far') + '</h2>' +
    '<p class="muted" style="margin-top:0">' + esc(p.name || 'Player') + ' · ' + esc(p.org || '') + ' · ' + esc(t.short) + ' track</p>' +
    '<div class="stats"><div class="stat"><b>' + fmtNum(J.score) + '</b><span>Points (best runs)</span></div>' +
      '<div class="stat"><b>' + J.stars + '/' + J.maxStars + '</b><span>Stars</span></div>' +
      '<div class="stat"><b>' + J.done + '/' + J.rows.length + '</b><span>Missions done</span></div></div>' +
    '<h3 style="margin-top:14px">Stars per mission</h3><table class="mtable"><tbody>' +
      J.rows.map(function (r) { return '<tr><td class="n" style="--mc:' + r.M.color + '">' + r.M.number + '</td><td>' + esc(r.M.title) + '</td><td class="s">' + (r.completed ? starsHTML(r.stars) : '<span class="small muted">' + (r.last ? 'Not finished yet' : 'Not played yet') + '</span>') + '</td><td class="p">' + (r.completed ? fmtNum(r.score) : '') + '</td></tr>'; }).join('') +
    '</tbody></table>' +
    '<h3 style="margin-top:14px">Topics to review</h3>' +
      (J.topics.length ? '<p class="small muted" style="margin-top:0">From your latest try at each mission, by source section.</p><ul class="review">' + J.topics.map(function (w) { return '<li><span class="ref">' + esc(w.ref) + '</span> ' + w.count + ' slip' + (w.count > 1 ? 's' : '') + '</li>'; }).join('') + '</ul>'
                      : '<p><b>Nothing to review.</b> Your latest tries had no slips.</p>') +
    '<h3 style="margin-top:14px">Badges</h3><div class="badges">' +
      C.badges.map(function (b) { var on = J.d.badges.indexOf(b.id) >= 0; return '<div class="badge' + (on ? '' : ' off') + '">' + icon(BADGE_ICON[b.id] || 'star', on ? 'var(--blue)' : '#C5CEDD') + '<b>' + esc(b.title) + '</b>' + esc(b.desc) + '</div>'; }).join('') + '</div>' +
    '<div class="actions" style="justify-content:center;margin-top:16px;flex-wrap:wrap">' +
      '<button class="btn alt" id="f-map">Map</button>' +
      '<button class="btn alt" id="f-csv">Download results (CSV)</button>' +
      '<button class="btn big" id="f-card"' + (J.all ? '' : ' disabled') + '>Completion card</button></div>' +
    (J.all ? '' : '<p class="small muted" style="text-align:center">Finish all ' + J.rows.length + ' missions to get your completion card.</p>') +
    '</section></div>';
  if (J.all) { Sound.fanfare(); confetti(); }
  $('#f-map').onclick = Screens.map;
  $('#f-csv').onclick = exportCSV;
  $('#f-card').onclick = function () { if (J.all) completionCard(); };
  GFX.setView(makeWorldView({ top: 0, bottom: 0 }));
}

/* ---------------- Completion card ---------------- */
function cardHTML(J) {
  var p = J.d.player, t = track(), trk = J.d.track === 'WASH' ? 'WASH' : 'SNFI';
  var dark = function (key, label) { var src = (C.logos || {})[key]; return src ? '<img src="' + esc(src) + '" alt="' + esc(label) + ' logo">' : '<span class="logo-ph dark" title="Add the official logo in CONTENT.logos">' + esc(label) + '<br>logo</span>'; };
  return '<div class="cert">' +
    '<div class="cert-logos">' + dark('iom', 'IOM') + dark(trk === 'WASH' ? 'wash' : 'slsc', t.cluster) + '</div>' +
    '<div class="cert-kicker">' + esc(C.meta.title) + ' · Completion card</div>' +
    '<div class="cert-name">' + esc(p.name || '') + '</div>' +
    '<div class="cert-org">' + esc(p.org || '') + ' · ' + esc(p.state || '') + '</div>' +
    '<p class="cert-text">completed the partner onboarding game for the IOM South Sudan Core Pipeline, <b>' + esc(t.short) + ' track</b>.</p>' +
    '<div class="cert-stats"><div><b>' + fmtNum(J.score) + '</b><span>Points</span></div><div><b>' + J.stars + '/' + J.maxStars + '</b><span>Stars</span></div><div><b>' + esc(longDate(J.date)) + '</b><span>Date</span></div></div>' +
    '<div class="cert-missions">' + J.rows.map(function (r) { return '<div><span>' + r.M.number + '. ' + esc(r.M.title) + '</span>' + starsHTML(r.stars) + '</div>'; }).join('') + '</div>' +
    '<div class="cert-note">' + esc(C.meta.cardNote) + '</div>' +
    '<div class="cert-foot">Game version ' + esc(C.meta.version) + '</div>' +
  '</div>';
}
function completionCard() {
  var J = journeySummary();
  openModal('<div class="modal-head mc"><h2>Your completion card</h2></div><div class="modal-body">' + cardHTML(J) +
    '<div class="actions"><button class="btn alt" id="c-close">Close</button><button class="btn big" id="c-print">Print or save as PDF</button></div></div>', { onEscape: closeModal });
  $('#c-close').onclick = closeModal;
  $('#c-print').onclick = function () {
    var pc = $('#print-card'); pc.innerHTML = cardHTML(J);
    try { window.print(); } catch (e) { toast('Printing is not available here. Take a screenshot of the card instead.', 'info', 4000); }
  };
}

/* ---------------- CSV export ---------------- */
function csvCell(v) {
  var s = String(v == null ? '' : v);
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;                  // a spreadsheet must not run it as a formula
  return /[",\r\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}
function resultsCSV() {
  var J = journeySummary(), p = J.d.player, t = track();
  var head = ['Name', 'Organisation', 'State', 'Track', 'Date', 'Total score', 'Total stars', 'Missions completed'];
  var row = [p.name, p.org, p.state, t.short, isoDate(J.date), J.score, J.stars, J.done + '/' + J.rows.length];
  J.rows.forEach(function (r) { head.push('M' + r.M.number + ' ' + r.M.title + ' stars', 'M' + r.M.number + ' score'); row.push(r.completed ? r.stars : '', r.completed ? r.score : ''); });
  head.push('Game version'); row.push(C.meta.version);
  return '﻿' + head.map(csvCell).join(',') + '\r\n' + row.map(csvCell).join(',') + '\r\n';
}
function exportCSV() {
  var csv = resultsCSV(), p = Store.get().player;
  var name = 'LastMileHeroes_' + String(p.name || 'player').replace(/[^A-Za-z0-9]+/g, '-').replace(/^-|-$/g, '') + '_' + isoDate(new Date()) + '.csv';
  try {
    var url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    var a = el('<a download="' + esc(name) + '" href="' + url + '" style="display:none">csv</a>');
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
    toast('<b>Saved.</b> Look for ' + esc(name) + ' in your downloads, then send it to the CP team.', '', 4200);
  } catch (e) {
    openModal('<div class="modal-head mc"><h2>Your results</h2></div><div class="modal-body"><p>Download is blocked here. Copy this text and send it to the CP team.</p>' +
      '<textarea readonly style="width:100%;height:140px;font:13px monospace">' + esc(csv.replace('﻿', '')) + '</textarea><div class="actions"><button class="btn" id="x-ok">Close</button></div></div>', { onEscape: closeModal });
    $('#x-ok').onclick = closeModal;
  }
}
