import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Synthmark',
    short_name: 'Synthmark',
    description: 'AI data annotation platform for ML teams',
    start_url: '/',
    display: 'standalone',
    background_color: '#0a0a0a',
    theme_color: '#4f8ef7',
    icons: [
      { src: '/logo.png', sizes: 'any', type: 'image/png' },
    ],
    categories: ['productivity', 'developer'],
  };
}
