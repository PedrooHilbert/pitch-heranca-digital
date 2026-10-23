"""Auditoria da v2 (PROMPT_V2 §7). Uso: npm run audit  [-- out/pitch-v2.mp4]

1. Movimento: diferença média entre quadros consecutivos (30 fps, 320×180, cinza) → janelas ≥ 45 q
   "quase paradas", mudanças de plano/min, maior trecho sem mudança.
2. Áudio: loudnorm (LUFS integrado, true-peak), silencedetect (> 1,0 s), voz × trilha (LUFS de cada camada).
3. Texto: tempo mínimo de leitura das legendas; placeholders pendentes.
4. Duração e formato (ffprobe).
Grava out/auditoria.json e imprime o resumo.
"""
import json
import os
import re
import subprocess
import sys

import imageio_ffmpeg
import numpy as np
from scipy.ndimage import uniform_filter1d
from scipy.signal import find_peaks

sys.stdout.reconfigure(encoding="utf-8")
FF = imageio_ffmpeg.get_ffmpeg_exe()
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VIDEO = os.path.join(ROOT, sys.argv[1]) if len(sys.argv) > 1 else os.path.join(ROOT, "out", "pitch-v2.mp4")
_PJ = json.load(open(os.path.join(ROOT, "src", "data", "project.json"), encoding="utf-8"))
TL = {"cenas": [], "frases": []}
_acc = 0
for _c in _PJ["cenas"]:
    TL["cenas"].append({"id": _c["id"], "from": _acc, "dur": _c["dur"]})
    _acc += _c["dur"]
TL["total"] = _acc
TL["frases"] = [{"id": f["id"]} for f in _PJ["frases"]]
W, H = 320, 180
res = {"video": os.path.relpath(VIDEO, ROOT)}


def ff(args, text=True):
    return subprocess.run([FF, "-hide_banner", *args], capture_output=True, text=text)


# ---------- 4. duração / formato ----------
info = ff(["-i", VIDEO]).stderr
dur = re.search(r"Duration: (\d+):(\d+):([\d.]+)", info)
dur_s = int(dur[1]) * 3600 + int(dur[2]) * 60 + float(dur[3])
vm = re.search(r"Video: (\w+).*?, (\d+)x(\d+).*?, ([\d.]+) fps", info)
res["duracao_s"] = round(dur_s, 3)
res["formato"] = {"codec": vm[1], "largura": int(vm[2]), "altura": int(vm[3]), "fps": float(vm[4])}
res["duracao_ok"] = dur_s <= 180.05 and int(vm[2]) == 1920 and int(vm[3]) == 1080 and abs(float(vm[4]) - 30) < 0.01
res["soma_cenas_q"] = sum(c["dur"] for c in TL["cenas"])
res["soma_cenas_ok"] = res["soma_cenas_q"] == TL["total"]

# ---------- 1. movimento ----------
raw = ff(["-i", VIDEO, "-vf", f"scale={W}:{H},format=gray", "-f", "rawvideo", "-"], text=False).stdout
fr = np.frombuffer(raw, np.uint8).reshape(-1, H, W).astype(np.float32) / 255.0
d = np.abs(np.diff(fr, axis=0)).mean(axis=(1, 2))
LIMIAR = 0.0006  # ~0,15 nível de cinza médio por quadro: abaixo disso o quadro é "quase parado"
parado = d < LIMIAR
janelas = []
i = 0
while i < len(parado):
    if parado[i]:
        j = i
        while j < len(parado) and parado[j]:
            j += 1
        if j - i >= 45:
            janelas.append({"de_s": round((i + 1) / 30, 2), "ate_s": round((j + 1) / 30, 2), "quadros": j - i})
        i = j
    else:
        i += 1
fim_tolerado = len(d) - 45  # últimos 1,5 s (fade para preto) — PROMPT permite ≤ 12 q no respiro final
janelas_validas = [w for w in janelas if w["de_s"] * 30 < fim_tolerado]
ds = uniform_filter1d(d, 3)
piso = float(np.percentile(ds, 25))
picos, _ = find_peaks(ds, prominence=max(0.004, 4 * piso), distance=9)
t = (picos + 1) / 30
pts = np.concatenate([[0], t, [dur_s]])
inter = np.diff(pts)
k_max = int(np.argmax(inter))
res["movimento"] = {
    "diferenca_media_por_quadro": round(float(d.mean()), 5),
    "limiar_quase_parado": LIMIAR,
    "janelas_quase_paradas_>=45q": janelas_validas,
    "n_janelas": len(janelas_validas),
    "maior_trecho_quase_parado_q": int(max([0] + [k for k in (np.diff(np.flatnonzero(np.concatenate([[True], ~parado, [True]]))) - 1)])),
    "mudancas_de_plano": int(len(picos)),
    "mudancas_por_minuto": round(len(picos) / (dur_s / 60), 1),
    "intervalo_medio_s": round(float(np.mean(inter)), 2),
    "maior_trecho_sem_mudanca_s": round(float(np.max(inter)), 2),
    "maior_trecho_sem_mudanca_de_s": round(float(pts[k_max]), 2),
    "por_cena": {},
}
for c in TL["cenas"]:
    a, b = c["from"], c["from"] + c["dur"]
    pc = [p for p in picos + 1 if a <= p < b]
    res["movimento"]["por_cena"][c["id"]] = {
        "mudancas": len(pc),
        "intervalo_medio_s": round(c["dur"] / 30 / max(1, len(pc)), 2),
        "diferenca_media": round(float(d[a:min(b, len(d))].mean()), 5),
    }


