#!/usr/bin/env python3
"""
Descarga las fuentes del sistema de diseño y las deja self-hosted.

Plan §6.3: sin CDN externo — privacidad del lector y control del LCP.

Pide **fuentes variables** con rango de peso, no instancias estáticas. Google
sirve el mismo archivo para cada peso solicitado por separado, así que pedir
400/500/600/700 uno a uno descargaba cuatro copias idénticas de 131 KB. Con el
rango se descarga una vez y se declara `font-weight: 400 700`.

Uso:  python scripts/sync-fonts.py
Salida:  static/fonts/*.woff2  +  src/css/fonts.css  (generado, no editar)
"""

import hashlib
import io
import os
import re
import urllib.request

UA = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/120.0 Safari/537.36"
)

# Los woff2 viven bajo src/, no bajo static/, para que los gestione el bundler:
# emite cada archivo con hash de contenido (cacheable para siempre) y las rutas
# no dependen del baseUrl. Un `url()` absoluto aquí rompería el build.
# Las tres familias del Brand book de AXON (v1.0): Newsreader para titulares
# y frases de remate, IBM Plex Sans para el texto, IBM Plex Mono para código y
# antetítulos. Plex Mono no es variable en Google Fonts: se piden sus pesos
# sueltos, y por eso el nombre del archivo lleva el peso.
FAMILIES = {
    # slug              spec de la API css2
    "newsreader": "Newsreader:ital,opsz,wght@0,6..72,300..500;1,6..72,300..500",
    "ibm-plex-sans": "IBM+Plex+Sans:ital,wght@0,300..600;1,300..600",
    "ibm-plex-mono": "IBM+Plex+Mono:ital,wght@0,400;0,500;1,400",
}

# EN y ES no necesitan más.
KEEP_SUBSETS = {"latin", "latin-ext"}

FONT_DIR = "src/fonts"
OUT_CSS = "src/css/fonts.css"


def fetch(url: str) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=60) as r:
        return r.read()


def main() -> None:
    os.makedirs(FONT_DIR, exist_ok=True)
    for stale in os.listdir(FONT_DIR):
        if stale.endswith(".woff2"):
            os.remove(os.path.join(FONT_DIR, stale))

    by_hash: dict[str, str] = {}
    blocks: list[str] = []
    total = 0

    for slug, spec in FAMILIES.items():
        css = fetch(
            f"https://fonts.googleapis.com/css2?family={spec}&display=swap"
        ).decode()

        for subset, block in re.findall(
            r"/\* (\S+) \*/\s*(@font-face \{.*?\})", css, re.S
        ):
            if subset not in KEEP_SUBSETS:
                continue

            family = re.search(r"font-family: '([^']+)'", block).group(1)
            style = re.search(r"font-style: (\w+)", block).group(1)
            weight = re.search(r"font-weight: ([\d ]+);", block).group(1).strip()
            src_url = re.search(r"url\((https://[^)]+)\)", block).group(1)
            urange = re.search(r"unicode-range: ([^;]+);", block).group(1)

            data = fetch(src_url)
            digest = hashlib.sha256(data).hexdigest()

            if digest in by_hash:
                # Mismo archivo que otro bloque: se reutiliza, no se duplica.
                name = by_hash[digest]
            else:
                # Un rango (`300 600`) es un archivo variable; un peso suelto,
                # una instancia: sin el peso en el nombre, dos instancias del
                # mismo estilo se pisarían.
                w = "" if " " in weight else f"-{weight}"
                name = f"{slug}-{style}{w}-{subset}.woff2"
                io.open(os.path.join(FONT_DIR, name), "wb").write(data)
                by_hash[digest] = name
                total += len(data)
                print(f"  {name:44s} {len(data) / 1024:6.1f} KB")

            blocks.append(
                f"/* {family} · {weight} · {style} · {subset} */\n"
                "@font-face {\n"
                f"  font-family: '{family}';\n"
                f"  font-style: {style};\n"
                f"  font-weight: {weight};\n"
                "  font-display: swap;\n"
                f"  src: url('../fonts/{name}') format('woff2');\n"
                f"  unicode-range: {urange};\n"
                "}\n"
            )

    header = (
        "/**\n"
        " * Fuentes self-hosted — GENERADO por scripts/sync-fonts.py.\n"
        " *\n"
        " * No editar a mano: se regenera. Para cambiar familias o pesos, se\n"
        " * edita FAMILIES en el script y se vuelve a ejecutar.\n"
        " */\n\n"
    )
    io.open(OUT_CSS, "w", encoding="utf-8").write(header + "\n".join(blocks))
    print(f"\n{len(by_hash)} archivos · {total / 1024:.0f} KB · {len(blocks)} @font-face")


if __name__ == "__main__":
    main()
