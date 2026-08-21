import type {ReactNode} from 'react';

interface CliBlockProps {
  /** El comando, sin el prompt: se dibuja aparte para que se pueda copiar. */
  command: string;
  /** Salida esperada, si aporta. */
  output?: string;
  /** Etiqueta del cintillo. Por defecto, el shell. */
  label?: string;
}

/**
 * Comando y su salida, con cabecera de cintillo (plan §6.4).
 *
 * El prompt va fuera del texto seleccionable para que copiar el comando no
 * arrastre el `$`.
 */
export default function CliBlock({
  command,
  output,
  label = 'shell',
}: CliBlockProps): ReactNode {
  return (
    <div className="ax-cli">
      <p className="ax-cli__label">{label}</p>
      <pre className="ax-cli__body">
        <code>
          <span className="ax-cli__prompt" aria-hidden="true">
            ${' '}
          </span>
          <span className="ax-cli__command">{command}</span>
          {output && <span className="ax-cli__output">{'\n' + output}</span>}
        </code>
      </pre>
    </div>
  );
}
