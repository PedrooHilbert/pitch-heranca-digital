"""Voz LOCAL com Kokoro (offline depois do 1º download do modelo), mesma interface do voz_sintetica.py.

Uso:  python scripts/kokoro_tts.py <jobs.json> <voz> <rate> [pasta de saída]
  jobs.json = [{"id": "...", "fala": "texto já com o mapa de pronúncia"}]   voz ex.: pf_dora (pt-BR, feminina)
Saída: <pasta>/<id>.wav (24 kHz) + <id>.words.json com "palavras": [] — o Kokoro não dá tempo por palavra em
português; o `npm run sync` alinha com o whisper (como nas gravações) ou distribui pelas letras.
"""
import json
import os
import sys

sys.stdout.reconfigure(encoding="utf-8")

import numpy as np  # noqa: E402
import soundfile as sf  # noqa: E402
from kokoro import KPipeline  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
jobs_path, VOZ, RATE = sys.argv[1], sys.argv[2], sys.argv[3]
SAIDA = sys.argv[4] if len(sys.argv) > 4 else os.path.join(ROOT, "public", "audio", "voz")
os.makedirs(SAIDA, exist_ok=True)
VELOCIDADE = 1 + int(RATE.replace("%", "")) / 100  # "+0%" → 1.0 (natural)

pipe = KPipeline(lang_code="p", repo_id="hexgrad/Kokoro-82M")  # 'p' = português do Brasil
for job in json.load(open(jobs_path, encoding="utf-8")):
    partes = [np.asarray(a) for _, _, a in pipe(job["fala"], voice=VOZ, speed=VELOCIDADE) if a is not None]
    audio = np.concatenate(partes) if partes else np.zeros(2400, dtype=np.float32)
    sf.write(os.path.join(SAIDA, job["id"] + ".wav"), audio, 24000)
    with open(os.path.join(SAIDA, job["id"] + ".words.json"), "w", encoding="utf-8") as fh:
        json.dump({"fonte": "kokoro", "voz": VOZ, "rate": RATE, "palavras": []}, fh, ensure_ascii=False)
    print(f"  {job['id']}: {len(audio) / 24000:.2f} s", flush=True)
