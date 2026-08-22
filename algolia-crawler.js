/**
 * Configuración del crawler de Algolia para la doc de AXON.
 *
 * Se pega en el editor de crawlers de Algolia (Crawler Admin → Editor). No la
 * usa el build: vive aquí porque es configuración del proyecto y debe estar
 * versionada, revisada y explicada como cualquier otra.
 *
 * Cuándo se activa esto: F7, con el sitio ya en producción bajo su dominio
 * definitivo. Antes no — un crawler no puede indexar lo que no existe, y
 * reindexar tras cambiar de origen obliga a rehacer el índice entero.
 *
 * Mientras tanto, el sitio usa índice local (ver docusaurus.config.ts).
 */

new Crawler({
  appId: 'U78MSO2SV3',
  apiKey: 'CRAWLER_API_KEY', // la del crawler, NO la de búsqueda ni la admin

  // NOTA SOBRE EL NOMBRE DEL ÍNDICE. `ALGOLIA_INDEX_AXON` es el nombre de una
  // variable de entorno, no de un índice — probablemente se creó copiando la
  // plantilla. Funciona igual, pero si se va a renombrar, ahora es gratis y
  // después cuesta un recrawl completo. `axon-docs` sería lo natural.
  indexPrefix: '',
  rateLimit: 8,
  maxDepth: 10,

  startUrls: ['https://ricardovelit.com/axon-docs/'],
  sitemaps: ['https://ricardovelit.com/axon-docs/sitemap.xml'],

  // El origen de Vercel sirve el mismo contenido y NO debe indexarse: dos
  // orígenes con el mismo texto parten los enlaces y ensucian el índice.
  exclusionPatterns: ['**/*.vercel.app/**'],

  discoveryPatterns: ['https://ricardovelit.com/axon-docs/**'],
  ignoreCanonicalTo: false,

  actions: [
    {
      indexName: 'ALGOLIA_INDEX_AXON',
      pathsToMatch: ['https://ricardovelit.com/axon-docs/**'],
      recordExtractor: ({ helpers, url }) => {
        // La faceta de idioma es OBLIGATORIA (plan §9). Sin ella, buscar desde
        // /es/ devuelve resultados en inglés: el fallo clásico de i18n con
        // Algolia, y el más difícil de notar porque el buscador "funciona".
        const language = url.pathname.includes('/axon-docs/es/') ? 'es' : 'en';

        return helpers.docsearch({
          recordProps: {
            lvl0: {
              selectors: '.menu__link--sublist.menu__link--active',
              defaultValue: 'Documentation',
            },
            lvl1: 'header h1, article h1',
            lvl2: 'article h2',
            lvl3: 'article h3',
            lvl4: 'article h4',
            // Los bloques de código se indexan: media doc son ejemplos, y
            // buscar `axon-T957` o `secret_partition` tiene que encontrarlos.
            content: 'article p, article li, article td, article pre',
            pageRank: url.pathname.includes('/reference/') ? '1' : '0',
          },
          // Se añade a CADA registro, no solo a la página: contextualSearch
          // filtra por este atributo.
          extraAttributes: { language },
          aggregateContent: true,
          recordVersion: 'v3',
        });
      },
    },
  ],

  initialIndexSettings: {
    'ALGOLIA_INDEX_AXON': {
      attributesForFaceting: [
        'type',
        'lang',
        'language', // el que usa nuestro contextualSearch
        'docusaurus_tag',
      ],
      attributesToRetrieve: ['hierarchy', 'content', 'anchor', 'url', 'language'],
      attributesToHighlight: ['hierarchy', 'content'],
      attributesToSnippet: ['content:12'],
      searchableAttributes: [
        'unordered(hierarchy.lvl0)',
        'unordered(hierarchy.lvl1)',
        'unordered(hierarchy.lvl2)',
        'unordered(hierarchy.lvl3)',
        'unordered(hierarchy.lvl4)',
        'content',
      ],
      customRanking: ['desc(weight.pageRank)', 'desc(weight.level)', 'asc(weight.position)'],
      distinct: true,
      attributeForDistinct: 'url',
      ranking: ['words', 'filters', 'typo', 'attribute', 'proximity', 'exact', 'custom'],
      highlightPreTag: '<span class="algolia-docsearch-suggestion--highlight">',
      highlightPostTag: '</span>',
      minWordSizefor1Typo: 4,
      minWordSizefor2Typos: 8,
      // Los identificadores del lenguaje no toleran erratas: `mint` y `mind`
      // son cosas distintas, y `axon-T957` no es `axon-T937`.
      allowTyposOnNumericTokens: false,
      minProximity: 1,
      camelCaseAttributes: ['hierarchy', 'content'],
      advancedSyntax: true,
    },
  },
});
