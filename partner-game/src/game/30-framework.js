/* =============================================================================
 * 30 MISSION FRAMEWORK: run state, HUD, scoring, lives, critical rules, pause,
 * results, badges and unlocks. Missions talk to it through `ctx`.
 * ========================================================================== */
var Missions = {};       // mission id -> { start(M, ctx) }
var run = null;

function ui() { return $('#ui'); }
function clearUI() { ui().innerHTML = ''; $('#toasts').innerHTML = ''; $('#fx').innerHTML = ''; closeModal(); }

function startMission(id) {
  var M = missionById(id);
  if (!M || !Missions[id]) return Screens.map();
  clearScreenTimers(); clearUI(); resetAcronyms();
  run = { M: M, lives: S.livesPerMission, livesLost: 0, score: 0, streak: 0, maxStreak: 0, correct: 0, total: 0,
          mistakes: [], critical: null, startedAt: new Date().toISOString(), ended: false, paused: false, phase: '', timeLeft: null, debug: {} };
  setMissionColor(document.body, M.color);
  ui().innerHTML = '<div class="topbar" id="hud"></div><div class="phasebar hidden" id="phasebar"></div><div class="dock" id="dock"></div>';
  renderHUD();
  Missions[id].start(M, ctx);
}

function renderHUD() {
  if (!run) return; var hud = $('#hud'); if (!hud) return;
  var M = run.M, muted = Store.get().settings.muted;
  hud.innerHTML =
    '<button class="icon-btn" id="pause-btn" aria-label="Pause">' + icon('pause') + '</button>' +
    '<span class="pill hud-title grow">M' + M.number + '<span class="t">&nbsp;' + esc(M.title) + '</span></span>' +
    (run.timeLeft != null ? '<span class="pill timer" aria-label="Time left">' + Math.max(0, Math.ceil(run.timeLeft)) + 's</span>' : '') +
    '<span class="pill">' + heartsHTML(run.lives, S.livesPerMission) + '</span>' +
    '<span class="pill streak' + (run.streak > 1 ? '' : ' off') + '" aria-label="Streak">' + icon('flame') + run.streak + '</span>' +
    '<span class="pill score" aria-label="Score">' + fmtNum(run.score) + '</span>' +
    '<button class="icon-btn" id="mute-btn" aria-label="' + (muted ? 'Sound on' : 'Sound off') + '">' + icon(muted ? 'mute' : 'sound') + '</button>';
  $('#pause-btn').onclick = pauseMenu;
  $('#mute-btn').onclick = function () { var s = Store.get().settings; s.muted = !s.muted; Store.save(); renderHUD(); };
}
var hudTimerShown = null;
function setTimer(sec) { if (!run) return; run.timeLeft = sec; var v = sec == null ? null : Math.ceil(sec); if (v !== hudTimerShown) { hudTimerShown = v; renderHUD(); } }

function pauseMenu() {
  if (!run || run.ended || modalOpen()) return;
  run.paused = true;
  var resume = function () { closeModal(); run.paused = false; };
  openModal('<div class="modal-head mc"><h2>Paused</h2></div><div class="modal-body">' +
    '<p class="muted small">' + esc(run.M.title) + ': ' + esc(run.phase || '') + '</p>' +
    '<div class="actions" style="justify-content:stretch;flex-direction:column">' +
    '<button class="btn mc big" id="p-resume">Resume</button>' +
    '<button class="btn alt" id="p-sound">' + (Store.get().settings.muted ? 'Sound: off' : 'Sound: on') + '</button>' +
    '<button class="btn alt" id="p-restart">Restart mission</button>' +
    '<button class="btn alt" id="p-map">Back to the map</button></div></div>', { onEscape: resume });
  $('#p-resume').onclick = resume;
  $('#p-sound').onclick = function () { var st = Store.get().settings; st.muted = !st.muted; Store.save(); this.textContent = st.muted ? 'Sound: off' : 'Sound: on'; renderHUD(); };
  $('#p-restart').onclick = function () { closeModal(); startMission(run.M.id); };
  $('#p-map').onclick = function () { closeModal(); run = null; Screens.map(); };
}
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape' && !e.defaultPrevented && run && !run.ended && !modalOpen() && !run.blocking) pauseMenu();
});
document.addEventListener('visibilitychange', function () { if (document.hidden && run && !run.ended && !modalOpen() && !run.blocking) pauseMenu(); });

