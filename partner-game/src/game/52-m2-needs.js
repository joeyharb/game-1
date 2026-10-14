/* =============================================================================
 * MISSION 2: NEEDS CHECK  (SOP §4.3)
 * Walk the village, visit households: consent first, count households (not
 * people), skip families already assisted, note the most vulnerable.
 * ========================================================================== */
Missions.M2 = { start: function (M, ctx) {
  var B = { minX: -9.5, maxX: 9.5, minZ: -6.2, maxZ: 6.2, maxY: 2.6 };
  var v = Kit.view({ bounds: B, elev: 56, sky: '#CFE9F7' });
  var HOUSES = [[-7.2, -3.6], [-3.6, -4.6], [0.4, -4.9], [4.4, -4.4], [7.6, -3.0], [-7.6, 1.2], [7.8, 1.6], [-5.4, 4.6], [-1.2, 4.9], [3.2, 4.8], [6.8, 4.6]];
  var CAST = { nyakuoth: [-1.6, -1.0], majok: [1.8, 0.8], mabior: [-2.6, 1.6] };
  var hh = shuffle(M.households).slice(0, M.householdsPerRun || 5);
  var st = { visits: [], counted: 0, done: 0, busy: false, phase: 'visit' };

  if (v.gl) {
    var P = [], rr = (function (s) { return function () { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; })(77);
    P.push(M3.part(M3.G.plane(70, 50), '#B7CF7A', [0, 0, 0]));
    P.push(M3.part(M3.G.disc(7.2, 28), '#DDB68A', [0, 0.01, 0]));
    var path = []; for (var k = 0; k <= 30; k++) path.push([-16 + k * 1.1, 7.6 + Math.sin(k * 0.4) * 0.6]); P.push(M3.ribbon(path, 1.2, '#C9895A', 0.02));
    var riv = []; for (var r = 0; r <= 40; r++) riv.push([-18 + r * 0.95, -9.4 + Math.sin(r * 0.35) * 0.8]); P.push(M3.ribbon(riv, 3, '#E2C9A0', 0.012)); P.push(M3.ribbon(riv, 2.2, '#5FB4E0', 0.02));
    HOUSES.forEach(function (h, i) { M3.tukul(i % 2 ? '#E1C59A' : '#D9B98C', i % 2 ? '#A57E44' : '#B08A4E', P, h[0], h[1], 0.95); });
    for (var t = 0; t < 22; t++) { var x = -16 + rr() * 32, z = -11 + rr() * 22, near = HOUSES.some(function (h) { return Math.hypot(h[0] - x, h[1] - z) < 2.2; }); if (near || Math.hypot(x, z) < 7.5 || Math.abs(z + 9.4) < 2.2) continue; if (rr() < 0.6) M3.acacia(P, x, z, 0.8 + rr() * 0.4); else M3.bush(P, x, z, 0.9); }
    // a family sleeping under a tree, cooking fire, jerrycans: life in the village
    M3.acacia(P, 3.4, -1.6, 0.9); P.push(M3.part(M3.G.cyl(0.25, 0.3, 0.12, 8), '#555555', [-4.4, 0.06, -1.2])); P.push(M3.part(M3.G.cone(0.18, 0.4, 6), '#F28C28', [-4.4, 0.3, -1.2]));
    [[-0.4, 2.6], [-0.1, 2.8]].forEach(function (j) { P.push(M3.part(M3.G.box(0.26, 0.36, 0.18), '#F5B301', [j[0], 0.18, j[1]])); });
    v.scene.add(M3.mesh(P, { receive: true }));
    var looks = { nyakuoth: { skin: '#4E2F1C', shirt: '#D6246E', hair: 'long', dress: true }, majok: { skin: '#7A4B2A', shirt: '#E5554F', hair: 'cap', hairColor: '#C62E2E' }, mabior: { skin: '#4A2C1A', shirt: '#7A5CFA', hair: 'bald', cane: true } };
    Object.keys(CAST).forEach(function (k) { var p = M3.person(looks[k]); p.position.set(CAST[k][0], 0, CAST[k][1]); v.scene.add(p); });
    // villagers outside their homes
    HOUSES.forEach(function (h, i) { if (i % 3) return; var p = M3.person({ skin: '#5C3A21', shirt: ['#E5554F', '#19A7E0', '#00A889', '#F28C28'][i % 4], dress: i % 2 === 0, hair: 'headwrap', hairColor: '#F5B301' }); p.position.set(h[0] + 0.9, 0, h[1] + (h[1] < 0 ? 1.2 : -1.2)); v.scene.add(p); });
  }

  // households to visit
  var slots = shuffle(HOUSES.map(function (h, i) { return i; })).slice(0, hh.length);
  hh.forEach(function (H, i) {
    var pos = HOUSES[slots[i]], vis = { H: H, x: pos[0], z: pos[1], done: false, flag: null };
    vis.door = [pos[0], pos[1] + (pos[1] < 0 ? 1.6 : -1.6)];
    vis.bub = Kit.bubble('house', '#7A5CFA', 'Visit this household', [pos[0], 2.9, pos[1]], function () { visit(vis); });
    st.visits.push(vis);
  });

  var me = Kit.walker(v, 0, 1.4, { bounds: { minX: -9.2, maxX: 9.2, minZ: -5.9, maxZ: 5.9 } });
  Kit.taps(v, function () { return st.visits.filter(function (s) { return !s.done; }).map(function (s) { return { x: s.x, z: s.z, r: 1.3, h: 1.4, vis: s }; }); },
    function (hit) { visit(hit.vis); }, function (g) { if (!st.busy) { me.goTo(g.x, g.z); Sound.tap(); } });

  function dock() {
    Kit.say('you', 'Visit each household with a <b>purple bubble</b>. Households counted: <b>' + st.counted + '</b> · visited ' + st.done + '/' + st.visits.length + '.',
      '<div class="progress" aria-hidden="true"><div style="width:' + Math.round(st.done / st.visits.length * 100) + '%"></div></div>');
  }
  function visit(s) {
    if (st.busy || s.done || ctx.busy) return;
    st.busy = true;
    me.goTo(s.door[0], s.door[1], function () {
      if (!run || run.ended) return;
      var H = s.H, O = M.outcomes[H.kind], C1 = M.consent;
      var step1 = { id: H.id + '-consent', speaker: 'you', prompt: H.text, ref: C1.ref, explain: C1.why,
        options: [{ text: C1.ask, correct: true }, { text: C1.skip, why: C1.why }] };
      Kit.choice(step1, { pos: [s.x, s.z], h: 2.9, after: 900, done: function () {
        var prompt = H.kind === 'refuse' ? 'You ask for consent. She says no.' : 'They agree and you explain why you collect the data.';
        var step2 = { id: H.id, speaker: 'you', prompt: prompt, ref: O.ref, explain: O.why,
          options: [{ text: O.ok, correct: true }, O.critical ? { text: O.bad, critical: O.critical } : { text: O.bad, why: O.badWhy }] };
        Kit.choice(step2, { pos: [s.x, s.z], h: 2.9, done: function (ok) {
          s.done = true; st.done++; GFX.removeLabel(s.bub);
          if (ok && (H.kind === 'count' || H.kind === 'priority')) st.counted++;
          s.flag = Kit.tag(ok ? (H.kind === 'count' || H.kind === 'priority' ? '&#10003; Counted' : '&#10003; Not counted') : '&#10003; Visited', [s.x, 2.6, s.z]);
          st.busy = false;
          if (st.done >= st.visits.length) return wrapUp();
          dock();
        } });
      } });
    });
  }
  function wrapUp() {
    st.phase = 'report'; st.busy = true; ctx.phase('Report to the cluster');
    var evs = shuffle(M.events).slice(0, M.eventsPerRun || 2).concat([M.trackEvents[Store.get().track] || M.trackEvents.SNFI]);
    var walkTo = CAST.nyakuoth;
    me.goTo(walkTo[0] + 1.1, walkTo[1] + 0.6, function () {
      Kit.choices(evs, walkTo, function () {
        Sound.fanfare(); confetti();
        Kit.say('nyakuoth', '<b>Assessment validated.</b> ' + st.counted + ' households counted: that is ' + st.counted + ' kits per kit type, one per household. Signed by you and the cluster.');
        toast('<b>Assessment done.</b> Valid for 3 months; attach it to the request.' + refChip('SOP §4.3, §4.11'), '', 3600);
        later(function () { ctx.finish(); }, 2400);
      });
    });
  }

  v.update = function (dt, t) { v.tween(dt); me.update(dt, t, ctx.busy && !me.path.length); };
  v.draw2d = function (g, Pj) {
    g.fillStyle = '#B7CF7A'; g.fillRect(0, 0, Pj.W, Pj.H);
    Kit.d2.dot(g, Pj, 0, 0, 7.2, '#DDB68A');
    HOUSES.forEach(function (h) { Kit.d2.dot(g, Pj, h[0], h[1], 1.0, '#B08A4E'); Kit.d2.dot(g, Pj, h[0], h[1], 0.5, '#D9B98C'); });
    Object.keys(CAST).forEach(function (k) { Kit.d2.dot(g, Pj, CAST[k][0], CAST[k][1], 0.3, '#333'); });
    Kit.d2.dot(g, Pj, me.x, me.z, 0.34, C.ngo.color);
  };
  Kit.start(v, ctx);
  run.debug = { st: st, M: M, me: me };
  ctx.phase('Visit the households');
  dock();
} };
