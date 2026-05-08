# Hisaab — Project Overview

## What is Hisaab?

Hisaab is a family expense and investment tracking Progressive Web App (PWA).
The name means "account" or "calculation" in Hindi — the word Indians actually use
when settling expenses ("hisaab karo").

## Who is it for?

Primary users: Rahul and his sister.
Scale: Personal use, small family groups. Not a SaaS product. Not built for scale.
Both users are in India. Default currency is INR.

## Core problem it solves

Existing expense tracker apps are either paid, lack shared tracking, or don't support
the Indian UPI/SMS ecosystem. Hisaab tracks every rupee — personal and shared —
with minimal manual effort, using SMS paste as the primary input method.

## The one-line mental model

"A family ledger where every rupee is tracked, categorised, and explainable —
whether someone spent it for the group or for themselves."

## Key design principles

1. **Every penny tracked** — personal expenses, group expenses, investments, all in one place.
2. **Minimum effort** — SMS paste auto-fills most fields. Manual entry is the fallback, not the default.
3. **Calm UI** — money tracking carries stress. The UI is organised, clear, reassuring. Never overwhelming.
4. **Mobile-first** — designed for one-handed use on a phone. PWA installs on Android and iPhone.
5. **Offline-first** — Firestore offline persistence means it works on the metro with no signal.
6. **Two audiences** — Gen-Z and late-50s users simultaneously. Large tap targets, clear labels, no jargon. Visual personality through color and motion, not through removing clarity.

## What it is NOT

- Not a bank integration tool (no direct bank/SMS reading — SMS is copy-pasted by the user)
- Not a SaaS product (no multi-tenant architecture needed)
- Not an investment portfolio tracker with live prices (investments are logged manually)
- Not a debt-splitting app (split tracking is a secondary feature, not the core)

## App identity

- **Name:** Hisaab
- **Icon:** Geometric tally mark (four lines + diagonal cross), indigo on white / white on indigo
- **Primary color:** Deep Indigo `#5B5BD6`
- **Platform:** PWA (Next.js), installs on Android and iPhone home screen
