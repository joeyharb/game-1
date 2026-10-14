/* =============================================================================
 * 90 SCREENS: home, map, mission intro, results. Boot.
 * ========================================================================== */
var BADGE_ICON = { 'site-boss': 'star', 'flawless': 'shield', 'hot-streak': 'flame', 'rule-keeper': 'lock' };
function logoHTML(key, label) {
  var src = (C.logos || {})[key];
  return src ? '<img src="' + esc(src) + '" alt="' + esc(label) + ' logo">' : '<span class="logo-ph" title="Add the official logo in CONTENT.logos">' + esc(label) + '<br>logo</span>';
}

var Screens = {
  /* ---------------- Home ---------------- */
  home: function () {
    run = null; clearScreenTimers(); clearUI(); resetAcronyms();
    setMissionColor(document.body, '#0033A0');
    GFX.setView(makeWorldView({ home: true, top: 0, bottom: 0, zoom: 0.92 }));
    var d = Store.get(), p = d.player, s = d.settings;
    var trackBtn = function (id) { var t = C.tracks[id]; return '<button class="track" type="button" data-track="' + id + '" aria-pressed="' + (d.track === id) + '" style="--tc:' + t.color + '"><span class="tick">' + icon('check', '#fff', 'width="16" height="16"') + '</span><b>' + esc(t.short) + '</b><span class="small">' + fmt(t.blurb, false) + '</span><span class="small">Endorsed by the ' + esc(t.cluster) + '</span></button>'; };
    ui().innerHTML = '<div class="home">' +
      '<div class="home-top"><div class="logo-slot">' + logoHTML('iom', 'IOM') + '</div><button class="icon-btn" id="h-mute" aria-label="' + (s.muted ? 'Sound on' : 'Sound off') + '">' + icon(s.muted ? 'mute' : 'sound') + '</button></div>' +
      '<div class="home-hero"><h1>' + esc(C.meta.title) + '</h1><p>' + fmt(C.meta.subtitle, true) + '</p>' +
      '<p class="small" style="opacity:.95">You are the field focal point of <b>' + esc(C.ngo.name) + '</b>, a fictional NGO joining the pipeline. Learn by doing. It is not a test.</p></div>' +
      '<div class="home-panel">' +
        '<section class="card"><h2>About you</h2><p class="small muted">Printed on your completion card and in the results file you can send to the CP team.</p>' +
          '<label class="field"><span>Your name</span><input id="f-name" maxlength="60" autocomplete="name" value="' + esc(p.name) + '" placeholder="Type your name"></label>' +
          '<label class="field"><span>Your organisation</span><input id="f-org" maxlength="80" autocomplete="organization" value="' + esc(p.org) + '" placeholder="Organisation name"></label>' +
          '<label class="field"><span>State where you work</span><select id="f-state"><option value="">Choose a state</option>' + C.states.map(function (x) { return '<option' + (p.state === x ? ' selected' : '') + '>' + esc(x) + '</option>'; }).join('') + '</select></label>' +
          '<div class="field"><span>Your track</span><div class="tracks">' + trackBtn('SNFI') + trackBtn('WASH') + '</div></div>' +
        '</section>' +
        '<section class="card"><h2>Settings</h2>' +
          (GFX.mode === 'webgl' ? '<div class="settings-row"><span><b>Graphics</b><br><span class="small muted">Low is smoother on phones</span></span><span class="seg" role="group" aria-label="Graphics"><button type="button" data-q="high" aria-pressed="' + (GFX.quality === 'high') + '">High</button><button type="button" data-q="low" aria-pressed="' + (GFX.quality === 'low') + '">Low</button></span></div>'
            : '<div class="settings-row"><span><b>Graphics</b><br><span class="small muted">Simple 2D mode: this device has no 3D support.</span></span></div>') +
          '<div class="settings-row"><span><b>Relaxed pace</b><br><span class="small muted">More time in the busy parts</span></span><button class="toggle" type="button" id="t-relax" aria-label="Relaxed pace" aria-pressed="' + !!s.relaxed + '"></button></div>' +
          '<div class="settings-row"><span><b>Sound</b></span><button class="toggle" type="button" id="t-sound" aria-label="Sound" aria-pressed="' + !s.muted + '"></button></div>' +
          '<div class="hint" id="h-hint" role="alert"></div>' +
          '<button class="btn big" id="h-start" style="width:100%;margin-top:6px">' + (Object.keys(d.missions).length ? 'Continue the journey' : 'Start the journey') + '</button>' +
          (Store.available() ? '' : '<p class="small" style="color:var(--warn);margin-top:8px">This browser blocks saving. You can still play; progress is forgotten when you close the page.</p>') +
          '<p class="small muted" style="margin-top:10px">' + esc(C.meta.sourceNote) + '</p>' +
        '</section>' +
      '</div></div>';
    var save = function () { p.name = $('#f-name').value.trim(); p.org = $('#f-org').value.trim(); p.state = $('#f-state').value; Store.save(); };
    ['#f-name', '#f-org', '#f-state'].forEach(function (k) { $(k).addEventListener('input', save); $(k).addEventListener('change', save); });
    $$('.track').forEach(function (b) { b.onclick = function () { d.track = b.getAttribute('data-track'); Store.save(); Sound.tap(); $$('.track').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); }); }; });
    $$('.seg button').forEach(function (b) { b.onclick = function () { GFX.setQuality(b.getAttribute('data-q')); $$('.seg button').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); }); }; });
    $('#t-relax').onclick = function () { s.relaxed = !s.relaxed; Store.save(); this.setAttribute('aria-pressed', String(s.relaxed)); };
    $('#t-sound').onclick = function () { s.muted = !s.muted; Store.save(); this.setAttribute('aria-pressed', String(!s.muted)); if (!s.muted) Sound.good(); };
    $('#h-mute').onclick = function () { s.muted = !s.muted; Store.save(); Screens.home(); };
    $('#h-start').onclick = function () {
      save();
      var miss = [];
      if (!p.name) miss.push('your name'); if (!p.org) miss.push('your organisation'); if (!p.state) miss.push('your state'); if (!d.track) miss.push('a track');
      if (miss.length) { $('#h-hint').textContent = 'Please add ' + miss.join(', ') + '.'; Sound.bad(); return; }
      Sound.good(); Screens.map();
    };
  },

  /* ---------------- Map ---------------- */
  map: function () {
    run = null; clearScreenTimers(); clearUI(); resetAcronyms();
    setMissionColor(document.body, '#0033A0');
    var d = Store.get(), t = track();
    var stars = 0; Object.keys(d.missions).forEach(function (k) { var m = d.missions[k]; if (m && m.best) stars += m.best.stars; });
    var next = null; C.missions.forEach(function (M, i) { if (!next && isUnlocked(i) && !(d.missions[M.id] && d.missions[M.id].completed)) next = M; });
    if (!next) C.missions.forEach(function (M, i) { if (!next && isUnlocked(i)) next = M; });
    ui().innerHTML = '<div class="topbar"><button class="icon-btn" id="m-home" aria-label="Home and settings">' + icon('map') + '</button>' +
      '<span class="pill grow" style="min-width:0;overflow:hidden;white-space:nowrap;text-overflow:ellipsis">Your journey · ' + esc(t.short) + '</span>' +
      '<span class="pill">' + icon('star', 'var(--gold)') + stars + '/' + (C.missions.length * 3) + '</span></div>' +
      '<div class="dock" id="dock"><div class="dock-inner"><div id="m-sel"></div>' +
        '<p class="small muted" style="margin:8px 0 0">Prototype: Mission 6 is playable. The other missions arrive in the full build.</p>' +
        '<div class="row" style="margin-top:6px"><button class="btn sm alt" id="m-rules">Critical rules</button><button class="btn sm alt" id="m-reset" style="color:var(--bad);box-shadow:inset 0 0 0 2px var(--bad)">Reset progress</button></div>' +
      '</div></div>';
    var stopBtns = {};
    function showSel(M) {
      var i = missionIndex(M.id), open = isUnlocked(i), rec = d.missions[M.id] || {};
      Object.keys(stopBtns).forEach(function (k) { stopBtns[k].classList.toggle('sel', k === M.id); });
      $('#m-sel').innerHTML = '<div class="row"><div class="grow" style="min-width:0"><div class="small muted">' + (M === next ? 'Next stop' : 'Stop ' + M.number) + ' · ' + esc(M.place) + ' · ' + esc(M.topic) + '</div>' +
        '<b style="font-size:19px">Mission ' + M.number + ': ' + esc(M.title) + '</b>' + (rec.best ? ' ' + starsHTML(rec.best.stars) : '') + '</div>' +
        (open ? '<button class="btn big mc" id="m-play" style="--mc:' + M.color + ';--mc-text:' + textOn(M.color) + '">' + (rec.completed ? 'Replay' : 'Play') + '</button>'
              : '<span class="chip">' + icon('lock', 'currentColor', 'width="16" height="16"') + (M.playable === false ? ' Full build' : ' Locked') + '</span>') + '</div>';
      if (open) $('#m-play').onclick = function () { Screens.intro(M.id); };
      GFX.refit();
    }
    var v = makeWorldView({ top: 66, bottom: function () { var k = $('#dock'); return k ? k.offsetHeight + 6 : 20; } });
    GFX.setView(v);
    v.layout.stops.forEach(function (s, i) {
      var M = s.m, open = isUnlocked(i), rec = d.missions[M.id] || {};
      var b = el('<button class="mapstop' + (open ? '' : ' locked') + '" type="button" style="--sc:' + M.color + '" aria-label="Mission ' + M.number + ': ' + esc(M.title) + (open ? '' : ' (locked)') + '">' +
        '<span class="n">' + (open ? (rec.completed ? '&#10003; ' : '') + M.number : '&#128274; ' + M.number) + '</span><span class="t">' + esc(M.title) + '</span>' + starsHTML(rec.best ? rec.best.stars : 0) + '</button>');
      b.onclick = function () { Sound.tap(); showSel(M); };
      stopBtns[M.id] = b;
      GFX.addLabel(b, function () { return [s.x, 2.6, s.z]; });
    });
    showSel(next || C.missions[0]);
    $('#m-home').onclick = Screens.home;
    $('#m-rules').onclick = showRules;
    $('#m-reset').onclick = function () { confirmModal('Reset progress?', 'This clears scores, stars, badges and unlocks on this device. Your name, organisation, state and track are kept.', 'Reset', function () { Store.reset(); Screens.map(); }); };
  },

  /* ---------------- Mission intro ---------------- */
  intro: function (id) {
    var M = missionById(id); if (!M) return Screens.map();
    resetAcronyms(); setMissionColor(document.body, M.color);
    var back = function () { closeModal(); };
    openModal('<div class="modal-head mc"><h2>Mission ' + M.number + ': ' + esc(M.title) + '</h2></div><div class="modal-body">' +
      sayHTML(M.host || 'mabior', fmt(M.intro, true)) +
      '<ol style="margin:12px 0 6px;padding-left:22px">' + (M.howTo || []).map(function (h) { return '<li>' + fmt(h, true) + '</li>'; }).join('') + '</ol>' +
      '<div class="row" style="margin:8px 0">' + heartsHTML(S.livesPerMission, S.livesPerMission) + '<span class="chip">' + esc(track().short) + ' track</span>' + (Store.get().settings.relaxed ? '<span class="chip">Relaxed pace</span>' : '') + '</div>' +
      ((M.rulesInPlay || []).length ? '<p class="small"><b>Critical rules in play</b> (breaking one stops the mission): ' + M.rulesInPlay.map(function (r) { return esc(C.criticalRules[r].title); }).join(' · ') + '</p>' : '') +
      '<div class="actions"><button class="btn alt" id="i-back">Back</button><button class="btn mc big" id="i-go">Start</button></div></div>', { onEscape: back });
    $('#i-back').onclick = back;
    $('#i-go').onclick = function () { closeModal(); Sound.unlock(); startMission(M.id); };
  },

  /* ---------------- Results ---------------- */
  results: function (rec, newBest, newBadges, newUnlocks) {
    var M = missionById(rec.mission), done = rec.status === 'completed';
    clearUI(); setMissionColor(document.body, M.color);
    var title = done ? 'Mission complete!' : (rec.status === 'critical' ? 'Stopped by a critical rule' : 'Out of lives');
    var line = done ? (rec.stars === 3 ? 'Outstanding. A fair, safe and free distribution.' : 'Well done. Check the topics below, then try for three stars.')
                    : (rec.status === 'critical' ? 'That rule protects people and the pipeline. Read it once more, then go again.' : 'Three slips and the day stops. Review the topics below and try again.');
    var weak = groupRefs(rec.mistakes);
    ui().innerHTML = '<div class="page"><section class="card" style="text-align:center">' +
      '<h2 style="font-size:30px">' + esc(title) + '</h2>' +
      (done ? '<div class="big-stars">' + [0, 1, 2].map(function (i) { return '<span class="' + (i < rec.stars ? 'on' : '') + '">' + icon('star', i < rec.stars ? 'var(--gold)' : '#D5DDEB') + '</span>'; }).join('') + '</div>' : '') +
      '<div class="stats"><div class="stat"><b>' + fmtNum(rec.score) + '</b><span>Points' + (newBest ? ' · new best!' : '') + '</span></div>' +
      '<div class="stat"><b>' + rec.correct + '/' + rec.total + '</b><span>Right moves</span></div>' +
      '<div class="stat"><b>' + pct(rec.accuracy) + '</b><span>Accuracy</span></div>' +
      '<div class="stat"><b>' + rec.maxStreak + '</b><span>Best streak</span></div></div>' +
      '<div style="text-align:left;margin-top:12px">' + sayHTML(M.host || 'mabior', esc(line)) + '</div>' +
      (weak.length ? '<div style="text-align:left;margin-top:10px"><h3>Topics to review</h3><ul class="review">' + weak.map(function (w) { return '<li><span class="ref">' + esc(w.ref) + '</span> ' + w.count + ' slip' + (w.count > 1 ? 's' : '') + '</li>'; }).join('') + '</ul></div>' : '<p style="margin-top:10px"><b>No slips.</b> Every move was right.</p>') +
      (newBadges.length ? '<div style="text-align:left"><h3>New badge' + (newBadges.length > 1 ? 's' : '') + '</h3><div class="badges">' + newBadges.map(function (b) { return '<div class="badge new">' + icon(BADGE_ICON[b.id] || 'star', 'var(--blue)') + '<b>' + esc(b.title) + '</b>' + esc(b.desc) + '</div>'; }).join('') + '</div></div>' : '') +
      (newUnlocks.length ? '<div style="text-align:left;margin-top:10px"><h3>Unlocked</h3>' + newUnlocks.map(function (u) { return '<div class="row" style="margin-bottom:6px">' + (u.kind === 'truckColor' ? '<span style="width:28px;height:28px;border-radius:8px;background:' + u.value + ';display:inline-block"></span>' : icon('banner', C.ngo.color, 'width="28" height="28"')) + '<b class="grow">' + esc(u.label) + '</b>' + (u.kind === 'truckColor' ? '<button class="btn sm" data-equip="' + u.value + '">Use it</button>' : '<span class="small muted">On your compound</span>') + '</div>'; }).join('') + '</div>' : '') +
      '<div class="actions" style="justify-content:center"><button class="btn alt" id="r-map">Map</button><button class="btn mc big" id="r-again">' + (done ? 'Play again' : 'Try again') + '</button></div>' +
      '</section></div>';
    if (done) { Sound.fanfare(); confetti(); }
    $$('[data-equip]').forEach(function (b) { b.onclick = function () { Store.get().truckColor = b.getAttribute('data-equip'); Store.save(); b.textContent = 'In use'; b.disabled = true; }; });
    $('#r-map').onclick = Screens.map;
    $('#r-again').onclick = function () { startMission(M.id); };
    var w = makeWorldView({ top: 0, bottom: 0 }); GFX.setView(w);
  }
};

