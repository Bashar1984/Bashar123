// Vox-style explainer engine: deterministic render(t) -> SVG. 1920x1080, 24 fps.
const I = '#F4EBDD', K = '#202020', R = '#D83A2E', Y = '#F4C542', C = '#4C9CA8', WH = '#FBF7EE';
const FPS = 24, SCENE_LEN = 12, N_SCENES = 12, TOTAL = SCENE_LEN * N_SCENES;
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, t) => a + (b - a) * t;
const eOut = t => 1 - Math.pow(1 - clamp(t), 3);
const eIO = t => { t = clamp(t); return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
const eBack = t => { t = clamp(t); const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
const pr = (u, a, b) => clamp((u - a) / (b - a));
const f = n => (Math.round(n * 10) / 10).toString();
const hash = n => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const FONT = "Inter, 'Liberation Sans', sans-serif", MONO = "'JetBrains Mono', monospace";

const cv = document.createElement('canvas').getContext('2d');
function mw(s, size, wt = 900, fam = 'Inter') { cv.font = `${wt} ${size}px ${fam}`; return cv.measureText(s).width; }

function txt(x, y, s, size, o = {}) {
  return `<text x="${f(x)}" y="${f(y)}" font-family="${o.mono ? MONO : FONT}" font-weight="${o.w || 900}" font-size="${size}" fill="${o.fill || K}" text-anchor="${o.anchor || 'start'}"` +
    `${o.ls ? ` letter-spacing="${o.ls}"` : ''}${o.op != null ? ` opacity="${o.op}"` : ''}${o.rot ? ` transform="rotate(${o.rot} ${f(x)} ${f(y)})"` : ''}>${s.replace(/&/g, '&amp;')}</text>`;
}
// pop-in about a point
function pop(x, y, p, content) {
  if (p <= 0) return '';
  const s = eBack(p);
  return `<g opacity="${clamp(p * 3).toFixed(2)}" transform="translate(${f(x)} ${f(y)}) scale(${s.toFixed(3)}) translate(${f(-x)} ${f(-y)})">${content}</g>`;
}
function drawPath(d, p, stroke, w, extra = '') {
  if (p <= 0) return '';
  return `<path d="${d}" pathLength="1" stroke-dasharray="1 1" stroke-dashoffset="${(1 - p).toFixed(4)}" fill="none" stroke="${stroke}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`;
}
const poly = (pts, fill, extra = '') => `<polygon points="${pts.map(p => f(p[0]) + ',' + f(p[1])).join(' ')}" fill="${fill}" ${extra}/>`;
function torn(x1, y1, x2, y2, thick, seed, fill, extra = '') {
  const n = 44, a = [], b = [], dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy), nx = -dy / L, ny = dx / L;
  for (let i = 0; i <= n; i++) {
    const t = i / n, j1 = (hash(seed + i) - .5) * 16, j2 = (hash(seed + i + 99) - .5) * 16;
    a.push([x1 + dx * t + nx * (-thick / 2 + j1), y1 + dy * t + ny * (-thick / 2 + j1)]);
    b.push([x1 + dx * t + nx * (thick / 2 + j2), y1 + dy * t + ny * (thick / 2 + j2)]);
  }
  return poly(a.concat(b.reverse()), fill, extra);
}
function card(x, y, w, h, rot, fill, inner, sc = 1) {
  return `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(rot)}) scale(${sc.toFixed(3)})" filter="url(#sh)"><rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" fill="${fill}" stroke="${WH}" stroke-width="12"/>${inner}</g>`;
}
const tape = (x, y, rot, col = Y) => `<rect x="${f(x - 60)}" y="${f(y - 18)}" width="120" height="36" fill="${col}" opacity=".85" transform="rotate(${rot} ${f(x)} ${f(y)})"/>`;

// ---- rich text: *keywords* get a highlighter bar; words pop in one by one ----
function parse(s) {
  const out = []; let hl = false;
  s.split(/(\*)/).forEach(part => { if (part === '*') { hl = !hl; return; } part.split(' ').filter(Boolean).forEach(w => out.push({ w, hl })); });
  return out;
}
function rich(cx, y, s, size, u, t0, o = {}) {
  const ws = parse(s), sp = mw(' ', size, o.wt || 900), stg = o.stg || .07;
  const wd = ws.map(w => mw(w.w, size, o.wt || 900)), total = wd.reduce((a, b) => a + b, 0) + sp * (ws.length - 1);
  let x = o.left != null ? o.left : cx - total / 2, g = '';
  ws.forEach((w, i) => {
    const p = pr(u, t0 + i * stg, t0 + i * stg + .28), px = x;
    x += wd[i] + sp;
    if (p <= 0) return;
    const e = eOut(p), nextHl = ws[i + 1] && ws[i + 1].hl;
    if (w.hl) g += `<rect x="${f(px - 8)}" y="${f(y - size * .84)}" width="${f((wd[i] + 16 + (nextHl ? sp : 0)) * e)}" height="${f(size * 1.04)}" fill="${o.hl || Y}" transform="rotate(-.8 ${f(px)} ${f(y)})"/>`;
    g += `<text x="${f(px)}" y="${f(y + (1 - e) * 26)}" font-family="${FONT}" font-weight="${o.wt || 900}" font-size="${size}" fill="${w.hl ? K : (o.fill || K)}" opacity="${e.toFixed(2)}">${w.w.replace(/&/g, '&amp;')}</text>`;
  });
  return g;
}
function hlText(x, y, s, size, p, o = {}) { // single phrase with highlighter wipe behind it
  const w = mw(s, size, o.wt || 900);
  return `<rect x="${f(x - 10)}" y="${f(y - size * .84)}" width="${f((w + 20) * eOut(p))}" height="${f(size * 1.04)}" fill="${o.hl || Y}" transform="rotate(-1 ${f(x)} ${f(y)})"/>` + txt(x, y, s, size, { fill: o.fill || K });
}

// ---- collage backdrop, per-scene colour fields ----
const BACK = [[R, 'dotsR'], [C, 'dotsC'], [Y, 'dotsY'], [R, 'dotsR'], [C, 'dotsC'], [Y, 'dotsY'], [R, 'dotsR'], [C, 'dotsC'], [Y, 'dotsY'], [C, 'dotsC'], [Y, 'dotsY'], [R, 'dotsR']];
function backdrop(i, u) {
  const [col, dots] = BACK[i], dr = Math.sin(u * .35) * 14;
  let g = torn(-200, 880 + dr, 2100, 560 - dr, 200, i * 17, col, 'opacity=".9"');
  g += torn(-200, 150 - dr, 2100, 40 + dr, 90, i * 31 + 5, col, 'opacity=".28"');
  g += `<circle cx="${i % 2 ? 1750 : 170}" cy="${i % 2 ? 190 : 900}" r="230" fill="url(#${dots})" opacity=".55"/>`;
  g += `<circle cx="${i % 2 ? 150 : 1780}" cy="${i % 2 ? 840 : 220}" r="120" fill="url(#dotsK)" opacity=".16"/>`;
  return g;
}

// ---- chrome: kicker, progress bar, captions, transition wipes ----
const TITLES = ['THE SWITCH', 'FIRST SIGNS', 'BEHIND THE SCENES', 'THE SLOWDOWN', 'WHAT STILL WORKS', 'THE TWIST', 'COLLAPSE?', 'HANDED OVER', 'REDISCOVERY', 'CONNECTION', 'DAY SEVEN', 'THE END'];
function kicker(i, u) {
  const p = eOut(pr(u, .1, .6)), s = `${String(i + 1).padStart(2, '0')}  /  ${TITLES[i]}`, w = mw(s, 30, 800, 'JetBrains Mono') + 44;
  return `<g transform="translate(${f(60 - (1 - p) * (w + 80))} 56)"><rect x="0" y="0" width="${f(w)}" height="58" fill="${K}"/><rect x="0" y="52" width="${f(w)}" height="8" fill="${R}"/>` +
    txt(22, 40, s, 30, { fill: I, mono: true, w: 800 }) + '</g>';
}
function caption(lines, u) {
  const L = lines.find(l => u >= l[0] && u < l[1]); if (!L) return '';
  const [a, b, s] = L, ws = parse(s), size = 50, sp = mw(' ', size, 800);
  const wd = ws.map(w => mw(w.w, size, 800)), total = wd.reduce((x, y) => x + y, 0) + sp * (ws.length - 1);
  const rows = total > 1480 ? [ws.slice(0, Math.ceil(ws.length / 2)), ws.slice(Math.ceil(ws.length / 2))] : [ws];
  const fade = clamp((b - u) / .18) * clamp((u - a) / .08 + .2), rowW = r => r.reduce((x, w) => x + mw(w.w, size, 800), 0) + sp * (r.length - 1);
  const bw = Math.max(...rows.map(rowW)) + 90, bh = rows.length * 66 + 30, by = 1010 - bh;
  let g = `<g opacity="${fade.toFixed(2)}"><rect x="${f(960 - bw / 2)}" y="${f(by)}" width="${f(bw)}" height="${bh}" rx="10" fill="${K}" opacity=".93"/>`;
  let k = 0;
  rows.forEach((r, ri) => {
    let x = 960 - rowW(r) / 2; const y = by + 62 + ri * 66;
    r.forEach(w => {
      const wdt = mw(w.w, size, 800), p = pr(u, a + k * .06, a + k * .06 + .2); k++;
      const nx = r[r.indexOf(w) + 1]; // eslint-disable-line
      if (w.hl) g += `<rect x="${f(x - 7)}" y="${f(y - size * .82)}" width="${f((wdt + 14 + (nx && nx.hl ? sp : 0)) * eOut(p))}" height="${f(size * 1.02)}" fill="${Y}"/>`;
      g += `<text x="${f(x)}" y="${f(y + (1 - eOut(p)) * 14)}" font-family="${FONT}" font-weight="800" font-size="${size}" fill="${w.hl ? K : I}" opacity="${eOut(p).toFixed(2)}">${w.w.replace(/&/g, '&amp;')}</text>`;
      x += wdt + sp;
    });
  });
  return g + '</g>';
}
const WIPE_COLS = [Y, R, C, K, Y, R, C, K, Y, R, C];
function wipe(t) {
  const k = Math.round(t / SCENE_LEN); if (k <= 0 || k >= N_SCENES) return '';
  const d = .36, dt = t - k * SCENE_LEN; if (Math.abs(dt) > d) return '';
  const p = eIO((dt + d) / (2 * d)), cx = lerp(-1550, 3470, p), col = WIPE_COLS[k - 1];
  const band = (c, off, w) => poly([[cx + off - w + 220, -10], [cx + off + w + 220, -10], [cx + off + w - 220, 1090], [cx + off - w - 220, 1090]], c);
  return band(K, -120, 1250) + band(col, 0, 1250) + `<g opacity=".25">${band('url(#dotsK)', 0, 1250)}</g>`;
}
