# Hisaab — Tech Stack

## Frontend

| Concern      | Choice                    | Version                | Notes                                                                              |
| ------------ | ------------------------- | ---------------------- | ---------------------------------------------------------------------------------- |
| Framework    | Next.js                   | 16.2.5 (latest stable) | App Router, PWA support, API routes                                                |
| Language     | TypeScript                | Latest                 | Strict mode. No `any`.                                                             |
| Styling      | Tailwind CSS              | Latest                 | Custom HSL token layer on top                                                      |
| Components   | shadcn/ui                 | Latest                 | Radix primitives, fully accessible                                                 |
| Charts       | Recharts                  | Latest                 | Custom themed to design tokens                                                     |
| Client State | Zustand                   | Latest                 | UI state only (modals, filters, active period)                                     |
| Server State | TanStack Query            | Latest                 | All Firestore data fetching and caching                                            |
| Forms        | React Hook Form + Zod     | Latest                 | Zod schemas shared with API validation                                             |
| Animation    | Framer Motion             | Latest                 | Spring-based, mobile gesture support                                               |
| PWA          | Next.js native + web-push | Built-in               | App Router manifest, custom service worker, web-push for server-side notifications |

## Why Zustand over Redux Toolkit

- This app has 1 developer, moderate complexity, mobile-first
- Zustand: ~3KB bundle vs Redux Toolkit: ~15KB — matters on Indian mobile networks
- Zustand handles UI state; TanStack Query handles server state — clean separation
- Redux Toolkit is for large enterprise teams (10+ devs) needing enforced patterns
- Zustand is now the most downloaded React state management library (14.2M weekly downloads vs RTK's 9.8M as of 2026)

## Why TanStack Query

- Firestore realtime listeners + caching + optimistic updates in one library
- Pairs naturally with Zustand (server state vs client state separation)
- RTK Query only makes sense if you're already using Redux

## Backend

| Concern            | Choice                                   | Notes                                                  |
| ------------------ | ---------------------------------------- | ------------------------------------------------------ |
| Auth               | Firebase Auth                            | Google Sign-In provider only                           |
| Database           | Firestore                                | Realtime sync, offline persistence enabled             |
| Scheduled Jobs     | Firebase Cloud Functions                 | Auto-log investments, send notifications               |
| Push Notifications | web-push (VAPID) + custom service worker | Server-side via Next.js API routes and Cloud Functions |
| File Storage       | Firebase Storage                         | Receipt photos                                         |
| Hosting            | Firebase Hosting                         | Next.js PWA deployment                                 |
| API Runtime        | Next.js API Routes                       | No separate backend server                             |

## PWA Architecture

Next.js native PWA support — no third-party library (next-pwa is abandoned, 4 years without updates).

Three files handle PWA:

- `app/manifest.ts` — Next.js App Router native manifest (replaces public/manifest.json)
- `public/sw.js` — Custom service worker for push notification handling and notification clicks
- `next.config.ts` — Security headers including sw.js cache-control headers

Offline data: handled natively by Firestore SDK offline persistence. No additional caching layer needed.
Push notifications: handled by web-push library server-side with VAPID keys.

VAPID keys stored in environment variables:

- `NEXT_PUBLIC_VAPID_PUBLIC_KEY` — public key (safe to expose, used client-side to subscribe)
- `VAPID_PRIVATE_KEY` — private key (server-side only, never expose to client)

Generate VAPID keys with: `npx web-push generate-vapid-keys`

## AI & Intelligence

| Concern               | Choice                      | Notes                                |
| --------------------- | --------------------------- | ------------------------------------ |
| SMS fallback parsing  | Gemini 2.0 Flash API        | Free tier, fast, Indian bank context |
| Receipt photo parsing | Gemini 2.0 Flash Vision API | Free tier, multimodal                |
| Spend insights        | Gemini 2.0 Flash API        | Free tier, 1M token context window   |
| Anomaly detection     | Gemini 2.0 Flash API        | Server-side only                     |

All Gemini calls are server-side only (Next.js API routes or Cloud Functions).
API keys never touch the client.

## Package Manager

npm

## Environment

- Node.js: LTS (20+)
- Deployment: Firebase Hosting
- Local dev: `npm run dev` with Firebase emulators for Firestore + Auth
