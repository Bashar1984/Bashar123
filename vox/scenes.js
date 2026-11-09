// 12 scenes x 12 s. Each returns SVG for local time u (0..12).
const CAPS = [
  [[.4, 4.0, 'What if *every AI system* on Earth suddenly stopped?'], [4.2, 6.8, 'No warning. No *countdown.*'], [7.0, 11.6, "Just one moment when the world's smartest machines went *silent.*"]],
  [[.4, 4.4, "At first, you'd notice missing *chatbots,*"], [4.5, 8.2, 'broken *recommendations,* and smart tools going offline.'], [8.5, 11.6, 'Annoying. *Not catastrophic.*']],
  [[.4, 3.8, 'But the real disruption would be happening *behind the scenes.*'], [4.0, 8.2, '*Banks, hospitals, warehouses* and transport networks use AI for big decisions.'], [8.4, 11.6, 'Some services slow down. Others need *humans to take over.*']],
  [[.4, 4.2, 'Companies would scramble to restore *manual workflows.*'], [4.4, 9.0, 'Tasks that took *seconds* could take *hours.*'], [9.2, 11.6, "The world wouldn't stop. It would *crawl.*"]],
  [[.4, 4.4, 'But most *computers, electricity,* and the *internet* would still work.'], [4.6, 8.6, 'Only one layer of the stack would go *dark.*'], [8.8, 11.6, 'The foundations are still *standing.*']],
  [[.4, 4.4, "Here's the twist. AI disappearing wouldn't erase *human knowledge.*"], [4.6, 8.0, 'Doctors could still *diagnose.* Engineers could still *build.*'], [8.2, 11.6, "We'd lose *speed,* not intelligence itself."]],
  [[.4, 3.6, 'So would civilization *collapse?*'], [3.8, 7.6, '*Probably not.*'], [7.8, 11.6, 'It would be a *rough stretch,* not the end of the world.']],
  [[.4, 5.0, 'But the shutdown would reveal something *uncomfortable:*'], [5.2, 11.6, "how much of modern life we've *already handed over* to machines."]],
  [[.4, 4.6, "So people did something they'd almost forgotten. They *opened a map.*"], [4.8, 8.0, 'They asked a *neighbor.*'], [8.2, 11.6, 'They *wrote it down.*']],
  [[.4, 4.6, 'Cities grew *louder,* but *kinder.*'], [4.8, 8.4, 'Radios crackled. Children learned to *count on their fingers* again.'], [8.6, 11.6, 'Strangers became *guides.*']],
  [[.4, 4.6, 'On the *seventh day,* the machines woke up.'], [4.8, 8.6, "But something had changed. We didn't need them less."], [8.8, 11.6, 'We needed *ourselves more.*']],
  [],
];

// retime caption windows to the ElevenLabs narration (voice.js: clip start/duration per scene)
if (typeof VOICE !== 'undefined') CAPS.forEach((sc, i) => {
  if (!sc.length) return;
  const v = VOICE[i], w = sc.map(l => l[2].replace(/\*/g, '').length + 4), tot = w.reduce((a, b) => a + b, 0);
  let t = v.start - .1;
  sc.forEach((l, k) => { const d = v.dur * w[k] / tot; l[0] = t; l[1] = k === sc.length - 1 ? v.start + v.dur + .5 : t + d; t += d; });
});
const VS = i => (typeof VOICE !== 'undefined' ? VOICE[i] : { start: .4, dur: 8 });

// ---------- small props ----------
const person = (x, y, s, body, head = '#E9C7A1', extra = '') => `<g transform="translate(${f(x)} ${f(y)}) scale(${s})"><g stroke="${WH}" stroke-width="10" stroke-linejoin="round"><rect x="-46" y="-10" width="92" height="140" rx="38" fill="${body}"/><circle cx="0" cy="-52" r="38" fill="${head}"/></g>${extra}</g>`;
const bolt = (x, y, s, col) => `<g transform="translate(${f(x)} ${f(y)}) scale(${s})">${poly([[20, -110], [-60, 20], [-5, 20], [-25, 110], [65, -30], [8, -30]], col, `stroke="${K}" stroke-width="8" stroke-linejoin="round"`)}</g>`;
const check = (x, y, s, p) => drawPath(`M${f(x - 40 * s)},${f(y)} L${f(x - 10 * s)},${f(y + 34 * s)} L${f(x + 46 * s)},${f(y - 36 * s)}`, p, C, 22 * s);
const cross = (x, y, s, p, col = R) => drawPath(`M${f(x - 36 * s)},${f(y - 36 * s)} L${f(x + 36 * s)},${f(y + 36 * s)}`, clamp(p * 2), col, 20 * s) + drawPath(`M${f(x + 36 * s)},${f(y - 36 * s)} L${f(x - 36 * s)},${f(y + 36 * s)}`, clamp(p * 2 - 1), col, 20 * s);
const pill = (x, y, s, fill, col, size = 30) => { const w = mw(s, size, 800, 'JetBrains Mono') + 40; return `<rect x="${f(x - w / 2)}" y="${f(y - size * .85)}" width="${f(w)}" height="${f(size * 1.5)}" rx="${f(size * .75)}" fill="${fill}"/>` + txt(x, y + size * .1, s, size, { fill: col, anchor: 'middle', mono: true, w: 800 }); };
const stampBox = (x, y, s, size, rot, col, p) => p <= 0 ? '' : `<g opacity="${clamp(p * 4).toFixed(2)}" transform="translate(${f(x)} ${f(y)}) rotate(${rot}) scale(${(1 + (1 - eOut(p)) * .6).toFixed(3)})"><rect x="${f(-mw(s, size) / 2 - 30)}" y="${f(-size * .92)}" width="${f(mw(s, size) + 60)}" height="${f(size * 1.25)}" fill="none" stroke="${col}" stroke-width="12"/>${txt(0, 0, s, size, { fill: col, anchor: 'middle' })}</g>`;

