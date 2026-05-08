# Hisaab — Notifications

## Infrastructure

Push notifications use the Web Push API with VAPID keys via the `web-push` npm library.
Service worker (`public/sw.js`) handles incoming push events and notification clicks.
VAPID public key stored as `NEXT_PUBLIC_VAPID_PUBLIC_KEY` (client-safe).
VAPID private key stored as `VAPID_PRIVATE_KEY` (server-side only, never exposed to client).
Push subscriptions stored as array on user document (one per device, supports multi-device).
Subscription refreshed on app load and on notification permission grant.

## Notification Types & Triggers

### 1. group_expense_added

**Trigger:** A group member adds an expense with visibility: 'group'
**Recipient:** All other members of that group
**Timing:** Immediate (triggered from client after successful Firestore write, via /api/notifications/send)
**Title:** "[Member name] added an expense"
**Body:** "[Merchant] · ₹[amount] · [category]"
**Deep link:** `/expenses/[expenseId]`

---

### 2. budget_alert

**Trigger:** Cloud Function `checkBudgetAlerts` runs every 4 hours
**Condition:** Current month spend in a category >= 80% of monthly budget limit
**Recipient:** Budget owner (user or group members)
**Timing:** At most once per category per day (de-duplicate in Cloud Function)
**Title:** "[Category] budget at [X]%"
**Body:** "You've spent ₹[spent] of your ₹[limit] [category] budget this month."
**Deep link:** `/home` (dashboard with budget section)

---

### 3. investment_logged

**Trigger:** Cloud Function `autoLogInvestments` successfully creates an investment document
**Recipient:** Investment owner
**Timing:** Daily 8:00 AM IST (when auto-log runs)
**Title:** "Investment logged"
**Body:** "[Label] · ₹[amount] auto-logged for today."
**Deep link:** `/investments/[investmentId]`

---

### 4. weekly_summary

**Trigger:** Cloud Function `sendWeeklyDigest` — every Sunday 9:00 AM IST
**Recipient:** All users
**Timing:** Weekly
**Title:** "Your week in Hisaab"
**Body:** Gemini-generated 1–2 sentence summary e.g. "You spent ₹4,200 this week — ₹800 less than last week. Top category: Food."
**Deep link:** `/home`

---

### 5. monthly_summary

**Trigger:** Cloud Function `generateMonthlyInsights` — 1st of month 7:00 AM IST
**Recipient:** All users
**Timing:** Monthly
**Title:** "[Month] summary is ready"
**Body:** "Your [Month] insights are ready. Tap to see where your money went."
**Deep link:** `/home` (AI Insights card scrolled into view)

---

### 6. inactivity_reminder

**Trigger:** Cloud Function `sendDailySummary` checks: if user has 0 expenses in last 3 days
**Recipient:** Individual user
**Timing:** Daily 9:00 PM IST (only if condition met)
**Title:** "Haven't logged in a while"
**Body:** "Don't forget to log your expenses. Tap to add."
**Deep link:** `/home` (FAB opens)
**Note:** Only sent if notificationsEnabled: true in user preferences

---

### 7. anomaly

**Trigger:** `generateMonthlyInsights` Cloud Function detects anomaly (spend > 150% of 3-month average in a category)
**Recipient:** Affected user
**Timing:** 1st of month (with monthly insights) OR mid-month on-demand trigger
**Title:** "Unusual spend in [Category]"
**Body:** "You spent ₹[amount] on [category] — [X]% more than usual."
**Deep link:** `/home`

---

## User Controls

All notification types are individually toggleable in Profile → Notifications.
Stored in user preferences. Cloud Functions check this flag before sending.
`group_expense_added` defaults to ON.
All others default to ON but user can disable individually.

## Implementation Notes

- In-app notification bell (unread count badge) reads from `notifications` Firestore collection
- Marking as read: update `read: true` on the notification document (direct Firestore write)
- Notification list screen accessible from bell icon in top bar (future enhancement — v1 uses only push)
- Push subscriptions stored as array of serialised PushSubscription objects on user document
- Subscription can become stale — re-subscribe on every app open and update Firestore if changed
- Multi-device: store array of subscriptions, send to all, remove subscriptions that return 410 Gone from web-push
- Server-side sending: `web-push.sendNotification(subscription, payload)` called from Next.js API routes and Cloud Functions
- Notification payload shape: `{ title, body, icon, deepLink }` — deepLink used by service worker on notification click
