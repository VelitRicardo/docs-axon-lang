import type {PrismTheme} from 'prism-react-renderer';

/**
 * Tema de código construido sobre los tokens (plan §6.2, §8).
 *
 * Los colores son `var(--syntax-*)`, no literales. Eso tiene una consecuencia
 * que vale la pena entender: **un solo tema sirve para los dos modos**. Las
 * variables ya cambian con el tema, así que no hay una paleta clara y otra
 * oscura que puedan desincronizarse — hay una sola, y vive en tokens.css.
 *
 * Los 16 pares de sintaxis están verificados en AA por
 * scripts/check-contrast.py, en claro y en oscuro.
 */
const axonPrismTheme: PrismTheme = {
  plain: {
    color: 'var(--code-text)',
    backgroundColor: 'var(--code-bg)',
  },
  styles: [
    {
      types: ['comment', 'prolog', 'cdata'],
      style: {color: 'var(--syntax-comment)', fontStyle: 'italic'},
    },
    {
      // Los comentarios de documentación son contenido, no ruido: van rectos.
      types: ['doc-comment'],
      style: {color: 'var(--syntax-comment)', fontStyle: 'normal'},
    },
    {
      types: ['keyword', 'selector', 'atrule', 'rule', 'important'],
      style: {color: 'var(--syntax-keyword)'},
    },
    {
      // Las 62 declaraciones de alto nivel: la jerarquía del lenguaje a
      // primera vista. El token no lleva alias `keyword` justamente para que
      // este color no lo pise el de la entrada anterior.
      types: ['declaration'],
      style: {color: 'var(--syntax-decl)', fontWeight: 'bold'},
    },
    {
      types: ['class-name', 'builtin', 'symbol', 'tag', 'constant'],
      style: {color: 'var(--syntax-type)'},
    },
    {
      types: ['string', 'char', 'inserted', 'regex', 'url'],
      style: {color: 'var(--syntax-string)'},
    },
    {
      types: ['number', 'boolean', 'duration', 'range', 'variable', 'deleted'],
      style: {color: 'var(--syntax-number)'},
    },
    {
      types: ['attribute', 'attr-name', 'property', 'parameter'],
      style: {color: 'var(--syntax-attr)'},
    },
    {
      types: ['function', 'function-name', 'method'],
      style: {color: 'var(--syntax-keyword)'},
    },
    {
      types: ['operator', 'punctuation', 'entity', 'attr-value'],
      style: {color: 'var(--syntax-punct)'},
    },
    {
      types: ['namespace'],
      style: {color: 'var(--syntax-punct)', opacity: 0.8},
    },
  ],
};

export default axonPrismTheme;
