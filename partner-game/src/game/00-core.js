/* =============================================================================
 * 00 CORE: utilities, storage, sound, text, icons, toasts, modals, effects
 * ========================================================================== */
var C = window.CONTENT;
var S = C.settings;
var reduceMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
var $ = function (sel, root) { return (root || document).querySelector(sel); };
var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
function lerp(a, b, t) { return a + (b - a) * t; }
function pct(x) { return Math.round(x * 100) + '%'; }
function fmtNum(n) { return Number(Math.round(n)).toLocaleString('en-US'); }
function el(html) { var t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; }
function letter(i) { return String.fromCharCode(65 + i); }
function missionById(id) { for (var i = 0; i < C.missions.length; i++) if (C.missions[i].id === id) return C.missions[i]; return null; }
function missionIndex(id) { for (var i = 0; i < C.missions.length; i++) if (C.missions[i].id === id) return i; return -1; }
function textOn(hex) {
  var h = String(hex).replace('#', ''); if (h.length !== 6) return '#FFFFFF';
  var lin = function (c) { c = parseInt(c, 16) / 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
  var L = 0.2126 * lin(h.substr(0, 2)) + 0.7152 * lin(h.substr(2, 2)) + 0.0722 * lin(h.substr(4, 2));
  return L > 0.36 ? '#14213D' : '#FFFFFF';
}
function shadeHex(hex, amt) {
  var h = hex.replace('#', ''), r = parseInt(h.substr(0, 2), 16), g = parseInt(h.substr(2, 2), 16), b = parseInt(h.substr(4, 2), 16);
  var t = amt < 0 ? 0 : 255, p = Math.abs(amt);
  var f = function (c) { return ('0' + Math.round((t - c) * p + c).toString(16)).slice(-2); };
  return '#' + f(r) + f(g) + f(b);
}
function setMissionColor(node, color) { node.style.setProperty('--mc', color); node.style.setProperty('--mc-text', textOn(color)); }

(function applyTheme() {
  var T = C.theme || {}, root = document.documentElement.style;
  var map = { iomBlue: '--blue', iomBlueDark: '--blue-dark', iomBlueLight: '--blue-light', background: '--bg', text: '--text', correct: '--ok', wrong: '--bad', warning: '--warn', gold: '--gold' };
  Object.keys(map).forEach(function (k) { if (T[k]) root.setProperty(map[k], T[k]); });
})();

/* ---------- Timers that belong to the current screen ---------- */
var screenTimers = [];
function later(fn, ms) { var id = setTimeout(fn, ms); screenTimers.push(id); return id; }
function clearScreenTimers() { screenTimers.forEach(clearTimeout); screenTimers = []; }

/* ---------- Storage: localStorage wrapped in try/catch ---------- */
var Store = (function () {
  var ok = true;
  function blank() {
    return { schema: 1, player: { name: '', org: '', state: '' }, track: '',
      settings: { gfx: '', relaxed: false, muted: false },
      missions: {}, attempts: [], badges: [], unlocks: ['truck-teal'], truckColor: '', bestStreak: 0,
      flawless: false, anyCritical: false, allDoneOnce: false };
  }
  var data = blank();
  try {
    var raw = window.localStorage.getItem(S.storageKey);
    var saved = raw ? JSON.parse(raw) : null;
    if (saved && typeof saved === 'object') {
      Object.keys(saved).forEach(function (k) { data[k] = saved[k]; });
      data.player = Object.assign(blank().player, saved.player || {});
      data.settings = Object.assign(blank().settings, saved.settings || {});
    }
  } catch (e) { ok = false; }
  return {
    get: function () { return data; },
    save: function () { try { window.localStorage.setItem(S.storageKey, JSON.stringify(data)); return true; } catch (e) { ok = false; return false; } },
    reset: function () { var keep = { player: data.player, track: data.track, settings: data.settings }; data = blank(); Object.assign(data, keep); this.save(); },
    available: function () { return ok; }
  };
})();
function pace() { return Store.get().settings.relaxed ? (S.relaxedPaceFactor || 1.6) : 1; }
function track() { return C.tracks[Store.get().track] || C.tracks.SNFI; }

/* ---------- Text: acronyms spelled out on first use per mission ---------- */
var glossKeys = Object.keys(C.glossary || {}).sort(function (a, b) { return b.length - a.length; });
var glossRe = glossKeys.length ? new RegExp('(^|[^A-Za-z0-9\\-])(' + glossKeys.map(function (k) { return k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }).join('|') + ')(?![A-Za-z0-9])', 'g') : null;
var seenAcr = {};
function resetAcronyms() { seenAcr = {}; }
/* fmt(text, expand): escape, then mark acronyms. expand=true spells out the first use. */
function fmt(text, expand) {
  var s = esc(fill(text));
  if (!glossRe) return s;
  return s.replace(glossRe, function (m, pre, key, offset, whole) {
    var meaning = C.glossary[key], tag = '<abbr title="' + esc(meaning) + '">' + key + '</abbr>';
    var after = whole.substr(offset + m.length, 2);
    if (expand && !seenAcr[key] && after.charAt(0) !== '-' && after.charAt(0) !== ')') {
      seenAcr[key] = true;
      return pre + tag + ' (' + esc(meaning) + ')';
    }
    return pre + tag;
  });
}
/* {demo} {cluster} {kit} {ngo} placeholders follow the chosen track. */
function fill(text) {
  var t = track();
  return String(text == null ? '' : text)
    .replace(/\{demo\}/g, t.demo).replace(/\{cluster\}/g, t.cluster)
    .replace(/\{kit\}/g, t.kits[0].name).replace(/\{ngo\}/g, C.ngo.name)
    .replace(/\{deadline\}/g, t.reportDeadline).replace(/\{report\}/g, t.report);
}

/* ---------- Sound: generated with Web Audio, no files ---------- */
var Sound = (function () {
  var ctx = null, master = null;
  function ensure() {
    if (Store.get().settings.muted) return null;
    try {
      if (!ctx) { var AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null; ctx = new AC(); master = ctx.createGain(); master.gain.value = 0.5; master.connect(ctx.destination); }
      if (ctx.state === 'suspended') ctx.resume();
      return ctx;
    } catch (e) { return null; }
  }
  function tone(freq, start, dur, type, vol, slideTo) {
    var c = ensure(); if (!c) return;
    var t0 = c.currentTime + (start || 0), o = c.createOscillator(), g = c.createGain();
    o.type = type || 'sine'; o.frequency.setValueAtTime(freq, t0);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
    g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(vol || 0.3, t0 + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g); g.connect(master); o.start(t0); o.stop(t0 + dur + 0.02);
  }
  function noise(start, dur, vol, freq) {
    var c = ensure(); if (!c) return;
    var t0 = c.currentTime + (start || 0), n = Math.floor(c.sampleRate * dur), buf = c.createBuffer(1, n, c.sampleRate), d = buf.getChannelData(0);
    for (var i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
    var s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
    s.buffer = buf; f.type = 'lowpass'; f.frequency.value = freq || 900; g.gain.value = vol || 0.3;
    s.connect(f); f.connect(g); g.connect(master); s.start(t0);
  }
  return {
    unlock: ensure,
    tap: function () { tone(660, 0, 0.06, 'triangle', 0.15); },
    good: function () { tone(660, 0, 0.09, 'triangle', 0.25); tone(990, 0.07, 0.14, 'triangle', 0.25); },
    bad: function () { tone(220, 0, 0.22, 'sawtooth', 0.12, 140); },
    build: function () { tone(330, 0, 0.08, 'square', 0.12); tone(495, 0.06, 0.12, 'square', 0.12); noise(0, 0.12, 0.15, 500); },
    whoosh: function () { noise(0, 0.35, 0.18, 1800); },
    pop: function () { tone(880, 0, 0.05, 'sine', 0.2, 1320); },
    stamp: function () { noise(0, 0.25, 0.5, 300); tone(80, 0, 0.3, 'sine', 0.5, 50); },
    alarm: function () { tone(440, 0, 0.18, 'square', 0.12); tone(330, 0.2, 0.3, 'square', 0.12); },
    fanfare: function () { [523, 659, 784, 1047].forEach(function (f, i) { tone(f, i * 0.11, 0.22, 'triangle', 0.22); }); },
    tick: function () { tone(1200, 0, 0.03, 'square', 0.06); }
  };
})();

/* ---------- Icons (inline SVG, 24x24) ---------- */
var ICONS = {
  heart: '<path d="M12 21s-7.5-4.6-9.6-9.4C.9 8 3.1 4 7 4c2.1 0 3.6 1.1 5 3 1.4-1.9 2.9-3 5-3 3.9 0 6.1 4 4.6 7.6C19.5 16.4 12 21 12 21z"/>',
  star: '<path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3 6.1 20.6l1.3-6.6L2.5 9.4l6.6-.8z"/>',
  flame: '<path d="M12 2c1 3.5 5 5.5 5 10.5A5 5 0 0 1 7 12.5c0-2 1-3.5 2-4.5.2 1.8 1 3 2.2 3.4C10.6 8.3 11 5 12 2z"/>',
  pause: '<rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/>',
  sound: '<path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
  mute: '<path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M16 9l5 6M21 9l-5 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
  check: '<path d="M4 12.5l5 5L20 6.5" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>',
  cross: '<path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>',
  lock: '<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3" fill="none" stroke="currentColor" stroke-width="2.4"/>',
  map: '<path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M9 4v14M15 6v14" stroke="currentColor" stroke-width="2"/>',
  entry: '<path d="M4 20V5a1 1 0 0 1 1-1h8v16" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="M10 12h10M16 8l4 4-4 4" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>',
  exit: '<path d="M20 20V5a1 1 0 0 0-1-1h-8v16" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="M3 12h11M10 8l4 4-4 4" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>',
  register: '<rect x="3" y="5" width="18" height="14" rx="2" fill="none" stroke="currentColor" stroke-width="2.2"/><circle cx="9" cy="11" r="2.4"/><path d="M5.5 16.5c.8-2 5.2-2 6 0M14 10h5M14 14h4" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/>',
  shade: '<path d="M2 11 12 4l10 7z"/><path d="M12 11v9" stroke="currentColor" stroke-width="2.4"/><path d="M5 20h14" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>',
  kit: '<path d="M3 8l9-4 9 4v9l-9 4-9-4z" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/><path d="M3 8l9 4 9-4M12 12v9" fill="none" stroke="currentColor" stroke-width="2.2"/>',
  complaint: '<path d="M4 5h16v11H9l-5 4z" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/><path d="M12 8v3.5M12 13.5v.5" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>',
  aid: '<rect x="3" y="3" width="18" height="18" rx="4"/><path d="M12 7v10M7 12h10" stroke="#fff" stroke-width="3" stroke-linecap="round"/>',
  door: '<path d="M3 11 12 4l9 7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/><path d="M5 10v10h14V10" fill="none" stroke="currentColor" stroke-width="2.2"/><rect x="10" y="14" width="4" height="6"/>',
  banner: '<path d="M5 3v18" stroke="currentColor" stroke-width="2.4"/><path d="M6 4h13l-3 4 3 4H6z"/>',
  idcard: '<rect x="2" y="5" width="20" height="14" rx="2.5"/><circle cx="8" cy="11" r="2.4" fill="#fff"/><path d="M4.8 16.2c.9-2 5.5-2 6.4 0M14 10h5M14 14h4" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round"/>',
  speech: '<path d="M3 4h18v12H9l-6 5z"/><path d="M8 9h8M8 12h5" stroke="#fff" stroke-width="2" stroke-linecap="round"/>',
  drop: '<path d="M12 2.5C9 7 6 10.3 6 14a6 6 0 0 0 12 0c0-3.7-3-7-6-11.5z"/>',
  noentry: '<circle cx="12" cy="12" r="9.5"/><rect x="6" y="10.4" width="12" height="3.2" rx="1" fill="#fff"/>',
  house: '<path d="M3 11 12 4l9 7v9H3z"/><rect x="10" y="14" width="4" height="6" fill="#fff"/>',
  megaphone: '<path d="M3 10v4h3l9 5V5L6 10z"/><path d="M18 9a4 4 0 0 1 0 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
  ban: '<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M5.6 5.6l12.8 12.8" stroke="currentColor" stroke-width="2.4"/>',
  shield: '<path d="M12 2l8 3v6c0 5-3.4 9.3-8 11-4.6-1.7-8-6-8-11V5z"/><path d="M8.5 12l2.5 2.5 4.5-5" fill="none" stroke="#fff" stroke-width="2.2"/>',
  truck: '<rect x="2" y="7" width="12" height="9" rx="1"/><path d="M14 10h4l3 3v3h-7z"/><circle cx="6" cy="17.5" r="2" fill="#fff" stroke="currentColor" stroke-width="1.5"/><circle cx="17" cy="17.5" r="2" fill="#fff" stroke="currentColor" stroke-width="1.5"/>'
};
function icon(name, color, extra) { return '<svg viewBox="0 0 24 24" fill="' + (color || 'currentColor') + '" ' + (extra || '') + ' aria-hidden="true" style="color:' + (color || 'currentColor') + '">' + (ICONS[name] || '') + '</svg>'; }
function starsHTML(n, max) { max = max || 3; var h = '<span class="stars" role="img" aria-label="' + n + ' of ' + max + ' stars">'; for (var i = 0; i < max; i++) h += icon('star', i < n ? 'var(--gold)' : '#D5DDEB'); return h + '</span>'; }
function heartsHTML(lives, max) { var h = '<span class="hearts" role="img" aria-label="' + lives + ' lives left">'; for (var i = 0; i < max; i++) h += icon('heart', i < lives ? '#E5484D' : '#D5DDEB', 'data-heart="' + i + '"'); return h + '</span>'; }

/* Character face for speech panels (SVG). */
function faceSVG(charId) {
  var ch = C.characters[charId] || { name: '?', role: '', look: {} }, L = ch.look || {};
  var skin = L.skin || '#6B4226', hc = L.hairColor || '#1E1E1E', shirt = L.shirt || '#0033A0', hair = '';
  if (charId === 'you') shirt = Store.get().truckColor || C.ngo.color;
  switch (L.hair) {
    case 'short': hair = '<path d="M29 44 Q28 21 50 20 Q72 21 71 44 Q68 31 50 30 Q33 31 29 44Z" fill="' + hc + '"/>'; break;
    case 'long': hair = '<path d="M27 46 Q26 18 50 18 Q74 18 73 46 L75 70 Q62 74 62 60 Q66 34 50 30 Q34 34 38 60 Q38 74 25 70Z" fill="' + hc + '"/>'; break;
    case 'headwrap': hair = '<path d="M27 42 Q24 14 50 12 Q76 14 73 42 Q66 30 50 30 Q34 30 27 42Z" fill="' + hc + '"/><path d="M58 14 Q72 6 74 18 Q66 16 60 22Z" fill="' + hc + '"/>'; break;
    case 'cap': hair = '<path d="M29 40 Q29 20 50 20 Q71 20 71 40Z" fill="' + hc + '"/><path d="M50 36 L82 38 Q80 43 70 42 L50 41Z" fill="' + hc + '"/>'; break;
    case 'bun': hair = '<circle cx="50" cy="17" r="9" fill="' + hc + '"/><path d="M30 42 Q30 22 50 22 Q70 22 70 42 Q66 31 50 30 Q34 31 30 42Z" fill="' + hc + '"/>'; break;
  }
  var bg = shadeHex(shirt, 0.78);
  return '<svg viewBox="0 0 100 100" role="img" aria-label="' + esc(ch.name + ', ' + ch.role) + '"><circle cx="50" cy="50" r="50" fill="' + bg + '"/>' +
    '<clipPath id="fc' + charId + '"><circle cx="50" cy="50" r="50"/></clipPath><g clip-path="url(#fc' + charId + ')">' +
    '<path d="M14 104 Q16 72 50 70 Q84 72 86 104Z" fill="' + shirt + '"/><rect x="44" y="58" width="12" height="14" rx="5" fill="' + skin + '"/>' +
    '<ellipse cx="50" cy="45" rx="20" ry="22" fill="' + skin + '"/>' + hair +
    '<ellipse cx="42" cy="46" rx="2.6" ry="3.2" fill="#1E1E1E"/><ellipse cx="58" cy="46" rx="2.6" ry="3.2" fill="#1E1E1E"/>' +
    '<path d="M43 55 Q50 61 57 55" stroke="#3A1F10" stroke-width="2.4" fill="none" stroke-linecap="round"/></g></svg>';
}
function sayHTML(charId, html) {
  var ch = C.characters[charId] || { name: '', role: '' };
  return '<div class="say"><div class="face">' + faceSVG(charId) + '</div><div class="grow"><div class="who">' + esc(ch.name) + ' · ' + esc(ch.role) + '</div><div class="what">' + html + '</div></div></div>';
}

/* ---------- Toasts: one at a time, never more than two sentences ---------- */
function toast(html, kind, ms) {
  var root = $('#toasts'); root.innerHTML = '';
  var t = el('<div class="toast ' + (kind || '') + '" role="status">' + html + '</div>');
  root.appendChild(t);
  setTimeout(function () { if (t.parentNode) t.remove(); }, ms || 3800);
}
function refChip(ref) { return ref ? ' <span class="ref">' + esc(ref) + '</span>' : ''; }

/* ---------- Modals: every modal resolves or stays open (no soft-lock) ----------
 * openModal(html, { onEscape }) : Escape calls onEscape if given, else nothing. */
var modalEscape = null;
function openModal(inner, opts) {
  var root = $('#modal-root');
  root.innerHTML = '<div class="overlay"><div class="modal" role="dialog" aria-modal="true">' + inner + '</div></div>';
  modalEscape = (opts && opts.onEscape) || null;
  var f = root.querySelector('.modal .btn, .modal .opt'); if (f) setTimeout(function () { f.focus(); }, 30);
  return root.querySelector('.modal');
}
function closeModal() { $('#modal-root').innerHTML = ''; modalEscape = null; }
function modalOpen() { return !!$('#modal-root .overlay'); }
document.addEventListener('keydown', function (e) {
  /* Escape belongs to the open modal only: stop it here so no other handler
   * (e.g. the pause key) reopens something in the same key press. */
  if (e.key === 'Escape' && modalOpen()) { e.preventDefault(); e.stopImmediatePropagation(); if (modalEscape) { var f = modalEscape; f(); } return; }
});
function confirmModal(title, text, okLabel, onOk) {
  openModal('<div class="modal-head"><h2>' + esc(title) + '</h2></div><div class="modal-body"><p>' + esc(text) + '</p>' +
    '<div class="actions"><button class="btn alt" id="m-cancel">Cancel</button><button class="btn" id="m-ok">' + esc(okLabel) + '</button></div></div>',
    { onEscape: closeModal });
  $('#m-cancel').onclick = closeModal;
  $('#m-ok').onclick = function () { closeModal(); onOk(); };
}

/* ---------- Effects ---------- */
function burst(x, y, colors) {
  if (reduceMotion) return;
  var fx = $('#fx'); colors = colors || ['#F5B301', '#00A889', '#19A7E0', '#E5554F', '#7A5CFA'];
  for (var i = 0; i < 14; i++) {
    var s = document.createElement('span'), a = (Math.PI * 2 * i) / 14, d = 40 + Math.random() * 40;
    s.className = 'spark'; s.style.left = x + 'px'; s.style.top = y + 'px'; s.style.background = colors[i % colors.length];
    s.style.setProperty('--dx', Math.cos(a) * d + 'px'); s.style.setProperty('--dy', Math.sin(a) * d + 'px');
    fx.appendChild(s); setTimeout(function (n) { n.remove(); }.bind(null, s), 800);
  }
}
function floater(x, y, text, bad) {
  var f = el('<span class="floater' + (bad ? ' bad' : '') + '">' + esc(text) + '</span>');
  f.style.left = x + 'px'; f.style.top = y + 'px'; $('#fx').appendChild(f);
  setTimeout(function () { f.remove(); }, 950);
}
function confetti() {
  if (reduceMotion) return;
  var fx = $('#fx'), colors = ['#0033A0', '#F5B301', '#00A889', '#19A7E0', '#E5554F', '#7A5CFA', '#D6246E'];
  for (var i = 0; i < 80; i++) {
    var c = document.createElement('span'); c.className = 'confetti';
    c.style.left = Math.random() * 100 + 'vw'; c.style.background = colors[i % colors.length];
    c.style.animationDuration = (1.8 + Math.random() * 1.6) + 's'; c.style.animationDelay = (Math.random() * 0.4) + 's';
    c.style.setProperty('--dx', (Math.random() * 200 - 100) + 'px'); c.style.setProperty('--rot', (Math.random() * 720 - 360) + 'deg');
    fx.appendChild(c); setTimeout(function (n) { n.remove(); }.bind(null, c), 4000);
  }
}
/* Fly a DOM element from its place to a screen point (chips into the megaphone). */
function flyTo(node, x, y, done) {
  var r = node.getBoundingClientRect(), clone = node.cloneNode(true);
  clone.classList.add('flyer'); clone.style.left = r.left + 'px'; clone.style.top = r.top + 'px'; clone.style.width = r.width + 'px'; clone.style.margin = '0';
  document.body.appendChild(clone);
  requestAnimationFrame(function () { requestAnimationFrame(function () {
    clone.style.transform = 'translate(' + (x - r.left - r.width / 2) + 'px,' + (y - r.top - r.height / 2) + 'px) scale(.2)'; clone.style.opacity = '0.2';
  }); });
  setTimeout(function () { clone.remove(); if (done) done(); }, reduceMotion ? 20 : 560);
}
