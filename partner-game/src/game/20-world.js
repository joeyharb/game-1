/* =============================================================================
 * 20 WORLD: the journey diorama used by the home screen and the map.
 * Stops are generated from C.missions, so adding or removing a mission never
 * breaks the map.
 * ========================================================================== */
function journeyLayout() {
  var n = C.missions.length, stops = [], span = Math.max(16, n * 4.2);
  for (var i = 0; i < n; i++) {
    var t = n === 1 ? 0.5 : i / (n - 1);
    var x = -span / 2 + t * span, z = Math.sin(t * Math.PI * 2.2) * 3.2;
    stops.push({ x: x, z: z, m: C.missions[i] });
  }
  var road = [];
  for (var k = 0; k <= 120; k++) {
    var tt = k / 120, xx = -span / 2 - 2 + tt * (span + 4);
    var u = clamp((xx + span / 2) / span, 0, 1);
    road.push([xx, Math.sin(u * Math.PI * 2.2) * 3.2]);
  }
  var compound = { x: -span / 2 - 3.2, z: 3.2 };
  return { stops: stops, road: road, span: span, compound: compound,
           bounds: { minX: -span / 2 - 5, maxX: span / 2 + 2.5, minZ: -6.5, maxZ: 6.5, maxY: 2.5 } };
}
function isUnlocked(i) {
  var d = Store.get(), M = C.missions[i];
  if (!M) return false;
  if (M.playable === false) return false;
  if (d.allDoneOnce || i === 0) return true;
  /* the first playable mission is always open; then missions open in order */
  for (var k = 0; k < i; k++) { var P = C.missions[k]; if (P.playable !== false && !(d.missions[P.id] && d.missions[P.id].completed)) return false; }
  return true;
}

