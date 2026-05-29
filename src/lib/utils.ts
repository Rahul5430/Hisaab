import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const CURRENCY_RATES: Record<string, number> = {
	INR: 1,
	USD: 82.5,
	EUR: 90,
	GBP: 102,
};

export function cn(...inputs: ClassValue[]): string {
	return twMerge(clsx(inputs));
}

export function convertToINR(value: number, currency: string): number {
	const rate = CURRENCY_RATES[currency] ?? 1;
	return Math.round(value * rate * 100) / 100;
}
