# docs-axon-lang

Documentación oficial de **AXON** — *the language that compiles to LLMs*.

Sitio en Docusaurus 3.10.2 + TypeScript. Canónico en
`ricardovelit.com/axon-docs/`, servido por rewrite multi-zone desde el sitio del
autor.

## Desarrollo

```bash
npm install
npm start          # servidor de desarrollo
npm run build      # build de producción (en + es)
npm run serve      # sirve el build, para prueba de humo
npm run typecheck  # tsc
```

Requiere Node ≥ 20 (ver `.nvmrc`).

## Scripts

```bash
python scripts/sync-fonts.py      # regenera src/css/fonts.css y los woff2
python scripts/check-contrast.py  # verifica los tokens contra WCAG AA
```

## Reglas del proyecto

Tres, y no son negociables:

1. **Un solo centro de control de estilo.** `src/css/tokens.css` es el único
   archivo autorizado a contener un literal de color, sombra, radio o duración.
   Todo lo demás consume variables semánticas. Las `--ifm-*` de Docusaurus se
   redefinen en términos de las nuestras, nunca al revés.
2. **La verdad técnica es el compilador.** Ninguna afirmación entra en la doc
   sin contrastarla contra el código de `axon-lang`. El repo dejó de ser
   público, así que la fuente es el checkout local —`Proyectos/axxon-constructor`,
   cuyo `origin` es `VelitRicardo/axon-lang`— y no una URL: la doc no puede
   enlazarlo porque el lector no puede abrirlo. Los READMEs de los repos
   hermanos son pistas, no fuentes.
3. **La doc no vende.** Los precios viven en la página comercial; aquí se
   documenta la frontera técnica. Toda URL externa sale de
   `src/config/links.ts`, nunca escrita a mano.

El plan vivo del proyecto —decisiones, fases y su justificación— está en
[`planner/`](planner/).

## Licencia

**El contenido de la doc, bajo [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)**
—prosa, ejemplos y tablas se pueden copiar y adaptar citando la fuente—. La
marca AXON™ y el compilador, todos los derechos reservados.

La separación es deliberada y no cosmética: una documentación que nadie puede
citar ni adaptar no cumple su función, y el lenguaje dejó de ser público. Decir
solo una de las dos cosas falsearía la otra.

> Ya no dice "Apache 2.0, como el lenguaje". Lo decía de cuando el repo era OSS,
> y dejó de ser cierto al cambiar el modelo de negocio.