// ---------- 1  THE SWITCH ----------
function S1(u) {
  const cx = 560, cy = 520, slam = 9.3, after = u > slam;
  let g = '';
  const sh = u > slam && u < slam + .5 ? (1 - (u - slam) / .5) * 14 : 0;
  g += `<g transform="translate(${f(Math.sin(u * 90) * sh)} ${f(Math.cos(u * 70) * sh)})">`;
  g += `<circle cx="${cx}" cy="${cy}" r="${f(430 + (after ? pr(u, slam, 9) * 700 : 0))}" fill="url(#${after ? 'dotsK' : 'dotsR'})" opacity="${after ? .3 : .45}"/>`;
  const sweep = Math.pow(pr(u, .3, slam), 1.7), sec = Math.min(59, Math.floor(60 * sweep));
  const mAng = after ? lerp(354, 360, eBack(pr(u, slam, slam + .5))) : 354, hAng = after ? 270 : 269.5;
  const hand = (a, len, w, col) => `<line x1="${cx}" y1="${cy}" x2="${f(cx + Math.sin(a * Math.PI / 180) * len)}" y2="${f(cy - Math.cos(a * Math.PI / 180) * len)}" stroke="${col}" stroke-width="${w}" stroke-linecap="round"/>`;
  let face = `<circle cx="${cx}" cy="${cy}" r="300" fill="${WH}" stroke="${K}" stroke-width="18"/>`;
  for (let i = 0; i < 60; i++) { const a = i * 6 * Math.PI / 180, big = i % 5 === 0, r1 = big ? 250 : 272; face += `<line x1="${f(cx + Math.sin(a) * r1)}" y1="${f(cy - Math.cos(a) * r1)}" x2="${f(cx + Math.sin(a) * 288)}" y2="${f(cy - Math.cos(a) * 288)}" stroke="${K}" stroke-width="${big ? 10 : 4}"/>`; }
  face += hand(hAng, 150, 22, K) + hand(mAng, 230, 14, K) + hand(360 * sweep, 255, 6, R) + `<circle cx="${cx}" cy="${cy}" r="18" fill="${R}"/>`;
  g += `<g filter="url(#sh)">${face}</g>`;
  if (u > slam && u < slam + 1.2) { const p = pr(u, slam, slam + 1.2); g += `<circle cx="${cx}" cy="${cy}" r="${f(300 + p * 900)}" fill="none" stroke="${R}" stroke-width="${f(24 * (1 - p) + 2)}" opacity="${(1 - p).toFixed(2)}"/>`; }
  // headline
  const L = (s, y, t0, o = {}) => { const p = pr(u, t0, t0 + .4); return p <= 0 ? '' : pop(1010, y, p, o.hl ? hlText(1010, y, s, 150, pr(u, t0 + .3, t0 + .9), o) : txt(1010, y, s, 150, o)); };
  g += L('WHAT IF', 300, .3) + L('ALL AI', 470, .8, { hl: Y }) + L('STOPPED?', 640, 1.3);
  g += drawPath('M1010,672 q150,22 280,4 t250,0', pr(u, 1.9, 2.5), R, 12);
  const clock = after ? '09:00:00' : `08:59:${String(sec).padStart(2, '0')}`;
  g += card(1290, 752, 560, 110, 0, K, txt(0, 28, clock, 78, { fill: after ? R : Y, anchor: 'middle', mono: true, w: 800 }));
  g += stampBox(1600, 118, 'SILENCE', 84, -5, R, pr(u, slam + .5, slam + 1.0));
  return g + '</g>';
}

// ---------- 2  FIRST SIGNS ----------
function phoneShell(x, y, s, inner, dead, tilt = 0) {
  return `<g transform="translate(${f(x)} ${f(y)}) rotate(${tilt}) scale(${s})" filter="url(#sh)"><rect x="-130" y="-250" width="260" height="500" rx="36" fill="${K}" stroke="${WH}" stroke-width="12"/><rect x="-112" y="-226" width="224" height="452" rx="18" fill="${dead ? '#141414' : WH}"/>` +
    (dead ? '<path d="M-70,-150 L60,130" stroke="#262626" stroke-width="8"/>' : inner) + `<rect x="-30" y="-242" width="60" height="10" rx="5" fill="#555"/></g>`;
}
function S2(u) {
  let g = '';
  const dies = [4.4, 6.0, 7.4], xs = [400, 960, 1520];
  const chat = (() => {
    let s = '';
    [[-190, 150, C, 1], [-120, 170, '#D8CFBF', 0], [-50, 130, C, 1], [20, 180, '#D8CFBF', 0]].forEach(([y, w, c, r], i) => {
      const p = pr(u, .9 + i * .55, 1.2 + i * .55), xx = r ? 100 - w : -100;
      if (p > 0) s += `<rect x="${xx}" y="${y}" width="${w}" height="46" rx="22" fill="${c}" opacity="${p.toFixed(2)}"/><rect x="${xx + 18}" y="${y + 19}" width="${w - 36}" height="8" rx="4" fill="${r ? WH : '#7a7468'}" opacity="${p.toFixed(2)}"/>`;
    });
    const dots = [0, 1, 2].map(k => `<circle cx="${-70 + k * 26}" cy="120" r="8" fill="#9a9488" opacity="${(.4 + .6 * Math.max(0, Math.sin(u * 8 - k))).toFixed(2)}"/>`).join('');
    return s + dots;
  })();
  const recs = (() => {
    let s = '';
    for (let i = 0; i < 6; i++) { const cx = -62 + (i % 2) * 124, cy = -150 + Math.floor(i / 3) * 0 + Math.floor(i / 2) * 118, pp = pr(u, 1.2 + i * .2, 1.6 + i * .2); if (pp > 0) s += `<rect x="${cx - 54}" y="${cy - 50}" width="108" height="100" rx="8" fill="${[R, Y, C, K, C, R][i]}" opacity="${pp.toFixed(2)}"/><path d="M${cx - 12},${cy - 18} v36 l30,-18 z" fill="${WH}" opacity="${pp.toFixed(2)}"/>`; }
    return s + `<rect x="-108" y="${f(-203 + Math.floor(u * 1.3) % 3 * 118)}" width="216" height="106" rx="10" fill="none" stroke="${Y}" stroke-width="7"/>`;
  })();
  const voice = (() => {
    let s = `<circle cx="0" cy="-30" r="${f(70 + Math.sin(u * 6) * 8)}" fill="${C}" opacity=".35"/><circle cx="0" cy="-30" r="50" fill="${C}"/>`;
    for (let k = 0; k < 11; k++) s += `<rect x="${-90 + k * 18}" y="${f(110 - (20 + 40 * Math.abs(Math.sin(u * 7 + k * 1.3))) / 2)}" width="10" height="${f(20 + 40 * Math.abs(Math.sin(u * 7 + k * 1.3)))}" rx="5" fill="${R}"/>`;
    return s + `<path d="M-16,-45 v30 M0,-55 v50 M16,-45 v30" stroke="${WH}" stroke-width="9" stroke-linecap="round"/>`;
  })();
  [chat, recs, voice].forEach((inner, i) => {
    const dead = u > dies[i], tilt = [-4, 2, 5][i], p = pr(u, .2 + i * .2, .7 + i * .2);
    g += pop(xs[i], 480, p, phoneShell(xs[i], 480, 1.25, inner, dead, tilt));
    if (dead) g += cross(xs[i], 480, 2.2, pr(u, dies[i], dies[i] + .5), R);
    if (dead && u < dies[i] + .5) g += `<rect x="${xs[i] - 160}" y="170" width="320" height="620" fill="${WH}" opacity="${(1 - pr(u, dies[i], dies[i] + .5)).toFixed(2)}"/>`;
    g += pop(xs[i], 835, pr(u, 1.2 + i * .25, 1.7 + i * .25), card(xs[i], 835, 330, 66, [-2, 1.5, -1][i], K, txt(0, 11, ['CHATBOTS', 'RECOMMENDATIONS', 'SMART TOOLS'][i], 25, { fill: I, anchor: 'middle', mono: true, w: 800 })));
  });
  g += stampBox(960, 440, 'OFFLINE', 230, -6, R, pr(u, 8.0, 8.6));
  return g;
}