function showRules() {
  resetAcronyms();
  openModal('<div class="modal-head bad">' + icon('lock', '#fff', 'width="26" height="26"') + '<h2>Critical rules</h2></div><div class="modal-body"><p>Breaking one stops the mission at once.</p>' +
    Object.keys(C.criticalRules).map(function (k) { var r = C.criticalRules[k]; return '<div class="rule-box" style="background:#F6F8FD;border-left-color:var(--blue)"><b>' + fmt(r.title, true) + '</b><p style="margin:.3em 0">' + fmt(r.rule, true) + '</p><span class="ref">' + esc(r.ref) + '</span></div>'; }).join('') +
    '<div class="actions"><button class="btn" id="r-ok">Got it</button></div></div>', { onEscape: closeModal });
  $('#r-ok').onclick = closeModal;
}

/* ---------------- Boot ---------------- */
document.addEventListener('pointerdown', function () { Sound.unlock(); }, { once: true });
GFX.init();
Screens.home();

/* Read-only hook for automated play-testing (no effect on players). */
window.LMH = { store: function () { return Store.get(); }, run: function () { return run; }, fps: function () { return GFX.fps; }, stats: function () { return GFX.stats(); },
  mode: function () { return GFX.mode; }, quality: function () { return GFX.quality; }, screens: Screens, start: startMission, gfx: GFX };
