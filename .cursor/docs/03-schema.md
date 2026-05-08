# Hisaab — Firestore Schema

## Design Principles

- Logical relational structure inside Firestore (normalised, clear foreign key references)
- Embedding used ONLY when: data is always read with parent, never queried independently, bounded in size
- Every document maps 1:1 to what would be a SQL table row
- Migration to Postgres/SQLite is straightforward: each collection = one table
- Read/write cost optimisation: embed small, bounded, always-co-read data; reference everything else

---

## Collection: `users`

Document ID = Firebase Auth UID

```typescript
{
  uid: string                        // Firebase Auth UID
  email: string
  displayName: string
  photoURL: string
  monthlyIncome: number              // manually set, default 0
  incomeCurrency: string             // default 'INR'
  preferences: {                     // EMBEDDED — always read with user, small, bounded
    defaultVisibility: 'personal' | 'group'
    defaultCurrency: string          // default 'INR'
    theme: 'light' | 'dark' | 'system'
    notificationsEnabled: boolean
  }
  pushSubscriptions: object[]        // array of serialised PushSubscription objects, one per device
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

---

## Collection: `groups`

Document ID = auto-generated

```typescript
{
  id: string
  name: string
  createdBy: string                  // uid
  memberUids: string[]               // supports array-contains queries
  inviteCode: string                 // short unique alphanumeric
  inviteExpiresAt: Timestamp
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

**Notes:**

- A user can be in multiple groups simultaneously
- Groups are created by users, not auto-created
- Invite codes expire after 48 hours (cleaned up by Cloud Function)

---

## Collection: `expenses`

Document ID = auto-generated

```typescript
{
  id: string
  ownerId: string                    // uid of who added it
  groupId: string | null             // null = personal expense not in any group
  amount: number
  currency: string                   // 'INR' default
  amountInINR: number                // always stored for consistent cross-currency analytics
  merchant: string
  categoryId: string                 // key from constants/categories.ts
  subcategoryId: string              // key from constants/categories.ts
  visibility: 'personal' | 'group'
  date: string                       // 'YYYY-MM-DD'
  time: string                       // 'HH:MM'
  note: string | null
  paymentMethod: 'upi' | 'card' | 'cash' | 'netbanking' | 'other' | null
  upiId: string | null               // extracted from SMS if available
  source: 'manual' | 'sms' | 'receipt' | 'import'
  rawSms: string | null              // stored only when source = 'sms'
  receiptImageUrl: string | null     // Firebase Storage URL
  splitDetails: {                    // EMBEDDED — only present when split, small, bounded
    splitType: 'equal' | 'custom'
    shares: {
      uid: string
      amount: number
      percentage: number
    }[]
  } | null
  tags: string[]
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

**Querying patterns:**

- All expenses for a user: `where('ownerId', '==', uid)`
- All group expenses: `where('groupId', '==', groupId)`
- All expenses visible to user: `where('ownerId', '==', uid)` UNION `where('groupId', 'in', userGroupIds)`
- By month: `where('date', '>=', 'YYYY-MM-01')` and `where('date', '<=', 'YYYY-MM-31')`

---

## Collection: `investments`

Document ID = auto-generated

```typescript
{
	id: string;
	ownerId: string;
	groupId: string | null;
	instrument: 'mutual_fund' |
		'stocks' |
		'fd' |
		'ppf' |
		'rd' |
		'nps' |
		'crypto' |
		'real_estate' |
		'other';
	label: string; // e.g. 'Axis Bluechip SIP'
	amount: number;
	currency: string;
	amountInINR: number;
	date: string; // 'YYYY-MM-DD'
	note: string | null;
	recurring: boolean;
	recurrenceDay: number | null; // 1–28, day of month
	recurrenceEndDate: string | null; // 'YYYY-MM-DD'
	autoLogged: boolean; // true if logged by Cloud Function
	createdAt: Timestamp;
	updatedAt: Timestamp;
}
```

---

## Collection: `budgets`

Document ID = auto-generated
One document per user/group per category per month.

```typescript
{
	id: string;
	ownerId: string; // uid or groupId
	ownerType: 'user' | 'group';
	categoryId: string;
	monthlyLimit: number;
	currency: string; // default 'INR'
	month: string; // 'YYYY-MM'
	createdAt: Timestamp;
	updatedAt: Timestamp;
}
```

---

## Collection: `merchantPatterns`

Document ID = auto-generated

```typescript
{
	id: string;
	userId: string; // patterns are per-user, not shared
	merchantRaw: string; // exactly as extracted from SMS
	merchantNormalized: string; // cleaned display name
	categoryId: string;
	subcategoryId: string;
	paymentMethod: string | null;
	confidence: number; // 0.0 – 1.0, increases with confirmations
	confirmedCount: number;
	lastSeen: Timestamp;
	source: 'user_confirmed' | 'system_inferred' | 'admin_override';
	createdAt: Timestamp;
	updatedAt: Timestamp;
}
```

**Note:** `admin_override` source has highest priority and is never overwritten by user corrections.

---

## Collection: `customCategories`

Document ID = auto-generated

```typescript
{
	id: string;
	userId: string;
	label: string;
	parentCategoryId: string | null; // null = top-level custom category
	icon: string | null; // Lucide icon name
	color: string | null; // hex color
	order: number;
	createdAt: Timestamp;
}
```

---

## Collection: `notifications`

Document ID = auto-generated

```typescript
{
	id: string;
	userId: string;
	type: 'group_expense_added' |
		'budget_alert' |
		'investment_logged' |
		'weekly_summary' |
		'monthly_summary' |
		'inactivity_reminder' |
		'anomaly';
	title: string;
	body: string;
	read: boolean;
	deepLink: string | null; // e.g. '/expenses/[id]'
	data: Record<string, string> | null;
	createdAt: Timestamp;
}
```

---

## Collection: `aiInsights`

Document ID = `${scopeId}_${month}` (deterministic, prevents duplicates)

```typescript
{
	id: string;
	scopeId: string; // uid or groupId
	scopeType: 'user' | 'group';
	month: string; // 'YYYY-MM'
	model: string; // e.g. 'gemini-2.0-flash'
	insights: {
		// EMBEDDED — bounded array, always read together
		type: 'saving_suggestion' | 'anomaly' | 'prediction' | 'summary';
		title: string;
		body: string;
		categoryId: string | null;
		deltaAmount: number | null;
	}
	[];
	generatedAt: Timestamp;
}
```

---

## Firestore Security Rules — Logical Principles

(Full rules to be implemented in `firestore.rules`)

- `users`: read/write only by `uid == request.auth.uid`
- `expenses`: read if `ownerId == uid` OR `groupId in userGroups`; write only if `ownerId == uid`
- `investments`: read/write only by `ownerId == uid`
- `budgets`: read/write only by `ownerId == uid` or group member
- `merchantPatterns`: read/write only by `userId == uid`
- `customCategories`: read/write only by `userId == uid`
- `groups`: read by members; settings write only by `createdBy == uid`
- `notifications`: read/write only by `userId == uid`
- `aiInsights`: read by relevant user or group members; write only via Admin SDK (server)
