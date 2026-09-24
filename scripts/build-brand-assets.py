"""
Genera los favicons y las imágenes Open Graph desde una sola fuente.

    python scripts/build-brand-assets.py

Fuente: `brand/axon-icon-source.webp` — el render 3D del isotipo (1080², fondo
transparente). No se publica; lo que llega al build es lo que sale de aquí.

SISTEMA VISUAL. Todo lo que sale de aquí sigue el *Brand book* de AXON (v1.0,
septiembre 2026): hueso y tinta como únicos fondos, terracota como único
acento, Newsreader para titulares y frases de remate, IBM Plex Mono para
antetítulos en versalitas (la OG no lleva cuerpo de texto, así que Plex Sans
no entra). Sin degradados, sin sombras, sin esquinas
redondeadas; reglas de 1px y un solo filete de 3px. Ojo: la doc (tokens.css)
todavía usa el sistema anterior —navy y neón—; estas imágenes ya no.

POR QUÉ SE VECTORIZA EL ISOTIPO. A 16–48 px la textura y el sombreado del
render se convierten en ruido: lo que se lee es la silueta. Y el brand book
prohíbe degradados y sombras, que es justo lo que el render tiene. Así que se
traza la silueta (alfa > 50 %) y todo —favicon y OG— sale de ese trazo, en
terracota plano.

Salida (todo en static/img/):
    favicon.svg            trazo vectorial, terracota
    favicon.ico            16 · 32 · 48
    apple-touch-icon.png   180, sobre hueso (iOS rellena de negro la transparencia)
    icon-512.png           para el logo del JSON-LD
    og/axon-en.png         1200×630
    og/axon-es.png         1200×630

Requiere: pillow, numpy, opencv-python, playwright y Chrome instalado. Las
fuentes de la OG se cargan de Google Fonts al renderizar: hace falta red.
"""

from __future__ import annotations

import io
from pathlib import Path

import cv2
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / 'brand' / 'axon-icon-source.webp'
OUT = ROOT / 'static' / 'img'

# Brand book v1.0 — paleta exacta. Nada fuera de esta lista.
HUESO = '#F4F4F1'  # fondo claro
LINEA = '#D9D8D2'  # reglas de 1px sobre hueso
GRIS_MEDIO = '#6B7075'  # metadatos, pie
GRIS_PROFUNDO = '#3C4045'  # cuerpo largo sobre hueso
TINTA = '#1F2225'  # titulares y fondo oscuro
TERRACOTA = '#B4462F'  # acento único sobre hueso
TERRACOTA_CLARO = '#E8A08E'  # el mismo acento sobre tinta

# Margen del isotipo dentro del cuadrado del favicon, por lado.
FAVICON_PAD = 0.04
TOUCH_PAD = 0.16


def load_source() -> np.ndarray:
    return np.array(Image.open(SRC).convert('RGBA'))


def trace(rgba: np.ndarray) -> tuple[list[np.ndarray], tuple[int, int, int, int]]:
    """Contornos exteriores de la silueta, simplificados a ~0.6 px de error."""
    alpha = cv2.GaussianBlur(rgba[..., 3], (5, 5), 0)
    mask = (alpha > 127).astype(np.uint8)
    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
    contours = [cv2.approxPolyDP(c, 0.6, True)[:, 0, :] for c in contours]
    x, y, w, h = cv2.boundingRect(np.vstack(contours))
    return contours, (x, y, w, h)


def square_box(bbox, pad: float) -> tuple[float, float, float]:
    """Cuadrado centrado en el bbox, con `pad` de margen por lado."""
    x, y, w, h = bbox
    side = max(w, h) / (1 - 2 * pad)
    return x + w / 2 - side / 2, y + h / 2 - side / 2, side


def mark_svg(contours, bbox, color: str, pad: float) -> str:
    ox, oy, side = square_box(bbox, pad)
    d = ''.join(
        'M' + ' '.join(f'{px - ox:.1f} {py - oy:.1f}' for px, py in c) + 'Z'
        for c in contours
    )
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {side:.1f} {side:.1f}">'
        f'<title>AXON</title><path fill="{color}" d="{d}"/></svg>'
    )


def raster(contours, bbox, color: str, size: int, pad: float, bg: str | None) -> Image.Image:
    """Rellena el trazo a 8× y reduce con Lanczos: antialias limpio sin cairo."""
    ss = size * 8
    ox, oy, side = square_box(bbox, pad)
    k = ss / side
    pts = [np.round((c - [ox, oy]) * k).astype(np.int32) for c in contours]
    mask = np.zeros((ss, ss), np.uint8)
    cv2.fillPoly(mask, pts, 255, lineType=cv2.LINE_AA)
    rgb = tuple(int(color[i:i + 2], 16) for i in (1, 3, 5))
    layer = Image.new('RGBA', (ss, ss), rgb + (0,))
    layer.putalpha(Image.fromarray(mask))
    layer = layer.resize((size, size), Image.LANCZOS)
    if bg is None:
        return layer
    base = Image.new('RGBA', (size, size), bg)
    base.alpha_composite(layer)
    return base.convert('RGB')


