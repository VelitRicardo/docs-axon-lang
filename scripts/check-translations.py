#!/usr/bin/env python3
"""
Estado y calidad de las traducciones al español.

Hace dos cosas que a ojo no se pueden hacer sobre 203 páginas:

1. **Cobertura** — qué páginas tienen versión en español y cuántas palabras
   faltan, por grupo del sidebar.
2. **Inglés residual** — líneas de prosa en las páginas traducidas que siguen en
   inglés. Es el fallo típico de una traducción por bloques: un párrafo que se
   salta y que nadie ve porque la página *parece* traducida.

Lo que NO marca, a propósito: el código, el código en línea, los diagnósticos
del compilador y las tablas de palabras clave. Ahí el inglés es correcto — un
lector que vea `axon-T957` traducido no podría buscarlo.

Uso:  python scripts/check-translations.py [--strict]
      --strict devuelve 1 si hay inglés residual (para el gate de CI)
"""

import argparse
import glob
import io
import os
import re
import sys

ES_ROOT = "i18n/es/docusaurus-plugin-content-docs/current"

# Grupos que D17 fija como traducibles (plan §14-D17).
GRUPOS_ES = ("index.mdx", "quickstart.mdx", "install.mdx", "concepts/", "grammar/", "doctrines/")

# Palabras funcionales inglesas que no aparecen en español correcto.
INGLES = re.compile(
    r"\b(the|and|is|are|was|were|that|which|with|from|this|these|those|"
    r"there|their|when|where|what|would|should|could|have|has|been|"
    r"because|through|between|about|into|other|than|then|they|them)\b"
)


def es_traducible(rel: str) -> bool:
    return any(rel == g or rel.startswith(g) for g in GRUPOS_ES)


def limpiar(texto: str) -> list[str]:
    """Devuelve las líneas de prosa: sin frontmatter, código ni citas literales.

    El descarte se hace sobre el DOCUMENTO ENTERO, no línea a línea. En prosa
    justificada a 80 columnas, tanto el código en línea como una cita se parten
    a mitad:

        …un `retrieve CrmTokens where "expires_at <
        now() + interval '10 minutes'"`…

    Un filtro por líneas solo limpia la mitad y denuncia la otra como inglés
    residual — dos falsos positivos que costaron más que arreglar la causa.
    """
    texto = re.sub(r"^---\n.*?\n---\n", "", texto, flags=re.S)
    texto = re.sub(r"```.*?```", "", texto, flags=re.S)
    # Código en línea, aunque envuelva.
    texto = re.sub(r"`[^`]*`", " ", texto, flags=re.S)
    # Citas literales: los diagnósticos del compilador se dejan en inglés a
    # propósito (ver planner/glosario-es.md). Se acota a tres saltos de línea
    # para que unas comillas desparejadas no se coman media página.
    texto = re.sub(r"[\"“](?:[^\"”\n]*\n?){0,3}[^\"”\n]*[\"”]", " ", texto)

    lineas = []
    for linea in texto.split("\n"):
        # Las tablas suelen ser catálogos de palabras clave: no se traducen.
        if linea.lstrip().startswith(("|", ">", "    ")):
            continue
        if linea.strip():
            lineas.append(linea.strip())
    return lineas


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--strict", action="store_true")
    args = ap.parse_args()

    traducidas, pendientes, sospechosas = [], [], []
    palabras_es = palabras_pendientes = 0

    for src in sorted(glob.glob("docs/**/*.mdx", recursive=True)):
        rel = os.path.relpath(src, "docs").replace("\\", "/")
        if not es_traducible(rel):
            continue
        destino = os.path.join(ES_ROOT, rel)
        n = len(io.open(src, encoding="utf-8").read().split())
        if not os.path.exists(destino):
            pendientes.append(rel)
            palabras_pendientes += n
            continue
        traducidas.append(rel)
        palabras_es += n
        residual = [l for l in limpiar(io.open(destino, encoding="utf-8").read())
                    if INGLES.search(l)]
        if residual:
            sospechosas.append((rel, residual))

    total = len(traducidas) + len(pendientes)
    print(f"COBERTURA  {len(traducidas)}/{total} páginas · "
          f"{palabras_es} palabras traducidas · {palabras_pendientes} pendientes")

    if pendientes:
        print(f"\nPENDIENTES ({len(pendientes)}):")
        for rel in pendientes[:12]:
            print(f"  {rel}")
        if len(pendientes) > 12:
            print(f"  … y {len(pendientes) - 12} más")

    if sospechosas:
        print(f"\nINGLÉS RESIDUAL en {len(sospechosas)} página(s):")
        for rel, lineas in sospechosas:
            print(f"  {rel} — {len(lineas)} línea(s)")
            for l in lineas[:3]:
                print(f"      {l[:92]}")
    else:
        print("\nSin inglés residual en lo traducido.")

    return 1 if (args.strict and sospechosas) else 0


if __name__ == "__main__":
    sys.exit(main())
