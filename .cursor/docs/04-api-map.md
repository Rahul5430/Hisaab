# Hisaab — API Map

## Three categories of data flow

### A. Client → Firestore (direct, via Firebase SDK)

No server involved. Enforced by Firestore security rules.

| Operation                      | Collection         | Notes                            |
| ------------------------------ | ------------------ | -------------------------------- |
| Get / update user profile      | `users`            | On app load and settings changes |
| Update FCM tokens              | `users`            | On notification permission grant |
| Stream expenses (realtime)     | `expenses`         | Firestore onSnapshot             |
| Add / edit / delete expense    | `expenses`         | After parse or manual entry      |
| Get investments                | `investments`      |                                  |
| Add / edit / delete investment | `investments`      |                                  |
| Get / set budgets              | `budgets`          |                                  |
| Get notifications              | `notifications`    |                                  |
| Mark notification read         | `notifications`    |                                  |
| Get AI insights (cached)       | `aiInsights`       | Read only; write is server-side  |
| Get group details              | `groups`           |                                  |
| Get merchant patterns          | `merchantPatterns` | For SMS Layer 2 lookup           |
| Add / update merchant pattern  | `merchantPatterns` | After user confirms a parsed SMS |
| Get custom categories          | `customCategories` |                                  |
| Add custom category            | `customCategories` |                                  |

---

### B. Client → Next.js API Routes (server-side logic required)

All routes require a valid Firebase ID token in the `Authorization: Bearer <token>` header.
Token is verified via Firebase Admin SDK on every request.

| Endpoint                  | Method | Request Body                                            | Response                    | Purpose                                   |
| ------------------------- | ------ | ------------------------------------------------------- | --------------------------- | ----------------------------------------- |
| `/api/auth/verify`        | POST   | `{ token: string }`                                     | `{ uid, email }`            | Verify Firebase ID token                  |
| `/api/groups/create`      | POST   | `{ name: string }`                                      | `{ groupId, inviteCode }`   | Create group, generate invite code        |
| `/api/groups/join`        | POST   | `{ inviteCode: string }`                                | `{ groupId, groupName }`    | Validate code, add uid to group           |
| `/api/sms/parse`          | POST   | `{ smsText: string }`                                   | `{ parsed: ParsedExpense }` | Run SMS through all 4 parsing layers      |
| `/api/sms/confirm`        | POST   | `{ merchantRaw, categoryId, subcategoryId }`            | `{ success }`               | Confirm parse, update merchantPatterns    |
| `/api/receipt/parse`      | POST   | `{ imageBase64: string, mimeType: string }`             | `{ parsed: ParsedExpense }` | Gemini Vision receipt extraction          |
| `/api/insights/generate`  | POST   | `{ month: string, scopeId: string, scopeType: string }` | `{ insights[] }`            | Trigger Gemini insight generation         |
| `/api/export/csv`         | GET    | query: `?from=&to=&scope=`                              | CSV file                    | Export expenses as CSV                    |
| `/api/notifications/send` | POST   | `{ userId, type, title, body, data? }`                  | `{ success }`               | Internal — called by Cloud Functions only |

---

### C. Next.js API Routes → Third Party (server-side only)

API keys stored in environment variables. Never exposed to client.

| Service                     | When Called                         | Purpose                                    |
| --------------------------- | ----------------------------------- | ------------------------------------------ |
| Gemini 2.0 Flash API        | `/api/sms/parse` (Layer 4 fallback) | SMS parsing when regex fails               |
| Gemini 2.0 Flash Vision API | `/api/receipt/parse`                | Extract structured data from receipt photo |
| Gemini 2.0 Flash API        | `/api/insights/generate`            | Monthly spend analysis and suggestions     |
| Firebase Admin SDK          | Every API route                     | Verify ID token                            |
| Firebase Admin SDK          | `/api/notifications/send`           | Send FCM push notification                 |

---

### D. Firebase Cloud Functions (scheduled, server-side)

All functions run in IST timezone (Asia/Kolkata).

| Function                  | Schedule             | Purpose                                                          |
| ------------------------- | -------------------- | ---------------------------------------------------------------- |
| `autoLogInvestments`      | Daily 8:00 AM        | Match recurrenceDay to today, create investment doc, notify user |
| `sendDailySummary`        | Daily 9:00 PM        | Summarise today's expenses per user, send FCM                    |
| `sendWeeklyDigest`        | Sunday 9:00 AM       | Weekly summary via Gemini, send FCM                              |
| `checkBudgetAlerts`       | Every 4 hours        | Compare spend to budget limits, alert if >80%                    |
| `generateMonthlyInsights` | 1st of month 7:00 AM | Run Gemini insights for previous month                           |
| `cleanupExpiredInvites`   | Daily 00:00 AM       | Delete expired group invite codes                                |

---

## Environment Variables Required

```
# Firebase (client-side — safe to expose)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_VAPID_KEY=        # FCM web push

# Firebase Admin (server-side only — never expose)
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=

# Gemini (server-side only — never expose)
GEMINI_API_KEY=

# Admin
ADMIN_UID=                             # Rahul's Firebase UID for admin panel access
```
