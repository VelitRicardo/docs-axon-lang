#!/usr/bin/env python3
"""
Impone la regla del centro de control: un solo archivo con literales de estilo.

Plan §6.1. `src/css/tokens.css` es el ÚNICO archivo autorizado a contener un
literal de color, sombra, radio o duración. Todo lo demás consume variables
semánticas.

Sin esto, la regla es una intención: el primer `#fff` que alguien escriba en un
componente no rompe nada visible, y a los seis meses hay treinta y el centro de
control ya no controla nada.

Qué se busca, y por qué esos y no otros:

  · **colores** — hex, `rgb()`, `hsl()` y los nombres CSS más habituales. Es el
    literal que más se cuela y el que más rompe el modo oscuro.
  · **sombras** — `box-shadow` con un valor que no sea una variable o `none`.
    La estética es de imprenta: filete, no sombra.
  · **radios** — `border-radius` con un valor suelto, salvo `0` y `50%`, que no
    tienen token porque no son decisiones de escala.

Uso:  python scripts/check-tokens.py
"""

import glob
import io
import re
import sys

PERMITIDO = "src/css/tokens.css"

# Los woff2 y el reset traen literales que no son decisiones nuestras.
IGNORAR = ("src/css/fonts.css",)

COLOR = re.compile(
    r"(#[0-9a-fA-F]{3,8}\b"
    r"|\brgba?\s*\("
    r"|\bhsla?\s*\("
    r"|:\s*(?:white|black|red|blue|green|gray|grey|silver|navy|teal)\b)"
)

# Se extrae el VALOR y se comprueba aparte, en vez de con un lookahead negativo
# tras `\s*`: el cuantificador cede espacios al retroceder, así que
# `border-radius: var(--radius)` casaba con `(?!var\()` — el lookahead miraba
# " var(" y no "var(". Un falso positivo en cada línea correcta.
PROPIEDAD = re.compile(r"\b(box-shadow|border-radius)\s*:\s*([^;{}]+)")

# Valores que no son decisiones de escala y por tanto no tienen token.
NEUTROS = {"none", "0", "0px", "50%", "inherit", "initial", "unset"}


def main() -> int:
    objetivos = sorted(
        set(glob.glob("src/**/*.css", recursive=True))
        | set(glob.glob("src/**/*.tsx", recursive=True))
        | set(glob.glob("src/**/*.ts", recursive=True))
        | {"docusaurus.config.ts"}
    )

    hallazgos = []
    revisados = 0

    for ruta in objetivos:
        norm = ruta.replace("\\", "/")
        if norm == PERMITIDO or norm in IGNORAR:
            continue
        revisados += 1
        for n, linea in enumerate(io.open(ruta, encoding="utf-8"), 1):
            # Un literal dentro de un comentario es documentación, no estilo.
            sin_comentario = re.sub(r"/\*.*?\*/", "", linea)
            sin_comentario = re.sub(r"//.*$", "", sin_comentario)
            if COLOR.search(sin_comentario):
                hallazgos.append((norm, n, "color", linea.strip()[:78]))

            for m in PROPIEDAD.finditer(sin_comentario):
                propiedad, valor = m.group(1), m.group(2).strip()
                if valor.startswith("var(") or valor in NEUTROS:
                    continue
                clase = "sombra" if propiedad == "box-shadow" else "radio"
                hallazgos.append((norm, n, clase, linea.strip()[:78]))

    if hallazgos:
        print(f"{len(hallazgos)} literal(es) fuera de {PERMITIDO}:\n")
        for ruta, n, clase, texto in hallazgos:
            print(f"  {ruta}:{n}  [{clase}]")
            print(f"      {texto}")
        print(f"\nUsa un token semántico. Si hace falta uno nuevo, se declara en {PERMITIDO}.")
        return 1

    print(f"{revisados} archivo(s) revisados · ningún literal de estilo fuera de {PERMITIDO}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
