/* =============================================================================
 * 40 MISSION KIT: shared building blocks for missions
 *   Kit.view(opts)          3D/2D view with camera tween (v.camTo)
 *   Kit.taps(v, items, ...) taps on the world (people, objects, ground)
 *   Kit.say / Kit.choice    the bottom speech card and event calls
 *   Kit.bubble / Kit.tag    HTML labels that follow world points
 *   Kit.walker              the player character: tap the ground to walk
 * ========================================================================== */
var Kit = {};

/* A mission view: outdoor scene, camera, tween, fitting above the dock. */
Kit.view = function (opts) {
  opts = opts || {};
  var gl = GFX.mode === 'webgl';
  var v = { gl: gl, bounds: opts.bounds, fit: { elev: opts.elev || 52, azim: opts.azim || 0, rotatePortrait: opts.rotatePortrait !== false,
            top: function (W) { return W < 760 ? 100 : 108; }, bottom: function () { var d = $('#dock'); return d ? d.offsetHeight + 8 : 20; }, side: 6, zoom: opts.zoom || 1 } };
  var tween = null;
  if (gl) {
    v.scene = makeOutdoorScene(opts.sky || '#CDE8F6');
    v.camera = new THREE.PerspectiveCamera(opts.fov || 36, 1, 0.1, 400);
    v.onQuality = function (q) { v.scene.userData.sun.castShadow = q === 'high'; };
  }
  v.camTo = function (bounds, dur) {
    if (!gl || !v.camera.userData.placed || reduceMotion || !dur) { v.bounds = bounds; GFX.refit(); if (gl) v.camera.userData.placed = true; return; }
    var fromP = v.camera.position.clone(), fromT = v.camTarget.clone();
    v.bounds = bounds; GFX.refit();
    tween = { t: 0, d: dur, fromP: fromP, toP: v.camera.position.clone(), fromT: fromT, toT: v.camTarget.clone() };
    v.camera.position.copy(fromP); v.camera.lookAt(fromT);
  };
  v.onFit = function () { if (tween) { tween.toP = v.camera.position.clone(); tween.toT = v.camTarget.clone(); } };
  v.tween = function (dt) {
    if (!tween) return;
    tween.t += dt; var k = clamp(tween.t / tween.d, 0, 1), e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
    v.camera.position.lerpVectors(tween.fromP, tween.toP, e); v.camera.lookAt(tween.fromT.clone().lerp(tween.toT, e));
    if (k >= 1) tween = null;
  };
  v.focusCritical = function (f) { if (f) v.camTo({ minX: f[0] - 3, maxX: f[0] + 3, minZ: f[2] - 2.4, maxZ: f[2] + 2.4, maxY: 2 }, 0.7); };
  v.disposers = [];
  v.dispose = function () {
    v.disposers.forEach(function (f) { try { f(); } catch (e) {} });
    if (v.scene) v.scene.traverse(function (o) { if (o.geometry) o.geometry.dispose(); if (o.material && o.material !== M3.material()) { if (o.material.dispose) o.material.dispose(); } });
  };
  /* Register now, so labels the mission adds next are not cleared. */
  GFX.setView(v);
  return v;
};
/* Start a view: register it with GFX and with the critical-rule camera. */
Kit.start = function (v, ctx) {
  if (v.gl) v.camera.userData.placed = false;
  v.camTo(v.bounds, 0);
  ctx.onCritical = v.focusCritical;
  v.disposers.push(function () { ctx.onCritical = null; });
};

