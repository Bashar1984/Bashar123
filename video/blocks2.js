// "What If AI Suddenly Stopped Working?" — six 10 s blocks, 16:9 editorial collage.
// Loaded after scene.js (reuses its helpers, camera layers and render loop).

// ---------- extra helpers ----------
const popS = p => p <= 0 ? 0 : eBack(clamp(p));
function popG(x, y, p, content) {
  if (p <= 0) return '';
  const s = popS(p);
  return `<g transform="translate(${f1(x)} ${f1(y)}) scale(${s.toFixed(3)}) translate(${f1(-x)} ${f1(-y)})">${content}</g>`;
}
function unfold(x, yb, p, content) { // grows up from a base line, like paper popping up
  if (p <= 0) return '';
  const s = popS(p);
  return `<g transform="translate(${f1(x)} ${f1(yb)}) scale(1 ${s.toFixed(3)}) translate(${f1(-x)} ${f1(-yb)})">${content}</g>`;
}
function plen(P) { const c = [0]; for (let i = 1; i < P.length; i++) c.push(c[i - 1] + Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1])); return c; }
function pat(P, c, d) { d = clamp(d, 0, c[c.length - 1]); let i = 1; while (i < c.length - 1 && c[i] < d) i++; const t = (d - c[i - 1]) / ((c[i] - c[i - 1]) || 1); return [lerp(P[i - 1][0], P[i][0], t), lerp(P[i - 1][1], P[i][1], t)]; }
const pd = P => 'M' + P.map(p => f1(p[0]) + ',' + f1(p[1])).join(' L');
const bump = (u, c, w) => Math.exp(-Math.pow((u - c) / w, 2));
function warp(u, a, b, bumps) { // normalized distance travelled with speed bumps (speed ramps)
  const v = s => 1 + bumps.reduce((acc, [c, w, k]) => acc + k * bump(s, c, w), 0);
  let tot = 0, cur = 0;
  for (let s = a; s < b; s += .01) { const dv = v(s) * .01; tot += dv; if (s < u) cur += dv; }
  return clamp(cur / tot);
}
const shake = (u, t0, amt, dur = .35) => { const k = u > t0 && u < t0 + dur ? (1 - (u - t0) / dur) * amt : 0; return [Math.sin(F * 2.3) * k, Math.cos(F * 3.1) * k]; };
const ring = (x, y, p, col, w) => p > 0 && p < 1 ? `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(40 + p * 900)}" fill="none" stroke="${col}" stroke-width="${f1(w * (1 - p) + 2)}" opacity="${(1 - p).toFixed(3)}"/>` : '';

