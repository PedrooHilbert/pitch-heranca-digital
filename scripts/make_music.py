"""Trilha (cama) SINTETIZADA guiada pela timeline (PROMPT_V2 §6.3).

Lê src/data/timeline.json (cenas, BPM) e gera public/audio/trilha.wav com:
  Am–F–C–G (1 acorde por compasso), 112,5 BPM, bumbo discreto, chimbal no contratempo, baixo, pad, arpejo.
  Arco de energia: S1–S2 tensão (pulso + pad) · S3–S4 groove · S5 energia plena · S6 respiro
  (passa-baixa + batimento + relógio) · S7–S8 groove · S9 groove → acorde final com cauda.
  Fade-in 1 s, fade-out 2 s, normalizada para −26 LUFS (ffmpeg loudnorm, 2 passadas, linear).
Se o grupo colocar a própria trilha em public/audio/trilha.wav, NÃO rode este script.
"""
import json
import os
import sys

sys.stdout.reconfigure(encoding="utf-8")
import re
import subprocess

import imageio_ffmpeg
import numpy as np
import soundfile as sf
from scipy.ndimage import uniform_filter1d
from scipy.signal import butter, sosfilt

SR = 44100
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# Lê o projeto (fonte única): durações das cenas podem ter sido ajustadas no editor.
PJ = json.load(open(os.path.join(ROOT, "src", "data", "project.json"), encoding="utf-8"))
FPS = PJ["fps"]
BPM = PJ["bpm"]
_acc = 0
TL = {"cenas": [], "frases": []}
for _c in PJ["cenas"]:
    TL["cenas"].append({"id": _c["id"], "from": _acc, "dur": _c["dur"]})
    _acc += _c["dur"]
TL["total"] = _acc
_ini = {c["id"]: c["from"] for c in TL["cenas"]}
TL["frases"] = [{"id": f["id"], "from": _ini[f["cena"]] + f["inicio"]} for f in PJ["frases"]]
BEAT = 60.0 / BPM
BAR = 4 * BEAT
DUR = TL["total"] / FPS + 1.0
N = int(DUR * SR)
rng = np.random.default_rng(7)

# ---- seções (início de cada cena, em segundos) e níveis de cada camada ----
NIVEIS = {
    # pad, bumbo, baixo, chimbal, palma, arpejo, batimento, relógio, filtro (1 = aberto)
    "tensao": dict(pad=1.0, kick=0.55, bass=0.35, hat=0.0, clap=0.0, arp=0.0, heart=0.0, clock=0.0, filt=1.0),
    "groove": dict(pad=0.8, kick=0.85, bass=0.8, hat=0.7, clap=0.6, arp=0.35, heart=0.0, clock=0.0, filt=1.0),
    "pleno": dict(pad=0.75, kick=0.95, bass=0.9, hat=0.85, clap=0.75, arp=0.8, heart=0.0, clock=0.0, filt=1.0),
    # revelação do logo da S1 (revisão #12): tudo no máximo, por cima da tensão
    "drop": dict(pad=1.0, kick=1.25, bass=1.2, hat=0.95, clap=1.0, arp=1.0, heart=0.0, clock=0.0, filt=1.0),
    "respiro": dict(pad=1.0, kick=0.0, bass=0.35, hat=0.0, clap=0.0, arp=0.15, heart=0.9, clock=0.7, filt=0.0),
    "final": dict(pad=0.0, kick=0.0, bass=0.0, hat=0.0, clap=0.0, arp=0.0, heart=0.0, clock=0.0, filt=1.0),
}
SECAO = {"s1": "tensao", "s2": "tensao", "s3": "groove", "s4": "groove", "s5": "pleno",
         "s6": "respiro", "s7": "groove", "s8": "groove", "s9": "groove"}
inicio_cena = {c["id"]: c["from"] / FPS for c in TL["cenas"]}
fim_logo = next(f["from"] for f in TL["frases"] if f["id"] == "s09_03") / FPS - 0.1  # acorde final
fronteiras = [(round(inicio_cena[c] / BEAT) * BEAT, SECAO[c]) for c in inicio_cena] + [(fim_logo, "final")]
# revisão #12: "drop" na revelação do logo da S1 (logo = 6 q antes de "Somos"): a tensão vira energia plena até a S2
# (o "Somos" vem 18 q depois do logo; a fala começa ~1 q antes da 1ª palavra)
_logo_s1 = (next(f["from"] for f in TL["frases"] if f["id"] == "s01_05") + 1 - 18) / FPS
fronteiras = sorted(fronteiras + [(_logo_s1, "drop")])


