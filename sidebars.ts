import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

/**
 * Sidebar manual, no autogenerada.
 *
 * La arquitectura de información es una decisión editorial (plan §5): el orden
 * enseña el modelo mental del lenguaje. Autogenerar por carpeta delegaría esa
 * decisión al sistema de archivos.
 */
const sidebars: SidebarsConfig = {
  docs: [
    'index',
    {
      type: 'category',
      label: 'Getting started',
      collapsed: false,
      items: ['getting-started/what-is-axon', 'getting-started/install'],
    },
    {
      type: 'category',
      label: 'Language',
      items: ['language/overview'],
    },
    {
      type: 'category',
      label: 'Runtime & CSYS',
      items: ['runtime/overview'],
    },
    {
      type: 'category',
      label: 'Tooling',
      items: ['tooling/cli'],
    },
    {
      type: 'category',
      label: 'Editions & frontier',
      items: ['editions/frontier'],
    },
  ],
};

export default sidebars;
