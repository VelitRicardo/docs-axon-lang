#!/usr/bin/env python3
"""
Verifica que el código de las páginas traducidas no se haya alterado.

La regla, y la distinción que la hace útil:

  · **Código y artefactos normativos: idénticos byte a byte.** Comandos,
    declaraciones, EBNF, tipos de sesión, diagnósticos del compilador. Traducir
    una gramática formal o un mensaje de error no es traducir, es introducir un
    error — y el lector no podría buscarlo.

  · **Comentarios dentro de ejemplos ilustrativos: se traducen.** Un comentario
    que explica qué hace la línea es prosa para el lector, no parte del
    artefacto. `# verificación de cumplimiento en compilación` ayuda; el comando
    de al lado sigue siendo idéntico.

Este script permite lo segundo y falla ante lo primero, así que la garantía deja
de depender de que alguien mire el diff.

Limitación conocida: un `#` o `//` dentro de una cadena se trata como comentario.
En este corpus no ocurre; si ocurriera, el script sería permisivo de más en esa
línea, nunca restrictivo de más.

Uso:  python scripts/check-code-blocks.py
"""

import glob
import io
import os
import re
import sys

ES_ROOT = "i18n/es/docusaurus-plugin-content-docs/current"

# Bloques cuyo contenido es normativo: ni siquiera los comentarios se tocan.
NORMATIVOS = ("ebnf", "json")


def bloques(texto: str) -> list[tuple[str, str]]:
    """Devuelve (lenguaje, cuerpo) de cada bloque cercado."""
    salida = []
    for m in re.finditer(r"```([a-zA-Z]*)[^\n]*\n(.*?)```", texto, re.S):
        salida.append((m.group(1).lower(), m.group(2)))
    return salida


def sin_comentarios(cuerpo: str) -> str:
    lineas = []
    for linea in cuerpo.split("\n"):
        linea = re.sub(r"\s*(#|//).*$", "", linea)
        lineas.append(linea.rstrip())
    return "\n".join(lineas)


def main() -> int:
    fallos = comentarios_traducidos = revisados = 0

    for es_path in sorted(glob.glob(f"{ES_ROOT}/**/*.mdx", recursive=True)):
        rel = os.path.relpath(es_path, ES_ROOT).replace("\\", "/")
        en_path = os.path.join("docs", rel)
        if not os.path.exists(en_path):
            print(f"  HUÉRFANA  {rel} — no existe el original")
            fallos += 1
            continue

        en = bloques(io.open(en_path, encoding="utf-8").read())
        es = bloques(io.open(es_path, encoding="utf-8").read())
        revisados += 1

        if len(en) != len(es):
            print(f"  FALLO  {rel} — {len(en)} bloques en EN, {len(es)} en ES")
            fallos += 1
            continue

        for i, ((lang_en, cuerpo_en), (lang_es, cuerpo_es)) in enumerate(zip(en, es)):
            if cuerpo_en == cuerpo_es:
                continue
            if lang_en in NORMATIVOS:
                print(f"  FALLO  {rel} bloque {i + 1} ({lang_en}) — normativo y alterado")
                fallos += 1
            elif sin_comentarios(cuerpo_en) == sin_comentarios(cuerpo_es):
                comentarios_traducidos += 1
            else:
                print(f"  FALLO  {rel} bloque {i + 1} — el código difiere, no solo el comentario")
                fallos += 1

    print(
        f"\n{revisados} páginas revisadas · "
        f"{comentarios_traducidos} bloque(s) con comentarios traducidos (permitido) · "
        f"{fallos} fallo(s)"
    )
    return 1 if fallos else 0


if __name__ == "__main__":
    sys.exit(main())
