/**
 * Envoltorio de `SiteMetadata`. Nació para que la portada de cada locale no
 * declare un canonical que redirige; hoy también pone la OG por locale y el
 * JSON-LD de la portada (ver al final de este comentario).
 *
 * EL FALLO. El tema calcula el canonical con `applyTrailingSlash`, que lleva
 * dentro esta guarda:
 *
 *     const shouldNotApply = pathname === '/' || pathname === baseUrl;
 *
 * Con `baseUrl = '/axon-docs/'`, la ruta de la portada *es* el baseUrl, así que
 * queda exenta y conserva la barra final por mucho que el sitio declare
 * `trailingSlash: false`. La exención está para que el build emita
 * `/axon-docs/index.html` y no `/axon-docs.html` (facebook/docusaurus issue 5077):
 * es una regla sobre NOMBRES DE FICHERO que se filtró al canonical, donde no
 * pinta nada.
 *
 * Consecuencia medida en producción el 2026-09-05: la portada declaraba
 * `https://www.ricardovelit.com/axon-docs/`, y esa URL responde 308 hacia la
 * versión sin barra. Un canonical debe apuntar a algo que devuelva 200 — si no,
 * el buscador tiene que elegir por su cuenta, que es justo lo que el canonical
 * existe para evitar. Afectaba a dos páginas: `/axon-docs/` y `/axon-docs/es/`.
 *
 * POR QUÉ ENVOLVER Y NO EYECTAR. Un swizzle completo de `SiteMetadata` copiaría
 * ~150 líneas del tema al repo, que habría que reconciliar en cada subida de
 * versión de Docusaurus, para corregir una cadena. Envolver funciona porque
 * react-helmet-async trata `rel` como atributo primario cuando vale `canonical`
 * —`{rel: ['amphtml', 'canonical', 'alternate']}` en su tabla de dedupe—, así
 * que un segundo `<link rel="canonical">` SUSTITUYE al del tema en lugar de
 * añadirse. `og:url` deduplica igual, por `property`. Se emite uno de cada.
 *
 * POR QUÉ NO SE USA `applyTrailingSlash` AQUÍ. Vive en `@docusaurus/utils-common`,
 * que no es dependencia directa de este sitio: importarla sería depender de un
 * paquete transitivo. Con `trailingSlash: false` quitar la barra final da el
 * mismo resultado que esa función en todas las rutas, y además arregla las dos
 * que ella exime. Solo se usan API públicas.
 *
 * Cuando Docusaurus deje de aplicar la guarda del issue 5077 al canonical, esa parte
 * sobra: no hará nada, porque no habrá barra que quitar.
 *
 * DOS COSAS MÁS VIVEN AQUÍ, por la misma razón: necesitan el locale o la ruta,
 * y `themeConfig` no los conoce.
 *
 * - **OG por locale.** `themeConfig.image` es uno solo; en /es/ se sustituye
 *   por la versión en español. Una página con `image` en su frontmatter sigue
 *   ganando: su `<Head>` va más hondo en el árbol que este.
 * - **JSON-LD en la portada de cada locale** (plan §15): WebSite +
 *   SoftwareApplication + Person. Es lo que ata AXON a su autor en el grafo de
 *   conocimiento y le da a los motores generativos una ficha que citar. No es
 *   `SoftwareSourceCode`: no hay repo público que declarar como `codeRepository`.
 */

import React, {type ReactNode} from 'react';
import SiteMetadata from '@theme-original/SiteMetadata';
import type SiteMetadataType from '@theme/SiteMetadata';
import type {WrapperProps} from '@docusaurus/types';
import Head from '@docusaurus/Head';
import useBaseUrl from '@docusaurus/useBaseUrl';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {useLocation} from '@docusaurus/router';

import {AUTHOR_NAME, AUTHOR_URL, AXON_VERSION} from '@site/src/config/links';

/** Locales con OG propia. El resto hereda `themeConfig.image`. */
const OG_BY_LOCALE: Record<string, string> = {es: 'img/og/axon-es.png'};

const DESCRIPTION: Record<string, string> = {
  en: 'A compiled language that targets LLMs instead of CPUs — where regulatory compliance is a type error, not a runbook.',
  es: 'Un lenguaje compilado cuyo destino son los LLM, no las CPU — donde el cumplimiento normativo es un error de tipos, no un procedimiento.',
};

type Props = WrapperProps<typeof SiteMetadataType>;

export default function SiteMetadataWrapper(props: Props): ReactNode {
  const {
    siteConfig: {url: siteUrl, trailingSlash, baseUrl, tagline},
    i18n: {currentLocale},
  } = useDocusaurusContext();
  const {pathname} = useLocation();

  /* La misma entrada que usa el tema, para que el resultado no pueda
     divergir del suyo en las rutas que ya estaban bien. */
  const path = useBaseUrl(pathname);

  /* `path !== '/'` protege el único caso en que la barra final es la ruta
     entera: un sitio servido en la raíz del dominio, sin baseUrl. Ahí no
     hay nada que quitar y dejarlo en cadena vacía rompería el canonical. */
  const needsFix =
    trailingSlash === false && path !== '/' && path.endsWith('/');

  const canonicalUrl = needsFix
    ? siteUrl + path.replace(/\/+$/, '')
    : null;

  const ogPath = OG_BY_LOCALE[currentLocale];
  const ogImage = useBaseUrl(ogPath ?? '', {absolute: true});

  const homeUrl = siteUrl + baseUrl.replace(/\/+$/, '');
  const isHome = pathname.replace(/\/+$/, '') === baseUrl.replace(/\/+$/, '');
  const logo = useBaseUrl('img/icon-512.png', {absolute: true});
  const jsonLd = isHome && {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Person',
        '@id': `${AUTHOR_URL}/#person`,
        name: AUTHOR_NAME,
        url: AUTHOR_URL,
      },
      {
        '@type': 'SoftwareApplication',
        '@id': `${siteUrl}/axon-docs#software`,
        name: 'AXON',
        alternateName: 'axon-lang',
        applicationCategory: 'DeveloperApplication',
        applicationSubCategory: 'Programming language',
        operatingSystem: 'Linux, macOS, Windows',
        softwareVersion: AXON_VERSION,
        description: DESCRIPTION[currentLocale] ?? tagline,
        image: logo,
        url: homeUrl,
        author: {'@id': `${AUTHOR_URL}/#person`},
      },
      {
        '@type': 'WebSite',
        '@id': `${homeUrl}#website`,
        name: 'AXON documentation',
        url: homeUrl,
        inLanguage: currentLocale,
        about: {'@id': `${siteUrl}/axon-docs#software`},
        publisher: {'@id': `${AUTHOR_URL}/#person`},
      },
    ],
  };

  return (
    <>
      <SiteMetadata {...props} />
      {ogPath && (
        <Head>
          <meta property="og:image" content={ogImage} />
          <meta name="twitter:image" content={ogImage} />
        </Head>
      )}
      {jsonLd && (
        <Head>
          <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
        </Head>
      )}
      {canonicalUrl && (
        <Head>
          <link rel="canonical" href={canonicalUrl} />
          <meta property="og:url" content={canonicalUrl} />
        </Head>
      )}
    </>
  );
}
