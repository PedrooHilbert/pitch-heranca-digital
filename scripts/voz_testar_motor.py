"""Testa de verdade o que o edge-tts aceita (revisão "voz expressiva"): rate, pitch (Hz e %), volume e SSML.
Uso: python scripts/voz_testar_motor.py <pasta de saída>   → imprime uma tabela (markdown) com as medições.
"""
import asyncio
import json
import os
import sys
import warnings

import numpy as np

warnings.filterwarnings("ignore")
sys.stdout.reconfigure(encoding="utf-8")
import edge_tts  # noqa: E402
import librosa  # noqa: E402

OUT = sys.argv[1]
os.makedirs(OUT, exist_ok=True)
VOZ = "pt-BR-ThalitaMultilingualNeural"
F = "Com o seu e-mail?"
CASOS = [
    ("base", F, {}),
    ("rate −10%", F, {"rate": "-10%"}),
    ("rate +10%", F, {"rate": "+10%"}),
    ("pitch +15Hz", F, {"pitch": "+15Hz"}),
    ("pitch −15Hz", F, {"pitch": "-15Hz"}),
    ("pitch +10% (formato %)", F, {"pitch": "+10%"}),
    ("volume +30%", F, {"volume": "+30%"}),
    ("volume −30%", F, {"volume": "-30%"}),
    ("SSML <break 600ms>", "Com o seu <break time=\"600ms\"/> e-mail?", {}),
    ("SSML <emphasis>", "Com o seu <emphasis level=\"strong\">e-mail</emphasis>?", {}),
    ("SSML <prosody pitch=+20Hz>", "Com o seu <prosody pitch=\"+20Hz\">e-mail</prosody>?", {}),
    ("SSML mstts:express-as cheerful", "<mstts:express-as style=\"cheerful\">Com o seu e-mail?</mstts:express-as>", {}),
]


async def gerar(nome, texto, kw):
    arq = os.path.join(OUT, f"motor_{len(os.listdir(OUT)):02d}.mp3")
    pal = []
    try:
        c = edge_tts.Communicate(texto, VOZ, boundary="WordBoundary", **kw)
        with open(arq, "wb") as fh:
            async for ch in c.stream():
                if ch["type"] == "audio":
                    fh.write(ch["data"])
                elif ch["type"] == "WordBoundary":
                    pal.append(ch["text"])
    except Exception as e:  # parâmetro recusado
        return nome, None, f"recusado: {str(e)[:60]}"
    return nome, arq, pal


def medir(arq):
    y, sr = librosa.load(arq, sr=22050)
    yt, _ = librosa.effects.trim(y, top_db=35)
    f0, v, _ = librosa.pyin(yt, fmin=70, fmax=400, sr=sr, frame_length=1024, hop_length=256)
    f0v = f0[v & ~np.isnan(f0)]
    rms = 20 * np.log10(np.sqrt(np.mean(yt**2)) + 1e-9)
    return len(yt) / sr, float(np.median(f0v)) if len(f0v) else float("nan"), rms


async def main():
    linhas = ["| Teste | Aceito? | Duração (s) | Pitch mediano (Hz) | RMS (dB) | Palavras que a voz disse |", "|---|---|---|---|---|---|"]
    for nome, texto, kw in CASOS:
        n, arq, pal = await gerar(nome, texto, kw)
        if arq is None:
            linhas.append(f"| {n} | ✗ {pal} | | | | |")
            continue
        d, p, r = medir(arq)
        lidas = " ".join(pal)
        linhas.append(f"| {n} | ✓ | {d:.2f} | {p:.0f} | {r:.1f} | {lidas} |")
    print("\n".join(linhas))


asyncio.run(main())