// ---------- collage props ----------
function phone(x, y, s, on, u = 0) {
  let scr = `<rect x="-62" y="-118" width="124" height="220" rx="6" fill="${on ? C : '#151515'}"/>`;
  if (on) scr += `<rect x="-50" y="-104" width="80" height="30" rx="12" fill="${W}"/><rect x="-30" y="-64" width="80" height="30" rx="12" fill="${Y}"/>` +
    [0, 1, 2].map(i => `<rect x="${-50 + i * 36}" y="-20" width="28" height="28" rx="6" fill="${[R, I, Y][i]}"/>`).join('') +
    `<rect x="-50" y="22" width="100" height="10" rx="5" fill="${I}" opacity=".7"/><rect x="-50" y="${f1(40)}" width="${f1(40 + 60 * ((u * .7) % 1))}" height="10" rx="5" fill="${R}"/>` +
    `<rect x="-62" y="-118" width="124" height="220" fill="url(#dotsI)" opacity=".15"/>`;
  else scr += `<path d="M-40,-100 L30,60" stroke="#2a2a2a" stroke-width="6"/>`;
  return `<g transform="translate(${f1(x)} ${f1(y)}) scale(${s})"><rect x="-76" y="-140" width="152" height="280" rx="22" fill="${K}" stroke="${W}" stroke-width="10"/>${scr}<circle cx="0" cy="122" r="7" fill="#555"/></g>`;
}
function server(x, y, s, on, u, seed = 0) {
  let g = `<rect x="-90" y="-170" width="180" height="340" rx="10" fill="${K}" stroke="${W}" stroke-width="10"/>`;
  for (let i = 0; i < 7; i++) {
    const yy = -150 + i * 46;
    g += `<rect x="-72" y="${yy}" width="144" height="34" rx="4" fill="#2e2e2e"/><rect x="-64" y="${yy + 12}" width="70" height="10" fill="${C}" opacity="${on ? .9 : .25}"/>`;
    for (let k = 0; k < 3; k++) { const lit = on && Math.sin(u * 11 + i * 1.7 + k * 2.3 + seed) > 0; g += `<circle cx="${30 + k * 16}" cy="${yy + 17}" r="5" fill="${lit ? (k === 2 ? R : Y) : '#444'}"/>`; }
  }
  return `<g transform="translate(${f1(x)} ${f1(y)}) scale(${s})">${g}</g>`;
}
function chip(x, y, s, on = true) {
  let pins = '';
  for (let i = 0; i < 5; i++) { const o = -48 + i * 24; pins += `<path d="M${o},-70 v-26 M${o},70 v26 M-70,${o} h-26 M70,${o} h26"/>`; }
  return `<g transform="translate(${f1(x)} ${f1(y)}) scale(${s})"><g stroke="${W}" stroke-width="18" stroke-linecap="round">${pins}</g><g stroke="${on ? I : '#666'}" stroke-width="9" stroke-linecap="round">${pins}</g>` +
    `<rect x="-74" y="-74" width="148" height="148" rx="12" fill="${K}" stroke="${W}" stroke-width="9"/><rect x="-34" y="-34" width="68" height="68" fill="${on ? C : '#444'}"/><rect x="-34" y="-34" width="68" height="68" fill="url(#dotsK)" opacity=".5"/><path d="M-55,-55 h20 v20 M55,55 h-20 v-20" stroke="${on ? Y : '#555'}" stroke-width="5" fill="none"/></g>`;
}
function robot(x, y, s, a1, a2, on = true) {
  const c1 = on ? Y : '#555', c2 = on ? R : '#444';
  return `<g transform="translate(${f1(x)} ${f1(y)}) scale(${s})"><g stroke="${W}" stroke-width="8"><path d="M-80,0 L-56,-44 L56,-44 L80,0 Z" fill="${K}"/>` +
    `<g transform="translate(0 -44) rotate(${f1(a1)})"><rect x="-22" y="-210" width="44" height="210" rx="16" fill="${c1}"/><circle r="28" fill="${K}"/>` +
    `<g transform="translate(0 -210) rotate(${f1(a2)})"><rect x="-18" y="-170" width="36" height="170" rx="13" fill="${c2}"/><circle r="24" fill="${K}"/><path d="M-30,-170 V-212 M30,-170 V-212 M-34,-170 H34" stroke="${K}" stroke-width="13" fill="none"/></g></g></g></g>`;
}
function powerSwitch(x, y, s, flip) { // flip 0 = on (lever up), 1 = off (lever down)
  const k = Math.cos(flip * Math.PI);
  const lit = flip < .5;
  return `<g transform="translate(${f1(x)} ${f1(y)}) scale(${s})"><rect x="-175" y="-230" width="350" height="460" rx="38" fill="${K}" stroke="${W}" stroke-width="16"/>` +
    `<rect x="-150" y="-205" width="300" height="410" rx="26" fill="url(#dotsI)" opacity=".09"/><rect x="-66" y="-160" width="132" height="320" rx="30" fill="#111" stroke="#3a3a3a" stroke-width="6"/>` +
    `<g transform="scale(1 ${k.toFixed(3)})"><rect x="-48" y="-178" width="96" height="178" rx="34" fill="${R}" stroke="${W}" stroke-width="11"/><rect x="-32" y="-160" width="64" height="44" rx="10" fill="url(#dotsI)" opacity=".4"/></g>` +
    `<circle cx="0" cy="0" r="20" fill="${K}" stroke="${W}" stroke-width="6"/>` +
    `<g transform="translate(0 -300)" fill="none" stroke="${lit ? Y : '#555'}" stroke-width="12" stroke-linecap="round"><path d="M-30,-22 A40,40 0 1,0 30,-22"/><path d="M0,-48 V-6"/></g></g>`;
}
function hand(x, y, s, rot = 0, sleeve = C) { // faceless illustrated hand, index finger pointing +x
  const shapes = `<rect x="-280" y="-46" width="190" height="92" rx="10" fill="${sleeve}"/><rect x="-100" y="-52" width="118" height="104" rx="34"/><rect x="0" y="-50" width="128" height="30" rx="15"/><rect x="2" y="-14" width="74" height="28" rx="14"/><rect x="2" y="16" width="66" height="27" rx="13"/><rect x="-60" y="-86" width="88" height="30" rx="15" transform="rotate(18 -16 -71)"/>`;
  return `<g transform="translate(${f1(x)} ${f1(y)}) rotate(${f1(rot)}) scale(${s})"><g fill="${W}" stroke="${W}" stroke-width="22" stroke-linejoin="round">${shapes}</g><g fill="${I}" stroke="${K}" stroke-width="6" stroke-linejoin="round">${shapes}</g><rect x="-280" y="-46" width="190" height="92" fill="url(#dotsK)" opacity=".25"/></g>`;
}
function pencil(x, y, rot, s) { // tip at (x,y)
  const body = `<path d="M0,0 L-24,-70 L24,-70 Z" fill="${I}"/><path d="M0,0 L-8,-24 L8,-24 Z" fill="${K}"/><rect x="-24" y="-360" width="48" height="290" fill="${Y}"/><rect x="-8" y="-360" width="16" height="290" fill="${R}" opacity=".35"/><rect x="-24" y="-400" width="48" height="40" fill="#bbb"/><rect x="-24" y="-450" width="48" height="52" rx="12" fill="${R}"/>`;
  const hs = `<rect x="-58" y="-250" width="116" height="120" rx="40"/><rect x="-80" y="-232" width="40" height="90" rx="20"/><rect x="22" y="-206" width="60" height="34" rx="17"/>`;
  return `<g transform="translate(${f1(x)} ${f1(y)}) rotate(${f1(rot)}) scale(${s})"><g stroke="${W}" stroke-width="14" stroke-linejoin="round">${body}</g>${body}` +
    `<rect x="-46" y="-420" width="92" height="190" fill="${C}" stroke="${W}" stroke-width="10" transform="rotate(-8 0 -320)"/>` +
    `<g fill="${W}" stroke="${W}" stroke-width="18">${hs}</g><g fill="${I}" stroke="${K}" stroke-width="6">${hs}</g></g>`;
}
function cylinder(x, y, s, col) {
  return `<g transform="translate(${f1(x)} ${f1(y)}) scale(${s})" stroke="${W}" stroke-width="8"><path d="M-70,-60 V60 A70,22 0 0,0 70,60 V-60" fill="${col}"/><ellipse cx="0" cy="-60" rx="70" ry="22" fill="${col}"/><path d="M-70,-10 A70,22 0 0,0 70,-10 M-70,30 A70,22 0 0,0 70,30" fill="none" stroke="${K}" stroke-width="5" opacity=".5"/></g>`;
}
function bank(x, yb, s) {
  return `<g transform="translate(${x} ${yb}) scale(${s})" stroke="${K}" stroke-width="5"><path d="M-190,-300 L0,-400 L190,-300 Z" fill="${R}"/><rect x="-180" y="-300" width="360" height="30" fill="${W}"/>` +
    [0, 1, 2, 3, 4].map(i => `<rect x="${-160 + i * 72}" y="-270" width="34" height="230" fill="${I}"/>`).join('') + `<rect x="-200" y="-40" width="400" height="40" fill="${W}"/><circle cx="0" cy="-345" r="20" fill="${Y}"/></g>`;
}
function hospital(x, yb, s) {
  return `<g transform="translate(${x} ${yb}) scale(${s})"><rect x="-170" y="-420" width="340" height="420" fill="${W}" stroke="${K}" stroke-width="5"/><rect x="-150" y="-280" width="300" height="260" fill="url(#winK)" opacity=".5"/><rect x="-60" y="-400" width="120" height="110" fill="${I}" stroke="${K}" stroke-width="4"/><path d="M0,-385 v80 M-40,-345 h80" stroke="${R}" stroke-width="26"/><rect x="-40" y="-90" width="80" height="90" fill="${C}"/></g>`;
}
function house(x, yb, s, col) {
  return `<g transform="translate(${x} ${yb}) scale(${s})" stroke="${W}" stroke-width="7" stroke-linejoin="round"><path d="M-110,-170 L0,-270 L110,-170 Z" fill="${R}"/><rect x="-95" y="-170" width="190" height="170" fill="${col}"/><rect x="-60" y="-130" width="44" height="44" fill="${Y}"/><rect x="20" y="-90" width="46" height="90" fill="${K}"/></g>`;
}
function factory(x, yb, s, u) {
  let puffs = '';
  for (let i = 0; i < 4; i++) { const ph = (u * .35 + i / 4) % 1; puffs += `<circle cx="${f1(120 + ph * 80)}" cy="${f1(-430 - ph * 220)}" r="${f1(22 + ph * 40)}" fill="${I}" opacity="${(.9 - ph * .8).toFixed(2)}" stroke="${K}" stroke-width="3"/>`; }
  return `<g transform="translate(${x} ${yb}) scale(${s})">${puffs}<g stroke="${W}" stroke-width="7" stroke-linejoin="round"><rect x="90" y="-420" width="60" height="420" fill="${K}"/><path d="M-200,0 V-200 L-130,-280 V-200 L-60,-280 V-200 L10,-280 V-200 L80,-280 V0 Z" fill="${C}"/></g><rect x="-180" y="-180" width="240" height="150" fill="url(#winY)"/></g>`;
}
function tower(x, yb, s, u, on = true) {
  let rings = '';
  if (on) for (let i = 0; i < 3; i++) { const ph = (u * .8 + i / 3) % 1; rings += `<path d="M${f1(-40 - ph * 120)},${f1(-420 - ph * 60)} A${f1(60 + ph * 140)},${f1(60 + ph * 140)} 0 0,1 ${f1(40 + ph * 120)},${f1(-420 - ph * 60)}" fill="none" stroke="${C}" stroke-width="7" opacity="${(1 - ph).toFixed(2)}"/>`; }
  return `<g transform="translate(${x} ${yb}) scale(${s})">${rings}<path d="M-80,0 L0,-440 L80,0 M-60,-110 L60,-110 M-40,-220 L40,-220 M-20,-330 L20,-330 M-60,-110 L40,-220 M60,-110 L-40,-220" fill="none" stroke="${K}" stroke-width="10" stroke-linejoin="round"/><circle cx="0" cy="-440" r="16" fill="${R}" stroke="${W}" stroke-width="5"/></g>`;
}
function plane(x, y, s, col = W) {
  return `<g transform="translate(${f1(x)} ${f1(y)}) scale(${s})"><path d="M-150,0 Q-150,-26 -110,-26 L120,-26 Q160,-26 175,0 Q160,22 120,22 L-110,22 Q-150,22 -150,0 Z M-20,-20 L50,-110 L80,-110 L50,-20 Z M-20,18 L50,100 L80,100 L50,18 Z M-130,-20 L-150,-80 L-120,-80 L-95,-20 Z" fill="${col}" stroke="${K}" stroke-width="5" stroke-linejoin="round"/>` +
    [0, 1, 2, 3, 4].map(i => `<circle cx="${-60 + i * 36}" cy="-6" r="7" fill="${C}"/>`).join('') + '</g>';
}
function desk(x, yb, s, o) { // o: {col, stack, scr ('ai'|'ok'|'dead'), u, calc}
  const u = o.u || 0;
  let g = person(0, 30, .95, o.col, o.up != null ? { up: o.up } : {});
  g += `<g transform="translate(-200 -210)"><rect x="0" y="0" width="210" height="150" fill="${W}" stroke="${K}" stroke-width="5"/>`;
  if (o.scr === 'ok') g += `<rect x="12" y="12" width="186" height="126" fill="${Y}"/><rect x="26" y="96" width="${f1(30 + 120 * ((u * .5 + x * .001) % 1))}" height="16" fill="${K}"/><path d="M26,70 l30,-20 l30,10 l30,-30 l40,20" stroke="${R}" stroke-width="6" fill="none"/>`;
  else g += `<rect x="12" y="12" width="186" height="126" fill="${o.scr === 'dead' ? '#3a3a3a' : C}"/><rect x="62" y="34" width="86" height="82" rx="14" fill="#2a2a2a" stroke="#777" stroke-width="4"/><path d="M105,48 l8,22 l22,8 l-22,8 l-8,22 l-8,-22 l-22,-8 l22,-8 Z" fill="#777"/>`;
  g += `<rect x="90" y="150" width="30" height="40" fill="${K}"/></g>`;
  g += `<rect x="-260" y="-20" width="520" height="26" fill="${K}" stroke="${W}" stroke-width="6"/><rect x="-240" y="6" width="22" height="160" fill="${K}"/><rect x="218" y="6" width="22" height="160" fill="${K}"/>`;
  const n = Math.floor(o.stack || 0);
  for (let i = 0; i < n; i++) g += `<rect x="${60 + (i % 2) * 6}" y="${-34 - i * 12}" width="150" height="14" fill="${W}" stroke="${K}" stroke-width="3" transform="rotate(${(i * 37 % 7) - 3} 135 ${-27 - i * 12})"/>`;
  if (o.calc) g += `<g transform="translate(-60 -64)"><rect width="70" height="46" rx="6" fill="${Y}" stroke="${W}" stroke-width="5"/><rect x="8" y="6" width="54" height="10" fill="${K}"/><rect x="6" y="20" width="58" height="22" fill="url(#dotsK)"/></g>`;
  return `<g transform="translate(${f1(x)} ${f1(yb)}) scale(${s})">${g}</g>`;
}
function cabinet(x, yb, s, col) {
  return `<g transform="translate(${x} ${yb}) scale(${s})"><rect x="-80" y="-330" width="160" height="330" fill="${col}" stroke="${W}" stroke-width="8"/>` + [0, 1, 2].map(i => `<rect x="-62" y="${-310 + i * 105}" width="124" height="90" fill="none" stroke="${K}" stroke-width="4"/><rect x="-22" y="${-280 + i * 105}" width="44" height="10" rx="5" fill="${K}"/>`).join('') + '</g>';
}
function powerLine(x0, x1, yTop, step, u, warm = true) {
  let s = '';
  const poles = [];
  for (let x = x0; x <= x1; x += step) poles.push(x);
  for (let i = 0; i < poles.length - 1; i++) {
    for (let w = 0; w < 2; w++) {
      const a = [poles[i], yTop + 20 + w * 30], b = [poles[i + 1], yTop + 20 + w * 30], c = [(a[0] + b[0]) / 2, a[1] + 70];
      s += `<path d="M${a[0]},${a[1]} Q${c[0]},${c[1]} ${b[0]},${b[1]}" fill="none" stroke="${K}" stroke-width="4"/>`;
      if (warm && w === 1) for (let k = 1; k < 6; k++) { const p = qpt(a, c, b, k / 6); s += `<circle cx="${f1(p[0])}" cy="${f1(p[1] + 14)}" r="11" fill="${Y}" stroke="${W}" stroke-width="4" opacity="${(.75 + .25 * Math.sin(u * 9 + k + i)).toFixed(2)}"/>`; }
    }
  }
  for (const x of poles) s += `<rect x="${x - 8}" y="${yTop}" width="16" height="760" fill="${K}"/><rect x="${x - 50}" y="${yTop + 10}" width="100" height="12" fill="${K}"/>`;
  return s;
}

