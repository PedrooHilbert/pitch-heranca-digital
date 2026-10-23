"""Executa o plano da voz expressiva (scripts/lib/expressiva.mjs) por EMENDA DE PALAVRAS.

Para cada combinação de rate/pitch usada numa frase, a FRASE INTEIRA é sintetizada uma vez no edge-tts; de cada
versão sai só o trecho (palavras) do segmento que pede aquela combinação. Assim a frase mantém o fluxo natural
(sem a voz "recomeçar" a cada pedaço, que alongava ~0,35 s por corte) e só as ênfases ficam mais lentas.
Cortes no meio do silêncio entre palavras, fade de 10 ms em toda borda, crossfade de 15 ms entre pedaços,
silêncio real nas pausas dramáticas ("…"). Volume por segmento aplicado no áudio. Nada de time-stretch.

Uso: python scripts/voz_expressiva.py <plano.json> <pasta de saída>
Saída por frase: <id>.wav (44,1 kHz mono, sem normalizar) + <id>.words.json (tempo de cada palavra dita).
"""
import asyncio
import io
import json
import os
import re
import subprocess
import sys
import unicodedata

import numpy as np
import soundfile as sf

sys.stdout.reconfigure(encoding="utf-8")
import edge_tts  # noqa: E402
import imageio_ffmpeg  # noqa: E402

SR = 44100
FF = imageio_ffmpeg.get_ffmpeg_exe()
plano = json.load(open(sys.argv[1], encoding="utf-8"))
SAIDA = sys.argv[2]
os.makedirs(SAIDA, exist_ok=True)
VOZ = plano["voz"]
XF = int(SR * plano.get("crossfadeMs", 15) / 1000)
FADE = int(SR * 0.010)


def norm(s):
    s = unicodedata.normalize("NFD", s.lower())
    return re.sub(r"[^a-z0-9]", "", "".join(c for c in s if unicodedata.category(c) != "Mn"))


def mp3_para_np(dados: bytes) -> np.ndarray:
    r = subprocess.run([FF, "-hide_banner", "-loglevel", "error", "-i", "pipe:0", "-f", "f32le", "-ac", "1", "-ar", str(SR), "pipe:1"],
                       input=dados, capture_output=True, check=True)
    return np.frombuffer(r.stdout, dtype=np.float32).copy()


async def sintetizar(fala, rate, pitch, sem):
    async with sem:
        for tentativa in range(5):
            try:
                c = edge_tts.Communicate(fala, VOZ, rate=rate, pitch=pitch, boundary="WordBoundary")
                buf, pal = io.BytesIO(), []
                async for ch in c.stream():
                    if ch["type"] == "audio":
                        buf.write(ch["data"])
                    elif ch["type"] == "WordBoundary":
                        s = ch["offset"] / 1e7
                        pal.append({"w": ch["text"], "s": s, "e": s + ch["duration"] / 1e7})
                if not pal:
                    raise RuntimeError("sem palavras")
                return mp3_para_np(buf.getvalue()), pal
            except Exception as e:  # rede instável
                if tentativa == 4:
                    raise SystemExit(f"falhou: {fala[:40]} ({e})")
                await asyncio.sleep(1.5 * (tentativa + 1))


def borda(x):
    n = min(FADE, len(x) // 2)
    if n:
        x[:n] *= np.linspace(0, 1, n)
        x[-n:] *= np.linspace(1, 0, n)
    return x


def faixa_do_segmento(pal, ini_c, fim_c):
    """Índices [a, b] das palavras da versão `pal` cujo centro cai nos caracteres [ini_c, fim_c) da frase."""
    pos, idx = 0, []
    for i, p in enumerate(pal):
        n = len(norm(p["w"]))
        if ini_c <= pos + n / 2 < fim_c:
            idx.append(i)
        pos += n
    return (idx[0], idx[-1]) if idx else None


async def frase(f, sem):
    segs = f["segmentos"]
    combos = sorted({(s["rate"], s["pitch"]) for s in segs})
    fala = " ".join(s["fala"] for s in segs)
    versoes = dict(zip(combos, await asyncio.gather(*[sintetizar(fala, r, p, sem) for r, p in combos])))
    # limites de cada segmento em caracteres normalizados da frase
    lim, pos = [], 0
    for s in segs:
        n = len(norm(s["fala"]))
        lim.append((pos, pos + n))
        pos += n

    audio = np.zeros(int(SR * f["padIniMs"] / 1000), dtype=np.float32)
    palavras, colado, emendas = [], False, []
    for i, s in enumerate(segs):
        y, pal = versoes[(s["rate"], s["pitch"])]
        ab = faixa_do_segmento(pal, *lim[i])
        if ab is None:
            continue
        a, b = ab
        # corta no meio do silêncio entre palavras (nas pontas da frase: margem curta)
        t0 = (pal[a - 1]["e"] + pal[a]["s"]) / 2 if a > 0 else max(0.0, pal[a]["s"] - 0.02)
        t1 = (pal[b]["e"] + pal[b + 1]["s"]) / 2 if b + 1 < len(pal) else pal[b]["e"] + 0.04
        i0, i1 = int(t0 * SR), min(len(y), int(t1 * SR))
        trecho = borda(y[i0:i1].copy() * (10 ** (s["volumeDb"] / 20)))
        sobre = min(XF, len(trecho) // 2, len(audio)) if colado else 0
        base = len(audio) - sobre
        for p in pal[a:b + 1]:
            palavras.append({"w": p["w"], "s": round(base / SR + p["s"] - t0, 3), "e": round(base / SR + p["e"] - t0, 3)})
        if i > 0:
            emendas.append(round(base / SR, 4))  # onde este pedaço encosta no anterior (para conferir cliques)
        if sobre:
            audio[-sobre:] += trecho[:sobre]
            audio = np.concatenate([audio, trecho[sobre:]])
        else:
            audio = np.concatenate([audio, trecho])
        pausa = s["pausaDepoisMs"]
        colado = pausa < 0
        if pausa > 0:
            audio = np.concatenate([audio, np.zeros(int(SR * pausa / 1000), dtype=np.float32)])
    audio = np.concatenate([audio, np.zeros(int(SR * (f["padFimMs"] + f["silencioFimMs"]) / 1000), dtype=np.float32)])
    pico = float(np.max(np.abs(audio))) or 1.0
    if pico > 0.98:
        audio *= 0.98 / pico
    sf.write(os.path.join(SAIDA, f["id"] + ".wav"), audio, SR, subtype="PCM_16")
    with open(os.path.join(SAIDA, f["id"] + ".words.json"), "w", encoding="utf-8") as fh:
        json.dump({"fonte": "sintetica", "voz": VOZ, "expressiva": True, "emendas": emendas, "palavras": palavras}, fh, ensure_ascii=False)
    print(f"  {f['id']}: {len(segs)} segmento(s), {len(combos)} versão(ões), {len(audio) / SR:.2f} s", flush=True)


async def main():
    sem = asyncio.Semaphore(4)
    for f in plano["frases"]:
        await frase(f, sem)


asyncio.run(main())
