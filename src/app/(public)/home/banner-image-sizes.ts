/**
 * All three banner layouts (mobile slider, tablet, desktop grid) are mounted at
 * once and switched with CSS. If each declared its own `sizes`, the same photo
 * resolved to a different `/_next/image?w=…` URL per layout and the browser
 * downloaded it two or three times over.
 *
 * Sharing one responsive `sizes` per role means every layout resolves to the
 * SAME url at any given viewport, so the browser makes a single request.
 * Breakpoints mirror the Tailwind `md` (768px) and `lg` (1024px) switches used
 * in `banner.tsx`.
 */
export const BANNER_FEATURED_SIZES =
  '(max-width: 767px) 100vw, (max-width: 1023px) 60vw, 50vw'

export const BANNER_TILE_SIZES =
  '(max-width: 767px) 42vw, (max-width: 1023px) 40vw, 25vw'