// ---------- the AI brain ----------
const BRAIN = (() => {
  const r = rng(321), lobes = [[-105, -40, 165], [105, -40, 165], [-160, 60, 125], [160, 60, 125], [0, -95, 150], [-70, 95, 110], [70, 95, 110]];
  const inside = (x, y) => lobes.some(([a, b, rr]) => Math.hypot(x - a, y - b) < rr - 18);
  const P = [];
  for (let gy = -250; gy <= 220; gy += 80) for (let gx = -330; gx <= 330; gx += 80) {
    const x = gx + (r() - .5) * 22, y = gy + (r() - .5) * 22;
    if (!inside(x, y)) continue;
    P.push({ x, y, w: 92 + r() * 18, h: 88 + r() * 18, rot: (r() - .5) * 14, c: [C, I, R, C, Y, I, C][Math.floor(r() * 7)], s: Math.floor(r() * 1e5), vx: (r() - .5) * 700, vr: (r() - .5) * 300, d: r() * .35, k: r() });
  }
  return { P, lobes };
})();
function brain(x, y, s, dead, cp, u) {
  let o = `<g transform="translate(${f1(x)} ${f1(y)}) scale(${s})">`;
  if (cp <= 0) o += BRAIN.lobes.map(([a, b, rr]) => `<circle cx="${a}" cy="${b}" r="${rr + 8}" fill="${W}"/>`).join('');
  for (const p of BRAIN.P) {
    let tx = p.x, ty = p.y, rot = p.rot;
    if (cp > 0) { const t = Math.max(0, cp - p.d); tx += p.vx * t * .6; ty += 1100 * t * t - 160 * t; rot += p.vr * t; }
    const col = dead ? (p.c === I || p.c === Y ? '#3d3d3d' : '#2b2b2b') : p.c;
    const lc = dead ? '#555' : K;
    const blink = !dead && Math.sin(u * 8 + p.k * 20) > .3;
    o += `<g transform="translate(${f1(tx)} ${f1(ty)}) rotate(${f1(rot)})">${poly(torn(-p.w / 2, -p.h / 2, p.w, p.h, p.s, 4, 18), col, `stroke="${W}" stroke-width="5"`)}` +
      `<path d="M${f1(-p.w / 3)},${f1(p.h / 4)} h${f1(p.w / 3)} v${f1(-p.h / 2.5)} h${f1(p.w / 4)}" stroke="${lc}" stroke-width="5" fill="none"/><circle cx="${f1(p.w / 4 - 4)}" cy="${f1(p.h / 4 - p.h / 2.5)}" r="8" fill="${blink ? (p.k > .5 ? R : Y) : lc}" stroke="${lc}" stroke-width="3"/>` +
      (p.k > .6 ? `<rect x="${f1(-p.w / 2 + 8)}" y="${f1(-p.h / 2 + 8)}" width="${f1(p.w * .45)}" height="${f1(p.h * .35)}" fill="url(#dotsK)" opacity=".35"/>` : '') + '</g>';
  }
  if (cp <= 0) o += `<path d="M0,-230 C-20,-150 20,-60 0,40 C-15,110 10,170 0,210" stroke="${dead ? '#444' : K}" stroke-width="8" fill="none" stroke-linecap="round"/>`;
  return o + '</g>';
}

// ---------- circuits ----------
function circuitPaths(list, u, alive, snapT, pulseCols = [R, C]) {
  let s = '';
  list.forEach((P, i) => {
    const c = plen(P);
    if (alive) {
      s += `<path d="${pd(P)}" fill="none" stroke="${W}" stroke-width="17" stroke-linejoin="round"/><path d="${pd(P)}" fill="none" stroke="${K}" stroke-width="8" stroke-linejoin="round"/>`;
      for (let k = 0; k < 2; k++) { const p = pat(P, c, ((u * .55 + i * .23 + k * .5) % 1) * c[c.length - 1]); s += `<circle cx="${f1(p[0])}" cy="${f1(p[1])}" r="13" fill="${pulseCols[(i + k) % 2]}" stroke="${W}" stroke-width="5"/>`; }
      s += `<circle cx="${P[0][0]}" cy="${P[0][1]}" r="11" fill="${K}" stroke="${W}" stroke-width="5"/>`;
    } else {
      const tt = snapT;
      for (let k = 1; k < P.length; k++) {
        const a = P[k - 1], b = P[k], mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, dir = ((i + k) % 2 ? 1 : -1);
        s += `<g transform="translate(${f1(dir * 90 * tt)} ${f1(900 * tt * tt)}) rotate(${f1(dir * 80 * tt)} ${f1(mx)} ${f1(my)})" opacity="${(1 - seg(tt, .7, 1.4)).toFixed(3)}"><path d="M${a[0]},${a[1]} L${b[0]},${b[1]}" stroke="${tt < .06 ? Y : K}" stroke-width="8" stroke-linecap="round"/></g>`;
      }
    }
  });
  return s;
}

