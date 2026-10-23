"""Efeitos sonoros SINTETIZADOS (PROMPT_V2 §6.2) — sem downloads, sem direitos autorais.
Gera public/audio/sfx/<nome>.wav (44,1 kHz, estéreo, pico −1 dBFS). Rode: npm run sfx
"""
import os
import sys

sys.stdout.reconfigure(encoding="utf-8")

import numpy as np
import soundfile as sf
from scipy.signal import butter, sosfilt

SR = 44100
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "public", "audio", "sfx")
os.makedirs(OUT, exist_ok=True)
rng = np.random.default_rng(42)


def t_(dur):
    return np.arange(int(SR * dur)) / SR


def bp(x, lo, hi):
    return sosfilt(butter(2, [lo, hi], btype="band", fs=SR, output="sos"), x)


def lp(x, f):
    return sosfilt(butter(2, f, btype="low", fs=SR, output="sos"), x)


def hp(x, f):
    return sosfilt(butter(2, f, btype="high", fs=SR, output="sos"), x)


def sweep_noise(dur, f0, f1, q=0.35):
    """Ruído filtrado com centro varrendo de f0 a f1 (em blocos)."""
    n = int(SR * dur)
    x = rng.standard_normal(n)
    out = np.zeros(n)
    blocos = 48
    for b in range(blocos):
        a, z = b * n // blocos, (b + 1) * n // blocos
        fc = f0 * (f1 / f0) ** (b / (blocos - 1))
        lo, hi = max(40, fc * (1 - q)), min(SR / 2 - 100, fc * (1 + q))
        seg = bp(x[max(0, a - 2048):z], lo, hi)[-(z - a):]
        out[a:z] = seg
    return out


def reverb(x, dur=1.2, mix=0.25):
    ir_t = t_(dur)
    ir = rng.standard_normal(len(ir_t)) * np.exp(-ir_t * (6.0 / dur))
    ir = lp(ir, 6000)
    wet = np.convolve(x, ir)[: len(x) + len(ir) - 1]
    wet /= np.max(np.abs(wet)) + 1e-9
    dry = np.concatenate([x, np.zeros(len(wet) - len(x))])
    return dry * (1 - mix) + wet * mix * np.max(np.abs(x))


def env(n, a=0.005, rel=None, k=None):
    t = np.arange(n) / SR
    e = np.minimum(1, t / max(a, 1e-4))
    if k is not None:
        e *= np.exp(-t * k)
    return e


def salvar(nome, l, r=None):
    if r is None:
        r = l
    m = max(np.max(np.abs(l)), np.max(np.abs(r))) + 1e-9
    g = 0.891 / m  # −1 dBFS
    fade = min(len(l), int(0.004 * SR))
    for x in (l, r):
        x[-fade:] *= np.linspace(1, 0, fade)
    sf.write(os.path.join(OUT, nome + ".wav"), np.stack([l * g, r * g], axis=1).astype(np.float32), SR, subtype="PCM_16")
    print(f"  {nome}.wav  {len(l) / SR:.2f}s")


# --- whooshes ---
d = 0.35
x = sweep_noise(d, 500, 5000) * np.sin(np.pi * t_(d) / d) ** 1.5
salvar("whoosh_short", x, np.roll(x, 60))
d = 0.8
x = sweep_noise(d, 250, 6000, 0.45)
e = np.sin(np.pi * t_(d) / d) ** 1.2
pan = t_(d) / d
salvar("whoosh_long", x * e * (1 - 0.6 * pan), x * e * (0.4 + 0.6 * pan))

# --- pop ---
d = 0.18
t = t_(d)
f = 950 * np.exp(-t * 18) + 280
x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 26) + 0.3 * rng.standard_normal(len(t)) * np.exp(-t * 300)
salvar("pop", x)

# --- lock_click / thunk / tick / type ---
d = 0.2
x = np.zeros(int(SR * d))
for off, fr in ((0.0, 2600), (0.045, 3900)):
    i = int(off * SR)
    tt = t_(0.05)
    x[i:i + len(tt)] += (np.sin(2 * np.pi * fr * tt) + 0.6 * hp(rng.standard_normal(len(tt)), 2000)) * np.exp(-tt * 140)