// ---------- 3  BEHIND THE SCENES ----------
const ICON = {
  bank: s => `<g transform="scale(${s})"><path d="M-70,-20 L0,-70 L70,-20 Z" fill="${K}"/><rect x="-62" y="-12" width="14" height="62" fill="${K}"/><rect x="-24" y="-12" width="14" height="62" fill="${K}"/><rect x="10" y="-12" width="14" height="62" fill="${K}"/><rect x="48" y="-12" width="14" height="62" fill="${K}"/><rect x="-76" y="56" width="152" height="14" fill="${K}"/></g>`,
  hospital: s => `<g transform="scale(${s})"><rect x="-64" y="-64" width="128" height="128" rx="10" fill="${K}"/><rect x="-12" y="-44" width="24" height="88" fill="${R}"/><rect x="-44" y="-12" width="88" height="24" fill="${R}"/></g>`,
  warehouse: s => `<g transform="scale(${s})"><path d="M-80,-10 L0,-64 L80,-10 V64 H-80 Z" fill="${K}"/><rect x="-52" y="8" width="40" height="40" fill="${Y}"/><rect x="-4" y="8" width="40" height="40" fill="${C}"/><rect x="-28" y="-30" width="40" height="38" fill="${R}"/></g>`,
  plane: s => `<g transform="scale(${s}) rotate(-18)"><rect x="-80" y="-12" width="160" height="26" rx="13" fill="${K}"/>${poly([[-10, -8], [-50, -64], [-24, -64], [30, -8]], K)}${poly([[-10, 12], [-50, 68], [-24, 68], [30, 12]], K)}${poly([[-80, -8], [-96, -36], [-72, -36], [-52, -8]], K)}</g>`,
};
function S3(u) {
  const hx = 960, hy = 465, dead = u > 6, flick = dead && u < 7 && Math.sin(u * 60) > 0;
  const nodes = [[400, 300, 'BANK', 'bank'], [1520, 300, 'HOSPITAL', 'hospital'], [400, 630, 'WAREHOUSE', 'warehouse'], [1520, 630, 'TRANSPORT', 'plane']];
  let g = '';
  nodes.forEach(([x, y], i) => {
    const p = pr(u, .5 + i * .25, 1.2 + i * .25);
    if (p > 0) g += `<line x1="${hx}" y1="${hy}" x2="${x}" y2="${y}" stroke="${dead ? '#777' : C}" stroke-width="10" stroke-dasharray="${dead ? '14 34' : '26 16'}" stroke-dashoffset="${f(dead ? 0 : -u * 70)}" stroke-linecap="round" opacity="${p.toFixed(2)}"/>`;
  });
  nodes.forEach(([x, y, label, ic], i) => {
    const p = pr(u, .4 + i * .3, 1.0 + i * .3), tOff = 6.5 + i * .7, off = u > tOff;
    const inner = `<g transform="translate(-135 -8)">${ICON[ic](1)}</g>${txt(-40, 0, label, 42, { fill: K })}`;
    g += pop(x, y, p, card(x, y, 440, 230, [-2, 2, 2, -2][i], WH, inner));
    const bp = off ? pr(u, tOff, tOff + .3) : pr(u, 1.4 + i * .3, 1.7 + i * .3);
    g += bp > 0 ? pop(x, y + 148, off ? bp : bp, off ? pill(x, y + 148, 'HUMANS NEEDED', R, WH, 30) : pill(x, y + 148, 'AI: ON', C, WH, 30)) : '';
  });
  const hp = pr(u, .1, .6);
  g += pop(hx, hy, hp, `<circle cx="${hx}" cy="${hy}" r="140" fill="${dead ? '#3a3a3a' : C}" stroke="${WH}" stroke-width="12" filter="url(#sh)" opacity="${flick ? .3 : 1}"/><circle cx="${hx}" cy="${hy}" r="128" fill="url(#dotsK)" opacity=".35"/>${txt(hx, hy + 38, 'AI', 118, { fill: WH, anchor: 'middle' })}`);
  if (dead) g += drawPath(`M${hx - 100},${hy + 80} L${hx + 100},${hy - 80}`, pr(u, 6.0, 6.4), R, 16);
  g += txt(960, 160, 'WHERE AI QUIETLY DECIDES', 46, { anchor: 'middle', mono: true, w: 800, op: pr(u, .2, .7) });
  return g;
}

