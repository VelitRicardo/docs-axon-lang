import siteConfig from '@generated/docusaurus.config';
import axon from '@site/src/prism/axon';
import type * as PrismNamespace from 'prismjs';
import type {Optional} from 'utility-types';

/**
 * Eject de `@docusaurus/theme-classic/theme/prism-include-languages`.
 *
 * Es el único punto donde Docusaurus expone la instancia de Prism que usa
 * prism-react-renderer, así que es el único sitio donde se puede registrar una
 * gramática propia. Se conserva el cuerpo original íntegro y solo se añade la
 * llamada a `axon()`; cuando Docusaurus cambie este archivo, hay que
 * reconciliar — es la deuda que se acepta a cambio de tener resaltado propio.
 */
export default function prismIncludeLanguages(
  PrismObject: typeof PrismNamespace,
): void {
  const {
    themeConfig: {prism},
  } = siteConfig;
  const {additionalLanguages} = prism as {additionalLanguages: string[]};

  const PrismBefore = globalThis.Prism;
  globalThis.Prism = PrismObject;

  additionalLanguages.forEach((lang) => {
    if (lang === 'php') {
      require('prismjs/components/prism-markup-templating.js');
    }
    require(`prismjs/components/prism-${lang}`);
  });

  // La gramática de AXON, generada desde el lexer del compilador.
  axon(PrismObject);

  delete (globalThis as Optional<typeof globalThis, 'Prism'>).Prism;
  if (typeof PrismBefore !== 'undefined') {
    globalThis.Prism = PrismObject;
  }
}
