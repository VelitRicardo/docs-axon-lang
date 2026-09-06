/**
 * Envoltorio de `SiteMetadata` con un único propósito: que la portada de cada
 * locale no declare un canonical que redirige.
 *
 * EL FALLO. El tema calcula el canonical con `applyTrailingSlash`, que lleva
 * dentro esta guarda:
 *
 *     const shouldNotApply = pathname === '/' || pathname === baseUrl;
 *
 * Con `baseUrl = '/axon-docs/'`, la ruta de la portada *es* el baseUrl, así que
 * queda exenta y conserva la barra final por mucho que el sitio declare
 * `trailingSlash: false`. La exención está para que el build emita
 * `/axon-docs/index.html` y no `/axon-docs.html` (facebook/docusaurus#5077):
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
 * Cuando Docusaurus deje de aplicar la guarda de #5077 al canonical, este
 * archivo sobra: no hará nada, porque no habrá barra que quitar.
 */

import React, {type ReactNode} from 'react';
import SiteMetadata from '@theme-original/SiteMetadata';
import type SiteMetadataType from '@theme/SiteMetadata';
import type {WrapperProps} from '@docusaurus/types';
import Head from '@docusaurus/Head';
import useBaseUrl from '@docusaurus/useBaseUrl';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {useLocation} from '@docusaurus/router';

type Props = WrapperProps<typeof SiteMetadataType>;

export default function SiteMetadataWrapper(props: Props): ReactNode {
  const {
    siteConfig: {url: siteUrl, trailingSlash},
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

  return (
    <>
      <SiteMetadata {...props} />
      {canonicalUrl && (
        <Head>
          <link rel="canonical" href={canonicalUrl} />
          <meta property="og:url" content={canonicalUrl} />
        </Head>
      )}
    </>
  );
}
