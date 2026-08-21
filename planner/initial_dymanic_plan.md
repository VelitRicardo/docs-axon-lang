# AXON Docs — Plan Vivo (v0.9)

> **Estado:** F2 EJECUTADA · en F3 · iterable · 14 de 16 cerradas — solo quedan D4 y D6,
> que son recomendaciones aplicadas salvo objeción y no bloquean nada
> **Última revisión:** 2026-08-21
> **Regla del documento:** este archivo es la única fuente de verdad del proyecto
> `docs-axon-lang` mientras no exista código. Cada iteración modifica secciones y
> añade una línea al §16 Registro. Nada se implementa hasta que §14 quede vacío
> o explícitamente diferido.

---

## 1. Objetivo

Publicar la documentación oficial de **AXON — sistema operativo cognitivo** con
tres exigencias no negociables:

1. **Control total del contenido.** MDX propio, sin generadores opacos. La IA de
   la doc (Ask AI) responde sobre *nuestro* corpus, no sobre una alucinación.
2. **Control total de la estética.** Un único centro de control CSS con tokens
   semánticos. Cero hex sueltos en componentes. Cambiar la marca = editar un
   archivo.
3. **Moderno y elegante.** Editorial, no "template de framework": tipografía
   serif de display, retícula amplia, acento neón usado con avaricia.

**Principios de diseño**
- *Editorial sobre decorativo* — la referencia visual es prensa impresa: reglas
  finas, cajas con borde, jerarquía por tipografía, no por color.
- *El código es el héroe* — todo bloque `axon` se ve mejor que en el editor.
- *Densidad honesta* — quien viene a la referencia quiere la tabla, no el hero.
- *Un solo eje de color* — papel + tinta navy + un verde neón. Nada más.

---

## 2. Hechos verificados del ecosistema (base para el contenido)

Recogidos de los repos hermanos en `Proyectos/` el 2026-08-21.

> ⚠️ **Regla de fuentes (v0.3).** `axon-lsp` está **desactualizado** y en proceso
> de arreglo. La **única fuente de verdad** para cualquier afirmación técnica es
> el repo del lenguaje: <https://github.com/VelitRicardo/axon-lang>. Nada de lo
> que se copie de un README hermano entra en la doc sin contrastarlo contra el
> compilador. Los "hechos" de esta tabla son **pistas de arranque**, no verdad.

| Hecho | Fuente |
|---|---|
| **Repo OSS canónico: <https://github.com/VelitRicardo/axon-lang>** ✔ (§14-D7 cerrado). Existe además una **edición Enterprise privada y de pago** | confirmado por el autor |
| Autoría: **Ricardo Velit**, autor y desarrollador único. `Bemarking` es marca **retirada** — toda referencia se elimina de la doc | confirmado por el autor |
| Compilador/runtime en Rust; crates `axon-frontend`, `axon-csys`, `axon-lang`; kernels en C23 (`axon-csys`) | `axon-enterprise/README.md` |
| CLI: `axon check`, `axon run` (`--tool-mode stub\|real`, `-b anthropic`), `axon fmt` | `prueba-axon/agents/asistente.axon` |
| Versión de lenguaje citada: `axon-lang` v1.9.0+ | `axon-lsp/README.md` — ⚠️ desactualizado, **reverificar** |
| LSP: `axon-lsp` v0.3.0 en crates.io, binario Rust único, extensión VSCode | `axon-lsp/README.md` — ⚠️ desactualizado, **reverificar** |
| Edición Enterprise: control plane SaaS multi-tenant (RBAC, SSO, metering, audit log, compliance) sobre el OSS | `axon-enterprise/README.md` |
| **`axon-fabric` = plataforma de compra** del binario Enterprise y otros productos → **depthcon.io**. Desde la doc se enlaza ahí, no se vende aquí | confirmado por el autor |
| **Versión pública actual: `axon-lang` v4.3.0**; v4.4.0 en desarrollo (§14-D13 ✔) | confirmado por el autor |
| **Instalación OSS: `cargo install axon-lang`** — comando único (§14-D10 ✔) | confirmado por el autor |
| **Licencias:** Core Apache 2.0 (runtime *WITH LLVM-exception*), especificación CC BY 4.0, componentes cerrados bajo EULA | `axon-modelo-negocio-licenciamiento` v2.1 §3.2 |

### 2.1 Documentos que gobiernan el contenido

Dos documentos operativos mandan sobre lo que esta doc puede y no puede decir.
**No son material de consulta: son restricciones de escritura.**

| Documento | Qué fija | Efecto sobre la doc |
|---|---|---|
| `axon-modelo-negocio-licenciamiento` **v2.1** | Frontera open-core componente por componente, matriz de derechos, licencias, política de expiración, continuidad | Regla de precedencia explícita: **gobierna toda mención de licencia, runtime o precio** en `/axon` y `/axon-docs`. Donde el copy contradiga, se corrige el copy |
| `RFC-003 · Frontera de primitivas y capacidades` (Draft) | Capacidades declaradas, `capabilities.toml`, diagnóstico `axon-T901`, prueba de un solo lenguaje | Crea una **obligación de publicación**: cada capacidad necesita su página pública (§5.6) |

> ⚠️ **Aviso sobre la base factual de RFC-003.** Sus cifras están medidas sobre el
> commit `9a36d66` (11-ago-2026) con `axon-lang` **2.88.0**. Hoy la versión
> pública es **4.3.0**: la base del RFC está dos mayores por detrás y tiene diez
> días. Las cifras de primitivas (91 / 94 / 99) probablemente ya no son válidas.
> **Ninguna entra en la doc hasta que se cierre D28 del RFC** (reconciliación en
> un número canónico único).

**Superficie declarativa del lenguaje** (extraída de fixtures reales; es la
columna vertebral de la referencia):

`persona` · `context` · `anchor` · `shield` · `tool` · `agent` · `flow` / `step` ·
`channel` · `intent` · `type` · `let` · `run` · `use_tool`

Atributos vistos: `domain`, `tone`, `confidence_threshold`, `cite_sources`,
`memory`, `language`, `depth`, `max_tokens`, `temperature`, `require`,
`confidence_floor`, `unknown_response`, `on_violation`, `scan`, `on_breach`,
`severity`, `provider`, `timeout`, `goal`, `tools`, `strategy`, `max_iterations`,
`given`.