/* Taps on the world. items(): [{x, z, r, h, ...}] ; onHit(item) ; onGround({x,z}) */
Kit.taps = function (v, items, onHit, onGround) {
  var down = null, canvas = GFX.canvas;
  function d(e) { down = { x: e.clientX, y: e.clientY }; }
  function u(e) {
    if (!down) return; var dx = e.clientX - down.x, dy = e.clientY - down.y; down = null;
    if (dx * dx + dy * dy > 144 || ctx.busy) return;
    var hit = GFX.pickNearest(e.clientX, e.clientY, items());
    if (hit) { onHit(hit); return; }
    if (onGround) { var g = GFX.toGround(e.clientX, e.clientY, 0); if (g) onGround(g); }
  }
  canvas.addEventListener('pointerdown', d); canvas.addEventListener('pointerup', u);
  v.disposers.push(function () { canvas.removeEventListener('pointerdown', d); canvas.removeEventListener('pointerup', u); });
};

/* Bottom speech card. extra = HTML below the speech (buttons, chips...). */
Kit.say = function (charId, html, extra) {
  var dock = ctx.dock(); if (!dock) return null;
  dock.innerHTML = '<div class="dock-inner">' + (charId ? sayHTML(charId, html) : '<div class="what">' + html + '</div>') + (extra || '') + '</div>';
  GFX.refit();
  return dock.firstChild;
};
/* A row of action buttons for the dock: [{id, text, cls}] */
Kit.buttons = function (list) {
  return '<div class="actions" style="justify-content:center;margin-top:8px">' + list.map(function (b) { return '<button class="btn ' + (b.cls || 'mc') + '" type="button" id="' + b.id + '">' + esc(b.text) + '</button>'; }).join('') + '</div>';
};

/* An event call: speaker, prompt, options. Scores it and calls done(ok).
 * E: { id, speaker, prompt, options:[{text, correct, critical, why}], explain, ref }
 * o: { pos:[x,z] where the "!" shows, after: ms before done (default 1100) } */
Kit.choice = function (E, o) {
  o = o || {};
  var opts = shuffle(E.options), speaker = E.speaker || 'majok', mark = null;
  if (o.pos) { mark = GFX.addLabel(el('<span class="bub" style="--bc:#F5B301;pointer-events:none"><b style="color:#14213D;font-size:22px">!</b></span>'), function () { return [o.pos[0], o.h || 2.4, o.pos[1]]; }); }
  if (run) run.debug.cur = E;
  Sound.alarm();
  Kit.say(speaker, fmt(E.prompt, true), '<div class="options" id="ev-opts">' + opts.map(function (op, i) { return '<button class="opt" type="button" data-i="' + E.options.indexOf(op) + '"><span class="k">' + letter(i) + '</span><span>' + fmt(op.text, true) + '</span></button>'; }).join('') + '</div>');
  $$('#ev-opts .opt').forEach(function (b) {
    b.onclick = function () {
      if (!run || run.ended || run.paused || modalOpen()) return;
      var op = E.options[Number(b.getAttribute('data-i'))], r = b.getBoundingClientRect(), at = { x: r.left + 40, y: r.top };
      $$('#ev-opts .opt').forEach(function (x) { x.disabled = true; if (E.options[Number(x.getAttribute('data-i'))].correct) x.classList.add('right'); else if (x === b) x.classList.add('wrong'); });
      if (mark) GFX.removeLabel(mark);
      if (op.critical) { ctx.answer({ correct: false, critical: op.critical, id: E.id, ref: E.ref, why: E.explain, at: at, focus: o.pos ? [o.pos[0], 1, o.pos[1]] : null }); return; }
      ctx.answer({ correct: !!op.correct, id: E.id, ref: E.ref, title: op.correct ? 'Good call' : 'Not quite', why: op.correct ? E.explain : (op.why || E.explain), at: at });
      later(function () { if (run && !run.ended && o.done) o.done(!!op.correct, op); }, o.after != null ? o.after : 1100);
    };
  });
};
/* Run a list of event calls one after another, then call done(). */
Kit.choices = function (list, pos, done) {
  var i = 0;
  (function next() { if (!run || run.ended) return; if (i >= list.length) return done(); Kit.choice(list[i++], { pos: pos, done: next }); })();
};

