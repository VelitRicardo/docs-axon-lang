# Glosario ES — decisiones de traducción

Fijado antes de traducir las 22 doctrinas, para que el mismo término no salga de
tres formas distintas en tres páginas. Se aplica a todo el corpus en español.

## Regla general

**No se traduce nada que el lector vaya a escribir o a buscar.** Palabras clave
del lenguaje, códigos de diagnóstico, nombres de campo, texto literal de los
errores del compilador. Sí se traduce todo lo que solo se lee.

## Palabras clave del lenguaje — NUNCA se traducen

`persona` · `flow` · `step` · `shield` · `anchor` · `tool` · `type` · `context` ·
`agent` · `run` · `axonendpoint` · `axonstore` · `channel` · `session` ·
`socket` · `daemon` · `mandate` · `lambda` · `compute` · `corpus` · `pix` ·
`ledger` · `effect` · `perform` · `handle` · `witness` · `warden` · `quant` ·
`savant` · `psyche` · `weave` · `immune` · `topology`

Los niveles epistémicos tampoco: `know` · `believe` · `speculate` · `doubt`.
Y los de confianza: `Untrusted` · `Scanned` · `Sanitized` · `Trusted`.

## Términos del dominio — traducción fijada

| Inglés | Español | Nota |
|---|---|---|
| authority | autoridad | |
| to attenuate | atenuar | nunca "reducir": es término técnico de capabilities |
| boundary | frontera | nunca "límite" |
| egress | salida | "frontera de salida" para *egress boundary* |
| ingress | entrada | |
| guard / guarded | guardia / con guardia | *unguarded* → "sin guardia" |
| coverage | cobertura | |
| claim | afirmación | como verbo, "afirmar" |
| assertion | aserción | término técnico; en prosa suelta, "afirmación" |
| proof | prueba | *proof-carrying* → "con prueba incorporada" |
| to hold (a property) | sostenerse | "la propiedad se sostiene" |
| refusal | rechazo | *to refuse* → "rechazar" |
| deploy | despliegue | |
| deploy gate | compuerta de despliegue | |
| artifact | artefacto | |
| record | registro | *system of record* → "sistema de registro" |
| store | almacén | el primitivo `axonstore` no se traduce |
| catalog | catálogo | |
| closed (vocabulary) | cerrado | *closure* → "cierre" |
| lattice | retículo | término matemático, no "celosía" |
| linear (types) | lineal | |
| runtime | ejecución / runtime | "en ejecución" como momento; "el runtime" como componente |
| compile time | compilación | "en compilación", no "en tiempo de compilación" salvo que haga falta contraste |
| type checker | verificador de tipos | |
| checker | verificador | |
| tenant | inquilino | *multi-tenant* → "multi-inquilino" |
| vendor | proveedor | |
| secret | secreto | |
| pooler | pooler | no hay término asentado; se deja |
| honest | honesto | |
| trade-off | contrapartida | |
| enforcement | aplicación / imposición | según el contexto |
| sound (rule) | sólida | *soundness* → "solidez" |
| load-bearing | que sostiene peso | metáfora del autor; se conserva |

## Títulos de las doctrinas

**Se traducen** (decisión del autor). Son proposiciones, no identificadores: el
slug del archivo y la URL siguen en inglés, así que ningún enlace se rompe, y el
lector español puede leer la tesis.

## Diagnósticos y errores

El texto literal de un error del compilador **se deja en inglés**, dentro de su
bloque de código. El lector lo va a ver así en su terminal; traducirlo le quita
lo único que hace con él, que es buscarlo.
