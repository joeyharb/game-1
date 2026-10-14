/* =============================================================================
 * MISSION 7: REPORT BACK  (SOP §4.7, §4.8, §4.2.3) + the final emergency
 * The calendar runs to your track's deadline: tap the right pieces into the
 * report before it gets there. Answer the calls, then lead one last emergency
 * where every critical rule is in play.
 * ========================================================================== */
Missions.M7 = { start: function (M, ctx) {
  var T = track(), trk = Store.get().track || 'SNFI', R = M.report, pf = pace();
  var B = { minX: -6.2, maxX: 6.2, minZ: -4, maxZ: 3.4, maxY: 2.8 };
  var v = Kit.view({ bounds: B, elev: 48 });
  var DESK = [0, -1.2], CAL = [-3.2, 2.0, -3.4], PHONE = [-1.55, -0.95], LUAL = [3.6, -0.2], NYA = [-3.8, 0.6];
  var good = R.pieces.filter(function (p) { return p.good; }), bad = shuffle(R.pieces.filter(function (p) { return !p.good; })).slice(0, R.badPerRun || 2);
  var pieces = shuffle(good.concat(bad)).map(function (p) { return { p: p, used: false }; });
  var F = pick(M.finales);
  var st = { phase: 'intro', t: 0, dur: (R.seconds || 24) * pf, days: T.reportDays || 15, inReport: 0, need: good.length, called: false, ring: 0, sent: false };

  /* ---------- scene: your office ---------- */
  var sheets = [], phone = null;
  if (v.gl) {
    var P = [];
    P.push(M3.part(M3.G.plane(60, 40), '#B9D27F', [0, 0, 0]));
    P.push(M3.part(M3.G.box(12.4, 0.04, 7.6), '#D9C3A0', [0, 0.02, -0.3]));
    P.push(M3.part(M3.G.box(12.4, 3.0, 0.2), '#F7F3EA', [0, 1.5, -4.1])); P.push(M3.part(M3.G.box(0.2, 3.0, 7.6), '#EFE8DA', [-6.2, 1.5, -0.3]));
    P.push(M3.part(M3.G.box(12.4, 0.3, 0.22), C.ngo.color, [0, 2.9, -4.1]));
    P.push(M3.part(M3.G.box(2.4, 1.2, 0.05), '#9FD3F2', [2.6, 1.7, -3.98])); P.push(M3.part(M3.G.box(2.5, 0.08, 0.1), '#8B5E34', [2.6, 1.08, -3.95]));
    // wall calendar: a white sheet with a red header and day squares
    P.push(M3.part(M3.G.box(1.8, 1.6, 0.05), '#FFFFFF', [CAL[0], CAL[1], -3.97])); P.push(M3.part(M3.G.box(1.8, 0.35, 0.06), '#E5484D', [CAL[0], CAL[1] + 0.62, -3.96]));
    for (var cy = 0; cy < 3; cy++) for (var cx = 0; cx < 5; cx++) P.push(M3.part(M3.G.box(0.24, 0.2, 0.06), '#DDE3EC', [CAL[0] - 0.6 + cx * 0.3, CAL[1] + 0.2 - cy * 0.32, -3.95]));
    // desk, laptop, chair, cupboard
    P.push(M3.part(M3.G.box(3.4, 0.1, 1.4), '#C49A6C', [DESK[0], 0.76, DESK[1]]));
    [[-1.55, -0.6], [1.55, -0.6], [-1.55, 0.6], [1.55, 0.6]].forEach(function (o) { P.push(M3.part(M3.G.box(0.09, 0.74, 0.09), '#8B5E34', [DESK[0] + o[0], 0.37, DESK[1] + o[1]])); });
    P.push(M3.part(M3.G.box(0.8, 0.04, 0.55), '#3A4256', [DESK[0] - 0.6, 0.83, DESK[1]])); P.push(M3.part(M3.G.box(0.8, 0.5, 0.04), '#3A4256', [DESK[0] - 0.6, 1.08, DESK[1] - 0.28], [-0.25, 0, 0]));
    P.push(M3.part(M3.G.box(0.7, 0.04, 0.44), '#7FB4E8', [DESK[0] - 0.6, 1.08, DESK[1] - 0.25], [-0.25, 0, 0]));
    P.push(M3.part(M3.G.box(0.8, 0.08, 0.7), '#5B6475', [DESK[0], 0.5, DESK[1] - 1.2])); P.push(M3.part(M3.G.box(0.8, 0.8, 0.08), '#5B6475', [DESK[0], 0.9, DESK[1] - 1.55]));
    P.push(M3.part(M3.G.box(1.6, 2.0, 0.7), '#A07850', [-5.4, 1.0, -2.6])); for (var f = 0; f < 3; f++) P.push(M3.part(M3.G.box(1.3, 0.3, 0.05), track().color, [-5.4, 0.5 + f * 0.6, -2.24]));
    P.push(M3.part(M3.G.box(1.4, 0.04, 1.0), '#F5B301', [DESK[0] + 0.9, 0.81, DESK[1] + 0.05]));            // the report tray
    M3.bush(P, 5.4, -3.4, 0.7);
    v.scene.add(M3.mesh(P, { receive: true }));
    // report sheets appear on the tray as you add pieces
    for (var s = 0; s < good.length; s++) {
      var sh = M3.mesh([M3.part(M3.G.box(0.6, 0.03, 0.8), '#FFFFFF'), M3.part(M3.G.box(0.4, 0.035, 0.06), T.color, [0, 0.002, -0.25])]);
      sh.position.set(DESK[0] + 0.9 + (s % 2 ? 0.05 : -0.05), 0.85 + s * 0.035, DESK[1] + 0.05); sh.rotation.y = (s % 3 - 1) * 0.08; sh.visible = false; v.scene.add(sh); sheets.push(sh);
    }
    phone = M3.mesh([M3.part(M3.G.box(0.22, 0.04, 0.42), '#14213D'), M3.part(M3.G.box(0.18, 0.045, 0.34), '#7FB4E8', [0, 0.003, 0])]);
    phone.position.set(PHONE[0], 0.83, PHONE[1]); v.scene.add(phone);
    [['you', [DESK[0], DESK[1] - 1.05]], ['lual', LUAL], ['nyakuoth', NYA]].forEach(function (c) {
      var L = C.characters[c[0]].look, p = M3.person({ skin: L.skin, shirt: c[0] === 'you' ? (Store.get().truckColor || L.shirt) : L.shirt, hair: L.hair, hairColor: L.hairColor, dress: c[0] === 'nyakuoth' });
      p.position.set(c[1][0], 0, c[1][1]); p.rotation.y = c[0] === 'you' ? 0 : Math.atan2(DESK[0] - c[1][0], DESK[1] - c[1][1]); v.scene.add(p);
    });
  }
  var calTag = Kit.tag('<span id="m7-cal">Day 0 of ' + st.days + '</span>', [CAL[0], CAL[1] + 1.1, CAL[2]], null, 'target');
  Kit.tag('Report · ' + esc(C.meta.mockLabel), function () { return st.phase === 'report' || st.phase === 'call' ? [DESK[0] + 0.9, 1.6, DESK[1]] : null; });

  function scr(x, y, z) { return GFX.project(x, y, z); }

  /* ================= 1. The report race ================= */
  function intro() {
    ctx.phase('Report on time');
    Kit.say('lual', 'Your distribution is done. The <b>' + fmt(T.report) + '</b> is due within <b>' + esc(T.reportDeadline) + '</b>. Tap the right pieces into it before the calendar gets there.',
      Kit.buttons([{ id: 'm7-go', text: 'Start the clock' }]));
    $('#m7-go').onclick = function () { if (ctx.busy) return; st.phase = 'report'; Sound.whoosh(); reportDock(); };
  }
  function reportDock() {
    Kit.say(null, '<div class="row" style="justify-content:space-between"><span class="chip">Report: <b id="m7-n">' + st.inReport + '/' + st.need + '</b></span><span class="small muted">Due within ' + esc(T.reportDeadline) + '</span></div>' +
      '<div class="progress" aria-hidden="true"><div id="m7-prog" style="width:' + Math.round(st.t / st.dur * 100) + '%"></div></div>' +
      '<div class="chips" id="m7-tray" style="margin-top:8px">' + pieces.map(function (it, i) { return '<button class="mchip' + (it.used ? (it.p.good ? ' used' : ' bad') : '') + '" type="button" data-i="' + i + '"' + (it.used ? ' disabled' : '') + '>' + fmt(it.p.text) + '</button>'; }).join('') + '</div>');
    $$('#m7-tray .mchip').forEach(function (b) { b.onclick = function () { take(pieces[Number(b.getAttribute('data-i'))], b); }; });
  }
  function take(it, b) {
    if (st.phase !== 'report' || ctx.busy || it.used) return;
    var r = b.getBoundingClientRect(), at = { x: r.left + r.width / 2, y: r.top };
    it.used = true; b.disabled = true;
    if (it.p.critical) return ctx.answer({ correct: false, critical: it.p.critical, id: it.p.id, ref: it.p.ref, why: it.p.why, at: at, focus: [DESK[0] + 0.9, 1, DESK[1]] });
    if (!it.p.good) { b.classList.add('bad'); return ctx.answer({ correct: false, id: it.p.id, ref: it.p.ref, title: 'Not in the report', why: it.p.why, at: at }); }
    b.classList.add('used');
    if (sheets[st.inReport]) sheets[st.inReport].visible = true;
    st.inReport++;
    var n = $('#m7-n'); if (n) n.textContent = st.inReport + '/' + st.need;
    ctx.answer({ correct: true, id: it.p.id, ref: R.ref, title: 'Added', at: at, silent: true });
    if (st.inReport >= st.need) send(false);
  }
  function send(late) {
    if (st.sent) return;
    st.sent = true; st.phase = 'sent'; ctx.timer(null);
    if (late) ctx.answer({ correct: false, id: 'report-late', ref: R.late.ref, title: 'Late report', why: R.late.why });
    else { ctx.answer({ correct: true, id: 'report', ref: R.onTime.ref, title: 'Report sent on day ' + day(), why: R.onTime.why, at: scr(DESK[0] + 0.9, 1.2, DESK[1]) }); Sound.fanfare(); }
    later(calls, late ? 1600 : 1400);
  }
  function day() { return Math.min(st.days, Math.floor(st.t / st.dur * st.days)); }
  function firstCall() {
    st.called = true; st.phase = 'call'; st.ring = 1;
    Kit.choice(M.firstCall, { pos: PHONE, h: 1.4, done: function () { st.ring = 0; if (st.sent) return; st.phase = 'report'; reportDock(); } });
  }

  /* ================= 2. The calls ================= */
  function calls() {
    if (!run || run.ended) return;
    ctx.phase('Answer the calls');
    var pdm = M.pdmCall[trk] || M.pdmCall.SNFI, extra = Math.max(0, (M.callsPerRun || 3) - 2);
    var list = (st.called ? [] : [M.firstCall]).concat(shuffle(M.calls).slice(0, extra), [pdm]);
    st.called = true; st.phase = 'calls';
    (function next(i) {
      if (!run || run.ended) return;
      if (i >= list.length) { st.ring = 0; return finale(); }
      st.ring = 1;
      Kit.choice(list[i], { pos: PHONE, h: 1.4, done: function () { next(i + 1); } });
    })(0);
  }

  /* ================= 3. The final emergency ================= */
  function finale() {
    st.phase = 'finale'; ctx.phase('Final emergency: ' + F.title);
    Sound.alarm();
    Kit.say('nyakuoth', '<b>One last emergency: ' + esc(F.title) + '.</b> You lead it. Every rule counts.', Kit.buttons([{ id: 'm7-fin', text: 'Lead it', cls: 'mc big' }]));
    $('#m7-fin').onclick = function () { if (ctx.busy) return; node(F.start); };
  }
  function node(id) {
    if (!run || run.ended) return;
    var N = F.nodes[id]; if (!N) return finaleDone();
    var who = N.speaker === 'lual' ? LUAL : N.speaker === 'nyakuoth' ? NYA : PHONE;
    Kit.choice({ id: F.id + '-' + id, speaker: N.speaker, prompt: N.text, options: N.options, explain: '', ref: N.ref }, { pos: who, h: who === PHONE ? 1.4 : 2.4, done: function (ok, op) { if (op && op.next) node(op.next); else finaleDone(); } });
  }
  function finaleDone() {
    st.phase = 'done'; Sound.fanfare(); confetti();
    Kit.say('lual', '<b>Well led.</b> The families got their kits, the report is in and every rule held. Thank you, hero of the last mile.');
    later(function () { ctx.finish(); }, 2600);
  }

  /* ---------- frame ---------- */
  v.update = function (dt, t) {
    v.tween(dt);
    if (phone) { phone.rotation.z = st.ring && !reduceMotion ? Math.sin(t * 40) * 0.12 : 0; phone.position.y = 0.83 + (st.ring && !reduceMotion ? Math.abs(Math.sin(t * 20)) * 0.03 : 0); }
    if (st.phase !== 'report' || ctx.busy) return;
    st.t += dt;
    if (!st.called && st.t >= st.dur * (R.callAt || 0.4)) return firstCall();
    var c = $('#m7-cal'), pr = $('#m7-prog');
    if (c) c.textContent = 'Day ' + day() + ' of ' + st.days;
    if (pr) pr.style.width = Math.round(Math.min(1, st.t / st.dur) * 100) + '%';
    ctx.timer(Math.max(0, st.dur - st.t));
    if (st.t >= st.dur) send(true);
  };
  v.draw2d = function (g, Pj) {
    g.fillStyle = '#B9D27F'; g.fillRect(0, 0, Pj.W, Pj.H);
    Kit.d2.rect(g, Pj, -6.2, -4.1, 6.2, 3.5, '#D9C3A0');
    Kit.d2.rect(g, Pj, -6.2, -4.2, 6.2, -3.9, C.ngo.color);
    Kit.d2.box(g, Pj, CAL[0], -3.6, 1.8, 0.5, '#E5484D');
    Kit.d2.box(g, Pj, DESK[0], DESK[1], 3.4, 1.4, '#C49A6C');
    Kit.d2.box(g, Pj, DESK[0] + 0.9, DESK[1], 1.4, 1.0, st.inReport ? '#FFFFFF' : '#F5B301');
    Kit.d2.box(g, Pj, PHONE[0], PHONE[1], 0.3, 0.45, st.ring ? '#E5484D' : '#14213D');
    Kit.d2.dot(g, Pj, LUAL[0], LUAL[1], 0.4, '#0033A0'); Kit.d2.dot(g, Pj, NYA[0], NYA[1], 0.4, '#D6246E');
  };
  Kit.start(v, ctx);
  run.debug = { st: st, M: M, F: F, pieces: pieces };
  intro();
} };
