"""Fase 1 (PROMPT_V2 §1): medições das referências com números reais.

Mede, só dentro da área da TELA filmada (para não contar a mão/teclado/câmera):
  - diferença média entre quadros consecutivos (30 fps, reduzido) → eventos de mudança;
  - mudanças por minuto, intervalo entre mudanças (≈ duração de "plano"), maior trecho quase parado;
  - cortes duros (filtro scene do ffmpeg);
  - duração das "rajadas" de animação (proxy de quantos quadros dura uma entrada);
  - ÁUDIO (ref2): BPM e batidas (librosa), transientes (onsets) e alinhamento com as mudanças visuais.
Saída: referencias/medicoes/medidas.json + resumo no terminal.
"""
import json
import os
import sys

sys.stdout.reconfigure(encoding="utf-8")
import re
import subprocess

import imageio_ffmpeg
import librosa
import numpy as np
from scipy.ndimage import uniform_filter1d
from scipy.signal import find_peaks

FF = imageio_ffmpeg.get_ffmpeg_exe()
HERE = os.path.dirname(os.path.abspath(__file__))
REFDIR = os.path.abspath(os.path.join(HERE, "..", "..", "referencias"))
OUT = os.path.join(REFDIR, "medicoes")
os.makedirs(OUT, exist_ok=True)

FPS = 30
SW, SH = 64, 96
# recorte (x0, y0, x1, y1) da tela filmada + janela de conteúdo (s) medida nos mosaicos
REFS = {
    "ref1_azul": {"crop": (0.03, 0.27, 0.97, 0.57), "inicio": 4.75},
    "ref2_vermelho": {"crop": (0.15, 0.12, 0.80, 0.85), "inicio": 0.0},
    "ref3_laranja": {"crop": (0.20, 0.27, 0.80, 0.78), "inicio": 0.0},
}


def run(args, text=False):
    return subprocess.run(args, capture_output=True, text=text)


def frames(path, crop, fps, w=SW, h=SH, full=False):
    x0, y0, x1, y1 = crop
    vf = f"fps={fps},"
    if not full:
        vf += f"crop=iw*{x1 - x0}:ih*{y1 - y0}:iw*{x0}:ih*{y0},"
    vf += f"scale={w}:{h},format=gray"
    raw = run([FF, "-v", "error", "-i", path, "-vf", vf, "-f", "rawvideo", "-"]).stdout
    return np.frombuffer(raw, np.uint8).reshape(-1, h, w).astype(np.float32) / 255.0


def fim_do_conteudo(path, dur):
    """Encerramento do TikTok = card estático no fim: sequência final de quadros com o
    MESMO desvio-padrão (imagem parada). Conteúdo termina ~0,5 s antes (animação do card)."""
    f = frames(path, (0, 0, 1, 1), 2, 36, 64, full=True)
    std = f.reshape(len(f), -1).std(axis=1)
    n = 0
    for i in range(len(std) - 1, -1, -1):
        if abs(std[i] - std[-1]) < 0.006:
            n += 1
        else:
            break
    fim = dur - n / 2.0 - 0.5 if n >= 4 else dur
    return fim, [round(float(s), 3) for s in std[-24:]]


def cortes(path, crop, thr):
    x0, y0, x1, y1 = crop
    vf = f"crop=iw*{x1 - x0}:ih*{y1 - y0}:iw*{x0}:ih*{y0},select='gt(scene,{thr})',showinfo"
    err = run([FF, "-hide_banner", "-i", path, "-vf", vf, "-an", "-f", "null", "-"], text=True).stderr
    return [float(t) for t in re.findall(r"pts_time:([0-9.]+)", err)]


def runs(mask):
    """(início, comprimento) de cada sequência True."""
    out, start = [], None
    for i, v in enumerate(list(mask) + [False]):
        if v and start is None:
            start = i
        elif not v and start is not None:
            out.append((start, i - start))
            start = None
    return out


def medir(nome, cfg):
    path = os.path.join(REFDIR, nome + ".mp4")
    probe = run([FF, "-i", path], text=True).stderr
    m = re.search(r"Duration: (\d+):(\d+):([\d.]+)", probe)
    dur = int(m[1]) * 3600 + int(m[2]) * 60 + float(m[3])
    fim, std_tail = fim_do_conteudo(path, dur)
    ini = cfg["inicio"]

    f = frames(path, cfg["crop"], FPS)
    d = np.abs(np.diff(f, axis=0)).mean(axis=(1, 2))  # d[i] = mudança entre quadro i e i+1
    t = (np.arange(len(d)) + 1) / FPS
    sel = (t >= ini) & (t <= fim)
    d, t = d[sel], t[sel]
    ds = uniform_filter1d(d, 3)
    piso = float(np.percentile(ds, 25))
    prom = max(0.006, 4 * piso)
    picos, _ = find_peaks(ds, prominence=prom, distance=int(0.3 * FPS))
    tp = t[picos]
    janela_min = (fim - ini) / 60.0
    inter = np.diff(tp) if len(tp) > 1 else np.array([fim - ini])
    parado_thr = max(2 * piso, 0.0025)
    parados = runs(ds < parado_thr)
    maior_parado = max((n for _, n in parados), default=0) / FPS
    ativos = [n for _, n in runs(ds >= parado_thr)]

    c30 = [c for c in cortes(path, cfg["crop"], 0.30) if ini <= c <= fim]
    c15 = [c for c in cortes(path, cfg["crop"], 0.15) if ini <= c <= fim]

    return {
        "duracao_arquivo_s": round(dur, 2),
        "janela_conteudo_s": [round(ini, 2), round(fim, 2)],
        "std_final_(encerramento)": std_tail,
        "mudancas_visuais": len(tp),
        "mudancas_por_minuto": round(len(tp) / janela_min, 1),
        "intervalo_medio_entre_mudancas_s": round(float(np.mean(inter)), 2),
        "intervalo_mediano_s": round(float(np.median(inter)), 2),
        "maior_intervalo_sem_mudanca_s": round(float(np.max(inter)), 2),
        "maior_trecho_quase_parado_s": round(maior_parado, 2),
        "limiar_parado": round(parado_thr, 4),
        "rajada_animacao_mediana_quadros": int(np.median(ativos)) if ativos else 0,
        "cortes_duros_scene>0.30": [round(c, 2) for c in c30],
        "cortes_scene>0.15": [round(c, 2) for c in c15],
        "tempos_mudanca_s": [round(float(x), 2) for x in tp],
    }


