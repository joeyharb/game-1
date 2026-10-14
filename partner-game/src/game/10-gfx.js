/* =============================================================================
 * 10 GFX: one renderer for the whole game (WebGL with Three.js, or a 2D canvas
 * fallback), camera fitting, labels over the world, picking and low-poly models.
 *
 * A "view" is what a screen shows:
 *   { scene, camera,                    // 3D (Three.js) objects, WebGL only
 *     draw2d(ctx, P),                   // 2D fallback drawing (P = projector)
 *     update(dt, t),                    // per-frame logic (both modes)
 *     bounds: {minX,maxX,minZ,maxZ,maxY}, fit: {elev, azim, top, bottom, side, rotatePortrait} }
 * ========================================================================== */
var GFX = (function () {
  var mode = 'none', renderer = null, canvas = null, c2d = null, ctx2 = null;
  var view = null, W = 0, H = 0, quality = 'low', portrait = false;
  var last = performance.now(), acc = 0, fps = 0, running = false;
  var tmpV = null, ray = null, plane = null;
  var labels = [];
  var map2d = { s: 1, ox: 0, oy: 0, rot: false, cx: 0, cz: 0 };
  var fallbackReason = '';

  function defaultQuality() {
    var small = Math.min(window.innerWidth, window.innerHeight) < 700;
    var weak = (navigator.deviceMemory && navigator.deviceMemory <= 4) || (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4);
    return small || weak ? 'low' : 'high';
  }

  function init() {
    var st = Store.get().settings;
    quality = st.gfx || defaultQuality();
    var force2d = /[?&]gfx=2d\b/.test(location.search);
    if (!force2d && window.THREE) {
      try {
        canvas = document.createElement('canvas'); canvas.id = 'gl';
        renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: quality === 'high', powerPreference: 'high-performance', failIfMajorPerformanceCaveat: false });
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        document.body.insertBefore(canvas, document.body.firstChild);
        mode = 'webgl';
        tmpV = new THREE.Vector3(); ray = new THREE.Raycaster();
        canvas.addEventListener('webglcontextlost', function (e) { e.preventDefault(); toast('<b>Graphics paused.</b> The device lost the 3D context; reload the page if the scene stays blank.', 'info', 6000); });
      } catch (e) { renderer = null; fallbackReason = String(e && e.message || e); }
    } else if (!force2d) fallbackReason = 'Three.js missing';
    if (mode !== 'webgl') {
      c2d = document.createElement('canvas'); c2d.id = 'c2d';
      document.body.insertBefore(c2d, document.body.firstChild);
      ctx2 = c2d.getContext('2d'); mode = '2d';
    }
    applyQuality();
    window.addEventListener('resize', resize);
    window.addEventListener('orientationchange', function () { setTimeout(resize, 200); });
    document.addEventListener('visibilitychange', function () { last = performance.now(); });
    resize();
    if (!running) { running = true; requestAnimationFrame(loop); }
    return mode;
  }

  function applyQuality() {
    if (mode === 'webgl') {
      var dpr = window.devicePixelRatio || 1;
      renderer.setPixelRatio(quality === 'high' ? Math.min(dpr, 2) : Math.min(dpr, Math.min(window.innerWidth, window.innerHeight) < 700 ? 1.25 : 1));
      renderer.shadowMap.enabled = quality === 'high';
      if (view && view.onQuality) view.onQuality(quality);
      if (view && view.scene) view.scene.traverse(function (o) { if (o.material) o.material.needsUpdate = true; });
    } else if (c2d) {
      var d2 = quality === 'high' ? Math.min(window.devicePixelRatio || 1, 2) : 1;
      c2d.width = Math.round(window.innerWidth * d2); c2d.height = Math.round(window.innerHeight * d2);
      ctx2.setTransform(d2, 0, 0, d2, 0, 0);
    }
  }
  function setQuality(q) { quality = q; Store.get().settings.gfx = q; Store.save(); applyQuality(); resize(); }

  function resize() {
    W = window.innerWidth; H = window.innerHeight; portrait = H > W * 1.05;
    if (mode === 'webgl') { renderer.setSize(W, H, false); canvas.style.width = W + 'px'; canvas.style.height = H + 'px'; }
    else if (c2d) applyQuality();
    fit();
  }

  /* ---------- Camera fitting: keep the view's bounds inside the free screen area ---------- */
  function freeRect(f) {
    f = f || {};
    var top = typeof f.top === 'function' ? f.top(W, H) : (f.top || 70), bottom = typeof f.bottom === 'function' ? f.bottom(W, H) : (f.bottom || 20), side = f.side || 10;
    return { l: side, r: W - side, t: top, b: H - bottom };
  }
  function fit() {
    if (!view || !view.bounds) return;
    var b = view.bounds, f = view.fit || {}, R = freeRect(f);
    if (R.b - R.t < 80) R.t = Math.max(0, R.b - 80);
    var rot = !!(f.rotatePortrait && portrait);
    if (mode === 'webgl' && view.camera) {
      var cam = view.camera, el = (f.elev || 55) * Math.PI / 180, az = ((f.azim || 0) + (rot ? 90 : 0)) * Math.PI / 180;
      cam.aspect = W / H; cam.updateProjectionMatrix();
      var tgt = new THREE.Vector3((b.minX + b.maxX) / 2, 0, (b.minZ + b.maxZ) / 2);
      var dir = new THREE.Vector3(Math.sin(az) * Math.cos(el), Math.sin(el), Math.cos(az) * Math.cos(el));
      var corners = [];
      [b.minX, b.maxX].forEach(function (x) { [0, b.maxY || 0].forEach(function (y) { [b.minZ, b.maxZ].forEach(function (z) { corners.push(new THREE.Vector3(x, y, z)); }); }); });
      function place(d, t) { cam.position.copy(t).addScaledVector(dir, d); cam.lookAt(t); cam.updateMatrixWorld(); }
      function bbox() {
        var x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
        corners.forEach(function (c) { var p = c.clone().project(cam); var sx = (p.x + 1) / 2 * W, sy = (1 - p.y) / 2 * H; x0 = Math.min(x0, sx); x1 = Math.max(x1, sx); y0 = Math.min(y0, sy); y1 = Math.max(y1, sy); });
        return { x0: x0, x1: x1, y0: y0, y1: y1 };
      }
      var lo = 2, hi = 600, t = tgt.clone();
      for (var pass = 0; pass < 3; pass++) {
        lo = 2; hi = 600;
        for (var i = 0; i < 28; i++) {
          var mid = (lo + hi) / 2; place(mid, t); var bb = bbox();
          if ((bb.x1 - bb.x0) <= (R.r - R.l) && (bb.y1 - bb.y0) <= (R.b - R.t)) hi = mid; else lo = mid;
        }
        place(hi, t);
        // re-centre the content inside the free rectangle
        var bb2 = bbox(), dx = ((R.l + R.r) / 2 - (bb2.x0 + bb2.x1) / 2), dy = ((R.t + R.b) / 2 - (bb2.y0 + bb2.y1) / 2);
        var right = new THREE.Vector3().setFromMatrixColumn(cam.matrixWorld, 0), up = new THREE.Vector3().setFromMatrixColumn(cam.matrixWorld, 1);
        var worldPerPx = 2 * Math.tan(cam.fov * Math.PI / 360) * hi / H;
        // move along the ground plane: project the screen "up" onto the ground
        var upG = new THREE.Vector3(up.x, 0, up.z); if (upG.lengthSq() > 1e-6) upG.normalize().multiplyScalar(1 / Math.max(0.2, Math.sin(el)));
        t.addScaledVector(right, -dx * worldPerPx).addScaledVector(upG, dy * worldPerPx);
      }
      place(hi * (f.zoom || 1), t);
      view.camTarget = t; view.camDist = hi; view.camDir = dir;
      if (view.scene && view.scene.fog) { view.scene.fog.near = hi * 1.2; view.scene.fog.far = hi * 3.2; }
    } else if (mode === '2d') {
      var rx = b.maxX - b.minX, rz = b.maxZ - b.minZ, aw = R.r - R.l, ah = R.b - R.t;
      var sx = rot ? aw / rz : aw / rx, sy = rot ? ah / rx : ah / rz;
      map2d.s = Math.min(sx, sy) * (f.zoom || 1); map2d.rot = rot;
      map2d.cx = (b.minX + b.maxX) / 2; map2d.cz = (b.minZ + b.maxZ) / 2;
      map2d.ox = (R.l + R.r) / 2; map2d.oy = (R.t + R.b) / 2;
    }
    if (view.onFit) view.onFit();
  }

  /* World point -> screen pixels (both modes). */
  function project(x, y, z) {
    if (mode === 'webgl' && view && view.camera) {
      tmpV.set(x, y, z).project(view.camera);
      return { x: (tmpV.x + 1) / 2 * W, y: (1 - tmpV.y) / 2 * H, vis: tmpV.z < 1 && tmpV.z > -1 };
    }
    var dx = x - map2d.cx, dz = z - map2d.cz, sx, sy;
    if (map2d.rot) { sx = -dz; sy = dx; } else { sx = dx; sy = dz; }
    return { x: map2d.ox + sx * map2d.s, y: map2d.oy + sy * map2d.s - (y || 0) * map2d.s * 0.55, vis: true };
  }
  /* Screen pixels -> ground point at height h (both modes). */
  function toGround(px, py, h) {
    h = h || 0;
    if (mode === 'webgl' && view && view.camera) {
      ray.setFromCamera(new THREE.Vector2(px / W * 2 - 1, -(py / H) * 2 + 1), view.camera);
      var o = ray.ray.origin, d = ray.ray.direction; if (Math.abs(d.y) < 1e-6) return null;
      var k = (h - o.y) / d.y; return { x: o.x + d.x * k, z: o.z + d.z * k };
    }
    var sx = (px - map2d.ox) / map2d.s, sy = (py - map2d.oy + h * map2d.s * 0.55) / map2d.s;
    return map2d.rot ? { x: map2d.cx + sy, z: map2d.cz - sx } : { x: map2d.cx + sx, z: map2d.cz + sy };
  }
  /* Nearest pickable to a tap: items are {x, z, r, h} in world units. */
  function pickNearest(px, py, items) {
    var best = null, bd = 1e9;
    items.forEach(function (it) {
      var p = project(it.x, it.h || 0.6, it.z), dx = p.x - px, dy = p.y - py, d = Math.sqrt(dx * dx + dy * dy);
      var rPx = Math.max(26, (it.r || 0.8) * pxPerUnit(it.x, it.z));
      if (d < rPx && d < bd) { bd = d; best = it; }
    });
    return best;
  }
  function pxPerUnit(x, z) { var a = project(x, 0, z), b = project(x + 1, 0, z); return Math.max(4, Math.sqrt((a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y))); }

  /* ---------- Labels: HTML nodes that follow world points ---------- */
  function addLabel(node, getPos, opts) {
    var L = { node: node, get: getPos, ax: (opts && opts.ax != null) ? opts.ax : 0.5, ay: (opts && opts.ay != null) ? opts.ay : 1, sep: !!(opts && opts.sep) };
    $('#labels').appendChild(node); labels.push(L); placeLabel(L); applyLabel(L); return L;
  }
  function removeLabel(L) { var i = labels.indexOf(L); if (i >= 0) labels.splice(i, 1); if (L.node.parentNode) L.node.remove(); }
  function clearLabels() { labels.forEach(function (L) { if (L.node.parentNode) L.node.remove(); }); labels = []; }
  function placeLabel(L) {
    var w = L.get(); L.vis = false; if (!w) return;
    var p = project(w[0], w[1], w[2]);
    if (!p.vis || p.x < -60 || p.x > W + 60 || p.y < -60 || p.y > H + 60) return;
    L.vis = true; L.w = L.node.offsetWidth || L.w || 40; L.h = L.node.offsetHeight || L.h || 40;
    L.x = p.x - L.w * L.ax; L.y = p.y - L.h * L.ay;
  }
  function applyLabel(L) {
    if (!L.vis) { if (L.shown !== false) { L.node.style.display = 'none'; L.shown = false; } return; }
    if (L.shown !== true) { L.node.style.display = ''; L.shown = true; }
    L.node.style.transform = 'translate(' + Math.round(L.x) + 'px,' + Math.round(L.y) + 'px)';
  }
  /* Push apart labels marked { sep: true } (e.g. bubbles over a crowd) so each stays tappable. */
  function separate() {
    var a = labels.filter(function (L) { return L.sep && L.vis; }); if (a.length < 2) return;
    for (var pass = 0; pass < 4; pass++) {
      for (var i = 0; i < a.length; i++) for (var j = i + 1; j < a.length; j++) {
        var A = a[i], B = a[j], dx = (B.x + B.w / 2) - (A.x + A.w / 2), dy = (B.y + B.h / 2) - (A.y + A.h / 2);
        var minD = (A.w + B.w) / 2 + 2, d = Math.sqrt(dx * dx + dy * dy);
        if (d >= minD) continue;
        if (d < 0.01) { dx = 1; dy = 0; d = 1; }
        var push = (minD - d) / 2, ux = dx / d, uy = dy / d;
        A.x -= ux * push; A.y -= uy * push; B.x += ux * push; B.y += uy * push;
      }
    }
  }

  /* ---------- Main loop ---------- */
  var cpuMs = 0, cpuN = 0, cpuAvg = 0, realT = 0, realFrames = 0;
  var timeScale = (function () { var m = /[?&]timescale=([0-9.]+)/.exec(location.search); return m ? Math.min(8, Math.max(0.1, Number(m[1]))) : 1; })();
  function loop(now) {
    requestAnimationFrame(loop);
    var real = Math.max(0, (now - last) / 1000); last = now;
    var minStep = quality === 'low' ? 1 / 31 : 0;
    acc += real; if (acc < minStep) return;
    var step = Math.min(0.1, acc) * timeScale; acc = 0;
    // real frames per second (wall clock)
    realFrames++; realT += real === 0 ? 0 : (now - (loop.prev || now)) / 1000; loop.prev = now;
    if (realT >= 1) { fps = realFrames / realT; realFrames = 0; realT = 0; cpuAvg = cpuN ? cpuMs / cpuN : 0; cpuMs = 0; cpuN = 0; }
    if (!view) return;
    var t0 = performance.now();
    try { if (view.update) view.update(step, now / 1000); } catch (e) { console.error(e); }
    if (mode === 'webgl' && view.scene && view.camera) renderer.render(view.scene, view.camera);
    else if (mode === '2d' && view.draw2d) { ctx2.clearRect(0, 0, W, H); view.draw2d(ctx2, { project: project, s: map2d.s, rot: map2d.rot, W: W, H: H }); }
    for (var i = 0; i < labels.length; i++) placeLabel(labels[i]);
    separate();
    for (var j = 0; j < labels.length; j++) applyLabel(labels[j]);
    cpuMs += performance.now() - t0; cpuN++;
  }
  function stats() {
    var info = mode === 'webgl' ? renderer.info.render : { calls: 0, triangles: 0 };
    return { fps: fps, cpuMs: cpuAvg, calls: info.calls, triangles: info.triangles, mode: mode, quality: quality, pixelRatio: mode === 'webgl' ? renderer.getPixelRatio() : 1, W: W, H: H };
  }

  function setView(v) {
    if (view && view.dispose) { try { view.dispose(); } catch (e) { console.error(e); } }
    clearLabels(); view = v; if (view && view.onQuality) view.onQuality(quality); fit();
  }

  return {
    init: init, setView: setView, refit: fit, project: project, toGround: toGround, pickNearest: pickNearest, pxPerUnit: pxPerUnit,
    addLabel: addLabel, removeLabel: removeLabel, clearLabels: clearLabels,
    setQuality: setQuality, stats: stats,
    get mode() { return mode; }, get quality() { return quality; }, get portrait() { return portrait; },
    get W() { return W; }, get H() { return H; }, get fps() { return fps; }, get view() { return view; },
    get canvas() { return mode === 'webgl' ? canvas : c2d; }, get fallbackReason() { return fallbackReason; }
  };
})();

