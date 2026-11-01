#!/usr/bin/env python3
"""Soundtrack for 'What If AI Suddenly Stopped Working?' (60 s, numpy only).

Reuses the synth helpers defined at the top of music.py and scores the six
blocks: build-up and switch slam, shutdown unease, freezing systems, the
accelerating office clock, the hopeful twist, and the unresolved finale.
"""
import os
import sys
import wave

import numpy as np

_src = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'music.py')).read()
exec(_src[:_src.index('SNAP = 13.2')])  # synth helpers: pad, pluck, bell, swish, click, thump, sweep, add, env

rs = np.random.default_rng(11)

# ---- Block 1 (0-10): network hums, then the switch slams ----
SLAM = 7.0
pad(['A2', 'E3', 'A3', 'C4', 'E4'], 0, SLAM + .02, .06, a=1.2, r=.02)
t, k = 0.0, 0
while t < SLAM - .01:
    pluck(['A4', 'C5', 'E5', 'G5'][k % 4], t, .05, .18, pan=(-.5 if k % 2 else .5))
    t += .25 if t < 5.6 else .125
    k += 1
for x in (.3, 3.0, 6.45):
    thump(x, .32)
    click(x, .12, lo=800, hi=8000, dur=.03)
swish(.0, 1.6, .12, 300, 6000)
swish(5.6, .9, .16, 400, 7000)
sweep(5.6, .85, 200, 900, .0)
click(SLAM, .6, lo=200, hi=12000, dur=.06)
thump(SLAM, .75, 140, 28, 1.0)
sweep(SLAM, 1.8, 600, 30, .18)
n = int(3 * SR)
tt = np.arange(n) / SR
add(np.sin(2 * np.pi * 49 * tt) * .05 * env(n, .3, 1.5), SLAM + .4)
swish(8.6, 1.4, .18, 200, 5000)

# ---- Block 2 (10-20): the first shock ----
swish(10.0, 1.4, .14, 300, 5000)
pad(['D3', 'A3', 'F4'], 10.5, 16.2, .045, a=1.5)
for i in range(7):
    click(11.2 + i * .16, .1, pan=rs.uniform(-.6, .6), lo=1500, hi=7000, dur=.02)
    pluck('E5', 11.2 + i * .16, .03, .12)
swish(12.6, 3.2, .05, 2500, 9000, pan=.2)  # marker racing across
for i in range(7):
    tf = 13.0 + i * .45
    click(tf, .09, lo=500, hi=3000, dur=.05)
    sweep(tf, .35, 400, 180, .025)
swish(16.0, 1.6, .2, 120, 2500)
thump(17.6, .45, 110, 35, .7)
n = int(2.4 * SR)
tt = np.arange(n) / SR
add((np.sin(2 * np.pi * 55 * tt) + .4 * np.sin(2 * np.pi * 110 * tt)) * .04 * env(n, .4, .6), 17.6)
for i in range(14):
    pluck(rs.choice([1046.5, 1318.5, 1568.0]), 17.7 + i * .16, .02, .06, pan=rs.uniform(-.8, .8))
swish(18.6, 1.4, .1, 400, 4000)

# ---- Block 3 (20-30): the invisible dependency ----
pad(['A2', 'E3', 'B3', 'C4'], 20, 26.8, .045, a=1.2)
for i in range(int(6.6 / .27)):
    tb = 20 + i * .27
    pluck('A1', tb, .14, .08, bright=1.0)
    if i % 2:
        click(tb, .04, pan=.3)
for x in (22.0, 23.2, 24.6, 25.7):
    thump(x, .3, 100, 40, .4)
    sweep(x, .5, 700, 120, .05)
swish(21.4, .7, .1, 500, 6000)
swish(24.3, .7, .1, 500, 6000)
for i, nt in enumerate(['C5', 'E5', 'G5', 'E5', 'D5', 'C5', 'E5', 'G5']):
    pluck(nt, 26.0 + i * .25, .06, .3, pan=.2)
pad(['C3', 'G3', 'E4', 'C5'], 26.6, 30.2, .055, a=.8)
swish(28.6, 1.4, .18, 200, 5000)

# ---- Block 4 (30-40): humans take control ----
swish(30.0, .8, .14, 300, 5000)
pad(['F2', 'C3', 'A3', 'E4'], 30.2, 36.6, .045, a=.6)
for i in range(60):
    click(30.8 + rs.random() * 6, .03, pan=rs.uniform(-.7, .7), lo=3000, hi=9000, dur=.015)
