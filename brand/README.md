# Fuentes de marca

El sistema visual es el **Brand book de AXON v1.0** (septiembre 2026): hueso y
tinta, terracota como único acento, Newsreader + IBM Plex Sans + IBM Plex Mono.
Vive en `src/css/tokens.css`; esta carpeta solo guarda los originales.

- `axon-icon-source.webp` — el isotipo (render 3D, 1080², fondo transparente).
  Es la fuente de **todo** lo que lleva la marca en el sitio: el isotipo del
  navbar (`axon-mark.svg`, `axon-mark-dark.svg`), los favicons, `icon-512.png`
  y las imágenes OG. Se generan con `python scripts/build-brand-assets.py`, que
  vectoriza la silueta a color plano (el brand book no admite degradados ni
  sombras).
- `axon-mark-source.svg` — la marca anterior (cuatro cuñas en X), retirada con
  el brand book. Se conserva solo como archivo histórico.

Esta carpeta **no se publica**: nada aquí llega al build.
