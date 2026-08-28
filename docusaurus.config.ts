import axonPrismTheme from './src/prism/theme';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

import {
  AUTHOR_URL,
  AUTHOR_NAME,
  COMMERCIAL_URL,
} from './src/config/links';

// Esto corre en Node.js — nada de APIs de navegador ni JSX aquí.

const BASE_URL = '/axon-docs/';

/**
 * Búsqueda: Algolia si hay credenciales, local si no (plan §9).
 *
 * El intercambio es una variable de entorno, no una reescritura: mientras el
 * sitio no esté en producción con su dominio, Algolia no puede rastrearlo, y
 * una doc sin buscador es una doc a medias. El índice local se construye en el
 * build y funciona sin red ni claves.
 *
 * Cuando existan las claves, se definen en Vercel y este archivo no cambia.
 * La de búsqueda es PÚBLICA por diseño; la admin no entra aquí jamás.
 */
const ALGOLIA_APP_ID = process.env.ALGOLIA_APP_ID;
const ALGOLIA_SEARCH_KEY = process.env.ALGOLIA_SEARCH_API_KEY;
const ALGOLIA_INDEX = process.env.ALGOLIA_INDEX_NAME;
const usarAlgolia = Boolean(ALGOLIA_APP_ID && ALGOLIA_SEARCH_KEY && ALGOLIA_INDEX);

const config: Config = {
  // Plan §15 — el `title` del sitio es el sufijo de cada <title>. Se usa el
  // identificador técnico para que ninguna página quede titulada solo "AXON",
  // que es una palabra saturada. El nombre en prosa vive en el navbar.
  title: 'axon-lang',
  tagline: 'The language that compiles to LLMs',
  favicon: 'img/favicon.svg',

  future: {
    v4: true,
  },

  // Plan §11.1 — canónico en subdirectorio del dominio del autor.
  // `docs.ricardovelit.com` y `seal-axon.dev` son alias 301, nunca origen.
  url: AUTHOR_URL,
  baseUrl: BASE_URL,
  trailingSlash: false,

  organizationName: 'VelitRicardo',
  projectName: 'axon-lang',

  onBrokenLinks: 'throw',

  plugins: usarAlgolia
    ? []
    : [
        [
          '@easyops-cn/docusaurus-search-local',
          {
            hashed: true,
            indexBlog: false,
            language: ['en', 'es'],
            docsRouteBasePath: '/',
            highlightSearchTermsOnTargetPage: true,
            searchResultLimits: 8,
          },
        ],
      ],

  headTags: [
    // Respaldo para navegadores que no leen favicons SVG.
    {
      tagName: 'link',
      attributes: {rel: 'icon', href: `${BASE_URL}img/favicon.ico`, sizes: 'any'},
    },
    {
      tagName: 'link',
      attributes: {rel: 'apple-touch-icon', href: `${BASE_URL}img/apple-touch-icon.png`},
    },
  ],

  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'throw',
    },
  },

  // Plan §10 — EN por defecto, ES completo. La infraestructura entra en F1
  // aunque el corpus ES se escriba en F5.
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'es'],
    localeConfigs: {
      en: {label: 'English', htmlLang: 'en-US'},
      es: {label: 'Español', htmlLang: 'es-ES'},
    },
  },

  presets: [
    [
      'classic',
      {
        docs: {
          routeBasePath: '/',
          sidebarPath: './sidebars.ts',
          // Sin `editUrl`: el repo del lenguaje es privado y "editar esta
          // página" apuntaría a un 404 desde el pie de cada página.
          showLastUpdateTime: false,
        },
        // Plan §14-D5 — el blog es otro proyecto, con voz propia.
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
        sitemap: {
          // `lastmod` requiere historial git: se activa con el repo.
          changefreq: 'weekly',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // TODO F3 — plantilla de OG image (titular sobre papel + regla neón).
    colorMode: {
      respectPrefersColorScheme: true,
    },
    metadata: [
      {
        name: 'keywords',
        content:
          'axon-lang, cognitive runtime, cognitive OS, LLM compiler, AI agent language, agent DSL, Rust AI runtime',
      },
      {name: 'author', content: AUTHOR_NAME},
    ],
    navbar: {
      title: 'AXON',
      logo: {
        alt: 'AXON',
        src: 'img/axon-mark.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docs',
          position: 'left',
          label: 'Docs',
        },
        {
          type: 'localeDropdown',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'light',
      links: [
        {
          title: 'AXON',
          items: [
            {label: 'What is AXON', to: '/'},
            {label: 'Quickstart', to: '/quickstart'},
            {label: 'Install', to: '/install'},
          ],
        },
        {
          title: 'Project',
          items: [
            {label: 'Editions', href: COMMERCIAL_URL},
          ],
        },
        {
          title: 'Author',
          items: [{label: AUTHOR_NAME, href: AUTHOR_URL}],
        },
      ],
      copyright: `AXON — by ${AUTHOR_NAME}. Apache 2.0.`,
    },
    ...(usarAlgolia
      ? {
          algolia: {
            appId: ALGOLIA_APP_ID!,
            apiKey: ALGOLIA_SEARCH_KEY!,
            indexName: ALGOLIA_INDEX!,
            // Faceta obligatoria (plan §9): sin esto, buscar desde /es/
            // devuelve resultados en inglés — el fallo clásico de i18n.
            contextualSearch: true,
            searchPagePath: 'search',
          },
        }
      : {}),

    prism: {
      // Un solo tema para los dos modos: sus colores son var(--syntax-*), que
      // ya cambian con el tema. Dos temas podrían desincronizarse; uno, no.
      theme: axonPrismTheme,
      darkTheme: axonPrismTheme,
      // La gramática de `axon` no se lista aquí: no viene con prismjs. Se
      // registra en src/theme/prism-include-languages.ts.
      additionalLanguages: ['bash', 'rust', 'toml'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
