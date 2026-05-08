# Hisaab — SMS Parsing System

## Overview

SMS paste is the primary expense entry method. The user copies a bank/UPI SMS and pastes it.
The system runs through 4 layers sequentially, stopping at the first confident result.

## Layer 1 — Regex Engine (client-side, synchronous)

File: `/lib/parsers/sms.ts`

Handles Indian bank and UPI SMS formats. Extracts:

- Amount (Rs., INR, debited, credited, spent)
- Merchant or VPA (at [MERCHANT], to [UPI], VPA [name])
- Date and time (if present in SMS)
- Payment method (UPI, card last 4 digits, netbanking)
- Transaction type (debit vs credit)

Banks with regex patterns:

- HDFC Bank
- ICICI Bank
- State Bank of India (SBI)
- Axis Bank
- Kotak Mahindra Bank
- IDFC First Bank
- Federal Bank
- IndusInd Bank
- Yes Bank
- Paytm Payments Bank
- PhonePe UPI (generic)
- Google Pay UPI (generic)
- Generic UPI (catches most other banks)

Resolves ~80% of real-world SMS cases.
If matched: returns ParsedExpense with confidence = 0.9+
If not matched: falls through to Layer 2.

## Layer 2 — Merchant Pattern Lookup (client-side, Firestore read)

File: `/lib/hooks/useExpenses.ts` → calls `/lib/repositories/merchantPatterns.repository.ts`

Takes the raw merchant string extracted by Layer 1.
Queries `merchantPatterns` collection for this userId.

Logic:

- If pattern found with confidence > 0.7 AND confirmedCount > 2:
  → Auto-fills categoryId and subcategoryId silently
  → No visual indication (user doesn't see "suggestion")
- If pattern found with confidence 0.4–0.7:
  → Pre-fills category but highlights field with a "suggestion" chip
  → "Why this?" tooltip explains the reasoning
- If pattern found with confidence < 0.4 OR not found:
  → Falls through to Layer 3

## Layer 3 — Time & Day Heuristics (client-side, synchronous)

File: `/constants/heuristics.ts`

Applied when Layer 2 produces no confident result.
Uses the time and day extracted from the SMS (or current time if not in SMS).

Rules (defined as a typed constant array):

```typescript
[
	{
		timeRange: ['07:00', '10:00'],
		days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
		merchantPattern: 'person_name', // single word, no known merchant
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
];
```

If matched: returns suggestion with confidence shown to user as a chip
If no rule matches: falls through to Layer 4

## Layer 4 — Gemini API Fallback (server-side, via /api/sms/parse)

File: `/app/api/sms/parse/route.ts` → `/lib/ai/gemini.ts`

Triggered only when Layers 1–3 produce no result or confidence below 0.4.

**Caching:** Before calling Gemini, compute MD5 hash of the raw SMS text.
Check Firestore for a cached response under `smsParseCache/{hash}`.
If found: return cached result (no API call).
If not found: call Gemini, store result in cache.

**Gemini prompt structure:**

```
You are an Indian expense parser. Extract structured data from this SMS.
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

Available categoryIds: [food_dining, transport, shopping, bills_utilities,
subscriptions, health, education, entertainment, other]

SMS: {rawSmsText}
```

Response is parsed as JSON. If parsing fails: return empty result, show manual entry.

## After Parsing — Confirmation Flow

Regardless of which layer resolved the parse:

1. Show editable preview of all parsed fields
2. User reviews and saves (or corrects first)
3. On save: call `/api/sms/confirm` with { merchantRaw, categoryId, subcategoryId }
4. Server writes/updates merchantPatterns document:
    - If exists: increment confirmedCount, update confidence, update lastSeen
    - If new: create with confirmedCount: 1, confidence: 0.5, source: 'user_confirmed'

## ParsedExpense Type

```typescript
type ParsedExpense = {
	amount: number | null;
	currency: string;
	merchant: string | null;
	paymentMethod: 'upi' | 'card' | 'cash' | 'netbanking' | 'other' | null;
	upiId: string | null;
	date: string | null; // 'YYYY-MM-DD'
	time: string | null; // 'HH:MM'
	suggestedCategoryId: string | null;
	suggestedSubcategoryId: string | null;
	confidence: number; // 0.0–1.0
	resolvedBy: 'regex' | 'pattern' | 'heuristic' | 'gemini' | 'none';
};
```