Tipos built-in: `String`, `Integer`, `Float`, `Bool`, `Channel`, `Trusted`,
`Document`, `FactualClaim`, `Opinion`; refinamientos (`type Confidence(0.0..1.0)`);
opcionales (`T?`).

Comentarios: seis formas — `//`, `/* */`, `///`, `/** */`, `//!`, `/*! */`.

---

## 3. Stack técnico

| Pieza | Decisión | Nota |
|---|---|---|
| Generador | **Docusaurus 3.10.2** (`npm init docusaurus@latest`) | verificado en npm: `latest = 3.10.2` |
| Plantilla | `classic` + **TypeScript** | el theme se toca con swizzle tipado |
| Node | v22.15.0 local ✔ (requiere ≥20) | fijar en `.nvmrc` y CI |
| Gestor | npm (lockfile v3) | coherente con el resto de Proyectos |
| Contenido | MDX v3 | componentes React dentro de la doc |
| Búsqueda | `@docusaurus/theme-search-algolia` 3.10.2 + **DocSearch v4 / Ask AI** | requiere alta en Algolia DocSearch (§9) |
| Diagramas | `@docusaurus/theme-mermaid` | tematizado con nuestros tokens |
| Highlight | Prism + **gramática `axon` propia** (§8) | sin gramática, todo el valor visual se pierde |
| i18n | **EN (`defaultLocale`) + ES completo** | `i18n/` activo desde F1 |
| Deploy | **Vercel** → `ricardovelit.com/axon-docs/` (§11.1) | `docs.ricardovelit.com` queda como 301 |
| Blog | **NO** — plugin desactivado (§14-D5 ✔) | el blog es otro proyecto, con voz propia |

**Qué NO usamos:** Tailwind (rompe el "centro de control único"), ningún kit de
UI de terceros, ningún tema de Docusaurus de la comunidad, **ni el plugin de
blog** (`blog: false` en el preset classic).

---

## 4. Estructura de repo objetivo

```
docs-axon-lang/
├─ planner/                    # este plan y sus iteraciones
├─ docs/                       # MDX de la documentación (§5)
├─ i18n/es/                    # traducciones ES (§10)
├─ src/
│  ├─ css/
│  │  ├─ tokens.css            # ★ CENTRO DE CONTROL — primitivas + semánticos
│  │  ├─ base.css              # reset, tipografía, ritmo vertical
│  │  ├─ docusaurus.css        # sobrescritura de las --ifm-* del theme
│  │  └─ custom.css            # único entry: @import de los 4 anteriores
│  ├─ components/              # Masthead, Ledger, CodeShowcase, DeclCard…
│  ├─ theme/                   # swizzles (Navbar, Footer, DocItem, CodeBlock)
│  ├─ prism/axon.ts            # gramática Prism del lenguaje
│  └─ pages/index.tsx          # landing editorial
├─ static/
│  ├─ img/                     # logo, og-image, favicon (desde axon-fabric/brand)
│  └─ fonts/                   # self-hosted woff2 (§6.3)
├─ docusaurus.config.ts
├─ sidebars.ts
└─ .github/workflows/deploy.yml
```

---

## 5. Arquitectura de información (borrador 1)

Sidebar principal — cinco bloques, profundidad máxima 3.

```
1. Empezar
   ├─ Qué es AXON            (el "sistema operativo cognitivo" en 400 palabras)
   ├─ Por qué un lenguaje    (vs. framework de agentes / prompt engineering)
   ├─ Instalación            (cargo install / binarios / verificación)
   ├─ Tu primer agente       (asistente.axon comentado, 5 min)
   └─ Modelo mental          (persona · context · anchor · shield · agent · flow)

2. Lenguaje
   ├─ Sintaxis y comentarios (las seis formas, doc comments)
   ├─ Sistema de tipos       (built-ins, refinamientos, opcionales, Trusted)
   ├─ Declaraciones
   │   ├─ persona   ├─ context   ├─ anchor    ├─ shield
   │   ├─ tool      ├─ agent     ├─ flow/step ├─ channel
   │   └─ intent    └─ type
   ├─ Ejecución              (run, presupuestos duros, estrategias: react…)
   └─ Errores del compilador (catálogo axon-lex / axon-parse / axon-type)

3. Runtime & CSYS
   ├─ Arquitectura           (frontend → csys → runtime)
   ├─ Providers de modelo    (anthropic, native tools, stub mode)
   ├─ Presupuestos y límites (iteraciones / tokens / USD)
   └─ Seguridad              (shields, anclas, prompt injection)

4. Herramientas
   ├─ CLI axon               (check, run, fmt — referencia de flags)
   ├─ LSP                    (capacidades, instalación)
   ├─ Editores               (VSCode, Cursor, Zed, Neovim, Claude Code…)
   └─ Formato de código      (axon fmt / on-type formatting)

5. Ediciones y frontera          ← reescrito en v0.4
   ├─ Verificar vs. certificar   (la distinción que ordena todo el modelo)
   ├─ Qué es abierto y qué no    (tabla componente a componente, §3.2 del modelo)
   ├─ Capacidades declaradas     (qué son, cómo se leen, axon-T901)
   ├─ Matriz de derechos         (/licensing — §6 del modelo)
   ├─ Licencias                  (Apache 2.0 · LLVM-exception · CC BY · EULA)
   ├─ Qué sale de tu red         (inventario de flujos — §7.3 del modelo)
   └─ Continuidad                (No-Hardstop, escrow, compromiso a 24 meses)

6. Catálogo de capacidades       ← GENERADO, no escrito a mano (§5.6)
   └─ /capabilities/<nombre>      una página por capacidad del catálogo

+ Recetas · Ejemplos · Changelog
```

**Sin blog** (§14-D5 ✔). El *changelog* es una **página de docs curada a mano**
(`docs/changelog.mdx`), no un feed de blog ni un volcado de commits: qué cambió,
qué rompe, cómo migrar. Los textos con voz de autor viven en el otro proyecto y
se enlazan desde la navbar cuando exista.

**Decisión de fondo:** la referencia del lenguaje se escribe **a mano en MDX**,
con fixtures reales del compilador como snippets. Un paso de CI ejecuta
`axon check` sobre los snippets extraídos para evitar doc podrida (§12-F6).

### 5.6 La doc deja de ser doc: es parte del release gate del compilador