// ---------- BLOCK 1: the sudden shutdown ----------
const C1 = [[[530, 420], [760, 420], [760, 380], [1225, 380]], [[970, 230], [1150, 230], [1150, 300], [1300, 300]], [[905, 650], [1100, 650], [1100, 540], [1240, 540]],
[[2530, 460], [2300, 460], [2300, 420], [1780, 420]], [[2075, 220], [1900, 220], [1900, 310], [1710, 310]], [[2180, 600], [2000, 600], [2000, 540], [1760, 540]]];
const SLAM = 7.0;
function circuitSheet(seed) {
  const r = rng(seed); let s = '';
  for (let i = 0; i < 14; i++) {
    const a = r() * Math.PI * 2, d0 = 330 + r() * 120, len = 160 + r() * 260;
    const x0 = Math.cos(a) * d0, y0 = Math.sin(a) * d0 * .65, x1 = x0 + Math.cos(a) * len, y2 = y0 + Math.sin(a) * len * .65;
    s += `<path d="M${f1(x0)},${f1(y0)} H${f1(x1)} V${f1(y2)}" stroke="${K}" stroke-width="9" fill="none"/><circle cx="${f1(x1)}" cy="${f1(y2)}" r="13" fill="${[R, C, W][i % 3]}" stroke="${K}" stroke-width="5"/>`;
  }
  return s;
}
function N1(u) {
  const off = u >= SLAM, tt = u - SLAM;
  let cx, cy = 470, z;
  if (u < 2.6) { const p = ease(seg(u, 0, 2.6)); z = lerp(.6, 1.12, p); cx = 1500; cy = lerp(540, 470, p); }
  else if (u < 5.6) { const p = seg(u, 2.6, 5.6); cx = 1500 - 650 * Math.sin(ease(p) * 1.5 * Math.PI); z = lerp(1.12, 1.0, ease(seg(u, 2.6, 3.4))); }
  else if (u < 8.6) { const p = eIn(seg(u, 5.6, 6.3)) * .5 + eOut(seg(u, 6.3, 6.9)) * .5; cx = lerp(2150, 1500, p); z = lerp(1, 1.12, p); }
  else { cx = 1500; z = 1.12; }
  if (u >= 8.6) { const p = ease(seg(u, 8.6, 9.6)); cx = lerp(1500, 820, p); cy = lerp(470, 692, p); z = Math.exp(lerp(Math.log(1.12), Math.log(19), eIn(seg(u, 8.6, 10)))); }
  const [sx, sy] = shake(u, SLAM, 16);
  const c = { cx: cx + sx, cy: cy + sy, z, rot: u > 2.6 && u < 5.6 ? 1.2 * Math.sin((u - 2.6) * 2) : 0 };
  // background
  let bg = `<rect x="-6000" y="-4000" width="16000" height="9000" fill="${Y}"/>` + cached('n1bg', () =>
    [0, 1, 2, 3, 4, 5].map(i => `<circle cx="${-200 + i * 620}" cy="${150 + (i % 2) * 650}" r="${170 + (i * 37) % 80}" fill="url(#${i % 2 ? 'dotsR' : 'dotsC'})" opacity=".8"/>`).join('') +
    poly(tornPoly([[-900, 930], [4200, 860], [4200, 1500], [-900, 1500]], 61, 9, 30), C) + `<rect x="-900" y="900" width="5100" height="600" fill="url(#dotsK)" opacity=".25"/>` +
    `<g opacity=".18" transform="translate(1500 480)">${circuitSheet(9)}${circuitSheet(19)}</g>`);
  if (off) bg += `<rect x="-6000" y="-4000" width="16000" height="9000" fill="${K}"/><rect x="-6000" y="-4000" width="16000" height="9000" fill="url(#dotsI)" opacity=".05"/>`;
  // midground network
  let mid = circuitPaths(C1, u, !off, tt);
  mid += popG(330, 420, seg(u, .25, .75), photo(330, 420, 360, 250, -4, 'dc'));
  mid += popG(970, 230, seg(u, .45, .95), chip(900, 230, 1, !off));
  mid += popG(2150, 220, seg(u, .6, 1.1), chip(2150, 220, .8, !off));
  mid += popG(820, 700, seg(u, .35, .85), phone(820, 700, 1, !off, u));
  mid += popG(2620, 460, seg(u, .55, 1.05), server(2620, 460, 1, !off, u, 1));
  const a1 = off ? -18 : -18 + 22 * Math.sin(u * 2.4), a2 = off ? 52 : 52 + 30 * Math.sin(u * 3.1 + 1);
  mid += popG(2180, 800, seg(u, .7, 1.2), robot(2180, 800, .9, a1, a2, !off));
  if (off) mid += `<g opacity=".55">${photo(330, 420, 360, 250, -4, 'dc').replace(/<image[^>]*\/>/, `<rect x="-180" y="-125" width="360" height="250" fill="${K}"/>`)}</g>`;
  mid += popG(1500, 450, seg(u, .05, .6), brain(1500, 450, .95, off, off ? tt - .1 : 0, u));
  if (!off) mid += ring(1500, 450, seg(u, 3.0, 3.8), W, 26) + ring(1500, 450, seg(u, 3.15, 3.95), C, 18);
  // screen-space push-through circuit sheets
  let near = '';
  if (u < 2.8) for (let i = 0; i < 3; i++) {
    const sc = Math.exp((u - .55 * i) * 1.25) * .6;
    const op = clamp(1 - (sc - 1.6) / 1.4) * clamp(sc * 2);
    if (op > 0) near += `<g transform="translate(960 540) scale(${sc.toFixed(3)})" opacity="${op.toFixed(3)}">${cached('sheet' + i, () => circuitSheet(100 + i))}</g>`;
  }
  // the giant red switch slides in, slams, then drops away
  let sw = '';
  const swIn = eOut(seg(u, 5.8, 6.45)), swOut = eIn(seg(u, 8.2, 8.8));
  if (swIn > 0 && swOut < 1) {
    const flip = eOut(seg(u, SLAM - .06, SLAM + .04));
    sw = `<g filter="url(#shadow)">${powerSwitch(lerp(2400, 1330, swIn), 600 + swOut * 1100, .95 + .05 * Math.sin(Math.min(1, seg(u, 6.45, 6.7)) * Math.PI), flip)}</g>`;
    sw += ring(1330, 600, seg(u, SLAM, SLAM + .8), W, 40) + ring(1330, 600, seg(u, SLAM + .08, SLAM + .9), R, 26) + ring(1330, 600, seg(u, SLAM + .16, SLAM + 1.0), Y, 16);
  }
  let s = L(c, .5, bg) + L(c, 1, mid, 'filter="url(#shadow)"') + near + sw;
  if (tt > 0 && tt < .12) s += `<rect width="1920" height="1080" fill="${W}" opacity="${(.9 * (1 - tt / .12)).toFixed(3)}"/>`;
  return s;
}

// ---------- BLOCK 2: the first shock ----------
const PANELS = [
  { k: 'chat', x: 420, y: 330 }, { k: 'search', x: 420, y: 790 }, { k: 'recs', x: 1500, y: 330 }, { k: 'assist', x: 1500, y: 790 },
  { k: 'stream', x: 2400, y: 330 }, { k: 'maps', x: 2400, y: 790 }, { k: 'music', x: 3250, y: 560 }];
const MARK2 = (() => { const P = [[60, 600]]; PANELS.forEach(p => P.push([p.x, p.y])); P.push([3700, 560]); return P; })();
const MARK2C = plen(MARK2);
function panelContent(k, u) {
  switch (k) {
    case 'chat': return `<rect x="-180" y="-100" width="220" height="56" rx="26" fill="${C}"/><rect x="-60" y="-20" width="240" height="56" rx="26" fill="${Y}"/><rect x="-180" y="60" width="170" height="46" rx="22" fill="${C}"/>` + [0, 1, 2].map(i => `<circle cx="${-150 + i * 34}" cy="83" r="${f1(8 + 3 * Math.sin(u * 8 + i))}" fill="${W}"/>`).join('');
    case 'search': return `<rect x="-190" y="-40" width="380" height="80" rx="40" fill="${W}" stroke="${K}" stroke-width="6"/><circle cx="-140" cy="0" r="22" fill="none" stroke="${R}" stroke-width="9"/><path d="M-124,16 L-104,36" stroke="${R}" stroke-width="10"/><rect x="-90" y="-8" width="${f1(80 + 140 * ((u * .6) % 1))}" height="16" fill="${C}"/>` + [0, 1, 2].map(i => `<rect x="-160" y="${60 + i * 26}" width="${260 - i * 50}" height="12" fill="${K}" opacity=".35"/>`).join('');
    case 'recs': return [0, 1, 2, 3, 4, 5].map(i => `<rect x="${-185 + (i % 3) * 126}" y="${-105 + Math.floor(i / 3) * 110}" width="112" height="96" fill="${[R, Y, C, Y, C, R][i]}" stroke="${W}" stroke-width="6"/><circle cx="${-129 + (i % 3) * 126}" cy="${-57 + Math.floor(i / 3) * 110}" r="22" fill="url(#dotsI)"/>`).join('');
    case 'assist': return `<circle cx="0" cy="-10" r="90" fill="${C}"/>` + [...Array(9)].map((_, i) => { const h = 20 + 60 * Math.abs(Math.sin(u * 7 + i * .9)); return `<rect x="${-80 + i * 18}" y="${f1(-10 - h / 2)}" width="10" height="${f1(h)}" rx="5" fill="${W}"/>`; }).join('') + `<rect x="-120" y="96" width="240" height="14" rx="7" fill="${Y}"/>`;
    case 'stream': return `<rect x="-190" y="-110" width="380" height="200" fill="${K}"/><path d="M-30,-55 L50,-10 L-30,35 Z" fill="${R}" stroke="${W}" stroke-width="6"/><rect x="-170" y="70" width="340" height="10" fill="#555"/><rect x="-170" y="70" width="${f1(60 + 120 * ((u * .3) % 1))}" height="10" fill="${R}"/><rect x="-190" y="100" width="110" height="20" fill="${Y}"/><rect x="-70" y="100" width="110" height="20" fill="${C}"/>`;
    case 'maps': return `<rect x="-190" y="-110" width="380" height="220" fill="${I}"/><path d="M-190,40 C-80,-60 40,90 190,-30" stroke="${C}" stroke-width="20" fill="none"/><path d="M-150,-90 L-40,20 L60,-40 L160,60" stroke="${K}" stroke-width="8" fill="none" stroke-dasharray="16 10"/><circle cx="${f1(-40 + 40 * Math.sin(u * 2))}" cy="20" r="18" fill="${R}" stroke="${W}" stroke-width="6"/>`;
    default: return `<circle cx="-80" cy="0" r="80" fill="${R}"/><circle cx="-80" cy="0" r="20" fill="${W}"/>` + [...Array(6)].map((_, i) => `<rect x="${20 + i * 28}" y="${f1(-50 + 25 * Math.sin(u * 5 + i))}" width="16" height="${f1(100 - 50 * Math.sin(u * 5 + i))}" fill="${[Y, C][i % 2]}"/>`).join('');
  }
}
function N2(u) {
  const lineD = MARK2C[MARK2C.length - 1] * ease(seg(u, 2.6, 5.8));
  let cx, cy, z;
  if (u < 1.5) { const p = ease(seg(u, 0, 1.5)); z = Math.exp(lerp(Math.log(19), Math.log(.86), p)); cx = lerp(960, 1100, p); cy = lerp(532, 560, p); }
  else if (u < 6.0) { cx = lerp(1100, 2150, ease(seg(u, 1.5, 6.0))); cy = 560; z = .86; }
  else if (u < 7.6) { const p = eIn(seg(u, 6.0, 7.6)); cx = lerp(2150, 2400, p); cy = lerp(560, 620, p); z = lerp(.86, 1.05, p); }
  else { const p = ease(seg(u, 7.6, 10)); cx = lerp(2400, 3980, p); cy = lerp(620, 600, p); z = lerp(1.05, 1.35, p); }
  const c = { cx, cy, z, rot: 0 };
  // infrastructure underneath
  let inf = cached('n2inf', () => {
    let s = `<rect x="-6000" y="-4000" width="16000" height="9000" fill="${K}"/><rect x="-6000" y="-4000" width="16000" height="9000" fill="url(#dotsC)" opacity=".1"/>`;
    for (let i = 0; i < 4; i++) s += `<path d="M-300,${300 + i * 140} C600,${150 + i * 200} 1400,${700 - i * 90} 2400,${400 + i * 60} S3800,${300 + i * 120} 4600,${500 + i * 40}" fill="none" stroke="${[C, Y, I, C][i]}" stroke-width="10" opacity=".55"/>`;
    return s;
  });
  for (let i = 0; i < 9; i++) inf += server(100 + i * 380, 330, .9, true, u, i);
  for (let i = 0; i < 6; i++) inf += cylinder(260 + i * 560, 880, 1, [Y, C, R][i % 3]);
  inf += cached('n2city', () => {
    let s = poly(torn(3500, 330, 900, 520, 77, 10, 26), I);
    const b = makeCity(31, 3560, 4300, 800, 120, 300, [Y, C, R, K]);
    return s + drawCity(b);
  });
  inf += `<path d="M-400,640 C400,520 900,760 1600,620 S2800,520 3300,640 S3700,700 3900,700" fill="none" stroke="${W}" stroke-width="64" stroke-linecap="round"/><path d="M-400,640 C400,520 900,760 1600,620 S2800,520 3300,640 S3700,700 3900,700" fill="none" stroke="${R}" stroke-width="44" stroke-linecap="round"/><path d="M-400,640 C400,520 900,760 1600,620 S2800,520 3300,640 S3700,700 3900,700" fill="none" stroke="${K}" stroke-width="4" stroke-dasharray="20 18" opacity=".5"/>`;
  // interface layer (lifts away during the dive)
  const lift = -1500 * eIn(seg(u, 6.0, 7.6));
  let ui = `<g transform="translate(0 ${f1(lift)})"><g filter="url(#shadow)">${poly(torn(-800, -600, 4700, 1850, 99, 14, 34), I)}</g>` + cached('n2uibg', () => [0, 1, 2, 3, 4].map(i => `<circle cx="${i * 800}" cy="${160 + (i % 2) * 700}" r="${160 + i * 15}" fill="url(#dotsY)"/>`).join(''));
  ui += phone(960, 540, 1, false);
  PANELS.forEach((p, i) => {
    const di = MARK2C[i + 1];
    const g = clamp((lineD - di + 60) / 260), fold = eIn(seg(lineD, di + 120, di + 520));
    let card = `<rect x="-220" y="-150" width="440" height="300" fill="${W}"/><g>${panelContent(p.k, g > 0 ? 0 : u)}</g>`;
    if (g > 0) card += `<rect x="-220" y="-150" width="440" height="300" fill="#8d8a84" opacity="${(.72 * g).toFixed(3)}" style="mix-blend-mode:color"/><rect x="-220" y="-150" width="440" height="300" fill="#9a958d" opacity="${(.4 * g).toFixed(3)}"/>`;
    const sy = 1 - .93 * fold;
    card = `<g transform="translate(${p.x} ${p.y}) translate(0 -150) scale(1 ${sy.toFixed(3)}) translate(0 150)">${card}${fold > 0 ? `<rect x="-220" y="-150" width="440" height="300" fill="${K}" opacity="${(.45 * fold).toFixed(3)}"/>` : ''}</g>`;
    ui += popG(p.x, p.y, seg(u, 1.2 + i * .16, 1.6 + i * .16), `<g filter="url(#shadow)">${card}</g>`);
  });
  ui += mk(pd(MARK2), R, 12, lineD / MARK2C[MARK2C.length - 1]);
  ui += '</g>';
  return L(c, 1, inf) + L(c, 1, ui);
}

