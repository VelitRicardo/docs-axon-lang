/**
 * Gramática Prism del lenguaje AXON — GENERADO por scripts/sync-grammar.py.
 *
 * Fuente: axon-frontend/src/tokens.rs de VelitRicardo/axon-lang.
 * Extraídas 62 declaraciones y 115 palabras clave.
 *
 * No editar a mano: se regenera. Si el lenguaje añade una palabra clave,
 * se vuelve a ejecutar el script y aparece pintada.
 */

import type * as PrismNamespace from 'prismjs';

const DECLARATIONS = /\b(?:observable|axonstore|component|dataspace|extension|reconcile|discover|document|ensemble|manifest|resource|topology|upstream|axpoint|channel|compute|context|deliver|mandate|observe|persona|publish|receive|session|witness|anchor|corpus|daemon|effect|fabric|immune|import|intent|lambda|ledger|memory|psyche|reflex|savant|shield|socket|agent|cache|lease|probe|scope|synth|voice|weave|cors|emit|flow|heal|loop|send|tool|type|view|end|mcp|pix|run)\b/;

const KEYWORDS = /\b(?:linear_constraints|budget_per_event|homotopy_search|constrained_by|temporal_frame|loss_function|on_violation|consolidate|corroborate|edge_filter|on_complete|constraint|credential|deliberate|derivation|dimensions|on_failure|provenance|quarantine|aggregate|associate|certainty|consensus|hibernate|inference|max_steps|on_breach|output_to|speculate|teleology|tolerance|continue|manifold|navigate|on_chunk|on_stuck|ontology|remember|retrieve|severity|strategy|transact|validate|against|believe|effects|explore|forward|network|perform|persist|quantum|sandbox|budget|effort|handle|ingest|listen|mutate|notify|output|reason|recall|redact|refine|resume|return|rotate|schema|stream|warden|window|within|abort|about|allow|break|doubt|drill|focus|forge|given|purge|quant|taint|tools|trail|where|yield|deny|else|from|goal|grad|into|know|mint|pure|scan|step|and|ask|for|let|not|ots|par|use|as|if|in|kd|ki|kp|or)\b/;

export default function axon(PrismObject: typeof PrismNamespace): void {
  PrismObject.languages.axon = {
    // Los seis tipos de comentario del lenguaje. Los de documentación van
    // antes que los normales: `///` tiene que ganar a `//`.
    'doc-comment': {
      pattern: /\/\/[!/].*|\/\*[!*][\s\S]*?\*\//,
      greedy: true,
      alias: 'comment',
    },
    comment: {
      pattern: /\/\/.*|\/\*[\s\S]*?\*\//,
      greedy: true,
    },
    string: {
      pattern: /"(?:\\.|[^"\\])*"/,
      greedy: true,
    },
    // Literal de duración: 5s, 250ms, 2h. Va antes que `number`.
    duration: {
      pattern: /\b\d+(?:\.\d+)?(?:ms|[smhd])\b/,
      alias: 'number',
    },
    // Rango de refinamiento: `type Confidence(0.0..1.0)`.
    range: {
      pattern: /\b\d+(?:\.\d+)?\.\.\d+(?:\.\d+)?\b/,
      alias: 'number',
    },
    boolean: /\b(?:true|false)\b/,
    // Sin alias `keyword` a propósito: prism-react-renderer fusiona los
    // estilos recorriendo token.types en orden, y el último gana. Con el
    // alias, las declaraciones se pintarían con el color de las palabras
    // clave y perderían su jerarquía visual.
    declaration: DECLARATIONS,
    keyword: KEYWORDS,
    // Nombre de un atributo dentro de un bloque: `tone:`, `max_tokens:`.
    attribute: {
      pattern: /\b[a-z_][a-z0-9_]*(?=\s*:)/,
      alias: 'attr-name',
    },
    // Los tipos se reconocen por forma, no por lista: cualquier identificador
    // en PascalCase. Enumerarlos ataría la gramática a una versión concreta
    // del compilador y dejaría sin pintar los tipos del propio usuario.
    'class-name': /\b[A-Z][A-Za-z0-9_]*\b/,
    function: /\b[a-z_][a-z0-9_]*(?=\s*\()/,
    number: /\b\d+(?:\.\d+)?\b/,
    operator: /->|\.\.|[<>=!]=|[-+*/%<>=@?]/,
    punctuation: /[{}[\]();:,.]/,
  };
}