// ---------- 4  THE SLOWDOWN ----------
function S4(u) {
  const base = 770; let g = '';
  g += `<rect x="330" y="${base}" width="1260" height="12" fill="${K}" opacity="${pr(u, 0, .5)}"/>`;
  g += pop(580, 215, pr(u, .3, .8), pill(470, 215, 'WITH AI', C, WH, 30) + pill(700, 215, 'MANUAL', R, WH, 30));
  const tasks = [['Approve a loan', 560, 400], ['Route a delivery', 960, 470], ['Read a scan', 1360, 340]];
  tasks.forEach(([name, x, hM], i) => {
    const t0 = 1.6 + i * .8, hA = 34 * eOut(pr(u, t0, t0 + .5)), hm = hM * eIO(pr(u, t0 + .6, t0 + 3.2 + i * .3));
    g += `<rect x="${x - 125}" y="${f(base - hA)}" width="110" height="${f(hA)}" fill="${C}" stroke="${K}" stroke-width="5"/>`;
    g += `<rect x="${x + 15}" y="${f(base - hm)}" width="110" height="${f(hm)}" fill="${R}" stroke="${K}" stroke-width="5"/><rect x="${x + 15}" y="${f(base - hm)}" width="110" height="${f(hm)}" fill="url(#dotsK)" opacity=".18"/>`;
    g += txt(x, base + 56, name, 32, { anchor: 'middle', mono: true, w: 700, op: pr(u, t0, t0 + .4) });
    if (u > t0 + .3) g += txt(x - 70, base - hA - 14, 'sec', 28, { anchor: 'middle', mono: true, w: 800, fill: C, op: pr(u, t0 + .3, t0 + .7) });
    if (u > t0 + 3.2 + i * .3) g += pop(x + 70, base - hM - 24, pr(u, t0 + 3.2 + i * .3, t0 + 3.6 + i * .3), txt(x + 70, base - hM - 24, 'HOURS', 36, { anchor: 'middle', fill: R }));
  });
  const ck = 1700, ckY = 400, spin = u * 900 * Math.exp(-pr(u, 2, 9) * 1.5) + u * 30;
  g += pop(ck, ckY, pr(u, .5, 1.0), card(ck, ckY, 250, 250, 4, WH, `<circle r="92" fill="none" stroke="${K}" stroke-width="12"/><line x1="0" y1="0" x2="0" y2="-70" stroke="${K}" stroke-width="12" stroke-linecap="round" transform="rotate(${f(spin / 12)})"/><line x1="0" y1="0" x2="0" y2="-82" stroke="${R}" stroke-width="7" stroke-linecap="round" transform="rotate(${f(spin)})"/><circle r="12" fill="${R}"/>`));
  g += drawPath('M560,690 C700,560 900,440 1100,330', pr(u, 5.8, 6.6), K, 8, 'marker-end="none"') + (u > 6.5 ? poly([[1100, 330], [1060, 340], [1086, 370]], K) : '');
  g += txt(1600, 800 + 90, 'Illustrative', 26, { anchor: 'end', mono: true, w: 500, op: .7 });
  return g;
}

// ---------- 5  WHAT STILL WORKS ----------
const monitor = (s) => `<g transform="scale(${s})"><rect x="-84" y="-66" width="168" height="112" rx="10" fill="${K}"/><rect x="-70" y="-54" width="140" height="88" fill="${C}"/><rect x="-14" y="46" width="28" height="24" fill="${K}"/><rect x="-50" y="70" width="100" height="12" rx="6" fill="${K}"/></g>`;
const wifi = (s) => `<g transform="scale(${s})" fill="none" stroke="${K}" stroke-width="16" stroke-linecap="round"><path d="M-78,-14 A110,110 0 0,1 78,-14"/><path d="M-52,18 A74,74 0 0,1 52,18"/><path d="M-26,50 A38,38 0 0,1 26,50"/><circle cx="0" cy="76" r="9" fill="${K}"/></g>`;
function S5(u) {
  let g = '';
  const defs = [['COMPUTERS', 420, s => monitor(s)], ['ELECTRICITY', 960, s => `<g transform="scale(${s})">${poly([[20, -76], [-52, 14], [-4, 14], [-22, 76], [52, -22], [4, -22]], Y, `stroke="${K}" stroke-width="9" stroke-linejoin="round"`)}</g>`], ['INTERNET', 1500, s => wifi(s)]];
  const cardsP = 1 - pr(u, 6.6, 7.1);
  if (cardsP > 0) defs.forEach(([name, x, icon], i) => {
    const t0 = .6 + i * 1.3, p = pr(u, t0, t0 + .5) * cardsP;
    g += pop(x, 470, p, card(x, 470, 400, 480, [-2, 1.5, -1.5][i], WH, `<g transform="translate(0 -60)">${icon(1.6)}</g>${txt(0, 150, name, 44, { anchor: 'middle' })}`, cardsP));
    if (u > t0 + .6) { g += check(x, 330, 1.2, pr(u, t0 + .6, t0 + 1.1)); g += pill(x, 775, 'STILL ON', C, WH, 28); }
  });
  // the stack
  const sp = pr(u, 7.0, 7.6);
  if (sp > 0) {
    const layers = [['ELECTRICITY', Y, K], ['INTERNET', C, WH], ['COMPUTERS', K, I], ['AI LAYER', null, R]];
    layers.forEach(([name, fill, tc], i) => {
      const y = 740 - i * 125, p = pr(u, 7.0 + i * .22, 7.5 + i * .22), last = i === 3, off = last && u > 8.6;
      const body = last ? `<rect x="-420" y="-52" width="840" height="104" fill="none" stroke="${off ? '#777' : R}" stroke-width="10" stroke-dasharray="26 16"/>${txt(0, 20, name, 52, { anchor: 'middle', fill: off ? '#777' : R })}${off ? `<line x1="-330" y1="0" x2="330" y2="0" stroke="${R}" stroke-width="12"/>` : ''}`
        : `<rect x="-420" y="-52" width="840" height="104" fill="${fill}" stroke="${WH}" stroke-width="10"/><rect x="-420" y="-52" width="840" height="104" fill="url(#dotsK)" opacity=".12"/>${txt(0, 20, name, 52, { anchor: 'middle', fill: tc })}`;
      g += p > 0 ? `<g transform="translate(960 ${f(y - (1 - eOut(p)) * -60)})" opacity="${p.toFixed(2)}" filter="url(#sh)">${body}</g>` : '';
    });
    g += hlText(1500, 385, 'ONLY THIS', 54, pr(u, 8.8, 9.4)) + drawPath('M1490,370 C1440,370 1420,365 1390,365', pr(u, 9.2, 9.6), R, 9);
  }
  return g;
}

