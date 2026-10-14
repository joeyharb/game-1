/* =============================================================================
 * MISSION 6: DISTRIBUTION DAY
 * Phase 1 ANNOUNCE  load the right messages into the chief's megaphone
 * Phase 2 BUILD     place the stations of a safe, fair site (SOP §4.6, Table 12)
 * Phase 3 RUSH      tap a person's bubble, then the station they need;
 *                   answer event calls; door-to-door for those who cannot come
 * ========================================================================== */
Missions.M6 = { start: function (M, ctx) {
  var T = track(), KIT = T.color, pf = pace();
  var FZ = 0.6;                                          // the flow line
  var PATH = [[-6.6, FZ], [-3.4, FZ], [0, FZ], [3.4, FZ], [6.6, FZ]];
  var SIDE = [[-4.6, -3.4], [-1.4, -3.4], [1.8, -3.4], [5.0, -3.4]];
  var TUKULS = [[-8.9, -5.6], [-1.2, -6.1], [8.6, -5.4], [-6.0, 5.1], [1.6, 5.3], [8.8, 4.7]];
  var BOUNDS = { minX: -10.6, maxX: 10.6, minZ: -6.6, maxZ: 5.8, maxY: 2.2 };
  var BOUNDS_ANN = { minX: -11.2, maxX: -3.6, minZ: 0.2, maxZ: 6.4, maxY: 2.4 };
  var CAST = { mabior: [-7.9, 3.7], majok: [2.0, 2.5], nyakuoth: [-1.6, -2.0], ayen: [-5.4, 3.4], you: [-2.2, 2.4] };
  var R = M.rush, rushLen = R.seconds * pf;

  var st = { phase: 'announce', stations: {}, plots: [], people: [], houses: [], sel: null, team: null,
             usedDecoys: {}, hitChips: {}, rushT: 0, spawnT: 1.5, doorT: R.doorToDoorEvery * pf * 0.55, events: [], evIdx: 0, served: 0, firstOk: {}, ended: false, tip: 0 };
  var dock = ctx.dock();
  var gl = GFX.mode === 'webgl';
  var v = { bounds: BOUNDS_ANN, fit: { elev: 52, azim: 0, rotatePortrait: true,
            top: function (W) { return W < 760 ? 100 : 108; },
            bottom: function () { var d = $('#dock'); return d ? d.offsetHeight + 8 : 20; }, side: 6 } };
  var cam = null, tween = null, scene = null, rings = [], megaphoneObj = null, cart = null;

  /* ---------------- 3D scene ---------------- */
  if (gl) {
    scene = makeOutdoorScene('#CDE8F6'); v.scene = scene;
    cam = new THREE.PerspectiveCamera(36, 1, 0.1, 300); v.camera = cam;
    var P = [];
    P.push(M3.part(M3.G.plane(70, 50), '#D8A879', [0, 0, 0]));
    var rr = (function (s) { return function () { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; })(29);
    for (var g = 0; g < 26; g++) { var gx = -16 + rr() * 32, gz = -12 + rr() * 24; if (Math.abs(gz) < 6.4 && Math.abs(gx) < 10.4) continue; P.push(M3.part(M3.G.disc(1 + rr() * 2.2, 9), '#A9C46E', [gx, 0.01, gz])); }
    P.push(M3.part(M3.G.box(24, 0.04, 1.6), '#C2865A', [0, 0.02, FZ]));            // flow path
    P.push(M3.part(M3.G.box(21.2, 0.03, 10.4), '#E3BC90', [0, 0.012, -0.7]));      // site floor
    for (var fx = -9.8; fx <= 9.81; fx += 1.4) { P.push(M3.part(M3.G.box(0.09, 0.6, 0.09), '#8B5E34', [fx, 0.3, -5.5])); P.push(M3.part(M3.G.box(0.09, 0.6, 0.09), '#8B5E34', [fx, 0.3, 3.9])); }
    for (var fz = -5.5; fz <= 3.91; fz += 1.4) { if (Math.abs(fz - FZ) > 1.5) { P.push(M3.part(M3.G.box(0.09, 0.6, 0.09), '#8B5E34', [-9.8, 0.3, fz])); P.push(M3.part(M3.G.box(0.09, 0.6, 0.09), '#8B5E34', [9.8, 0.3, fz])); } }
    P.push(M3.part(M3.G.box(19.6, 0.05, 0.05), '#A97C50', [0, 0.52, -5.5])); P.push(M3.part(M3.G.box(19.6, 0.05, 0.05), '#A97C50', [0, 0.52, 3.9]));
    TUKULS.forEach(function (t, i) { M3.tukul(i % 2 ? '#E1C59A' : '#D9B98C', i % 2 ? '#A57E44' : '#B08A4E', P, t[0], t[1], 0.8); });
    [[-13, -3], [-12.5, 3.5], [12.5, -2], [13, 3.5], [-4, -8.5], [4.5, -8.8], [-11, -8], [11, -8], [-2.5, 8], [5, 8.4], [-10.5, 7.5], [11, 7.6]].forEach(function (p, i) { M3.acacia(P, p[0], p[1], 0.8 + (i % 3) * 0.15); });
    for (var b = 0; b < 16; b++) { var bx = -12 + rr() * 24, bz = rr() < 0.5 ? -7 - rr() * 3 : 6.3 + rr() * 3; M3.bush(P, bx, bz, 0.7 + rr() * 0.5); if (b % 3 === 0) M3.rock(P, bx + 0.6, bz + 0.3); }
    // kit stack behind the distribution point, in the track colour
    for (var kx = 0; kx < 3; kx++) for (var ky = 0; ky < 2; ky++) P.push(M3.part(M3.G.box(0.42, 0.3, 0.32), KIT, [4.6 + kx * 0.46, 0.15 + ky * 0.31, -1.3]));
    var world = M3.mesh(P, { receive: true }); scene.add(world);
    var tr = M3.truck(Store.get().truckColor || C.ngo.color); tr.position.set(8.0, 0, -2.1); tr.rotation.y = Math.PI / 2; scene.add(tr);
    // recurring characters
    var looks = {
      mabior: { skin: '#4A2C1A', shirt: '#7A5CFA', hair: 'bald', cane: true },
      majok: { skin: '#7A4B2A', shirt: '#E5554F', hair: 'cap', hairColor: '#C62E2E' },
      nyakuoth: { skin: '#4E2F1C', shirt: '#D6246E', hair: 'long', dress: true },
      ayen: { skin: '#5C3A21', shirt: '#F5B301', hair: 'headwrap', hairColor: '#F5B301', dress: true },
      you: { skin: '#6B4226', shirt: Store.get().truckColor || C.ngo.color, hair: 'short' }
    };
    Object.keys(CAST).forEach(function (k) { var p = M3.person(looks[k]); p.position.set(CAST[k][0], 0, CAST[k][1]); p.rotation.y = k === 'mabior' ? 0.6 : 0; scene.add(p); CAST[k].obj = p; });
    megaphoneObj = M3.megaphone(); megaphoneObj.position.set(0.32, 1.05, 0.2); megaphoneObj.rotation.y = -0.6; CAST.mabior.obj.add(megaphoneObj);
    for (var ri = 0; ri < 3; ri++) { var rm = new THREE.Mesh(M3.G.ring(0.9, 1.05, 40), new THREE.MeshBasicMaterial({ color: '#FFFFFF', transparent: true, opacity: 0 })); rm.position.set(CAST.mabior[0], 0.08, CAST.mabior[1]); scene.add(rm); rings.push({ m: rm, t: -1 }); }
    v.onQuality = function (q) { scene.userData.sun.castShadow = q === 'high'; };
  }

  /* ---------------- camera moves ---------------- */
  function camTo(bounds, dur) {
    if (!gl || !cam.userData.placed || reduceMotion) { v.bounds = bounds; GFX.refit(); if (cam) cam.userData.placed = true; return; }
    var fromP = cam.position.clone(), fromT = v.camTarget.clone();
    v.bounds = bounds; GFX.refit();
    tween = { t: 0, d: dur || 0.9, fromP: fromP, toP: cam.position.clone(), fromT: fromT, toT: v.camTarget.clone() };
    cam.position.copy(fromP); cam.lookAt(fromT);
  }
  v.onFit = function () { if (tween) { tween.toP = cam.position.clone(); tween.toT = v.camTarget.clone(); } };
  ctx.onCritical = function (focus) {
    if (!focus) return; var f = focus;
    camTo({ minX: f[0] - 3.2, maxX: f[0] + 3.2, minZ: f[2] - 2.4, maxZ: f[2] + 2.4, maxY: 2 }, 0.7);
  };

  /* ---------------- plots and stations ---------------- */
  PATH.forEach(function (p, i) { st.plots.push({ kind: 'path', order: i + 1, x: p[0], z: p[1], station: null }); });
  SIDE.forEach(function (p) { st.plots.push({ kind: 'side', x: p[0], z: p[1], station: null }); });
  function stationDef(id) { var a = M.stations.concat(M.decoys); for (var i = 0; i < a.length; i++) if (a[i].id === id) return a[i]; return null; }
  function buildStation(def, plot) {
    var s = { id: def.id, def: def, x: plot.x, z: plot.z, plot: plot, queue: [], busy: null, born: 0, seats: [] };
    plot.station = s; st.stations[def.id] = s;
    if (gl) {
      var m = M3.station(def.id, KIT); m.position.set(plot.x, 0, plot.z); if (def.id === 'entry' || def.id === 'exit') m.rotation.y = Math.PI / 2;
      m.scale.setScalar(0.01); scene.add(m); s.mesh = m;
      if (plot.mesh) plot.mesh.visible = false;
    }
    var lb = el('<button class="lbl tap" type="button">' + esc(def.label) + '</button>');
    lb.onclick = function (e) { e.stopPropagation(); tapStation(s); };
    s.label = GFX.addLabel(lb, function () { return [s.x, def.id === 'waiting' ? 2.3 : 2.2, s.z]; });
    Sound.build();
    return s;
  }
  function plotLabels() {
    st.plots.forEach(function (p) {
      if (gl && !p.mesh) { p.mesh = M3.plot(p.kind === 'path' ? M.color : '#FFFFFF'); p.mesh.position.set(p.x, 0, p.z); scene.add(p.mesh); }
      var b = el('<button class="plotnum' + (p.kind === 'side' ? ' side' : '') + '" type="button" aria-label="' + (p.kind === 'path' ? 'Flow plot ' + p.order : 'Side plot') + '">' + (p.kind === 'path' ? p.order : '+') + '</button>');
      b.onclick = function (e) { e.stopPropagation(); tapPlot(p); };
      p.label = GFX.addLabel(b, function () { return p.station ? null : [p.x, 0.2, p.z]; }, { ay: 0.5 });
    });
  }

  /* ---------------- people ---------------- */
  var SKINS = ['#4A2C1A', '#5C3A21', '#6B4226', '#7A4B2A', '#5A3A22', '#3E2516'];
  var CLOTH = ['#E5554F', '#F5B301', '#00A889', '#19A7E0', '#7A5CFA', '#D6246E', '#F28C28', '#2E86DE', '#8E44AD', '#27AE60'];
  var NEED = {
    register:  { icon: 'idcard', color: '#0033A0', label: 'Needs registration' },
    complaint: { icon: 'speech', color: '#7A5CFA', label: 'Has a complaint or question' },
    faint:     { icon: 'drop',   color: '#19A7E0', label: 'Feels faint in the heat' },
    notListed: { icon: 'noentry', color: '#C62E2E', label: 'Not on the list' }
  };
  var pool = [];
  function makeLook(i) {
    var r = Math.random(), kind = i % 7 === 3 ? 'kid' : (i % 6 === 5 ? 'elder' : (r < 0.5 ? 'woman' : 'man'));
    var look = { skin: pick(SKINS), shirt: pick(CLOTH), pants: pick(['#2E3A59', '#3B3B3B', '#5B4636']) };
    if (kind === 'woman') { look.dress = true; look.hair = Math.random() < 0.6 ? 'headwrap' : 'short'; look.hairColor = pick(CLOTH); }
    if (kind === 'kid') look.kid = true;
    if (kind === 'elder') { look.cane = true; look.hair = Math.random() < 0.5 ? 'bald' : 'short'; look.hairColor = '#9A9A9A'; }
    return look;
  }
  function getMesh() {
    for (var i = 0; i < pool.length; i++) if (!pool[i].used) { pool[i].used = true; pool[i].g.visible = true; pool[i].kit.visible = false; return pool[i]; }
    var look = makeLook(pool.length), g = M3.person(look), kit = M3.kitBox(KIT, 0.8);
    kit.position.set(0, 0.95, 0.28); kit.visible = false; g.add(kit); scene.add(g);
    var o = { g: g, kit: kit, used: true, look: look }; pool.push(o); return o;
  }
  function spawn() {
    var waiting = st.people.filter(function (p) { return p.state === 'wait' && p.at === 'entry'; }).length;
    if (waiting >= 5) return;
    var mix = R.mix, r = Math.random(), need = r < mix.complaint ? 'complaint' : (r < mix.complaint + mix.faint ? 'faint' : 'register');
    var notListed = need === 'register' && Math.random() < mix.notListed / Math.max(0.01, mix.register);
    var p = { id: 'p' + Math.random().toString(36).slice(2, 7), x: -12, z: FZ + 1.7, need: need, notListed: notListed, state: 'walk', path: [], at: 'road',
              patience: R.patience * pf, maxPatience: R.patience * pf, color: pick(CLOTH), kit: false, proc: 0 };
    if (gl) { p.o = getMesh(); p.color = p.o.look.shirt; }
    var spot = entrySpot(); p.spot = spot; p.path = [[-9.6, FZ + 1.7], spot]; p.onArrive = function () { p.state = 'wait'; p.at = 'entry'; p.patience = p.maxPatience; showBubble(p); };
    st.people.push(p);
  }
  function entrySpot() {
    for (var i = 0; i < 6; i++) { var x = -9.2 + (i % 3) * 1.15, z = FZ + 1.4 + Math.floor(i / 3) * 1.1; if (!st.people.some(function (q) { return q.spot && q.spot[0] === x && q.spot[1] === z; })) return [x, z]; }
    return [-8.4, FZ + 2.6 + Math.random()];
  }
  function showBubble(p) {
    hideBubble(p);
    var n = NEED[p.need];
    var b = el('<button class="bub" type="button" aria-label="' + esc(n.label) + '" style="--bc:' + n.color + '">' + icon(n.icon, '#fff', 'class="ic"') +
      '<svg class="ring" viewBox="0 0 36 36"><circle cx="18" cy="18" r="16" fill="none" stroke="rgba(255,255,255,.55)" stroke-width="3"/><circle class="pc" cx="18" cy="18" r="16" fill="none" stroke="#F5B301" stroke-width="3.4" stroke-dasharray="100.5" stroke-dashoffset="0" stroke-linecap="round"/></svg></button>');
    b.onclick = function (e) { e.stopPropagation(); select({ type: 'person', p: p }); };
    p.bub = GFX.addLabel(b, function () { return [p.x, p.o && p.o.look.kid ? 1.5 : 1.95, p.z]; }, { sep: true });
    p.pc = b.querySelector('.pc'); p.lastPc = -1;
  }
  function hideBubble(p) { if (p.bub) { GFX.removeLabel(p.bub); p.bub = null; } if (st.sel && st.sel.p === p) select(null); }
  function release(p) { hideBubble(p); if (p.o) { p.o.used = false; p.o.g.visible = false; } var i = st.people.indexOf(p); if (i >= 0) st.people.splice(i, 1); }
  function walkTo(p, pts, onArrive) { p.path = pts.slice(); p.state = 'walk'; p.onArrive = onArrive; }
  function serviceSpot(s, k) {
    k = k || 0;
    if (s.plot.kind === 'side') return [s.x - 0.55 * k, s.z + 1.25 + 0.15 * k];
    return [s.x - 0.62 * k, s.z + 1.25 + (k ? 0.2 : 0)];
  }

  /* ---------------- selection and routing ---------------- */
  function select(sel) {
    if (st.sel && st.sel.p && st.sel.p.bub) st.sel.p.bub.node.classList.remove('sel');
    if (st.sel && st.sel.h && st.sel.h.bub) st.sel.h.bub.node.classList.remove('sel');
    st.sel = sel;
    if (sel && sel.p && sel.p.bub) { sel.p.bub.node.classList.add('sel'); Sound.tap(); }
    if (sel && sel.h && sel.h.bub) { sel.h.bub.node.classList.add('sel'); Sound.tap(); }
    Object.keys(st.stations).forEach(function (k) { var s = st.stations[k]; if (s.label) s.label.node.classList.toggle('target', !!sel && st.phase === 'rush'); });
  }
  function scr(x, y, z) { return GFX.project(x, y, z); }
  function tapStation(s) {
    if (st.phase === 'build') return;
    if (st.phase !== 'rush' || ctx.busy) return;
    var sel = st.sel; if (!sel) { if (s.id === 'door') toast('Tap a house with a <b>pink bubble</b>, then this team.', 'info', 2500); else toast('Tap a person\'s <b>bubble</b> first, then the station they need.', 'info', 2500); return; }
    if (sel.type === 'house') return sendTeam(sel.h, s);
    route(sel.p, s);
  }
  function route(p, s) {
    var at = scr(p.x, 1.6, p.z), RT = M.routing;
    var want = p.need === 'register' ? 'register' : p.need === 'complaint' ? 'complaints' : p.need === 'faint' ? 'aid' : 'complaints';
    if (s.id === want) {
      select(null); hideBubble(p);
      var key = p.need, first = !st.firstOk[key]; st.firstOk[key] = true;
      var why = p.need === 'notListed' ? RT.notListedOk : RT[p.need === 'complaint' ? 'complaint' : p.need === 'faint' ? 'faint' : 'register'];
      ctx.answer({ correct: true, id: 'route-' + p.need, ref: why.ref, title: 'Right station', why: why.why, at: at, silent: !first });
      joinStation(p, s);
      return;
    }
    // wrong station
    if (p.bub) { var n = p.bub.node; n.classList.remove('shake'); void n.offsetWidth; n.classList.add('shake'); }
    if (p.need === 'notListed' && s.id === 'handout') {
      ctx.answer({ correct: false, id: 'route-notListed', ref: RT.notListedBad.ref, title: 'Not on the list', why: RT.notListedBad.why, at: at, costLife: true });
    } else {
      var w = p.need === 'notListed' ? RT.notListedBad : RT[p.need === 'complaint' ? 'complaint' : p.need === 'faint' ? 'faint' : 'register'];
      ctx.answer({ correct: false, id: 'route-' + p.need, ref: w.ref, title: 'Wrong station', why: w.why, at: at, costLife: false });
    }
  }
  function joinStation(p, s) {
    p.at = s.id; p.spot = null;
    s.queue.push(p);
    var k = s.queue.length - 1, sp = serviceSpot(s, k);
    walkTo(p, [[p.x, Math.max(p.z, FZ + 1.4)], sp], function () { p.state = 'queue'; });
  }
  function sendTeam(h, s) {
    var at = scr(h.x, 2, h.z);
    if (s.id !== 'door') { ctx.answer({ correct: false, id: 'door', ref: M.routing.door.ref, title: 'Wrong team', why: M.routing.door.why, at: at, costLife: false }); return; }
    if (st.team && st.team.busy) { toast('The door-to-door team is out. It will go next.', 'info', 2200); h.queued = true; select(null); return; }
    select(null); dispatchTeam(h, s);
  }
  function dispatchTeam(h, s) {
    var first = !st.firstOk.door; st.firstOk.door = true;
    ctx.answer({ correct: true, id: 'door', ref: M.routing.door.ref, title: 'Door to door', why: M.routing.door.why, at: scr(h.x, 2, h.z), silent: !first });
    if (h.bub) { GFX.removeLabel(h.bub); h.bub = null; }
    h.served = true; h.active = false;
    st.team = { busy: true, x: s.x, z: s.z, path: [[s.x, s.z + 1.3], [h.x, h.z + (h.z > 0 ? -1.4 : 1.4)], [s.x, s.z + 1.3]], legs: 0, home: s };
  }

  /* ---------------- taps on the canvas (people and houses without bubbles, stations) ---------------- */
  var downAt = null, canvas = GFX.canvas;
  function onDown(e) { downAt = { x: e.clientX, y: e.clientY }; }
  function onUp(e) {
    if (!downAt) return; var dx = e.clientX - downAt.x, dy = e.clientY - downAt.y; downAt = null;
    if (dx * dx + dy * dy > 144 || ctx.busy) return;
    var items = [];
    if (st.phase === 'build') st.plots.forEach(function (p) { if (!p.station) items.push({ x: p.x, z: p.z, r: 1.1, h: 0.1, plot: p }); });
    if (st.phase === 'rush') {
      st.people.forEach(function (p) { if (p.bub) items.push({ x: p.x, z: p.z, r: 0.5, h: 0.9, person: p }); });
      st.houses.forEach(function (h) { if (h.active && h.bub) items.push({ x: h.x, z: h.z, r: 1.1, h: 1.2, house: h }); });
      Object.keys(st.stations).forEach(function (k) { var s = st.stations[k]; items.push({ x: s.x, z: s.z, r: 1.2, h: 0.8, station: s }); });
    }
    var hit = GFX.pickNearest(e.clientX, e.clientY, items);
    if (!hit) { if (st.phase === 'rush') select(null); return; }
    if (hit.plot) tapPlot(hit.plot);
    else if (hit.person) select({ type: 'person', p: hit.person });
    else if (hit.house) tapHouse(hit.house);
    else if (hit.station) tapStation(hit.station);
  }
  canvas.addEventListener('pointerdown', onDown); canvas.addEventListener('pointerup', onUp);
  function tapHouse(h) {
    if (st.sel && st.sel.type === 'team') { var s = st.stations.door; select(null); return sendTeam(h, s); }
    select({ type: 'house', h: h });
  }

  /* ================= PHASE 1: ANNOUNCE ================= */
  function phaseAnnounce() {
    st.phase = 'announce'; ctx.phase('1/3 Announce the distribution');
    var A = M.announce, good = A.items.filter(function (x) { return x.correct; }), bad = shuffle(A.items.filter(function (x) { return !x.correct; })).slice(0, A.decoysPerRun || 2);
    var chips = shuffle(good.concat(bad)), loaded = 0;
    dock.innerHTML = '<div class="dock-inner">' + sayHTML(A.speaker, fmt(A.prompt, true)) +
      '<div class="chips" id="chips">' + chips.map(function (c) { return '<button class="mchip" type="button" data-id="' + c.id + '">' + fmt(c.text, true) + '</button>'; }).join('') + '</div>' +
      '<div class="progress" aria-hidden="true"><div id="ann-prog" style="width:0%"></div></div><p class="small muted" style="margin:6px 0 0">Load ' + good.length + ' messages. Leave out the wrong ones.</p></div>';
    camTo(BOUNDS_ANN, 0.01);
    $$('#chips .mchip').forEach(function (b) {
      b.onclick = function () {
        if (ctx.busy || b.classList.contains('used')) return;
        var c = A.items.filter(function (x) { return x.id === b.getAttribute('data-id'); })[0], r = b.getBoundingClientRect(), at = { x: r.left + r.width / 2, y: r.top };
        if (c.correct) {
          b.classList.add('used'); loaded++;
          var mp = megaphoneScreen();
          flyTo(b, mp.x, mp.y, function () { Sound.pop(); });
          ctx.answer({ correct: true, id: c.id, ref: A.ref, title: 'Loaded', at: at, silent: true });
          $('#ann-prog').style.width = Math.round(loaded / good.length * 100) + '%';
          if (loaded === good.length) later(broadcast, 650);
        } else {
          b.classList.add('bad');
          ctx.answer({ correct: false, id: c.id, ref: c.ref, title: 'Leave that out', why: c.why, critical: c.critical, at: at, focus: [CAST.mabior[0], 1, CAST.mabior[1]] });
          later(function () { b.classList.add('used'); }, 450);
          st.hitChips[c.id] = true;
        }
      };
    });
    function broadcast() {
      if (!run || run.ended) return;
      Sound.whoosh(); rings.forEach(function (r, i) { r.t = -i * 0.35; });
      bad.forEach(function (c) { if (!st.hitChips[c.id]) ctx.answer({ correct: true, id: c.id, ref: c.ref || A.ref, silent: true, at: { x: GFX.W / 2, y: GFX.H / 2 } }); });
      toast('<b>Message out.</b> The community knows the criteria, the kit, the date, how to complain, and that aid is free.' + refChip(A.ref), '', 3600);
      later(phaseBuild, reduceMotion ? 600 : 1700);
    }
  }
  function megaphoneScreen() {
    if (gl && megaphoneObj) { var w = new THREE.Vector3(); megaphoneObj.getWorldPosition(w); return scr(w.x, w.y, w.z); }
    return scr(CAST.mabior[0], 1.2, CAST.mabior[1]);
  }

  /* ================= PHASE 2: BUILD ================= */
  var trayCards = [], cardSel = null;
  function phaseBuild() {
    if (!run || run.ended) return;
    st.phase = 'build'; ctx.phase('2/3 Build a safe, fair site');
    var decoys = shuffle(M.decoys).slice(0, M.decoysPerRun || 2);
    trayCards = shuffle(M.stations.concat(decoys));
    dock.innerHTML = '<div class="dock-inner">' + sayHTML('you', 'Tap a station, then a plot. <b>Numbered plots</b> are the flow, in order. <b>+ plots</b> sit beside it.') +
      '<div class="tray" id="tray">' + trayCards.map(function (d) { return '<button class="scard" type="button" aria-pressed="false" data-id="' + d.id + '">' + icon(d.icon || 'kit', 'var(--blue)') + '<span>' + fmt(d.label, false) + '</span></button>'; }).join('') + '</div></div>';
    $$('#tray .scard').forEach(function (b) { b.onclick = function () { if (ctx.busy) return; $$('#tray .scard').forEach(function (x) { x.setAttribute('aria-pressed', 'false'); }); if (cardSel === b.getAttribute('data-id')) { cardSel = null; return; } cardSel = b.getAttribute('data-id'); b.setAttribute('aria-pressed', 'true'); Sound.tap(); highlightPlots(); }; });
    plotLabels();
    camTo(BOUNDS, 1.1);
  }
  function highlightPlots() {
    var d = cardSel && stationDef(cardSel);
    st.plots.forEach(function (p) {
      var on = !!d && !p.station && (!d.kind || d.kind === p.kind);
      if (p.label) p.label.node.style.outline = on ? '4px solid var(--gold)' : '';
      if (p.mesh) p.mesh.userData.disc.material.opacity = on ? 0.75 : 0.35;
    });
  }
  function tapPlot(p) {
    if (st.phase !== 'build' || ctx.busy) return;
    if (p.station) return;
    if (!cardSel) { toast('Pick a <b>station card</b> below first.', 'info', 2200); return; }
    var d = stationDef(cardSel), card = $('#tray .scard[data-id="' + cardSel + '"]'), at = scr(p.x, 0.5, p.z);
    var isDecoy = M.decoys.indexOf(d) >= 0;
    if (isDecoy) {
      st.usedDecoys[d.id] = true; card.classList.add('bad'); later(function () { card.classList.add('placed'); }, 400); cardSel = null; highlightPlots();
      ctx.answer({ correct: false, id: d.id, ref: d.ref, title: 'Not on a safe site', why: d.why, critical: d.critical, at: at, focus: [p.x, 1, p.z] });
      return;
    }
    if (d.kind !== p.kind || (d.kind === 'path' && d.order !== p.order)) {
      var why = d.kind === 'path' && p.kind === 'path' ? M.flowWhy : (d.kind === 'path' ? 'This station belongs on the numbered flow, in order.' : 'This station sits beside the flow, on a + plot.');
      if (card) { card.classList.remove('bad'); void card.offsetWidth; card.classList.add('bad'); }
      ctx.answer({ correct: false, id: 'build-' + d.id, ref: M.stationsRef, title: 'Not there', why: why, at: at, costLife: false });
      return;
    }
    if (card) card.classList.add('placed'); cardSel = null; highlightPlots();
    buildStation(d, p);
    ctx.answer({ correct: true, id: 'build-' + d.id, ref: M.stationsRef, title: d.label, at: at, silent: true });
    if (M.stations.every(function (s) { return st.stations[s.id]; })) later(finishBuild, 700);
  }
  function finishBuild() {
    if (!run || run.ended) return;
    trayCards.filter(function (d) { return M.decoys.indexOf(d) >= 0 && !st.usedDecoys[d.id]; }).forEach(function (d) {
      ctx.answer({ correct: true, id: d.id, ref: d.ref, silent: true });
    });
    var left = trayCards.filter(function (d) { return M.decoys.indexOf(d) >= 0 && !st.usedDecoys[d.id]; }).map(function (d) { return d.label; });
    toast('<b>Site ready.</b> Separate entry, registration, distribution and exit, with shade, water, first aid and a complaints desk.' + (left.length ? ' Rightly left out: ' + esc(left.join(', ')) + '.' : '') + refChip(M.stationsRef), '', 4200);
    later(countdown, 1500);
  }

  /* ================= PHASE 3: RUSH ================= */
  function countdown() {
    if (!run || run.ended) return;
    st.phase = 'pre'; ctx.phase('3/3 Get ready...');
    dock.innerHTML = '<div class="dock-inner">' + sayHTML('mabior', 'People are arriving! Tap a person\'s <b>bubble</b>, then the station they need. <span style="color:#0033A0">ID card</span>: registration. <span style="color:#7A5CFA">Speech</span>: complaints desk. <span style="color:#19A7E0">Drop</span>: water and first aid. <span style="color:#C62E2E">No entry</span>: not on the list. <span style="color:#D6246E">House</span>: send the door-to-door team.') +
      '<div class="actions" style="justify-content:center;margin-top:8px"><button class="btn mc big" id="go">Open the gates</button></div></div>';
    GFX.refit();
    $('#go').onclick = function () { Sound.fanfare(); startRush(); };
  }
  function startRush() {
    st.phase = 'rush'; ctx.phase('3/3 Distribution: keep people moving');
    dock.innerHTML = '<div class="dock-inner" id="rush-dock"><div class="row" style="justify-content:space-between"><span class="chip" id="served">Served: 0</span><span class="small muted">Tap a bubble, then a station.</span></div></div>';
    GFX.refit();
    // houses that may call for door-to-door help
    st.houses = TUKULS.map(function (t) { return { x: t[0], z: t[1], active: false, served: false }; });
    // pick event calls
    var evs = shuffle(M.events).slice(0, M.eventsPerRun || 4), lastEv = evs.filter(function (e) { return e.last; });
    evs = evs.filter(function (e) { return !e.last; }).concat(lastEv);
    st.events = evs.map(function (e, i) { var f = e.last ? 0.985 : (0.14 + i * (0.76 / Math.max(1, evs.length - (lastEv.length ? 1 : 0)))); return { e: e, at: f * rushLen, done: false }; });
    ctx.timer(rushLen);
  }
  function callHouse() {
    var free = st.houses.filter(function (h) { return !h.active && !h.served; }); if (!free.length) return;
    var h = pick(free); h.active = true; h.patience = R.patience * 1.4 * pf; h.max = h.patience;
    var b = el('<button class="bub flag" type="button" aria-label="A household on the list cannot reach the site">' + icon('house', '#fff', 'class="ic"') +
      '<svg class="ring" viewBox="0 0 36 36"><circle cx="18" cy="18" r="16" fill="none" stroke="rgba(255,255,255,.55)" stroke-width="3"/><circle class="pc" cx="18" cy="18" r="16" fill="none" stroke="#F5B301" stroke-width="3.4" stroke-dasharray="100.5" stroke-dashoffset="0" stroke-linecap="round"/></svg></button>');
    b.onclick = function (e) { e.stopPropagation(); if (!ctx.busy) tapHouse(h); };
    h.bub = GFX.addLabel(b, function () { return [h.x, 2.9, h.z]; }, { sep: true }); h.pc = b.querySelector('.pc');
    Sound.pop();
    if (!st.firstOk.houseTip) { st.firstOk.houseTip = true; toast('A family on the list <b>cannot reach the site</b>. Tap the pink house bubble, then the door-to-door team.', 'info', 4200); }
  }
  function runEvent(ev) {
    var E = ev.e; ev.done = true; st.cur = E; run.blocking = true; select(null);
    var opts = shuffle(E.options), speaker = E.speaker || 'majok';
    var pos = CAST[speaker] || CAST.you, mark = el('<span class="bub" style="--bc:#F5B301;pointer-events:none">' + '<b style="color:#14213D;font-size:22px">!</b></span>');
    var markL = GFX.addLabel(mark, function () { return [pos[0], 2.4, pos[1]]; });
    Sound.alarm();
    dock.innerHTML = '<div class="dock-inner">' + sayHTML(speaker, fmt(E.prompt, true)) +
      '<div class="options" id="ev-opts">' + opts.map(function (o, i) { return '<button class="opt" type="button" data-i="' + E.options.indexOf(o) + '"><span class="k">' + letter(i) + '</span><span>' + fmt(o.text, true) + '</span></button>'; }).join('') + '</div></div>';
    GFX.refit();
    $$('#ev-opts .opt').forEach(function (b) {
      b.onclick = function () {
        if (!run || run.ended || run.paused) return;
        var o = E.options[Number(b.getAttribute('data-i'))], r = b.getBoundingClientRect();
        $$('#ev-opts .opt').forEach(function (x) { x.disabled = true; if (E.options[Number(x.getAttribute('data-i'))].correct) x.classList.add('right'); else if (x === b) x.classList.add('wrong'); });
        GFX.removeLabel(markL);
        run.blocking = false;
        if (o.critical) { ctx.answer({ correct: false, critical: o.critical, id: E.id, ref: E.ref, why: E.explain, at: { x: r.left + 40, y: r.top }, focus: [pos[0], 1, pos[1]] }); return; }
        ctx.answer({ correct: !!o.correct, id: E.id, ref: E.ref, title: o.correct ? 'Good call' : 'Not quite', why: o.correct ? E.explain : (o.why || E.explain), at: { x: r.left + 40, y: r.top } });
        later(function () { if (run && !run.ended && st.phase === 'rush') { dock.innerHTML = '<div class="dock-inner" id="rush-dock"><div class="row" style="justify-content:space-between"><span class="chip" id="served">Served: ' + st.served + '</span><span class="small muted">Tap a bubble, then a station.</span></div></div>'; GFX.refit(); } if (E.last) endRush(); }, 1100);
      };
    });
  }
  function endRush() {
    if (st.ended || !run || run.ended) return; st.ended = true;
    st.phase = 'done'; ctx.timer(null); ctx.phase('Distribution complete!');
    var pendingEv = st.events.filter(function (e) { return !e.done && e.e.last; })[0];
    if (pendingEv) { st.ended = false; st.phase = 'rush'; return runEvent(pendingEv); }
    Sound.fanfare(); confetti();
    dock.innerHTML = '<div class="dock-inner">' + sayHTML('mabior', 'Well done. <b>' + st.served + '</b> households served today, fairly and safely.') + '</div>';
    GFX.refit();
    later(function () { ctx.finish(); }, 2200);
  }

  /* ---------------- per-frame update ---------------- */
  var speed = 2.6;
  v.update = function (dt, t) {
    if (tween) {
      tween.t += dt; var k = clamp(tween.t / tween.d, 0, 1), e2 = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
      cam.position.lerpVectors(tween.fromP, tween.toP, e2); var tt = tween.fromT.clone().lerp(tween.toT, e2); cam.lookAt(tt);
      if (k >= 1) tween = null;
    }
    if (gl) {
      rings.forEach(function (r) { if (r.t < -5) return; r.t += dt; if (r.t < 0) return; var s = 1 + r.t * 7; r.m.scale.setScalar(s); r.m.material.opacity = Math.max(0, 0.8 - r.t * 0.55); if (r.t > 1.6) { r.t = -9; r.m.material.opacity = 0; } });
      Object.keys(st.stations).forEach(function (k2) { var s = st.stations[k2]; if (s.mesh && s.born < 1) { s.born = Math.min(1, s.born + dt * 2.6); var b = s.born, sc = reduceMotion ? 1 : (b < 0.7 ? b / 0.7 * 1.15 : 1.15 - (b - 0.7) / 0.3 * 0.15); s.mesh.scale.setScalar(Math.max(0.01, sc)); } });
      st.plots.forEach(function (p) { if (p.mesh && !p.station && st.phase === 'build') p.mesh.userData.ring.scale.setScalar(1 + Math.sin(t * 4) * 0.04); });
      Object.keys(CAST).forEach(function (k3) { var o = CAST[k3].obj; if (o) o.userData.body.position.y = reduceMotion ? 0 : Math.abs(Math.sin(t * 2 + k3.length)) * 0.03; });
    }
    if (ctx.busy || st.phase !== 'rush') { syncPeople(dt, t, true); return; }
    // rush clock
    st.rushT += dt; ctx.timer(rushLen - st.rushT);
    if (st.rushT >= rushLen) { syncPeople(dt, t, true); return endRush(); }
    var ev = st.events.filter(function (e) { return !e.done && !e.e.last && st.rushT >= e.at; })[0];
    if (ev) return runEvent(ev);
    st.spawnT -= dt; if (st.spawnT <= 0 && st.rushT < rushLen - 8) { spawn(); st.spawnT = R.spawnEvery * pf * (0.75 + Math.random() * 0.5); }
    st.doorT -= dt; if (st.doorT <= 0 && st.rushT < rushLen - 14) { callHouse(); st.doorT = R.doorToDoorEvery * pf; }
    // houses waiting
    st.houses.forEach(function (h) {
      if (!h.active) return; h.patience -= dt;
      if (h.pc) h.pc.setAttribute('stroke-dashoffset', String(Math.round((1 - clamp(h.patience / h.max, 0, 1)) * 100.5)));
      if (h.patience <= 0) { h.active = false; h.served = true; if (h.bub) { GFX.removeLabel(h.bub); h.bub = null; } if (st.sel && st.sel.h === h) select(null); ctx.answer({ correct: false, id: 'door', ref: M.routing.door.ref, title: 'Missed a household', why: M.routing.door.why, at: scr(h.x, 2, h.z), costLife: false }); }
      else if (h.queued && st.team && !st.team.busy) { h.queued = false; dispatchTeam(h, st.stations.door); }
    });
    // door-to-door team cart
    if (st.team && st.team.busy) {
      var tm = st.team, tgt = tm.path[tm.legs], dx = tgt[0] - tm.x, dz = tgt[1] - tm.z, dd = Math.hypot(dx, dz), stp = 3.2 * dt;
      if (dd <= stp) { tm.x = tgt[0]; tm.z = tgt[1]; tm.legs++; if (tm.legs >= tm.path.length) { tm.busy = false; st.served++; updServed(); } }
      else { tm.x += dx / dd * stp; tm.z += dz / dd * stp; }
      if (gl) { if (!cart) { cart = M3.station('door', KIT); cart.scale.setScalar(0.55); scene.add(cart); } cart.visible = true; cart.position.set(tm.x, 0, tm.z); cart.rotation.y = -Math.atan2(dz, dx); }
    } else if (cart) cart.visible = false;
    syncPeople(dt, t, false);
  };
  function updServed() { var s = $('#served'); if (s) s.textContent = 'Served: ' + st.served; }
  function syncPeople(dt, t, frozen) {
    for (var i = st.people.length - 1; i >= 0; i--) {
      var p = st.people[i];
      if (!frozen) stepPerson(p, dt);
      if (p.o) {
        var g = p.o.g; g.position.set(p.x, 0, p.z);
        if (p.state === 'walk' && !frozen && !reduceMotion) { g.userData.body.position.y = Math.abs(Math.sin(t * 9 + i)) * 0.06; }
        else g.userData.body.position.y = 0;
        if (p.face != null) g.rotation.y = p.face;
        p.o.kit.visible = !!p.kit;
      }
      if (p.pc && p.state === 'wait') { var f = clamp(p.patience / p.maxPatience, 0, 1), off = Math.round((1 - f) * 100.5); if (off !== p.lastPc) { p.lastPc = off; p.pc.setAttribute('stroke-dashoffset', String(off)); p.pc.setAttribute('stroke', f < 0.3 ? '#E5484D' : '#F5B301'); } }
    }
  }
  function stepPerson(p, dt) {
    if (p.state === 'walk') {
      var tgt = p.path[0]; if (!tgt) { p.state = 'idle'; return; }
      var dx = tgt[0] - p.x, dz = tgt[1] - p.z, d = Math.hypot(dx, dz), s = speed * dt;
      if (d > 0.001) p.face = Math.atan2(dx, dz);
      if (d <= s) { p.x = tgt[0]; p.z = tgt[1]; p.path.shift(); if (!p.path.length) { p.state = 'idle'; var f = p.onArrive; p.onArrive = null; if (f) f(); } }
      else { p.x += dx / d * s; p.z += dz / d * s; }
      return;
    }
    if (p.state === 'wait') {
      p.patience -= dt;
      if (p.patience <= 0) {
        hideBubble(p); p.state = 'walk'; p.at = 'leaving'; p.spot = null;
        ctx.answer({ correct: false, id: 'patience', ref: M.routing.patience.ref, title: 'Someone gave up waiting', why: M.routing.patience.why, at: scr(p.x, 1.6, p.z), costLife: false });
        walkTo(p, [[p.x - 1, p.z + 1.8], [-12.5, p.z + 1.8]], function () { release(p); });
      }
      return;
    }
    if (p.state === 'queue') {
      var s2 = st.stations[p.at]; if (!s2) return;
      if (p.at === 'waiting') { p.proc += dt; if (p.proc >= 1.4) { p.proc = 0; var wi = s2.queue.indexOf(p); if (wi >= 0) s2.queue.splice(wi, 1); finishAt(p, 'waiting'); } return; }
      var idx = s2.queue.indexOf(p);
      if (idx > 0) { var sp = serviceSpot(s2, idx); p.x = lerp(p.x, sp[0], Math.min(1, dt * 4)); p.z = lerp(p.z, sp[1], Math.min(1, dt * 4)); return; }
      var sp0 = serviceSpot(s2, 0); p.x = lerp(p.x, sp0[0], Math.min(1, dt * 5)); p.z = lerp(p.z, sp0[1], Math.min(1, dt * 5)); p.face = Math.PI;
      p.proc += dt;
      var need = { register: 1.3, complaints: 1.6, aid: 1.6, waiting: 1.4, handout: 1.0 }[p.at] || 1.2;
      if (p.proc >= need) { p.proc = 0; s2.queue.shift(); finishAt(p, s2.id); }
    }
  }
  function finishAt(p, sid) {
    var s = st.stations;
    if (sid === 'register') {
      if (p.notListed) {
        p.need = 'notListed'; p.at = 'register-side'; p.state = 'walk';
        walkTo(p, [[s.register.x + 0.9, s.register.z + 1.9]], function () { p.state = 'wait'; p.patience = p.maxPatience; showBubble(p); });
        return;
      }
      p.at = 'waiting'; var w = s.waiting, k = (st.seat = ((st.seat || 0) + 1) % 6);
      s.waiting.queue.push(p); walkTo(p, [[w.x - 0.9 + (k % 3) * 0.9, w.z + 0.2 + Math.floor(k / 3) * 0.8]], function () { p.state = 'queue'; });
      return;
    }
    if (sid === 'waiting') { p.at = 'handout'; s.handout.queue.push(p); var hp = serviceSpot(s.handout, s.handout.queue.length - 1); walkTo(p, [hp], function () { p.state = 'queue'; }); return; }
    if (sid === 'handout') {
      p.kit = true; st.served++; updServed();
      p.at = 'exit'; walkTo(p, [[s.exit.x, s.exit.z + 1.2], [12.5, s.exit.z + 1.2]], function () { release(p); });
      return;
    }
    if (sid === 'aid') { p.need = 'register'; p.at = 'register'; s.register.queue.push(p); walkTo(p, [serviceSpot(s.register, s.register.queue.length - 1)], function () { p.state = 'queue'; }); return; }
    if (sid === 'complaints') { p.at = 'leaving'; walkTo(p, [[p.x, FZ + 2.4], [p.x < 0 ? -12.5 : 12.5, FZ + 2.4]], function () { release(p); }); return; }
  }

  /* ---------------- 2D fallback drawing ---------------- */
  v.draw2d = function (g, Pj) {
    var s = Pj.s;
    g.fillStyle = '#D8A879'; g.fillRect(0, 0, Pj.W, Pj.H);
    function rectW(x0, z0, x1, z1, col) { var a = Pj.project(x0, 0, z0), b = Pj.project(x1, 0, z1); g.fillStyle = col; g.fillRect(Math.min(a.x, b.x), Math.min(a.y, b.y), Math.abs(b.x - a.x), Math.abs(b.y - a.y)); }
    rectW(-10.6, -5.5, 10.6, 3.9, '#E3BC90'); rectW(-12, FZ - 0.8, 12, FZ + 0.8, '#C2865A');
    TUKULS.forEach(function (tk) { var q = Pj.project(tk[0], 0, tk[1]); g.fillStyle = '#B08A4E'; g.beginPath(); g.arc(q.x, q.y, 0.9 * s, 0, Math.PI * 2); g.fill(); g.fillStyle = '#D9B98C'; g.beginPath(); g.arc(q.x, q.y, 0.45 * s, 0, Math.PI * 2); g.fill(); });
    st.plots.forEach(function (p) { if (p.station) return; var q = Pj.project(p.x, 0, p.z); g.strokeStyle = p.kind === 'path' ? M.color : '#FFFFFF'; g.lineWidth = 3; g.beginPath(); g.arc(q.x, q.y, 0.95 * s, 0, Math.PI * 2); g.stroke(); });
    Object.keys(st.stations).forEach(function (k) { var o = st.stations[k], q = Pj.project(o.x, 0, o.z), w = (o.id === 'waiting' ? 2.6 : 1.5) * s; g.fillStyle = o.id === 'waiting' ? '#2C7FB8' : (o.id === 'aid' ? '#F4EFE6' : '#C49A6C'); g.fillRect(q.x - w / 2, q.y - 0.5 * s, w, s); g.strokeStyle = '#5B3A1E'; g.lineWidth = 2; g.strokeRect(q.x - w / 2, q.y - 0.5 * s, w, s); });
    Object.keys(CAST).forEach(function (k) { var q = Pj.project(CAST[k][0], 0, CAST[k][1]); g.fillStyle = '#333'; g.beginPath(); g.arc(q.x, q.y, 0.28 * s, 0, Math.PI * 2); g.fill(); });
    st.people.forEach(function (p) { var q = Pj.project(p.x, 0, p.z); g.fillStyle = p.color; g.beginPath(); g.arc(q.x, q.y, 0.3 * s, 0, Math.PI * 2); g.fill(); if (p.kit) { g.fillStyle = KIT; g.fillRect(q.x - 0.15 * s, q.y - 0.5 * s, 0.3 * s, 0.22 * s); } });
    if (st.team && st.team.busy) { var q2 = Pj.project(st.team.x, 0, st.team.z); g.fillStyle = '#8B5E34'; g.fillRect(q2.x - 0.4 * s, q2.y - 0.25 * s, 0.8 * s, 0.5 * s); }
  };

  v.dispose = function () {
    canvas.removeEventListener('pointerdown', onDown); canvas.removeEventListener('pointerup', onUp);
    ctx.onCritical = null;
    if (scene) scene.traverse(function (o) { if (o.geometry) o.geometry.dispose(); if (o.material && o.material !== M3.material()) o.material.dispose(); });
  };
  GFX.setView(v);
  if (cam) cam.userData.placed = false;
  run.debug = { st: st, M: M };
  phaseAnnounce();
} };
