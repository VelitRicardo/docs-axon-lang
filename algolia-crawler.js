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
 *'
 * Mientras tanto, el sitio usa índice local (ver docusaurus.config.ts).
 */

new Crawler({
  appId: 'U78MSO2SV3',
  apiKey: 'c575206087042c2fc3d....',
  indexPrefix: '',
  rateLimit: 8,
  maxDepth: 10,

  // Dos detalles que costaron dos rastreos en cero, los dos por lo mismo:
  // el crawler acaba en una URL que sus propios patrones no reconocen.
  //
  //   1. www, no el apex — el apex hace un 308 hacia www.
  //   2. SIN barra final — `/axon-docs/` redirige a `/axon-docs`
  //      (cleanUrls + trailingSlash: false), y `/axon-docs/**` NO casa con
  //      `/axon-docs`: micromatch exige la barra y algo detrás. La página de
  //      aterrizaje se descartaba y el descubrimiento moría ahí mismo.
  startUrls: ['https://www.ricardovelit.com/axon-docs'],
  sitemaps: ['https://www.ricardovelit.com/axon-docs/sitemap.xml'],

  // El crawler de Algolia IGNORA toda URL que redirija — no la sigue, la
  // descarta. Con `cleanUrls` cada ruta con barra final redirige, así que toda
  // URL que se le dé tiene que ser terminal. Por eso `startUrls` va sin barra.
  // (La home aparece en el sitemap como `/axon-docs/`, que redirige y se
  // descarta; se indexa igual porque es la URL de arranque.)

  exclusionPatterns: [
    // El origen de Vercel sirve el mismo contenido y NO debe indexarse: dos
    // orígenes con el mismo texto parten los enlaces y ensucian el índice.
    '**/*.vercel.app/**',
    // La página de resultados del buscador no es contenido.
    'https://www.ricardovelit.com/axon-docs/search',
    'https://www.ricardovelit.com/axon-docs/es/search',
  ],

  discoveryPatterns: [
    'https://www.ricardovelit.com/axon-docs',
    'https://www.ricardovelit.com/axon-docs/**',
  ],
  ignoreCanonicalTo: false,

  actions: [
    {
      indexName: 'axon-docs',
      pathsToMatch: [
        'https://www.ricardovelit.com/axon-docs',
        'https://www.ricardovelit.com/axon-docs/**',
      ],
      recordExtractor: ({ helpers, url }) => {
        // La faceta de idioma es OBLIGATORIA (plan §9). Sin ella, buscar desde
        // /es/ devuelve resultados en inglés: el fallo clásico de i18n con
        // Algolia, y el más difícil de notar porque el buscador "funciona".
        const language = url.pathname.includes('/axon-docs/es/') ? 'es' : 'en';

        const records = helpers.docsearch({
          // Selectores de la plantilla OFICIAL de Algolia para Docusaurus.
          // Los anteriores eran de la plantilla genérica de DocSearch (lvl0 =
          // categoría del sidebar, lvl1 = h1) y no extraían nada. Aquí lvl0 es
          // el titular de la página y los niveles bajan por los h2..h6, que es
          // como Docusaurus estructura el contenido de verdad.
          recordProps: {
            lvl0: {
              selectors: 'header h1',
              defaultValue: 'Documentation',
            },
            lvl1: 'article h2',
            lvl2: 'article h3',
            lvl3: 'article h4',
            lvl4: 'article h5',
            lvl5: 'article h6',
            // Se añaden `td` y `pre` a lo que trae la plantilla: media doc son
            // tablas y ejemplos, y buscar `axon-T957` o `secret_partition`
            // tiene que encontrarlos.
            content: 'article p, article li, article td, article pre',
          },
          aggregateContent: true,
          recordVersion: 'v3',
        });

        // `language` se añade mapeando los registros, no con una opción del
        // helper: `extraAttributes` no existe en su API. Tiene que ir en CADA
        // registro, porque es por registro por lo que filtra contextualSearch.
        return records.map((record) => ({ ...record, language }));
      },
    },
  ],

  initialIndexSettings: {
    'axon-docs': {
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
