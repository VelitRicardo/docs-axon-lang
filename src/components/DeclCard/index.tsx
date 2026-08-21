import type {ReactNode} from 'react';

interface DeclCardProps {
  /** La palabra clave, tal cual se escribe en el fuente: `persona`, `flow`… */
  keyword: string;
  /** Firma de una línea. Ej.: `persona <Nombre> { … }`. */
  signature?: string;
  /** Qué declara, en una frase. */
  summary: string;
  /** Versión del lenguaje en la que existe, si no es obvio. */
  since?: string;
  children?: ReactNode;
}

/**
 * Ficha de una declaración del lenguaje (plan §7).
 *
 * Es la unidad de la referencia: la misma forma para las once declaraciones,
 * para que quien aprende una sepa leer las diez restantes.
 */
export default function DeclCard({
  keyword,
  signature,
  summary,
  since,
  children,
}: DeclCardProps): ReactNode {
  return (
    <section className="ax-decl">
      <header className="ax-decl__head">
        <code className="ax-decl__keyword">{keyword}</code>
        {since && <span className="ax-decl__since">desde v{since}</span>}
      </header>
      {signature && <p className="ax-decl__signature">{signature}</p>}
      <p className="ax-decl__summary">{summary}</p>
      {children && <div className="ax-decl__body">{children}</div>}
    </section>
  );
}
