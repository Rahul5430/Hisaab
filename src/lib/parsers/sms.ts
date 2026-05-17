import { SMS_HEURISTIC_RULES } from '@/constants/heuristics';

export type ParsedExpense = {
	amount: number | null;
	currency: string;
	merchant: string | null;
	paymentMethod: 'upi' | 'card' | 'cash' | 'netbanking' | 'other' | null;
	upiId: string | null;
	date: string | null;
	time: string | null;
	suggestedCategoryId: string | null;
	suggestedSubcategoryId: string | null;
	confidence: number;
	resolvedBy: 'regex' | 'pattern' | 'heuristic' | 'gemini' | 'none';
};

type RegexPattern = {
	name: string;
	pattern: RegExp;
	extract: (match: RegExpMatchArray) => Partial<ParsedExpense>;
};

const regexPatterns: RegexPattern[] = [
	{
		name: 'HDFC Bank',
		pattern: /Rs\.?\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?|\d+(?:\.\d{2})?)\s*.*?debited.*?HDFC/i,
		extract: (match) => ({
			amount: parseFloat(match[1].replace(/,/g, '')),
			paymentMethod: 'card',
		}),
	},
	{
		name: 'ICICI Bank',
		pattern: /INR\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?|\d+(?:\.\d{2})?)\s*.*?ICICI/i,
		extract: (match) => ({
			amount: parseFloat(match[1].replace(/,/g, '')),
			paymentMethod: 'card',
		}),
	},
	{
		name: 'SBI',
		pattern: /(\d{1,3}(?:,\d{3})*(?:\.\d{2})?|\d+(?:\.\d{2})?)\s*.*?debited.*?SBI/i,
		extract: (match) => ({
			amount: parseFloat(match[1].replace(/,/g, '')),
			paymentMethod: 'card',
		}),
	},
	{
		name: 'Axis Bank',
		pattern: /(\d{1,3}(?:,\d{3})*(?:\.\d{2})?|\d+(?:\.\d{2})?)\s*.*?debited.*?Axis/i,
		extract: (match) => ({
			amount: parseFloat(match[1].replace(/,/g, '')),
			paymentMethod: 'card',
		}),
	},
	{
		name: 'Kotak Bank',
		pattern: /(\d{1,3}(?:,\d{3})*(?:\.\d{2})?|\d+(?:\.\d{2})?)\s*.*?debited.*?Kotak/i,
		extract: (match) => ({
			amount: parseFloat(match[1].replace(/,/g, '')),
			paymentMethod: 'card',
		}),
	},
	{
		name: 'Generic UPI',
		pattern: /(\d{1,3}(?:,\d{3})*(?:\.\d{2})?|\d+(?:\.\d{2})?)\s*.*?(?:debited|paid).*?UPI/i,
		extract: (match) => ({
			amount: parseFloat(match[1].replace(/,/g, '')),
			paymentMethod: 'upi',
		}),
	},
	{
		name: 'Generic Debit',
		pattern: /(?:Rs\.?|INR|₹)\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?|\d+(?:\.\d{2})?)\s*.*?debited/i,
		extract: (match) => ({
			amount: parseFloat(match[1].replace(/,/g, '')),
			paymentMethod: 'other',
		}),
	},
];

function extractMerchant(smsText: string): string | null {
	const merchantPatterns = [
		/at\s+([^.\n]+)/i,
		/to\s+([^.\n]+)/i,
		/VPA\s+([^.\n]+)/i,
		/from\s+([^.\n]+)/i,
	];

	for (const pattern of merchantPatterns) {
		const match = smsText.match(pattern);
		if (match && match[1]) {
			return match[1].trim().replace(/\s+/g, ' ');
		}
	}

	return null;
}

