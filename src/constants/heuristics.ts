import type { CategoryId, SubcategoryId } from '@/constants/categories';

type DayOfWeek =
	| 'monday'
	| 'tuesday'
	| 'wednesday'
	| 'thursday'
	| 'friday'
	| 'saturday'
	| 'sunday';

type HeuristicDays = readonly DayOfWeek[] | readonly ['all'];

type MerchantPattern = 'person_name' | 'any';

type TimeHHMM = `${number}${number}:${number}${number}`;

export type SmsHeuristicRule = {
	timeRange: readonly [TimeHHMM, TimeHHMM];
	days: HeuristicDays;
	merchantPattern: MerchantPattern;
	suggestedCategoryId: CategoryId;
	suggestedSubcategoryId: SubcategoryId;
	confidence: number;
	reason: string;
};

export const SMS_HEURISTIC_RULES = [
	{
		timeRange: ['07:00', '10:00'],
		days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
		merchantPattern: 'person_name',
		suggestedCategoryId: 'transport',
		suggestedSubcategoryId: 'cab_auto',
		confidence: 0.6,
		reason: 'Morning weekday + unknown person name → likely cab/auto',
	},
	{
		timeRange: ['17:00', '21:00'],
		days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
		merchantPattern: 'person_name',
		suggestedCategoryId: 'transport',
		suggestedSubcategoryId: 'cab_auto',
		confidence: 0.6,
		reason: 'Evening weekday + unknown person name → likely cab/auto',
	},
	{
		timeRange: ['11:30', '14:30'],
		days: ['all'],
		merchantPattern: 'any',
		suggestedCategoryId: 'food_dining',
		suggestedSubcategoryId: 'eating_out',
		confidence: 0.5,
		reason: 'Lunchtime → likely eating out',
	},
	{
		timeRange: ['18:00', '22:00'],
		days: ['all'],
		merchantPattern: 'any',
		suggestedCategoryId: 'food_dining',
		suggestedSubcategoryId: 'food_delivery',
		confidence: 0.5,
		reason: 'Evening → likely food delivery',
	},
	{
		timeRange: ['08:00', '11:00'],
		days: ['saturday', 'sunday'],
		merchantPattern: 'any',
		suggestedCategoryId: 'food_dining',
		suggestedSubcategoryId: 'groceries',
		confidence: 0.45,
		reason: 'Weekend morning → likely grocery run',
	},
] as const satisfies readonly SmsHeuristicRule[];

