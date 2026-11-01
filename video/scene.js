// "The Day the Machines Went Quiet" — 16:9 editorial collage animation.
// render(t) draws the frame at time t (seconds, 0..60) into #scene.
const R = '#D83A2E', Y = '#F4C542', K = '#202020', I = '#F4EBDD', C = '#4C9CA8', W = '#FBF7EF';
const FPS = 24;
let F = 0;
const TEX = {};
const CACHE = {};

// ---------- utilities ----------
function rng(seed) { let a = seed >>> 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const seg = (t, a, b) => clamp((t - a) / (b - a));
const ease = x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
const eOut = x => 1 - Math.pow(1 - x, 3);
const eIn = x => x * x * x;
const eBack = x => { const c = 1.9; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
const lerp = (a, b, t) => a + (b - a) * t;
const f1 = n => n.toFixed(1);
const cached = (k, fn) => (CACHE[k] ??= fn());

function tornPoly(V, seed, j = 7, step = 22) {
  const r = rng(seed); let s = '';
  for (let k = 0; k < V.length; k++) {
    const [x0, y0] = V[k], [x1, y1] = V[(k + 1) % V.length];
    const L = Math.hypot(x1 - x0, y1 - y0) || 1, n = Math.max(1, Math.round(L / step));
    const nx = -(y1 - y0) / L, ny = (x1 - x0) / L;
    for (let i = 0; i < n; i++) { const t = i / n, o = (r() - .5) * 2 * j; s += `${f1(x0 + (x1 - x0) * t + nx * o)},${f1(y0 + (y1 - y0) * t + ny * o)} `; }
  }
  return s;
}
const torn = (x, y, w, h, seed, j, step) => tornPoly([[x, y], [x + w, y], [x + w, y + h], [x, y + h]], seed, j, step);
const poly = (pts, fill, extra = '') => `<polygon points="${pts}" fill="${fill}" ${extra}/>`;
const qpt = (a, c, b, t) => [(1 - t) * (1 - t) * a[0] + 2 * (1 - t) * t * c[0] + t * t * b[0], (1 - t) * (1 - t) * a[1] + 2 * (1 - t) * t * c[1] + t * t * b[1]];
// marker stroke drawn progressively (p in 0..1)
function mk(d, col, w, p, extra = '') {
  if (p <= 0) return '';
  return `<path d="${d}" pathLength="1" stroke-dasharray="${p.toFixed(4)} 2" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`;
}
const L = (c, f, content, extra = '') => `<g transform="translate(960 540) rotate(${f1(c.rot || 0)}) scale(${c.z.toFixed(4)}) translate(${f1(-c.cx * f)} ${f1(-c.cy)})" ${extra}>${content}</g>`;

// ---------- collage pieces ----------
function person(x, y, s, col, o = {}) {
  const body = `<circle cx="0" cy="-132" r="25"/><path d="M-36,-100 Q0,-114 36,-100 Q46,-60 46,0 L-46,0 Q-46,-60 -36,-100 Z"/>`;
  const arms = [];
  if (o.up != null) arms.push(`M28,-94 L${f1(52 + Math.sin(o.up) * 14)},${f1(-182 + Math.cos(o.up) * 6)}`);
  if (o.up2 != null) arms.push(`M-28,-94 L${f1(-52 + Math.sin(o.up2) * 14)},-180`);
  if (o.prop) arms.push('M30,-92 L52,-58');
  const ap = arms.map(d => `<path d="${d}"/>`).join('');
  let props = '';
  if (o.prop === 'phone') props = `<rect x="42" y="-94" width="24" height="38" rx="4" fill="${K}" stroke="${W}" stroke-width="5"/><rect x="46" y="-89" width="16" height="26" fill="${o.dark ? K : C}"/>`;
  if (o.prop === 'map') props = `<g transform="translate(26 -84) rotate(-12)"><rect width="74" height="50" fill="${Y}" stroke="${W}" stroke-width="5"/><path d="M8,34 L25,16 L42,28 L64,9" stroke="${R}" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M24,0 V50 M50,0 V50" stroke="${K}" stroke-opacity=".25" stroke-width="2"/></g>`;
  return `<g transform="translate(${f1(x)} ${f1(y)}) scale(${s})">` +
    `<g fill="${W}" stroke="${W}" stroke-width="14" stroke-linejoin="round" stroke-linecap="round">${body}<g stroke-width="34">${ap}</g></g>` +
    `<g fill="${col}">${body}</g><g stroke="${col}" stroke-width="17" stroke-linecap="round">${ap}</g>` +
    `<g fill="url(#dotsI)" opacity=".22">${body}</g>${props}</g>`;
}
function photo(x, y, w, h, rot, tex, b = 22) {
  return `<g transform="translate(${f1(x)} ${f1(y)}) rotate(${rot})"><rect x="${-w / 2 - b}" y="${-h / 2 - b}" width="${w + 2 * b}" height="${h + 2 * b}" fill="${W}"/>` +
    `<image href="${TEX[tex]}" x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" preserveAspectRatio="none"/>` +
    `<rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" fill="url(#dotsKf)" opacity=".3"/></g>`;
}
function tape(x, y, w, rot, col, seed) {
  return `<g transform="translate(${x} ${y}) rotate(${rot})">${poly(torn(-w / 2, -24, w, 48, seed, 4, 12), col, 'opacity=".88"')}</g>`;
}
function burst(cx, cy, seed, r0) {
  const r = rng(seed); let d = '';
  const n = 9;
  for (let i = 0; i <= n; i++) {
    const a = -Math.PI * 1.05 + (i / n) * Math.PI * 1.1, rr = r0 * (i % 2 ? 1.35 + r() * .3 : .95 + r() * .15);
    d += (i ? 'L' : 'M') + f1(cx + Math.cos(a) * rr) + ',' + f1(cy + Math.sin(a) * rr);
  }
  return `<path d="${d}" fill="none" stroke="${R}" stroke-width="6" stroke-linejoin="round" stroke-linecap="round"/>`;
}
function pen(x, y, rot, s = 1) {
  return `<g transform="translate(${f1(x)} ${f1(y)}) rotate(${rot}) scale(${s})"><g stroke="${W}" stroke-width="12" stroke-linejoin="round"><path d="M0,0 L-14,-36 L14,-36 Z" fill="${K}"/><rect x="-22" y="-210" width="44" height="176" rx="8" fill="${R}"/><rect x="-24" y="-270" width="48" height="70" rx="10" fill="${K}"/></g>` +
    `<path d="M0,0 L-14,-36 L14,-36 Z" fill="${K}"/><rect x="-22" y="-210" width="44" height="176" rx="8" fill="${R}"/><rect x="-24" y="-270" width="48" height="70" rx="10" fill="${K}"/><rect x="-22" y="-160" width="44" height="40" fill="url(#dotsI)" opacity=".5"/></g>`;
}

function makeCity(seed, x0, x1, ground, minH, maxH, cols, gap) {
  const r = rng(seed), b = []; let x = x0;
  while (x < x1) {
    const w = 110 + r() * 170; let h = minH + r() * (maxH - minH);
    if (gap && x + w > gap[0] && x < gap[1]) h = Math.min(h, gap[2]);
    b.push({ x, w, h, c: cols[Math.floor(r() * cols.length)], s: Math.floor(r() * 1e6), roof: r() });
    x += w * (0.8 + r() * 0.18);
  }
  b.ground = ground;
  return b;
}
function drawCity(b, winPat = 'win') {
  let s = '';
  for (const q of b) {
    const y = b.ground - q.h;
    if (q.roof > .82) s += `<line x1="${f1(q.x + q.w * .5)}" y1="${f1(y)}" x2="${f1(q.x + q.w * .5)}" y2="${f1(y - 70)}" stroke="${K}" stroke-width="6"/><circle cx="${f1(q.x + q.w * .5)}" cy="${f1(y - 74)}" r="9" fill="${R}"/>`;
    else if (q.roof > .68) s += `<circle cx="${f1(q.x + q.w / 2)}" cy="${f1(y + 4)}" r="${f1(q.w * .32)}" fill="${q.c === R ? Y : R}"/>`;
    s += poly(torn(q.x, y, q.w, q.h + 80, q.s, 5, 26), q.c);
    s += `<rect x="${f1(q.x + 18)}" y="${f1(y + 24)}" width="${f1(q.w - 36)}" height="${f1(q.h - 50)}" fill="url(#${q.c === I || q.c === Y ? 'winK' : winPat})" opacity=".6"/>`;
  }
  return s;
}

// ---------- BLOCK 1: the world on autopilot ----------
const CITY1 = makeCity(11, -300, 3150, 880, 260, 640, [Y, C, K, R, I, C]);
const FAR1 = makeCity(5, -900, 2400, 790, 230, 430, [C]);
function network(b, u, w = 5, flow = 90, opa = 1, soft = false) {
  const nodes = b.filter((_, i) => i % 2 === 0).map(q => [q.x + q.w / 2, b.ground - q.h - 16]);
  let s = '', pulses = '';
  for (let i = 0; i < nodes.length - 1; i++) {
    const a = nodes[i], c2 = nodes[i + 1], ctl = [(a[0] + c2[0]) / 2, Math.min(a[1], c2[1]) - 150];
    s += `<path d="M${f1(a[0])},${f1(a[1])} Q${f1(ctl[0])},${f1(ctl[1])} ${f1(c2[0])},${f1(c2[1])}" fill="none" stroke="${C}" stroke-width="${w}" stroke-dasharray="${soft ? '2 0' : '18 12'}" stroke-dashoffset="${f1(-u * flow)}" stroke-linecap="round" opacity="${opa}"/>`;
    const p = qpt(a, ctl, c2, ((u * .45 + i * .37) % 1));
    if (!soft) pulses += `<circle cx="${f1(p[0])}" cy="${f1(p[1])}" r="10" fill="${Y}" stroke="${W}" stroke-width="4"/>`;
  }
  for (const n of nodes) s += `<circle cx="${f1(n[0])}" cy="${f1(n[1])}" r="${soft ? 7 : 12}" fill="${C}" stroke="${W}" stroke-width="5" opacity="${opa}"/>`;
  return s + pulses;
}
function clock(x, y, r, minAng, hourAng) {
  let ticks = '';
  for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; ticks += `<line x1="${f1(x + Math.sin(a) * r * .78)}" y1="${f1(y - Math.cos(a) * r * .78)}" x2="${f1(x + Math.sin(a) * r * .9)}" y2="${f1(y - Math.cos(a) * r * .9)}" stroke="${K}" stroke-width="${i % 3 ? 3 : 7}"/>`; }
  const hand = (ang, len, w, col) => { const a = ang * Math.PI / 180; return `<line x1="${x}" y1="${y}" x2="${f1(x + Math.sin(a) * len)}" y2="${f1(y - Math.cos(a) * len)}" stroke="${col}" stroke-width="${w}" stroke-linecap="round"/>`; };
  return `<circle cx="${x}" cy="${y}" r="${r + 12}" fill="${W}"/><circle cx="${x}" cy="${y}" r="${r}" fill="${I}" stroke="${K}" stroke-width="7"/>${ticks}${hand(hourAng, r * .5, 9, K)}${hand(minAng, r * .78, 6, R)}<circle cx="${x}" cy="${y}" r="7" fill="${K}"/>`;
}
function car(x, y, col, s = 1) {
  return `<g transform="translate(${f1(x)} ${y}) scale(${s})"><path d="M-80,0 L-80,-34 Q-70,-44 -40,-46 L-24,-74 L40,-74 L58,-46 Q80,-42 82,-30 L82,0 Z" fill="${col}" stroke="${W}" stroke-width="6" stroke-linejoin="round"/><rect x="-18" y="-66" width="50" height="20" fill="${I}" opacity=".8"/><circle cx="-46" cy="2" r="17" fill="${K}" stroke="${W}" stroke-width="5"/><circle cx="50" cy="2" r="17" fill="${K}" stroke="${W}" stroke-width="5"/></g>`;
}
function B1(u) {
  const pan = ease(seg(u, 0, 8.3)), zin = seg(u, 8.2, 10);
  const ze = ease(zin);
  const c = { cx: lerp(lerp(960, 2960, pan), 3350, ze), cy: lerp(540, 330, ze), z: Math.exp(Math.log(7.5) * Math.pow(ze, 1.6)), rot: 0 };
  const fgO = 1 - seg(zin, 0, .35);
  const sky = `<rect x="-6000" y="-4000" width="16000" height="9000" fill="${I}"/>` +
    [0, 1, 2, 3, 4, 5, 6].map(i => `<circle cx="${f1(-200 + i * 380 + u * 14)}" cy="${120 + (i * 97) % 200}" r="${110 + (i * 53) % 90}" fill="url(#dotsY)"/>`).join('') +
    `<circle cx="1120" cy="360" r="270" fill="${R}"/><circle cx="1120" cy="360" r="270" fill="url(#dotsK)" mask="url(#mFade)"/>`;
  const far = `<g opacity=".9">${cached('far1', () => drawCity(FAR1, 'win'))}</g>`;
  const ct = (x, w, h) => `${poly(torn(x, 880 - h, w, h + 60, 999, 5, 26), K)}<rect x="${x + 20}" y="${880 - h + 260}" width="${w - 40}" height="${h - 290}" fill="url(#win)" opacity=".6"/>`;
  const minAng = u < 9.05 ? 354 : 354 + 6 * eBack(seg(u, 9.05, 9.25));
  let mid = cached('city1', () => drawCity(CITY1)) +
    // hospital
    `${poly(torn(1460, 470, 230, 470, 4242, 5, 26), W)}<rect x="1478" y="560" width="194" height="300" fill="url(#winK)" opacity=".5"/><path d="M1575,492 v70 M1540,527 h70" stroke="${R}" stroke-width="24"/>` +
    ct(3270, 160, 760) + clock(3350, 330, 92, minAng, lerp(269.5, 270, seg(u, 9.05, 9.25))) +
    network(CITY1, u) +
    mk('M1440,450 C1460,380 1700,370 1720,450 C1735,520 1600,545 1500,520', R, 8, eOut(seg(u, 2.2, 3.2))) +
    mk('M2380,170 q40,-40 80,0 q40,40 80,0 q40,-40 80,0', K, 7, eOut(seg(u, 4.3, 5))) +
    // road + cars
    poly(torn(-600, 875, 4600, 300, 77, 6, 30), K) +
    [...Array(28)].map((_, i) => `<rect x="${-560 + i * 160}" y="934" width="80" height="12" fill="${Y}"/>`).join('');
  for (let i = 0; i < 9; i++) {
    const v = i % 2 ? 150 : -130, x = (((i * 470 + u * v) % 4400) + 4400) % 4400 - 500;
    mid += car(x, i % 2 ? 1010 : 920, [R, Y, C, W][i % 4], .9);
  }
  let fg = '';
  for (let i = 0; i < 16; i++) fg += person(250 + i * 340 + u * 18 * (i % 2 ? 1 : -1), 1190 + Math.abs(Math.sin(u * 5 + i)) * -8, 1.7, [K, R, C, K, Y][i % 5], { prop: i % 2 ? 'phone' : null });
  return L(c, .35, sky) + L(c, .6, far) + L(c, 1, mid, 'filter="url(#shadow)"') + (fgO > 0 ? L(c, 1.35, fg, `filter="url(#shadow)" opacity="${fgO.toFixed(3)}"`) : '');
}

// ---------- BLOCK 2: silence ----------
const S2 = 3.2;
function camX2(u) {
  let x = 1520;
  for (let s = 1.0; s < u; s += 1 / 240) x += lerp(760, 45, ease(seg(s, S2 - .3, S2 + .6))) / 240;
  return x;
}
const CX88 = camX2(8.8), K88 = Math.round((CX88 - 600) / 460);
function screen(X, Y0, on, u, i) {
  const ang = on ? u * 520 + i * 40 : S2 * 520 + i * 40;
  return `<rect x="${X - 14}" y="${Y0 + 120}" width="28" height="80" fill="${K}"/><rect x="${X - 70}" y="${Y0 + 190}" width="140" height="18" fill="${K}"/>` +
    `<rect x="${X - 182}" y="${Y0 - 127}" width="364" height="254" fill="${W}"/><rect x="${X - 166}" y="${Y0 - 111}" width="332" height="222" fill="${on ? C : K}"/>` +
    `<rect x="${X - 166}" y="${Y0 - 111}" width="332" height="222" fill="url(#dotsI)" opacity="${on ? .25 : .08}"/>` +
    `<circle cx="${X}" cy="${Y0}" r="48" fill="${I}" stroke="${K}" stroke-width="7"/>` +
    `<circle cx="${X}" cy="${Y0}" r="30" fill="none" stroke="${on ? C : R}" stroke-width="11" stroke-dasharray="64 200" stroke-linecap="round" transform="rotate(${f1(ang)} ${X} ${Y0})"/>`;
}
function B2(u) {
  const on = u < S2, tt = u - S2;
  const zo = ease(seg(u, 0, 1.3)), zi = seg(u, 8.8, 10);
  const tgt = [600 + K88 * 460, 430];
  let cx = u < 8.8 ? camX2(u) : lerp(CX88, tgt[0], ease(seg(u, 8.8, 9.5)));
  let cy = u < 8.8 ? lerp(430, 540, zo) : lerp(540, 430, ease(seg(u, 8.8, 9.5)));
  let z = u < 1.3 ? Math.exp(Math.log(7) * (1 - zo)) : Math.exp(Math.log(10) * Math.pow(ease(zi), 1.5));
  if (tt > 0 && tt < .35) { const k = (1 - tt / .35) * 12; cx += Math.sin(F * 2.3) * k; cy += Math.cos(F * 3.1) * k; }
  const c = { cx, cy, z, rot: 0 };
  const bg = `<rect x="-6000" y="-4000" width="16000" height="9000" fill="${I}"/>` + cached('b2bg', () => poly(torn(-1200, 150, 4200, 520, 21, 9, 30), Y) + [0, 1, 2, 3, 4].map(i => `<circle cx="${-400 + i * 700}" cy="${260 + (i % 2) * 160}" r="${170 + i * 20}" fill="url(#dotsC)"/>`).join(''));
  let mid = '';
  for (let i = 0; i < 12; i++) mid += screen(600 + i * 460, 430, on, u, i);
  // cyan lines between screens: flow, then snap and fall
  for (let i = 0; i < 11; i++) {
    const a = [600 + i * 460, 303], b = [600 + (i + 1) * 460, 303], ctl = [a[0] + 230, 170];
    if (on) mid += `<path d="M${a[0]},${a[1]} Q${ctl[0]},${ctl[1]} ${b[0]},${b[1]}" fill="none" stroke="${C}" stroke-width="6" stroke-dasharray="18 12" stroke-dashoffset="${f1(-u * 120)}"/>`;
    else {
      const m = qpt(a, ctl, b, .5), q1 = qpt(a, ctl, b, .25), q2 = qpt(a, ctl, b, .75);
      const fall = 700 * tt * tt, op = 1 - seg(tt, 1.2, 2);
      if (op > 0) {
        mid += `<g transform="translate(0 ${f1(fall)}) rotate(${f1(-tt * 70)} ${a[0]} ${a[1]})" opacity="${op}"><path d="M${a[0]},${a[1]} Q${f1(q1[0])},${f1(q1[1] - 30)} ${f1(m[0])},${f1(m[1])}" fill="none" stroke="${C}" stroke-width="6"/></g>`;
        mid += `<g transform="translate(0 ${f1(fall * 1.2)}) rotate(${f1(tt * 80)} ${b[0]} ${b[1]})" opacity="${op}"><path d="M${f1(m[0])},${f1(m[1])} Q${f1(q2[0])},${f1(q2[1] - 30)} ${b[0]},${b[1]}" fill="none" stroke="${C}" stroke-width="6"/></g>`;
      }
      // ink curls left on the paper
      mid += mk(`M${a[0] + 120},${700} c20,-40 60,-40 50,0 c-10,30 -50,20 -30,-10`, K, 5, eOut(seg(tt, 1, 1.8)));
    }
  }
  // red marker slashes on dead screens
  for (let i = 3; i < 9; i += 2) mid += mk(`M${600 + i * 460 - 140},${330} L${600 + i * 460 + 140},${530}`, R, 9, eOut(seg(tt, 1.3 + i * .15, 1.9 + i * .15)));
  // road + cars that stop
  mid += cached('b2road', () => poly(torn(-1200, 760, 7400, 500, 33, 7, 30), K) + [...Array(46)].map((_, i) => `<rect x="${-1150 + i * 160}" y="900" width="80" height="12" fill="${Y}"/>`).join(''));
  const te = on ? u : S2 + .35 * (1 - Math.pow(1 - seg(u, S2, S2 + .7), 2));
  for (let i = 0; i < 10; i++) mid += car(300 + i * 560 + te * (i % 2 ? 220 : 160), i % 2 ? 1000 : 860, [R, Y, W, C][i % 4], 1.05);
  let fg = '';
  for (let i = 0; i < 9; i++) {
    const X = 200 + i * 720;
    const lit = on ? Math.floor(u * 1.3 + i) % 3 : -1;
    fg += `<rect x="${X - 10}" y="420" width="20" height="900" fill="${K}"/><rect x="${X - 44}" y="300" width="88" height="220" rx="12" fill="${K}" stroke="${W}" stroke-width="8"/>` +
      [R, Y, C].map((col, j) => `<circle cx="${X}" cy="${340 + j * 68}" r="24" fill="${lit === j ? col : '#3a3a3a'}" stroke="${lit === j ? W : 'none'}" stroke-width="4"/>`).join('');
    fg += person(X + 260, 1240, 1.7, [K, C, R][i % 3], { prop: 'phone', dark: !on });
  }
  let s = L(c, .5, bg) + L(c, 1, mid, 'filter="url(#shadow)"') + L(c, 1.25, fg, `filter="url(#shadow)" opacity="${(1 - seg(zi, 0, .3)).toFixed(3)}"`);
  // charcoal halftone shadow sweeping right to left
  if (!on) {
    const pos = 1980 - eOut(seg(u, S2 + .3, 8.8)) * 2500;
    s += `<g opacity="${(1 - seg(zi, .2, .6)).toFixed(3)}">${poly(torn(pos, -100, 3200, 1300, 55 + Math.floor(u * 6), 14, 34), 'url(#dotsK)', 'opacity=".55"')}${poly(torn(pos + 40, -100, 3200, 1300, 56, 10, 34), K, 'opacity=".2"')}</g>`;
    if (tt < .15) s += `<rect width="1920" height="1080" fill="${W}" opacity="${(.85 * (1 - tt / .15)).toFixed(3)}"/>`;
  }
  return s;
}

// ---------- BLOCK 3: chaos ----------
function B3(u) {
  const tau = u + .35 * Math.sin(u * 2.2);
  const j = (F % 2) ? 0 : 1, hr = rng(F * 7 + 3);
  const c = { cx: 1300 + 420 * Math.sin(tau * .85) + (hr() - .5) * 10 * j, cy: 540 + 30 * Math.sin(tau * 1.9) + (hr() - .5) * 10 * j, z: 1.08 + .05 * Math.sin(u * 1.7), rot: 1.6 * Math.sin(u * 2.6) };
  const boil = Math.floor(u * 8);
  document.getElementById('stripesRI').setAttribute('patternTransform', `translate(${(F % 4 < 2) ? 0 : 11} 0) rotate(-35)`);
  let bg = `<rect x="-3000" y="-2000" width="9000" height="6000" fill="url(#stripesRI)"/>`;
  for (let i = 0; i < 5; i++) bg += `<circle cx="${-300 + i * 620}" cy="${200 + (i % 2) * 560}" r="${f1(230 + 50 * Math.sin(u * 7 + i * 2))}" fill="url(#dotsK)" opacity=".9"/>`;
  let mid = cached('b3mid', () => {
    let s = poly(tornPoly([[-500, 640], [3100, 500], [3100, 720], [-500, 860]], 91, 8, 26), K);
    const ang = Math.atan2(-140, 3600) * 180 / Math.PI;
    for (let i = 0; i < 24; i++) { const x = -450 + i * 160, y = 750 - (x + 500) * 140 / 3600; s += `<rect x="${x}" y="${f1(y - 6)}" width="80" height="12" fill="${I}" transform="rotate(${f1(ang)} ${x} ${f1(y)})"/>`; }
    // shelves
    s += `<rect x="1720" y="70" width="900" height="470" fill="${Y}" stroke="${W}" stroke-width="12"/>`;
    const r = rng(8);
    for (let sh = 0; sh < 3; sh++) {
      s += `<rect x="1740" y="${210 + sh * 150}" width="860" height="14" fill="${K}"/>`;
      for (let k = 0; k < 8; k++) if (r() > .72) s += `<rect x="${1760 + k * 105}" y="${118 + sh * 150}" width="80" height="92" fill="${[R, C][k % 2]}" stroke="${W}" stroke-width="5"/>`;
    }
    s += photo(420, 300, 400, 270, -7, 'crowd') + photo(1240, 250, 320, 230, 6, 'crowd2') + tape(1220, 130, 160, -14, C, 5);
    return s;
  });
  for (let i = 0; i < 4; i++) {
    const x = 120 + i * 680, y = 735 - (x + 500) * 140 / 3600, rt = (rng(boil * 13 + i)() - .5) * 4;
    mid += `<g transform="translate(${x} ${f1(y)}) rotate(${f1(rt - 6)})"><path d="M90,0 L-110,-46 L-60,0 L-110,40 Z" fill="${W}" stroke="${K}" stroke-width="4" stroke-linejoin="round"/><path d="M90,0 L-60,0" stroke="${K}" stroke-width="3"/></g>`;
  }
  for (let k = 0; k < 4; k++) mid += mk(`M${1800 + k * 210},${180 + (k % 3) * 150} m-50,0 a50,44 0 1,0 100,0 a50,44 0 1,0 -100,0`, R, 7, eOut(seg(u, 1.5 + k * .7, 2.1 + k * .7)));
  let fg = '';
  for (let i = 0; i < 13; i++) {
    const x = -150 + i * 300, y = 1170 + Math.sin(u * 9 + i) * 7, s = 1.55;
    fg += person(x, y, s, [K, R, C, K, Y, K][i % 6], i % 3 === 0 ? { up: u * 9 + i, up2: u * 8 + i } : (i % 3 === 1 ? { prop: 'phone', dark: true } : {}));
    if (i % 2 === 0 || boil % 3 === i % 3) fg += burst(x, y - 132 * s, boil * 31 + i, 62);
  }
  let s = L(c, .5, bg) + L(c, .85, mid, 'filter="url(#shadow)"') + L(c, 1.25, fg, 'filter="url(#shadow)"');
  if (u < .8) s += `<path d="M-50,-50 H1970 V1130 H-50 Z M960,540 m${-f1(1300 * eOut(seg(u, 0, .8)))},0 a${f1(1300 * eOut(seg(u, 0, .8)))},${f1(1300 * eOut(seg(u, 0, .8)))} 0 1,0 ${f1(2600 * eOut(seg(u, 0, .8)))},0 a${f1(1300 * eOut(seg(u, 0, .8)))},${f1(1300 * eOut(seg(u, 0, .8)))} 0 1,0 ${-f1(2600 * eOut(seg(u, 0, .8)))},0" fill="${K}" fill-rule="evenodd"/>`;
  if (u > 8.9) {
    const p = eIn(seg(u, 8.9, 10)), sc = lerp(.03, 1.12, p);
    s += `<g transform="translate(960 540) rotate(${f1(lerp(-50, 0, p))}) scale(${sc.toFixed(4)})" filter="url(#shadow)">${cached('fly', () => poly(torn(-1250, -780, 2500, 1500, 303, 12, 34), I) + mapContent(-1250, -780))}</g>`;
  }
  return s;
}

// ---------- BLOCK 4: rediscovery (the map) ----------
function mapContent(ox, oy) {
  const r = rng(404); let s = `<g transform="translate(${ox + 50} ${oy + 50})">`;
  for (let i = 0; i < 11; i++) s += poly(torn(r() * 2200, r() * 1250, 220 + r() * 380, 140 + r() * 260, i + 50, 9, 26), Y, 'opacity=".75"');
  for (let i = 0; i < 9; i++) s += `<circle cx="${f1(r() * 2400)}" cy="${f1(r() * 1400)}" r="${f1(55 + r() * 70)}" fill="url(#dotsC)"/>`;
  s += `<path d="M-50,330 C400,250 600,620 1000,560 S1600,900 1900,1050 S2300,1300 2450,1250" fill="none" stroke="${W}" stroke-width="66"/><path d="M-50,330 C400,250 600,620 1000,560 S1600,900 1900,1050 S2300,1300 2450,1250" fill="none" stroke="${C}" stroke-width="44"/>`;
  for (let i = 0; i < 12; i++) { const a = [r() * 2400, r() * 1400], b = [r() * 2400, r() * 1400]; s += `<path d="M${f1(a[0])},${f1(a[1])} Q${f1((a[0] + b[0]) / 2 + (r() - .5) * 400)},${f1((a[1] + b[1]) / 2 + (r() - .5) * 400)} ${f1(b[0])},${f1(b[1])}" fill="none" stroke="${K}" stroke-width="${i % 3 ? 4 : 9}" opacity=".75" ${i % 3 ? 'stroke-dasharray="14 9"' : ''}/>`; }
  s += `<path d="M783,0 V1400 M1617,0 V1400 M0,700 H2400" stroke="${K}" stroke-width="4" opacity=".14"/>`;
  return s + '</g>';
}
const ROUTE = (() => {
  const base = [[380, 1060], [560, 900], [820, 960], [1000, 770], [1260, 830], [1420, 640], [1700, 720], [1920, 560], [2140, 640], [2320, 720], [3500, 700]];
  const r = rng(77), pts = [base[0]];
  for (let i = 1; i < base.length; i++) { const a = base[i - 1], b = base[i], n = 6; for (let k = 1; k <= n; k++) { const t = k / n; pts.push([lerp(a[0], b[0], t) + (k < n ? (r() - .5) * 18 : 0), lerp(a[1], b[1], t) + (k < n ? (r() - .5) * 18 : 0)]); } }
  const cum = [0]; for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const lastIn = cum[pts.length - 7];
  return { pts, cum, total: cum[cum.length - 1], lastIn, d: 'M' + pts.map(p => f1(p[0]) + ',' + f1(p[1])).join(' L') };
})();
function routeAt(len) {
  const { pts, cum } = ROUTE; let i = 1; while (i < cum.length - 1 && cum[i] < len) i++;
  const t = clamp((len - cum[i - 1]) / ((cum[i] - cum[i - 1]) || 1));
  return [lerp(pts[i - 1][0], pts[i][0], t), lerp(pts[i - 1][1], pts[i][1], t)];
}
function B4(u) {
  const len = u < 8.6 ? ROUTE.lastIn * ease(seg(u, 1.0, 8.6)) : lerp(ROUTE.lastIn, ROUTE.total, eIn(seg(u, 8.6, 10)));
  const tip = routeAt(len);
  const pz = ease(seg(u, 1.2, 8.6));
  let z = u < 1.2 ? lerp(1.08, .8, ease(seg(u, 0, 1.2))) : lerp(.8, 1.9, pz);
  let cx = lerp(1200, tip[0], u < 1.2 ? 0 : pz), cy = lerp(700, tip[1], u < 1.2 ? 0 : pz);
  if (u > 8.6) { cx = tip[0]; cy = tip[1]; }
  const c = { cx, cy, z, rot: 0 };
  let w = cached('b4static', () => {
    let s = `<rect x="-4000" y="-3000" width="12000" height="9000" fill="${K}"/><rect x="-4000" y="-3000" width="12000" height="9000" fill="url(#dotsI)" opacity=".07"/>`;
    s += `<g filter="url(#shadow)">${poly(torn(-50, -50, 2500, 1500, 303, 12, 34), I)}</g>` + mapContent(-50, -50);
    // books
    s += `<g filter="url(#shadow)" transform="translate(330 330) rotate(-8)">` + [[R, 0], [C, -60], [Y, -120]].map(([col, y], k) => `<rect x="${-150 + k * 14}" y="${y}" width="${300 - k * 20}" height="56" fill="${col}" stroke="${W}" stroke-width="8"/><rect x="${-140 + k * 14}" y="${y + 8}" width="${40}" height="40" fill="url(#dotsI)" opacity=".5"/>`).join('') + '</g>';
    // notebook with ink diagrams (no writing)
    s += `<g filter="url(#shadow)" transform="translate(1180 1150) rotate(5)"><rect x="-210" y="-140" width="420" height="280" fill="${W}"/><path d="M0,-140 V140" stroke="${K}" stroke-width="3" opacity=".3"/>` +
      [...Array(5)].map((_, k) => `<path d="M20,${-100 + k * 44} q30,-10 60,0 t60,0 t60,0" fill="none" stroke="${K}" stroke-width="4" opacity=".7"/>`).join('') +
      `<circle cx="-105" cy="-30" r="55" fill="none" stroke="${R}" stroke-width="6"/><path d="M-160,60 L-50,60 M-70,45 L-50,60 L-70,75" fill="none" stroke="${K}" stroke-width="5"/></g>`;
    // stethoscope
    s += `<g filter="url(#shadow)" transform="translate(2150 1120)"><path d="M-120,-90 C-140,40 -40,90 0,40 C40,-10 60,60 120,80" fill="none" stroke="${W}" stroke-width="26" stroke-linecap="round"/><path d="M-120,-90 C-140,40 -40,90 0,40 C40,-10 60,60 120,80" fill="none" stroke="${K}" stroke-width="14" stroke-linecap="round"/><path d="M-150,-120 L-120,-90 L-90,-120" fill="none" stroke="${K}" stroke-width="12" stroke-linecap="round"/><circle cx="135" cy="85" r="40" fill="${C}" stroke="${W}" stroke-width="10"/><circle cx="135" cy="85" r="20" fill="url(#dotsK)"/></g>`;
    // neighbors over a fence
    s += `<g filter="url(#shadow)">${person(1820, 380, .95, C, { up: .4 })}${person(2160, 380, .95, R, { up2: .2 })}` + [...Array(13)].map((_, k) => `<path d="M${1700 + k * 44},380 v-80 l18,-20 l18,20 v80 Z" fill="${W}" stroke="${K}" stroke-width="3"/>`).join('') + `<rect x="1690" y="320" width="590" height="14" fill="${K}"/></g>`;
    s += photo(700, 420, 300, 210, -9, 'land') + tape(700, 300, 150, 6, C, 9);
    return s;
  });
  w += mk(ROUTE.d, R, 11, len / ROUTE.total);
  w += mk('M1690,250 C1700,180 2300,170 2310,260 C2320,330 1720,345 1680,260', K, 6, eOut(seg(u, 3.5, 4.4)));
  w += mk('M2260,960 l12,-34 l12,34 l-30,-22 h36 Z', Y, 7, eOut(seg(u, 5.2, 5.8)));
  w += pen(tip[0], tip[1], 28 + Math.sin(u * 7) * 4, 1);
  let s = L(c, 1, w);
  s += `<rect width="1920" height="1080" fill="url(#warm)" opacity="${(.45 * seg(u, 2, 9)).toFixed(3)}" style="mix-blend-mode:multiply"/>`;
  if (u > 9.55) s += wipe(seg(u, 9.55, 10) * .5);
  return s;
}
function wipe(p) { // p 0..1 strip travels right -> left across frame
  const x = lerp(2000, -3600, p);
  return `<g transform="translate(${f1(x)} -100) rotate(4)" filter="url(#shadow)">${cached('wipe', () => poly(torn(0, 0, 3400, 1400, 808, 16, 34), Y) + `<rect x="200" y="100" width="3000" height="1200" fill="url(#dotsR)" opacity=".5"/>`)}</g>`;
}

// ---------- BLOCK 5: human connection ----------
const ROOF5 = makeCity(55, -700, 2700, 760, 140, 330, [K, C, R, C]);
function B5(u) {
  const th = Math.sin((u / 10 - .5) * Math.PI);
  const lay = (d, content, extra = '') => `<g transform="translate(${f1(960 - th * d * 520)} ${f1(540 + d * 12 * th * th)}) scale(${(1 + .05 * d * (1 - th * th)).toFixed(4)}) translate(-960 -540)" ${extra}>${content}</g>`;
  const k = ease(u / 10), sx = lerp(1500, 960, k), sy = lerp(330, 540, k);
  let s = `<rect width="1920" height="1080" fill="${I}"/><rect width="1920" height="1080" fill="url(#dusk)"/>`;
  s += lay(.1, [0, 1, 2, 3, 4].map(i => `<circle cx="${-100 + i * 520 + u * 10}" cy="${120 + (i % 2) * 120}" r="${120 + i * 15}" fill="url(#dotsY)"/>`).join(''));
  s += `<circle cx="${f1(sx)}" cy="${f1(sy)}" r="220" fill="${R}"/><circle cx="${f1(sx)}" cy="${f1(sy)}" r="220" fill="url(#dotsK)" mask="url(#mFade)"/>`;
  s += lay(.35, cached('roof5', () => drawCity(ROOF5, 'winY')), 'filter="url(#shadow)"');
  let lights = '';
  for (let sI = 0; sI < 3; sI++) {
    const a = [-500 + sI * 300, 170 + sI * 60], b = [2400 - sI * 200, 140 + sI * 70], ctl = [(a[0] + b[0]) / 2, 420 + sI * 50];
    lights += `<path d="M${a[0]},${a[1]} Q${ctl[0]},${ctl[1]} ${b[0]},${b[1]}" fill="none" stroke="${K}" stroke-width="4"/>`;
    for (let i = 1; i < 18; i++) { const p = qpt(a, ctl, b, i / 18), fl = .7 + .3 * Math.sin(u * 13 + i * 1.7 + sI); lights += `<circle cx="${f1(p[0])}" cy="${f1(p[1] + 18)}" r="15" fill="${Y}" stroke="${W}" stroke-width="5" opacity="${fl.toFixed(2)}"/>`; }
  }
  s += lay(.6, lights);
  // chalkboard, radio
  let mid = `<rect x="250" y="380" width="580" height="350" fill="${Y}" stroke="${W}" stroke-width="10"/><rect x="275" y="405" width="530" height="300" fill="${K}"/>`;
  const ch = [['M330,560 a60,60 0 1,0 120,0 a60,60 0 1,0 -120,0', .4], ['M500,620 L560,500 L620,620 Z', 1.5], ['M660,470 q25,-40 50,0 t50,0', 2.6], ['M340,670 L460,670 M440,655 L460,670 L440,685', 3.6], ['M690,600 l16,-40 l16,40 l-40,-26 h48 Z', 4.6], ['M560,450 m0,0 a10,10 0 1,1 20,0 a20,20 0 1,1 -40,0 a30,30 0 1,1 60,0', 5.6]];
  for (const [d, t0] of ch) mid += mk(d, I, 6, eOut(seg(u, t0, t0 + .9)));
  mid += `<g transform="translate(1150 560)"><path d="M210,0 L300,-140" stroke="${K}" stroke-width="7"/><circle cx="300" cy="-140" r="9" fill="${R}"/><path d="M60,0 Q140,-60 220,0" fill="none" stroke="${K}" stroke-width="10"/><rect x="0" y="0" width="300" height="180" rx="22" fill="${R}" stroke="${W}" stroke-width="10"/><rect x="24" y="30" width="140" height="120" fill="url(#dotsK)"/><circle cx="230" cy="80" r="44" fill="${C}" stroke="${W}" stroke-width="7"/><line x1="230" y1="80" x2="${f1(230 + Math.cos(u * 2) * 32)}" y2="${f1(80 + Math.sin(u * 2) * 32)}" stroke="${K}" stroke-width="5"/><circle cx="230" cy="150" r="12" fill="${K}"/></g>`;
  for (let i = 0; i < 4; i++) { const ph = (u * .7 + i / 4) % 1; mid += `<circle cx="1300" cy="650" r="${f1(120 + ph * 520)}" fill="none" stroke="${C}" stroke-width="${f1(9 - ph * 6)}" opacity="${(1 - ph).toFixed(2)}"/>`; }
  mid += mk('M1100,520 C1100,420 1520,420 1520,520 C1520,770 1100,770 1100,560', Y, 7, eOut(seg(u, 3, 4)));
  s += lay(.85, mid, 'filter="url(#shadow)"');
  let tab = '';
  [[300, C], [520, R], [760, Y], [1000, K], [1240, C], [1480, R], [1680, Y]].forEach(([x, col], i) => tab += person(x, 880 + Math.sin(u * 3 + i) * 3, 1.05, col, i % 3 === 0 ? { up: u * 4 + i } : {}));
  tab += `<rect x="150" y="840" width="1660" height="34" fill="${K}" stroke="${W}" stroke-width="6"/><rect x="200" y="874" width="22" height="200" fill="${K}"/><rect x="1740" y="874" width="22" height="200" fill="${K}"/>`;
  for (let i = 0; i < 8; i++) { const x = 250 + i * 200; tab += `<rect x="${x}" y="800" width="38" height="42" fill="${W}" stroke="${K}" stroke-width="4"/><path d="M${x + 19},${f1(780 - (u * 30 + i * 10) % 30)} q-12,-20 0,-40 t0,-40" fill="none" stroke="${K}" stroke-width="4" opacity=".55"/>`; }
  tab += mk('M940,700 c-30,-40 -90,-10 -60,40 l60,60 l60,-60 c30,-50 -30,-80 -60,-40', R, 7, eOut(seg(u, 2.5, 3.4)));
  s += lay(1, tab, 'filter="url(#shadow)"');
  let kids = '';
  for (let i = 0; i < 6; i++) kids += person(80 + i * 360, 1150 + Math.abs(Math.sin(u * 4 + i)) * -14, 1.2, [Y, R, C, K, R, C][i], { up: u * 6 + i, up2: i % 2 ? u * 5 : null });
  s += lay(1.4, kids, 'filter="url(#shadow)"');
  s += `<rect width="1920" height="1080" fill="url(#warm)" opacity=".25" style="mix-blend-mode:multiply"/>`;
  if (u < .5) s += wipe(.5 + seg(u, 0, .5) * .5);
  return s;
}

// ---------- BLOCK 6: day seven, the return ----------
const CITY6 = makeCity(77, 100, 3100, 1360, 320, 700, [Y, C, K, R, I, C], [1250, 1950, 210]);
function B6(u) {
  const zp = ease(seg(u, 0, 8.2));
  const sunY = lerp(820, 600, ease(seg(u, 0, 8)));
  const c = { cx: 1600, cy: lerp(sunY, 900, zp), z: Math.exp(lerp(Math.log(1.8), Math.log(.52), zp)), rot: 0 };
  let w = cached('b6desk', () => {
    let s = `<rect x="-6000" y="-5000" width="15000" height="12000" fill="${K}"/><rect x="-6000" y="-5000" width="15000" height="12000" fill="url(#dotsI)" opacity=".06"/>`;
    s += photo(-120, 1560, 420, 300, -11, 'crowd') + photo(3320, 260, 380, 270, 9, 'land') + `<circle cx="3330" cy="1690" r="110" fill="${Y}" stroke="${W}" stroke-width="12"/><circle cx="3330" cy="1690" r="110" fill="url(#dotsR)" opacity=".6"/>` + poly(torn(-420, 180, 360, 420, 12, 10, 26), C) + `<g filter="url(#shadow)">${pen(3460, 1100, -150, 1.5)}</g>`;
    s += `<g filter="url(#shadow)">${poly(torn(0, 0, 3200, 1800, 616, 14, 36), I)}</g>`;
    s += [0, 1, 2, 3, 4, 5].map(i => `<circle cx="${200 + i * 560}" cy="${180 + (i % 2) * 140}" r="${130 + i * 12}" fill="url(#dotsY)"/>`).join('');
    return s;
  });
  w += `<circle cx="1600" cy="${f1(sunY)}" r="270" fill="${R}"/><circle cx="1600" cy="${f1(sunY)}" r="270" fill="url(#dotsK)" mask="url(#mFade)"/><circle cx="1600" cy="${f1(sunY)}" r="330" fill="none" stroke="${Y}" stroke-width="10" stroke-dasharray="4 26" stroke-linecap="round" opacity="${seg(u, 1, 3).toFixed(2)}"/>`;
  w += `<g filter="url(#shadow)">${cached('city6', () => drawCity(CITY6) + poly(torn(20, 1355, 3160, 150, 61, 6, 30), K) + [...Array(19)].map((_, i) => `<rect x="${60 + i * 165}" y="1424" width="80" height="12" fill="${Y}"/>`).join(''))}</g>`;
  // soft reconnecting lines weaving between people
  const wave = (i) => { let d = ''; for (let x = 60; x <= 3140; x += 40) d += (x === 60 ? 'M' : 'L') + x + ',' + f1(1080 + i * 120 + 50 * Math.sin(x / 240 + u * .9 + i * 1.3)); return d; };
  const lineP = i => eOut(seg(u, .6 + i * .35, 3.2 + i * .35));
  let back = '', front = '';
  for (let i = 0; i < 6; i++) { const m = mk(wave(i), C, 5, lineP(i), 'opacity=".85"'); if (i % 2) front += m; else back += m; }
  w += back;
  let ppl = '';
  for (let i = 0; i < 9; i++) ppl += person(230 + i * 345, 1760 + Math.sin(u * 2 + i) * 3, 1.6, [K, R, C, Y, K, C, R, K, Y][i], { prop: i % 2 ? 'map' : 'phone' });
  w += `<g filter="url(#shadow)">${ppl}</g>` + front;
  // human doodles layered over the city
  const B = CITY6, top = q => [q.x + q.w / 2, B.ground - q.h];
  const dood = [];
  [2, 5, 13, 17].forEach((bi, k) => { const [x, y] = top(B[bi % B.length]); dood.push([`M${f1(x - 90)},${f1(y + 40)} C${f1(x - 100)},${f1(y - 70)} ${f1(x + 110)},${f1(y - 70)} ${f1(x + 95)},${f1(y + 30)} C${f1(x + 80)},${f1(y + 90)} ${f1(x - 60)},${f1(y + 80)} ${f1(x - 70)},${f1(y + 10)}`, R, 2 + k * 1.1]); });
  [[500, 520], [2700, 480], [2200, 260], [900, 300]].forEach(([x, y], k) => dood.push([`M${x},${y} l14,-40 l14,40 l-44,-26 h60 Z`, Y, 2.6 + k * 1.2]));
  [[1180, 1220], [2050, 1230]].forEach(([x, y], k) => dood.push([`M${x},${y} c-30,-40 -90,-10 -60,40 l60,60 l60,-60 c30,-50 -30,-80 -60,-40`, R, 3.3 + k * 1.5]));
  [[700, 1580], [2480, 1570]].forEach(([x, y], k) => dood.push([`M${x},${y} C${x + 150},${y - 250} ${x + 400},${y - 300} ${x + 560},${y - 420} M${x + 520},${y - 380} L${x + 560},${y - 420} L${x + 500},${y - 425}`, K, 4 + k * 1.3]));
  dood.push([`M1250,250 q20,-20 40,0 q20,-20 40,0 M1900,210 q20,-20 40,0 q20,-20 40,0 M1700,140 q16,-16 32,0 q16,-16 32,0`, K, 5.2]);
  dood.push([`M220,1530 C700,1500 1500,1560 2950,1520`, C, 6.0]);
  dood.push([`M2880,780 a26,26 0 1,1 -2,-1 m-50,0 a70,70 0 1,1 -4,-3`, C, 6.6]);
  for (const [d, col, t0] of dood) w += mk(d, col, 10, eOut(seg(u, t0, t0 + .8)));
  w += tape(30, 40, 240, -32, I, 71) + tape(3170, 40, 240, 32, I, 72) + tape(40, 1760, 240, 30, I, 73) + tape(3160, 1760, 240, -30, I, 74);
  let s = L(c, 1, w);
  if (u > 9.3) s += `<rect width="1920" height="1080" fill="${I}" opacity="${seg(u, 9.3, 9.95).toFixed(3)}"/>`;
  return s;
}

// ---------- textures + frame entry ----------
function makeTex(name, seed, w, h, kind) {
  const r = rng(seed), cv = document.createElement('canvas'); cv.width = w; cv.height = h;
  const g = cv.getContext('2d');
  const sm = document.createElement('canvas'); sm.width = 16; sm.height = 12; const sg = sm.getContext('2d');
  for (let y = 0; y < 12; y++) for (let x = 0; x < 16; x++) { const v = 120 + r() * 110; sg.fillStyle = `rgb(${v},${v * .97},${v * .92})`; sg.fillRect(x, y, 1, 1); }
  g.imageSmoothingEnabled = true; g.drawImage(sm, 0, 0, w, h);
  g.filter = 'blur(7px)';
  if (kind === 'crowd') {
    for (let row = 0; row < 3; row++) for (let i = 0; i < 12; i++) {
      const x = (i + .5 * (row % 2)) * w / 10 + (r() - .5) * 20, y = h * (.45 + row * .2), sc = .7 + row * .25, v = 40 + r() * 40;
      g.fillStyle = `rgb(${v},${v},${v})`; g.beginPath(); g.arc(x, y - 30 * sc, 15 * sc, 0, 7); g.fill();
      g.beginPath(); g.ellipse(x, y + 20 * sc, 30 * sc, 36 * sc, 0, 0, 7); g.fill();
    }
  } else {
    g.fillStyle = 'rgba(40,40,40,.55)'; g.beginPath(); g.moveTo(0, h * .62);
    for (let x = 0; x <= w; x += 20) g.lineTo(x, h * .6 - Math.sin(x / 40) * 18 - r() * 30);
    g.lineTo(w, h); g.lineTo(0, h); g.fill();
  }
  g.filter = 'none';
  const id = g.getImageData(0, 0, w, h);
  for (let i = 0; i < id.data.length; i += 4) { const n = (r() - .5) * 40; id.data[i] += n; id.data[i + 1] += n; id.data[i + 2] += n; }
  g.putImageData(id, 0, 0);
  TEX[name] = cv.toDataURL('image/jpeg', .9);
}
function init() {
  makeTex('crowd', 1, 420, 300, 'crowd'); makeTex('crowd2', 2, 340, 240, 'crowd'); makeTex('land', 3, 380, 270, 'land');
  const cv = document.createElement('canvas'); cv.width = 2100; cv.height = 1260; const g = cv.getContext('2d');
  const id = g.createImageData(2100, 1260), r = rng(99);
  for (let i = 0; i < id.data.length; i += 4) { const v = 150 + r() * 105; id.data[i] = v; id.data[i + 1] = v * .96; id.data[i + 2] = v * .9; id.data[i + 3] = 40 + r() * 40; }
  g.putImageData(id, 0, 0);
  g.globalAlpha = .12; g.strokeStyle = '#6b5a45';
  for (let i = 0; i < 900; i++) { const x = r() * 2100, y = r() * 1260; g.lineWidth = .6 + r(); g.beginPath(); g.moveTo(x, y); g.lineTo(x + 20 + r() * 60, y + (r() - .5) * 6); g.stroke(); }
  document.getElementById('grain').setAttribute('href', cv.toDataURL('image/png'));
}
let BLOCKS = [B1, B2, B3, B4, B5, B6];
function render(t) {
  F = Math.round(t * FPS);
  const b = Math.min(5, Math.floor(t / 10)), u = t - b * 10;
  let s = BLOCKS[b](u);
  if (window.TRANS) s += TRANS(b, u);
  else if (b === 4 && u > 9.65) s += `<g opacity="${seg(u, 9.65, 10).toFixed(3)}">${B6(u - 10)}</g>`;
  document.getElementById('scene').innerHTML = s;
  const gr = rng(Math.floor(F / 2) + 1);
  document.getElementById('grain').setAttribute('x', f1(-gr() * 170));
  document.getElementById('grain').setAttribute('y', f1(-gr() * 170));
}
