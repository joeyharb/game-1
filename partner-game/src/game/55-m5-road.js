/* =============================================================================
 * MISSION 5: ROAD TO THE SITE  (SOP §4.5.3, §4.6, §4.6.1, §4.6.2, §4.10)
 * A three-lane drive: swipe or use the arrows to dodge mud and rocks. The
 * truck stops for event calls (RRC clearance first, then three random ones).
 * ========================================================================== */
Missions.M5 = { start: function (M, ctx) {
  var LANES = [-1.8, 0, 1.8], SEG = 8, NSEG = 10, pf = pace();
  var B = { minX: -5.4, maxX: 5.4, minZ: -24, maxZ: 3.2, maxY: 1.5 };
  var v = Kit.view({ bounds: B, elev: 24, rotatePortrait: false, sky: '#CDE8F6', fov: 42 });
  var dur = (M.drive.seconds || 36) * pf, baseSpeed = 11;
  var evs = [M.first].concat(shuffle(M.events).slice(0, M.eventsPerRun || 3));
  var marks = evs.map(function (e, i) { return i === 0 ? 0 : i / evs.length; });
  var st = { phase: 'go', t: 0, lane: 1, x: 0, speed: baseSpeed, slow: 0, segs: [], obs: [], spawn: 1.4, evI: 0, passed: 0, hits: 0, firstHit: true, arrived: false };

  /* ---------- scenery segments that loop past the truck ---------- */
  function segMesh(variant) {
    var P = [], rr = (function (s) { return function () { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; })(97 + variant * 13);
    P.push(M3.part(M3.G.box(30, 0.02, SEG), '#B4CC78', [0, 0, 0]));
    P.push(M3.part(M3.G.box(6.2, 0.04, SEG), '#C9895A', [0, 0.02, 0]));
    P.push(M3.part(M3.G.box(0.12, 0.05, SEG * 0.45), '#E9D2B0', [-0.9, 0.04, 0])); P.push(M3.part(M3.G.box(0.12, 0.05, SEG * 0.45), '#E9D2B0', [0.9, 0.04, 0]));
    P.push(M3.part(M3.G.box(5, 0.03, SEG), '#5FB4E0', [-8.6, 0.03, 0])); P.push(M3.part(M3.G.box(1.2, 0.03, SEG), '#E2C9A0', [-5.7, 0.025, 0]));
    for (var k = 0; k < 4; k++) { var side = rr() < 0.75 ? 1 : -1, x = side > 0 ? 4.4 + rr() * 6 : -12 - rr() * 3, z = -SEG / 2 + rr() * SEG; if (rr() < 0.55) M3.acacia(P, x, z, 0.8 + rr() * 0.5); else M3.bush(P, x, z, 1); }
    if (variant % 3 === 1) M3.tukul('#D9B98C', '#B08A4E', P, 6.4, 0, 0.9);
    if (variant % 4 === 2) { P.push(M3.part(M3.G.box(0.6, 0.12, 2.6), '#8B5E34', [-7, 0.12, 0])); }
    return M3.mesh(P, { receive: true });
  }
  var truck = null, rainG = null;
  if (v.gl) {
    for (var s = 0; s < NSEG; s++) { var m = segMesh(s); m.position.z = 4 - s * SEG; v.scene.add(m); st.segs.push(m); }
    truck = M3.truck(Store.get().truckColor || C.ngo.color); truck.rotation.y = Math.PI / 2; v.scene.add(truck);
    var load = M3.mesh([M3.part(M3.G.box(0.9, 0.3, 1.2), track().color, [0, 0, 0])]); load.position.set(0, 1.35, 0.3); truck.add(load);
    var site = M3.mesh([M3.part(M3.G.box(0.1, 2.2, 0.1), '#8B5E34', [-2.8, 1.1, 0]), M3.part(M3.G.box(0.1, 2.2, 0.1), '#8B5E34', [2.8, 1.1, 0]), M3.part(M3.G.box(5.8, 0.6, 0.06), '#F28C28', [0, 2.0, 0])]);
    site.visible = false; v.scene.add(site); st.site = site;
  }
  var siteTag = Kit.tag('Distribution site', function () { return st.siteZ != null ? [0, 2.6, st.siteZ] : null; }, null, 'target');

  /* ---------- obstacles ---------- */
  function newObstacle() {
    var kind = Math.random() < 0.6 ? 'mud' : 'rock', lane = Math.floor(Math.random() * 3);
    var o = { kind: kind, lane: lane, z: -34, done: false };
    if (v.gl) {
      o.mesh = kind === 'mud' ? M3.mesh([M3.part(M3.G.disc(0.95, 12), '#6B4A2E', [0, 0.05, 0], null, [1, 1, 1.5]), M3.part(M3.G.disc(0.5, 10), '#7E5A3A', [0.2, 0.06, 0.2])], { noCast: true })
                              : M3.mesh([M3.part(M3.G.dodec(0.55), '#8C8C8C', [0, 0.35, 0], [0.3, 0.5, 0], [1.1, 0.8, 1])]);
      v.scene.add(o.mesh);
    }
    st.obs.push(o);
  }

  /* ---------- controls: swipe, tap sides, arrows, buttons ---------- */
  function steer(d) { if (st.phase !== 'go' || ctx.busy) return; var n = clamp(st.lane + d, 0, 2); if (n !== st.lane) { st.lane = n; Sound.tap(); } }
  var down = null, canvas = GFX.canvas;
  function pd(e) { down = { x: e.clientX, y: e.clientY }; }
  function pu(e) { if (!down) return; var dx = e.clientX - down.x; down = null; if (Math.abs(dx) > 30) steer(dx > 0 ? 1 : -1); else steer(e.clientX < GFX.W / 2 ? -1 : 1); }
  function kd(e) { if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') steer(-1); if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') steer(1); }
  canvas.addEventListener('pointerdown', pd); canvas.addEventListener('pointerup', pu); document.addEventListener('keydown', kd);
  v.disposers.push(function () { canvas.removeEventListener('pointerdown', pd); canvas.removeEventListener('pointerup', pu); document.removeEventListener('keydown', kd); });

  function driveDock() {
    Kit.say(null, '<div class="row" style="justify-content:space-between"><span class="chip" id="dist">Distance: 0%</span><span class="small muted">Swipe, tap a side, or use the arrows</span></div>' +
      '<div class="progress" aria-hidden="true"><div id="dprog" style="width:0%"></div></div>' +
      '<div class="actions" style="justify-content:space-between;margin-top:8px"><button class="btn mc big" type="button" id="left" aria-label="Steer left">&#9664;</button><button class="btn mc big" type="button" id="right" aria-label="Steer right">&#9654;</button></div>');
    $('#left').onclick = function () { steer(-1); }; $('#right').onclick = function () { steer(1); };
  }
  function stopFor(E) {
    st.phase = 'event'; Sound.alarm();
    Kit.choice(E, { pos: [st.x + 1.6, -1], h: 2.2, done: function () { st.phase = 'go'; driveDock(); } });
  }
  function arrive() {
    st.phase = 'arrived'; st.arrived = true;
    Sound.fanfare(); confetti();
    var why = st.passed ? ' You drove past ' + st.passed + ' obstacle' + (st.passed > 1 ? 's' : '') + '.' : '';
    Kit.say('majok', '<b>We made it!</b> The kits reached the distribution site safe.' + why);
    later(function () { ctx.finish(); }, 2200);
  }

  /* ---------- frame ---------- */
  v.update = function (dt, t) {
    var tx = LANES[st.lane]; st.x += (tx - st.x) * Math.min(1, dt * (reduceMotion ? 60 : 9));
    if (truck) { truck.position.set(st.x, st.phase === 'go' && !reduceMotion ? Math.abs(Math.sin(t * 16)) * 0.03 : 0, 0); truck.rotation.z = (tx - st.x) * -0.05; }
    if (st.phase !== 'go' || ctx.busy) return;
    // the first stop (RRC clearance) comes before moving
    if (st.evI < evs.length && st.t / dur >= marks[st.evI]) { var E = evs[st.evI++]; return stopFor(E); }
    st.t += dt;
    var prog = clamp(st.t / dur, 0, 1), dp = $('#dprog'), dist = $('#dist');
    if (dp) dp.style.width = Math.round(prog * 100) + '%'; if (dist) dist.textContent = 'Distance: ' + Math.round(prog * 100) + '%';
    if (st.slow > 0) st.slow -= dt;
    var sp = (st.slow > 0 ? 0.45 : 1) * baseSpeed / pf * (reduceMotion ? 0.7 : 1), dz = sp * dt;
    if (v.gl) st.segs.forEach(function (m) { m.position.z += dz; if (m.position.z > 4 + SEG) m.position.z -= NSEG * SEG; });
    // obstacles
    if (prog < 0.92) { st.spawn -= dt; if (st.spawn <= 0) { newObstacle(); st.spawn = (1.0 + Math.random() * 0.9) * pf; } }
    st.obs.forEach(function (o) {
      o.z += dz; if (o.mesh) o.mesh.position.set(LANES[o.lane], 0, o.z);
      if (!o.done && Math.abs(o.z) < 0.9 && Math.abs(LANES[o.lane] - st.x) < 1.1) {
        o.done = true; st.hits++; st.slow = M.obstacles.hitSlow || 1.4; Sound.bad();
        if (!reduceMotion) { var h = $('#hud'); if (h) { h.classList.remove('shake'); void h.offsetWidth; h.classList.add('shake'); } }
        if (st.firstHit) { st.firstHit = false; toast(o.kind === 'mud' ? '<b>Stuck in the mud!</b> It slows you down. Change lanes earlier.' : '<b>Bump!</b> Rocks slow you down. Change lanes earlier.', 'info', 2400); }
      }
      if (!o.done && o.z > 1.6) { o.done = true; st.passed++; ctx.bonus(M.obstacles.avoidPoints || 20, GFX.project(LANES[o.lane], 1, 0)); }
    });
    st.obs = st.obs.filter(function (o) { if (o.z > 8) { if (o.mesh) { v.scene.remove(o.mesh); o.mesh.geometry.dispose(); } return false; } return true; });
    // the site comes into view at the end
    if (prog > 0.85) { st.siteZ = -26 + (prog - 0.85) / 0.15 * 24; if (st.site) { st.site.visible = true; st.site.position.set(0, 0, st.siteZ); } }
    if (prog >= 1 && !st.arrived) arrive();
  };
  v.draw2d = function (g, Pj) {
    g.fillStyle = '#B4CC78'; g.fillRect(0, 0, Pj.W, Pj.H);
    Kit.d2.rect(g, Pj, -3.1, B.minZ, 3.1, B.maxZ, '#C9895A');
    Kit.d2.rect(g, Pj, -11, B.minZ, -6.1, B.maxZ, '#5FB4E0');
    st.obs.forEach(function (o) { Kit.d2.dot(g, Pj, LANES[o.lane], o.z, 0.7, o.kind === 'mud' ? '#6B4A2E' : '#8C8C8C'); });
    Kit.d2.box(g, Pj, st.x, 0, 1.1, 2.2, Store.get().truckColor || C.ngo.color);
    if (st.siteZ != null) Kit.d2.box(g, Pj, 0, st.siteZ, 5.8, 0.4, '#F28C28');
  };
  Kit.start(v, ctx);
  run.debug = { st: st, M: M };
  ctx.phase('Drive to the distribution site');
  driveDock();
} };
