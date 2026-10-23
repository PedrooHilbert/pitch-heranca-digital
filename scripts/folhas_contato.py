"""Junta os stills da revisão (out/revisao/stills/*.png) em folhas de contato 4×4 com rótulo
(tempo · quadro · cena) e linhas-guia da margem de segurança de 80 px. Uso: python scripts/folhas_contato.py"""
import glob
import os
import sys

from PIL import Image, ImageDraw, ImageFont

sys.stdout.reconfigure(encoding="utf-8")
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "out", "revisao", "stills")
OUT = os.path.join(ROOT, "out", "revisao", "folhas")
os.makedirs(OUT, exist_ok=True)
COLS, ROWS = 4, 4
TW, TH = 480, 270
LAB = 26
try:
    FONT = ImageFont.truetype("arialbd.ttf", 17)
except OSError:
    FONT = ImageFont.load_default()

arqs = sorted(glob.glob(os.path.join(SRC, "*.png")))
por = COLS * ROWS
for k in range(0, len(arqs), por):
    folha = Image.new("RGB", (COLS * TW, ROWS * (TH + LAB)), (20, 20, 20))
    d = ImageDraw.Draw(folha)
    for i, a in enumerate(arqs[k:k + por]):
        im = Image.open(a).convert("RGB").resize((TW, TH))
        x = (i % COLS) * TW
        y = (i // COLS) * (TH + LAB)
        folha.paste(im, (x, y + LAB))
        # margem de segurança 80 px (em 1920) → 20 px na miniatura
        m = 80 * TW / 1920
        d.rectangle([x + m, y + LAB + m, x + TW - m, y + LAB + TH - m], outline=(255, 0, 255), width=1)
        nome = os.path.basename(a)[:-4]  # f0000_00-00_0_s1
        f, t, c = nome.split("_")[0][1:], nome.split("_", 1)[1].rsplit("_", 1)[0], nome.rsplit("_", 1)[1]
        mm, ss = t.split("-")
        d.text((x + 6, y + 4), f"{mm}:{ss.replace('_', '.')}  ·  q{int(f)}  ·  {c}", fill=(255, 230, 120), font=FONT)
    n = k // por + 1
    folha.save(os.path.join(OUT, f"folha_{n:02d}.png"))
print(f"{(len(arqs) + por - 1) // por} folhas em {OUT} ({len(arqs)} stills)")
