# Hisaab — Features & Functionality

## Auth & User Management

- Google Sign-In only (Firebase Auth)
- On first login: create user document in Firestore, redirect to onboarding
- Onboarding: set display name/photo (from Google), set monthly income, create or join a group
- Session persists across devices (Firebase Auth handles this)
- Multiple FCM tokens stored per user (one per device) for multi-device notifications
- Sign out clears local state and redirects to sign-in screen

## Groups

- No default group — user explicitly creates or joins one
- User can be in multiple groups simultaneously
- Creating a group generates a unique invite code (expires 48 hours)
- Joining via invite code adds uid to group's memberUids array
- Group members can see each other's expense details (but default view shows own + group expenses)
- Group settings: rename, view members, leave group, delete group (creator only)

## Expense Management

### Adding an expense

Two entry methods available in the Add Expense bottom sheet:

**SMS Paste tab (primary method):**

1. User pastes any bank/UPI SMS
2. Parser runs through 4 layers (see 07-sms-parsing.md)
3. Parsed fields shown in an editable preview
4. User confirms or corrects any field
5. On save, confirmed merchant→category mapping written to merchantPatterns

**Manual tab (fallback):**

- Amount + currency
- Category picker (hierarchical, searchable)
- Merchant / Note
- Date & Time (defaults to now)
- Personal or Group toggle
- Group selector (if in multiple groups)
- Receipt photo (optional — triggers Gemini Vision parsing)
- Payment method (optional)

### Expense visibility

- `visibility: 'personal'` — visible only to ownerId
- `visibility: 'group'` — visible to all members of groupId
- Default visibility comes from user preferences (settable in Profile)
- Can be overridden per expense at time of entry

### Editing and deleting

- Any expense can be edited or deleted by its ownerId
- Opens the same bottom sheet, prefilled
- Editing updates updatedAt and re-runs merchant pattern logic if merchant changed

### Split expenses

- Optional feature on any expense
- splitType: 'equal' divides amount equally among selected members
- splitType: 'custom' allows manual percentage or amount per member
- Split is informational — shown in Group summary as share breakdown
- Not a debt-tracking system (no "you owe X" settlement flow)

## Investment Tracking

- Separate tab in bottom navigation
- Investment types: mutual_fund, stocks, fd, ppf, rd, nps, crypto, real_estate, other
- Each investment has: instrument, label, amount, currency, date, note
- Recurring investments: set recurrenceDay (1–28), optional recurrenceEndDate
- Auto-logging: Cloud Function checks daily at 8am, creates investment doc if today == recurrenceDay
- Currency support: INR default, others available; amountInINR always stored for analytics
- Investments do NOT appear in expense analytics — they are tracked separately
- Dashboard shows unified summary: Total Spent + Total Invested + Remaining

## Budget Management

- Set monthly budget per category
- Budget can be personal (per user) or group (per group)
- One budget document per owner per category per month
- Budget progress shown as progress bars on dashboard
- Alert triggered at 80% of limit (Cloud Function checks every 4 hours)
- Overspend shown with red indicator

## Dashboard & Analytics

Single scrollable screen. Period selector: Today / This Week / This Month / Custom Range.

Sections:

1. **Summary Bar** — Total Spent / Total Invested / Remaining (based on monthly income)
2. **Group Selector** — switch between groups or view All
3. **Category Breakdown** — donut chart + ranked list with amounts
4. **By Person Breakdown** — each member's total for the selected period
5. **Budget Progress** — horizontal progress bars per category
6. **Top Merchants** — ranked list of most spent merchants
7. **Month-over-Month** — delta vs same period last month (% and absolute)
8. **AI Insights Card** — Gemini-generated insights (cached monthly, on-demand trigger available)
9. **Recent Expenses Feed** — latest entries, tappable to Expense Detail

### The family ledger mental model

Every rupee is tracked and visible:

- Group expenses: visible to all group members, contribute to Group Total
- Personal expenses: visible to owner by default, visible to others on demand
- Summary shows: Group Total / My Personal Total / Each Member's Total / Grand Total

## Pattern Recognition (Merchant Learning)

See 07-sms-parsing.md for the full 4-layer parsing system.

User corrections are silent and automatic:

- User corrects a category → writes to merchantPatterns with source: 'user_confirmed'
- confidence increases with each confirmation
- Next occurrence: pre-fills category silently if confidence > 0.7

Admin can override any pattern via the Admin Panel (see below).

## Data Export

- CSV export via `/api/export/csv`
- Filters: date range, scope (personal / group / all)
- Columns: date, time, merchant, category, subcategory, amount, currency, visibility, owner, note, paymentMethod
- Available in Profile → Export Data

## Admin Panel

Route: `/admin` — protected by ADMIN_UID environment variable check
Only Rahul's UID has access. Not visible to other users.

Features:

- Merchant pattern table: view all patterns across all users, sortable by confidence and frequency
- Manual override: set merchant → category with source: 'admin_override' (highest priority)
- SMS fallback log: view all Gemini SMS parsing calls (to identify patterns worth adding to regex)
- Firestore cache: view cached Gemini responses by SMS hash

## Offline Support

Firestore offline persistence is enabled by default.
Expenses added with no signal are queued locally and synced when back online.
No extra code needed — Firestore SDK handles this natively.
