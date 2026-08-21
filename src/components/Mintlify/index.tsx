import type {ReactNode} from 'react';
import Link from '@docusaurus/Link';

/**
 * Equivalentes de los componentes de Mintlify que usa el corpus migrado.
 *
 * Existen para que las 203 páginas se puedan mover **sin tocar su cuerpo**.
 * Reescribir 109.302 palabras para adaptarlas a otra sintaxis de componentes
 * sería la forma más segura de introducir erratas en una migración que, hecha
 * así, es puramente mecánica.
 *
 * No imitan a Mintlify: se ven como el resto del sitio. Lo que se conserva es
 * la API —el nombre y las props—, no la estética.
 *
 * La prop `icon` se acepta y se ignora a propósito: el corpus usa nombres de
 * Font Awesome, que no está en el sitio. Aceptarla evita tener que editar 7
 * páginas; ignorarla evita meter una dependencia por 7 iconos.
 */

type CalloutVariant = 'info' | 'note' | 'warning' | 'danger';

function Callout({
  variant,
  children,
}: {
  variant: CalloutVariant;
  children: ReactNode;
}): ReactNode {
  return (
    <aside className="ax-callout" data-variant={variant}>
      {children}
    </aside>
  );
}

export function Info({children}: {children: ReactNode}): ReactNode {
  return <Callout variant="info">{children}</Callout>;
}

export function Note({children}: {children: ReactNode}): ReactNode {
  return <Callout variant="note">{children}</Callout>;
}

export function Warning({children}: {children: ReactNode}): ReactNode {
  return <Callout variant="warning">{children}</Callout>;
}

export function Danger({children}: {children: ReactNode}): ReactNode {
  return <Callout variant="danger">{children}</Callout>;
}

export function Tip({children}: {children: ReactNode}): ReactNode {
  return <Callout variant="info">{children}</Callout>;
}

export function Check({children}: {children: ReactNode}): ReactNode {
  return <Callout variant="note">{children}</Callout>;
}

interface CardProps {
  title?: string;
  href?: string;
  /** Nombre de icono de Font Awesome. Se acepta y se ignora — ver arriba. */
  icon?: string;
  children?: ReactNode;
}

export function Card({title, href, children}: CardProps): ReactNode {
  const contenido = (
    <>
      {title && <h3 className="ax-card__title">{title}</h3>}
      <div className="ax-card__body">{children}</div>
    </>
  );

  if (href) {
    return (
      <Link className="ax-card ax-card--link" to={href}>
        {contenido}
      </Link>
    );
  }
  return <div className="ax-card">{contenido}</div>;
}

export function CardGroup({
  cols = 2,
  children,
}: {
  cols?: number;
  children: ReactNode;
}): ReactNode {
  return (
    <div className="ax-cardgroup" data-cols={cols}>
      {children}
    </div>
  );
}

export function Steps({children}: {children: ReactNode}): ReactNode {
  return <ol className="ax-steps">{children}</ol>;
}

export function Step({
  title,
  children,
}: {
  title?: string;
  children: ReactNode;
}): ReactNode {
  return (
    <li className="ax-step">
      {title && <h3 className="ax-step__title">{title}</h3>}
      <div className="ax-step__body">{children}</div>
    </li>
  );
}