// ---------- 6  THE TWIST ----------
function S6(u) {
  let g = '';
  g += pop(960, 200, pr(u, .1, .6), `<text x="960" y="215" font-family="${FONT}" font-weight="900" font-size="120" text-anchor="middle" fill="${K}">THE TWIST</text>`);
  // doctor
  g += pop(480, 560, pr(u, .8, 1.3), card(480, 560, 420, 520, -2, C, `<rect x="-210" y="-260" width="420" height="520" fill="url(#dotsK)" opacity=".15"/>${person(0, 20, 1.9, WH, '#E9C7A1', `<path d="M-30,-14 C-70,60 20,90 30,30" fill="none" stroke="${K}" stroke-width="8"/><circle cx="30" cy="30" r="12" fill="${R}"/>`)}${pill(0, -222, 'DOCTORS', K, WH, 34)}`));
  // engineer
  g += pop(1440, 560, pr(u, 1.2, 1.7), card(1440, 560, 420, 520, 2, Y, `<rect x="-210" y="-260" width="420" height="520" fill="url(#dotsK)" opacity=".15"/><path d="M-170,-110 Q0,-230 170,-110" fill="none" stroke="${K}" stroke-width="8"/><path d="M-170,-110 H170" stroke="${K}" stroke-width="8"/>${[-120, -60, 0, 60, 120].map(x => `<line x1="${x}" y1="-110" x2="${x}" y2="${-110 - (170 - Math.abs(x)) * .26}" stroke="${K}" stroke-width="4"/>`).join('')}${person(0, 45, 1.9, R, '#E9C7A1', `<path d="M-42,-70 a42,38 0 0,1 84,0 z" fill="${Y}" stroke="${K}" stroke-width="6"/><rect x="-56" y="-72" width="112" height="10" fill="${Y}" stroke="${K}" stroke-width="5"/>`)}${pill(0, -222, 'ENGINEERS', K, WH, 34)}`));
  // meters
  const lose = eIO(pr(u, 8.3, 10.3)), speed = lerp(1, .32, lose);
  g += `<g filter="url(#sh)"><rect x="770" y="330" width="380" height="470" fill="${WH}" stroke="${WH}" stroke-width="10"/></g>`;
  [[850, 'SPEED', R, speed], [1070, 'KNOWLEDGE', C, 1]].forEach(([x, name, col, v]) => {
    g += `<rect x="${x - 40}" y="380" width="80" height="360" fill="#E3D8C3"/><rect x="${x - 40}" y="${f(740 - 360 * v)}" width="80" height="${f(360 * v)}" fill="${col}"/><rect x="${x - 40}" y="${f(740 - 360 * v)}" width="80" height="${f(360 * v)}" fill="url(#dotsK)" opacity=".15"/>`;
    g += txt(x, 774, name, 24, { anchor: 'middle', mono: true, w: 800 });
  });
  if (u > 8.3) g += pop(850, 335, pr(u, 8.3, 8.8), txt(850, 330, '▼', 36, { anchor: 'middle', fill: R })) + pop(1070, 335, pr(u, 8.3, 8.8), txt(1070, 330, '=', 44, { anchor: 'middle', fill: C }));
  return g;
}

// ---------- 7  COLLAPSE? ----------
function arc(cx, cy, r, a1, a2) { const p = a => [cx + Math.cos(a) * r, cy + Math.sin(a) * r]; const [x1, y1] = p(a1), [x2, y2] = p(a2); return `M${f(x1)},${f(y1)} A${r},${r} 0 0,1 ${f(x2)},${f(y2)}`; }
function S7(u) {
  const cx = 960, cy = 815, r = 400; let g = '';
  g += rich(960, 225, 'WILL CIVILIZATION *COLLAPSE?*', 92, u, .2, { stg: .09 });
  const zp = pr(u, .6, 1.4);
  [[R, 0, 1 / 3, 'COLLAPSE'], [Y, 1 / 3, 2 / 3, 'DISRUPTION'], [C, 2 / 3, 1, 'BUSINESS AS USUAL']].forEach(([col, a, b, name]) => {
    if (zp <= 0) return;
    g += `<path d="${arc(cx, cy, r, Math.PI * (1 + a) + .012, Math.PI * (1 + b) - .012)}" fill="none" stroke="${col}" stroke-width="84" opacity="${zp.toFixed(2)}"/>`;
    const m = Math.PI * (1 + (a + b) / 2);
    g += `<text font-family="${MONO}" font-weight="800" font-size="25" fill="${K}" text-anchor="middle" opacity="${zp.toFixed(2)}" transform="translate(${f(cx + Math.cos(m) * (r + 78))} ${f(cy + Math.sin(m) * (r + 78))}) rotate(${f((m * 180 / Math.PI) + 90)})">${name}</text>`;
  });
  const t = u - 3.6, v = u < 3.6 ? .07 + .025 * Math.sin(u * 14) : .4 + (.07 - .4) * Math.exp(-2.6 * t) * Math.cos(9 * t);
  const ang = Math.PI * (1 + v);
  g += `<g filter="url(#sh)"><line x1="${cx}" y1="${cy}" x2="${f(cx + Math.cos(ang) * (r - 20))}" y2="${f(cy + Math.sin(ang) * (r - 20))}" stroke="${K}" stroke-width="16" stroke-linecap="round"/><circle cx="${cx}" cy="${cy}" r="38" fill="${K}" stroke="${WH}" stroke-width="10"/></g>`;
  g += stampBox(960, 700, 'PROBABLY NOT', 96, -4, K, pr(u, CAPS[6][1][0] + .15, CAPS[6][1][0] + .75));
  return g;
}

