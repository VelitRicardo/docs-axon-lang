"""
Genera los favicons y las imágenes Open Graph desde una sola fuente.

    python scripts/build-brand-assets.py

Fuente: `brand/axon-icon-source.webp` — el render 3D del isotipo (1080², fondo
transparente). No se publica; lo que llega al build es lo que sale de aquí.

POR QUÉ SE VECTORIZA Y NO SE REDUCE EL RENDER. A 16–48 px la textura y el
sombreado del render se convierten en ruido marrón: lo que se lee es la silueta.
Así que se traza la silueta (alfa > 50 %) y todo favicon sale de ese trazo en
un color plano, el mediano de los píxeles opacos del render. El render entero
solo se usa donde hay sitio para verlo: la imagen OG.

Salida (todo en static/img/):
    favicon.svg            trazo vectorial, color plano
    favicon.ico            16 · 32 · 48
    apple-touch-icon.png   180, sobre papel (iOS rellena de negro la transparencia)
    icon-512.png           para el manifest y el logo del JSON-LD
    og/axon-en.png         1200×630
    og/axon-es.png         1200×630

Requiere: pillow, numpy, opencv-python, playwright (con chromium instalado).
"""

from __future__ import annotations

import base64
from pathlib import Path

import cv2
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / 'brand' / 'axon-icon-source.webp'
OUT = ROOT / 'static' / 'img'
FONTS = ROOT / 'src' / 'fonts'

# Papel y tinta del sistema (src/css/tokens.css). Se repiten aquí porque este
# script no lee CSS; si cambian allí, cambian aquí.
PAPER = '#fbf9f5'
NAVY = '#17246b'
INK_MUTED = '#4a4f57'
NEON = '#00c458'

# Margen del isotipo dentro del cuadrado del favicon, por lado.
FAVICON_PAD = 0.04
TOUCH_PAD = 0.16


def load_source() -> np.ndarray:
    return np.array(Image.open(SRC).convert('RGBA'))


def mark_color(rgba: np.ndarray) -> str:
    opaque = rgba[rgba[..., 3] > 250][:, :3]
    r, g, b = (int(v) for v in np.median(opaque, axis=0))
    return f'#{r:02x}{g:02x}{b:02x}'


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


def write_svg(contours, bbox, color: str) -> None:
    ox, oy, side = square_box(bbox, FAVICON_PAD)
    d = ''.join(
        'M' + ' '.join(f'{px - ox:.1f} {py - oy:.1f}' for px, py in c) + 'Z'
        for c in contours
    )
    svg = (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {side:.1f} {side:.1f}">'
        f'<title>AXON</title><path fill="{color}" d="{d}"/></svg>\n'
    )
    (OUT / 'favicon.svg').write_text(svg, encoding='utf-8')


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


def font_face(family: str, file: str, style: str = 'normal') -> str:
    data = base64.b64encode((FONTS / file).read_bytes()).decode()
    return (
        f"@font-face{{font-family:'{family}';font-style:{style};"
        f"src:url(data:font/woff2;base64,{data}) format('woff2');}}"
    )


OG_COPY = {
    'en': {
        'eyebrow': 'axon-lang · documentation',
        'title': 'The language that<br>compiles to <em>LLMs</em>',
        'claim': 'A program that sends regulated data across an unguarded boundary does not compile.',
    },
    'es': {
        'eyebrow': 'axon-lang · documentación',
        'title': 'El lenguaje que<br>compila a <em>LLMs</em>',
        'claim': 'Un programa que envía datos regulados a través de una frontera sin guardia no compila.',
    },
}


