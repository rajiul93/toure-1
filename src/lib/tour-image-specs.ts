/** Display specs for tour-config image uploads (home banner + OG). */

export const TOUR_OG_IMAGE_SPEC = {
  ratioLabel: '1.91:1',
  width: 1200,
  height: 630,
  hint: '1200×630 px (1.91:1). Used in Google, Facebook, and link previews.',
} as const

export const TOUR_BANNER_FEATURED_SPEC = {
  ratioLabel: '4:3',
  width: 1600,
  height: 1200,
  hint: '1600×1200 px (4:3 landscape). Large hero photo — keep the main subject centered; edges may crop on desktop.',
} as const

export const TOUR_BANNER_TILE_SPEC = {
  ratioLabel: '4:3',
  width: 1200,
  height: 900,
  hint: '1200×900 px (4:3 landscape). Smaller gallery tiles — center important details.',
} as const

export const TOUR_BANNER_GALLERY_DESCRIPTION =
  'Five photos on the home page banner. Image 1 is the large featured photo; images 2–5 are smaller tiles. All use landscape 4:3 and object-cover, so slightly different crops appear on mobile, tablet, and desktop — keep subjects centered.'
