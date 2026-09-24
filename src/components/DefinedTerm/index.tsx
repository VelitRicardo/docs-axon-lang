import type {ReactNode} from 'react';
import Head from '@docusaurus/Head';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {useLocation} from '@docusaurus/router';

/**
 * JSON-LD `DefinedTerm` para una página que DEFINE una categoría propia
 * —compile-time compliance, epistemic types—. No pinta nada.
 *
 * Es la ficha que un motor generativo puede citar: el término, su definición
 * en una frase y el conjunto al que pertenece, que es el lenguaje. Así el
 * término queda atado a "AXON programming language" y no flota suelto.
 *
 * `definition` repite la primera frase de la página en texto plano. Se repite
 * a propósito y no se extrae del MDX: esa frase es la que ya está escrita para
 * ser citada, y si cambia, cambia aquí en el mismo commit.
 *
 * No hay `FAQPage`: Google dejó de mostrar ese resultado para casi todos los
 * sitios en 2023, y las preguntas ya están en el HTML, que es lo que leen.
 */
export default function DefinedTerm({
  name,
  definition,
}: {
  name: string;
  definition: string;
}): ReactNode {
  const {
    siteConfig: {url: siteUrl, baseUrl},
    i18n: {currentLocale},
  } = useDocusaurusContext();
  const {pathname} = useLocation();

  const pageUrl = siteUrl + pathname.replace(/\/+$/, '');
  // En un locale no por defecto, `baseUrl` ya lleva el prefijo: `/axon-docs/es/`.
  const homeUrl = siteUrl + baseUrl.replace(/\/+$/, '');

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'DefinedTerm',
    '@id': `${pageUrl}#term`,
    name,
    description: definition,
    url: pageUrl,
    inLanguage: currentLocale,
    inDefinedTermSet: {
      '@type': 'DefinedTermSet',
      name: 'AXON programming language (axon-lang)',
      url: homeUrl,
    },
  };

  return (
    <Head>
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
    </Head>
  );
}
