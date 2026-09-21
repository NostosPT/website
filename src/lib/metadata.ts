export const metadata = {
	title: 'Nostos — Fotografia Editorial em Lisboa',
	description:
		'Nostos é um espaço de fotografia entre a memória e o presente. Fotografia editorial, casamentos, eventos e histórias documentadas em Lisboa.',
	keywords: [
		'Nostos',
		'fotografia',
		'fotografia editorial',
		'fotógrafo Lisboa',
		'fotografia Lisboa',
		'fotografia de casamento',
		'fotografia de eventos'
	],
	authors: [{ name: 'Nostos' }],
	creator: 'Nostos',
	metadataBase: new URL('https://nostos.studio'),
	alternates: {
		canonical: '/'
	},
	openGraph: {
		title: 'Nostos — Fotografia Editorial em Lisboa',
		description: 'Fotografia entre a memória e o presente. Histórias, pessoas e lugares documentados em Lisboa.',
		url: 'https://nostos.studio/',
		siteName: 'Nostos',
		locale: 'pt_PT',
		type: 'website',
		images: [
			{
				url: '/og.jpg',
				width: 1200,
				height: 630,
				alt: 'Nostos — Fotografia Editorial'
			}
		]
	},
	twitter: {
		card: 'summary_large_image',
		title: 'Nostos — Fotografia Editorial em Lisboa',
		description: 'Fotografia entre a memória e o presente. Histórias, pessoas e lugares documentados em Lisboa.',
		images: ['/og.jpg']
	}
};
