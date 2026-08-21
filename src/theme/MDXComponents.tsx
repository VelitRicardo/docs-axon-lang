import MDXComponents from '@theme-original/MDXComponents';
import Masthead from '@site/src/components/Masthead';
import {Ledger, LedgerItem} from '@site/src/components/Ledger';
import DeclCard from '@site/src/components/DeclCard';
import CliBlock from '@site/src/components/CliBlock';
import VersionBadge from '@site/src/components/VersionBadge';

/**
 * Componentes disponibles en todo el MDX sin importarlos.
 *
 * Es un envoltorio de `@theme-original/MDXComponents`, no un eject: sobrevive
 * a las actualizaciones de Docusaurus (plan §13).
 *
 * Que estén globales importa para F5: quien traduce una página al español no
 * debería tener que replicar una lista de imports.
 */
export default {
  ...MDXComponents,
  Masthead,
  Ledger,
  LedgerItem,
  DeclCard,
  CliBlock,
  VersionBadge,
};
