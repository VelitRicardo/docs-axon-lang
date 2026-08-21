import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

import {
  REPO_URL,
  REPO_BRANCH,
  AUTHOR_URL,
  AUTHOR_NAME,
  COMMERCIAL_URL,
} from './src/config/links';

// Esto corre en Node.js — nada de APIs de navegador ni JSX aquí.

const BASE_URL = '/axon-docs/';

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
          editUrl: `${REPO_URL}/tree/${REPO_BRANCH}/`,
          // Requiere historial git: se activa cuando el repo exista.
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
        {
          href: REPO_URL,
          label: 'GitHub',
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
            {label: 'Install', to: '/getting-started/install'},
          ],
        },
        {
          title: 'Project',
          items: [
            {label: 'GitHub', href: REPO_URL},
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
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
