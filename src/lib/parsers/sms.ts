import { SMS_HEURISTIC_RULES } from '@/constants/heuristics';
import { MERCHANT_DISPLAY_NAMES } from '@/constants/merchants';

const AMOUNT_PATTERNS = [
	/₹\s*([\d,]+\.?\d*)/,
	/Rs\.?\s*([\d,]+\.?\d*)/i,
	/INR\s*([\d,]+\.?\d*)/i,
	/debited\s+(?:by|for|with|of)?\s*(?:₹|Rs\.?|INR)?\s*([\d,]+\.?\d*)/i,
	/([\d,]+\.?\d*)\s+(?:debited|deducted)/i,
];

const MERCHANT_TRF = /trf\s+to\s+([\w.&\s-]{2,60})(?:\s+UPI|\s+Ref|\s+ref|\s+on|\s+via|\.|$)/i;
const MERCHANT_AT = /(?:at|to|towards)\s+([\w.&\s-]{2,40})(?:\s+(?:on|via|ref|for|UPI)|\.|$)/i;
const MERCHANT_VPA = /VPA\s+([\w.-]+@[\w.-]+)/i;
const UPI_PATTERN = /([\w.-]+@[\w.-]+)/;
const DATE_4 = /(\d{2})[-/](\d{2})[-/](\d{4})/;
const DATE_2 = /(\d{2})[-/](\d{2})[-/](\d{2})(?!\d)/;
const DATE_STR = /(\d{2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{4})/i;
const TIME_PATTERN = /(\d{1,2}):(\d{2})\s*(am|pm)?/i;

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


function extractAmount(smsText: string): number | null {
	for (const pattern of AMOUNT_PATTERNS) {
		const match = pattern.exec(smsText);
		if (match?.[1]) {
			return Number.parseFloat(match[1].replaceAll(',', ''));
		}
	}

	return null;
}

function normalizeMerchant(raw: string): string {
	if (!raw) return raw;

	const cleaned = raw.trim().toLowerCase();

	if (MERCHANT_DISPLAY_NAMES[cleaned]) {
		return MERCHANT_DISPLAY_NAMES[cleaned];
	}

	for (const [key, displayName] of Object.entries(MERCHANT_DISPLAY_NAMES)) {
		if (cleaned.includes(key)) {
			return displayName;
		}
	}

	return raw
		.toLowerCase()
		.replace(/\b\w/g, (c) => c.toUpperCase())
		.trim();
}

function extractMerchant(smsText: string): string | null {
	const trfMatch = MERCHANT_TRF.exec(smsText);
	const atMatch = MERCHANT_AT.exec(smsText);
	const vpaMatch = MERCHANT_VPA.exec(smsText);

	const merchant = normalizeMerchant(
		trfMatch?.[1]?.trim() ||
		atMatch?.[1]?.trim() ||
		vpaMatch?.[1]?.split('@')[0]?.trim() ||
		''
	);

	return merchant || null;
}

function extractUpiId(smsText: string): string | null {
	const match = UPI_PATTERN.exec(smsText);
	return match?.[1] ? match[1].trim() : null;
}

function extractDate(smsText: string): string | null {
	let date: string | null = null;
	const dateMatch6 = DATE_4.exec(smsText);
	const dateMatch4 = DATE_2.exec(smsText);
	const dateMatchStr = DATE_STR.exec(smsText);

	if (dateMatch6) {
		date = `${dateMatch6[3]}-${dateMatch6[2]}-${dateMatch6[1]}`;
	} else if (dateMatch4) {
		const year = Number.parseInt(dateMatch4[3], 10) + 2000;
		date = `${year}-${dateMatch4[2]}-${dateMatch4[1]}`;
	} else if (dateMatchStr) {
		const months: Record<string, string> = {
			jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
			jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12',
		};
		date = `${dateMatchStr[3]}-${months[dateMatchStr[2].toLowerCase()]}-${dateMatchStr[1]}`;
	}

	return date;
}

function extractTime(smsText: string): string | null {
	const match = TIME_PATTERN.exec(smsText);
	if (!match) return null;

	const [, hourText, minuteText, period] = match;
	let hour = Number.parseInt(hourText, 10);
	if (period) {
		const normalized = period.toLowerCase();
		if (normalized === 'pm' && hour !== 12) hour += 12;
		if (normalized === 'am' && hour === 12) hour = 0;
	}

	return `${hour.toString().padStart(2, '0')}:${minuteText}`;
}

function detectPaymentMethod(smsText: string, upiId: string | null): 'upi' | 'card' | 'cash' | 'netbanking' | 'other' | null {
	let paymentMethod: 'upi' | 'card' | 'cash' | 'netbanking' | 'other' | null = null;
	if (upiId || /upi/i.test(smsText)) {
		paymentMethod = 'upi';
	} else if (/credit\s*card|debit\s*card|card\s*no/i.test(smsText)) {
		paymentMethod = 'card';
	} else if (/neft|rtgs|imps|net\s*banking/i.test(smsText)) {
		paymentMethod = 'netbanking';
	}
	return paymentMethod;
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
	const amount = extractAmount(smsText);
	const merchant = extractMerchant(smsText);
	const upiId = extractUpiId(smsText);
	const date = extractDate(smsText);
	const time = extractTime(smsText);
	const paymentMethod = detectPaymentMethod(smsText, upiId);

	if (amount !== null) {
		return {
			amount,
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

	// Layer 3: Heuristics (only if Layer 1 found no result)
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
