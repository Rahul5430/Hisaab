import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
	return {
		name: 'Hisaab',
		short_name: 'Hisaab',
		description: 'Family expense and investment tracker',
		start_url: '/',
		display: 'standalone',
		background_color: 'black',
		theme_color: 'hsl(239, 68%, 58%)',
		orientation: 'portrait',
		icons: [
			{
				src: '/icons/icon-192.png',
				sizes: '192x192',
				type: 'image/png',
			},
			{
				src: '/icons/icon-512.png',
				sizes: '512x512',
				type: 'image/png',
			},
			{
				src: '/icons/icon-512.png',
				sizes: '512x512',
				type: 'image/png',
				purpose: 'maskable',
			},
		],
	};
}