def curva(camada):
    g = np.zeros(N)
    for i, (t0, sec) in enumerate(fronteiras):
        t1 = fronteiras[i + 1][0] if i + 1 < len(fronteiras) else DUR
        g[int(t0 * SR):int(min(t1, DUR) * SR)] = NIVEIS[sec][camada]
    return uniform_filter1d(g, int(0.25 * SR))  # transição suave de 0,25 s


# ---- harmonia ----
NOTA = lambda m: 440.0 * 2 ** ((m - 69) / 12)  # noqa: E731
ACORDES = [(57, [57, 60, 64]), (53, [53, 57, 60]), (48, [48, 52, 55]), (55, [55, 59, 62])]  # Am F C G (raiz, tríade)
acorde_em = lambda t: ACORDES[int(t / BAR) % 4]  # noqa: E731

L = np.zeros(N)
R = np.zeros(N)


def somar(buf, x, t0):
    i = int(t0 * SR)
    if i >= N:
        return
    j = min(N, i + len(x))
    buf[i:j] += x[: j - i]


def tt(d):
    return np.arange(int(d * SR)) / SR


# pad: dente-de-serra suave desafinada, ataque lento
pad_l = np.zeros(N)
pad_r = np.zeros(N)
nbar = int(DUR / BAR) + 1
for b in range(nbar):
    t0 = b * BAR
    _, triade = ACORDES[b % 4]
    d = BAR + 0.4
    t = tt(d)
    e = np.minimum(1, t / 0.35) * np.minimum(1, (d - t) / 0.4)
    for m in triade:
        f = NOTA(m)
        for k, a in ((1, 1.0), (2, 0.35), (3, 0.18), (4, 0.1)):
            somar(pad_l, a * np.sin(2 * np.pi * f * k * 0.998 * t) * e, t0)
            somar(pad_r, a * np.sin(2 * np.pi * f * k * 1.002 * t + 0.7) * e, t0)
sos = butter(2, 1400, "low", fs=SR, output="sos")
pad_l, pad_r = sosfilt(sos, pad_l), sosfilt(sos, pad_r)

kick = np.zeros(N)
bass = np.zeros(N)
hat = np.zeros(N)
clap = np.zeros(N)
arp_l = np.zeros(N)
arp_r = np.zeros(N)
heart = np.zeros(N)
clock = np.zeros(N)
nbeat = int(DUR / BEAT) + 1
for k in range(nbeat):
    t0 = k * BEAT
    raiz, triade = acorde_em(t0)
    t = tt(0.35)
    somar(kick, np.sin(2 * np.pi * np.cumsum(50 * (1 + 2.4 * np.exp(-t * 30))) / SR) * np.exp(-t * 9), t0)
    if k % 4 in (1, 3):
        tc = tt(0.2)
        somar(clap, sosfilt(butter(2, [900, 4000], "band", fs=SR, output="sos"), rng.standard_normal(len(tc))) * np.exp(-tc * 28), t0)
    if k % 2 == 0:  # batimento (lub-dub) a cada 2 batidas
        for off, a in ((0, 1.0), (0.22, 0.7)):
            th = tt(0.25)
            somar(heart, a * np.sin(2 * np.pi * np.cumsum(70 * (1 + np.exp(-th * 25))) / SR) * np.exp(-th * 14), t0 + off)
    tk = tt(0.04)
    somar(clock, np.sin(2 * np.pi * 2400 * tk) * np.exp(-tk * 150), t0)
    for meia in (0, 1):
        tb = t0 + meia * BEAT / 2
        t = tt(BEAT / 2)
        f = NOTA(raiz - 12)
        somar(bass, (np.sin(2 * np.pi * f * t) + 0.25 * np.sin(2 * np.pi * 2 * f * t)) * np.minimum(1, t / 0.01) * np.exp(-t * 4), tb)
        if meia == 1:
            th = tt(0.06)
            somar(hat, sosfilt(butter(2, 7000, "high", fs=SR, output="sos"), rng.standard_normal(len(th))) * np.exp(-th * 70), tb)
        nota = triade[(2 * k + meia) % 3] + 12
        ta = tt(0.45)
        pl = (np.sin(2 * np.pi * NOTA(nota) * ta) + 0.3 * np.sin(2 * np.pi * NOTA(nota) * 2 * ta)) * np.exp(-ta * 7) * np.minimum(1, ta / 0.003)
        somar(arp_l if (2 * k + meia) % 2 == 0 else arp_r, pl, tb)
        somar(arp_r if (2 * k + meia) % 2 == 0 else arp_l, pl * 0.45, tb)

