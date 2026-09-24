/**
 * Emite `llms.txt` y `llms-full.txt` en la raíz de cada locale del build.
 *
 * QUÉ SON. `llms.txt` (llmstxt.org) es un índice en Markdown pensado para que
 * un modelo —un asistente con navegación, un agente, un motor generativo—
 * entienda el sitio sin parsear HTML: qué es el proyecto en un párrafo y la
 * lista de páginas con una línea cada una. `llms-full.txt` es el corpus entero
 * en un solo archivo, para quien prefiera leerlo todo de una vez.
 *
 * DE DÓNDE SALE. Del mismo sidebar que ve el lector y de los `.mdx` fuente, no
 * del HTML: el orden y los grupos son la arquitectura de información que el
 * autor ya decidió (ver sidebars.ts), y el Markdown fuente es más limpio para
 * un modelo que cualquier cosa extraída del DOM. En /es/, cada página usa su
 * traducción si existe y el original inglés si no — igual que el sitio.
 *
 * DÓNDE QUEDA. `/axon-docs/llms.txt` y `/axon-docs/es/llms.txt`. La convención
 * pide `/llms.txt` en la raíz del host, que pertenece al sitio del autor: allí
 * hace falta un enlace o una redirección hacia este. Este plugin no puede
 * escribirlo.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import type {LoadContext, Plugin} from '@docusaurus/types';

import sidebars from '../../sidebars';
import {AUTHOR_NAME, AXON_VERSION, DOC_LICENSE_URL} from '../config/links';

type Item = string | {type: string; id?: string; label?: string; items?: Item[]};
type Section = {label: string; ids: string[]};
type Page = {id: string; title: string; description: string; url: string; body: string};

const INTRO: Record<string, {summary: string; details: string}> = {
  en: {
    summary:
      'AXON (axon-lang) is a compiled programming language whose target is a large language model, not a CPU. ' +
      'The compiler type-checks a program, lowers it to an IR, and a native Rust runtime executes it against an LLM backend. ' +
      'A program that sends regulated data across an unguarded boundary does not compile.',
    details:
      `- Documented version: ${AXON_VERSION}\n` +
      `- Author: ${AUTHOR_NAME}\n` +
      `- Documentation license: CC BY 4.0 (${DOC_LICENSE_URL})\n` +
      '- Core ideas: compile-time compliance (regulatory classes are types; shield coverage is checked at every boundary) ' +
      'and epistemic types (a model output carries how much the system may believe it: doubt < speculate < believe < know).',
  },
  es: {
    summary:
      'AXON (axon-lang) es un lenguaje de programación compilado cuyo destino es un modelo de lenguaje, no una CPU. ' +
      'El compilador verifica los tipos del programa, lo baja a una IR y un runtime nativo en Rust lo ejecuta contra un backend LLM. ' +
      'Un programa que envía datos regulados a través de una frontera sin guardia no compila.',
    details:
      `- Versión documentada: ${AXON_VERSION}\n` +
      `- Autor: ${AUTHOR_NAME}\n` +
      `- Licencia de la documentación: CC BY 4.0 (${DOC_LICENSE_URL})\n` +
      '- Ideas centrales: cumplimiento en compilación (las clases regulatorias son tipos; la cobertura de shield se verifica en cada frontera) ' +
      'y tipos epistémicos (la salida de un modelo lleva cuánto puede creerla el sistema: doubt < speculate < believe < know).',
  },
};

/** Una línea por página basta en el índice: la descripción entera si cabe, si no su primera frase. */
function firstSentence(text: string, max = 220): string {
  if (text.length <= max) return text;
  const cut = text.match(/^(.+?[.!?])(\s|$)/)?.[1] ?? text;
  return cut.length > max ? `${cut.slice(0, max - 1).trimEnd()}…` : cut;
}

function parse(source: string): {title: string; description: string; body: string} {
  const fm = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  const field = (name: string) => {
    const raw = fm?.[1].match(new RegExp(`^${name}:\\s*(.+)$`, 'm'))?.[1].trim() ?? '';
    return raw.replace(/^(["'])([\s\S]*)\1$/, '$2').replace(/\\"/g, '"');
  };
  const body = (fm ? source.slice(fm[0].length) : source)
    // Los `import` de MDX no dicen nada a un lector; los componentes sí se quedan.
    .replace(/^import .+$/gm, '')
    .trim();
  return {title: field('title'), description: field('description'), body};
}

function sections(items: Item[], label = ''): Section[] {
  const out: Section[] = [];
  const loose: string[] = [];
  for (const item of items) {
    if (typeof item === 'string') loose.push(item);
    else if (item.type === 'doc' && item.id) loose.push(item.id);
    else if (item.type === 'category' && item.items) out.push(...sections(item.items, item.label ?? label));
  }
  return loose.length ? [{label, ids: loose}, ...out] : out;
}

async function readFirst(files: string[]): Promise<string> {
  for (const file of files) {
    try {
      return await fs.readFile(file, 'utf8');
    } catch {
      /* siguiente candidato */
    }
  }
  throw new Error(`llms-txt: no existe ninguno de ${files.join(', ')}`);
}

export default function llmsTxt(context: LoadContext): Plugin {
  const {siteDir, siteConfig, i18n, baseUrl} = context;
  const locale = i18n.currentLocale;
  const localized = path.join(siteDir, 'i18n', locale, 'docusaurus-plugin-content-docs', 'current');

  return {
    name: 'llms-txt',

    async postBuild({outDir}) {
      const labels: Record<string, {message: string}> =
        locale === i18n.defaultLocale
          ? {}
          : JSON.parse(await fs.readFile(`${localized}.json`, 'utf8'));
      const label = (l: string) => labels[`sidebar.docs.category.${l}`]?.message ?? l;

      /* `context.baseUrl` es el del locale (`/axon-docs/es/`), no el del
         config: con él las URLs de /es/ salen solas. */
      const base = siteConfig.url + baseUrl;

      const groups = await Promise.all(
        sections(sidebars.docs as Item[]).map(async ({label: l, ids}) => ({
          label: label(l),
          pages: await Promise.all(
            ids.map(async (id): Promise<Page> => {
              const candidates = ['.mdx', '.md'].flatMap((ext) => [
                ...(locale === i18n.defaultLocale ? [] : [path.join(localized, id + ext)]),
                path.join(siteDir, 'docs', id + ext),
              ]);
              const {title, description, body} = parse(await readFirst(candidates));
              const url = id === 'index' ? base.replace(/\/+$/, '') : base + id;
              return {id, title, description, url, body};
            }),
          ),
        })),
      );

      const intro = INTRO[locale] ?? INTRO.en;
      const header = `# AXON\n\n> ${intro.summary}\n\n${intro.details}\n`;

      const index = groups
        .map(
          ({label: l, pages}) =>
            `## ${l}\n\n` +
            pages
              .map((p) => `- [${p.title}](${p.url})${p.description ? `: ${firstSentence(p.description)}` : ''}`)
              .join('\n'),
        )
        .join('\n\n');

      const full = groups
        .flatMap(({pages}) => pages)
        .map((p) => `# ${p.title}\n\nSource: ${p.url}\n\n${p.body}\n`)
        .join('\n---\n\n');

      await fs.writeFile(path.join(outDir, 'llms.txt'), `${header}\n${index}\n`, 'utf8');
      await fs.writeFile(path.join(outDir, 'llms-full.txt'), `${header}\n---\n\n${full}`, 'utf8');
    },
  };
}
