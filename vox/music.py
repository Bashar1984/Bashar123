#!/usr/bin/env python3
"""Original soundtrack for the Vox-style explainer (144 s, numpy only, 100 bpm).

12 scenes x 5 bars. Dark pulse and slam for the switch-off, groove for the
fallout, suspense for 'collapse?', then a warm major-key lift for the recovery.
"""
import wave
import numpy as np

SR = 44100
DUR = 144.0
N = int(DUR * SR)
BPM = 100
BEAT = 60 / BPM            # 0.6 s
BAR = BEAT * 4             # 2.4 s
SCENE = 12.0
Lc = np.zeros(N)
Rc = np.zeros(N)
rng = np.random.default_rng(7)


def hz(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def add(sig, t0, pan=0.0):
    i = int(t0 * SR)
    if i >= N or i < 0:
        return
    e = min(N, i + len(sig))
    s = sig[:e - i]
    a = (pan + 1) * np.pi / 4
    Lc[i:e] += s * np.cos(a)
    Rc[i:e] += s * np.sin(a)


def tt(d):
    return np.arange(int(d * SR)) / SR


def lowpass(x, k):
    k = max(1, int(k))
    c = np.cumsum(np.insert(x, 0, 0))
    out = (c[k:] - c[:-k]) / k
    return np.concatenate([np.full(k - 1, out[0]), out])[:len(x)]


def pluck(m, t0, vol=.15, dur=.5, pan=0.0):
    t = tt(dur); f = hz(m)
    s = (np.sin(2 * np.pi * f * t) + .45 * np.sin(4 * np.pi * f * t) + .2 * np.sin(6 * np.pi * f * t)) * np.exp(-t * 7)
    s *= np.minimum(1, t / .003)
    add(s * vol, t0, pan)


def bell(m, t0, vol=.12, dur=2.2, pan=0.0):
    t = tt(dur); f = hz(m)
    s = (np.sin(2 * np.pi * f * t) + .5 * np.sin(2 * np.pi * f * 2.76 * t) * np.exp(-t * 3) + .3 * np.sin(2 * np.pi * f * 5.4 * t) * np.exp(-t * 6)) * np.exp(-t * 1.6)
    add(s * vol, t0, pan)


def pad(ms, t0, dur, vol=.07):
    t = tt(dur)
    env = np.minimum(1, t / .9) * np.minimum(1, (dur - t) / .9)
    s = np.zeros_like(t)
    for j, m in enumerate(ms):
        f = hz(m)
        for det in (-.004, .004):
            ff = f * (1 + det)
            s += (np.sin(2 * np.pi * ff * t) + .35 * np.sin(4 * np.pi * ff * t) + .15 * np.sin(6 * np.pi * ff * t))
    add(s * env * vol / len(ms), t0, 0)


def bass(m, t0, dur=.55, vol=.2):
    t = tt(dur); f = hz(m)
    s = (np.sin(2 * np.pi * f * t) + .3 * np.sin(4 * np.pi * f * t)) * np.exp(-t * 3.2) * np.minimum(1, t / .005)
    add(s * vol, t0, 0)


def kick(t0, vol=.5):
    t = tt(.4)
    ph = 2 * np.pi * (45 * t + 75 * (1 - np.exp(-t * 28)) / 28)
    add(np.sin(ph) * np.exp(-t * 9) * vol, t0, 0)


def hat(t0, vol=.05, pan=.3):
    t = tt(.06)
    n = np.diff(rng.standard_normal(len(t) + 1))
    add(n * np.exp(-t * 70) * vol, t0, pan)


def clap(t0, vol=.12):
    t = tt(.2)
    n = rng.standard_normal(len(t))
    n = n - lowpass(n, 8)
    add(n * np.exp(-t * 22) * vol, t0, 0)


def tick(t0, vol=.18):
    t = tt(.05)
    add(np.sin(2 * np.pi * 1800 * t) * np.exp(-t * 90) * vol, t0, .0)


def whoosh(t_peak, dur=.9, vol=.16):
    n = int(dur * SR)
    x = rng.standard_normal(n)
    out = np.zeros(n)
    ch = 2048
    for i in range(0, n, ch):
        p = (i / n)
        k = 4 + int(60 * (1 - p) ** 2)  # opening filter toward the peak
        out[i:i + ch] = (x[i:i + ch] - lowpass(x, k)[i:i + ch]) if p > .5 else lowpass(x, k)[i:i + ch]
    env = np.sin(np.pi * np.linspace(0, 1, n)) ** 1.8
    add(out * env * vol * 4, t_peak - dur / 2, 0)


def thump(t0, vol=.6, f0=95, f1=30):
    t = tt(.9)
    ph = 2 * np.pi * (f1 * t + (f0 - f1) * (1 - np.exp(-t * 14)) / 14)
    add(np.sin(ph) * np.exp(-t * 4.2) * vol, t0, 0)


def riser(t0, dur, vol=.12):
    n = int(dur * SR)
    t = np.arange(n) / SR
    x = rng.standard_normal(n)
    x = x - lowpass(x, 14)
    env = (np.linspace(0, 1, n)) ** 2.2
    tone = np.sin(2 * np.pi * (220 * t + 330 * t ** 2 / dur / 2)) * .35
    add((x * .5 + tone) * env * vol, t0, 0)


MIN = [dict(r=45, ch=[57, 60, 64]), dict(r=41, ch=[53, 57, 60]), dict(r=48, ch=[55, 60, 64]), dict(r=43, ch=[50, 55, 59])]   # Am F C G
MAJ = [dict(r=48, ch=[55, 60, 64]), dict(r=43, ch=[50, 55, 59]), dict(r=45, ch=[57, 60, 64]), dict(r=41, ch=[53, 57, 60])]   # C G Am F

#          prog  pad  arp    kick    hat clap bell bass
CFG = [
    None,
    (MIN, .8, '8', 'half', 0, 0, 0, 1),
    (MIN, .8, '8', 'four', 1, 0, 0, 1),
    (MIN, .9, '8', 'four', 1, 1, 0, 1),
    (MIN, .8, '8', 'half', 1, 0, 1, 1),
    (MAJ, .9, '8', 'half', 0, 0, 1, 1),
    None,
    (MIN, .8, 'beat', None, 0, 0, 1, 1),
    (MAJ, .9, '8', 'half', 1, 0, 1, 1),
    (MAJ, .9, '8', 'four', 1, 1, 1, 1),
    (MAJ, 1.0, '8', 'four', 1, 1, 1, 1),
    None,
]

SLAM = 9.3
for i in range(12):
    t0 = i * SCENE
    if i == 0:  # the switch: pad + accelerating ticks, then slam and drone
        for b in range(4):
            c = MIN[b % 4]
            pad(c['ch'], t0 + b * BAR, min(BAR + .6, SLAM - b * BAR + .05), .6 * .07 * 8)
        dt, t = 1.0, SLAM
        while t > .4:
            t -= dt
            tick(t); dt *= .93
        for k in range(6):
            thump(SLAM - 2.4 + k * (.6 - k * .06), .22, 80, 35)
        riser(SLAM - 2.2, 2.2, .1)
        thump(SLAM, .95, 120, 26)
        tt_ = tt(3.2)
        add(np.sin(2 * np.pi * 55 * tt_) * .1 * np.minimum(1, tt_ / 1.5) * np.minimum(1, (3.2 - tt_) / .8), SLAM + .6, 0)
        add(np.sin(2 * np.pi * 110.4 * tt_) * .05 * np.minimum(1, tt_ / 2.5) * np.minimum(1, (3.2 - tt_) / .8), SLAM + .6, 0)
        continue
    if i == 6:  # collapse?: suspense, then relief at 'probably not'
        for b in range(5):
            c = MIN[(b * 2) % 4] if b < 3 else MIN[0]
            pad(c['ch'], t0 + b * BAR, BAR + .6, .08 * 6)
        for k in range(12):
            thump(t0 + .6 + k * .6 if k < 6 else t0 + 4.2 + (k - 6) * .6, .22, 80, 35)
        riser(t0 + 1.0, 2.6, .12)
        pad([57, 60, 64, 67], t0 + 3.6, 8.4, .08 * 6)
        thump(t0 + 3.6, .7, 100, 30)
        for k, m in enumerate([81, 76, 72, 76, 81, 84, 81, 76]):
            bell(m, t0 + 4.2 + k * .6, .08, 1.8, (-.4, .4)[k % 2])
        continue
    if i == 11:  # resolve
        for b in range(5):
            pad([48, 55, 60, 64] if b % 2 == 0 else [45, 57, 60, 64], t0 + b * BAR, BAR + 1.2, .09 * 6)
        for k, m in enumerate([72, 76, 79, 84, 79, 76, 72]):
            bell(m, t0 + .6 + k * .6, .1, 2.4, (-.4, .4)[k % 2])
        bell(84, t0 + 4.8, .12, 6); bell(79, t0 + 4.8, .08, 6); bell(72, t0 + 4.8, .1, 6)
        for k in (0, 2):
            kick(t0 + k * BEAT, .4)
        continue
    prog, pv, arp, kk, hh, cl, bl, bs = CFG[i]
    for b in range(5):
        c = prog[((i * 5) + b) % 4]; tb = t0 + b * BAR
        pad(c['ch'], tb, BAR + .8, pv * .07 * 6)
        if bs:
            for off in (0, 1.5, 2, 3.5):
                if off in (1.5, 3.5) and kk != 'four':
                    continue
                bass(c['r'], tb + off * BEAT, .5, .22)
        if arp == '8':
            tones = c['ch'] + [c['ch'][0] + 12]
            for k in range(8):
                pluck(tones[[0, 1, 2, 3, 2, 1, 2, 3][k]] + 12, tb + k * BEAT / 2, .1 if i < 8 else .12, .45, (-.5, .5)[k % 2])
        elif arp == 'beat':
            for k in range(4):
                pluck(c['ch'][k % 3] + 12, tb + k * BEAT, .1, .9, (-.4, .4)[k % 2])
        if kk:
            for k in range(4):
                if kk == 'four' or k in (0, 2):
                    kick(tb + k * BEAT, .38 if kk == 'half' else .45)
        if hh:
            for k in range(8):
                hat(tb + k * BEAT / 2 + (BEAT / 2 if False else 0), .05 if k % 2 else .028, (-.3, .3)[k % 2])
        if cl:
            for k in (1, 3):
                clap(tb + k * BEAT, .13)
        if bl:
            bell(c['ch'][2] + 24, tb, .09, 2.2, .3)
            if i >= 9:
                bell(c['ch'][1] + 24, tb + 2 * BEAT, .07, 2.2, -.3)
    if i == 5:  # twist: bell run into scene
        pass

for i in range(1, 12):  # whoosh into every cut
    whoosh(i * SCENE, .8, .14)

m = np.maximum(np.abs(Lc).max(), np.abs(Rc).max())
g = .85 / m
fade = np.minimum(1, np.arange(N) / SR / 1.0) * np.minimum(1, (N - np.arange(N)) / SR / 3.0)
out = np.stack([np.tanh(Lc * g * 1.15) * fade, np.tanh(Rc * g * 1.15) * fade], axis=1)
with wave.open('build/music.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((out * 32767 * .95).astype('<i2').tobytes())
print('music.wav', DUR, 's')
