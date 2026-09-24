import type {ReactNode} from 'react';
import Translate, {translate} from '@docusaurus/Translate';
import {SALES_WHATSAPP_URL} from '@site/src/config/links';

/**
 * Sustituye al `cargo install axon-lang` de la doc: el compilador ya no se
 * distribuye en abierto, así que el paso "instalar" pasa por hablar con ventas.
 *
 * Abre WhatsApp con un mensaje precargado en el idioma de la página, para que
 * quien escribe no empiece desde un chat en blanco.
 */
export default function ContactSales(): ReactNode {
  const text = translate({
    id: 'contactSales.prefill',
    message: 'Hi, I would like to get AXON.',
    description: 'Mensaje precargado en WhatsApp al pulsar Contact Sales',
  });
  return (
    <p className="ax-cta">
      <a
        className="ax-cta__button"
        href={`${SALES_WHATSAPP_URL}?text=${encodeURIComponent(text)}`}
        target="_blank"
        rel="noopener noreferrer">
        <Translate id="contactSales.label" description="Botón que abre WhatsApp con ventas">
          Contact Sales
        </Translate>
      </a>
      <span className="ax-cta__note">
        <Translate id="contactSales.note" description="Nota junto al botón Contact Sales">
          Opens a WhatsApp chat with sales.
        </Translate>
      </span>
    </p>
  );
}