for x in (31.0, 31.3, 31.6, 34.0, 34.3, 34.6, 37.0, 37.2, 37.4):
    thump(x, .18, 90, 50, .25)
    click(x, .06, lo=800, hi=4000, dur=.03)
tick, rate = 32.9, 1.0
while tick < 36.5:
    click(tick, .09, pan=.25, lo=2500, hi=8000, dur=.01)
    rate = 1 + 24 * max(0, min(1, (tick - 34.4) / 2.0)) ** 2
    tick += 1 / rate
thump(34.4, .3)
sweep(34.4, 2.0, 120, 900, .05)
pad(['C3', 'G3', 'E4', 'G4'], 36.5, 40.2, .055, a=.8)
swish(37.2, 1.0, .05, 2500, 9000)
swish(38.8, 1.2, .2, 200, 6000)

# ---- Block 5 (40-50): the surprising twist ----
prog = [(40, ['C3', 'G3', 'E4']), (42.5, ['G2', 'D3', 'B3', 'G4']), (45, ['A2', 'E3', 'C4', 'A4']), (47.5, ['F2', 'C3', 'A3', 'F4'])]
for t0, ch in prog:
    pad(ch, t0, t0 + 2.7, .06, a=.5, r=.5)
n = int(6.6 * SR)
scratch = noise_band(n, 3000, 9000) * (0.5 + 0.5 * np.abs(np.sin(np.arange(n) / SR * 2 * np.pi * 3.1)))
add(scratch * .03 * env(n, .2, .3), 40.0, pan=.2)
for x, nt in ((42.0, 'C6'), (43.8, 'E6'), (45.6, 'G5')):
    thump(x, .28)
    bell(nt, x, .06, pan=rs.uniform(-.4, .4))
swish(43.0, .8, .1, 500, 6000)
for i, nt in enumerate(['E5', 'G5', 'A5', 'G5', 'E5', 'D5', 'C5', 'D5', 'E5', 'G5', 'C6', 'G5']):
    pluck(nt, 41 + i * .6, .06, .45, pan=-.15)
sweep(48.2, 1.3, 220, 1400, .05)

# ---- Block 6 (50-60): the final answer ----
pad(['A2', 'E3', 'C4'], 50, 54.5, .05, a=.6)
for i in range(16):
    pluck('A1', 50 + i * .28, .12, .1, bright=.9)
for x in (52.1, 52.8, 53.5, 54.2):
    thump(x, .3)
    click(x, .09, lo=800, hi=6000, dur=.03)
swish(54.5, 1.6, .2, 150, 4500)
for i in range(24):
    pluck(rs.choice([880.0, 1046.5, 1318.5]), 55.0 + i * .06, .015, .1, pan=rs.uniform(-.9, .9))
bell('E6', 55.3, .05)
pad(['D3', 'A3', 'F4', 'C5'], 55.6, 58.2, .055, a=.5)
pad(['A2', 'E3', 'C4', 'B4'], 57.8, 60, .065, a=1.0, r=1.4)
bell('A5', 59.0, .05)

# ---- reverb + master ----
irn = int(1.8 * SR)
ir = rs.standard_normal(irn) * np.exp(-np.arange(irn) / (0.45 * SR))
ir[0] = 0


def conv(x):
    m = 1 << int(np.ceil(np.log2(len(x) + irn)))
    return np.fft.irfft(np.fft.rfft(x, m) * np.fft.rfft(ir, m), m)[:len(x)]


wl, wr = conv(L), conv(R)
wl *= .25 * np.abs(L).max() / (np.abs(wl).max() + 1e-9)
wr *= .25 * np.abs(R).max() / (np.abs(wr).max() + 1e-9)
L2, R2 = L + wl, R + wr
fade = np.ones(N)
fn = int(1.0 * SR)
fade[-fn:] = np.linspace(1, 0, fn)
L2 *= fade
R2 *= fade
pk = max(np.abs(L2).max(), np.abs(R2).max())
out = np.tanh(np.stack([L2, R2], 1) / pk * .89 * 1.1) / np.tanh(1.1)
with wave.open(sys.argv[1] if len(sys.argv) > 1 else 'soundtrack2.wav', 'wb') as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((out * 32767).astype('<i2').tobytes())
print('ok')