// ---------- BLOCK 3: the invisible dependency ----------
const ROUTE3 = 'M-500,700 C0,640 300,860 700,800 S1300,720 1650,820 S2300,880 2600,800 S3200,720 3700,800';
function conveyor(x, y, u, speedPos) {
  let s = `<rect x="${x - 260}" y="${y}" width="520" height="40" rx="20" fill="${K}" stroke="${W}" stroke-width="6"/>` + [0, 1, 2, 3, 4, 5, 6].map(i => `<circle cx="${x - 230 + i * 77}" cy="${y + 20}" r="12" fill="#555"/>`).join('');
  for (let i = 0; i < 5; i++) { const bx = x - 260 + ((speedPos * 110 + i * 110) % 520); s += `<rect x="${f1(bx)}" y="${y - 60}" width="70" height="60" fill="${[R, C, Y][i % 3]}" stroke="${W}" stroke-width="5"/>`; }
  return s;
}
function N3(u) {
  let cx, cy = 520, z = 1.2;
  if (u < 6.6) cx = lerp(250, 3000, warp(u, 0, 6.6, [[1.5, .5, 1.6], [4.4, .5, 1.6]]));
  else if (u < 8.4) { const p = ease(seg(u, 6.6, 8.2)); cx = lerp(3000, 1650, p); z = lerp(1.2, .58, p); cy = lerp(520, 430, p); }
  else { cx = 1650; cy = 430; z = .58; }
  if (u > 8.4) { const p = seg(u, 8.4, 10); cx = lerp(1650, 1660, p); cy = lerp(430, 255, ease(seg(u, 8.4, 9.4))); z = Math.exp(lerp(Math.log(.58), Math.log(22), eIn(p))); }
  const c = { cx, cy, z, rot: 0 };
  const yb = 760;
  let w = cached('n3base', () => {
    let s = `<rect x="-6000" y="-4000" width="16000" height="9000" fill="${I}"/>` + [0, 1, 2, 3, 4, 5].map(i => `<circle cx="${-100 + i * 700}" cy="${120 + (i % 2) * 100}" r="${130 + i * 10}" fill="url(#dotsY)"/>`).join('');
    // office tower with the window we fly through
    s += `<g filter="url(#shadow)">${poly(torn(1520, -150, 280, 920, 12, 6, 26), C)}<rect x="1540" y="-130" width="240" height="880" fill="url(#win)" opacity=".5"/><rect x="1600" y="190" width="120" height="130" fill="${W}"/><rect x="1612" y="202" width="96" height="106" fill="${I}"/><path d="M1660,202 V308 M1612,255 H1708" stroke="${K}" stroke-width="6"/></g>`;
    s += poly(tornPoly([[-900, 740], [4400, 720], [4400, 1600], [-900, 1600]], 5, 10, 30), Y) + `<rect x="-900" y="760" width="5300" height="900" fill="url(#dotsR)" opacity=".18"/>`;
    s += poly(torn(-900, 785, 5300, 70, 6, 5, 30), K);
    return s;
  });
  w += `<g opacity=".95">${powerLine(-300, 3600, 60, 650, u)}</g>`;
  // sectors unfold as the camera reaches them
  const s1 = seg(u, .2, .7), s2 = seg(u, 1.6, 2.1), s3 = seg(u, 3.0, 3.5), s4 = seg(u, 4.6, 5.1);
  // bank + analytics chart (freezes)
  const fr1 = u > 2.0;
  let bankG = bank(380, yb, .95) + `<g transform="translate(720 470)"><rect x="-130" y="-120" width="260" height="210" fill="${W}" stroke="${K}" stroke-width="5"/>` +
    [0, 1, 2, 3, 4].map(i => { const h = fr1 ? 40 + i * 14 : 40 + 70 * Math.abs(Math.sin(u * 4 + i)); return `<rect x="${-105 + i * 44}" y="${f1(70 - h)}" width="30" height="${f1(h)}" fill="${fr1 ? '#888' : [R, C][i % 2]}"/>`; }).join('') +
    `<path d="M-110,-80 L-50,-40 L0,-70 L50,-20 L110,-60" stroke="${fr1 ? '#888' : K}" stroke-width="6" fill="none"/></g>`;
  w += unfold(550, yb, s1, `<g filter="url(#shadow)">${bankG}</g>`);
  w += mk('M560,470 C560,330 880,330 880,470 C880,610 560,610 580,450', R, 9, eOut(seg(u, 2.1, 2.7)));
  // hospital + triage display (goes idle)
  const fr2 = u > 3.2;
  let hosp = hospital(1250, yb, 1) + `<g transform="translate(1000 560)"><rect x="-90" y="-70" width="180" height="140" fill="${K}" stroke="${W}" stroke-width="7"/>` +
    (fr2 ? `<path d="M-70,0 H70" stroke="#666" stroke-width="6"/>` : `<path d="M-70,0 h30 l12,-40 l16,70 l14,-30 h68" stroke="${R}" stroke-width="7" fill="none" stroke-dasharray="300" stroke-dashoffset="${f1(-u * 300 % 600)}"/>`) + '</g>';
  w += unfold(1150, yb, s2, `<g filter="url(#shadow)">${hosp}</g>`);
  w += mk('M920,560 a100,90 0 1,0 200,0 a100,90 0 1,0 -200,0', R, 9, eOut(seg(u, 3.3, 3.9)));
  // warehouse + conveyor (slows to a halt)
  const v = t => t < 3.6 ? t : 3.6 + .9 * (1 - Math.pow(1 - seg(t, 3.6, 4.7), 2));
  let wh = `${poly(torn(1850, 380, 520, 380, 41, 5, 26), Y)}<path d="M1850,380 L2110,250 L2370,380 Z" fill="${R}" stroke="${W}" stroke-width="7"/><rect x="2010" y="560" width="200" height="200" fill="${K}"/><rect x="2010" y="560" width="200" height="200" fill="url(#stripesCK)" opacity=".6"/>` +
    conveyor(2110, 700, u, v(u) * 2.2) + robot(2420, yb, .55, u < 4.6 ? -20 + 25 * Math.sin(u * 3) : -10, u < 4.6 ? 60 + 20 * Math.sin(u * 4) : 60, u < 4.6);
  w += unfold(2100, yb, s3, `<g filter="url(#shadow)">${wh}</g>`);
  w += mk('M1820,700 C1820,580 2400,580 2400,700 C2400,800 1840,810 1830,690', R, 9, eOut(seg(u, 4.7, 5.3)));
  // airport + transport optimisation board (goes dark)
  const fr4 = u > 5.7;
  let ap = `${poly(tornPoly([[2650, 740], [3500, 700], [3500, 760], [2650, 790]], 8, 4, 24), K)}` + [0, 1, 2, 3, 4].map(i => `<rect x="${2680 + i * 160}" y="${742 - i * 9}" width="80" height="10" fill="${I}"/>`).join('') +
    plane(2950, 640, .7) + plane(3330, 560, .55, I) + `<rect x="2700" y="250" width="40" height="420" fill="${K}"/><path d="M2650,250 h140 l-20,-70 h-100 Z" fill="${C}" stroke="${W}" stroke-width="6"/>` +
    `<g transform="translate(3150 360)"><rect x="-150" y="-100" width="300" height="190" fill="${K}" stroke="${W}" stroke-width="8"/>` +
    [...Array(12)].map((_, i) => `<rect x="${-130 + (i % 4) * 66}" y="${-80 + Math.floor(i / 4) * 56}" width="52" height="40" fill="${fr4 ? '#333' : (Math.sin(u * 6 + i * 1.3) > 0 ? C : Y)}"/>`).join('') + '</g>';
  w += unfold(3050, yb, s4, `<g filter="url(#shadow)">${ap}</g>`);
  w += mk('M2990,360 a165,115 0 1,0 330,0 a165,115 0 1,0 -330,0', R, 9, eOut(seg(u, 5.8, 6.4)));
  // ordinary computers keep working
  for (const x of [900, 2650]) w += `<g filter="url(#shadow)" transform="translate(${x} 700)"><rect x="-60" y="-80" width="120" height="86" fill="${W}" stroke="${K}" stroke-width="5"/><rect x="-50" y="-70" width="100" height="66" fill="${Y}"/><rect x="-40" y="-30" width="${f1(20 + 60 * ((u * .8) % 1))}" height="10" fill="${K}"/></g>`;
  // the route
  w += mk(ROUTE3, R, 16, eOut(seg(u, 0, 6.4)));
  // human workers step in
  let crew = '';
  for (let i = 0; i < 6; i++) {
    const tx = 1380 + i * 120, fromX = i < 3 ? -400 + i * 60 : 3800 - i * 40;
    const p = ease(seg(u, 5.8 + i * .12, 7.6 + i * .12));
    crew += person(lerp(fromX, tx, p), 980 + Math.abs(Math.sin(u * 8 + i)) * -10 * (p < 1 ? 1 : 0), 1.05, [K, C, R, K, Y, C][i], { prop: i % 2 ? 'clip' : 'board' });
  }
  w += `<g filter="url(#shadow)">${crew}</g>`;
  w += mk('M1300,900 C1300,720 2100,720 2100,900 C2100,1080 1300,1080 1310,880', R, 14, eOut(seg(u, 7.4, 8.3)));
  return L(c, 1, w);
}