/* The context missions use. */
var ctx = {
  get run() { return run; },
  get busy() { return !run || run.ended || run.paused || modalOpen() || !!run.blocking; },
  dock: function () { return $('#dock'); },
  phase: function (text) { if (!run) return; run.phase = text; var b = $('#phasebar'); if (!b) return; b.textContent = text; b.classList.toggle('hidden', !text); },
  timer: setTimer,
  /* answer({ correct, id, ref, why, title, critical, costLife, at:{x,y}, focus:[x,y,z], points })
   * Right: points, streak, short toast. Wrong: streak reset, feedback with source,
   * and a life lost unless costLife === false. Critical: consequence scene, mission ends. */
  answer: function (o) {
    if (!run || run.ended) return;
    run.total++;
    var at = o.at || { x: GFX.W / 2, y: GFX.H * 0.4 };
    if (o.correct) {
      run.correct++; run.streak++; run.maxStreak = Math.max(run.maxStreak, run.streak);
      var gained = (o.points || S.pointsPerCorrect) + Math.min(S.streakBonus * (run.streak - 1), S.streakBonusMax);
      run.score += gained; renderHUD(); Sound.good(); burst(at.x, at.y); floater(at.x, at.y, '+' + gained);
      if (!o.silent) toast('<b>' + icon('check', 'var(--ok)', 'width="16" height="16" style="vertical-align:-3px"') + ' ' + esc(o.title || 'Right') + '.</b> ' + (o.why ? fmt(o.why, true) : '') + refChip(o.ref), '', 3000);
      return;
    }
    run.streak = 0;
    run.mistakes.push({ id: o.id || '', ref: o.ref || '' });
    if (o.critical) { run.critical = o.critical; renderHUD(); return criticalScene(o); }
    Sound.bad(); floater(at.x, at.y, o.costLife === false ? 'Oops' : '-1', true);
    if (o.costLife !== false) {
      run.lives--; run.livesLost++; renderHUD();
      var hearts = $$('#hud [data-heart]'); if (hearts[run.lives]) hearts[run.lives].classList.add('heart-lost');
      if (!reduceMotion) { var h = $('#hud'); h.classList.remove('shake'); void h.offsetWidth; h.classList.add('shake'); }
    } else renderHUD();
    toast('<b>' + icon('cross', 'var(--bad)', 'width="16" height="16" style="vertical-align:-3px"') + ' ' + esc(o.title || 'Not quite') + '.</b> ' + fmt(o.why || '', true) + refChip(o.ref), 'bad', 4600);
    if (run.lives <= 0) {
      run.blocking = true;
      later(function () { endMission('out'); }, 1300);
    }
  },
  /* Points that do not count as a move (e.g. a clean drive past a pothole). */
  bonus: function (points, at) { if (!run || run.ended) return; run.score += points; renderHUD(); if (at) floater(at.x, at.y, '+' + points); Sound.pop(); },
  finish: function () { if (run && !run.ended) endMission('completed'); },
  onCritical: null       // mission may set a function(focus) to animate its camera
};

/* ---------- Critical rule: short consequence scene, then a clear explanation ---------- */
function criticalScene(o) {
  run.ended = true; run.blocking = true;
  var rule = C.criticalRules[o.critical] || { title: 'Critical rule', rule: '', scene: '', ref: '' };
  Sound.stamp(); later(Sound.alarm, 300);
  if (ctx.onCritical) { try { ctx.onCritical(o.focus); } catch (e) { console.error(e); } }
  var veil = el('<div class="crit-veil"></div>'), stamp = el('<div class="crit-stamp">STOP<small>' + esc(rule.title) + '</small></div>');
  document.body.appendChild(veil); document.body.appendChild(stamp);
  later(function () {
    veil.remove(); stamp.remove();
    var map = function () { closeModal(); endMission('critical'); };
    openModal('<div class="modal-head bad">' + icon('lock', '#fff', 'width="28" height="28"') + '<h2>Critical rule broken</h2></div><div class="modal-body">' +
      '<p><b>' + esc(rule.scene) + '</b></p>' +
      '<div class="rule-box"><b>' + fmt(rule.title, true) + '</b><p style="margin:.3em 0 0">' + fmt(rule.rule, true) + '</p></div>' +
      (o.why ? '<p>' + fmt(o.why, true) + '</p>' : '') + '<p><span class="ref">' + esc(o.ref || rule.ref) + '</span></p>' +
      '<div class="actions"><button class="btn" id="crit-ok">See my results</button></div></div>', { onEscape: map });
    $('#crit-ok').onclick = map;
  }, reduceMotion ? 300 : 2100);
}