G = {c: curva(c) for c in ("pad", "kick", "bass", "hat", "clap", "arp", "heart", "clock", "filt")}
mix_l = 0.30 * pad_l * G["pad"] + 0.55 * kick * G["kick"] + 0.32 * bass * G["bass"] + 0.10 * hat * G["hat"] + 0.16 * clap * G["clap"] + 0.16 * arp_l * G["arp"] + 0.5 * heart * G["heart"] + 0.06 * clock * G["clock"]
mix_r = 0.30 * pad_r * G["pad"] + 0.55 * kick * G["kick"] + 0.32 * bass * G["bass"] + 0.10 * hat * G["hat"] + 0.16 * clap * G["clap"] + 0.16 * arp_r * G["arp"] + 0.5 * heart * G["heart"] + 0.06 * clock * G["clock"]

# respiro (S6): passa-baixa ~600 Hz
lp6 = butter(2, 600, "low", fs=SR, output="sos")
mix_l = mix_l * G["filt"] + sosfilt(lp6, mix_l) * (1 - G["filt"])
mix_r = mix_r * G["filt"] + sosfilt(lp6, mix_r) * (1 - G["filt"])

# acorde final (C maior com 9ª) com cauda longa
t = tt(DUR - fim_logo)
fin = np.zeros(len(t))
for m in (48, 55, 60, 64, 67, 74):
    fin += np.sin(2 * np.pi * NOTA(m) * t) * np.exp(-t * 0.28) * np.minimum(1, t / 0.08)
fin = sosfilt(butter(2, 2500, "low", fs=SR, output="sos"), fin) * 0.22
somar(mix_l, fin, fim_logo)
somar(mix_r, fin, fim_logo)

# fades
ft = np.arange(N) / SR
# fade-out curto: a cauda do acorde precisa soar até ~1 s antes do fim (PROMPT_V2 §5 S9)
fade = np.minimum(1, ft / 1.0) * np.clip((DUR - 1.0 - ft) / 1.0, 0, 1)
mix_l *= fade
mix_r *= fade
pk = max(np.max(np.abs(mix_l)), np.max(np.abs(mix_r)))
mix = np.stack([mix_l, mix_r], axis=1) / pk * 0.8

tmp = os.path.join(ROOT, "scripts", ".cache", "trilha_bruta.wav")
os.makedirs(os.path.dirname(tmp), exist_ok=True)
sf.write(tmp, mix.astype(np.float32), SR, subtype="PCM_16")

# normalização −26 LUFS (2 passadas, linear)
FF = imageio_ffmpeg.get_ffmpeg_exe()
med = subprocess.run([FF, "-hide_banner", "-i", tmp, "-af", "loudnorm=I=-26:TP=-3:LRA=11:print_format=json", "-f", "null", "-"], capture_output=True, text=True).stderr
j = json.loads(med[med.rfind("{"):med.rfind("}") + 1])
ln = f"loudnorm=I=-26:TP=-3:LRA=11:measured_I={j['input_i']}:measured_TP={j['input_tp']}:measured_LRA={j['input_lra']}:measured_thresh={j['input_thresh']}:offset={j['target_offset']}:linear=true"
saida = os.path.join(ROOT, "public", "audio", "trilha.wav")
subprocess.run([FF, "-hide_banner", "-y", "-i", tmp, "-af", ln, "-ar", str(SR), "-c:a", "pcm_s16le", saida], capture_output=True, check=True)
print(f"✓ trilha.wav  {DUR:.1f}s  {BPM} BPM  (entrada {j['input_i']} LUFS → −26 LUFS)")
print("  seções:", ", ".join(f"{s}@{t:.1f}s" for t, s in fronteiras))
