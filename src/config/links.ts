/**
 * Punto único de indirección para toda URL externa del sitio.
 *
 * Regla (plan §5.7): ninguna página, componente ni MDX escribe una de estas
 * URLs a mano. El día que `depthcon.io` esté listo, migrar el onboarding
 * comercial es cambiar COMMERCIAL_URL aquí y en ningún otro sitio.
 */

/** Repo OSS canónico del lenguaje. */
export const REPO_URL = 'https://github.com/VelitRicardo/axon-lang';

/** Rama por defecto, usada para los enlaces "editar esta página". */
export const REPO_BRANCH = 'main';

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
