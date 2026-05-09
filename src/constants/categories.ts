export const CATEGORIES = {
	food_dining: {
		label: 'Food & Dining',
		icon: 'utensils',
		subcategories: {
			groceries: { label: 'Groceries', icon: 'shopping-basket' },
			eating_out: { label: 'Eating Out', icon: 'fork-knife' },
			food_delivery: { label: 'Food Delivery', icon: 'bike' },
			coffee_snacks: { label: 'Coffee & Snacks', icon: 'coffee' },
			alcohol: { label: 'Alcohol & Nightlife', icon: 'wine' },
		},
	},
	transport: {
		label: 'Transport',
		icon: 'car',
		subcategories: {
			cab_auto: { label: 'Cab & Auto', icon: 'car-taxi-front' },
			metro_bus: { label: 'Metro & Bus', icon: 'bus' },
			fuel: { label: 'Fuel', icon: 'fuel' },
			parking: { label: 'Parking', icon: 'square-parking' },
			flight_train: { label: 'Flight & Train', icon: 'plane' },
			vehicle_maintenance: {
				label: 'Vehicle Maintenance',
				icon: 'wrench',
			},
		},
	},
	shopping: {
		label: 'Shopping',
		icon: 'shopping-bag',
		subcategories: {
			clothing: { label: 'Clothing & Accessories', icon: 'shirt' },
			electronics: { label: 'Electronics & Gadgets', icon: 'smartphone' },
			home_kitchen: { label: 'Home & Kitchen', icon: 'home' },
			personal_care: {
				label: 'Personal Care & Beauty',
				icon: 'sparkles',
			},
			books_stationery: { label: 'Books & Stationery', icon: 'book' },
		},
	},
	bills_utilities: {
		label: 'Bills & Utilities',
		icon: 'zap',
		subcategories: {
			rent: { label: 'Rent', icon: 'building' },
			electricity: { label: 'Electricity', icon: 'zap' },
			water: { label: 'Water', icon: 'droplets' },
			internet_phone: { label: 'Internet & Phone', icon: 'wifi' },
			gas_lpg: { label: 'Gas / LPG', icon: 'flame' },
		},
	},
	subscriptions: {
		label: 'Subscriptions & Autopay',
		icon: 'repeat',
		subcategories: {
			streaming_video: { label: 'Streaming Video', icon: 'tv' },
			music: { label: 'Music', icon: 'music' },
			cloud_storage: { label: 'Cloud Storage', icon: 'cloud' },
			software_tools: { label: 'Software & Tools', icon: 'layout-grid' },
			gaming_subscription: {
				label: 'Gaming Subscriptions',
				icon: 'gamepad-2',
			},
			news_reading: { label: 'News & Reading', icon: 'newspaper' },
			health_fitness_apps: {
				label: 'Health & Fitness Apps',
				icon: 'heart-pulse',
			},
			other_subscriptions: {
				label: 'Other Subscriptions',
				icon: 'repeat',
			},
		},
	},
	health: {
		label: 'Health',
		icon: 'heart-pulse',
		subcategories: {
			doctor: { label: 'Doctor & Consultation', icon: 'stethoscope' },
			medicines: { label: 'Medicines & Pharmacy', icon: 'pill' },
			gym_fitness: { label: 'Gym & Fitness', icon: 'dumbbell' },
			mental_health: { label: 'Mental Health & Wellness', icon: 'brain' },
		},
	},
	education: {
		label: 'Education',
		icon: 'graduation-cap',
		subcategories: {
			courses: { label: 'Courses & Certifications', icon: 'monitor' },
			books_materials: { label: 'Books & Materials', icon: 'book-open' },
			coaching: { label: 'Coaching & Tuition', icon: 'users' },
		},
	},
	entertainment: {
		label: 'Entertainment',
		icon: 'clapperboard',
		subcategories: {
			movies_events: { label: 'Movies & Events', icon: 'ticket' },
			gaming_onetime: { label: 'Gaming (one-time)', icon: 'gamepad' },
			hobbies: { label: 'Hobbies & Activities', icon: 'palette' },
		},
	},
	other: {
		label: 'Other',
		icon: 'circle-ellipsis',
		subcategories: {
			miscellaneous: { label: 'Miscellaneous', icon: 'circle-ellipsis' },
		},
	},
} as const;

export type CategoryId = keyof typeof CATEGORIES;

export type SubcategoryId = {
	[K in CategoryId]: keyof (typeof CATEGORIES)[K]['subcategories'];
}[CategoryId];

export const CATEGORY_DEFAULT_VISIBILITY: Record<
	CategoryId,
	'personal' | 'group' | 'ask'
> = {
	food_dining: 'group',
	transport: 'personal',
	shopping: 'personal',
	bills_utilities: 'group',
	subscriptions: 'personal',
	health: 'personal',
	education: 'personal',
	entertainment: 'personal',
	other: 'ask',
};