Esto sale de RFC-003 y **cambia la naturaleza del proyecto**. §3.4 del RFC norma
el diagnóstico del compilador, y ese diagnóstico **termina en una URL de esta
doc**:

```
error [línea 12]: axon-T901 · capacidad no montada
  ...
  → https://<dominio>/capabilities/warden.depth.live_network
```

Y §6.1 exige que un PR que registra una capacidad traiga **tres cosas o no
entra**, siendo la tercera *"la página pública de la capacidad en la URL
declarada"*. Consecuencias, todas duras:

1. **Estas URLs son las más caras del proyecto.** Quedan grabadas en mensajes de
   error, en releases, en dossiers firmados y en posts de terceros. Cambiarlas
   más tarde es imposible en la práctica. La elección de dominio (§14-D9) se
   decide sobre todo por esto, no por el SEO de la home.
2. **Una capacidad sin página publicada rompe el gate del compilador.** El repo
   de la doc pasa a ser dependencia de release del lenguaje.
3. **Una capacidad nunca se retira** (RFC §6.2): estas páginas **no pueden
   404 jamás**. Las `deprecated` se renderizan con banner y enlace a su sucesora.

**Propuesta de arquitectura — generación, no escritura a mano:**

- **Fuente única de verdad:** `capabilities.toml` del repo del lenguaje. La doc
  **no** mantiene una copia editada a mano; eso sería una segunda verdad.
- **Plugin de Docusaurus** que lee el TOML y genera una página por capacidad:
  nombre canónico, versión, primitiva, dimensión, puerto (`trait`), edición,
  resumen, qué monta el build OSS, el diagnóstico de ejemplo, y cómo obtenerla.
- **Sincronización reproducible:** snapshot del TOML versionado en este repo +
  script `npm run sync:capabilities`. Nada de *fetch* en tiempo de build: un
  build de doc debe ser reproducible aunque el repo del lenguaje esté caído.
- **Gate de CI en los dos repos:** para toda entrada del TOML existe página
  renderizada, y todo campo `url` resuelve. Eso implementa mecánicamente el
  tercer requisito de RFC §6.1, que hoy es una promesa humana.

**Efecto lateral que conviene ver:** el compilador es, según el propio RFC, *"el
canal de venta más honesto que existe"*. Su único destino es esta doc. La página
de capacidad es, entonces, **la página de mayor intención comercial del sitio**
— llega alguien que acaba de toparse con un límite y necesita entender qué le
falta. Diseñarla como una ficha técnica seca, con un enlace discreto a
`depthcon.io`, y **jamás como una página de precios**: el RFC prohíbe
explícitamente que el compilador enlace a precios.

### 5.7 Postura comercial: la doc no vende todavía (§14-D14 ✔)

`depthcon.io` no está terminado y AXON no está en venta. **Este proyecto es
documentación, no un embudo.** Consecuencias concretas:

- **Cero CTAs de compra** en F1–F7. Nada de "empieza tu prueba", banners de
  pricing ni botones de contacto comercial en la doc.
- El bloque "Ediciones y frontera" **explica la frontera** —que es contenido
  técnico y público por §10.4 del modelo— y remata con un enlace sobrio a
  `/axon`. Un enlace, en el pie de la página, sin adorno.
- **Indirección de un solo punto.** Toda referencia comercial sale de una
  constante en la config:

  ```ts
  // src/config/links.ts
  export const COMMERCIAL_URL = 'https://ricardovelit.com/axon';
  // el día que depthcon.io esté depurado: se cambia aquí y en ningún otro sitio
  ```

  Ninguna página escribe la URL comercial a mano. Cuando `depthcon.io` esté
  listo con el modelo depurado, migrar el onboarding comercial es **una línea**,
  no una batida por el corpus en dos idiomas.

**Por qué esto además es lo correcto para el producto:** el modelo de negocio
§10.1 dice que la tabla de SKU va al final y que *"la licencia es techo, no
puerta"*. Una doc que no vende mientras el producto no vende es coherente con
esa tesis — y cuando llegue el momento de vender, el sitio ya tendrá la
autoridad que hace que la venta no tenga que empujar.

---

## 6. Sistema de diseño — centro de control CSS

### 6.1 Contrato
- **Un archivo manda:** `src/css/tokens.css`. Ningún otro archivo del repo puede
  contener un literal de color, sombra, radio o duración. Un lint lo verifica (§12-F6).
- Dos capas: **primitivas** (`--ax-navy-700`) → **semánticas** (`--color-accent`,
  `--surface-raised`). Los componentes consumen **solo semánticos**.
- Las variables del theme (`--ifm-*`) se redefinen **en términos de las nuestras**
  en `docusaurus.css`. Nunca al revés.
- Cascade layers: `@layer tokens, base, ifm, components, utilities;`

### 6.2 Paleta (derivada de la referencia editorial — **a validar**)

```css
:root {
  /* ── Primitivas ─────────────────────────────────────────── */
  --ax-paper-50:  #FBF9F5;  /* fondo de tarjeta                */
  --ax-paper-100: #F2EFE8;  /* papel, fondo de página          */
  --ax-paper-200: #E7E2D8;  /* reglas suaves, divisores        */

  --ax-navy-900:  #0E1740;
  --ax-navy-700:  #17246B;  /* titular de la referencia        */
  --ax-navy-500:  #2C3E9E;
  --ax-navy-200:  #A9B4E8;  /* enlaces en modo oscuro          */

  --ax-neon-500:  #00F26D;  /* la regla verde — solo trazo     */
  --ax-neon-600:  #00C458;  /* mid: bullets, iconos, subrayado */
  --ax-neon-800:  #007A37;  /* el ÚNICO verde legible: 4.76:1  */

  --ax-ink-900:   #14161A;  /* texto principal                 */
  --ax-ink-700:   #4A4F57;  /* texto secundario                */
  --ax-ink-500:   #63676E;  /* texto tenue — 4.95:1            */

  --ax-night-900: #0B0D12;  /* fondo modo oscuro               */
  --ax-night-800: #12151C;
  --ax-night-700: #1B202A;
}
```

Semánticos (extracto; la lista completa se cierra en F2): `--surface-page`,
`--surface-raised`, `--surface-sunken`, `--text-primary`, `--text-muted`,
`--text-inverse`, `--border-hairline`, `--border-strong`, `--color-accent`,
`--color-accent-contrast`, `--focus-ring`, `--code-bg`, `--code-border`,
`--syntax-keyword`, `--syntax-type`, `--syntax-string`, `--syntax-comment`,
`--syntax-attr`.