function starsFor(acc) { var st = S.stars; return acc >= st.three ? 3 : acc >= st.two ? 2 : acc >= st.one ? 1 : 0; }

/* ---------- End of a mission: save, badges, unlocks, results screen ---------- */
function endMission(status) {
  if (!run) return;
  run.ended = true; clearScreenTimers();
  var d = Store.get(), M = run.M, acc = run.total ? run.correct / run.total : 0;
  var rec = { mission: M.id, title: M.title, track: d.track, status: status, critical: run.critical, score: run.score, correct: run.correct, total: run.total,
              accuracy: Math.round(acc * 1000) / 1000, stars: status === 'completed' ? starsFor(acc) : 0, livesLost: run.livesLost, maxStreak: run.maxStreak,
              mistakes: run.mistakes.slice(), relaxed: !!d.settings.relaxed, gfx: GFX.mode === 'webgl' ? GFX.quality : '2d',
              startedAt: run.startedAt, finishedAt: new Date().toISOString(), version: C.meta.version };
  var mr = d.missions[M.id] || { completed: false, best: null, last: null };
  mr.last = rec; var newBest = false;
  if (status === 'completed') {
    mr.completed = true;
    if (!mr.best || rec.score > mr.best.score) { mr.best = { score: rec.score, stars: rec.stars, accuracy: rec.accuracy, track: rec.track, date: rec.finishedAt }; newBest = true; }
    else if (rec.stars > mr.best.stars) mr.best.stars = rec.stars;
    if (rec.livesLost === 0) d.flawless = true;
  }
  if (status === 'critical') d.anyCritical = true;          // tracks ALL attempts, not only the last one
  d.missions[M.id] = mr;
  d.bestStreak = Math.max(d.bestStreak || 0, run.maxStreak);
  var playable = C.missions.filter(isPlayable);
  if (playable.length && playable.every(function (x) { return d.missions[x.id] && d.missions[x.id].completed; })) d.allDoneOnce = true;
  d.attempts.push(rec); if (d.attempts.length > 200) d.attempts = d.attempts.slice(-200);
  var newBadges = updateBadges(), newUnlocks = updateUnlocks();
  Store.save();
  Screens.results(rec, newBest, newBadges, newUnlocks);
}

function ruleMet(rule) {
  var d = Store.get(), parts = String(rule).split(':'), kind = parts[0], arg = parts[1], m = arg ? d.missions[arg] : null;
  var playable = C.missions.filter(isPlayable);
  switch (kind) {
    case 'start': return true;
    case 'missionDone': return !!(m && m.completed);
    case 'stars3': return !!(m && m.best && m.best.stars === 3);
    case 'flawless': return !!d.flawless;
    case 'streak': return (d.bestStreak || 0) >= Number(arg);
    case 'noCritical': return !d.anyCritical && playable.some(function (x) { return d.missions[x.id] && d.missions[x.id].completed; });
    case 'allMissions': return playable.every(function (x) { return d.missions[x.id] && d.missions[x.id].completed; });
  }
  return false;
}
function updateBadges() { var d = Store.get(), fresh = []; C.badges.forEach(function (b) { if (d.badges.indexOf(b.id) < 0 && ruleMet(b.rule)) { d.badges.push(b.id); fresh.push(b); } }); return fresh; }
function updateUnlocks() { var d = Store.get(), fresh = []; (C.unlocks || []).forEach(function (u) { if (d.unlocks.indexOf(u.id) < 0 && ruleMet(u.rule)) { d.unlocks.push(u.id); fresh.push(u); } }); return fresh; }
function groupRefs(mistakes) {
  var m = {}; mistakes.forEach(function (x) { var k = x.ref || 'General'; m[k] = (m[k] || 0) + 1; });
  return Object.keys(m).map(function (k) { return { ref: k, count: m[k] }; }).sort(function (a, b) { return b.count - a.count; });
}
