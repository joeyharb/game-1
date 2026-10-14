/* =============================================================================
 * MISSION 3: REQUEST BUILDER  (SOP §4.4)
 * Snap the pieces of the request into the form board, pick the hub on the
 * map, send it, then follow it through the three review gates.
 * ========================================================================== */
Missions.M3 = { start: function (M, ctx) {
  var trk = Store.get().track || 'SNFI';
  var sc = pick(M.scenarios.filter(function (s) { return s.track === trk; }));
  var BUILD = { minX: -8.2, maxX: 7.4, minZ: -3.2, maxZ: 3.6, maxY: 3.2 };
  var REVIEW = { minX: -9.5, maxX: 9.5, minZ: -8.6, maxZ: -4.2, maxY: 2.6 };
  var v = Kit.view({ bounds: BUILD, elev: 50 });
  var BOARD = { x: -3.6, z: -1.2 }, MAP = { x: 3.4, z: 0.4 };
  var GX = [-5, 0, 5], GZ = -6.4;
  var st = { phase: 'build', sel: null, filled: {}, hubOk: false, pieces: [], slotL: {}, env: null, envX: -9, busy: false };
  var vars = { hh: sc.hh, people: sc.hh * 6, assessed: sc.assessed, kit: sc.kit };
  function sub(t) { return String(t).replace(/\{(\w+)\}/g, function (m, k) { return vars[k] != null ? (typeof vars[k] === 'number' ? fmtNum(vars[k]) : vars[k]) : m; }); }

  /* ---------- scene ---------- */
  var slotPos = {};
  M.slots.forEach(function (s, i) { slotPos[s.id] = [BOARD.x - 2.6 + (i % 2) * 2.6 + 1.3, 2.75 - Math.floor(i / 2) * 0.8, BOARD.z + 0.12]; });
  var hubs = M.hubs.filter(function (h) { return h.notTrack !== trk; });
  if (v.gl) {
    var P = [], rr = (function (s) { return function () { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; })(13);
    P.push(M3.part(M3.G.plane(70, 50), '#B9D27F', [0, 0, 0]));
    P.push(M3.part(M3.G.box(18, 0.03, 8), '#E9D8BE', [0, 0.012, 0]));
    // the form board on two legs
    P.push(M3.part(M3.G.box(5.6, 3.0, 0.12), '#FFFFFF', [BOARD.x, 2.0, BOARD.z])); P.push(M3.part(M3.G.box(5.8, 0.25, 0.16), '#19A7E0', [BOARD.x, 3.55, BOARD.z]));
    P.push(M3.part(M3.G.box(0.12, 2.0, 0.12), '#8B5E34', [BOARD.x - 2.4, 0.6, BOARD.z])); P.push(M3.part(M3.G.box(0.12, 2.0, 0.12), '#8B5E34', [BOARD.x + 2.4, 0.6, BOARD.z]));
    M.slots.forEach(function (s) { var p = slotPos[s.id]; P.push(M3.part(M3.G.box(2.3, 0.6, 0.05), '#E6EEFA', [p[0], p[1], p[2]])); });
    // the map table: a stylised (not to scale) South Sudan
    P.push(M3.part(M3.G.box(6.4, 0.2, 7.4), '#8B5E34', [MAP.x, 0.9, MAP.z])); P.push(M3.part(M3.G.box(6.0, 0.06, 7.0), '#CDE3A8', [MAP.x, 1.02, MAP.z]));
    [[-2.9, -3.3], [2.9, -3.3], [-2.9, 3.3], [2.9, 3.3]].forEach(function (o) { P.push(M3.part(M3.G.box(0.15, 0.85, 0.15), '#6E4826', [MAP.x + o[0], 0.42, MAP.z + o[1]])); });
    var nile = []; for (var k = 0; k <= 16; k++) nile.push([MAP.x + 1.6 + Math.sin(k * 0.5) * 0.4, MAP.z + 3.3 - k * 0.42]); P.push(M3.ribbon(nile, 0.22, '#5FB4E0', 1.06));
    // review road with three gates
    var road = []; for (var r = 0; r <= 20; r++) road.push([-10 + r, GZ]); P.push(M3.ribbon(road, 1.4, '#C9895A', 0.02));
    GX.forEach(function (x) { P.push(M3.part(M3.G.box(0.16, 2.0, 0.16), '#555555', [x, 1, GZ - 0.9])); P.push(M3.part(M3.G.box(0.16, 2.0, 0.16), '#555555', [x, 1, GZ + 0.9])); P.push(M3.part(M3.G.box(0.2, 0.3, 2.0), '#19A7E0', [x, 2.0, GZ])); });
    P.push(M3.part(M3.G.box(3.0, 1.6, 2.0), '#F7F3EA', [8.6, 0.8, GZ])); P.push(M3.part(M3.G.box(3.3, 0.16, 2.3), '#D6246E', [8.6, 1.64, GZ]));
    for (var t = 0; t < 14; t++) { var x = -16 + rr() * 32, z = -13 + rr() * 26; if (Math.abs(x) < 10 && z > -9 && z < 5) continue; M3.acacia(P, x, z, 0.8 + rr() * 0.4); }
    v.scene.add(M3.mesh(P, { receive: true }));
    hubs.forEach(function (h) { var pin = M3.mesh([M3.part(M3.G.cyl(0.04, 0.04, 0.6, 5), '#333333', [0, 0.3, 0]), M3.part(M3.G.ball(0.17, 1), h.id === 'Juba' ? '#0033A0' : '#E5484D', [0, 0.65, 0])]); pin.position.set(MAP.x + h.x * 0.85, 1.05, MAP.z + h.z * 0.85); v.scene.add(pin); h.mesh = pin; });
    var lual = M3.person({ skin: '#6B4226', shirt: '#0033A0', hair: 'cap', hairColor: '#0033A0' }); lual.position.set(0, 0, 1.6); v.scene.add(lual);
    st.env = M3.mesh([M3.part(M3.G.box(0.9, 0.08, 0.6), '#FFFFFF'), M3.part(M3.G.box(0.5, 0.09, 0.08), '#19A7E0', [0, 0, -0.1])]); st.env.position.set(-9, 1.2, GZ); st.env.visible = false; v.scene.add(st.env);
  }
  Kit.tag('Request form · ' + esc(C.meta.mockLabel), function () { return st.phase === 'build' ? [BOARD.x, 4.1, BOARD.z] : null; }, null, 'mock');
  Kit.tag('Not to scale', function () { return st.phase === 'build' ? [MAP.x, 1.2, MAP.z + 3.6] : null; });
  hubs.forEach(function (h) { h.label = Kit.tag(esc(h.id), function () { return st.phase === 'build' ? [MAP.x + h.x * 0.85, 1.9, MAP.z + h.z * 0.85] : null; }, function () { tapHub(h); }); });
  M.slots.forEach(function (s) {
    var L = Kit.tag('<b>' + esc(s.label) + '</b>', function () { return st.phase === 'build' ? slotPos[s.id] : null; }, function () { tapSlot(s); }, 'slot');
    st.slotL[s.id] = L;
  });
  GX.forEach(function (x, i) { var g = M.gates[i]; Kit.tag((i + 1) + ' ' + esc(g.label) + ' · ' + esc(g.time), function () { return st.phase === 'review' ? [x, 2.6, GZ] : null; }); });

  /* ---------- pieces ---------- */
  M.slots.forEach(function (s) {
    var list = s.pieces[trk] || s.pieces.ALL || [];
    list.forEach(function (p, i) { st.pieces.push({ id: s.id + '-' + i, slot: s.id, text: sub(p.text), ok: !!p.ok, why: p.why, ref: s.ref, used: false }); });
  });
  st.pieces = shuffle(st.pieces);

  function header() { return '<div class="small" style="margin-bottom:6px"><span class="chip">' + esc(Store.get().track || 'SNFI') + '</span> <b>' + esc(sc.place) + '</b> · ' + fmtNum(sc.hh) + ' households assessed ' + esc(sc.assessed) + ' · ' + esc(sc.kit) + '</div>'; }
  function tray() {
    if (st.phase !== 'build') return;
    var left = M.slots.filter(function (s) { return !st.filled[s.id]; }).length + (st.hubOk ? 0 : 1);
    Kit.say(null, header() + 'Tap a piece, then its slot on the board. Tap the right <b>hub</b> on the map. <b>' + left + '</b> to go.',
      '<div class="tray" id="tray">' + st.pieces.filter(function (p) { return !p.used; }).map(function (p) { return '<button class="scard" style="width:150px" type="button" aria-pressed="' + (st.sel === p) + '" data-id="' + p.id + '"><span>' + fmt(p.text, false) + '</span></button>'; }).join('') + '</div>' +
      (left === 0 ? Kit.buttons([{ id: 'send', text: 'Send the request' }]) : ''));
    $$('#tray .scard').forEach(function (b) { b.onclick = function () { if (ctx.busy) return; var p = st.pieces.filter(function (x) { return x.id === b.getAttribute('data-id'); })[0]; st.sel = st.sel === p ? null : p; Sound.tap(); tray(); }; });
    var sb = $('#send'); if (sb) sb.onclick = send;
    Object.keys(st.slotL).forEach(function (k) { st.slotL[k].node.classList.toggle('target', !!st.sel && !st.filled[k]); });
  }
  function scr(p) { return GFX.project(p[0], p[1], p[2]); }
  function tapSlot(s) {
    if (st.phase !== 'build' || ctx.busy || st.filled[s.id]) return;
    if (!st.sel) { toast('Pick a <b>piece</b> below first.', 'info', 2000); return; }
    var p = st.sel, at = scr(slotPos[s.id]);
    if (p.slot !== s.id) { var right = M.slots.filter(function (x) { return x.id === p.slot; })[0]; ctx.answer({ correct: false, id: 'slot-' + p.slot, ref: M.ref, title: 'Other slot', why: 'That piece goes in "' + right.label + '".', at: at, costLife: false }); return; }
    p.used = true; st.sel = null;
    if (!p.ok) { ctx.answer({ correct: false, id: p.id, ref: p.ref, title: 'Not for this request', why: p.why, at: at }); tray(); return; }
    st.filled[s.id] = p; st.slotL[s.id].node.innerHTML = '&#10003; ' + esc(p.text); st.slotL[s.id].node.classList.add('ok');
    // the wrong pieces for this slot leave the tray
    st.pieces.forEach(function (x) { if (x.slot === s.id && !x.used) { x.used = true; x.auto = true; } });
    ctx.answer({ correct: true, id: p.id, ref: p.ref, title: s.label, at: at, silent: true });
    Sound.build(); tray();
  }
  function tapHub(h) {
    if (st.phase !== 'build' || ctx.busy || st.hubOk) return;
    var at = GFX.project(MAP.x + h.x * 0.85, 1.6, MAP.z + h.z * 0.85), right = hubs.filter(function (x) { return x.id === sc.hub; })[0];
    if (h.id !== sc.hub) { ctx.answer({ correct: false, id: 'hub', ref: M.hubRef, title: 'Not the nearest hub', why: h.id + ' covers ' + h.covers + '. Your site is in ' + sc.place + ': ' + right.id + ' covers ' + right.covers + '.', at: at }); return; }
    st.hubOk = true; h.label.node.innerHTML = '&#10003; ' + esc(h.id); h.label.node.classList.add('ok');
    ctx.answer({ correct: true, id: 'hub', ref: M.hubRef, title: 'Warehouse: ' + h.id, why: h.id + ' covers ' + h.covers + '.', at: at });
    tray();
  }
  Kit.taps(v, function () { return st.phase === 'build' && !st.hubOk ? hubs.map(function (h) { return { x: MAP.x + h.x * 0.85, z: MAP.z + h.z * 0.85, r: 0.45, h: 1.6, hub: h }; }) : []; },
    function (hit) { tapHub(hit.hub); });

  /* ---------- review ---------- */
  function send() {
    if (ctx.busy || st.phase !== 'build') return;
    st.phase = 'review'; ctx.phase('Review: 5 days at most');
    st.pieces.forEach(function (p) { if (!p.ok && p.auto) ctx.answer({ correct: true, id: p.id, ref: p.ref, silent: true }); });
    Sound.whoosh();
    Kit.say('lual', 'Sent! Your request now goes through three gates. Quote its reference in every later email.');
    v.camTo(REVIEW, 1.0);
    if (st.env) st.env.visible = true;
    var evs = shuffle(M.events).slice(0, M.eventsPerRun || 2), gate = 0;
    function to(x, cb) { st.target = x; st.onReach = cb; }
    (function next() {
      if (!run || run.ended) return;
      if (gate >= GX.length) return to(8.2, done);
      var gx = GX[gate];
      to(gx, function () {
        Sound.stamp(); toast('<b>Gate ' + (gate + 1) + ' passed:</b> ' + esc(M.gates[gate].label) + ' (' + esc(M.gates[gate].time) + ').' + refChip(M.gatesRef), 'info', 2400);
        var E = evs[gate]; gate++;
        if (E) { st.busy = true; Kit.choice(E, { pos: [gx, GZ], h: 2.4, done: function () { st.busy = false; next(); } }); }
        else later(next, 600);
      });
    })();
    function done() {
      Sound.fanfare(); confetti();
      Kit.say('nyakuoth', '<b>Endorsed!</b> The cluster approved your request and forwarded it to the CP team. Next: book the collection.');
      later(function () { ctx.finish(); }, 2200);
    }
  }

  v.update = function (dt, t) {
    v.tween(dt);
    if (st.phase === 'review' && st.target != null && !ctx.busy && !st.busy) {
      var s = (reduceMotion ? 20 : 4.2) * dt;
      if (Math.abs(st.target - st.envX) <= s) { st.envX = st.target; st.target = null; var f = st.onReach; st.onReach = null; if (f) f(); }
      else st.envX += Math.sign(st.target - st.envX) * s;
    }
    if (st.env) { st.env.position.set(st.envX, 1.2 + (reduceMotion ? 0 : Math.sin(t * 6) * 0.08), GZ); st.env.rotation.y = reduceMotion ? 0 : Math.sin(t * 3) * 0.2; }
  };
  v.draw2d = function (g, Pj) {
    g.fillStyle = '#B9D27F'; g.fillRect(0, 0, Pj.W, Pj.H);
    Kit.d2.rect(g, Pj, -9, -4, 9, 4, '#E9D8BE');
    Kit.d2.box(g, Pj, BOARD.x, BOARD.z, 5.6, 0.4, '#FFFFFF');
    Kit.d2.box(g, Pj, MAP.x, MAP.z, 6.0, 7.0, '#CDE3A8');
    hubs.forEach(function (h) { Kit.d2.dot(g, Pj, MAP.x + h.x * 0.85, MAP.z + h.z * 0.85, 0.2, '#E5484D'); });
    Kit.d2.rect(g, Pj, -10, GZ - 0.7, 10, GZ + 0.7, '#C9895A');
    GX.forEach(function (x) { Kit.d2.box(g, Pj, x, GZ, 0.3, 2, '#19A7E0'); });
    if (st.phase === 'review') Kit.d2.box(g, Pj, st.envX, GZ, 0.9, 0.6, '#FFFFFF');
  };
  Kit.start(v, ctx);
  run.debug = { st: st, M: M, sc: sc };
  ctx.phase('Build the request');
  tray();
} };
