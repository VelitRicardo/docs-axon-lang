#!/usr/bin/env python3
"""
Verifica el contraste real de los tokens semánticos contra WCAG 2.1 AA.

Lee `src/css/tokens.css`, resuelve las cadenas de `var()` hasta el color final y
comprueba cada par documentado en los dos modos. Falla con código 1 si alguno
baja del mínimo, para que el gate de CI (plan §12-F6) lo pare.

Criterios:
  4.5:1  texto normal (WCAG 1.4.3)
  3.0:1  bordes de control y objetos gráficos con significado (WCAG 1.4.11)

Los elementos decorativos —la regla neón bajo los titulares, los divisores
hairline— están exentos por norma y no se comprueban: no transmiten
información. Esa exención es justamente la razón por la que el neón puede ser
neón (plan §6.2: nunca lleva texto encima en modo claro).

Uso:  python scripts/check-contrast.py
"""

import io
import re
import sys

TOKENS = "src/css/tokens.css"

# (texto, fondo, mínimo, etiqueta)
PAIRS = [
    ("--text-primary", "--surface-page", 4.5, "texto principal"),
    ("--text-primary", "--surface-raised", 4.5, "texto sobre tarjeta"),
    ("--text-secondary", "--surface-page", 4.5, "texto secundario"),
    ("--text-muted", "--surface-page", 4.5, "texto tenue"),
    ("--text-link", "--surface-page", 4.5, "enlace"),
    ("--text-link-hover", "--surface-page", 4.5, "enlace hover"),
    ("--color-accent-text", "--surface-page", 4.5, "acento como texto"),
    ("--border-control", "--surface-page", 3.0, "borde de control"),
    ("--focus-ring", "--surface-page", 3.0, "anillo de foco"),
    ("--code-text", "--code-bg", 4.5, "código"),
    ("--syntax-decl", "--code-bg", 4.5, "sintaxis · declaración"),
    ("--syntax-keyword", "--code-bg", 4.5, "sintaxis · keyword"),
    ("--syntax-type", "--code-bg", 4.5, "sintaxis · tipo"),
    ("--syntax-string", "--code-bg", 4.5, "sintaxis · string"),
    ("--syntax-number", "--code-bg", 4.5, "sintaxis · número"),
    ("--syntax-comment", "--code-bg", 4.5, "sintaxis · comentario"),
    ("--syntax-attr", "--code-bg", 4.5, "sintaxis · atributo"),
    ("--syntax-punct", "--code-bg", 4.5, "sintaxis · puntuación"),
]


def parse_blocks(css: str) -> tuple[dict, dict]:
    """Devuelve (declaraciones de :root, declaraciones de [data-theme=dark])."""
    light, dark = {}, {}
    for selector, body in re.findall(r"([^{}]+)\{([^{}]*)\}", css):
        target = None
        if ":root" in selector and "data-theme" not in selector:
            target = light
        elif "data-theme='dark'" in selector or 'data-theme="dark"' in selector:
            target = dark
        if target is None:
            continue
        for name, value in re.findall(r"(--[\w-]+)\s*:\s*([^;]+);", body):
            target[name] = value.strip()
    return light, dark


def resolve(token: str, scope: dict, base: dict, depth: int = 0) -> str:
    """Sigue la cadena de var() hasta dar con un literal de color."""
    if depth > 12:
        raise ValueError(f"ciclo resolviendo {token}")
    value = scope.get(token, base.get(token))
    if value is None:
        raise KeyError(f"token no definido: {token}")
    m = re.fullmatch(r"var\((--[\w-]+)\)", value)
    if m:
        return resolve(m.group(1), scope, base, depth + 1)
    if not value.startswith("#"):
        raise ValueError(f"{token} no resuelve a un color: {value}")
    return value


def _channel(c: int) -> float:
    x = c / 255
    return x / 12.92 if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4


def luminance(hex_color: str) -> float:
    h = hex_color.lstrip("#")
    if len(h) == 3:
        h = "".join(ch * 2 for ch in h)
    r, g, b = (int(h[i : i + 2], 16) for i in (0, 2, 4))
    return 0.2126 * _channel(r) + 0.7152 * _channel(g) + 0.0722 * _channel(b)


def contrast(a: str, b: str) -> float:
    la, lb = luminance(a), luminance(b)
    hi, lo = max(la, lb), min(la, lb)
    return (hi + 0.05) / (lo + 0.05)


def main() -> int:
    css = io.open(TOKENS, encoding="utf-8").read()
    light, dark = parse_blocks(css)
    failures = 0

    for label, scope in (("CLARO", light), ("OSCURO", dark)):
        print(f"\n{label}")
        for fg, bg, minimum, name in PAIRS:
            fg_hex = resolve(fg, scope, light)
            bg_hex = resolve(bg, scope, light)
            r = contrast(fg_hex, bg_hex)
            ok = r >= minimum
            failures += not ok
            print(
                f"  {'ok ' if ok else 'FALLO'} {r:5.2f}  {name:26s} "
                f"{fg_hex} / {bg_hex}  (min {minimum})"
            )

    print()
    if failures:
        print(f"{failures} par(es) por debajo del mínimo AA.")
        return 1
    print(f"{len(PAIRS) * 2} pares verificados, todos AA.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