def og_html(lang: str, mark_png: str) -> str:
    c = OG_COPY[lang]
    fonts = (
        font_face('Instrument Serif', 'instrument-serif-normal-latin.woff2')
        + font_face('Instrument Serif', 'instrument-serif-italic-latin.woff2', 'italic')
        + font_face('Inter Tight', 'inter-tight-normal-latin.woff2')
        + font_face('JetBrains Mono', 'jetbrains-mono-normal-latin.woff2')
    )
    return f"""<!doctype html><html lang="{lang}"><head><meta charset="utf-8"><style>
{fonts}
*{{margin:0;box-sizing:border-box}}
body{{width:1200px;height:630px;background:{PAPER};position:relative;overflow:hidden;
  font-family:'Inter Tight',sans-serif;color:{NAVY}}}
.mark{{position:absolute;right:56px;top:50%;transform:translateY(-50%);width:430px}}
.copy{{position:absolute;left:80px;top:78px;width:640px}}
.eyebrow{{font-family:'JetBrains Mono',monospace;font-size:22px;letter-spacing:.02em;color:{INK_MUTED}}}
.wordmark{{font-family:'Instrument Serif',serif;font-size:44px;margin-top:34px}}
h1{{font-family:'Instrument Serif',serif;font-weight:400;font-size:84px;line-height:1.02;margin-top:6px}}
h1 em{{font-style:italic}}
.rule{{width:132px;height:6px;background:{NEON};margin:34px 0 26px}}
.claim{{font-size:25px;line-height:1.4;color:{INK_MUTED};width:600px}}
.url{{position:absolute;left:80px;bottom:52px;font-family:'JetBrains Mono',monospace;font-size:20px;color:{INK_MUTED}}}
</style></head><body>
<img class="mark" src="data:image/png;base64,{mark_png}">
<div class="copy">
  <div class="eyebrow">{c['eyebrow']}</div>
  <div class="wordmark">AXON</div>
  <h1>{c['title']}</h1>
  <div class="rule"></div>
  <p class="claim">{c['claim']}</p>
</div>
<div class="url">ricardovelit.com/axon-docs</div>
</body></html>"""


def write_og(rgba: np.ndarray, bbox) -> None:
    from playwright.sync_api import sync_playwright

    x, y, w, h = bbox
    crop = Image.fromarray(rgba).crop((x, y, x + w, y + h))
    buf = __import__('io').BytesIO()
    crop.save(buf, 'PNG')
    mark_png = base64.b64encode(buf.getvalue()).decode()

    (OUT / 'og').mkdir(exist_ok=True)
    with sync_playwright() as p:
        # El Chrome del sistema: evita descargar el de Playwright solo para esto.
        browser = p.chromium.launch(channel='chrome')
        page = browser.new_page(viewport={'width': 1200, 'height': 630})
        for lang in OG_COPY:
            page.set_content(og_html(lang, mark_png))
            page.evaluate('document.fonts.ready')
            tmp = OUT / 'og' / f'axon-{lang}.tmp.png'
            page.screenshot(path=str(tmp))
            # Sin alfa y optimizado: los scrapers de redes pesan cada KB.
            Image.open(tmp).convert('RGB').save(
                OUT / 'og' / f'axon-{lang}.png', optimize=True
            )
            tmp.unlink()
        browser.close()


def main() -> None:
    rgba = load_source()
    color = mark_color(rgba)
    contours, bbox = trace(rgba)

    write_svg(contours, bbox, color)
    icons = [raster(contours, bbox, color, s, FAVICON_PAD, None) for s in (48, 32, 16)]
    icons[0].save(OUT / 'favicon.ico', sizes=[(48, 48), (32, 32), (16, 16)], append_images=icons[1:])
    raster(contours, bbox, color, 180, TOUCH_PAD, PAPER).save(OUT / 'apple-touch-icon.png', optimize=True)
    raster(contours, bbox, color, 512, FAVICON_PAD, None).save(OUT / 'icon-512.png', optimize=True)
    write_og(rgba, bbox)

    print(f'color {color} · {len(contours)} contornos · '
          f'{sum(len(c) for c in contours)} vértices')


if __name__ == '__main__':
    main()
