#!/usr/bin/env python3
"""
Genera la gramática Prism de `axon` desde el lexer del compilador.

Plan §8: el resaltado tiene que salir de `axon-frontend/src/tokens.rs`, no de un
README ni del LSP, que está desactualizado. Se leen las palabras clave reales
del lexer y se regenera `src/prism/axon.ts`.

**La fuente es un clon local, no una URL.** El repo del lenguaje dejó de ser
público al cambiar el modelo de negocio, así que `raw.githubusercontent.com` ya
no sirve el archivo: responde 404 a quien no esté autenticado. Se lee del disco
—por defecto `../axxon-constructor`, el clon cuyo `origin` es
`VelitRicardo/axon-lang`— y quien lo tenga en otro sitio lo dice con `--repo` o
con `AXON_LANG_REPO`.

Por qué generar y no escribir a mano: el lenguaje va por v4.3.0 con mayores
baratas. Una lista de 181 keywords copiada a mano estaría desfasada en una
semana y nadie lo notaría — el código simplemente se vería sin pintar.

Uso:  python scripts/sync-grammar.py [--repo ../axxon-constructor]
"""

import argparse
import io
import os
import re
from pathlib import Path

# Clon del repo del lenguaje, relativo a la raíz de esta doc.
REPO_POR_DEFECTO = "../axxon-constructor"
TOKENS_REL = "axon-frontend/src/tokens.rs"
OUT = "src/prism/axon.ts"

# Se pintan aparte: no son palabras clave para el lector.
BOOLEANS = {"true", "false"}


def leer_tokens(repo: str) -> str:
    """Lee `tokens.rs` del clon del compilador.

    Si no está, se sale con la ruta buscada en vez de un traceback: el fallo
    normal aquí es tener el clon en otro directorio, no que el archivo se haya
    movido dentro del repo.
    """
    ruta = Path(repo).expanduser() / TOKENS_REL
    if not ruta.is_file():
        raise SystemExit(
            f"no se encontró {ruta}\n"
            + "  El repo del lenguaje es privado: hace falta un clon local.\n"
            + "  Indícalo con --repo <ruta> o con AXON_LANG_REPO=<ruta>."
        )
    return ruta.read_text(encoding="utf-8")


def slice_fn(src: str, name: str) -> str:
    """Devuelve el cuerpo de una función `pub fn <name>` hasta la siguiente."""
    start = src.index(f"pub fn {name}")
    rest = src[start + 1 :]
    nxt = rest.find("\npub fn ")
    return rest if nxt == -1 else rest[:nxt]


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument(
        "--repo",
        default=os.environ.get("AXON_LANG_REPO", REPO_POR_DEFECTO),
        help="clon local de axon-lang (por defecto: %(default)s)",
    )
    args = ap.parse_args()

    src = leer_tokens(args.repo)

    # `keyword_type(word)` mapea cada literal de palabra a su TokenType.
    kw_body = slice_fn(src, "keyword_type")
    pairs = re.findall(r'"([a-zA-Z_][a-zA-Z0-9_]*)"\s*=>\s*TokenType::(\w+)', kw_body)
    if not pairs:
        raise SystemExit("no se extrajo ninguna palabra clave: ¿cambió tokens.rs?")

    # `is_declaration_keyword` decide cuáles abren una declaración de alto nivel.
    decl_body = slice_fn(src, "is_declaration_keyword")
    decl_types = set(re.findall(r"TokenType::(\w+)", decl_body))

    declarations, keywords = set(), set()
    for word, token_type in pairs:
        if word in BOOLEANS:
            continue
        (declarations if token_type in decl_types else keywords).add(word)

    # Más largas primero: en una alternancia, `on_breach` debe ganar a `on`.
    def alt(words: set[str]) -> str:
        return "|".join(sorted(words, key=lambda w: (-len(w), w)))

    banner = (
        "/**\n"
        " * Gramática Prism del lenguaje AXON — GENERADO por scripts/sync-grammar.py.\n"
        " *\n"
        " * Fuente: axon-frontend/src/tokens.rs del compilador (repo privado).\n"
        f" * Extraídas {len(declarations)} declaraciones y {len(keywords)} palabras clave.\n"
        " *\n"
        " * No editar a mano: se regenera. Si el lenguaje añade una palabra clave,\n"
        " * se vuelve a ejecutar el script y aparece pintada.\n"
        " */\n\n"
    )

    body = f"""import type * as PrismNamespace from 'prismjs';

const DECLARATIONS = /\\b(?:{alt(declarations)})\\b/;

const KEYWORDS = /\\b(?:{alt(keywords)})\\b/;

export default function axon(PrismObject: typeof PrismNamespace): void {{
  PrismObject.languages.axon = {{
    // Los seis tipos de comentario del lenguaje. Los de documentación van
    // antes que los normales: `///` tiene que ganar a `//`.
    'doc-comment': {{
      pattern: /\\/\\/[!/].*|\\/\\*[!*][\\s\\S]*?\\*\\//,
      greedy: true,
      alias: 'comment',
    }},
    comment: {{
      pattern: /\\/\\/.*|\\/\\*[\\s\\S]*?\\*\\//,
      greedy: true,
    }},
    string: {{
      pattern: /"(?:\\\\.|[^"\\\\])*"/,
      greedy: true,
    }},
    // Literal de duración: 5s, 250ms, 2h. Va antes que `number`.
    duration: {{
      pattern: /\\b\\d+(?:\\.\\d+)?(?:ms|[smhd])\\b/,
      alias: 'number',
    }},
    // Rango de refinamiento: `type Confidence(0.0..1.0)`.
    range: {{
      pattern: /\\b\\d+(?:\\.\\d+)?\\.\\.\\d+(?:\\.\\d+)?\\b/,
      alias: 'number',
    }},
    boolean: /\\b(?:true|false)\\b/,
    // Sin alias `keyword` a propósito: prism-react-renderer fusiona los
    // estilos recorriendo token.types en orden, y el último gana. Con el
    // alias, las declaraciones se pintarían con el color de las palabras
    // clave y perderían su jerarquía visual.
    declaration: DECLARATIONS,
    keyword: KEYWORDS,
    // Nombre de un atributo dentro de un bloque: `tone:`, `max_tokens:`.
    attribute: {{
      pattern: /\\b[a-z_][a-z0-9_]*(?=\\s*:)/,
      alias: 'attr-name',
    }},
    // Los tipos se reconocen por forma, no por lista: cualquier identificador
    // en PascalCase. Enumerarlos ataría la gramática a una versión concreta
    // del compilador y dejaría sin pintar los tipos del propio usuario.
    'class-name': /\\b[A-Z][A-Za-z0-9_]*\\b/,
    function: /\\b[a-z_][a-z0-9_]*(?=\\s*\\()/,
    number: /\\b\\d+(?:\\.\\d+)?\\b/,
    operator: /->|\\.\\.|[<>=!]=|[-+*/%<>=@?]/,
    punctuation: /[{{}}[\\]();:,.]/,
  }};
}}
"""

    io.open(OUT, "w", encoding="utf-8").write(banner + body)
    print(f"{OUT}: {len(declarations)} declaraciones, {len(keywords)} keywords")
    print("  declaraciones:", " ".join(sorted(declarations)[:12]), "…")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