// ---------- 8  HANDED OVER ----------
const LIFE = [
  ['NAVIGATION', s => `<g transform="scale(${s})"><circle cy="-14" r="34" fill="${R}"/><circle cy="-14" r="12" fill="${WH}"/><path d="M-28,10 L0,64 L28,10 Z" fill="${R}"/></g>`],
  ['EMAIL', s => `<g transform="scale(${s})"><rect x="-56" y="-38" width="112" height="76" rx="8" fill="${C}"/><path d="M-56,-30 L0,12 L56,-30" fill="none" stroke="${WH}" stroke-width="9"/></g>`],
  ['MUSIC', s => `<g transform="scale(${s})"><circle cx="-18" cy="34" r="22" fill="${K}"/><rect x="2" y="-52" width="12" height="88" fill="${K}"/><path d="M14,-52 q36,10 30,44" fill="none" stroke="${K}" stroke-width="12"/></g>`],
  ['SHOPPING', s => `<g transform="scale(${s})"><rect x="-48" y="-18" width="96" height="76" rx="8" fill="${Y}" stroke="${K}" stroke-width="7"/><path d="M-24,-18 a24,30 0 0,1 48,0" fill="none" stroke="${K}" stroke-width="9"/></g>`],
  ['BANKING', s => `<g transform="scale(${s})"><rect x="-64" y="-40" width="128" height="80" rx="10" fill="${K}"/><rect x="-64" y="-18" width="128" height="18" fill="${Y}"/><rect x="-46" y="14" width="46" height="10" fill="${WH}"/></g>`],
  ['HEALTH', s => `<g transform="scale(${s})"><path d="M0,44 C-80,-6 -48,-56 0,-20 C48,-56 80,-6 0,44 Z" fill="${R}"/><path d="M-50,0 h28 l12,-26 l20,52 l12,-26 h28" fill="none" stroke="${WH}" stroke-width="8" stroke-linejoin="round"/></g>`],
  ['PHOTOS', s => `<g transform="scale(${s})"><rect x="-62" y="-36" width="124" height="86" rx="12" fill="${K}"/><circle cy="6" r="28" fill="${C}" stroke="${WH}" stroke-width="7"/><rect x="-34" y="-50" width="30" height="16" fill="${K}"/></g>`],
  ['SEARCH', s => `<g transform="scale(${s})"><circle cx="-12" cy="-12" r="38" fill="none" stroke="${K}" stroke-width="13"/><line x1="16" y1="16" x2="56" y2="56" stroke="${K}" stroke-width="16" stroke-linecap="round"/></g>`],
];
function S8(u) {
  let g = rich(960, 230, 'How much have we *handed over?*', 84, u, .2, { stg: .08 });
  LIFE.forEach(([name, ic], i) => {
    const x = 420 + (i % 4) * 360, y = 420 + Math.floor(i / 4) * 280, p = pr(u, .8 + i * .12, 1.3 + i * .12), rot = [-2, 1.5, -1, 2][i % 4];
    g += pop(x, y, p, card(x, y, 300, 230, rot, WH, `<g transform="translate(0 -22)">${ic(1.1)}</g>${txt(0, 84, name, 26, { anchor: 'middle', mono: true, w: 800 })}`));
    const tp = pr(u, 2.2 + i * .6, 2.6 + i * .6);
    if (tp > 0) g += pop(x + 120, y - 88, tp, `<circle cx="${x + 120}" cy="${y - 88}" r="40" fill="${C}" stroke="${WH}" stroke-width="8"/>${txt(x + 120, y - 74, 'AI', 38, { anchor: 'middle', fill: WH })}`);
  });
  g += drawPath('M1180,190 C1180,120 1840,110 1850,215 C1855,310 1150,320 1140,230 C1135,170 1500,150 1700,170', pr(u, 8.2, 9.6), R, 11);
  return g;
}

// ---------- 9  REDISCOVERY ----------
function S9(u) {
  let g = '';
  const mapP = pr(u, .2, .9);
  const route = [[420, 700], [560, 700], [560, 560], [800, 560], [800, 420], [1060, 420], [1060, 330], [1280, 330]];
  let inner = `<rect x="-575" y="-320" width="1150" height="640" fill="#E8DCC2"/>`;
  inner += `<path d="M-575,160 C-300,40 -100,260 160,120 S500,-60 575,-120" fill="none" stroke="${C}" stroke-width="64" opacity=".85"/>`;
  [[-380, -180, 190, 130, Y], [150, 130, 230, 120, Y], [330, -230, 170, 90, '#9DBF8B']].forEach(([x, y, w, h, c]) => inner += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}" opacity=".55"/>`);
  for (let i = -4; i <= 4; i++) inner += `<line x1="${i * 130}" y1="-320" x2="${i * 130}" y2="320" stroke="${WH}" stroke-width="${i % 2 ? 9 : 16}"/>`;
  for (let j = -2; j <= 2; j++) inner += `<line x1="-575" y1="${j * 120}" x2="575" y2="${j * 120}" stroke="${WH}" stroke-width="${j % 2 ? 9 : 16}"/>`;
  g += pop(960, 520, mapP, card(960, 520, 1150, 640, -1.2, '#E8DCC2', inner));
  g += tape(420, 214, -14) + tape(1500, 214, 12);
  const pts = route.map(p => [p[0] + 0, p[1] - 20]), len = pts.map((p, i) => i ? Math.hypot(p[0] - pts[i - 1][0], p[1] - pts[i - 1][1]) : 0), tot = len.reduce((a, b) => a + b, 0);
  const rp = eIO(pr(u, 1.4, 7.6)), d = rp * tot; let acc = 0, mx = pts[0][0], my = pts[0][1], dd = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 1; i < pts.length; i++) { if (acc + len[i] <= d) { dd += ` L${pts[i][0]},${pts[i][1]}`; acc += len[i]; mx = pts[i][0]; my = pts[i][1]; } else { const t = (d - acc) / len[i]; mx = lerp(pts[i - 1][0], pts[i][0], t); my = lerp(pts[i - 1][1], pts[i][1], t); dd += ` L${f(mx)},${f(my)}`; break; } }
  g += `<path d="${dd}" fill="none" stroke="${R}" stroke-width="13" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="1 0"/>`;
  g += pop(pts[0][0], pts[0][1], pr(u, 1.0, 1.4), `<circle cx="${pts[0][0]}" cy="${pts[0][1]}" r="20" fill="${K}"/><circle cx="${pts[0][0]}" cy="${pts[0][1]}" r="8" fill="${WH}"/>`);
  const e = pts[pts.length - 1]; g += pop(e[0], e[1] - 36, pr(u, 7.4, 7.9), `<path d="M${e[0]},${e[1] + 6} l-26,-48 a30,30 0 1,1 52,0 z" fill="${R}" stroke="${WH}" stroke-width="6"/><circle cx="${e[0]}" cy="${e[1] - 48}" r="10" fill="${WH}"/>`);
  g += `<g transform="translate(${f(mx)} ${f(my)}) rotate(40)"><rect x="-8" y="-150" width="16" height="130" fill="${K}"/><path d="M-8,-20 L0,0 L8,-20 Z" fill="${R}"/></g>`;
  const note = (x, y, rot, col, l1, l2, tc, t0) => pop(x, y, pr(u, t0, t0 + .5), `<g filter="url(#sh)" transform="translate(${x} ${y}) rotate(${rot})"><rect x="-175" y="-120" width="350" height="240" fill="${col}"/><rect x="-175" y="-120" width="350" height="26" fill="${K}" opacity=".12"/>${txt(0, -14, l1, 56, { anchor: 'middle', fill: tc })}${txt(0, 52, l2, 56, { anchor: 'middle', fill: tc })}</g>`);
  g += note(260, 330, -6, Y, 'ASK A', 'NEIGHBOR', K, 4.6);
  g += note(1670, 730, 5, C, 'WRITE IT', 'DOWN', WH, 8.2);
  return g;
}

