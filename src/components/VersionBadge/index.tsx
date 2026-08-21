import type {ReactNode} from 'react';
import {AXON_VERSION} from '@site/src/config/links';

/**
 * La versión contra la que está escrita la doc.
 *
 * Sale de `src/config/links.ts`, nunca escrita a mano en una página: cuando
 * suba la versión del lenguaje se cambia en un sitio y la doc deja de mentir.
 */
export default function VersionBadge({
  prefix = 'axon-lang',
}: {
  prefix?: string;
}): ReactNode {
  return (
    <span className="ax-version">
      {prefix} <strong>v{AXON_VERSION}</strong>
    </span>
  );
}
