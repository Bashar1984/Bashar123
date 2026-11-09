#!/usr/bin/env python3
"""Paper-grain texture (multiplied over every frame)."""
import numpy as np
from PIL import Image
rng = np.random.default_rng(5)
w, h = 1920, 1080
n = rng.random((h, w)).astype(np.float32)
k = 9  # horizontal fibres
c = np.cumsum(np.pad(n, ((0, 0), (k, 0)), mode='edge'), axis=1)
fib = (c[:, k:] - c[:, :-k]) / k
fine = rng.random((h, w)).astype(np.float32)
g = 0.65 * fib + 0.35 * fine
g = (g - g.min()) / (g.max() - g.min())
out = (222 + g * 33).clip(0, 255).astype(np.uint8)
Image.fromarray(out, 'L').convert('RGB').save('grain.png')
print('grain.png ok')
