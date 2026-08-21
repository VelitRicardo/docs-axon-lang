import type {ReactNode} from 'react';

interface MastheadProps {
  /** Cintillo superior, en versalitas. Ej.: "Edición especial". */
  kicker?: string;
  /** El titular. Va en la serif de display, a tamaño de portada. */
  title: string;
  /** Bajada, en cursiva. Una frase, no un párrafo. */
  standfirst?: string;
  /** Datos al margen: versión, licencia, fecha. */
  meta?: ReactNode;
  children?: ReactNode;
}

/**
 * Cabecera de portada (plan §6.4).
 *
 * Cita la referencia impresa: cintillo, filete, titular a toda caja y la regla
 * de acento debajo. No lleva imagen ni gradiente — la jerarquía la hace la
 * tipografía.
 */
export default function Masthead({
  kicker,
  title,
  standfirst,
  meta,
  children,
}: MastheadProps): ReactNode {
  return (
    <header className="ax-masthead">
      {kicker && <p className="ax-masthead__kicker">{kicker}</p>}
      <h1 className="ax-masthead__title">{title}</h1>
      {standfirst && <p className="ax-masthead__standfirst">{standfirst}</p>}
      {meta && <p className="ax-masthead__meta">{meta}</p>}
      {children}
    </header>
  );
}
