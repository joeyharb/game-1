/* =============================================================================
 * MISSION 1: GET ON THE PIPELINE  (SOP §4.2)
 * Walk the compound, pick up the right documents for the partner file, take it
 * to the cluster first (validation), then sign up at the IOM CP desk.
 * ========================================================================== */
Missions.M1 = { start: function (M, ctx) {
  var B = { minX: -9.5, maxX: 9.5, minZ: -6, maxZ: 5.6, maxY: 2.6 };
  var v = Kit.view({ bounds: B, elev: 54 });
  var OFF = { you: [-6, -3.6], cluster: [0, -3.9], iom: [6, -3.6] };
  var DESK = { cluster: [0, -2.2], iom: [6, -1.9] };
  var MAJOK = [-1.2, 1.6];
  var st = { phase: 'collect', docs: [], good: 0, need: 0, evs: shuffle(M.events).slice(0, M.eventsPerRun || 2), evAt: [], busy: false };

  /* ---------- scene ---------- */
  if (v.gl) {
    var P = [], rr = (function (s) { return function () { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; })(41);
    P.push(M3.part(M3.G.plane(70, 50), '#B9D27F', [0, 0, 0]));
    P.push(M3.part(M3.G.box(20, 0.03, 12.4), '#E3BC90', [0, 0.012, -0.3]));
    for (var fx = -10; fx <= 10.01; fx += 1.25) { P.push(M3.part(M3.G.box(0.09, 0.6, 0.09), '#8B5E34', [fx, 0.3, -6.5])); P.push(M3.part(M3.G.box(0.09, 0.6, 0.09), '#8B5E34', [fx, 0.3, 5.9])); }
    function building(x, z, roof, w) {
      w = w || 3.2;
      P.push(M3.part(M3.G.box(w, 1.5, 2.0), '#F7F3EA', [x, 0.75, z])); P.push(M3.part(M3.G.box(w + 0.3, 0.16, 2.3), roof, [x, 1.58, z]));
      P.push(M3.part(M3.G.box(0.7, 1.0, 0.05), '#5B6475', [x, 0.5, z + 1.01])); P.push(M3.part(M3.G.box(0.6, 0.4, 0.05), '#9FD3F2', [x - 1.0, 0.95, z + 1.01])); P.push(M3.part(M3.G.box(0.6, 0.4, 0.05), '#9FD3F2', [x + 1.0, 0.95, z + 1.01]));
    }
    building(OFF.you[0], OFF.you[1], C.ngo.color); building(OFF.cluster[0], OFF.cluster[1], '#D6246E', 3.6); building(OFF.iom[0], OFF.iom[1], '#0033A0', 3.6);
    [DESK.cluster, DESK.iom].forEach(function (d) { P.push(M3.part(M3.G.box(1.6, 0.08, 0.8), '#C49A6C', [d[0], 0.72, d[1]])); [[-0.7, -0.3], [0.7, -0.3], [-0.7, 0.3], [0.7, 0.3]].forEach(function (o) { P.push(M3.part(M3.G.box(0.07, 0.7, 0.07), '#8B5E34', [d[0] + o[0], 0.35, d[1] + o[1]])); }); P.push(M3.part(M3.G.box(0.36, 0.03, 0.26), '#FFFFFF', [d[0] - 0.3, 0.78, d[1]])); });
    for (var t = 0; t < 16; t++) { var x = -16 + rr() * 32, z = -12 + rr() * 24; if (Math.abs(x) < 10.5 && Math.abs(z) < 7) continue; M3.acacia(P, x, z, 0.8 + rr() * 0.4); }
    for (var b = 0; b < 8; b++) M3.bush(P, -9 + rr() * 18, rr() < 0.5 ? 5.2 : -5.8, 0.7);
    P.push(M3.part(M3.G.cyl(0.9, 0.9, 0.06, 16), '#C2865A', [OFF.you[0], 0.02, OFF.you[1] + 2.3]));
    v.scene.add(M3.mesh(P, { receive: true }));
    var nya = M3.person({ skin: '#4E2F1C', shirt: '#D6246E', hair: 'long', dress: true }); nya.position.set(DESK.cluster[0], 0, DESK.cluster[1] - 0.8); v.scene.add(nya);
    var lual = M3.person({ skin: '#6B4226', shirt: '#0033A0', hair: 'cap', hairColor: '#0033A0' }); lual.position.set(DESK.iom[0], 0, DESK.iom[1] - 0.8); v.scene.add(lual);
    var maj = M3.person({ skin: '#7A4B2A', shirt: '#E5554F', hair: 'cap', hairColor: '#C62E2E' }); maj.position.set(MAJOK[0], 0, MAJOK[1]); v.scene.add(maj);
    var stampMesh = M3.mesh([M3.part(M3.G.cyl(0.35, 0.35, 0.06, 18), '#12865A'), M3.part(M3.G.cyl(0.25, 0.25, 0.07, 18), '#FFFFFF', [0, 0.005, 0])]); stampMesh.visible = false; v.scene.add(stampMesh);
  }
  Kit.tag('Your office', [OFF.you[0], 2.2, OFF.you[1]]);
  Kit.tag('Cluster desk', [DESK.cluster[0], 2.1, DESK.cluster[1]], function () { goDesk('cluster'); });
  Kit.tag('IOM CP desk', [DESK.iom[0], 2.1, DESK.iom[1]], function () { goDesk('iom'); });

  /* ---------- documents ---------- */
  var good = M.docs.filter(function (d) { return d.good; }), bad = shuffle(M.docs.filter(function (d) { return !d.good; })).slice(0, M.badPerRun || 3);
  var spots = shuffle([[-7.4, 0.6], [-4.6, 2.6], [-2.6, -0.6], [-6.4, 4.0], [-2.4, 4.2], [1.6, 2.6], [3.4, 0.4], [4.6, 3.9], [7.8, 1.2], [8.2, 4.2], [0.8, -0.2], [-8.4, 2.4]]);
  good.concat(bad).forEach(function (d, i) {
    var sp = spots[i], p = Kit.pickup(v, sp[0], sp[1], '#F5B301'); p.d = d;
    p.tag = Kit.tag(esc(d.text), function () { return p.taken ? null : [p.x, 1.75, p.z]; }, function () { goDoc(p); }, 'doc', { sep: true });
    st.docs.push(p);
  });
  st.need = good.length;
  st.evAt = [2, 4];

  var me = Kit.walker(v, -6, -1.3, { bounds: { minX: -9.2, maxX: 9.2, minZ: -2.6, maxZ: 5.4 } });
  Kit.taps(v, function () {
    var items = st.docs.filter(function (p) { return !p.taken; }).map(function (p) { return { x: p.x, z: p.z, r: 0.8, h: 1, doc: p }; });
    items.push({ x: DESK.cluster[0], z: DESK.cluster[1], r: 1.2, h: 0.8, desk: 'cluster' }, { x: DESK.iom[0], z: DESK.iom[1], r: 1.2, h: 0.8, desk: 'iom' });
    return items;
  }, function (hit) { if (hit.doc) goDoc(hit.doc); else goDesk(hit.desk); }, function (g) { if (!st.busy) { me.goTo(g.x, g.z); Sound.tap(); } });

  function dock() {
    if (st.phase !== 'collect') return;
    Kit.say('you', 'Partner file: <b>' + st.good + '/' + st.need + '</b> right documents. Tap a glowing document to pick it up. Then go to the <b>cluster desk</b>.',
      '<div class="progress" aria-hidden="true"><div style="width:' + Math.round(st.good / st.need * 100) + '%"></div></div>');
  }
  function scr(x, y, z) { return GFX.project(x, y, z); }

  function goDoc(p) {
    if (st.busy || p.taken || st.phase !== 'collect' || ctx.busy) return;
    me.goTo(p.x, p.z + 0.6, function () {
      if (p.taken || ctx.busy || st.busy) return;
      p.taken = true; GFX.removeLabel(p.tag);
      var at = scr(p.x, 1.2, p.z), d = p.d;
      if (d.good) {
        st.good++;
        ctx.answer({ correct: true, id: d.id, ref: d.ref, title: d.text, why: d.why, at: at });
        dock();
        // busy from now, so no other pickup can redraw the dock over the event card
        if (st.evAt.length && st.good >= st.evAt[0] && st.evs.length) { st.evAt.shift(); var E = st.evs.shift(); st.busy = true; later(function () { if (run && !run.ended) { Kit.choice(E, { pos: MAJOK, done: function () { st.busy = false; dock(); } }); } }, 700); }
      } else {
        ctx.answer({ correct: false, id: d.id, ref: d.ref, title: 'Wrong document', why: d.why, critical: d.critical, at: at, focus: [p.x, 1, p.z] });
      }
    });
  }
  function goDesk(which) {
    if (st.busy || ctx.busy) return;
    var d = DESK[which];
    me.goTo(d[0], d[1] + 1.1, function () {
      if (ctx.busy) return;
      var at = scr(d[0], 1.4, d[1]);
      if (st.phase === 'collect') {
        if (which === 'iom') { ctx.answer({ correct: false, id: 'order', ref: M.clusterFirst.ref, title: 'Cluster first', why: M.clusterFirst.why, at: at, costLife: false }); return; }
        if (st.good < st.need) { ctx.answer({ correct: false, id: 'incomplete', ref: M.incomplete.ref, title: 'File incomplete', why: M.incomplete.why + ' (' + st.good + '/' + st.need + ')', at: at, costLife: false }); return; }
        return validate();
      }
      if (st.phase === 'signup') {
        if (which === 'cluster') { toast('The cluster has validated your file. Now go to the <b>IOM CP desk</b>.', 'info', 2600); return; }
        return signup();
      }
    });
  }
  function validate() {
    st.phase = 'validating'; st.busy = true; ctx.phase('Cluster validation');
    // leftover wrong documents were rightly left behind
    st.docs.forEach(function (p) { if (!p.taken && !p.d.good) ctx.answer({ correct: true, id: p.d.id, ref: p.d.ref, silent: true }); });
    ctx.answer({ correct: true, id: 'to-cluster', ref: M.validation.ref, title: 'File delivered to the cluster', why: M.validation.text, at: scr(DESK.cluster[0], 1.4, DESK.cluster[1]) });
    var day = 0, cal = Kit.tag('Working day 1', [DESK.cluster[0], 2.9, DESK.cluster[1]], null, 'target');
    Kit.say(M.validation.speaker, fmt(M.validation.text, true));
    (function tick() {
      if (!run || run.ended) return;
      day++; cal.node.textContent = 'Working day ' + day; Sound.tick();
      if (day < 5) return later(tick, reduceMotion ? 120 : 520);
      later(function () {
        GFX.removeLabel(cal); Sound.stamp(); toast('<b>Validated.</b> Capacity, presence and coordination confirmed.' + refChip(M.validation.ref), '', 3000);
        if (v.gl) { stampMesh.visible = true; stampMesh.position.set(DESK.cluster[0] + 0.3, 0.8, DESK.cluster[1]); }
        st.phase = 'signup'; st.busy = false; ctx.phase('Sign up with the IOM CP team');
        Kit.say('nyakuoth', 'Your file is validated. Now go to the <b>IOM CP desk</b> to sign the agreement.');
        // a last shortcut from Majok, if one is left
        if (st.evs.length && st.evAt.length) { st.busy = true; var E = st.evs.shift(); st.evAt = []; Kit.choice(E, { pos: MAJOK, done: function () { st.busy = false; Kit.say('nyakuoth', 'Now go to the <b>IOM CP desk</b> to sign the agreement.'); } }); }
      }, 500);
    })();
  }
  function signup() {
    st.phase = 'signing'; st.busy = true; ctx.phase('Agreement, Requester, orientation');
    Kit.choices(M.signup, DESK.iom, function () {
      Sound.fanfare(); confetti();
      if (v.gl) { stampMesh.visible = true; stampMesh.position.set(DESK.iom[0] + 0.3, 0.8, DESK.iom[1]); }
      Kit.say('lual', '<b>Welcome to the Core Pipeline!</b> Your organisation is onboarded. Next: assess the needs.');
      later(function () { ctx.finish(); }, 2000);
    });
  }

  /* ---------- frame ---------- */
  v.update = function (dt, t) {
    v.tween(dt);
    st.docs.forEach(function (p) { p.update(dt); });
    me.update(dt, t, ctx.busy || st.busy);
  };
  v.draw2d = function (g, Pj) {
    g.fillStyle = '#B9D27F'; g.fillRect(0, 0, Pj.W, Pj.H);
    Kit.d2.rect(g, Pj, -10, -6.5, 10, 5.9, '#E3BC90');
    Kit.d2.box(g, Pj, OFF.you[0], OFF.you[1], 3.2, 2, C.ngo.color); Kit.d2.box(g, Pj, OFF.cluster[0], OFF.cluster[1], 3.6, 2, '#D6246E'); Kit.d2.box(g, Pj, OFF.iom[0], OFF.iom[1], 3.6, 2, '#0033A0');
    Kit.d2.box(g, Pj, DESK.cluster[0], DESK.cluster[1], 1.6, 0.8, '#C49A6C'); Kit.d2.box(g, Pj, DESK.iom[0], DESK.iom[1], 1.6, 0.8, '#C49A6C');
    st.docs.forEach(function (p) { if (!p.taken) Kit.d2.dot(g, Pj, p.x, p.z, 0.35, '#F5B301'); });
    Kit.d2.dot(g, Pj, MAJOK[0], MAJOK[1], 0.3, '#E5554F'); Kit.d2.dot(g, Pj, me.x, me.z, 0.34, C.ngo.color);
  };
  Kit.start(v, ctx);
  run.debug = { st: st, M: M, me: me };
  ctx.phase('Collect the partner file');
  dock();
} };
