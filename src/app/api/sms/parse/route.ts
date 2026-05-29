import { createHash } from 'node:crypto';

import { GoogleGenerativeAI } from '@google/generative-ai';
import type { NextRequest} from 'next/server';
import {NextResponse } from 'next/server';
import { z } from 'zod';

import { adminAuth, adminDb } from '@/lib/firebase/admin';
import type { ParsedExpense } from '@/lib/parsers/sms';

const requestSchema = z.object({
	smsText: z.string().min(1),
});

const geminiParsedSchema = z.object({
	amount: z.number().nullable().optional(),
	currency: z.string().optional(),
	merchant: z.string().nullable().optional(),
	paymentMethod: z
		.enum(['upi', 'card', 'cash', 'netbanking', 'other'])
		.nullable()
		.optional(),
	upiId: z.string().nullable().optional(),
	date: z.string().nullable().optional(),
	time: z.string().nullable().optional(),
	suggestedCategoryId: z.string().nullable().optional(),
	suggestedSubcategoryId: z.string().nullable().optional(),
	confidence: z.number().optional(),
});

const emptyParsedExpense: ParsedExpense = {
	amount: null,
	currency: 'INR',
	merchant: null,
	paymentMethod: null,
	upiId: null,
	date: null,
	time: null,
	suggestedCategoryId: null,
	suggestedSubcategoryId: null,
	confidence: 0,
	resolvedBy: 'none',
};

const categoryIds = [
	'food_dining',
	'transport', 
	'shopping',
	'bills_utilities',
	'subscriptions',
	'health',
	'education',
	'entertainment',
	'other',
];

async function getCachedResult(hash: string): Promise<ParsedExpense | null> {
	try {
		const doc = await adminDb.collection('smsParseCache').doc(hash).get();
		if (doc.exists) {
			return doc.data() as ParsedExpense;
		}
		return null;
	} catch (error) {
		console.warn('Failed to read cached SMS parse result', error);
		return null;
	}
}

async function cacheResult(hash: string, result: ParsedExpense): Promise<void> {
	try {
		await adminDb.collection('smsParseCache').doc(hash).set({
			...result,
			cachedAt: new Date().toISOString(),
		});
	} catch (error) {
		console.warn('Failed to cache SMS parse result', error);
	}
}

async function callGemini(smsText: string): Promise<ParsedExpense> {
	const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
	const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

	const prompt = `You are an Indian expense parser. Extract structured data from this SMS.
Return ONLY valid JSON matching this schema. No explanation, no markdown.

Schema:
{
  "amount": number,
  "currency": "INR",
  "merchant": string,
  "paymentMethod": "upi" | "card" | "cash" | "netbanking" | "other",
  "upiId": string | null,
  "date": "YYYY-MM-DD" | null,
  "time": "HH:MM" | null,
  "transactionType": "debit" | "credit",
  "suggestedCategoryId": string | null,
  "suggestedSubcategoryId": string | null,
  "confidence": number
}

Available categoryIds: [${categoryIds.join(', ')}]

SMS: ${smsText}`;

	try {
		const result = await model.generateContent(prompt);
		const response = result.response;
		let text = response.text();
		
		// Remove markdown fences if present
		text = text.replace(/```json\s*/, '').replace(/```\s*$/, '');
		
		const parsed = geminiParsedSchema.parse(JSON.parse(text));
		
		return {
			amount: parsed.amount ?? null,
			currency: parsed.currency ?? 'INR',
			merchant: parsed.merchant ?? null,
			paymentMethod: parsed.paymentMethod ?? null,
			upiId: parsed.upiId ?? null,
			date: parsed.date ?? null,
			time: parsed.time ?? null,
			suggestedCategoryId: parsed.suggestedCategoryId ?? null,
			suggestedSubcategoryId: parsed.suggestedSubcategoryId ?? null,
			confidence: parsed.confidence ?? 0,
			resolvedBy: 'gemini' as const,
		};
	} catch {
		return emptyParsedExpense;
	}
}

export async function POST(request: NextRequest): Promise<NextResponse> {
	try {
		// Verify Firebase ID token
		const authHeader = request.headers.get('Authorization');
		if (!authHeader?.startsWith('Bearer ')) {
			return NextResponse.json(
				{ error: 'Missing or invalid authorization header' },
				{ status: 401 }
			);
		}

		const token = authHeader.substring(7);
		try {
			await adminAuth.verifyIdToken(token);
		} catch {
			return NextResponse.json(
				{ error: 'Invalid authentication token' },
				{ status: 401 }
			);
		}

		if (process.env.DISABLE_GEMINI === 'true') {
			return NextResponse.json({
				parsed: {
					amount: null,
					currency: 'INR',
					merchant: null,
					paymentMethod: null,
					upiId: null,
					date: null,
					time: null,
					suggestedCategoryId: null,
					suggestedSubcategoryId: null,
					confidence: 0,
					resolvedBy: 'none',
				},
			});
		}

		// Parse and validate request body
		const body = await request.json();
		const { smsText } = requestSchema.parse(body);

		// Check cache first
		const hash = createHash('md5').update(smsText).digest('hex');
		const cached = await getCachedResult(hash);
		if (cached) {
			return NextResponse.json({ parsed: cached });
		}

		// Call Gemini API
		const result = await callGemini(smsText);
		
		// Cache the result
		await cacheResult(hash, result);

		return NextResponse.json({ parsed: result });
	} catch (error) {
		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{ error: 'Invalid request body', details: error.issues },
				{ status: 400 }
			);
		}

		console.error('SMS parse error:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		);
	}
}