OG_COPY = {
    'en': {
        'eyebrow': 'axon-lang · documentation',
        'title': 'The language that compiles to LLMs',
        'claim': 'A program that sends regulated data across an unguarded boundary does not compile.',
    },
    'es': {
        'eyebrow': 'axon-lang · documentación',
        'title': 'El lenguaje que compila a LLMs',
        'claim': 'Un programa que envía datos regulados a través de una frontera sin guardia no compila.',
    },
}

FONTS_URL = (
    'https://fonts.googleapis.com/css2?'
    'family=Newsreader:ital,opsz,wght@0,6..72,400;1,6..72,400'
    '&family=IBM+Plex+Mono:wght@500&display=block'
)


def og_html(lang: str, mark: str) -> str:
    """
    Dos bloques, los dos fondos del sistema: hueso con el texto, tinta con el
    isotipo en terracota claro (el acento sobre tinta). Escala del brand book
    llevada de 1920 a 1200 (×0.625): titular de portada 104 → 65 px, frase de
    remate 34–42 → 25 px, antetítulo 22–26 → 15 px.
    """
    c = OG_COPY[lang]
    return f"""<!doctype html><html lang="{lang}"><head><meta charset="utf-8">
<link rel="stylesheet" href="{FONTS_URL}"><style>
*{{margin:0;box-sizing:border-box}}
body{{width:1200px;height:630px;display:flex;background:{HUESO};overflow:hidden}}
.copy{{flex:1;padding:60px 64px 48px 72px;display:flex;flex-direction:column}}
.eyebrow{{font:500 15px/1 'IBM Plex Mono',monospace;letter-spacing:.2em;text-transform:uppercase;color:{TERRACOTA}}}
.wordmark{{font:400 30px/1 'Newsreader',serif;color:{TINTA};margin-top:44px}}
h1{{font:400 65px/1.04 'Newsreader',serif;letter-spacing:-.02em;color:{TINTA};margin-top:14px}}
.claim{{margin-top:34px;padding-left:20px;border-left:3px solid {TERRACOTA};
  font:italic 400 25px/1.35 'Newsreader',serif;color:{GRIS_PROFUNDO}}}
.foot{{margin-top:auto;padding-top:18px;border-top:1px solid {LINEA};
  font:500 15px/1 'IBM Plex Mono',monospace;letter-spacing:.12em;color:{GRIS_MEDIO}}}
.panel{{width:420px;background:{TINTA};display:flex;align-items:center;justify-content:center}}
.panel svg{{width:330px;height:330px}}
</style></head><body>
<div class="copy">
  <div class="eyebrow">{c['eyebrow']}</div>
  <div class="wordmark">AXON</div>
  <h1>{c['title']}</h1>
  <p class="claim">{c['claim']}</p>
  <div class="foot">ricardovelit.com/axon-docs</div>
</div>
<div class="panel">{mark}</div>
</body></html>"""


def write_og(contours, bbox) -> None:
    from playwright.sync_api import sync_playwright

    mark = mark_svg(contours, bbox, TERRACOTA_CLARO, 0)
    (OUT / 'og').mkdir(exist_ok=True)
    with sync_playwright() as p:
        # El Chrome del sistema: evita descargar el de Playwright solo para esto.
        browser = p.chromium.launch(channel='chrome')
        page = browser.new_page(viewport={'width': 1200, 'height': 630})
        for lang in OG_COPY:
            page.set_content(og_html(lang, mark), wait_until='networkidle')
            page.evaluate('document.fonts.ready')
            loaded = page.evaluate(
                "['Newsreader','IBM Plex Mono']"
                ".every(f => document.fonts.check(`16px '${f}'`))"
            )
            if not loaded:
                raise SystemExit('Las fuentes del brand book no cargaron (¿sin red?).')
            png = page.screenshot()
            # Sin alfa y optimizado: los scrapers de redes pesan cada KB.
            Image.open(io.BytesIO(png)).convert('RGB').save(
                OUT / 'og' / f'axon-{lang}.png', optimize=True
            )
        browser.close()


def main() -> None:
    rgba = load_source()
    contours, bbox = trace(rgba)

    (OUT / 'favicon.svg').write_text(
        mark_svg(contours, bbox, TERRACOTA, FAVICON_PAD) + '\n', encoding='utf-8'
    )
    icons = [raster(contours, bbox, TERRACOTA, s, FAVICON_PAD, None) for s in (48, 32, 16)]
    icons[0].save(OUT / 'favicon.ico', sizes=[(48, 48), (32, 32), (16, 16)], append_images=icons[1:])
    raster(contours, bbox, TERRACOTA, 180, TOUCH_PAD, HUESO).save(OUT / 'apple-touch-icon.png', optimize=True)
    raster(contours, bbox, TERRACOTA, 512, FAVICON_PAD, None).save(OUT / 'icon-512.png', optimize=True)
    write_og(contours, bbox)

    print(f'{len(contours)} contornos · {sum(len(c) for c in contours)} vértices')


if __name__ == '__main__':
    main()
