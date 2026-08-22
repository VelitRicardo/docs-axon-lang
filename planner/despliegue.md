# Despliegue — F7

Todo lo que no necesita credenciales ya está hecho y verificado. Lo que queda son
cinco pasos que solo puedes dar tú, porque requieren cuentas.

---

## Estado

| Pieza | Estado |
|---|---|
| `url` + `baseUrl` de subdirectorio | ✅ en `docusaurus.config.ts` |
| `vercel.json` del proyecto de la doc | ✅ `cleanUrls`; el noindex pasó a robots.txt |
| Búsqueda funcionando | ✅ índice local, EN y ES |
| Conmutación a Algolia | ✅ por variables de entorno, sin tocar código |
| Config del crawler | ✅ `algolia-crawler.js`, con la faceta de idioma |
| Estilos del modal de búsqueda | ✅ mapeados a nuestros tokens |
| Proyecto en Vercel | ✅ `docs-axon-lang`, producción en `master` |
| Rewrite desde `ricardovelit.com` | ✅ desplegado y verificado |
| `seal-axon.dev` | ⬜ **tú** |
| Claves de Algolia | ⬜ **tú** |
| Retirada de Mintlify | ⬜ **tú**, y en último lugar (§11.5 del plan) |

---

## 1 · Proyecto en Vercel

Importar `VelitRicardo/docs-axon-lang`. Rama de producción: **`master`**.

Vercel detecta Docusaurus solo. Si pide los valores: build `npm run build`,
salida `build`, install `npm ci`.

**No hace falta añadirle dominio a este proyecto.** Se sirve a través del sitio
del autor, así que su URL pública es la de Vercel y el `vercel.json` ya le pone
`noindex` a ese origen — condicionado por host, para que la cabecera no viaje
por el rewrite y desindexe el canónico.

`cleanUrls` no es opcional aquí. Con `trailingSlash: false` el build escribe
`quickstart.html` pero el HTML enlaza `/axon-docs/quickstart`; sin `cleanUrls`
Vercel devuelve 404 en toda página que no sea la home.

**Verificado en el deployment tras arreglar el `vercel.json`:**

| Ruta | Antes | Ahora |
|---|---|---|
| `/quickstart` | 404 | **200** |
| `/es/quickstart` | 404 | **200** |
| `/reference/primitives/persona` | 404 | **200** |
| `X-Robots-Tag` en el origen | ausente | **noindex** |
| `canonical` | — | `ricardovelit.com/axon-docs/quickstart` |

El archivo tenía `\.` escrito con una sola barra, que **no es un escape válido
en JSON**: Vercel descartaba el documento entero y se perdían `cleanUrls` y la
cabecera a la vez. No rompía el build — rompía el despliegue, en silencio y solo
en producción. Ahora hay un paso de CI que parsea el archivo.

## 2 · El rewrite, en el proyecto de `ricardovelit.com`

```json
{
  "rewrites": [
    { "source": "/axon-docs",
      "destination": "https://docs-axon-lang.vercel.app" },
    { "source": "/axon-docs/:path*",
      "destination": "https://docs-axon-lang.vercel.app/:path*" }
  ]
}
```

**El destino NO lleva el prefijo.** Verificado sobre el build real: no existe
ninguna carpeta `build/axon-docs/`; el deployment sirve el sitio en su raíz y es
el `baseUrl` quien escribe `/axon-docs/` delante de cada URL del HTML. Con el
destino prefijado, la home carga y **todos los assets dan 404** — el fallo más
difícil de diagnosticar de este montaje, porque el HTML llega perfecto.

**Comprobación después de desplegar**, en este orden:

```bash
curl -sI https://ricardovelit.com/axon-docs/ | head -1          # 200
curl -s  https://ricardovelit.com/axon-docs/ | grep -o 'canonical[^>]*'
curl -sI https://ricardovelit.com/axon-docs/quickstart | head -1 # 200
curl -sI https://ricardovelit.com/axon-docs/es/ | head -1        # 200
# un asset, que es lo que rompe si el rewrite lleva prefijo:
curl -sI https://ricardovelit.com/axon-docs/assets/css/styles.*.css | head -1
```

## 3 · `docs.ricardovelit.com` y `seal-axon.dev`

- `docs.ricardovelit.com` → **301** a `https://ricardovelit.com/axon-docs/`,
  conservando la ruta. Ya tiene TLS; solo cambia a dónde apunta.
- `seal-axon.dev` → **301** a lo mismo, conservando la ruta. Es el alias que va
  dentro de los mensajes de error del compilador, así que:
  - auto-renovación **activada**, con aviso a 90 días;
  - nunca sirve contenido, solo redirige;
  - el campo `url` de `capabilities.toml` usa **este** dominio, no el canónico.
    Es el valor que queda grabado en el binario y el único que no puede cambiar.

## 4 · Algolia

El sitio ya trae buscador; esto lo sustituye por uno con Ask AI.

1. Crear el índice `axon-docs`.
2. Pegar `algolia-crawler.js` en el editor de crawlers y lanzar el primer
   rastreo. **Después** de que el dominio definitivo responda: reindexar tras
   cambiar de origen es rehacerlo todo.
3. En Vercel, variables de entorno del proyecto de la doc:

   ```
   ALGOLIA_APP_ID=...           # falta: 10 caracteres, arriba en API Keys
   ALGOLIA_SEARCH_API_KEY=...   # la de SOLO BÚSQUEDA — pública por diseño
   ALGOLIA_INDEX_NAME=...       # confirmar el nombre exacto del índice
   ```

   **De las cuatro claves que expone Algolia, el sitio solo necesita una.** La
   de búsqueda viaja en el bundle de JavaScript: es pública por diseño y no
   puede hacer nada salvo consultar. Las de Analytics, Usage y Monitoring son
   claves de lectura con ámbito de cuenta que esta doc no usa nunca — no deben
   salir de Algolia ni entrar en este repo.

   Con las tres definidas, el build usa Algolia; sin ellas, índice local. No hay
   que tocar ningún archivo.

4. **La clave admin no entra nunca aquí.** El crawler usa la suya, y vive en
   Algolia, no en el repo.

**Prueba de aceptación de Ask AI** (plan §12-F7): cinco preguntas cuya respuesta
debe venir con la cita correcta.

- *¿Qué pasa si un endpoint QUERY escribe?* → `axon-T927`
- *¿Cómo se rota una credencial sin poder leerla?* → `rotation_without_revelation`
- *¿Por qué `apply:` no es determinista?* → `dispatch_vs_cognition`
- *¿Qué cubre un shield y qué no?* → cobertura κ, `axon-T957`
- *¿Cuál es la ventana de crédito recomendada para un chat?* → `session_duality`, n = 1

## 5 · Después, y solo después: Mintlify

El orden del §11.5 del plan: desplegar → verificar paridad → poner los 301 en el
sitio viejo → dejar que el buscador los siga → cancelar.

Si el sitio Mintlify nunca llegó a publicarse, no hay nada que preservar y se
puede cancelar hoy.

---

## Nota honesta sobre el índice local

Pesa ~4 MB por idioma. Se descarga solo cuando alguien abre el buscador, y va
con hash para que se cachee indefinidamente — pero es real, y crecerá con el
corpus. Es una razón más para que Algolia sea el destino, no un lujo.
