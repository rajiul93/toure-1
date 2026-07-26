export const BANNER_PHOTOS = [
  {
    src: '/images/banner/0.webp',
    alt: 'Louvre Pyramid',
    label: 'Louvre Pyramid',
    featured: true,
  },
  {
    src: '/images/banner/1.jpeg',
    alt: 'Grande Galerie',
    label: 'Grande Galerie',
    featured: false,
  },
  {
    src: '/images/banner/2.jpeg',
    alt: 'Denon Wing',
    label: 'Denon Wing',
    featured: false,
  },
  {
    src: '/images/banner/3.jpeg',
    alt: 'Audio Guide',
    label: 'Audio Guide',
    featured: false,
  },
  {
    src: '/images/banner/4.jpeg',
    alt: 'Night Entry',
    label: 'Night Entry',
    featured: false,
  },
] as const;

export type BannerPhoto = (typeof BANNER_PHOTOS)[number];