**Modo oscuro:** no es una inversión mecánica. El papel pasa a `--ax-night-900`;
el navy deja de ser tinta y se convierte en acento secundario (`--ax-navy-200`);
el neón se mantiene idéntico — es el hilo de marca entre ambos modos.

**Contraste — medido, no estimado (F2).** `--ax-neon-500` sobre papel da
**1.31:1**, y `--ax-neon-600` da **2.02:1**: ninguno de los dos sirve como
texto, corrigiendo lo que decía la v0.1 de este plan. El neón **nunca** lleva
texto encima en modo claro — solo reglas, subrayados, viñetas y bordes, que la
norma exime por decorativos. Para texto de acento existe `--ax-neon-800`
(#007A37, **4.76:1**), el verde más claro de la familia que pasa AA sobre papel.
`scripts/check-contrast.py` verifica los 36 pares en cada build.

### 6.3 Tipografía (CERRADO — §14-D2 ✔)

| Rol | Fuente | Peso / uso |
|---|---|---|
| Display | **Instrument Serif** | 400 · h1/h2, hero, cintillos |
| Texto | **Inter Tight** | 400/500/600 · cuerpo, UI, sidebar |
| Mono | **JetBrains Mono** | 400/700 · código, CLI, inline |
| Guiño | Blackletter **solo** en el wordmark del logo | opcional, una aparición |

Tokens: `--font-display`, `--font-text`, `--font-mono` — nadie declara
`font-family` fuera de `tokens.css`.

Self-hosted en `static/fonts/` (woff2, subset latin+latin-ext, `font-display: swap`).
Sin CDN externo: privacidad y control de LCP. Escala modular 1.25 con `clamp()`;
medida de lectura 68ch.

### 6.4 Firma visual (lo que hace que se vea "nuestro")
- **Regla neón bajo el `<h1>`** de cada página — cita directa de la referencia impresa.
- **Cajas con borde hairline + radio 4px**, nunca sombras difusas.
- **Capitular** (drop cap) opcional en la intro de páginas conceptuales.
- **Cabecera de bloque de código** con etiqueta de archivo tipo cintillo.
- Sin gradientes, sin glassmorphism, sin blobs.

---

## 7. Componentes a medida (F3)

`<Masthead>` (hero de landing) · `<Ledger>` (grid de features en cajas) ·
`<CodeShowcase>` (código + explicación lateral sincronizada) ·
`<DeclCard>` (ficha de declaración: firma, campos, ejemplo, errores) ·
`<Callout variant="anchor|shield|budget">` · `<CliBlock>` (comando + salida) ·
`<Terminal>` · `<VersionBadge>` (versión real del crate).

---

## 8. Resaltado de sintaxis `axon` (crítico)

Sin esto, todos los ejemplos salen en texto plano. Plan:

1. Gramática Prism en `src/prism/axon.ts`: keywords de declaración, atributos,
   tipos built-in, refinamientos, las seis formas de comentario, strings
   multilínea, duraciones (`5s`), rangos (`0.0..1.0`).
2. Registrar con `prism.additionalLanguages` + tema de código propio construido
   sobre los tokens `--syntax-*`.
3. **Paridad con el editor:** los nombres de token replican el mapeo de
   `semanticTokens` para que doc y editor pinten igual — pero tomando la lista
   de tokens del **lexer del compilador**, no del `axon-lsp` desactualizado.
4. Fixture de verificación: renderizar `asistente.axon` y `vertical_hipaa.axon`
   completos y revisarlos a ojo.

---

## 9. Búsqueda + Ask AI

- `@docusaurus/theme-search-algolia` 3.10.2 con **DocSearch v4**, que trae el
  panel **Ask AI** integrado.
- **Cuenta Algolia propia, ya creada** por el autor (§14-D8 ✔). No vamos por el
  programa gratuito DocSearch: usamos crawler propio, lo que además nos da
  control del `recordExtractor` y del *ranking*.
- Lo que hace falta cuando toque (F7): `appId`, `apiKey` **de solo búsqueda**
  (nunca la admin en el repo), `indexName`, y el `askAi` assistant id.
  Las claves de monitoring las pasas en su momento.
- **Faceta obligatoria por idioma:** el crawler debe indexar `language` para que
  el buscador en `/es/` no devuelva resultados en inglés (fallo clásico de i18n
  + Algolia).
- Plan B hasta F7: `@easyops-cn/docusaurus-search-local` (offline, sin IA),
  intercambiable con una sola clave en `docusaurus.config.ts`.
- El modal se re-estiliza con nuestros tokens: DocSearch expone sus propias
  `--docsearch-*`, que se mapean 1:1 a las nuestras.

---

## 10. i18n y versionado

- **i18n (CERRADO — §14-D1 ✔):** `defaultLocale: 'en'`, `locales: ['en', 'es']`.
  Rutas: `/` para EN, `/es/` para ES. Selector de idioma en la navbar.
- **Flujo de traducción:** se escribe primero en **EN** (`docs/`) y se traduce a
  ES en `i18n/es/docusaurus-plugin-content-docs/current/`. Regla de trabajo: una
  página no se considera terminada hasta tener las dos versiones — nada de
  "ya lo traduzco luego", que es como muere el i18n.
- **Coste asumido:** ~2× en F5. Si aprieta el calendario, se publica EN completo
  y ES por bloques, empezando por "Empezar" (bloque 1), que es el que convierte.
- **Versionado (§14-D13 ✔):** versión pública **v4.3.0**, con **v4.4.0** en
  desarrollo. *No* se activa `docusaurus docs:version` en el arranque: se
  documenta `latest` y se declara `axon-lang ≥ 4.3.0` como mínima soportada.
- **Observación sobre la cadencia:** RFC-003 medía `axon-lang` 2.88.0 el 11-ago
  y hoy vas por 4.3.0. Con mayores tan baratas, versionar la doc desde el día
  uno sería perseguir un tren: multiplicarías el corpus por cada mayor y con
  i18n el coste es ×2 encima. Se versiona cuando exista **el primer adoptante
  externo** que pueda quedarse anclado a una versión vieja — no antes.
- **Badge de versión** leído del crate, para que la doc no mienta nunca sobre
  contra qué versión está escrita.

---

## 11. Deploy & CI

**Destino: Vercel** (§14-D3 ✔). **URL canónica: subdirectorio, no subdominio**
(§14-D9 — recomendación, pendiente de un dato tuyo).

```ts
// docusaurus.config.ts
url: 'https://ricardovelit.com',
baseUrl: '/axon-docs/',   // subdirectorio del dominio del autor
trailingSlash: false,
```

### 11.1 Por qué subdirectorio y no `docs.ricardovelit.com`

**El argumento no es que la doc vaya a rankear mejor.** Es que la doc va a ser
**el 95% del contenido y de los enlaces entrantes** del ecosistema —GitHub, HN,
posts de terceros, mensajes de error del compilador— y esa autoridad tiene que
caer sobre el dominio de la persona, que es exactamente el activo que estás
construyendo para los VC. En subdominio, esos enlaces construyen un silo que no
capitaliza `ricardovelit.com`; en subdirectorio, construyen tu dominio.

Google dice que maneja ambos, y es cierto. Pero los clasificadores de calidad y
la consolidación de señales operan a nivel de dominio, y tu caso es el peor para
un subdominio: **dominio nuevo, sin autoridad, y toda la masa de contenido
colgando fuera de la raíz.**

Dos apoyos más, y el segundo es el que me convence del todo:

- **Tus propios documentos ya lo asumen.** El modelo de negocio v2.1 §10.4
  asigna contenidos a `/axon` y `/axon-docs` — rutas, no subdominios. El
  subdominio fue una improvisación posterior; la arquitectura que ya diseñaste
  es de subdirectorio. Uso `/axon-docs/` para no romper esa convención.
- **`/axon` y `/axon-docs` tienen que convivir.** La página comercial (`/axon`,
  con precios) y la doc (`/axon-docs`, sin precios) se enlazan constantemente en
  ambos sentidos. Mismo origen = enlaces internos, sin fricción de dominio
  cruzado, sin partir la sesión de analítica.

**Qué hacemos con `docs.ricardovelit.com`,** que ya tiene TLS: **301 permanente**
al canónico. No se pierde nada y cubre a quien ya tenga el enlace.

### 11.2 El dominio de los mensajes de error — `seal-axon.dev`

**Recomendado, aún sin comprar.** Rol acotado y permanente:

```
seal-axon.dev/capabilities/<nombre>
   → 301 →
ricardovelit.com/axon-docs/capabilities/<nombre>
```

**Disponibilidad verificada por RDAP el 2026-08-21** (confirmar en el registrador
antes de pagar; RDAP no detecta reservas ni *premium*):

| Dominio | Estado |
|---|---|
| `axon-lang.dev` · `axonlang.dev` | **registrados** — descartados |
| `seal-axon.dev` · `sealaxon.dev` · `seal-axonlang.dev` | libres |

**Elección: `seal-axon.dev`.** El guion no es cosmético — hace el trabajo:

- **Restaura la lectura.** `sealaxon` se parte como *sea-la-xon* y esconde *lax*,
  que es el adjetivo opuesto a lo que promete un compilador que verifica en
  compilación. `seal-axon` se lee *seal + axon* al primer golpe de vista, que es
  todo lo que un desarrollador le dedica a una URL dentro de un error.
- **Es coherente con tu propia nomenclatura.** Tu identificador canónico ya
  lleva guion: `axon-lang`, en crates.io y en el repo. En este contexto el guion
  lee a nombre de paquete, no a dominio de SEO barato.
- **`seal-axonlang.dev` queda descartado por incoherente**: hiphena `seal` y pega
  `axonlang` cuando tu forma canónica es `axon-lang`. La versión consistente
  sería `seal-axon-lang.dev`, tres segmentos y 18 caracteres — demasiado para una
  línea de error que ya carga `/capabilities/warden.depth.live_network`.

**Opcional, ~12 USD:** registrar también `sealaxon.dev` redirigiendo al elegido.
Es un seguro barato para un dominio que no puede romperse nunca.

**Solo redirección, nunca origen canónico.** Servir las páginas *en* `sealaxon.dev`
partiría el sitio en dos orígenes: dos índices de Algolia, dos perfiles de
enlaces, y la autoridad de las páginas más enlazadas del proyecto cayendo fuera
del dominio que estás construyendo. El canónico es uno solo (§11.1); esto es un
alias estable.

**Por qué esto importa tanto** (§5.6): estas URLs quedan dentro de mensajes de
error del compilador, dossiers firmados y versiones antiguas del binario que
seguirán circulando años. Son las únicas URLs del proyecto que **no se pueden
migrar**. Con el alias, el día que AXON se independice de la marca personal solo
cambias a dónde redirige `sealaxon.dev` y todo lo ya emitido sigue resolviendo.

**Reglas de operación del alias:**

- Se renueva **siempre**, con auto-renovación y alerta a 90 días. Perder este
  dominio es romper todos los mensajes de error emitidos hasta la fecha.
- 301 permanente, preservando la ruta completa. Nunca a la home.
- `rel=canonical` de cada página apunta al canónico, jamás al alias.
- El `url` de `capabilities.toml` usa **el alias**, no el canónico: es el campo
  que se graba en el compilador, y por eso debe ser el que nunca cambia.

### 11.3 Mecánica del subdirectorio (§14-D9 ✔ — `ricardovelit.com` está en Vercel)

Confirmado: patrón **multi-zone** de Vercel. La doc conserva proyecto propio, CI
propio y previews por PR; el sitio del autor solo reenvía.

```json
// vercel.json  —  en el proyecto de ricardovelit.com
{
  "rewrites": [
    { "source": "/axon-docs",
      "destination": "https://axon-docs.vercel.app/axon-docs" },
    { "source": "/axon-docs/:path*",
      "destination": "https://axon-docs.vercel.app/axon-docs/:path*" }
  ]
}
```

Tres detalles que, si se pasan por alto, cuestan un día de depuración:

1. **`baseUrl: '/axon-docs/'` no es opcional.** Es lo que hace que los assets, el
   router y los enlaces internos resuelvan bajo la ruta reenviada. Con `/` el
   sitio carga a medias y falla en subrutas.
2. **El origen `*.vercel.app` no debe indexarse — pero el `noindex` NO puede ser
   incondicional.** Un rewrite de Vercel *proxea la respuesta con sus cabeceras*:
   un `X-Robots-Tag: noindex` global en el proyecto de la doc viajaría también
   por `ricardovelit.com/axon-docs/*` y **desindexaría el sitio canónico entero**.
   La cabecera va condicionada por host en `vercel.json`:

   ```json
   { "source": "/(.*)",
     "has": [{ "type": "host", "value": "(?<sub>.*)\\.vercel\\.app" }],
     "headers": [{ "key": "X-Robots-Tag", "value": "noindex" }] }
   ```

   Modo de fallo seguro: si el patrón no casa, no se emite cabecera y queda el
   `rel=canonical` de Docusaurus, que ya apunta al canónico.
3. **Algolia rastrea el canónico**, nunca el `.vercel.app`, o el índice devolverá
   URLs que el usuario no debería ver.

### 11.4 CI y build

- Build reproducible: `npm ci && npm run build` + `npm run serve` de humo.
- Vercel: preview automático por rama/PR, producción en `main`. Framework preset
  `Docusaurus` (output `build/`).
- CI en GitHub Actions solo para *checks* (el deploy lo hace Vercel):
  enlaces rotos (`onBrokenLinks: 'throw'`), lint de tokens CSS, `axon check`
  sobre snippets extraídos, presupuesto Lighthouse (LCP < 2.0s).
- El dominio se fija **antes de F7**: Algolia indexa por origen y cambiarlo
  después obliga a recrawlear y rehacer el índice.

---

## 12. Fases de ejecución

| Fase | Entregable | Hecho cuando |
|---|---|---|
| **F0** Plan | este documento cerrado | §14 resuelto o diferido |
| **F1** ✔ Andamiaje | `npm init docusaurus@latest . classic --typescript`, borrado del contenido demo, **`blog: false`**, `url`/`baseUrl` definitivos, i18n `en`+`es`, favicon e identidad, metadata §15 | `npm run build` verde y sitio vacío pero nuestro |
| **F2** ✔ Tokens | `tokens.css` completo + mapeo `--ifm-*` + modo oscuro + tipografía self-hosted | cambiar 3 variables cambia todo el sitio; contraste AA verificado |
| **F3** Theme | swizzles (Navbar, Footer, DocItem, CodeBlock, TOC) + componentes §7 + landing | landing publicable, cero hex fuera de tokens |
| **F4** Sintaxis | gramática Prism `axon` + tema de código | los dos fixtures se ven correctos |
| **F5** Contenido | bloques 1 y 2 del §5 (Empezar + Lenguaje) escritos | alguien ajeno escribe y ejecuta su primer agente solo con la doc |
| **F5b** Capacidades | plugin generador desde `capabilities.toml` + gate de CI (§5.6) | toda capacidad del catálogo tiene página; ninguna URL del compilador 404 |
| **F5c** Frontera | bloque 5: verificar vs. certificar, tabla open-core, `/licensing`, flujos de red, continuidad | un comité de compras entiende qué compra sin ver un precio |
| **F6** Calidad | lint de tokens, enlaces, snippets verificados, a11y, OG images | CI verde en PR |
| **F7** Búsqueda | Algolia DocSearch + Ask AI en producción | Ask AI responde con citas correctas a 5 preguntas de prueba |

Los bloques 3–5 del §5 (Runtime, Herramientas, Enterprise) se escriben tras F7 en
iteraciones sucesivas; el andamiaje ya los contempla.

---

## 13. Riesgos

| Riesgo | Mitigación |
|---|---|
| Doc que se desincroniza del compilador | snippets verificados por `axon check` en CI (F6) |
| Ask AI bloqueado sin dominio | plan B de búsqueda local, intercambiable |
| Swizzles rotos al actualizar Docusaurus | preferir *wrapper* sobre *eject*; fijar versión exacta |
| Verde neón inaccesible | regla dura: el neón nunca lleva texto encima en modo claro |
| **Publicar cifras de primitivas sin reconciliar** (91 / 94 / 99) | prohibido hasta cerrar D28 del RFC. El modelo de negocio ya publica "91": **la doc no lo repite** |
| **Precios dentro de la doc** | los precios viven en `/axon` (comercial) y la compra en `depthcon.io`. `/axon-docs` **nunca** tarifa. La sustentación de precios (§5.3 del modelo) es **interna**: no se publica |
| **URLs de `/capabilities/…` que cambien o caduquen** | están dentro de mensajes de error del compilador: dominio de redirección propio (§11.2) + `onBrokenLinks: throw` + prohibición de retirar páginas (§5.6) |
| Doc que promete de más sobre el runtime | el propio proyecto clasifica 17 primitivas `Unaudited` y 15 `Partial`: la doc **no** describe como `Real` lo que `advertised.rs` no respalda |
| Deriva de marca vs. `axon-fabric/brand` | los tokens se declaran aquí y se **exportan** a fabric/depthcon, no al revés |
| **READMEs hermanos desactualizados** (`axon-lsp` confirmado) | ninguna cifra, flag ni capacidad entra en la doc sin contrastarla contra `VelitRicardo/axon-lang`; la tabla §2 son pistas, no verdad |
| Rastro residual de `Bemarking` en assets heredados | revisar `axon-fabric/brand/` antes de reutilizar cualquier archivo |
| Doc pública que filtre detalle Enterprise | frontera OSS/Enterprise explícita (§14-D11) antes de escribir el bloque 5 |

---

## 14. Decisiones

### Cerradas

| # | Decisión | Resolución |
|---|---|---|
| **D1** ✔ | Idioma | **EN (`defaultLocale`) + ES completo** con i18n desde F1 |
| **D2** ✔ | Tipografía | **Instrument Serif + Inter Tight + JetBrains Mono** |
| **D3** ✔ | Hosting y dominio | **Vercel → `docs.ricardovelit.com`** (TLS listo) |
| **D5** ✔ | Blog | **Eliminado.** `blog: false`; changelog como página de docs curada |
| **D7** ✔ | Repo canónico | **<https://github.com/VelitRicardo/axon-lang>** (OSS) + Enterprise privada |
| **D8** ✔ | Algolia | **Cuenta propia, ya creada.** Claves en F7 |
| **D10** ✔ | Instalación | **`cargo install axon-lang`**, comando único. Implica documentar el prerrequisito de toolchain Rust |
| **D11** ✔ | Frontera OSS/Enterprise | La fija `axon-modelo-negocio-licenciamiento` v2.1 §3.2 + RFC-003. La doc la **publica** (§10.4 del modelo la marca pública) y **no** publica precios |
| **D12** ✔ | Logo | **Marca geométrica de AXON** provista por el autor. Ver §15.1 |
| **D13** ✔ | Versión | **v4.3.0** pública, v4.4.0 en curso. Sin versionado de docs por ahora (§10) |
| **D14** ✔ | Destino comercial | **`/axon` por ahora**, vía constante única (§5.7). Migra a `depthcon.io` cuando esté depurado. La doc **no vende** mientras tanto |
| **D9** ✔ | Subdominio vs subdirectorio | **Subdirectorio `ricardovelit.com/axon-docs/`**. `ricardovelit.com` está en Vercel ⇒ multi-zone (§11.3) |
| **D15** ✔ | Alias de los mensajes de error | **`seal-axon.dev`** — libre según RDAP, solo 301, nunca canónico (§11.2). **Falta comprarlo** |

### Abiertas

| # | Decisión | Estado |
|---|---|---|
| **D4** | Alcance de la landing | *Recomendación aplicada salvo objeción:* landing editorial en la raíz de `/axon-docs/`, no una segunda home comercial (esa es `/axon`). |
| **D6** | Profundidad de la sección "Ediciones y frontera" | *Resuelto en la práctica por D11:* se publica lo que §10.4 del modelo marca como público, ni una línea más. Confirmar que estás de acuerdo. |
| **D14** | ¿Dónde vive la página comercial `/axon`? | El modelo la sitúa en `ricardovelit.com/axon`, pero la compra la pusiste en `depthcon.io`. ¿Precios en `/axon` y checkout en depthcon, o todo lo comercial en depthcon? Afecta a dónde apuntan los CTA de la doc. |

---

## 15. Marca, naming y metadata (SEO)

**El problema:** "axon" solo es un término saturado (neurociencia, decenas de
productos). La doc nunca compite por esa palabra sola.

### 15.1 Identidad visual — la marca AXON (§14-D12 ✔)

Marca geométrica provista por el autor: cuatro cuñas que forman una X asimétrica,
con lectura de aspa y de conexión. Encaja con la línea editorial del sitio mucho
mejor de lo que encajaría un logotipo tipográfico: es **forma pura, sin color
propio**, que es justo lo que necesita un sistema de tokens.

**Cómo se integra:**

- **SVG monocromo con `currentColor`.** Nada de PNG en el navbar ni de color
  quemado en el archivo. Así la marca es **navy sobre papel** en modo claro y
  **papel sobre noche** en modo oscuro, sin duplicar assets. El gris del archivo
  original se descarta: era el color del render, no de la marca.
- **Wordmark = marca + `AXON` en Instrument Serif**, con el espaciado fijado en
  un solo componente `<Wordmark>`. El navbar usa marca + texto; el favicon, solo
  la marca.
- **Un único punto de acento:** en el favicon y en el hero, una de las cuatro
  cuñas puede ir en `--color-accent` (neón). Es el único lugar del sitio donde
  marca y acento se tocan.
- **Lo que necesito de ti:** el **SVG original** (no el PNG) en
  `static/img/axon-mark.svg`. Si no existe SVG, lo redibujo — es geometría
  simple y merece ser vectorial para el favicon.

**Sobre "AXON tiene personalidad pero está atado a Ricardo Velit":** eso no es un
problema de diseño, es una decisión de arquitectura de marca que el sitio ya
respeta. La marca AXON manda en el producto (navbar, favicon, OG); la firma
*"por Ricardo Velit"* vive en el footer, en el `JSON-LD` de tipo `Person` y en el
dominio. Cuando AXON se independice, se cambia el dominio y el footer — no el
sistema visual. Es exactamente lo que hace el §11.2 con las URLs.

### Nomenclatura canónica

| Contexto | Forma |
|---|---|
| Nombre del producto en prosa | **AXON** (versalitas/mayúsculas) |
| Identificador técnico, paquetes, repos, URLs | `axon-lang` |
| Tagline oficial (EN) | **"AXON — the language that compiles to LLMs"** |
| Categoría | *cognitive runtime* · *cognitive OS* |
| Autor | **Ricardo Velit** — autor y desarrollador único |
| Marca retirada | ~~Bemarking~~ — no aparece en ninguna página |

### Metadata base

```ts
title: 'AXON',
tagline: 'The language that compiles to LLMs',
// <title> efectivo de la home:
// "AXON — the language that compiles to LLMs | axon-lang"
```

Keywords de trabajo: `axon-lang`, `cognitive runtime`, `cognitive OS`,
`AI agent language`, `LLM compiler`, `agent DSL`, `Rust AI runtime`.

> **Nota honesta sobre "runtime-cognitive" / "OS-cognitive":** en inglés el orden
> natural es **`cognitive runtime`** y **`cognitive OS`**; invertido no lo busca
> nadie y suena a calco del español. Propongo usar el orden natural en EN y
> *"runtime cognitivo" / "sistema operativo cognitivo"* en ES. El objetivo que
> tú planteas —no depender de "axon" a secas— se cumple igual.

### Reglas de metadata por página

- Cada página MDX declara `title`, `description` (≤ 155 car.) y `keywords`.
- **Nunca** un `<title>` que sea solo "AXON": siempre `Página | axon-lang`.
- `og:image` generada por página con el titular sobre papel + regla neón
  (plantilla única, texto dinámico) — refuerza marca en cada enlace compartido.
- `JSON-LD` de tipo `SoftwareSourceCode` + `Person` (Ricardo Velit) en la home:
  es lo que ata el proyecto a tu persona natural en el grafo de conocimiento,
  que es justo el objetivo del rebranding.
- Canonical siempre absoluto al dominio elegido; `hreflang` en/es automático.

### Ecosistema enlazado

| Propiedad | Rol | Enlace desde la doc |
|---|---|---|
| `ricardovelit.com/axon-docs/` | **esta doc** (canónica) | — |
| `docs.ricardovelit.com` | 301 → canónica | — |
| **`sealaxon.dev`** | 301 → canónica; **URLs de los mensajes de error** (§11.2) | compilador, dossiers, `capabilities.toml` |
| `ricardovelit.com/axon` | comercial *por ahora*: escalera de responsabilidad y precios | un enlace sobrio al pie de "Ediciones y frontera" |
| `depthcon.io` | onboarding comercial **cuando esté listo** | sustituye a `/axon` cambiando una constante (§5.7) |
| `ricardovelit.com` | sitio del autor | navbar / footer |
| `depthcon.io` (`axon-fabric`) | tienda: binario Enterprise y demás | CTA de la sección Enterprise |
| `github.com/VelitRicardo/axon-lang` | OSS | navbar, instalación, "editar esta página" |
| Blog (proyecto aparte) | voz de autor | navbar, cuando exista |

---

## 16. Registro de iteraciones

- **v0.9 · 2026-08-21** — **F2 ejecutada.** `tokens.css` (primitivas →
  semánticos, claro y oscuro), `base.css`, `docusaurus.css` mapeando las
  `--ifm-*`, y `custom.css` reducido a la cadena de imports. Tres familias
  self-hosted vía `scripts/sync-fonts.py`: se detectó que Google sirve fuentes
  variables y que pedir pesos sueltos descargaba **cuatro copias idénticas** —
  con rangos de peso, 423 KB en 12 archivos en lugar de 766 KB en 20.
  `scripts/check-contrast.py` verifica **36 pares AA** resolviendo las cadenas
  de `var()`; todos pasan. **Corregido el §6.2:** `#00C458` no era accesible
  (2.02:1), el verde legible sobre papel es `#007A37`; y `#6E6E6E` se quedaba
  en 4.44:1, sustituido por `#63676E`.
- **v0.8 · 2026-08-21** — **Marca vectorizada.** El SVG entregado no era vectorial:
  un PNG de 113 KB envuelto en SVG con máscara de luminancia, imposible de
  recolorear. Trazado a cuatro polígonos reales (IoU 0.987 contra el original,
  **434 bytes**), `currentColor` para que la marca cambie con el tema. Generados
  `favicon.svg` (con la cuña superior izquierda en acento y paleta por
  `prefers-color-scheme`), `favicon.ico` multi-resolución y `apple-touch-icon`.
  Repo `VelitRicardo/docs-axon-lang` inicializado con remoto; **sin commit
  todavía**. `showLastUpdateTime` y `sitemap.lastmod` siguen apagados hasta que
  exista historial.
- **v0.7 · 2026-08-21** — **F1 ejecutada.** Docusaurus 3.10.2 + TS instalado,
  demo borrado, `blog: false`, `url`/`baseUrl` de subdirectorio, i18n `en`+`es`
  activo, `src/config/links.ts` como punto único de indirección, esqueleto de IA
  y `vercel.json`. Build verde en los dos idiomas y `tsc` limpio.
  **Corrección al §11.3:** el `X-Robots-Tag: noindex` no puede ser incondicional
  —un rewrite de Vercel proxea las cabeceras y habría desindexado el canónico—;
  ahora va condicionado por host. Pendientes que arrastra F1: SVG de la marca,
  favicon (aún el del andamiaje), `git init` para activar `lastmod` y
  "última actualización".
- **v0.6 · 2026-08-21** — **D9 cerrada:** `ricardovelit.com` está en Vercel ⇒
  subdirectorio `/axon-docs/` con rewrite multi-zone (§11.3). D15 revisada: el
  alias **no estaba comprado**; verificados por RDAP `axon-lang.dev` y
  `axonlang.dev` como registrados, y elegido **`seal-axon.dev`** (§11.2). Con
  esto **el plan está listo para ejecutar F1**: solo quedan D4 y D6, que son
  recomendaciones aplicadas salvo objeción y no bloquean nada.
- **v0.5 · 2026-08-21** — Cerradas D14 (comercial en `/axon` por ahora, vía
  constante única; migra a `depthcon.io` cuando esté depurado) y D15
  (**`sealaxon.dev`** como alias 301 de los mensajes de error, nunca canónico).
  Nueva §5.7: **la doc no vende** mientras el producto no vende — cero CTAs de
  compra en F1–F7. Sigue abierta D9 a falta de un dato: el hosting de
  `ricardovelit.com`.
- **v0.4 · 2026-08-21** — Entran `axon-modelo-negocio-licenciamiento` v2.1 y
  RFC-003 como **documentos que gobiernan el contenido** (§2.1). Cerradas D10
  (`cargo install axon-lang`), D11 (frontera OSS/Enterprise), D12 (marca AXON,
  §15.1) y D13 (v4.3.0). **D9 recomendada: subdirectorio
  `ricardovelit.com/axon-docs/`** (§11.1) + dominio corto de redirección para
  las URLs de los mensajes de error (§11.2). Nueva §5.6: la doc pasa a ser
  **parte del release gate del compilador** vía `/capabilities/*` generado desde
  `capabilities.toml`. IA reescrita: bloque 5 "Ediciones y frontera" + bloque 6
  "Catálogo de capacidades". Nuevas fases F5b y F5c. Prohibiciones de contenido:
  cifras de primitivas sin reconciliar y precios dentro de la doc. Nueva D14.
- **v0.3 · 2026-08-21** — Cerradas D3 (`docs.ricardovelit.com`, TLS listo),
  D5 (**blog eliminado** — proyecto aparte), D7 (repo OSS
  `VelitRicardo/axon-lang`, Enterprise privada de pago) y D8 (cuenta Algolia
  propia). Nueva §15 de marca/naming/metadata: tagline *"the language that
  compiles to LLMs"*, autoría Ricardo Velit, `Bemarking` retirada, `depthcon.io`
  como tienda del Enterprise. `axon-lsp` marcado como fuente **no fiable**: la
  verdad es el repo del lenguaje. Abiertas D4, D6 y nuevas D9–D13.
- **v0.2 · 2026-08-21** — Cerradas D1 (EN + ES con i18n), D2 (Instrument Serif +
  Inter Tight + JetBrains Mono) y D3 (Vercel + dominio propio). Actualizados §3,
  §6.3, §10 y §11 en consecuencia. Nueva D8 (dominio exacto). Quedan abiertas
  D4–D8; solo D7 es realmente bloqueante.
- **v0.1 · 2026-08-21** — Plan inicial. Contexto extraído de `axon-lsp`,
  `axon-enterprise`, `axon-fabric` y `prueba-axon`. Docusaurus 3.10.2 confirmado
  como `latest` en npm. Paleta derivada de la referencia editorial. 7 decisiones
  abiertas.