// ---------- BLOCK 4: humans take control ----------
function N4(u) {
  let cx, cy = 520, z;
  const orbX = t => 1500 + 420 * Math.sin((seg(t, 4, 6.5) - .5) * Math.PI);
  if (u < .9) { const p = ease(seg(u, 0, .9)); cx = lerp(380, 520, p); z = lerp(1.7, 1.25, p); cy = lerp(500, 540, p); }
  else if (u < 4) { cx = lerp(520, 1250, ease(seg(u, .9, 4))); z = 1.25; cy = 540; }
  else if (u < 6.5) { const k = ease(seg(u, 4, 4.6)); cx = lerp(1250, orbX(u), k); cy = lerp(540, 430, k); z = lerp(1.25, 1.1, k); }
  else { const p = ease(seg(u, 6.5, 8)); cx = lerp(orbX(6.5), 1500, p); cy = lerp(430, 470, p); z = lerp(1.1, .62, p); }
  const c = { cx, cy, z, rot: u > 4 && u < 6.5 ? 1.5 * Math.sin((u - 4) * 1.3) : 0 };
  const orb = u > 4 && u < 6.5 ? Math.sin((seg(u, 4, 6.5) - .5) * Math.PI) : (u >= 6.5 ? 1 - ease(seg(u, 6.5, 8)) : -1);
  // wall
  let wall = cached('n4wall', () => `<rect x="-6000" y="-4000" width="16000" height="9000" fill="${I}"/>` + `<rect x="-3000" y="620" width="9000" height="60" fill="${C}"/>` + [0, 1, 2, 3, 4, 5].map(i => `<circle cx="${-200 + i * 650}" cy="${160 + (i % 2) * 120}" r="${120 + i * 12}" fill="url(#${i < 3 ? 'dotsR' : 'dotsY'})" opacity=".7"/>`).join('') +
    `<rect x="1800" y="-400" width="4000" height="1100" fill="${Y}" opacity=".18"/>`);
  // giant clock unfolds and spins up
  const cp = seg(u, 2.2, 2.9);
  let minA = 0;
  for (let s = 2.9; s < u; s += .01) minA += (30 + 2400 * Math.pow(seg(s, 4.4, 6.4), 2)) * .01;
  minA = (minA + 330) % 360;
  const hourA = (300 + minA / 12) % 360;
  wall += cp > 0 ? `<g filter="url(#shadow)" transform="translate(1500 330) scale(${popS(cp).toFixed(3)} 1) translate(-1500 -330)">${clock(1500, 330, 230, minA, hourA)}</g>` : '';
  if (u > 4.4) wall += ring(1500, 330, seg(u, 4.4, 5.2), W, 22);
  // left: stalled AI workflows; right: working infrastructure
  let right = powerLine(2000, 3200, -60, 600, u) + `<path d="M1950,640 C2200,500 2400,700 2700,560 S3100,620 3300,600" fill="none" stroke="${C}" stroke-width="12"/><path d="M1950,660 C2250,560 2500,760 2800,600 S3150,660 3300,650" fill="none" stroke="${Y}" stroke-width="12"/>` +
    `<g transform="translate(2600 420)"><rect x="-90" y="-36" width="180" height="72" rx="12" fill="${K}" stroke="${W}" stroke-width="7"/>` + [0, 1, 2, 3, 4].map(i => `<circle cx="${-60 + i * 30}" cy="0" r="8" fill="${Math.sin(u * 10 + i * 2) > 0 ? Y : '#555'}"/>`).join('') + '</g>';
  let left = [0, 1, 2].map(i => `<g transform="translate(${180 + i * 330} ${250 + (i % 2) * 70})">` + `<rect x="-90" y="-60" width="180" height="120" fill="${W}" stroke="${K}" stroke-width="4"/><path d="M-60,-20 h40 m10,0 h40 M-60,10 h100" stroke="${K}" stroke-width="6" opacity=".4"/></g>`).join('') + cabinet(1180, 700, 1, C);
  for (let i = 0; i < 3; i++) left += mk(`M${120 + i * 330},${200 + (i % 2) * 70} l120,110 M${240 + i * 330},${200 + (i % 2) * 70} l-120,110`, R, 10, eOut(seg(u, 1.4 + i * .5, 1.9 + i * .5)));
  let mid = `<g filter="url(#shadow)">${left}${right}</g>`;
  // desks (foreground)
  let fg = '';
  const desksL = [[260, C], [760, R], [1260, K]], desksR = [[1880, Y], [2400, C], [2920, R]];
  desksL.forEach(([x, col], i) => {
    const st = 2 + 4 * seg(u, 1 + i * .3, 1.4 + i * .3) + 5 * seg(u, 4 + i * .3, 4.4 + i * .3) + 6 * seg(u, 7 + i * .2, 7.4 + i * .2);
    fg += desk(x, 900, 1, { col, stack: st, scr: 'ai', u, calc: i === 1 });
  });
  desksR.forEach(([x, col], i) => fg += desk(x, 900, 1, { col, stack: 1, scr: 'ok', u, up: i === 1 ? u * 3 : null }));
  fg += cabinet(1560, 940, 1, R);
  for (let i = 0; i < 3; i++) fg += mk(`M${200 + i * 500},${700} a120,60 0 1,0 240,0 a120,60 0 1,0 -240,0`, R, 9, eOut(seg(u, 3 + i * .4, 3.6 + i * .4)));
  // bold arrow connecting the two sides
  let arrow = mk('M500,120 C900,-120 2100,-120 2500,110', K, 18, eOut(seg(u, 7.2, 8.2))) + (u > 8.1 ? `<path d="M2420,40 L2510,118 L2400,150" fill="none" stroke="${K}" stroke-width="18" stroke-linecap="round" stroke-linejoin="round"/>` : '');
  const oc = { ...c };
  let s = L(oc, .85, wall) + L(c, 1, mid + arrow) + L({ ...c, cx: c.cx + orb * 60 }, 1.08, `<g filter="url(#shadow)">${fg}</g>`);
  if (u < .9) { const p = eIn(seg(u, 0, .9)), sc = lerp(1, 7, p); s += `<g transform="translate(960 540) scale(${sc.toFixed(3)})" opacity="${(1 - seg(u, .5, .9)).toFixed(3)}"><path d="M-1200,-800 H1200 V800 H-1200 Z M-480,-530 V530 H480 V-530 Z" fill="${C}" fill-rule="evenodd"/><path d="M-480,-530 H480 V530 H-480 Z" fill="none" stroke="${W}" stroke-width="60"/><path d="M0,-530 V530 M-480,0 H480" stroke="${K}" stroke-width="30"/></g>`; }
  if (u > 8.8) { const p = eIn(seg(u, 8.8, 10)), sc = lerp(.03, 1.15, p); s += `<g transform="translate(960 540) rotate(${f1(lerp(40, 0, p))}) scale(${sc.toFixed(4)})" filter="url(#shadow)">${cached('sheet5', () => poly(torn(-1250, -760, 2500, 1500, 505, 12, 34), I) + `<rect x="-1200" y="-720" width="2400" height="1420" fill="url(#grid)"/>`)}</g>`; }
  return s;
}

