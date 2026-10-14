/* =============================================================================
 * MISSION 4: WAREHOUSE PICKUP  (SOP §4.5)
 * Book the collection (24 hours ahead, within the 15-day hold), drive in,
 * tap the damaged cartons, spot the item that does not belong in the kit,
 * sign the issuance form: the truck turns your colour.
 * ========================================================================== */
Missions.M4 = { start: function (M, ctx) {
  var T = track(), trk = Store.get().track || 'SNFI';
  var B = { minX: -10, maxX: 8.5, minZ: -5.6, maxZ: 5.4, maxY: 3 };
  var PAL = { minX: -1.2, maxX: 5.6, minZ: -0.6, maxZ: 3.6, maxY: 1.6 };
  var v = Kit.view({ bounds: B, elev: 50 });
  var BAY = [0.2, 1.4], START = [-12, 3.6], PALLET = [2.2, 1.6];
  var st = { phase: 'book', truck: { x: START[0], z: START[1], path: [], onArrive: null }, cartons: [], found: 0, busy: false };
  var evs = shuffle(M.events).slice(0, M.eventsPerRun || 2);
  var ngoColor = Store.get().truckColor || C.ngo.color, sweep = -1;

  /* ---------- scene ---------- */
  var truckGrey = null, truckNgo = null, ring = null;
  if (v.gl) {
    var P = [], rr = (function (s) { return function () { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; })(23);
    P.push(M3.part(M3.G.plane(70, 50), '#B9D27F', [0, 0, 0]));
    P.push(M3.part(M3.G.box(19, 0.03, 11), '#BFC4CC', [-0.6, 0.012, -0.2]));
    // the IOM warehouse
    P.push(M3.part(M3.G.box(11, 3.0, 4.6), '#F2F4F7', [0.6, 1.5, -3.2])); P.push(M3.part(M3.G.box(11.4, 0.25, 5.0), '#0033A0', [0.6, 3.1, -3.2]));
    P.push(M3.part(M3.G.box(11.05, 0.4, 0.05), '#0033A0', [0.6, 2.4, -0.88]));
    P.push(M3.part(M3.G.box(3.0, 2.2, 0.06), '#5B6475', [BAY[0], 1.1, -0.86])); P.push(M3.part(M3.G.box(2.4, 2.2, 0.06), '#5B6475', [-3.6, 1.1, -0.86])); P.push(M3.part(M3.G.box(2.4, 2.2, 0.06), '#5B6475', [4.6, 1.1, -0.86]));
    P.push(M3.part(M3.G.box(4.2, 0.4, 1.4), '#9AA6BD', [BAY[0], 0.2, -0.2]));
    // stacked stock inside the open door and on the side
    for (var sx = 0; sx < 4; sx++) for (var sy = 0; sy < 3; sy++) P.push(M3.part(M3.G.box(0.5, 0.36, 0.4), T.color, [-3.9 + sx * 0.55, 0.18 + sy * 0.37, -0.3]));
    // gate and fence
    P.push(M3.part(M3.G.box(0.3, 2.0, 0.3), '#555555', [-9.6, 1, 2.2])); P.push(M3.part(M3.G.box(0.3, 2.0, 0.3), '#555555', [-9.6, 1, 5.0])); P.push(M3.part(M3.G.box(0.3, 0.3, 3.1), '#0033A0', [-9.6, 2, 3.6]));
    for (var fz = -5.5; fz <= 1.7; fz += 1.2) P.push(M3.part(M3.G.box(0.09, 1.2, 0.09), '#777777', [-9.6, 0.6, fz]));
    var road = []; for (var r = 0; r <= 20; r++) road.push([-22 + r, 3.6]); P.push(M3.ribbon(road, 2.4, '#C9895A', 0.02));
    for (var t = 0; t < 14; t++) { var x = -18 + rr() * 34, z = -12 + rr() * 24; if (x > -11 && x < 10 && z > -7 && z < 6.4) continue; M3.acacia(P, x, z, 0.8 + rr() * 0.4); }
    v.scene.add(M3.mesh(P, { receive: true }));
    var deng = M3.person({ skin: '#5A3A22', shirt: '#F28C28', hair: 'short' }); deng.position.set(BAY[0] + 2.0, 0, 0.9); v.scene.add(deng);
    truckGrey = M3.truck('#9AA6BD'); v.scene.add(truckGrey);
    truckNgo = M3.truck(ngoColor); truckNgo.visible = false; v.scene.add(truckNgo);
    ring = new THREE.Mesh(M3.G.ring(1.0, 1.3, 32), new THREE.MeshBasicMaterial({ color: ngoColor, transparent: true, opacity: 0 })); ring.position.y = 0.05; v.scene.add(ring);
  }
  Kit.tag('IOM hub warehouse', [0.6, 3.6, -3.2]);
  var bayTag = Kit.tag('Loading bay', function () { return st.phase === 'drive' ? [BAY[0], 1.4, BAY[1]] : null; }, function () { driveIn(); }, 'target');

  /* ---------- cartons on the pallet ---------- */
  var n = M.inspect.cartons || 10, dmg = shuffle(Array.from({ length: n }, function (_, i) { return i; })).slice(0, M.inspect.damaged || 3);
  for (var i = 0; i < n; i++) {
    var c = { i: i, x: PALLET[0] + (i % 5) * 0.62, z: PALLET[1] + Math.floor(i / 5) * 0.62, bad: dmg.indexOf(i) >= 0, checked: false };
    if (v.gl) {
      var parts = [M3.part(M3.G.box(0.52, 0.42, 0.5), c.bad ? '#8A6A44' : '#C9A26B'), M3.part(M3.G.box(0.54, 0.06, 0.1), '#E8D5B0', [0, 0.22, 0])];
      if (c.bad) { parts.push(M3.part(M3.G.box(0.3, 0.2, 0.02), '#4B6E8E', [0.05, 0.02, 0.26])); parts.push(M3.part(M3.G.box(0.04, 0.3, 0.02), '#3A2A1A', [-0.12, 0.05, 0.26], [0, 0, 0.6])); }
      c.mesh = M3.mesh(parts); c.mesh.position.set(c.x, 0.21 + 0.1, c.z); v.scene.add(c.mesh);
    }
    st.cartons.push(c);
  }
  if (v.gl) { var pal = M3.mesh([M3.part(M3.G.box(3.3, 0.12, 1.4), '#8B5E34')]); pal.position.set(PALLET[0] + 1.24, 0.06, PALLET[1] + 0.31); v.scene.add(pal); }

  function scr(x, y, z) { return GFX.project(x, y, z); }

  /* ================= 1. Book the collection ================= */
  function book() {
    st.phase = 'book'; ctx.phase('Book the collection');
    var Bk = M.book, cells = '';
    for (var d = 0; d <= Bk.days; d++) {
      var lbl = d === 0 ? 'Today' : 'Day ' + d;
      cells += '<button class="mchip" type="button" data-d="' + d + '" style="min-width:64px;text-align:center' + (d === Bk.hold ? ';box-shadow:inset -4px 0 0 var(--bad)' : '') + '">' + lbl + '</button>';
    }
    Kit.say('deng', fmt(Bk.prompt, true), '<div class="chips" id="cal">' + cells + '</div><p class="small muted" style="margin:6px 0 0">Red edge: the last day of the 15-day hold.</p>');
    $$('#cal .mchip').forEach(function (b) {
      b.onclick = function () {
        if (ctx.busy || st.phase !== 'book') return;
        var d = Number(b.getAttribute('data-d')), r = b.getBoundingClientRect(), at = { x: r.left + r.width / 2, y: r.top };
        if (d === 0) { b.classList.add('bad'); return ctx.answer({ correct: false, id: 'book-soon', ref: Bk.tooSoon.ref, title: 'Too soon', why: Bk.tooSoon.why, at: at }); }
        if (d > Bk.hold) { b.classList.add('bad'); return ctx.answer({ correct: false, id: 'book-late', ref: Bk.tooLate.ref, title: 'Too late', why: Bk.tooLate.why, at: at }); }
        ctx.answer({ correct: true, id: 'book', ref: Bk.ok.ref, title: 'Booked for day ' + d, why: Bk.ok.why, at: at });
        st.phase = 'drive'; later(drive, 700);
      };
    });
  }
  /* ================= 2. Drive in ================= */
  function drive() {
    ctx.phase('Drive to the loading bay');
    Kit.say('you', 'Collection day. Tap the <b>loading bay</b> to drive in.', Kit.buttons([{ id: 'drive', text: 'Drive in' }]));
    $('#drive').onclick = driveIn;
  }
  function driveIn() {
    if (st.phase !== 'drive' || ctx.busy) return;
    st.phase = 'driving'; Sound.whoosh();
    st.truck.path = [[-8.5, 3.6], [-3.5, 3.6], [BAY[0] - 1.2, BAY[1] + 0.6], [BAY[0], BAY[1] + 0.2]];
    st.truck.onArrive = function () {
      st.busy = true; Kit.choice(evs[0], { pos: [BAY[0] + 2.0, 0.9], done: function () { st.busy = false; inspect(); } });
    };
  }
  /* ================= 3. Inspect the cartons ================= */
  function inspect() {
    st.phase = 'inspect'; ctx.phase('Check the condition');
    v.camTo(PAL, 0.8);
    st.cartons.forEach(function (c) {
      c.bub = Kit.bubble('kit', '#5B6475', 'Check this carton', [c.x, 1.0, c.z], function () { check(c); }, { sep: true });
    });
    Kit.say('deng', 'Here is your load. Check the cartons: tap any that are <b>torn or wet</b>, then tap <b>Done</b>.', Kit.buttons([{ id: 'done-check', text: 'Done checking' }]));
    $('#done-check').onclick = doneCheck;
  }
  function check(c) {
    if (st.phase !== 'inspect' || c.checked || ctx.busy) return;
    var at = scr(c.x, 1, c.z);
    if (!c.bad) { ctx.answer({ correct: false, id: 'carton-ok', ref: M.inspect.good.ref, title: 'This one is fine', why: M.inspect.good.why, at: at, costLife: false }); return; }
    c.checked = true; st.found++; GFX.removeLabel(c.bub);
    c.flag = Kit.tag('&#9888; Damaged', [c.x, 1.0, c.z], null, 'target');
    ctx.answer({ correct: true, id: 'carton', ref: M.inspect.ok.ref, title: 'Damage noted', why: st.found === 1 ? M.inspect.ok.why : '', at: at, silent: st.found > 1 });
  }
  function doneCheck() {
    if (st.phase !== 'inspect' || ctx.busy) return;
    var missed = st.cartons.filter(function (c) { return c.bad && !c.checked; }).length;
    st.cartons.forEach(function (c) { if (c.bub && !c.checked) GFX.removeLabel(c.bub); });
    if (missed) ctx.answer({ correct: false, id: 'carton-missed', ref: M.inspect.missed.ref, title: missed + ' damaged carton' + (missed > 1 ? 's' : '') + ' missed', why: M.inspect.missed.why });
    st.phase = 'event2'; st.busy = true;
    var E = evs[1];
    later(function () { if (!run || run.ended) return; if (E) Kit.choice(E, { pos: [BAY[0] + 2.0, 0.9], done: function () { st.busy = false; kit(); } }); else { st.busy = false; kit(); } }, missed ? 1200 : 300);
  }
  /* ================= 4. Check the kit ================= */
  function kit() {
    st.phase = 'kit'; ctx.phase('Check the kit contents');
    var K = M.kitCheck, theKit = pick(T.kits), intr = pick(K.intruders[trk] || K.intruders.SNFI);
    var items = shuffle(theKit.items.map(function (t) { return { t: t, ok: false }; }).concat([{ t: intr, ok: true }]));
    Kit.say('deng', 'You open one <b>' + esc(theKit.name) + '</b>. ' + fmt(K.prompt, true), '<div class="chips" id="kit">' + items.map(function (it, i) { return '<button class="mchip" type="button" data-i="' + i + '">' + esc(it.t) + '</button>'; }).join('') + '</div>');
    run.debug.kitItems = items;
    $$('#kit .mchip').forEach(function (b) {
      b.onclick = function () {
        if (ctx.busy || st.phase !== 'kit') return;
        var it = items[Number(b.getAttribute('data-i'))], r = b.getBoundingClientRect(), at = { x: r.left + r.width / 2, y: r.top };
        if (!it.ok) { b.classList.add('bad'); return ctx.answer({ correct: false, id: 'kit-item', ref: K.bad.ref, title: 'That belongs in the kit', why: K.bad.why, at: at, costLife: false }); }
        b.classList.add('used');
        ctx.answer({ correct: true, id: 'kit-intruder', ref: K.ok.ref, title: 'Wrong item spotted', why: K.ok.why, at: at });
        st.phase = 'sign'; later(sign, 900);
      };
    });
  }
  /* ================= 5. Sign: the truck becomes yours ================= */
  function sign() {
    ctx.phase('Sign for the kits');
    v.camTo(B, 0.8);
    Kit.choice(M.sign, { pos: [BAY[0] + 2.0, 0.9], done: function () {
      Sound.stamp(); later(Sound.fanfare, 250);
      sweep = 0;
      if (v.gl) { truckNgo.visible = true; truckNgo.scale.set(0.01, 1, 1); }
      toast('<b>Yours now.</b> ' + fmt(M.handover.why, true) + refChip(M.handover.ref), '', 4200);
      Kit.say('deng', '<b>Signed, stamped, dated.</b> The kits are yours. Drive safely!');
      later(function () { ctx.finish(); }, 2800);
    } });
  }

  /* ---------- frame ---------- */
  v.update = function (dt, t) {
    v.tween(dt);
    var tr = st.truck;
    if (tr.path.length && !ctx.busy) {
      var tg = tr.path[0], dx = tg[0] - tr.x, dz = tg[1] - tr.z, d = Math.hypot(dx, dz), s = (reduceMotion ? 30 : 5) * dt;
      tr.ang = Math.atan2(dz, dx);
      if (d <= s) { tr.x = tg[0]; tr.z = tg[1]; tr.path.shift(); if (!tr.path.length && tr.onArrive) { var f = tr.onArrive; tr.onArrive = null; f(); } }
      else { tr.x += dx / d * s; tr.z += dz / d * s; }
    }
    if (v.gl) {
      [truckGrey, truckNgo].forEach(function (m) { m.position.set(tr.x, tr.path.length && !reduceMotion ? Math.abs(Math.sin(t * 14)) * 0.02 : 0, tr.z); m.rotation.y = -(tr.ang || 0); });
      if (sweep >= 0 && sweep < 1) {
        sweep = Math.min(1, sweep + dt * (reduceMotion ? 10 : 1.4));
        truckNgo.scale.set(Math.max(0.01, sweep), 1, 1); truckGrey.visible = sweep < 1;
        ring.position.set(tr.x, 0.05, tr.z); ring.scale.setScalar(1 + sweep * 2); ring.material.opacity = 0.8 * (1 - sweep);
      }
    }
  };
  v.draw2d = function (g, Pj) {
    g.fillStyle = '#B9D27F'; g.fillRect(0, 0, Pj.W, Pj.H);
    Kit.d2.rect(g, Pj, -10, -5.6, 9, 5.3, '#BFC4CC');
    Kit.d2.box(g, Pj, 0.6, -3.2, 11, 4.6, '#0033A0');
    st.cartons.forEach(function (c) { Kit.d2.box(g, Pj, c.x, c.z, 0.5, 0.5, c.bad ? '#8A6A44' : '#C9A26B'); });
    Kit.d2.box(g, Pj, st.truck.x, st.truck.z, 2.2, 1.1, sweep >= 0 ? ngoColor : '#9AA6BD');
  };
  Kit.start(v, ctx);
  run.debug = { st: st, M: M };
  book();
} };