// ---------- 10  CONNECTION ----------
function S10(u) {
  let g = '';
  g += pop(1500, 560, pr(u, .2, 1.2), `<circle cx="1500" cy="560" r="190" fill="${R}"/><circle cx="1500" cy="560" r="190" fill="url(#dotsK)" opacity=".22"/>`);
  g += `<rect x="0" y="720" width="1920" height="170" fill="${K}" opacity=".9"/>`;
  [[120, 480, 210, 240, Y], [380, 520, 190, 200, C], [1420, 500, 200, 220, WH], [1680, 470, 220, 250, Y]].forEach(([x, y, w, h, col], i) => {
    const p = pr(u, .3 + i * .2, .9 + i * .2); if (p <= 0) return;
    g += `<g opacity="${p.toFixed(2)}" transform="translate(0 ${f((1 - eOut(p)) * 60)})" filter="url(#sh)">${poly([[x, y + h - 0], [x, y + 40], [x + w / 2, y - 30], [x + w, y + 40], [x + w, y + h]].map(q => [q[0], q[1] + 0]), col)}<rect x="${x + 30}" y="${y + 70}" width="40" height="52" fill="${K}"/><rect x="${x + w - 80}" y="${y + 70}" width="40" height="52" fill="${Math.sin(u * 3 + i) > -.2 ? Y : K}"/></g>`;
  });
  // string lights
  const qb = (a, c, b, t) => (1 - t) * (1 - t) * a + 2 * (1 - t) * t * c + t * t * b;
  g += drawPath('M60,350 Q500,520 960,420 T1860,360', pr(u, .8, 1.6), K, 5);
  for (let i = 0; i < 16; i++) { const seg = i < 8 ? 0 : 1, t = ((i % 8) + .5) / 8, P = seg ? [[960, 420], [1420, 320], [1860, 360]] : [[60, 350], [500, 520], [960, 420]], x = qb(P[0][0], P[1][0], P[2][0], t), y = qb(P[0][1], P[1][1], P[2][1], t), p = pr(u, 1.2 + i * .08, 1.5 + i * .08); if (p > 0) g += `<circle cx="${f(x)}" cy="${f(y + 16)}" r="${f(15 * eBack(p))}" fill="${Y}" stroke="${K}" stroke-width="3" opacity="${(.75 + .25 * Math.sin(u * 5 + i * 2)).toFixed(2)}"/>`; }
  // radio
  const rx = 560, ry = 600;
  for (let k = 0; k < 3; k++) { const p = ((u * .6 + k / 3) % 1); g += `<circle cx="${rx}" cy="${ry - 30}" r="${f(90 + p * 330)}" fill="none" stroke="${C}" stroke-width="${f(12 * (1 - p) + 2)}" opacity="${(.85 * (1 - p)).toFixed(2)}"/>`; }
  g += pop(rx, ry, pr(u, 1.4, 1.9), `<g transform="translate(${rx} ${ry})" filter="url(#sh)"><rect x="-110" y="-70" width="220" height="140" rx="16" fill="${R}" stroke="${WH}" stroke-width="10"/><circle cx="-50" cy="0" r="38" fill="${K}"/><circle cx="-50" cy="0" r="14" fill="${Y}"/><rect x="10" y="-40" width="80" height="18" fill="${K}"/><rect x="10" y="-6" width="80" height="12" fill="${K}"/><rect x="10" y="18" width="80" height="12" fill="${K}"/><line x1="70" y1="-70" x2="120" y2="-150" stroke="${K}" stroke-width="7"/></g>`);
  // kids counting
  const n = 1 + Math.floor(u * 1.1) % 5;
  [760, 880, 1000].forEach((x, i) => {
    const p = pr(u, 4.6 + i * .3, 5.2 + i * .3);
    g += pop(x, 700, p, person(x, 650, 1, [Y, C, R][i], '#E9C7A1', `<rect x="30" y="-120" width="22" height="112" rx="11" fill="${[Y, C, R][i]}" stroke="${WH}" stroke-width="6"/><g>${[...Array(Math.min(5, n + i % 2))].map((_, k) => `<rect x="${22 + k * 9}" y="${-160 - (k % 2) * 8}" width="8" height="46" rx="4" fill="#E9C7A1"/>`).join('')}<rect x="20" y="-128" width="46" height="26" rx="12" fill="#E9C7A1"/></g>`));
  });
  // table + tea
  g += pop(1240, 760, pr(u, 8.4, 9.0), `<rect x="1060" y="740" width="420" height="22" fill="${I}" stroke="${WH}" stroke-width="6"/>` + [1120, 1240, 1360].map((x, i) => person(x, 640, .8, [R, C, Y][i])).join('') + [1160, 1300].map(x => `<rect x="${x - 16}" y="716" width="32" height="26" fill="${WH}" stroke="${K}" stroke-width="4"/><path d="M${x - 6},706 q-8,-16 0,-30 M${x + 8},706 q-8,-16 0,-30" fill="none" stroke="${WH}" stroke-width="5" opacity="${(.5 + .4 * Math.sin(u * 3 + x)).toFixed(2)}"/>`).join(''));
  return g;
}