// ---------- BLOCK 5: the surprising twist ----------
const BP = (() => {
  const P = [];
  for (let a = 0; a <= 360; a += 10) { const r = (Math.floor(a / 20) % 2 ? 120 : 145); P.push([520 + Math.cos(a * Math.PI / 180) * r, 640 + Math.sin(a * Math.PI / 180) * r]); }
  P.push([665, 640], [900, 640], [900, 470], [1300, 470], [1300, 820], [1700, 820], [1700, 470], [2100, 470], [2100, 760], [2500, 760], [2500, 520], [2850, 520]);
  return { P, c: plen(P) };
})();
function N5(u) {
  const bpLen = BP.c[BP.c.length - 1];
  const prog = u < 2 ? .09 * ease(seg(u, 0, 2)) : lerp(.09, 1, ease(seg(u, 2, 6.6)));
  const tip = pat(BP.P, BP.c, prog * bpLen);
  let cx, cy, z;
  if (u < 2) { cx = tip[0]; cy = tip[1] - 60; z = 3.2; }
  else if (u < 6.6) { const p = ease(seg(u, 2, 4)); cx = tip[0]; cy = tip[1] - lerp(60, 100, p); z = lerp(3.2, 1.3, p); }
  else if (u < 8.2) { const p = ease(seg(u, 6.6, 8.2)); cx = lerp(tip[0], 1650, p); cy = lerp(tip[1] - 100, 620, p); z = lerp(1.3, .56, p); }
  else { const p = ease(seg(u, 8.4, 10)); cx = lerp(1650, 3750, p); cy = lerp(620, 690, p); z = lerp(.56, 1.4, p); }
  const c = { cx, cy, z, rot: 0 };
  let w = cached('n5sheet', () => `<rect x="-6000" y="-4000" width="16000" height="9000" fill="${I}"/><rect x="-6000" y="-4000" width="16000" height="9000" fill="url(#dotsY)" opacity=".25"/><g filter="url(#shadow)">${poly(torn(-100, -60, 3400, 1460, 505, 12, 34), I)}</g><rect x="-60" y="-20" width="3320" height="1380" fill="url(#grid)"/>`);
  w += `<rect x="-100" y="-60" width="3400" height="1460" fill="url(#warm)" opacity="${(.5 * seg(u, 2, 8)).toFixed(3)}" style="mix-blend-mode:multiply"/>`;
  // blueprint line drawn by the pencil
  w += mk(pd(BP.P), C, 7, prog) + mk(pd(BP.P), K, 3, prog);
  w += prog > .08 ? `<circle cx="520" cy="640" r="40" fill="none" stroke="${K}" stroke-width="4"/><path d="M520,560 V720 M440,640 H600" stroke="${K}" stroke-width="2" stroke-dasharray="8 6"/>` : '';
  // workshop
  const ws = `<g filter="url(#shadow)"><rect x="760" y="560" width="300" height="120" rx="10" fill="${R}" stroke="${W}" stroke-width="8"/><rect x="760" y="560" width="300" height="30" fill="${K}"/><rect x="890" y="540" width="40" height="20" fill="${K}"/>` +
    `<path d="M820,520 L980,360" stroke="${W}" stroke-width="40" stroke-linecap="round"/><path d="M820,520 L980,360" stroke="${C}" stroke-width="24" stroke-linecap="round"/><circle cx="985" cy="355" r="34" fill="${C}" stroke="${W}" stroke-width="8"/><circle cx="995" cy="345" r="14" fill="${I}"/>` +
    `<circle cx="1120" cy="430" r="70" fill="none" stroke="${Y}" stroke-width="30" stroke-dasharray="18 12"/><circle cx="1120" cy="430" r="44" fill="${Y}" stroke="${W}" stroke-width="6"/><circle cx="1120" cy="430" r="14" fill="${K}"/>` +
    `<rect x="700" y="700" width="420" height="44" fill="${Y}" stroke="${W}" stroke-width="6"/>` + [...Array(12)].map((_, i) => `<path d="M${716 + i * 34},700 v${i % 2 ? 14 : 24}" stroke="${K}" stroke-width="4"/>`).join('') + '</g>';
  w += unfold(930, 750, seg(u, 2.0, 2.5), ws);
  // hospital exam room
  const hr = `<g filter="url(#shadow)"><rect x="1360" y="660" width="320" height="50" fill="${W}" stroke="${K}" stroke-width="5"/><rect x="1360" y="620" width="80" height="40" rx="14" fill="${C}"/><rect x="1370" y="710" width="16" height="90" fill="${K}"/><rect x="1654" y="710" width="16" height="90" fill="${K}"/>` +
    `<rect x="1380" y="330" width="230" height="160" fill="${K}" stroke="${W}" stroke-width="8"/><path d="M1395,410 h50 l14,-40 l18,80 l16,-40 h100" stroke="${R}" stroke-width="7" fill="none"/><path d="M1790,330 v70 M1755,365 h70" stroke="${R}" stroke-width="22"/>` +
    person(1800, 800, 1.15, C, { prop: 'clip' }) + '</g>';
  w += unfold(1600, 800, seg(u, 3.8, 4.3), hr);
  // library + classroom
  let lib = `<g filter="url(#shadow)"><rect x="1950" y="270" width="380" height="500" fill="${K}" stroke="${W}" stroke-width="8"/>`;
  const rb = rng(55);
  for (let sh = 0; sh < 4; sh++) { let x = 1970; while (x < 2300) { const bw = 22 + rb() * 18, bh = 70 + rb() * 40; lib += `<rect x="${f1(x)}" y="${f1(380 + sh * 120 - bh)}" width="${f1(bw)}" height="${f1(bh)}" fill="${[R, C, Y, I][Math.floor(rb() * 4)]}"/>`; x += bw + 4; } lib += `<rect x="1960" y="${380 + sh * 120}" width="360" height="10" fill="${Y}"/>`; }
  lib += `<rect x="2400" y="330" width="420" height="260" fill="${Y}" stroke="${W}" stroke-width="8"/><rect x="2420" y="350" width="380" height="220" fill="${K}"/><circle cx="2500" cy="440" r="40" fill="none" stroke="${I}" stroke-width="5"/><path d="M2580,500 L2640,400 L2700,500 Z M2560,530 h180" fill="none" stroke="${I}" stroke-width="5"/>` +
    `<circle cx="2600" cy="700" r="60" fill="${C}" stroke="${W}" stroke-width="8"/><path d="M2545,690 C2580,660 2620,720 2655,690" stroke="${Y}" stroke-width="10" fill="none"/><rect x="2590" y="760" width="20" height="40" fill="${K}"/>` +
    person(2250, 860, 1, R, { up: u * 4 }) + person(2420, 860, .9, Y, {}) + person(2780, 860, 1.05, K, { prop: 'clip' }) + '</g>';
  w += unfold(2350, 860, seg(u, 5.6, 6.1), lib);
  // the dark, inactive AI brain at the far edge
  w += `<g opacity=".95">${brain(3080, 560, .42, true, 0, u)}</g>`;
  // circuit line out of the blueprint to the red switch
  const exitP = eOut(seg(u, 8.2, 9.5));
  w += mk('M2850,520 C3200,520 3300,700 3600,700 S4000,640 4200,640', R, 12, exitP);
  w += pencil(tip[0], tip[1], 28 + 4 * Math.sin(u * 3), .9 * (u < 6.6 ? 1 : 1 - seg(u, 6.6, 7.2) * .0)).replace('<g transform', `<g opacity="${(1 - seg(u, 7.4, 8.2)).toFixed(3)}" transform`);
  return L(c, 1, w);
}

