# Hisaab — AI Models & Usage

## Decision Summary

All AI features use **Gemini 2.0 Flash** exclusively.

## Why Gemini 2.0 Flash

| Factor                     | Gemini 2.0 Flash | Claude 3.5 Sonnet | GPT-4o      |
| -------------------------- | ---------------- | ----------------- | ----------- |
| Free API tier              | Yes (generous)   | No                | No          |
| Indian financial context   | Strong           | Good              | Good        |
| SMS/receipt extraction     | Excellent        | Excellent         | Excellent   |
| Long context window        | 1M tokens        | 200k tokens       | 128k tokens |
| JSON output reliability    | Very good        | Excellent         | Very good   |
| Speed                      | Fast             | Moderate          | Moderate    |
| Cost if free tier exceeded | Very low         | Higher            | Higher      |
| Vision (receipt photos)    | Yes (native)     | Yes               | Yes         |

Claude and GPT-4o have no free API tier. For a personal app with no revenue,
Gemini 2.0 Flash is the only viable choice. The quality difference is negligible for
structured extraction and summarisation tasks.

Claude (this AI assistant) is used for development help, not in the runtime app.

## Use Cases in Hisaab

### 1. SMS Fallback Parsing

- Triggered: Layer 4 of SMS parsing (regex + patterns + heuristics all failed)
- Input: Raw SMS text
- Output: Structured JSON (amount, merchant, category suggestion, etc.)
- Caching: MD5 hash of SMS → Firestore cache → never call API for same format twice
- File: `/app/api/sms/parse/route.ts`

### 2. Receipt Photo Parsing

- Triggered: User attaches a receipt photo in Add Expense
- Input: Base64 image (JPEG or PNG)
- Output: Same structured JSON as SMS parsing
- Model: Gemini 2.0 Flash Vision (multimodal)
- File: `/app/api/receipt/parse/route.ts`

### 3. Monthly Spend Insights

- Triggered: 1st of month (Cloud Function) OR on-demand from dashboard
- Input: Aggregated expense summary for the month (NOT raw transactions — summarised)
- Output: Array of 3–5 insight objects (saving suggestions, anomalies, predictions)
- Cached in `aiInsights` collection — not regenerated on every dashboard load
- File: `/app/api/insights/generate/route.ts` and `functions/src/generateMonthlyInsights.ts`

### 4. Weekly Digest Summary

- Triggered: Sunday 9am Cloud Function
- Input: Week's expense summary per user
- Output: 2–3 sentence narrative summary + 1–2 suggestions
- Delivered as FCM notification (title + body)
- File: `functions/src/sendWeeklyDigest.ts`

### 5. Anomaly Detection

- Triggered: Cloud Function (monthly insights generation) or on-demand
- Input: Current month spend vs 3-month average by category
- Output: List of anomalies with categoryId and deltaAmount
- Stored as insight type: 'anomaly' in aiInsights collection

## Gemini Prompt Design Principles

1. **Always request JSON only.** Start system prompt with:
   "Return ONLY valid JSON. No explanation. No markdown. No code blocks."

2. **Provide the exact schema.** Don't let Gemini invent field names.

3. **Provide Indian context explicitly.** Mention INR, UPI, Indian merchants,
   Indian banks by name when relevant.

4. **Keep inputs aggregated, not raw.** For insights, send:
   `{ category: 'food_dining', total: 4200, lastMonthTotal: 2800, transactions: 14 }`
   NOT 14 individual transaction objects. Keeps token usage low.

5. **Parse defensively.** Always wrap JSON.parse in try/catch.
   Strip any accidental markdown fences before parsing.

## Gemini Client

File: `/lib/ai/gemini.ts`

- Initialised with GEMINI_API_KEY (server-side only)
- Exported functions: `parseSMS()`, `parseReceipt()`, `generateInsights()`, `generateWeeklySummary()`
- Never import this file in any client-side code
- Used only in `/app/api/` routes and `/functions/src/`