// ---------- 11  DAY SEVEN ----------
function S11(u) {
  let g = '';
  const rise = eOut(pr(u, .2, 3.2)), sy = lerp(900, 470, rise);
  g += `<circle cx="960" cy="${f(sy)}" r="220" fill="${R}"/><circle cx="960" cy="${f(sy)}" r="300" fill="none" stroke="url(#dotsR)" stroke-width="70" opacity=".6"/>`;
  const bld = [[80, 330, 150], [230, 430, 130], [360, 280, 140], [500, 390, 120], [1300, 350, 130], [1430, 450, 150], [1580, 300, 130], [1710, 400, 140], [620, 520, 110], [1180, 500, 120]];
  bld.forEach(([x, top, w], i) => {
    const p = pr(u, .2 + i * .1, .9 + i * .1); if (p <= 0) return;
    g += `<g transform="translate(0 ${f((1 - eOut(p)) * 80)})" opacity="${p.toFixed(2)}" filter="url(#sh)"><rect x="${x}" y="${top + 40}" width="${w}" height="${760 - top - 40}" fill="${[I, Y, C, WH][i % 4]}" stroke="${WH}" stroke-width="8"/><rect x="${x + 14}" y="${top + 60}" width="${w - 28}" height="${760 - top - 90}" fill="url(#win${i % 2 ? 'Y' : 'K'})" opacity=".55"/></g>`;
  });
  g += `<rect x="0" y="760" width="1920" height="130" fill="${K}"/>`;
  // soft data lines threading over people
  const paths = ['M150,330 C400,160 700,200 960,300 S1500,160 1780,300', 'M300,430 C560,250 800,330 960,330 S1320,260 1500,350', 'M520,520 C700,420 880,440 1180,500 S1560,420 1700,470'];
  paths.forEach((d, i) => g += drawPath(d, eIO(pr(u, 3.6 + i * .8, 6.4 + i * .8)), C, 5, 'opacity=".85" stroke-dasharray="1 0"'));
  // people with map + phone
  [[600, 'map'], [960, 'both'], [1320, 'phone']].forEach(([x, kind], i) => {
    const p = pr(u, 2.2 + i * .35, 2.8 + i * .35);
    g += pop(x, 700, p, person(x, 640, 1.5, [C, Y, R][i], '#E9C7A1', (kind !== 'phone' ? `<g transform="translate(-60 40) rotate(-12)"><rect x="-50" y="-40" width="100" height="80" fill="#E8DCC2" stroke="${WH}" stroke-width="6"/><path d="M-50,-10 h100 M0,-40 v80" stroke="${R}" stroke-width="5"/></g>` : '') + (kind !== 'map' ? `<g transform="translate(64 38) rotate(10)"><rect x="-22" y="-38" width="44" height="76" rx="8" fill="${K}" stroke="${WH}" stroke-width="5"/><rect x="-15" y="-28" width="30" height="50" fill="${C}"/></g>` : '')));
  });
  g += pop(960, 180, pr(u, 8.4, 9.0), `<text x="960" y="205" font-family="${FONT}" font-weight="900" font-size="150" text-anchor="middle" fill="${K}">DAY 7</text>` + `<rect x="620" y="226" width="${f(680 * eOut(pr(u, 8.8, 9.4)))}" height="22" fill="${Y}"/>`);
  return g;
}

// ---------- 12  THE END ----------
function S12(u) {
  let g = '';
  const rise = eOut(pr(u, 0, 3.4)), sy = lerp(1000, 640, rise);
  g += `<circle cx="960" cy="${f(sy)}" r="${f(260)}" fill="${R}"/><circle cx="960" cy="${f(sy)}" r="${f(350 + Math.sin(u * 1.4) * 8)}" fill="none" stroke="url(#dotsR)" stroke-width="80" opacity=".55"/>`;
  g += torn(-200, 1000, 2100, 930, 230, 77, K);
  g += rich(960, 230, 'THE DAY AI STOPPED,', 112, u, VS(11).start, { stg: .1 });
  g += rich(960, 400, '*HUMANITY* *STARTED* *AGAIN.*', 118, u, VS(11).start + VS(11).dur * .5, { stg: .2 });
  g += txt(960, 975, 'WHAT IF AI SUDDENLY STOPPED WORKING?', 30, { anchor: 'middle', mono: true, w: 800, fill: I, op: pr(u, 6, 7) });
  g += `<rect width="1920" height="1080" fill="${K}" opacity="${pr(u, 10.6, 11.9).toFixed(3)}"/>`;
  return g;
}

const SCENES = [S1, S2, S3, S4, S5, S6, S7, S8, S9, S10, S11, S12];
function render(t) {
  t = clamp(t, 0, TOTAL - .001);
  const i = Math.min(N_SCENES - 1, Math.floor((t + .0001) / SCENE_LEN)), u = t - i * SCENE_LEN;
  const g = `<rect width="1920" height="1080" fill="${I}"/>` + backdrop(i, u) + SCENES[i](u) + kicker(i, u) + caption(CAPS[i], u) +
    `<rect x="0" y="1072" width="${f(1920 * t / TOTAL)}" height="8" fill="${R}"/>` + wipe(t);
  document.getElementById('scene').innerHTML = g;
}