function makeWorldView(opts) {
  opts = opts || {};
  var L = journeyLayout(), truckColor = Store.get().truckColor || C.ngo.color;
  var v = { bounds: L.bounds, layout: L, truckD: 0,
    fit: { elev: opts.home ? 38 : 52, azim: opts.home ? -18 : 0, top: opts.top || 70, bottom: opts.bottom || 20, side: 8, rotatePortrait: true, zoom: opts.zoom || 1 } };
  function roadPos(d) {
    var R = L.road, i = Math.floor(d) % (R.length - 1), f = d - Math.floor(d), a = R[i], b = R[i + 1];
    return { x: lerp(a[0], b[0], f), z: lerp(a[1], b[1], f), ang: Math.atan2(b[1] - a[1], b[0] - a[0]) };
  }
  if (GFX.mode === 'webgl') {
    var scene = makeOutdoorScene('#BFE3F7'), P = [];
    P.push(M3.part(M3.G.plane(L.span + 40, 40), '#A9C96F', [0, 0, 0]));
    // river: a smooth ribbon with sandy banks
    var riv = []; for (var r = 0; r <= 60; r++) { var rx = -L.span / 2 - 12 + r * ((L.span + 24) / 60); riv.push([rx, -6.4 + Math.sin(r * 0.32) * 0.9]); }
    P.push(M3.ribbon(riv, 3.4, '#E2C9A0', 0.012)); P.push(M3.ribbon(riv, 2.4, '#5FB4E0', 0.02));
    // road
    P.push(M3.ribbon(L.road, 1.15, '#C9895A', 0.03));
    // scenery
    var rr = (function (s) { return function () { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; })(11);
    for (var t = 0; t < 46; t++) {
      var x = -L.span / 2 - 8 + rr() * (L.span + 16), z = -9 + rr() * 18, near = false;
      L.road.forEach(function (p) { if (Math.abs(p[0] - x) < 1.4 && Math.abs(p[1] - z) < 1.4) near = true; });
      L.stops.forEach(function (s) { if (Math.abs(s.x - x) < 2 && Math.abs(s.z - z) < 2) near = true; });
      if (near || Math.abs(z + 6.4) < 2.2) continue;
      if (rr() < 0.55) M3.acacia(P, x, z, 0.6 + rr() * 0.5); else M3.bush(P, x, z, 0.8 + rr() * 0.6);
    }
    // stop models
    L.stops.forEach(function (s, i) {
      var col = s.m.color || '#0033A0', id = s.m.id;
      if (id === 'M2') { M3.tukul('#D9B98C', '#B08A4E', P, s.x - 0.9, s.z - 0.5, 0.6); M3.tukul('#E1C59A', '#A57E44', P, s.x + 0.8, s.z + 0.3, 0.55); }
      else if (id === 'M4') { P.push(M3.part(M3.G.box(2.2, 1.1, 1.4), '#F2F4F7', [s.x, 0.55, s.z])); P.push(M3.part(M3.G.box(2.4, 0.15, 1.6), '#0033A0', [s.x, 1.15, s.z])); P.push(M3.part(M3.G.box(0.8, 0.7, 0.05), '#5B6475', [s.x, 0.35, s.z + 0.71])); }
      else if (id === 'M5') { P.push(M3.part(M3.G.box(2.4, 0.18, 1.2), '#8B5E34', [s.x, 0.18, s.z])); P.push(M3.part(M3.G.box(2.4, 0.4, 0.08), '#6E4826', [s.x, 0.35, s.z + 0.6])); P.push(M3.part(M3.G.box(2.4, 0.4, 0.08), '#6E4826', [s.x, 0.35, s.z - 0.6])); }
      else if (id === 'M6') { [[-0.8, -0.6], [0.8, -0.6], [-0.8, 0.6], [0.8, 0.6]].forEach(function (p) { P.push(M3.part(M3.G.cyl(0.05, 0.05, 1.3, 5), '#8B5E34', [s.x + p[0], 0.65, s.z + p[1]])); }); P.push(M3.part(M3.G.box(1.9, 0.06, 1.5), '#2C7FB8', [s.x, 1.32, s.z])); P.push(M3.part(M3.G.box(0.4, 0.3, 0.3), col, [s.x - 0.3, 0.15, s.z])); P.push(M3.part(M3.G.box(0.4, 0.3, 0.3), col, [s.x + 0.2, 0.15, s.z + 0.1])); }
      else { P.push(M3.part(M3.G.box(1.6, 1.0, 1.2), '#F7F3EA', [s.x, 0.5, s.z])); P.push(M3.part(M3.G.cone(1.25, 0.6, 4), col, [s.x, 1.3, s.z], [0, Math.PI / 4, 0], [1, 1, 0.8])); P.push(M3.part(M3.G.box(0.4, 0.6, 0.05), '#5B6475', [s.x, 0.3, s.z + 0.61])); }
      P.push(M3.part(M3.G.disc(1.6, 20), shadeHex(col, 0.55), [s.x, 0.015, s.z]));
    });
    // NGO compound with unlockable decorations
    var c = L.compound;
    P.push(M3.part(M3.G.box(1.8, 0.9, 1.3), '#FFF8EC', [c.x, 0.45, c.z])); P.push(M3.part(M3.G.box(2.0, 0.12, 1.5), C.ngo.color, [c.x, 0.96, c.z]));
    for (var f = 0; f < 10; f++) { var a = f / 10 * Math.PI * 2; P.push(M3.part(M3.G.box(0.08, 0.5, 0.08), '#8B5E34', [c.x + Math.cos(a) * 1.9, 0.25, c.z + Math.sin(a) * 1.6])); }
    var world = M3.mesh(P, { receive: true }); world.castShadow = true; scene.add(world);
    if (Store.get().unlocks.indexOf('flag') >= 0) { var fl = M3.flag(C.ngo.color); fl.position.set(c.x + 1.2, 0, c.z - 0.6); scene.add(fl); }
    var tr = M3.truck(truckColor); tr.scale.setScalar(0.6); scene.add(tr);
    v.scene = scene; v.camera = new THREE.PerspectiveCamera(38, 1, 0.1, 400); v.truck = tr;
    v.onQuality = function (q) { scene.userData.sun.castShadow = q === 'high'; };
  }
  var spin = 0;
  v.update = function (dt, t) {
    v.truckD = (v.truckD + dt * (reduceMotion ? 0 : 9)) % (L.road.length - 1);
    if (v.truck) { var p = roadPos(v.truckD); v.truck.position.set(p.x, 0.02 + (reduceMotion ? 0 : Math.abs(Math.sin(t * 12)) * 0.02), p.z); v.truck.rotation.y = -p.ang; }
    if (opts.home && v.camera && v.camTarget && !reduceMotion) {
      spin += dt * 0.05; var d = v.camDist * (opts.zoom || 1), el = 38 * Math.PI / 180, az = -0.31 + Math.sin(spin) * 0.35;
      v.camera.position.set(v.camTarget.x + Math.sin(az) * Math.cos(el) * d, Math.sin(el) * d, v.camTarget.z + Math.cos(az) * Math.cos(el) * d);
      v.camera.lookAt(v.camTarget);
    }
  };
  v.draw2d = function (g, Pj) {
    g.fillStyle = '#A9C96F'; g.fillRect(0, 0, Pj.W, Pj.H);
    g.strokeStyle = '#5FB4E0'; g.lineWidth = Math.max(10, 2 * Pj.s); g.beginPath();
    for (var r2 = 0; r2 <= 30; r2++) { var x2 = L.bounds.minX + r2 * (L.bounds.maxX - L.bounds.minX) / 30, q = Pj.project(x2, 0, -6.4 + Math.sin(x2 * 0.32) * 0.9); if (r2) g.lineTo(q.x, q.y); else g.moveTo(q.x, q.y); }
    g.stroke();
    g.strokeStyle = '#C9895A'; g.lineWidth = Math.max(8, 1.1 * Pj.s); g.lineCap = 'round'; g.beginPath();
    L.road.forEach(function (p, i) { var q = Pj.project(p[0], 0, p[1]); if (i) g.lineTo(q.x, q.y); else g.moveTo(q.x, q.y); }); g.stroke();
    L.stops.forEach(function (s) { var q = Pj.project(s.x, 0, s.z); g.fillStyle = s.m.color || '#0033A0'; g.beginPath(); g.arc(q.x, q.y, Math.max(12, 0.9 * Pj.s), 0, Math.PI * 2); g.fill(); });
    var cp = Pj.project(L.compound.x, 0, L.compound.z); g.fillStyle = C.ngo.color; g.fillRect(cp.x - 14, cp.y - 10, 28, 20);
    var tp = roadPos(v.truckD), tq = Pj.project(tp.x, 0, tp.z); g.fillStyle = truckColor; g.fillRect(tq.x - 8, tq.y - 5, 16, 10);
  };
  return v;
}
