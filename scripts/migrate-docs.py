#!/usr/bin/env python3
"""
Migra el corpus de `axon-lang/docs/` (Mintlify) a este sitio.

Plan §5.8. Mintlify se descarta; las 203 páginas se mueven aquí.

**Principio: no se toca el cuerpo de las páginas.** Lo único que se reescribe
es lo que dejaría de funcionar por el cambio de plataforma:

  · rutas de imagen `/images/…` → `/img/…`
  · `slug: /` en la portada, que en Mintlify es implícito
  · nada más

Los componentes de Mintlify (`<Info>`, `<Card>`, `<Steps>`…) NO se convierten:
se implementan como componentes propios en `src/components/Mintlify`, con la
misma API. Reescribir 109k palabras para cambiar de sintaxis sería la mejor
forma de meter erratas en algo que así es mecánico y auditable.

El sidebar se genera desde `docs.json`, que ya tiene la arquitectura de
información decidida por el autor.

Uso:
    python scripts/migrate-docs.py --source <ruta-al-repo-axon-lang>
    python scripts/migrate-docs.py --source ... --dry-run
"""

import argparse
import io
import json
import os
import re
import shutil

# Páginas propias del andamiaje que el corpus sustituye.
ANDAMIAJE = {
    "getting-started/what-is-axon.mdx",
    "getting-started/install.mdx",
    "language/overview.mdx",
    "runtime/overview.mdx",
    "tooling/cli.mdx",
    "editions/frontier.mdx",
    "index.mdx",
}

# Se conserva: es control de regresión del resaltado, no contenido.
CONSERVAR = {"syntax-check.mdx"}


def migrar_frontmatter(texto: str, es_portada: bool) -> tuple[str, list[str]]:
    """Ajusta solo lo imprescindible del frontmatter."""
    cambios = []
    m = re.match(r"^---\n(.*?)\n---\n", texto, re.S)
    if not m:
        return texto, ["sin frontmatter"]

    fm = m.group(1)
    if es_portada and "slug:" not in fm:
        fm += "\nslug: /"
        cambios.append("slug: /")

    return texto[: m.start()] + f"---\n{fm}\n---\n" + texto[m.end() :], cambios


# Enlaces que en Mintlify apuntaban a archivos del repo y aquí no existen.
# Se listan uno a uno, con su destino, en lugar de aplicar una regla general:
# son dos casos en 203 páginas y una heurística podría reescribir de más.
ENLACES = [
    # (origen, destino, por qué)
    (
        "](../README.md)",
        "](https://github.com/VelitRicardo/axon-lang/blob/master/src/README.md)",
        "apuntaba a un archivo del repo, no a una página",
    ),
    (
        "](axonendpoint.md)",
        "](axonendpoint)",
        "extensión .md: en Mintlify resolvía, aquí no",
    ),
]


def migrar_cuerpo(texto: str) -> tuple[str, list[str]]:
    cambios = []
    nuevo, n = re.subn(r"(?<=[\"'(])/images/", "/img/", texto)
    if n:
        cambios.append(f"{n} ruta(s) de imagen")

    for origen, destino, motivo in ENLACES:
        if origen in nuevo:
            nuevo = nuevo.replace(origen, destino)
            cambios.append(f"enlace {origen.strip('](')}: {motivo}")

    return nuevo, cambios


def generar_sidebar(docs_json: dict) -> str:
    grupos = docs_json["navigation"]["groups"]
    lineas = [
        "import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';",
        "",
        "/**",
        " * Sidebar GENERADO por scripts/migrate-docs.py desde el `docs.json` del",
        " * repo del lenguaje.",
        " *",
        " * La arquitectura de información es una decisión editorial que el autor ya",
        " * tomó en el corpus. Reordenarla aquí a mano crearía una segunda verdad que",
        " * se desincronizaría en la primera página nueva.",
        " */",
        "const sidebars: SidebarsConfig = {",
        "  docs: [",
    ]

    for grupo in grupos:
        paginas = grupo.get("pages", [])
        if not paginas:
            continue
        etiqueta = grupo["group"].replace("'", "\\'")
        # El primer grupo abre desplegado; el resto, plegado.
        colapsado = "false" if grupo is grupos[0] else "true"
        lineas.append("    {")
        lineas.append("      type: 'category',")
        lineas.append(f"      label: '{etiqueta}',")
        lineas.append(f"      collapsed: {colapsado},")
        lineas.append("      items: [")
        for pagina in paginas:
            lineas.append(f"        '{pagina}',")
        lineas.append("      ],")
        lineas.append("    },")

    lineas += ["  ],", "};", "", "export default sidebars;", ""]
    return "\n".join(lineas)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--source", required=True, help="raíz del repo axon-lang")
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    origen = os.path.join(args.source, "docs")
    if not os.path.isdir(origen):
        raise SystemExit(f"no existe {origen}")

    docs_json = json.load(
        io.open(os.path.join(origen, "docs.json"), encoding="utf-8")
    )

    # 1 · Retirar el andamiaje que el corpus sustituye.
    for rel in sorted(ANDAMIAJE):
        ruta = os.path.join("docs", rel)
        if os.path.exists(ruta):
            print(f"  - andamiaje: {rel}")
            if not args.dry_run:
                os.remove(ruta)
    if not args.dry_run:
        for d in ("docs/getting-started", "docs/language", "docs/runtime",
                  "docs/tooling", "docs/editions"):
            if os.path.isdir(d) and not os.listdir(d):
                os.rmdir(d)

    # 2 · Copiar el corpus.
    copiadas = 0
    tocadas = []
    for raiz, _, ficheros in os.walk(origen):
        for fichero in ficheros:
            if not fichero.endswith(".mdx"):
                continue
            src = os.path.join(raiz, fichero)
            rel = os.path.relpath(src, origen).replace("\\", "/")
            if rel in CONSERVAR:
                continue
            texto = io.open(src, encoding="utf-8").read()
            texto, c1 = migrar_frontmatter(texto, rel == "index.mdx")
            texto, c2 = migrar_cuerpo(texto)
            if c1 or c2:
                tocadas.append((rel, c1 + c2))
            destino = os.path.join("docs", rel)
            if not args.dry_run:
                os.makedirs(os.path.dirname(destino), exist_ok=True)
                io.open(destino, "w", encoding="utf-8", newline="\n").write(texto)
            copiadas += 1

    # 3 · Imágenes.
    img_src = os.path.join(origen, "images")
    imagenes = 0
    if os.path.isdir(img_src):
        for fichero in os.listdir(img_src):
            imagenes += 1
            if not args.dry_run:
                shutil.copy2(os.path.join(img_src, fichero),
                             os.path.join("static", "img", fichero))

    # 4 · Sidebar desde la navegación del corpus.
    sidebar = generar_sidebar(docs_json)
    if not args.dry_run:
        io.open("sidebars.ts", "w", encoding="utf-8", newline="\n").write(sidebar)

    grupos = len(docs_json["navigation"]["groups"])
    print(f"\n  {copiadas} páginas migradas · {imagenes} imágenes · "
          f"sidebar con {grupos} grupos")
    print(f"  {len(tocadas)} páginas con ajustes mínimos:")
    for rel, cambios in tocadas[:10]:
        print(f"    {rel}: {', '.join(cambios)}")
    if args.dry_run:
        print("\n  (dry-run: no se ha escrito nada)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
