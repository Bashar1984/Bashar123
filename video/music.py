#!/usr/bin/env python3
"""Generate the 60 s soundtrack for 'The Day the Machines Went Quiet' (numpy only)."""
import sys
import wave
import numpy as np

SR = 44100
DUR = 60.0
N = int(SR * DUR)
L = np.zeros(N)
R = np.zeros(N)
rs = np.random.default_rng(7)

NOTE = {'F1': 43.65, 'A1': 55.0, 'F2': 87.31, 'G2': 98.0, 'A2': 110.0, 'C3': 130.81, 'D3': 146.83, 'E3': 164.81,
        'F3': 174.61, 'G3': 196.0, 'A3': 220.0, 'Bb3': 233.08, 'B3': 246.94, 'C4': 261.63, 'D4': 293.66, 'E4': 329.63,
        'F4': 349.23, 'G4': 392.0, 'A4': 440.0, 'B4': 493.88, 'C5': 523.25, 'D5': 587.33, 'E5': 659.26, 'G5': 783.99,
        'A5': 880.0, 'C6': 1046.5, 'E6': 1318.5}


def add(sig, t0, pan=0.0, gain=1.0):
    i0 = int(t0 * SR)
    if i0 >= N:
        return
    sig = sig[:N - i0] * gain
    lg, rg = np.sqrt((1 - pan) / 2), np.sqrt((1 + pan) / 2)
    L[i0:i0 + len(sig)] += sig * lg
    R[i0:i0 + len(sig)] += sig * rg


def env(n, a, r):
    e = np.ones(n)
    na, nr = int(a * SR), int(r * SR)
    if na:
        e[:na] = np.linspace(0, 1, na)
    if nr:
        e[-nr:] *= np.linspace(1, 0, nr)
    return e


def pad(notes, t0, t1, amp=0.05, a=0.8, r=0.9):
    n = int((t1 - t0) * SR)
    t = np.arange(n) / SR
    s = np.zeros(n)
    for f in notes:
        f = NOTE[f]
        for det in (0.998, 1.0, 1.003):
            s += np.sin(2 * np.pi * f * det * t + rs.random() * 6) + 0.25 * np.sin(4 * np.pi * f * det * t)
    s *= (1 + 0.15 * np.sin(2 * np.pi * 0.25 * t)) * env(n, a, r) * amp / (len(notes) * 3)
    add(s, t0, 0.0)


def pluck(f, t0, amp=0.12, dec=0.35, pan=0.0, bright=0.4):
    f = NOTE.get(f, f)
    n = int(dec * 6 * SR)
    t = np.arange(n) / SR
    s = (np.sin(2 * np.pi * f * t) + bright * np.sin(4 * np.pi * f * t) * np.exp(-t / (dec * .4)) + 0.15 * np.sin(6 * np.pi * f * t) * np.exp(-t / (dec * .2)))
    s *= np.exp(-t / dec) * np.minimum(1, t / 0.004)
    add(s * amp, t0, pan)


def bell(f, t0, amp=0.08, pan=0.0):
    f = NOTE.get(f, f)
    n = int(4 * SR)
    t = np.arange(n) / SR
    s = sum(a * np.sin(2 * np.pi * f * m * t) * np.exp(-t / d) for m, a, d in ((1, 1, 1.6), (2.76, .5, .6), (5.4, .25, .25), (8.9, .12, .1)))
    add(s * amp * np.minimum(1, t / .002), t0, pan)


def noise_band(n, lo, hi):
    x = rs.standard_normal(n)
    X = np.fft.rfft(x)
    fr = np.fft.rfftfreq(n, 1 / SR)
    X[(fr < lo) | (fr > hi)] = 0
    y = np.fft.irfft(X, n)
    return y / (np.abs(y).max() + 1e-9)


def swish(t0, dur=0.5, amp=0.16, lo=600, hi=5000, pan=0.0):
    n = int(dur * SR)
    e = np.sin(np.linspace(0, np.pi, n)) ** 2
    add(noise_band(n, lo, hi) * e * amp, t0, pan)


def click(t0, amp=0.08, pan=0.0, lo=2000, hi=9000, dur=0.012):
    n = int(dur * SR)
    add(noise_band(n, lo, hi) * np.exp(-np.arange(n) / (n / 4)) * amp, t0, pan)


def thump(t0, amp=0.35, f0=95, f1=42, dur=0.35):
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = f1 + (f0 - f1) * np.exp(-t / 0.05)
    add(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / (dur / 4)) * amp, t0)


def sweep(t0, dur, f0, f1, amp):
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = f0 * (f1 / f0) ** (t / dur)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) + 0.4 * np.sin(4 * np.pi * np.cumsum(f) / SR)
    add(s * amp * np.linspace(1, 0, n) ** 1.5, t0)


SNAP = 13.2
# ---- Block 1 (0-13.2): calm autopilot hum, data arpeggios, clock ticks ----
pad(['A2', 'E3', 'G3', 'C4', 'B4'], 0, 5.2, .06, a=1.5)
pad(['F2', 'C3', 'E3', 'A3', 'G4'], 5.0, 10.2, .06)
pad(['A2', 'E3', 'G3', 'C4', 'E4'], 10.0, SNAP + .02, .06, r=.02)
arp = {0: ['A4', 'C5', 'E5', 'B4'], 5: ['F4', 'A4', 'C5', 'E5'], 10: ['A4', 'C5', 'E5', 'G5']}
t = 0.0
k = 0
while t < SNAP - .01:
    base = 10 if t >= 10 else (5 if t >= 5 else 0)
    pluck(arp[base][k % 4], t, .055, .22, pan=(-.5 if k % 2 else .5))
    t += 0.25
    k += 1