/* =============================================================================
 * LOW-POLY MODELS (WebGL only). Parts are baked with vertex colours and merged,
 * so each model is one draw call with one shared flat-shaded material.
 * ========================================================================== */
var M3 = (function () {
  var mat = null, matBasic = null;
  function material() { if (!mat) mat = new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true }); return mat; }
  function color(hex) { return new THREE.Color(hex); }
  /* part(geometry, colour, [x,y,z], [rx,ry,rz], [sx,sy,sz]) -> baked geometry */
  function part(g, hex, p, r, s) {
    var m = new THREE.Matrix4(), q = new THREE.Quaternion().setFromEuler(new THREE.Euler((r && r[0]) || 0, (r && r[1]) || 0, (r && r[2]) || 0));
    m.compose(new THREE.Vector3((p && p[0]) || 0, (p && p[1]) || 0, (p && p[2]) || 0), q, new THREE.Vector3((s && s[0]) || 1, (s && s[1]) || 1, (s && s[2]) || 1));
    var gg = g.index ? g.toNonIndexed() : g.clone(); gg.applyMatrix4(m);
    if (gg.attributes.uv) gg.deleteAttribute('uv');
    var n = gg.attributes.position.count, col = new Float32Array(n * 3), c = color(hex);
    for (var i = 0; i < n; i++) { col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b; }
    gg.setAttribute('color', new THREE.BufferAttribute(col, 3));
    return gg;
  }
  function mesh(parts, opts) {
    var g = THREE.mergeGeometries(parts, false); parts.forEach(function (p) { p.dispose(); });
    g.computeVertexNormals();
    var m = new THREE.Mesh(g, material());
    m.castShadow = !(opts && opts.noCast); m.receiveShadow = !!(opts && opts.receive);
    return m;
  }
  var G = {
    box: function (w, h, d) { return new THREE.BoxGeometry(w, h, d); },
    cyl: function (rt, rb, h, seg) { return new THREE.CylinderGeometry(rt, rb, h, seg || 8); },
    cone: function (r, h, seg) { return new THREE.ConeGeometry(r, h, seg || 8); },
    ball: function (r, det) { return new THREE.IcosahedronGeometry(r, det || 0); },
    dodec: function (r) { return new THREE.DodecahedronGeometry(r, 0); },
    disc: function (r, seg) { var g = new THREE.CircleGeometry(r, seg || 16); g.rotateX(-Math.PI / 2); return g; },
    plane: function (w, d) { var g = new THREE.PlaneGeometry(w, d); g.rotateX(-Math.PI / 2); return g; },
    ring: function (ri, ro, seg) { var g = new THREE.RingGeometry(ri, ro, seg || 32); g.rotateX(-Math.PI / 2); return g; },
    torus: function (r, t) { return new THREE.TorusGeometry(r, t, 6, 18); }
  };

  /* A person. look: {skin, shirt, pants, hair, hairColor, kid, cane, scarf} */
  function person(look) {
    look = look || {};
    var k = look.kid ? 0.72 : 1, P = [], skin = look.skin || '#6B4226', shirt = look.shirt || '#0033A0', pants = look.pants || '#2E3A59';
    P.push(part(G.cyl(0.11 * k, 0.12 * k, 0.5 * k, 6), pants, [-0.09 * k, 0.25 * k, 0]));
    P.push(part(G.cyl(0.11 * k, 0.12 * k, 0.5 * k, 6), pants, [0.09 * k, 0.25 * k, 0]));
    if (look.dress) P.push(part(G.cone(0.32 * k, 0.6 * k, 8), shirt, [0, 0.55 * k, 0]));
    P.push(part(G.cyl(0.2 * k, 0.24 * k, 0.55 * k, 8), shirt, [0, 0.76 * k, 0]));
    P.push(part(G.cyl(0.06 * k, 0.055 * k, 0.5 * k, 5), shirt, [-0.25 * k, 0.72 * k, 0], [0, 0, -0.07]));
    P.push(part(G.cyl(0.06 * k, 0.055 * k, 0.5 * k, 5), shirt, [0.25 * k, 0.72 * k, 0], [0, 0, 0.07]));
    P.push(part(G.ball(0.19 * k, 1), skin, [0, 1.2 * k, 0]));
    if (look.hair === 'headwrap') P.push(part(G.ball(0.2 * k, 0), look.hairColor || '#F5B301', [0, 1.3 * k, -0.02], null, [1.05, 0.7, 1.05]));
    else if (look.hair === 'cap') { P.push(part(G.cyl(0.19 * k, 0.2 * k, 0.1 * k, 8), look.hairColor || '#0033A0', [0, 1.33 * k, 0])); P.push(part(G.box(0.2 * k, 0.03, 0.16 * k), look.hairColor || '#0033A0', [0, 1.3 * k, 0.17 * k])); }
    else if (look.hair !== 'bald') P.push(part(G.ball(0.195 * k, 0), look.hairColor || '#1E1E1E', [0, 1.27 * k, -0.03], null, [1, 0.62, 1]));
    if (look.cane) P.push(part(G.cyl(0.025, 0.025, 1.0, 4), '#8B5E34', [0.36, 0.5, 0.08], [0, 0, -0.12]));
    if (look.scarf) P.push(part(G.cyl(0.21 * k, 0.21 * k, 0.08, 8), look.scarf, [0, 1.03 * k, 0]));
    var g = new THREE.Group(), m = mesh(P); g.add(m); g.userData.body = m;
    return g;
  }
  function kitBox(hex, s) { s = s || 1; return mesh([part(G.box(0.42 * s, 0.3 * s, 0.32 * s), hex), part(G.box(0.44 * s, 0.05 * s, 0.08 * s), '#FFFFFF', [0, 0.16 * s, 0])]); }
  function tukul(wall, roof, P, x, z, s) {
    s = s || 1; P = P || [];
    P.push(part(G.cyl(0.9 * s, 0.95 * s, 1.0 * s, 10), wall || '#D9B98C', [x, 0.5 * s, z]));
    P.push(part(G.cone(1.25 * s, 1.15 * s, 10), roof || '#B08A4E', [x, 1.55 * s, z]));
    P.push(part(G.box(0.36 * s, 0.6 * s, 0.05), '#5B3A1E', [x, 0.3 * s, z + 0.92 * s]));
    return P;
  }
  function acacia(P, x, z, s) {
    s = s || 1;
    P.push(part(G.cyl(0.07 * s, 0.11 * s, 1.3 * s, 5), '#7A5232', [x, 0.65 * s, z], [0, 0, 0.12]));
    P.push(part(G.cyl(1.0 * s, 0.75 * s, 0.32 * s, 9), '#4E9A47', [x + 0.15 * s, 1.42 * s, z]));
    P.push(part(G.cyl(0.6 * s, 0.5 * s, 0.24 * s, 8), '#62B356', [x + 0.25 * s, 1.68 * s, z + 0.1 * s]));
    return P;
  }
  function bush(P, x, z, s) { P.push(part(G.dodec(0.35 * (s || 1)), '#6FA84B', [x, 0.22 * (s || 1), z], null, [1, 0.7, 1])); return P; }
  function rock(P, x, z, s) { P.push(part(G.dodec(0.22 * (s || 1)), '#9C8B7A', [x, 0.1, z], [0.3, 0.6, 0], [1, 0.6, 1])); return P; }
  function truck(hex) {
    var P = [];
    P.push(part(G.box(1.6, 0.9, 1.0), '#F4F4F2', [-0.3, 0.75, 0]));
    P.push(part(G.box(1.62, 0.12, 1.02), hex, [-0.3, 0.6, 0]));
    P.push(part(G.box(0.7, 0.75, 0.95), hex, [0.85, 0.68, 0]));
    P.push(part(G.box(0.05, 0.3, 0.8), '#9FD3F2', [1.2, 0.85, 0]));
    [[-0.75, 0.5], [-0.75, -0.5], [0.8, 0.5], [0.8, -0.5]].forEach(function (w) { P.push(part(G.cyl(0.22, 0.22, 0.16, 10), '#222222', [w[0], 0.22, w[1]], [Math.PI / 2, 0, 0])); });
    return mesh(P);
  }
  function plot(hex) {
    var g = new THREE.Group();
    var ring = new THREE.Mesh(G.ring(0.85, 1.05, 32), new THREE.MeshBasicMaterial({ color: hex, transparent: true, opacity: 0.9 }));
    ring.position.y = 0.03; g.add(ring);
    var disc = new THREE.Mesh(G.disc(0.85, 32), new THREE.MeshBasicMaterial({ color: '#FFFFFF', transparent: true, opacity: 0.35 }));
    disc.position.y = 0.025; g.add(disc);
    g.userData.ring = ring; g.userData.disc = disc;
    return g;
  }
  /* Stations for Mission 6. Each returns one merged mesh, base at y=0. */
  function station(id, accent) {
    var P = [], wood = '#8B5E34', cloth = '#F4EFE6', blue = '#0033A0';
    function table(x, z, w, d, top) { P.push(part(G.box(w, 0.08, d), top || '#C49A6C', [x, 0.72, z])); [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (s) { P.push(part(G.box(0.07, 0.7, 0.07), wood, [x + s[0] * (w / 2 - 0.08), 0.35, z + s[1] * (d / 2 - 0.08)])); }); }
    function poles(x0, x1, z0, z1, h) { [[x0, z0], [x1, z0], [x0, z1], [x1, z1]].forEach(function (p) { P.push(part(G.cyl(0.05, 0.05, h, 5), wood, [p[0], h / 2, p[1]])); }); }
    switch (id) {
      case 'entry': case 'exit': case 'X-gate':
        P.push(part(G.box(0.14, 1.9, 0.14), wood, [-0.75, 0.95, 0])); P.push(part(G.box(0.14, 1.9, 0.14), wood, [0.75, 0.95, 0]));
        P.push(part(G.box(1.8, 0.36, 0.1), id === 'entry' ? '#2DB37A' : (id === 'exit' ? '#0033A0' : '#9AA6BD'), [0, 1.85, 0]));
        P.push(part(G.cone(0.18, 0.4, 6), accent, [-0.75, 2.1, 0])); P.push(part(G.cone(0.18, 0.4, 6), accent, [0.75, 2.1, 0]));
        break;
      case 'register': case 'X-vip':
        table(0, 0, 1.5, 0.75); P.push(part(G.box(0.36, 0.03, 0.26), '#FFFFFF', [-0.3, 0.78, 0])); P.push(part(G.box(0.3, 0.03, 0.22), '#FFFFFF', [0.25, 0.78, 0.05], [0, 0.3, 0]));
        P.push(part(G.box(0.4, 0.05, 0.4), wood, [0, 0.42, -0.65])); P.push(part(G.box(0.4, 0.45, 0.05), wood, [0, 0.66, -0.85]));
        if (id === 'X-vip') { P.push(part(G.box(1.6, 0.12, 0.12), '#F5B301', [0, 1.1, 0.6])); }
        else P.push(part(G.box(0.5, 0.35, 0.04), blue, [0.55, 0.98, -0.2]));
        break;
      case 'waiting':
        poles(-1.3, 1.3, -0.9, 0.9, 1.9);
        P.push(part(G.box(2.9, 0.06, 2.1), '#2C7FB8', [0, 1.95, 0], [0.06, 0, 0]));
        P.push(part(G.box(2.2, 0.08, 0.3), wood, [0, 0.42, -0.4])); P.push(part(G.box(2.2, 0.08, 0.3), wood, [0, 0.42, 0.45]));
        [-0.9, 0, 0.9].forEach(function (x) { P.push(part(G.box(0.08, 0.4, 0.08), wood, [x, 0.2, -0.4])); P.push(part(G.box(0.08, 0.4, 0.08), wood, [x, 0.2, 0.45])); });
        break;
      case 'handout':
        table(0, 0, 1.7, 0.8, '#D9B98C');
        [-0.5, 0, 0.5].forEach(function (x, i) { P.push(part(G.box(0.4, 0.28, 0.3), accent, [x, 0.9, 0])); if (i !== 1) P.push(part(G.box(0.4, 0.28, 0.3), accent, [x, 1.18, 0])); });
        P.push(part(G.box(0.42, 0.3, 0.32), accent, [-0.9, 0.15, -0.7])); P.push(part(G.box(0.42, 0.3, 0.32), accent, [-0.45, 0.15, -0.75]));
        break;
      case 'complaints':
        table(0, 0, 1.2, 0.7, '#EFE6D6');
        P.push(part(G.box(0.08, 1.6, 0.08), wood, [0.65, 0.8, -0.3])); P.push(part(G.box(0.7, 0.5, 0.06), '#7A5CFA', [0.65, 1.55, -0.3]));
        P.push(part(G.box(0.3, 0.06, 0.06), '#FFFFFF', [0.65, 1.6, -0.26])); P.push(part(G.box(0.18, 0.06, 0.06), '#FFFFFF', [0.6, 1.48, -0.26]));
        break;
      case 'aid':
        P.push(part(G.box(1.5, 1.0, 1.2), cloth, [0, 0.5, 0]));
        P.push(part(G.box(1.6, 0.08, 1.3), '#E5484D', [0, 1.04, 0]));
        P.push(part(G.box(0.36, 0.1, 0.06), '#E5484D', [0, 0.65, 0.61])); P.push(part(G.box(0.1, 0.36, 0.06), '#E5484D', [0, 0.65, 0.61]));
        P.push(part(G.cyl(0.32, 0.32, 0.8, 10), '#19A7E0', [1.05, 0.4, 0.3])); P.push(part(G.cyl(0.05, 0.05, 0.12, 5), '#888888', [1.05, 0.25, 0.65], [Math.PI / 2, 0, 0]));
        break;
      case 'door':
        P.push(part(G.box(1.1, 0.12, 0.7), wood, [0, 0.42, 0])); P.push(part(G.box(1.1, 0.25, 0.06), wood, [0, 0.58, 0.33])); P.push(part(G.box(1.1, 0.25, 0.06), wood, [0, 0.58, -0.33]));
        P.push(part(G.cyl(0.3, 0.3, 0.08, 10), '#333333', [0, 0.3, 0.42], [Math.PI / 2, 0, 0])); P.push(part(G.cyl(0.3, 0.3, 0.08, 10), '#333333', [0, 0.3, -0.42], [Math.PI / 2, 0, 0]));
        P.push(part(G.box(0.9, 0.05, 0.05), wood, [0.95, 0.5, 0.2])); P.push(part(G.box(0.9, 0.05, 0.05), wood, [0.95, 0.5, -0.2]));
        P.push(part(G.box(0.36, 0.26, 0.28), accent, [-0.2, 0.62, 0])); P.push(part(G.box(0.36, 0.26, 0.28), accent, [0.22, 0.62, 0]));
        break;
      case 'banner':
        P.push(part(G.cyl(0.05, 0.05, 2.1, 5), wood, [-0.9, 1.05, 0])); P.push(part(G.cyl(0.05, 0.05, 2.1, 5), wood, [0.9, 1.05, 0]));
        P.push(part(G.box(1.8, 0.7, 0.04), blue, [0, 1.65, 0])); P.push(part(G.box(1.4, 0.12, 0.05), '#FFFFFF', [0, 1.7, 0])); P.push(part(G.box(0.9, 0.08, 0.05), accent, [0, 1.5, 0]));
        break;
      case 'X-fee':
        table(0, 0, 1.2, 0.7, '#B23A3A');
        [[-0.2, 0], [0, 0.1], [0.2, -0.05]].forEach(function (c, i) { P.push(part(G.cyl(0.12, 0.12, 0.12 + i * 0.06, 10), '#F5B301', [c[0], 0.82 + i * 0.03, c[1]])); });
        break;
      case 'X-photo':
        P.push(part(G.cyl(0.03, 0.03, 1.2, 4), '#333333', [0, 0.6, 0], [0.25, 0, 0])); P.push(part(G.cyl(0.03, 0.03, 1.2, 4), '#333333', [0.2, 0.6, -0.1], [-0.2, 0, 0.2]));
        P.push(part(G.box(0.4, 0.28, 0.25), '#222222', [0, 1.25, 0])); P.push(part(G.cyl(0.08, 0.08, 0.15, 8), '#555555', [0, 1.25, 0.18], [Math.PI / 2, 0, 0]));
        break;
      case 'X-sell':
        table(0, 0, 1.4, 0.7, '#E08A00'); P.push(part(G.box(0.4, 0.28, 0.3), accent, [-0.3, 0.9, 0])); P.push(part(G.box(0.4, 0.28, 0.3), accent, [0.25, 0.9, 0]));
        P.push(part(G.box(0.5, 0.3, 0.04), '#FFFFFF', [0, 1.35, -0.25]));
        break;
      default:
        P.push(part(G.box(1, 1, 1), accent, [0, 0.5, 0]));
    }
    return mesh(P);
  }
  /* A flat ribbon along a polyline of [x, z] points (rivers, roads). */
  function ribbon(pts, width, hex, y) {
    var pos = [], c = color(hex), col = [], h = width / 2;
    function side(i) { var a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)], dx = b[0] - a[0], dz = b[1] - a[1], l = Math.hypot(dx, dz) || 1; return [-dz / l * h, dx / l * h]; }
    for (var i = 0; i < pts.length - 1; i++) {
      var s0 = side(i), s1 = side(i + 1), p0 = pts[i], p1 = pts[i + 1];
      var A = [p0[0] + s0[0], y, p0[1] + s0[1]], B = [p0[0] - s0[0], y, p0[1] - s0[1]], Cc = [p1[0] + s1[0], y, p1[1] + s1[1]], D = [p1[0] - s1[0], y, p1[1] - s1[1]];
      pos.push.apply(pos, A.concat(B, Cc, B, D, Cc));
    }
    for (var k = 0; k < pos.length / 3; k++) col.push(c.r, c.g, c.b);
    var g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    g.computeVertexNormals();
    var nrm = g.attributes.normal; for (var n = 0; n < nrm.count; n++) nrm.setXYZ(n, 0, 1, 0);
    return g;
  }
  function megaphone() { return mesh([part(G.cyl(0.08, 0.28, 0.5, 10), '#E5484D', [0, 0, 0], [0, 0, Math.PI / 2]), part(G.cyl(0.05, 0.05, 0.2, 6), '#333333', [-0.18, -0.15, 0])]); }
  function flag(hex) { return mesh([part(G.cyl(0.03, 0.03, 1.6, 5), '#555555', [0, 0.8, 0]), part(G.box(0.6, 0.38, 0.02), hex, [0.31, 1.4, 0])]); }

  return { material: material, part: part, mesh: mesh, G: G, ribbon: ribbon, person: person, kitBox: kitBox, tukul: tukul, acacia: acacia, bush: bush, rock: rock, truck: truck, plot: plot, station: station, megaphone: megaphone, flag: flag };
})();

/* Shared lights and sky for outdoor scenes. */
function makeOutdoorScene(sky) {
  var scene = new THREE.Scene();
  scene.background = new THREE.Color(sky || '#BFE3F7');
  scene.fog = new THREE.Fog(sky || '#BFE3F7', 60, 140);
  var hemi = new THREE.HemisphereLight('#FFF6E5', '#8C6B4A', 1.55); scene.add(hemi);
  var sun = new THREE.DirectionalLight('#FFFFFF', 1.9); sun.position.set(10, 22, 12);
  sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024);
  var sc = sun.shadow.camera; sc.left = -16; sc.right = 16; sc.top = 16; sc.bottom = -16; sc.near = 1; sc.far = 60; sun.shadow.bias = -0.0008;
  scene.add(sun); scene.add(sun.target);
  scene.userData.sun = sun;
  return scene;
}