function extractUpiId(smsText: string): string | null {
	const upiPatterns = [
		/([a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+)/i,
		/VPA\s+([a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+)/i,
		/to\s+([a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+)/i,
	];

	for (const pattern of upiPatterns) {
		const match = smsText.match(pattern);
		if (match && match[1] && match[1].includes('@')) {
			return match[1].trim();
		}
	}

	return null;
}

function extractDate(smsText: string): string | null {
	const datePatterns = [
		/(\d{2}\/\d{2}\/\d{2})/,
		/(\d{2}-\d{2}-\d{4})/,
		/(\d{2}-\d{2}-\d{2})/,
	];

	for (const pattern of datePatterns) {
		const match = smsText.match(pattern);
		if (match && match[1]) {
			const date = match[1];
			// Convert DD/MM/YY to YYYY-MM-DD
			if (date.includes('/')) {
				const [dd, mm, yy] = date.split('/');
				const year = 2000 + parseInt(yy);
				return `${year}-${mm}-${dd}`;
			}
			// Convert DD-MM-YYYY to YYYY-MM-DD
			if (date.includes('-')) {
				const parts = date.split('-');
				if (parts[2].length === 4) {
					return `${parts[2]}-${parts[1]}-${parts[0]}`;
				} else {
					const year = 2000 + parseInt(parts[2]);
					return `${year}-${parts[1]}-${parts[0]}`;
				}
			}
		}
	}

	return null;
}

function extractTime(smsText: string): string | null {
	const timePatterns = [
		/(\d{1,2}:\d{2}\s*(?:AM|PM|am|pm))/i,
		/(\d{1,2}:\d{2})/,
	];

	for (const pattern of timePatterns) {
		const match = smsText.match(pattern);
		if (match && match[1]) {
			const time = match[1].toUpperCase();
			// Convert 12-hour to 24-hour format
			if (time.includes('AM') || time.includes('PM')) {
				const [timePart, period] = time.split(/\s+/);
				const [hours, minutes] = timePart.split(':').map(Number);
				let hour24 = hours;
				if (period === 'PM' && hours !== 12) hour24 += 12;
				if (period === 'AM' && hours === 12) hour24 = 0;
				return `${hour24.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
			}
			return match[1];
		}
	}

	return null;
}

function detectPaymentMethod(smsText: string, upiId: string | null): 'upi' | 'card' | 'cash' | 'netbanking' | 'other' | null {
	if (upiId) return 'upi';
	if (smsText.toLowerCase().includes('upi')) return 'upi';
	if (smsText.toLowerCase().includes('card')) return 'card';
	if (smsText.toLowerCase().includes('netbanking')) return 'netbanking';
	if (smsText.toLowerCase().includes('cash')) return 'cash';
	return null;
}

function isPersonName(merchant: string): boolean {
	if (!merchant) return false;
	// Simple heuristic: single word, no common merchant keywords
	const words = merchant.trim().split(/\s+/);
	if (words.length !== 1) return false;
	
	const commonMerchantKeywords = [
		'store', 'shop', 'mart', 'bazaar', 'centre', 'center', 'point', 'zone',
		'express', 'quick', 'easy', 'pay', 'bank', 'atm', 'petrol', 'gas',
		'hotel', 'restaurant', 'cafe', 'food', 'pizza', 'burger', 'dosa',
		'swiggy', 'zomato', 'uber', 'ola', 'rapido', 'phonepe', 'gpay',
		'amazon', 'flipkart', 'myntra', 'ajio', 'tata', 'reliance',
	];

	const lowerMerchant = merchant.toLowerCase();
	return !commonMerchantKeywords.some(keyword => lowerMerchant.includes(keyword));
}

function getCurrentTime(): string {
	const now = new Date();
	return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
}

function getCurrentDay(): 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday' {
	const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;
	return days[new Date().getDay()];
}

function timeInRange(currentTime: string, range: readonly [string, string]): boolean {
	const [start, end] = range;
	const current = currentTime.split(':').map(Number);
	const startHr = start.split(':').map(Number);
	const endHr = end.split(':').map(Number);
	
	const currentMinutes = current[0] * 60 + current[1];
	const startMinutes = startHr[0] * 60 + startHr[1];
	const endMinutes = endHr[0] * 60 + endHr[1];
	
	return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
}

function applyHeuristics(smsText: string, merchant: string | null): ParsedExpense | null {
	const currentTime = getCurrentTime();
	const currentDay = getCurrentDay();

	for (const rule of SMS_HEURISTIC_RULES) {
		const dayMatches = rule.days[0] === 'all' || (rule.days as readonly string[]).includes(currentDay);
		const timeMatches = timeInRange(currentTime, rule.timeRange);
		const merchantMatches = rule.merchantPattern === 'any' || 
			(rule.merchantPattern === 'person_name' && merchant && isPersonName(merchant));

		if (dayMatches && timeMatches && merchantMatches) {
			return {
				amount: null,
				currency: 'INR',
				merchant,
				paymentMethod: null,
				upiId: null,
				date: null,
				time: currentTime,
				suggestedCategoryId: rule.suggestedCategoryId,
				suggestedSubcategoryId: rule.suggestedSubcategoryId,
				confidence: rule.confidence,
				resolvedBy: 'heuristic',
			};
		}
	}

	return null;
}

export function parseSMSClient(smsText: string): ParsedExpense {
	// Layer 1: Regex patterns
	for (const pattern of regexPatterns) {
		const match = smsText.match(pattern.pattern);
		if (match) {
			const extracted = pattern.extract(match);
			const merchant = extractMerchant(smsText);
			const upiId = extractUpiId(smsText);
			const date = extractDate(smsText);
			const time = extractTime(smsText);
			const paymentMethod = extracted.paymentMethod || detectPaymentMethod(smsText, upiId);

			return {
				amount: extracted.amount ?? null,
				currency: 'INR',
				merchant,
				paymentMethod,
				upiId,
				date,
				time,
				suggestedCategoryId: null,
				suggestedSubcategoryId: null,
				confidence: 0.9,
				resolvedBy: 'regex',
			};
		}
	}

	// Layer 3: Heuristics (only if Layer 1 found no result)
	const merchant = extractMerchant(smsText);
	const heuristicResult = applyHeuristics(smsText, merchant);
	if (heuristicResult) {
		return heuristicResult;
	}

	// No match found
	return {
		amount: null,
		currency: 'INR',
		merchant,
		paymentMethod: null,
		upiId: null,
		date: null,
		time: null,
		suggestedCategoryId: null,
		suggestedSubcategoryId: null,
		confidence: 0,
		resolvedBy: 'none',
	};
}
