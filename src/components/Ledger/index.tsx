import type {ReactNode} from 'react';

interface LedgerProps {
  /** Columnas en pantalla ancha. Por encima de 3 la retícula se vuelve ruido. */
  columns?: 2 | 3;
  children: ReactNode;
}

/**
 * Retícula de cajas con filete (plan §6.4).
 *
 * Las cajas se separan por líneas, no por sombras ni por relleno de color: es
 * la estructura de una página impresa, no un panel de tarjetas.
 */
export function Ledger({columns = 3, children}: LedgerProps): ReactNode {
  return (
    <div className="ax-ledger" data-columns={columns}>
      {children}
    </div>
  );
}

interface LedgerItemProps {
  title: string;
  /** Número o etiqueta corta al margen, tipo "01" o "Apache 2.0". */
  index?: string;
  children: ReactNode;
}

export function LedgerItem({
  title,
  index,
  children,
}: LedgerItemProps): ReactNode {
  return (
    <section className="ax-ledger__item">
      {index && <p className="ax-ledger__index">{index}</p>}
      <h3 className="ax-ledger__title">{title}</h3>
      <div className="ax-ledger__body">{children}</div>
    </section>
  );
}

export default Ledger;
