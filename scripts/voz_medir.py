"""Mede a expressividade da narração (revisão "voz expressiva").

Uso:  python scripts/voz_medir.py <pasta com .mp3 e .words.json> [rótulo]   → imprime JSON com as medidas

Por frase: pitch (librosa pyin, 70–400 Hz, só trechos com voz) em semitons em relação à mediana da frase —
faixa (p95 − p5) e desvio-padrão —, energia (RMS em dB nos trechos com voz: desvio-padrão dentro da frase) e
velocidade (palavras/s entre a 1ª e a última palavra, pelo words.json).
Entre frases: desvio-padrão do pitch mediano (semitons), do RMS médio (dB) e da velocidade (palavras/s).
"""
import json
import os
import sys
import warnings

import numpy as np

warnings.filterwarnings("ignore")
sys.stdout.reconfigure(encoding="utf-8")
import librosa  # noqa: E402

pasta = sys.argv[1]
rotulo = sys.argv[2] if len(sys.argv) > 2 else os.path.basename(pasta.rstrip("/\\"))
SR = 22050
HOP = 256


def st(x, ref):
    return 12 * np.log2(x / ref)


frases = []
for nome in sorted(os.listdir(pasta)):
    if not nome.endswith(".mp3"):
        continue
    base = nome[:-4]
    y, _ = librosa.load(os.path.join(pasta, nome), sr=SR, mono=True)
    f0, voz, _ = librosa.pyin(y, fmin=70, fmax=400, sr=SR, frame_length=1024, hop_length=HOP)
    f0v = f0[voz & ~np.isnan(f0)]
    if len(f0v) < 10:
        continue
    med = float(np.median(f0v))
    s = st(f0v, med)
    rms = librosa.feature.rms(y=y, frame_length=1024, hop_length=HOP)[0][: len(voz)]
    rms_db = 20 * np.log10(np.maximum(rms[voz[: len(rms)]], 1e-5))
    wj = os.path.join(pasta, base + ".words.json")
    pal = json.load(open(wj, encoding="utf-8")).get("palavras", []) if os.path.exists(wj) else []
    dur_fala = (pal[-1]["e"] - pal[0]["s"]) if len(pal) > 1 else len(y) / SR
    frases.append({
        "id": base,
        "pitch_med_hz": round(med, 1),
        "pitch_faixa_st": round(float(np.percentile(s, 95) - np.percentile(s, 5)), 2),
        "pitch_dp_st": round(float(np.std(s)), 2),
        "rms_med_db": round(float(np.mean(rms_db)), 2),
        "rms_dp_db": round(float(np.std(rms_db)), 2),
        "pal_por_s": round(len(pal) / dur_fala, 2) if pal else None,
    })

meds = np.array([f["pitch_med_hz"] for f in frases])
vel = np.array([f["pal_por_s"] for f in frases if f["pal_por_s"]])
resumo = {
    "rotulo": rotulo,
    "frases": len(frases),
    "pitch_faixa_st_media": round(float(np.mean([f["pitch_faixa_st"] for f in frases])), 2),
    "pitch_dp_st_media": round(float(np.mean([f["pitch_dp_st"] for f in frases])), 2),
    "pitch_entre_frases_dp_st": round(float(np.std(st(meds, np.median(meds)))), 2),
    "rms_dentro_dp_db_media": round(float(np.mean([f["rms_dp_db"] for f in frases])), 2),
    "rms_entre_frases_dp_db": round(float(np.std([f["rms_med_db"] for f in frases])), 2),
    "vel_media_pal_s": round(float(np.mean(vel)), 2) if len(vel) else None,
    "vel_entre_frases_dp": round(float(np.std(vel)), 2) if len(vel) else None,
}
print(json.dumps({"resumo": resumo, "frases": frases}, ensure_ascii=False, indent=1))
