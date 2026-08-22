#!/usr/bin/env python3
"""
Extrae los bloques ```axon del corpus para pasarlos por `axon check`.

Plan §5: la doc se contrasta contra el compilador, no contra sí misma. Un
ejemplo que dejó de compilar hace tres versiones se lee exactamente igual de
bien que uno correcto — ese es el modo de fallo que este script existe para
hacer imposible.

**No todos los snippets son programas.** La mayoría son fragmentos que ilustran
una declaración suelta, y un fragmento no compila por sí mismo. Marcar eso como
error convertiría el gate en ruido, así que se separan:

  · **completos** — el bloque contiene al menos una declaración de nivel
    superior que abre y cierra. Se pasan por `axon check`.
  · **fragmentos** — el resto. Se cuentan y se listan, no se verifican.

Un bloque puede declararse fragmento a propósito con `title="fragment"` en la
cerca, para los casos en que la heurística se equivoque.

Uso:
    python scripts/extract-snippets.py --out <dir>
    python scripts/extract-snippets.py --out <dir> --report
"""

import argparse
import glob
import io
import os
import re
import shutil

# Un bloque es "completo" si empieza por una declaración de nivel superior.
# La lista sale del lexer del compilador (ver scripts/sync-grammar.py).
DECLARACIONES = (
    "persona", "context", "flow", "anchor", "tool", "type", "agent", "shield",
    "axonendpoint", "axonstore", "session", "socket", "daemon", "channel",
    "mandate", "compute", "lambda", "corpus", "dataspace", "memory", "intent",
    "witness", "credential", "notify", "deliver", "document", "ledger", "pix",
    "psyche", "savant", "resource", "fabric", "manifest", "ensemble", "lease",
    "observe", "reconcile", "immune", "topology", "weave", "effect", "cors",
    "extension", "component", "corpus", "probe", "scope", "synth", "voice",
)


def es_completo(cuerpo: str) -> bool:
    lineas = [l for l in cuerpo.split("\n") if l.strip() and not l.lstrip().startswith(("#", "//"))]
    if not lineas:
        return False
    primera = lineas[0].lstrip()
    if not primera.startswith(DECLARACIONES):
        return False
    # Llaves equilibradas: un fragmento con `…` dentro suele quedar abierto.
    return cuerpo.count("{") == cuerpo.count("}") and "…" not in cuerpo


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", default="build/snippets")
    ap.add_argument("--report", action="store_true")
    args = ap.parse_args()

    if os.path.isdir(args.out):
        shutil.rmtree(args.out)
    os.makedirs(args.out, exist_ok=True)

    completos = fragmentos = 0
    detalle = []

    for ruta in sorted(glob.glob("docs/**/*.mdx", recursive=True)):
        texto = io.open(ruta, encoding="utf-8").read()
        for n, m in enumerate(re.finditer(r"```axon([^\n]*)\n(.*?)```", texto, re.S), 1):
            info, cuerpo = m.group(1), m.group(2)
            rel = os.path.relpath(ruta, "docs").replace("\\", "/")
            if "fragment" in info or not es_completo(cuerpo):
                fragmentos += 1
                detalle.append(("fragmento", rel, n))
                continue
            nombre = rel.replace("/", "__").replace(".mdx", "") + f"__{n}.axon"
            io.open(os.path.join(args.out, nombre), "w", encoding="utf-8", newline="\n").write(cuerpo)
            completos += 1
            detalle.append(("completo", rel, n))

    print(f"{completos} snippet(s) completo(s) escritos en {args.out}/")
    print(f"{fragmentos} fragmento(s) omitido(s) — ilustran una parte, no un programa")

    if args.report:
        print("\nDetalle:")
        for clase, rel, n in detalle:
            print(f"  {clase:10s} {rel}#{n}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
