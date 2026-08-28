/**
 * Punto único de indirección para toda URL externa del sitio.
 *
 * Regla (plan §5.7): ninguna página, componente ni MDX escribe una de estas
 * URLs a mano. El día que `depthcon.io` esté listo, migrar el onboarding
 * comercial es cambiar COMMERCIAL_URL aquí y en ningún otro sitio.
 */

/**
 * No hay `REPO_URL`, y la ausencia es deliberada.
 *
 * El repo del lenguaje dejó de ser público al cambiar el modelo de negocio, y
 * un enlace a un repo privado no es un enlace: es un 404 de GitHub servido a
 * quien confió en el navbar. Mientras no exista un destino público, la doc no
 * enlaza código fuente — ni en el navbar, ni en el pie, ni en "editar esta
 * página" (por eso `editUrl` tampoco está en `docusaurus.config.ts`).
 *
 * El día que haya un espejo público, esta constante vuelve aquí y en ningún
 * otro sitio.
 */

/**
 * Destino comercial. Hoy la página del autor; mañana `https://depthcon.io`.
 * La doc no vende (plan §5.7): esto se enlaza una vez, al pie de la sección
 * "Ediciones y frontera". Nunca como CTA.
 */
export const COMMERCIAL_URL = 'https://ricardovelit.com/axon';

/**
 * Sitio del autor.
 *
 * **Con `www`, y no es cosmético.** El apex hace un 308 permanente hacia www,
 * así que es www quien sirve de verdad. De este valor salen el `url` del sitio,
 * el `rel=canonical` de cada página y cada `<loc>` del sitemap: declarar el
 * apex significaba declarar un host que redirige.
 *
 * Costó un rastreo completo de Algolia: el crawler arrancaba en el apex,
 * seguía el 308 y sus patrones —escritos con el apex— dejaban de casar, así
 * que descartaba las 204 páginas. El índice quedó en 0 sin un solo error.
 */
export const AUTHOR_URL = 'https://www.ricardovelit.com';

/** Autor y desarrollador único del proyecto. */
export const AUTHOR_NAME = 'Ricardo Velit';

/**
 * Alias permanente de las URLs que el compilador graba en sus diagnósticos
 * (plan §11.2). Redirige 301 al canónico. Este valor es el que va en el campo
 * `url` de `capabilities.toml`: es el único que no puede cambiar nunca.
 */
export const CAPABILITY_ALIAS = 'https://seal-axon.dev';

/** Versión pública del lenguaje contra la que está escrita la doc. */
export const AXON_VERSION = '4.3.0';

/**
 * Correo de contacto del pie.
 *
 * No se estrena un canal: es el mismo que el sitio del autor ya publica en su
 * propio pie. Publicar aquí uno distinto sería abrir una vía que nadie atiende.
 */
export const CONTACT_EMAIL = 'hola@ricardovelit.com';

/**
 * Licencia del **contenido** de la doc, y solo del contenido.
 *
 * CC BY 4.0 cubre lo que se lee —prosa, ejemplos, tablas—: se puede copiar y
 * adaptar citando la fuente. No cubre la marca AXON ni el compilador, que
 * quedan bajo todos los derechos reservados. La distinción es la razón de que
 * el pie tenga dos frases y no una.
 */
export const DOC_LICENSE_URL = 'https://creativecommons.org/licenses/by/4.0/';

/**
 * Año del aviso de copyright. Literal a propósito: un `getFullYear()` haría
 * que la fecha dependiera del día del build y no del año de la obra.
 */
export const COPYRIGHT_YEAR = '2026';