# ---------- 2. áudio ----------
def lufs(file, extra=None):
    args = ["-i", file]
    if extra:
        args += extra
    s = ff(args + ["-af", "loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json", "-f", "null", "-"]).stderr
    j = json.loads(s[s.rfind("{"):s.rfind("}") + 1])
    return float(j["input_i"]), float(j["input_tp"]), float(j["input_lra"])


I, TP, LRA = lufs(VIDEO, ["-vn"])
sil = ff(["-i", VIDEO, "-vn", "-af", "silencedetect=n=-45dB:d=1.0", "-f", "null", "-"]).stderr
silencios = [(float(a), float(b)) for a, b in zip(re.findall(r"silence_start: ([\d.]+)", sil), re.findall(r"silence_end: ([\d.]+)", sil))]
silencios_ruins = [s for s in silencios if s[0] < dur_s - 1.5]

# voz × trilha: LUFS de cada camada (arquivos-fonte), aplicando o ducking de −6 dB sob a voz
voz_dir = os.path.join(ROOT, "public", "audio", "voz")
voz_lufs = [lufs(os.path.join(voz_dir, f["id"] + ".mp3"))[0] for f in TL["frases"]]
trilha_I = lufs(os.path.join(ROOT, "public", "audio", "trilha.wav"))[0]
res["audio"] = {
    "lufs_integrado": I, "true_peak_dbtp": TP, "lra": LRA,
    "lufs_ok": abs(I - (-14)) <= 1.0, "true_peak_ok": TP <= -1.0,
    "silencios_>1s_antes_do_fim": silencios_ruins,
    "voz_lufs_media_por_frase": round(float(np.mean(voz_lufs)), 1),
    "trilha_lufs_arquivo": trilha_I,
    "trilha_sob_voz_lufs_estimado": round(trilha_I - 6.0, 1),
    "voz_acima_da_trilha_db": round(float(np.mean(voz_lufs)) - (trilha_I - 6.0), 1),
}

# ---------- 3. texto ----------
tmp_ts = os.path.join(ROOT, "scripts", ".cache", "audit-legendas.mts")
os.makedirs(os.path.dirname(tmp_ts), exist_ok=True)
open(tmp_ts, "w", encoding="utf-8").write("import {auditoriaLegendas} from '../../src/data/legendas.ts';console.log(JSON.stringify(auditoriaLegendas()));\n")
leg = subprocess.run("npx tsx scripts/.cache/audit-legendas.mts", capture_output=True, text=True, encoding="utf-8", cwd=ROOT, shell=True)
try:
    L = json.loads(leg.stdout.strip().splitlines()[-1])
    curtas = [x for x in L if not x["ok"]]
    res["legendas"] = {"blocos": len(L), "abaixo_do_minimo": curtas}
except Exception as e:  # noqa: BLE001
    res["legendas"] = {"erro": str(e), "stderr": leg.stderr[-400:]}
ph = subprocess.run(["node", "scripts/check-placeholders.mjs"], capture_output=True, text=True, encoding="utf-8", cwd=ROOT)
res["placeholders_pendentes"] = re.findall(r"(\[[^\]]+\])", ph.stderr)

out = os.path.join(ROOT, "out", "auditoria.json")
json.dump(res, open(out, "w", encoding="utf-8"), ensure_ascii=False, indent=1)

m = res["movimento"]
a = res["audio"]
print(f"\n== AUDITORIA {res['video']} ==")
print(f"Duração {res['duracao_s']} s · {res['formato']['largura']}×{res['formato']['altura']} @ {res['formato']['fps']} fps · {'OK' if res['duracao_ok'] else 'FALHOU'} · soma das cenas = total: {res['soma_cenas_ok']}")
print(f"Movimento: {m['n_janelas']} janelas ≥ 45 q quase paradas · maior trecho quase parado {m['maior_trecho_quase_parado_q']} q · {m['mudancas_por_minuto']} mudanças/min · intervalo médio {m['intervalo_medio_s']} s · maior sem mudança {m['maior_trecho_sem_mudanca_s']} s (a partir de {m['maior_trecho_sem_mudanca_de_s']} s)")
for cid, v in m["por_cena"].items():
    print(f"   {cid}: {v['mudancas']} mudanças · média {v['intervalo_medio_s']} s · dif. média {v['diferenca_media']}")
for w in m["janelas_quase_paradas_>=45q"]:
    print(f"   ⚠ parado {w['de_s']}–{w['ate_s']} s ({w['quadros']} q)")
print(f"Áudio: {a['lufs_integrado']} LUFS ({'OK' if a['lufs_ok'] else 'FORA'}) · true-peak {a['true_peak_dbtp']} dBTP ({'OK' if a['true_peak_ok'] else 'ALTO'}) · silêncios > 1 s: {len(a['silencios_>1s_antes_do_fim'])} · voz {a['voz_acima_da_trilha_db']} dB acima da trilha")
lg = res.get("legendas", {})
print(f"Legendas: {lg.get('blocos')} blocos · abaixo do tempo mínimo: {len(lg.get('abaixo_do_minimo', []))}")
print(f"Placeholders pendentes: {', '.join(res['placeholders_pendentes']) or 'nenhum'}")
print(f"→ {os.path.relpath(out, ROOT)}")