salvar("lock_click", x)
d = 0.3
t = t_(d)
x = np.sin(2 * np.pi * np.cumsum(130 * np.exp(-t * 14) + 55) / SR) * np.exp(-t * 16) + 0.5 * lp(rng.standard_normal(len(t)), 900) * np.exp(-t * 40)
salvar("thunk", x)
d = 0.05
t = t_(d)
salvar("tick", (np.sin(2 * np.pi * 3100 * t) + 0.4 * hp(rng.standard_normal(len(t)), 3000)) * np.exp(-t * 160))
d = 0.06
t = t_(d)
salvar("type", bp(rng.standard_normal(len(t)), 1500, 6000) * np.exp(-t * 110) + 0.5 * np.sin(2 * np.pi * 180 * t) * np.exp(-t * 90))

# --- impact_low (boom + transiente + cauda) ---
d = 1.1
t = t_(d)
boom = np.sin(2 * np.pi * np.cumsum(55 * (1 + 1.8 * np.exp(-t * 22))) / SR) * np.exp(-t * 3.2)
tr = hp(rng.standard_normal(len(t)), 1200) * np.exp(-t * 55) * 0.5
x = reverb(boom + tr, 1.0, 0.3)[: len(t)]
salvar("impact_low", x, np.roll(x, 90))

# --- riser (termina no pico) ---
d = 1.5
t = t_(d)
cres = (t / d) ** 2.2
x = sweep_noise(d, 300, 7000, 0.5) * cres + 0.5 * np.sin(2 * np.pi * np.cumsum(200 * (8 ** (t / d))) / SR) * cres
salvar("riser", x, np.roll(x, 120))


def sino(freq, dur, k=5.0):
    t = t_(dur)
    return (np.sin(2 * np.pi * freq * t) + 0.35 * np.sin(2 * np.pi * freq * 2.76 * t) * np.exp(-t * 8)) * np.exp(-t * k) * env(len(t), 0.003)


# --- chime_ok (2 notas) / ping ---
d = 0.6
x = np.zeros(int(SR * d))
a = sino(659.3, 0.45, 7)
b = sino(987.8, 0.5, 6)
x[: len(a)] += a
x[int(0.09 * SR):int(0.09 * SR) + len(b)] += b[: len(x) - int(0.09 * SR)]
x = reverb(x, 0.6, 0.2)[: len(x)]
salvar("chime_ok", x, np.roll(x, 70))
x = reverb(sino(1318.5, 0.5, 6), 0.5, 0.2)[: int(0.5 * SR)]
salvar("ping", x, np.roll(x, 50))

# --- shutter (abre/fecha) ---
d = 0.25
x = np.zeros(int(SR * d))
for off in (0.0, 0.07):
    i = int(off * SR)
    tt = t_(0.06)
    x[i:i + len(tt)] += bp(rng.standard_normal(len(tt)), 800, 7000) * np.exp(-tt * 90)
salvar("shutter", x)

# --- glitch_zap ---
d = 0.25
t = t_(d)
sq = np.sign(np.sin(2 * np.pi * np.cumsum(1800 * np.exp(-t * 8) + 120) / SR))
gate = (np.floor(t * 60) % 2).astype(float)
x = (sq * 0.6 + 0.4 * rng.standard_normal(len(t))) * gate * np.exp(-t * 6)
x = np.round(x * 6) / 6  # bitcrush
salvar("glitch_zap", x, np.roll(x, 30))

# --- rewind (fita voltando) ---
d = 0.9
t = t_(d)
f = 2200 * np.exp(-t * 2.8) + 160
x = np.sin(2 * np.pi * np.cumsum(f) / SR) * (0.6 + 0.4 * np.sin(2 * np.pi * 24 * t)) + 0.25 * hp(rng.standard_normal(len(t)), 3000)
x *= np.minimum(1, t / 0.05) * np.minimum(1, (d - t) / 0.15)
salvar("rewind", x)

# --- stinger_logo (acorde com cauda + impacto leve) ---
d = 2.2
t = t_(d)
x = np.zeros(len(t))
for fr in (220.0, 261.63, 329.63, 493.88, 440.0):
    x += sino(fr, d, 1.6) * 0.5 + np.sin(2 * np.pi * fr * 0.5 * t) * np.exp(-t * 1.4) * 0.25
x += 0.6 * np.sin(2 * np.pi * np.cumsum(60 * (1 + np.exp(-t * 20))) / SR) * np.exp(-t * 4)
x = reverb(x, 1.6, 0.35)[: len(t)]
salvar("stinger_logo", x, np.roll(x, 140))
print("OK ->", OUT)