for i in range(int(SNAP * 2)):
    click(i * .5, .05 if i % 2 else .07, pan=.2)
bell('A5', 9.05, .09)
thump(9.05, .2)
swish(9.7, .6, .1)
# ---- Block 2: the snap ----
click(SNAP, .5, lo=300, hi=12000, dur=.05)
thump(SNAP, .6, 120, 30, .8)
sweep(SNAP, 1.6, 520, 35, .16)
n = int(6.5 * SR)
tt = np.arange(n) / SR
add((np.sin(2 * np.pi * 55 * tt) + .3 * np.sin(2 * np.pi * 110 * tt)) * .035 * env(n, 1.5, 2.5), SNAP + .8)
for x in (15.2, 16.9, 18.4):
    bell('E6', x, .02, pan=.6 if x > 16 else -.6)
swish(18.9, 1.1, .14, 200, 3000)
# ---- Block 3 (20-30): chaos ----
pad(['A3', 'Bb3', 'E4', 'F4'], 20, 29.6, .05, a=4, r=.6)
for i in range(int(9.6 / .125)):
    tb = 20 + i * .125
    pluck('A1' if (i // 8) % 4 < 3 else 'F1', tb, .16 + .05 * (i % 4 == 0), .09, bright=1.2)
    if i % 2 == 1:
        click(tb, .05 + rs.random() * .04, pan=rs.uniform(-.7, .7))
    if i % 8 == 0:
        thump(tb, .3)
for j in range(8):
    pluck(880 if j % 2 == 0 else 698.5, 21 + j, .03, .5, pan=.4, bright=.1)
swish(29.0, 1.0, .22, 400, 7000)
# ---- Block 4 (30-40): rediscovery ----
swish(30.0, .5, .1, 300, 4000)
pad(['C3', 'G3', 'E4'], 30, 35.2, .055, a=1.2)
pad(['A2', 'E3', 'C4'], 35, 40.3, .055)
mel = ['E5', 'G4', 'C5', 'D5', 'E5', 'G5', 'E5', 'D5', 'C5', 'A4', 'C5', 'E5', 'D5', 'C5', 'G4', 'A4', 'C5', 'D5']
for i, nt in enumerate(mel):
    pluck(nt, 31 + i * .5, .08, .5, pan=-.2)
for i in range(4):
    swish(31.5 + i * 1.8, .25, .03, 2500, 9000, pan=.3)  # marker on paper
swish(39.5, .7, .18, 300, 5000)
# ---- Block 5 (40-50): connection ----
prog = [(40, ['C3', 'G3', 'E4', 'C5']), (42.5, ['G2', 'D3', 'B3', 'G4']), (45, ['A2', 'E3', 'C4', 'A4']), (47.5, ['F2', 'C3', 'A3', 'F4'])]
for t0, ch in prog:
    pad(ch, t0, t0 + 2.7, .06, a=.4, r=.5)
    for i in range(10):
        pluck(ch[1 + i % 3], t0 + i * .25, .05, .25, pan=(-.4 if i % 2 else .4))
for i in range(20):
    tb = 40 + i * .5
    thump(tb, .2)
    click(tb + .25, .06, lo=5000, hi=12000, dur=.03)
for i, nt in enumerate(['E5', 'D5', 'C5', 'G4', 'A4', 'C5', 'D5', 'E5', 'G5', 'E5']):
    pluck(nt, 40.5 + i * 1.0, .07, .6, pan=.15)
# ---- Block 6 (50-60): the return ----
pad(['F2', 'C3', 'A3', 'F4'], 49.7, 53.2, .06, a=.6)
pad(['G2', 'D3', 'B3', 'G4'], 53, 56.2, .06)
pad(['C3', 'G3', 'E4', 'C5', 'G5'], 56, 60, .07, r=2.5)
for x, nt in [(52, 'C6'), (53.4, 'G5'), (54.6, 'E6'), (55.8, 'C6'), (57, 'G5'), (58, 'C6')]:
    bell(nt, x, .045, pan=rs.uniform(-.5, .5))
for i in range(16):
    pluck(['C5', 'E5', 'G5', 'E5'][i % 4], 50.25 + i * .375, .04, .3, pan=(-.3 if i % 2 else .3))

# ---- simple reverb via FFT convolution ----
irn = int(1.8 * SR)
ir = rs.standard_normal(irn) * np.exp(-np.arange(irn) / (0.45 * SR))
ir[0] = 0


def conv(x):
    m = 1 << int(np.ceil(np.log2(len(x) + irn)))
    return np.fft.irfft(np.fft.rfft(x, m) * np.fft.rfft(ir, m), m)[:len(x)]


wetL, wetR = conv(L), conv(R)
wetL *= .25 * np.abs(L).max() / (np.abs(wetL).max() + 1e-9)
wetR *= .25 * np.abs(R).max() / (np.abs(wetR).max() + 1e-9)
L, R = L + wetL, R + wetR
fade = np.ones(N)
fn = int(1.5 * SR)
fade[-fn:] = np.linspace(1, 0, fn)
L *= fade
R *= fade
pk = max(np.abs(L).max(), np.abs(R).max())
out = np.stack([L, R], 1) / pk * 0.89
out = np.tanh(out * 1.1) / np.tanh(1.1)
with wave.open(sys.argv[1] if len(sys.argv) > 1 else 'soundtrack.wav', 'wb') as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((out * 32767).astype('<i2').tobytes())
print('ok')
