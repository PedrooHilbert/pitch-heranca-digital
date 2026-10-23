"""Voz sintética NEURAL (edge-tts), uma frase por arquivo, com tempo por palavra.

Uso (chamado por scripts/sync.mjs):  python scripts/voz_sintetica.py <jobs.json> <voz> <rate>
  jobs.json = [{"id": "s01_01", "fala": "texto já com o mapa de pronúncia aplicado"}, ...]
Saída: public/audio/voz/<id>.mp3  +  public/audio/voz/<id>.words.json
  words.json = {"fonte": "sintetica", "voz": ..., "rate": ..., "palavras": [{"w","s","e"}]}  (segundos)
"""
import asyncio
import json
import os
import sys

sys.stdout.reconfigure(encoding="utf-8")

import edge_tts  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VOZDIR = os.path.join(ROOT, "public", "audio", "voz")
os.makedirs(VOZDIR, exist_ok=True)

jobs_path, VOZ, RATE = sys.argv[1], sys.argv[2], sys.argv[3]
JOBS = json.load(open(jobs_path, encoding="utf-8"))


async def gerar(job, sem):
    async with sem:
        for tentativa in range(4):
            try:
                comm = edge_tts.Communicate(job["fala"], VOZ, rate=RATE, boundary="WordBoundary")
                mp3 = os.path.join(VOZDIR, job["id"] + ".mp3")
                palavras = []
                with open(mp3, "wb") as fh:
                    async for ch in comm.stream():
                        if ch["type"] == "audio":
                            fh.write(ch["data"])
                        elif ch["type"] == "WordBoundary":
                            s = ch["offset"] / 1e7
                            palavras.append({"w": ch["text"], "s": round(s, 3), "e": round(s + ch["duration"] / 1e7, 3)})
                with open(os.path.join(VOZDIR, job["id"] + ".words.json"), "w", encoding="utf-8") as fh:
                    json.dump({"fonte": "sintetica", "voz": VOZ, "rate": RATE, "palavras": palavras}, fh, ensure_ascii=False)
                print(f"  {job['id']}: {len(palavras)} palavras", flush=True)
                return
            except Exception as e:  # rede instável: tenta de novo
                print(f"  {job['id']}: tentativa {tentativa + 1} falhou ({e})", flush=True)
                await asyncio.sleep(1.5 * (tentativa + 1))
        raise SystemExit(f"falhou: {job['id']}")


async def main():
    sem = asyncio.Semaphore(4)
    await asyncio.gather(*(gerar(j, sem) for j in JOBS))


asyncio.run(main())