/* A round button that follows a world point. opts: { ring: true, sep: true, h } */
Kit.bubble = function (iconName, color, label, pos, onTap, opts) {
  opts = opts || {};
  var b = el('<button class="bub" type="button" aria-label="' + esc(label) + '" style="--bc:' + color + '">' + icon(iconName, '#fff', 'class="ic"') +
    (opts.ring ? '<svg class="ring" viewBox="0 0 36 36"><circle cx="18" cy="18" r="16" fill="none" stroke="rgba(255,255,255,.55)" stroke-width="3"/><circle class="pc" cx="18" cy="18" r="16" fill="none" stroke="#F5B301" stroke-width="3.4" stroke-dasharray="100.5" stroke-dashoffset="0" stroke-linecap="round"/></svg>' : '') + '</button>');
  b.onclick = function (e) { e.stopPropagation(); if (!ctx.busy) onTap(); };
  var L = GFX.addLabel(b, typeof pos === 'function' ? pos : function () { return pos; }, { sep: opts.sep !== false });
  L.ring = function (f) { var c = b.querySelector('.pc'); if (c) { c.setAttribute('stroke-dashoffset', String(Math.round((1 - clamp(f, 0, 1)) * 100.5))); c.setAttribute('stroke', f < 0.3 ? '#E5484D' : '#F5B301'); } };
  return L;
};
/* A text tag that follows a world point (optionally tappable). */
Kit.tag = function (text, pos, onTap, cls, opts) {
  var n = el('<' + (onTap ? 'button type="button"' : 'span') + ' class="lbl' + (onTap ? ' tap' : '') + (cls ? ' ' + cls : '') + '">' + text + '</' + (onTap ? 'button' : 'span') + '>');
  if (onTap) n.onclick = function (e) { e.stopPropagation(); if (!ctx.busy) onTap(); };
  return GFX.addLabel(n, typeof pos === 'function' ? pos : function () { return pos; }, opts);
};

/* The player character. Tap the ground to walk; arrows/WASD also work. */
Kit.walker = function (v, x, z, opts) {
  opts = opts || {};
  var w = { x: x, z: z, face: 0, path: [], onArrive: null, speed: opts.speed || 3.4, obj: null, bounds: opts.bounds };
  if (v.gl) {
    w.obj = M3.person({ skin: '#6B4226', shirt: Store.get().truckColor || C.ngo.color, hair: 'short', scarf: '#F5B301' });
    w.obj.position.set(x, 0, z); v.scene.add(w.obj);
    var ring = new THREE.Mesh(M3.G.ring(0.42, 0.55, 24), new THREE.MeshBasicMaterial({ color: '#F5B301', transparent: true, opacity: 0.9 }));
    ring.position.y = 0.03; w.obj.add(ring);
  }
  var keys = {};
  function kd(e) { if (/^(Arrow|[wasdWASD]$)/.test(e.key) && !(e.target && /INPUT|SELECT|TEXTAREA/.test(e.target.tagName))) { keys[e.key.toLowerCase()] = true; } }
  function ku(e) { keys[e.key.toLowerCase()] = false; }
  document.addEventListener('keydown', kd); document.addEventListener('keyup', ku);
  v.disposers.push(function () { document.removeEventListener('keydown', kd); document.removeEventListener('keyup', ku); });
  w.goTo = function (tx, tz, onArrive) {
    if (w.bounds) { tx = clamp(tx, w.bounds.minX, w.bounds.maxX); tz = clamp(tz, w.bounds.minZ, w.bounds.maxZ); }
    w.path = [[tx, tz]]; w.onArrive = onArrive || null;
  };
  w.update = function (dt, t, frozen) {
    if (frozen) return sync(t, false);
    var kx = (keys.arrowright || keys.d ? 1 : 0) - (keys.arrowleft || keys.a ? 1 : 0), kz = (keys.arrowdown || keys.s ? 1 : 0) - (keys.arrowup || keys.w ? 1 : 0);
    var moving = false;
    if (kx || kz) {
      // keyboard moves relative to the screen: rotate by the camera azimuth when the view is turned
      var rot = GFX.portrait && v.fit.rotatePortrait; var mx = rot ? kz : kx, mz = rot ? -kx : kz;
      var l = Math.hypot(mx, mz); w.x += mx / l * w.speed * dt; w.z += mz / l * w.speed * dt; w.face = Math.atan2(mx, mz); w.path = []; moving = true;
      if (w.bounds) { w.x = clamp(w.x, w.bounds.minX, w.bounds.maxX); w.z = clamp(w.z, w.bounds.minZ, w.bounds.maxZ); }
      if (opts.onMove) opts.onMove(w);
    } else if (w.path.length) {
      var tg = w.path[0], dx = tg[0] - w.x, dz = tg[1] - w.z, d = Math.hypot(dx, dz), s = w.speed * dt; moving = true;
      if (d > 0.001) w.face = Math.atan2(dx, dz);
      if (d <= s) { w.x = tg[0]; w.z = tg[1]; w.path.shift(); if (!w.path.length) { var f = w.onArrive; w.onArrive = null; if (f) f(); } }
      else { w.x += dx / d * s; w.z += dz / d * s; }
    }
    sync(t, moving);
  };
  function sync(t, moving) { if (!w.obj) return; w.obj.position.set(w.x, 0, w.z); w.obj.rotation.y = w.face; w.obj.userData.body.position.y = moving && !reduceMotion ? Math.abs(Math.sin(t * 10)) * 0.07 : 0; }
  return w;
};

