import { daysAgo } from '$lib/admin/shared/mock-dates';
import type { Availability, Photo, Visibility } from './types';

type Entry = {
	file: string;
	width: number;
	height: number;
	title: string;
	category: string;
	tags: string[];
	location: string;
	visibility: Visibility;
	availability: Availability;
	price?: number;
	photographer: string;
	takenDaysAgo: number;
	description?: string;
};

// The site's own photographs (static/galeria), catalogued as Nº 401–416.
const catalog: Entry[] = [
	{ file: '/galeria/IMG_3405.webp', width: 682, height: 1024, title: 'Bell tower', category: 'Urban', tags: ['architecture', 'palms'], location: 'Lisbon / Portugal', visibility: 'PUBLIC', availability: 'AVAILABLE', price: 9000, photographer: 'usr_marta', takenDaysAgo: 210 },
	{ file: '/galeria/IMG_4471.webp', width: 1536, height: 1024, title: 'Rear haunch', category: 'Automotive', tags: ['detail', 'white'], location: 'Cascais / Portugal', visibility: 'PUBLIC', availability: 'NOT_FOR_SALE', photographer: 'usr_rui', takenDaysAgo: 160, description: 'Commissioned. The client holds the commercial licence.' },
	{ file: '/galeria/IMG_4474.webp', width: 1536, height: 1024, title: 'Crossing', category: 'Street', tags: ['black and white', 'motorcycle'], location: 'Lisbon / Portugal', visibility: 'PUBLIC', availability: 'AVAILABLE', price: 12000, photographer: 'usr_marta', takenDaysAgo: 150 },
	{ file: '/galeria/IMG_4482.webp', width: 1536, height: 864, title: 'Last carriage', category: 'Street', tags: ['tram', 'people', 'night'], location: 'Zürich / Switzerland', visibility: 'PUBLIC', availability: 'AVAILABLE', price: 12000, photographer: 'usr_marta', takenDaysAgo: 140 },
	{ file: '/galeria/IMG_4486.webp', width: 1536, height: 1024, title: 'Buskers', category: 'Street', tags: ['black and white', 'people', 'music'], location: 'Lisbon / Portugal', visibility: 'PUBLIC', availability: 'NOT_FOR_SALE', photographer: 'usr_marta', takenDaysAgo: 138, description: 'Identifiable people. Not for sale until consent is recorded.' },
	{ file: '/galeria/IMG_4487.jpg', width: 2160, height: 3240, title: 'Platform', category: 'Urban', tags: ['metro', 'lines'], location: 'Lisbon / Portugal', visibility: 'PUBLIC', availability: 'AVAILABLE', price: 9000, photographer: 'usr_marta', takenDaysAgo: 130 },
	{ file: '/galeria/_MG_0665.jpg', width: 4272, height: 2848, title: 'Dining room', category: 'Interiors', tags: ['warm', 'window'], location: 'Porto / Portugal', visibility: 'UNLISTED', availability: 'AVAILABLE', price: 7500, photographer: 'usr_ines', takenDaysAgo: 120 },
	{ file: '/galeria/_MG_0670.jpg', width: 4272, height: 2848, title: 'Avenue', category: 'Street', tags: ['black and white', 'trees'], location: 'Lisbon / Portugal', visibility: 'PUBLIC', availability: 'AVAILABLE', price: 9000, photographer: 'usr_marta', takenDaysAgo: 118 },
	{ file: '/galeria/_MG_0686.jpg', width: 4272, height: 2403, title: 'Terrace', category: 'Urban', tags: ['summer', 'green'], location: 'Lisbon / Portugal', visibility: 'PUBLIC', availability: 'AVAILABLE', price: 7500, photographer: 'usr_ines', takenDaysAgo: 96 },
	{ file: '/galeria/_MG_0747.jpg', width: 3329, height: 2219, title: 'Tramline', category: 'Urban', tags: ['tram', 'facades'], location: 'Zürich / Switzerland', visibility: 'PUBLIC', availability: 'AVAILABLE', price: 9000, photographer: 'usr_marta', takenDaysAgo: 90 },
	{ file: '/galeria/_MG_1090.jpg', width: 3454, height: 2303, title: 'Window seat', category: 'Street', tags: ['black and white', 'café'], location: 'Lisbon / Portugal', visibility: 'PUBLIC', availability: 'SOLD_OUT', price: 15000, photographer: 'usr_marta', takenDaysAgo: 80, description: 'Edition of 10, sold out.' },
	{ file: '/galeria/_MG_1245.jpg', width: 3513, height: 2382, title: 'Yellow', category: 'Automotive', tags: ['classic', 'street'], location: 'Zürich / Switzerland', visibility: 'PUBLIC', availability: 'AVAILABLE', price: 18000, photographer: 'usr_rui', takenDaysAgo: 75 },
	{ file: '/galeria/_MG_1131.jpg', width: 4272, height: 2848, title: 'Golden', category: 'Portrait', tags: ['dog', 'warm'], location: 'Lisbon / Portugal', visibility: 'PRIVATE', availability: 'NOT_FOR_SALE', photographer: 'usr_ines', takenDaysAgo: 60 },
	{ file: '/galeria/_MG_1155.jpg', width: 4239, height: 2826, title: 'Arcade', category: 'Urban', tags: ['black and white', 'arches'], location: 'Lisbon / Portugal', visibility: 'PUBLIC', availability: 'AVAILABLE', price: 12000, photographer: 'usr_marta', takenDaysAgo: 45 },
	{ file: '/galeria/_MG_1232.jpg', width: 2848, height: 4272, title: 'Drift', category: 'Landscape', tags: ['water', 'duck'], location: 'Zürich / Switzerland', visibility: 'PUBLIC', availability: 'AVAILABLE', price: 9000, photographer: 'usr_marta', takenDaysAgo: 30 },
	{ file: '/images/hero.jpg', width: 3531, height: 1513, title: 'Night line', category: 'Street', tags: ['tram', 'night', 'black and white'], location: 'Zürich / Switzerland', visibility: 'PUBLIC', availability: 'AVAILABLE', price: 15000, photographer: 'usr_marta', takenDaysAgo: 20 }
];

const FIRST_NUMBER = 401;

export const seedPhotos: Photo[] = catalog.map((entry, index) => {
	const number = FIRST_NUMBER + index;
	const key = `originals/${number}-${entry.file.split('/').pop()}`;
	return {
		id: `ph_${number}`,
		number,
		title: entry.title,
		description: entry.description ?? null,
		originalKey: key,
		displayKey: key.replace('originals/', 'display/'),
		thumbnailKey: key.replace('originals/', 'thumbnails/'),
		width: entry.width,
		height: entry.height,
		takenAt: daysAgo(entry.takenDaysAgo, 17),
		location: entry.location,
		category: entry.category,
		tags: entry.tags,
		visibility: entry.visibility,
		availability: entry.availability,
		priceCents: entry.price ?? null,
		currency: 'EUR',
		watermarked: entry.visibility === 'PUBLIC',
		photographerId: entry.photographer,
		createdAt: daysAgo(entry.takenDaysAgo - 2, 11),
		updatedAt: daysAgo(Math.max(1, entry.takenDaysAgo - 10), 11),
		// Mock: every rendition points at the static file.
		urls: { display: entry.file, thumbnail: entry.file, original: entry.file }
	};
});
