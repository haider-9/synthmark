import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Synthmark',
    short_name: 'Synthmark',
    description: 'AI data annotation platform for ML teams',
    start_url: '/',
    display: 'standalone',
    background_color: 'oklch(0.2166 0.0215 292.8474)',
    theme_color: 'oklch(0.6104 0.0767 299.7335)',
    icons: [
      { src: '/logo.png', sizes: 'any', type: 'image/png' },
    ],
    categories: ['productivity', 'developer'],
  };
}