/* A floating, glowing pickup (a document, a box). Returns { obj, x, z, taken } */
Kit.pickup = function (v, x, z, color) {
  var p = { x: x, z: z, taken: false, obj: null, t: Math.random() * 6 };
  if (v.gl) {
    var g = new THREE.Group();
    var sheet = M3.mesh([M3.part(M3.G.box(0.5, 0.04, 0.66), '#FFFFFF'), M3.part(M3.G.box(0.36, 0.045, 0.06), color, [0, 0.005, -0.18]), M3.part(M3.G.box(0.3, 0.045, 0.04), '#9AA6BD', [0, 0.005, 0]), M3.part(M3.G.box(0.3, 0.045, 0.04), '#9AA6BD', [0, 0.005, 0.12])]);
    sheet.rotation.x = -0.9; g.add(sheet);
    var glow = new THREE.Mesh(M3.G.ring(0.35, 0.55, 24), new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: 0.55 }));
    glow.position.y = -0.85; g.add(glow);
    g.position.set(x, 1, z); v.scene.add(g); p.obj = g; p.glow = glow;
  }
  p.update = function (dt) { p.t += dt; if (p.obj) { p.obj.visible = !p.taken; p.obj.children[0].position.y = reduceMotion ? 0 : Math.sin(p.t * 2.4) * 0.12; p.obj.children[0].rotation.z = reduceMotion ? 0 : Math.sin(p.t) * 0.2; } };
  return p;
};

/* Shared 2D fallback helpers. */
Kit.d2 = {
  rect: function (g, Pj, x0, z0, x1, z1, col) { var a = Pj.project(x0, 0, z0), b = Pj.project(x1, 0, z1); g.fillStyle = col; g.fillRect(Math.min(a.x, b.x), Math.min(a.y, b.y), Math.abs(b.x - a.x), Math.abs(b.y - a.y)); },
  dot: function (g, Pj, x, z, r, col) { var q = Pj.project(x, 0, z); g.fillStyle = col; g.beginPath(); g.arc(q.x, q.y, Math.max(3, r * Pj.s), 0, Math.PI * 2); g.fill(); },
  box: function (g, Pj, x, z, w, d, col) { var q = Pj.project(x, 0, z), W = (Pj.rot ? d : w) * Pj.s, H = (Pj.rot ? w : d) * Pj.s; g.fillStyle = col; g.fillRect(q.x - W / 2, q.y - H / 2, W, H); g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = 1.5; g.strokeRect(q.x - W / 2, q.y - H / 2, W, H); }
};
