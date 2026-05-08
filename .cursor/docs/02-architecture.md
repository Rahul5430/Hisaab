# Hisaab — Code Architecture

## Pattern

Feature-based folder structure with strict separation of concerns.
Repository pattern for all Firestore access.
Custom hooks as the service layer between components and repositories.
Zod schemas as the single source of truth for all data shapes.

## Folder Structure

```
hisaab/
├── .cursor/                    ← Cursor AI knowledge base (this folder)
├── app/
│   ├── api/                    ← Server-side API routes (Next.js Route Handlers)
│   │   ├── auth/
│   │   │   └── verify/route.ts
│   │   ├── groups/
│   │   │   ├── create/route.ts
│   │   │   └── join/route.ts
│   │   ├── sms/
│   │   │   ├── parse/route.ts
│   │   │   └── confirm/route.ts
│   │   ├── receipt/
│   │   │   └── parse/route.ts
│   │   ├── insights/
│   │   │   └── generate/route.ts
│   │   ├── export/
│   │   │   └── csv/route.ts
│   │   └── notifications/
│   │       └── send/route.ts
│   ├── (auth)/                 ← Unauthenticated routes
│   │   └── signin/
│   │       └── page.tsx
│   ├── (app)/                  ← Authenticated routes (protected layout)
│   │   ├── layout.tsx          ← Bottom nav + auth guard
│   │   ├── home/
│   │   │   └── page.tsx
│   │   ├── investments/
│   │   │   └── page.tsx
│   │   └── onboarding/
│   │       └── page.tsx
│   ├── layout.tsx              ← Root layout (fonts, providers)
│   └── globals.css             ← Tailwind base + CSS custom properties
├── components/
│   ├── ui/                     ← shadcn/ui primitives (auto-generated, do not edit)
│   ├── shared/                 ← Reusable app-level components
│   │   ├── BottomNav.tsx
│   │   ├── TopBar.tsx
│   │   ├── AvatarMenu.tsx
│   │   ├── FAB.tsx
│   │   ├── BottomSheet.tsx
│   │   ├── PeriodSelector.tsx
│   │   └── CurrencyDisplay.tsx
│   └── features/               ← Feature-specific components
│       ├── expenses/
│       │   ├── ExpenseCard.tsx
│       │   ├── ExpenseList.tsx
│       │   ├── ExpenseDetail.tsx
│       │   ├── AddExpenseSheet.tsx
│       │   ├── SMSParseTab.tsx
│       │   └── ManualEntryTab.tsx
│       ├── investments/
│       │   ├── InvestmentCard.tsx
│       │   ├── InvestmentList.tsx
│       │   ├── InvestmentDetail.tsx
│       │   └── AddInvestmentSheet.tsx
│       ├── dashboard/
│       │   ├── SummaryBar.tsx
│       │   ├── CategoryBreakdown.tsx
│       │   ├── PersonBreakdown.tsx
│       │   ├── BudgetProgress.tsx
│       │   ├── TopMerchants.tsx
│       │   ├── MonthComparison.tsx
│       │   └── AIInsightsCard.tsx
│       ├── groups/
│       │   ├── GroupSelector.tsx
│       │   └── GroupSummary.tsx
│       └── profile/
│           ├── ProfileStack.tsx
│           ├── CategoryManager.tsx
│           ├── BudgetManager.tsx
│           └── NotificationSettings.tsx
├── lib/
│   ├── firebase/
│   │   ├── client.ts           ← Firebase client SDK init (browser)
│   │   └── admin.ts            ← Firebase Admin SDK init (server only)
│   ├── repositories/           ← ALL Firestore access lives here
│   │   ├── users.repository.ts
│   │   ├── groups.repository.ts
│   │   ├── expenses.repository.ts
│   │   ├── investments.repository.ts
│   │   ├── budgets.repository.ts
│   │   ├── merchantPatterns.repository.ts
│   │   ├── notifications.repository.ts
│   │   └── aiInsights.repository.ts
│   ├── hooks/                  ← Custom React hooks (service layer)
│   │   ├── useAuth.ts
│   │   ├── useExpenses.ts
│   │   ├── useInvestments.ts
│   │   ├── useDashboard.ts
│   │   ├── useGroups.ts
│   │   ├── useBudgets.ts
│   │   └── useNotifications.ts
│   ├── parsers/
│   │   └── sms.ts              ← SMS regex engine (Layers 1-3)
│   ├── ai/
│   │   └── gemini.ts           ← Gemini API client (server-side only)
│   ├── validators/             ← Zod schemas (single source of truth)
│   │   ├── expense.schema.ts
│   │   ├── investment.schema.ts
│   │   ├── user.schema.ts
│   │   ├── group.schema.ts
│   │   └── budget.schema.ts
│   └── utils/
│       ├── currency.ts         ← Currency formatting and conversion
│       ├── date.ts             ← Date helpers (IST-aware)
│       └── export.ts           ← CSV export logic
├── store/                      ← Zustand stores (UI state only)
│   ├── ui.store.ts             ← Modals, sheets, active period
│   └── auth.store.ts           ← Current user (synced from Firebase Auth)
├── types/
│   └── index.ts                ← Global TypeScript types
├── constants/
│   ├── categories.ts           ← Full category hierarchy (source of truth)
│   └── heuristics.ts          ← SMS time-of-day suggestion rules
├── functions/                  ← Firebase Cloud Functions
│   ├── src/
│   │   ├── autoLogInvestments.ts
│   │   ├── sendDailySummary.ts
│   │   ├── sendWeeklyDigest.ts
│   │   ├── checkBudgetAlerts.ts
│   │   ├── generateMonthlyInsights.ts
│   │   └── cleanupExpiredInvites.ts
│   └── package.json
├── public/
│   ├── icons/                  ← PWA icons (all sizes)
│   ├── manifest.json           ← PWA manifest
│   └── sw.js                   ← Service worker (generated by next-pwa)
└── ...config files
```

## Layer Rules

### Components → Hooks → Repositories → Firestore

- Components call hooks only. Never repositories directly.
- Hooks call repositories and manage TanStack Query caching.
- Repositories contain all Firestore SDK calls.
- This means: if you want to change the database, you only change repositories.

### Server vs Client boundary

- All `lib/firebase/admin.ts` usage: server-side only (API routes, Cloud Functions)
- All `lib/firebase/client.ts` usage: client-side only (hooks, repositories)
- All `lib/ai/gemini.ts` usage: server-side only (API routes, Cloud Functions)
- Zustand stores: client-side only
- TanStack Query: client-side only

### Zod schemas as source of truth

- Define the schema in `/lib/validators/` first
- Use the same schema for:
    - Form validation (React Hook Form)
    - API route input validation
    - TypeScript type inference (`z.infer<typeof schema>`)
- Never define a type manually if a Zod schema exists for it

## State Management Split

| State Type         | Tool                                    | Examples                                   |
| ------------------ | --------------------------------------- | ------------------------------------------ |
| Server/async state | TanStack Query                          | Expenses list, dashboard data, investments |
| UI state           | Zustand                                 | Active period, open sheets, selected group |
| Auth state         | Zustand (synced from Firebase)          | Current user object                        |
| Form state         | React Hook Form                         | Add expense form, add investment form      |
| Realtime updates   | Firestore onSnapshot via TanStack Query | Group expense feed                         |
