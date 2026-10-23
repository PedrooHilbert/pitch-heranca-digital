"""Procura cliques/descontinuidades nas emendas (revisão "voz expressiva").

Uso: python scripts/voz_emendas.py <pasta com .wav ou .mp3> [pasta de referência sem emendas]
Clique = pico de energia ACIMA de 6 kHz em janela de 1,5 ms, ≥ 15 dB acima da mediana dos 40 ms em volta e com
duração ≤ 3 ms (sibilantes duram dezenas de ms e não contam), ou salto de amostra > 8× o típico da vizinhança.
A pasta de referência (mesma frase sem emendas) mostra quantos "falsos cliques" a própria voz já tem.
"""
import os
import sys

import numpy as np
import soundfile as sf
from scipy.signal import butter, sosfilt

sys.stdout.reconfigure(encoding="utf-8")
SR = 44100


def carregar(arq):
    if arq.endswith(".wav"):
        y, sr = sf.read(arq, dtype="float32")
    else:
        import librosa
        y, sr = librosa.load(arq, sr=SR)
    if y.ndim > 1:
        y = y.mean(1)
    return y, sr


def cliques(y, sr):
    sos = butter(4, 6000, "hp", fs=sr, output="sos")
    h = sosfilt(sos, y)
    w = int(sr * 0.0015)
    n = len(h) // w
    e = 10 * np.log10(np.mean(h[: n * w].reshape(n, w) ** 2, axis=1) + 1e-12)
    viz = int(0.040 / 0.0015)
    achados = []
    for i in range(viz, n - viz):
        ref = np.median(np.r_[e[i - viz:i - 1], e[i + 2:i + viz]])
        if e[i] - ref >= 15 and e[i] > -60 and (e[i - 2] - ref < 8) and (e[i + 2] - ref < 8):
            achados.append(round(i * w / sr, 3))
    d = np.abs(np.diff(y))
    tip = np.convolve(d, np.ones(441) / 441, mode="same") + 1e-6
    saltos = np.where((d > 8 * tip) & (d > 0.05))[0]
    return achados, [round(s / sr, 3) for s in saltos[::50]]


def varrer(pasta):
    tot_c = tot_s = 0
    det = []
    for f in sorted(os.listdir(pasta)):
        if not f.endswith((".wav", ".mp3")):
            continue
        y, sr = carregar(os.path.join(pasta, f))
        c, s = cliques(y, sr)
        tot_c += len(c)
        tot_s += len(s)
        if c or s:
            det.append(f"  {f}: cliques {c[:6]} saltos {s[:6]}")
    return tot_c, tot_s, det


def nas_emendas(pasta):
    """Energia acima de 6 kHz nos ±6 ms de cada emenda, comparada com os 40 ms em volta (dB)."""
    import json
    sos = butter(4, 6000, "hp", fs=SR, output="sos")
    picos = []
    for f in sorted(os.listdir(pasta)):
        wj = os.path.join(pasta, os.path.splitext(f)[0] + ".words.json")
        if not f.endswith((".wav", ".mp3")) or not os.path.exists(wj):
            continue
        em = json.load(open(wj, encoding="utf-8")).get("emendas", [])
        if not em:
            continue
        y, sr = carregar(os.path.join(pasta, f))
        h = sosfilt(sos, y)
        for t in em:
            c = int(t * sr)
            perto = h[max(0, c - int(0.006 * sr)): c + int(0.006 * sr)]
            volta = np.r_[h[max(0, c - int(0.046 * sr)): c - int(0.006 * sr)], h[c + int(0.006 * sr): c + int(0.046 * sr)]]
            if len(perto) and len(volta):
                d = 10 * np.log10((np.mean(perto ** 2) + 1e-12) / (np.mean(volta ** 2) + 1e-12))
                picos.append((round(d, 1), f, t))
    return picos


em = nas_emendas(sys.argv[1])
if em:
    v = [p[0] for p in em]
    print(f"emendas: {len(em)} · energia aguda nos ±6 ms vs. vizinhança: mediana {np.median(v):+.1f} dB, máx {max(v):+.1f} dB")
    print("  maiores:", sorted(em, reverse=True)[:5])
c, s, det = varrer(sys.argv[1])
print(f"{sys.argv[1]}: {c} clique(s), {s} salto(s)")
print("\n".join(det[:20]))
if len(sys.argv) > 2:
    c0, s0, det0 = varrer(sys.argv[2])
    print(f"referência sem emendas {sys.argv[2]}: {c0} clique(s), {s0} salto(s)")
    print("\n".join(det0[:10]))