def audio(nome, janela, tempos_visuais):
    wav = os.path.join(OUT, nome + ".wav")
    y, sr = librosa.load(wav, sr=22050, mono=True)
    a, b = int(janela[0] * sr), int(janela[1] * sr)
    y = y[a:b]
    rms = librosa.feature.rms(y=y)[0]
    db = 20 * np.log10(np.maximum(rms, 1e-9))
    res = {
        "rms_medio_dBFS": round(float(np.mean(db)), 1),
        "pico_dBFS": round(float(20 * np.log10(max(np.max(np.abs(y)), 1e-9))), 1),
    }
    if res["rms_medio_dBFS"] < -38:
        res["obs"] = "praticamente mudo (só ruído) — sem análise rítmica"
        return res
    tempo, beats = librosa.beat.beat_track(y=y, sr=sr, units="time")
    tempo = float(np.atleast_1d(tempo)[0])
    env = librosa.onset.onset_strength(y=y, sr=sr)
    onsets = librosa.onset.onset_detect(onset_envelope=env, sr=sr, units="time")
    of = librosa.onset.onset_detect(onset_envelope=env, sr=sr, units="frames")
    forte = env[of] > np.percentile(env[of], 80) if len(of) else []
    fortes = [round(float(x + janela[0]), 2) for x, s in zip(onsets, forte) if s]
    beats_abs = beats + janela[0]
    onsets_abs = onsets + janela[0]

    def frac_perto(ts, ref, tol):
        if len(ts) == 0 or len(ref) == 0:
            return 0.0
        return float(np.mean([np.min(np.abs(ref - x)) <= tol for x in ts]))

    def acaso(ts, ref, tol, n=400):
        """Linha de base: desloca os tempos visuais aleatoriamente (circular) e mede de novo."""
        rng = np.random.default_rng(7)
        span = janela[1] - janela[0]
        vals = []
        for _ in range(n):
            sh = ((ts - janela[0] + rng.uniform(0, span)) % span) + janela[0]
            vals.append(frac_perto(sh, ref, tol))
        return float(np.mean(vals))

    tv = np.array(tempos_visuais)
    tol = 0.10
    periodo = 60.0 / tempo if tempo else 0
    fortes_arr = np.array(fortes)
    res.update({
        "bpm_estimado": round(tempo, 1),
        "periodo_batida_s": round(periodo, 3),
        "quadros_por_batida_30fps": round(periodo * 30, 2),
        "n_batidas": int(len(beats)),
        "n_transientes": int(len(onsets)),
        "transientes_fortes_s(top20%)": fortes,
        "mudancas_visuais_<=100ms_de_batida": round(frac_perto(tv, beats_abs, tol), 2),
        "  acaso_batida": round(acaso(tv, beats_abs, tol), 2),
        "mudancas_visuais_<=100ms_de_transiente": round(frac_perto(tv, onsets_abs, tol), 2),
        "  acaso_transiente": round(acaso(tv, onsets_abs, tol), 2),
        "mudancas_visuais_<=100ms_de_transiente_FORTE": round(frac_perto(tv, fortes_arr, tol), 2),
        "  acaso_transiente_forte": round(acaso(tv, fortes_arr, tol), 2),
        "batidas_s": [round(float(x), 2) for x in beats_abs],
    })
    return res


resultado = {}
for nome, cfg in REFS.items():
    r = medir(nome, cfg)
    r["audio"] = audio(nome, r["janela_conteudo_s"], r["tempos_mudanca_s"])
    resultado[nome] = r
    print(f"\n=== {nome} ===")
    for k, v in r.items():
        if k in ("tempos_mudanca_s", "cortes_scene>0.15"):
            print(f"  {k}: {len(v)} itens")
        elif k == "audio":
            for ka, va in v.items():
                if ka == "batidas_s":
                    continue
                print(f"  audio.{ka}: {va}")
        else:
            print(f"  {k}: {v}")

with open(os.path.join(OUT, "medidas.json"), "w", encoding="utf-8") as fh:
    json.dump(resultado, fh, ensure_ascii=False, indent=1)
print("\nOK -> referencias/medicoes/medidas.json")