// ---------- BLOCK 6: the final answer ----------
const N6CITY = (() => {
  const r = rng(606), items = [];
  const kinds = ['bank', 'hosp', 'fac', 'house', 'tower', 'house', 'fac', 'bank', 'house', 'hosp', 'tower', 'house', 'fac'];
  let x = -320;
  kinds.forEach((k, i) => { items.push({ k, x, dark: r() > .55, grp: Math.floor(i / 3.4) }); x += 300 + r() * 40; });
  return items;
})();
const N6LINES = (() => {
  const r = rng(66), L2 = [];
  for (let i = 0; i < 70; i++) { const x = -300 + r() * 3900, y = 360 + r() * 520; L2.push(`M${f1(x)},${f1(y)} C${f1(x + (1500 - x) * .3)},${f1(y + 260)} ${f1(1500 + (x - 1500) * .25)},${f1(1000)} 1500,920`); }
  return L2;
})();
function N6(u) {
  let cx, cy, z;
  if (u < 2) { const p = ease(seg(u, 0, 2)); cx = lerp(-300, 1500, p); cy = lerp(640, 560, p); z = 1.5; }
  else if (u < 4.5) { cx = 1500 + 380 * Math.sin((u - 2) * 1.25); cy = 540; z = 1.5; }
  else if (u < 7) { const p = eIn(seg(u, 4.5, 5.3)) * .55 + eOut(seg(u, 5.3, 6.1)) * .45; cx = lerp(1500 + 380 * Math.sin(2.5 * 1.25), 1500, p); cy = lerp(540, 380, p); z = lerp(1.5, .56, p); }
  else { const p = ease(seg(u, 7, 9.2)); cx = lerp(1500, 1700, p); cy = lerp(380, 620, p); z = lerp(.56, 1.25, p); }
  const c = { cx, cy, z, rot: u > 2 && u < 4.5 ? 1.4 * Math.sin((u - 2) * 1.25) : 0 };
  let bg = cached('n6bg', () => `<rect x="-6000" y="-4000" width="16000" height="9000" fill="${I}"/>` + [0, 1, 2, 3, 4, 5].map(i => `<circle cx="${-300 + i * 750}" cy="${160 + (i % 2) * 160}" r="${150 + i * 12}" fill="url(#dotsY)"/>`).join('') + poly(tornPoly([[-1500, 880], [4600, 860], [4600, 2000], [-1500, 2000]], 7, 10, 30), Y));
  bg += plane(-100 + u * 60, 150, .8) + plane(2900 - u * 50, 240, .6, I);
  // civilization layers pop in with the orbit
  let city = '';
  N6CITY.forEach((it, i) => {
    const p = seg(u, 2.1 + it.grp * .7, 2.6 + it.grp * .7);
    let g = '';
    if (it.k === 'bank') g = bank(it.x, 880, .8);
    else if (it.k === 'hosp') g = hospital(it.x, 880, .85);
    else if (it.k === 'fac') g = factory(it.x, 880, .9, u);
    else if (it.k === 'house') g = house(it.x, 880, 1, [C, I, Y][i % 3]);
    else g = tower(it.x, 880, .9, u, !it.dark);
    if (it.dark && it.k !== 'tower') g += `<rect x="${it.x - 110}" y="560" width="220" height="150" fill="${K}" stroke="${W}" stroke-width="7"/><path d="M${it.x},585 l10,30 l30,10 l-30,10 l-10,30 l-10,-30 l-30,-10 l30,-10 Z" fill="#666"/>`;
    else if (it.k !== 'tower') g += `<rect x="${it.x - 70}" y="600" width="140" height="80" fill="${Y}" stroke="${W}" stroke-width="7"/>`;
    city += unfold(it.x, 880, p, g);
  });
  // train
  city += unfold(2400, 960, seg(u, 4.1, 4.5), [0, 1, 2, 3].map(i => `<g transform="translate(${2000 + i * 210 - (u * 40) % 210 * 0} 900)"><rect width="190" height="80" rx="14" fill="${[R, C, C, C][i]}" stroke="${W}" stroke-width="7"/><rect x="18" y="16" width="150" height="26" fill="url(#winY)"/></g>`).join(''));
  // thousands of red circuit lines converging on the switch
  const lp = eOut(seg(u, 4.6, 6.4));
  let lines = '';
  if (lp > 0) lines = `<g opacity=".85">${N6LINES.map((d, i) => mk(d, R, 3 + (i % 3), clamp(lp * 1.4 - (i % 7) * .06))).join('')}</g>`;
  // question mark made of disconnected circuit fragments
  const qp = eOut(seg(u, 5.2, 6.4));
  let q = '';
  if (qp > 0) {
    q = `<g opacity="${qp.toFixed(3)}" transform="translate(0 ${f1((1 - qp) * -60)}) translate(1500 -330) scale(1.5) translate(-1500 -110)"><path d="M1380,170 C1380,30 1620,30 1620,150 C1620,240 1500,230 1500,320" fill="none" stroke="${W}" stroke-width="44" stroke-dasharray="46 30" stroke-linecap="round"/><path d="M1380,170 C1380,30 1620,30 1620,150 C1620,240 1500,230 1500,320" fill="none" stroke="${R}" stroke-width="26" stroke-dasharray="46 30" stroke-linecap="round"/>` +
      `<circle cx="1500" cy="390" r="28" fill="${R}" stroke="${W}" stroke-width="9"/>` + [[1380, 170], [1620, 150], [1500, 320]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="14" fill="${K}" stroke="${W}" stroke-width="5"/>`).join('') + '</g>';
  }
  // incoming circuit line from Block 5
  const inLine = mk('M-900,640 C-400,640 0,760 500,740 S1200,800 1500,920', R, 14, eOut(seg(u, 0, 2)));
  // switch + the small human hand
  const sw = `<g filter="url(#shadow)">${powerSwitch(1500, 640, 1.5, 0)}</g>`;
  const hx = lerp(2060, 1860, ease(seg(u, 7, 9.2)));
  const hnd = `<g filter="url(#shadow)" transform="translate(${f1(hx)} 760) scale(-1 1)">${hand(0, 0, .45, 0, C)}</g>`;
  let crew = '';
  for (let i = 0; i < 7; i++) crew += person(150 + i * 470 + (i > 2 ? 520 : 0), 1120, 1.25, [K, C, R, Y, K, C, R][i], { prop: i % 2 ? 'clip' : null });
  let s = L(c, .7, bg) + L(c, .85, `<g filter="url(#shadow)">${city}</g>`) + L(c, 1, inLine + lines + q + sw + hnd) + L(c, 1.2, `<g filter="url(#shadow)" opacity="${seg(u, 3.4, 3.9).toFixed(3)}">${crew}</g>`);
  s += `<rect width="1920" height="1080" fill="url(#warm)" opacity=".18" style="mix-blend-mode:multiply"/>`;
  if (u > 9.2) s += `<rect width="1920" height="1080" fill="${K}" opacity="${seg(u, 9.2, 9.95).toFixed(3)}"/>`;
  return s;
}

// ---------- props + textures for this story ----------
const _person = person;
person = function (x, y, s, col, o = {}) {
  if (o.prop === 'clip' || o.prop === 'board') {
    const base = _person(x, y, s, col, { ...o, prop: null, armOut: true }).replace(/<\/g>$/, '');
    const arm = `<g stroke="${W}" stroke-width="34" stroke-linecap="round"><path d="M30,-92 L52,-58"/></g><g stroke="${col}" stroke-width="17" stroke-linecap="round"><path d="M30,-92 L52,-58"/></g>`;
    const prop = o.prop === 'clip'
      ? `<g transform="translate(30 -96) rotate(8)"><rect width="62" height="80" rx="6" fill="${W}" stroke="${K}" stroke-width="5"/><rect x="18" y="-6" width="26" height="12" rx="4" fill="${K}"/><path d="M12,24 h36 M12,40 h36 M12,56 h26" stroke="${K}" stroke-width="4"/><path d="M8,22 l4,4 l6,-8" stroke="${R}" stroke-width="4" fill="none"/></g>`
      : `<g transform="translate(26 -94)"><rect width="84" height="60" rx="8" fill="${K}" stroke="${W}" stroke-width="5"/><circle cx="22" cy="24" r="11" fill="${Y}"/><circle cx="52" cy="24" r="11" fill="${C}"/><rect x="12" y="42" width="60" height="8" fill="${R}"/></g>`;
    return base + arm + prop + '</g>';
  }
  return _person(x, y, s, col, o);
};
function makeDC() {
  const w = 360, h = 250, cv = document.createElement('canvas'); cv.width = w; cv.height = h;
  const g = cv.getContext('2d'), r = rng(42);
  const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#bdb6aa'); gr.addColorStop(1, '#6b665e'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  g.filter = 'blur(1.4px)';
  for (let row = 0; row < 3; row++) for (let i = 0; i < 7; i++) {
    const x = 18 + i * 48 + row * 6, y = 40 + row * 62, v = 40 + r() * 30;
    g.fillStyle = `rgb(${v},${v},${v})`; g.fillRect(x, y, 38, 54);
    for (let k = 0; k < 6; k++) { g.fillStyle = r() > .5 ? 'rgba(230,230,220,.9)' : 'rgba(150,150,140,.8)'; g.fillRect(x + 6, y + 6 + k * 8, 3, 3); }
  }
  g.filter = 'none';
  const id = g.getImageData(0, 0, w, h);
  for (let i = 0; i < id.data.length; i += 4) { const n = (r() - .5) * 46; id.data[i] += n; id.data[i + 1] += n; id.data[i + 2] += n; }
  g.putImageData(id, 0, 0);
  TEX.dc = cv.toDataURL('image/jpeg', .9);
}
BLOCKS = [N1, N2, N3, N4, N5, N6];
window.TRANS = (b, u) => '';
