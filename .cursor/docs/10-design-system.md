# Hisaab — Design System

## Philosophy: Calm Technology

Money tracking carries stress. The UI is organised, clear, and reassuring — never overwhelming.
Information is layered: summary first, detail on demand.
Every screen has one primary action.

## Two-audience design rule

Both Gen-Z and late-50s users. Resolved by:

- Large tap targets (minimum 48px on all interactive elements)
- High contrast, clear labels on every interactive element
- No icon-only buttons — always label + icon
- Gen-Z personality comes from colour and motion, not from removing clarity
- Font size never below 14px for any readable content

## Design Language

Layered Flat with Depth — platform-agnostic, works on both iOS and Android PWA.
NOT Material Design (reads as Android). NOT LiquidGlass (iOS native only, not replicable on web).
Reference apps: Fi Money, Jupiter, Cred (interaction patterns), Linear, Vercel dashboard (component aesthetic)

---

## Color System

### Brand Colors (CSS custom properties)

```css
/* Indigo — Brand & Action */
--color-brand: hsl(239, 68%, 58%); /* #5B5BD6 light */
--color-brand-dark: hsl(239, 68%, 68%); /* #7C7CE0 dark mode */

/* Teal — Investments exclusively */
--color-invest: hsl(174, 84%, 32%); /* #0D9488 light */
--color-invest-dark: hsl(174, 63%, 40%); /* #14B8A6 dark mode */

/* Saffron — Savings & AI Insights */
--color-savings: hsl(38, 92%, 50%); /* #D97706 light */
--color-savings-dark: hsl(43, 96%, 56%); /* #F59E0B dark mode */
```

### Semantic Colors (NEVER use for decoration — meaning only)

```css
/* Spent / Debit / Expense */
--color-spent: hsl(358, 75%, 59%); /* #E5484D light */
--color-spent-dark: hsl(358, 100%, 70%); /* #FF6369 dark mode */

/* Remaining / Positive / Good */
--color-positive: hsl(151, 55%, 42%); /* #30A46C light */
--color-positive-dark: hsl(151, 55%, 46%); /* #33B074 dark mode */

/* Alert / Warning / Budget danger */
--color-alert: hsl(18, 83%, 57%); /* #EA4C1E light */
--color-alert-dark: hsl(18, 100%, 64%); /* #FF6B47 dark mode */
```

### Neutral Colors

```css
/* Light mode */
--color-text-primary: hsl(0, 0%, 11%); /* #1C1C1E */
--color-text-secondary: hsl(240, 2%, 43%); /* #6C6C70 */
--color-surface: hsl(0, 0%, 100%); /* #FFFFFF — cards */
--color-background: hsl(240, 5%, 96%); /* #F2F2F7 — page bg */
--color-border: hsl(240, 5%, 90%); /* #E4E4E7 */

/* Dark mode */
--color-text-primary: hsl(240, 20%, 97%); /* #F2F2F7 */
--color-text-secondary: hsl(240, 3%, 58%); /* #8E8E93 */
--color-surface: hsl(0, 0%, 11%); /* #1C1C1E — cards */
--color-background: hsl(0, 0%, 0%); /* #000000 — true black for OLED */
--color-border: hsl(240, 4%, 16%); /* #27272A */
```

### Color Usage Rules

- `--color-brand`: buttons, active nav indicator, links, FAB, focus rings ONLY
- `--color-invest`: investment amounts, investment tab indicator, investment cards ONLY
- `--color-savings`: AI insights card, savings suggestions ONLY
- `--color-spent`: expense amounts, debit figures ONLY
- `--color-positive`: remaining balance, positive deltas, healthy budget status ONLY
- `--color-alert`: budget warnings (>80%), anomaly flags ONLY
- NEVER use color for decoration. Every color carries meaning.

---

## Typography

Font: Inter (Google Fonts, with system-ui fallback for performance)

```css
/* Scale */
--text-xs: 0.75rem; /* 12px — metadata, timestamps */
--text-sm: 0.875rem; /* 14px — secondary labels, card subtitles */
--text-base: 1rem; /* 16px — body, list items */
--text-lg: 1.125rem; /* 18px — card titles, section headers */
--text-xl: 1.25rem; /* 20px — screen titles */
--text-2xl: 1.5rem; /* 24px — summary numbers */
--text-3xl: 1.875rem; /* 30px — primary dashboard figures */
```

---

## Spacing

Tailwind's default 4px base scale.
Minimum content padding: 16px (4 on Tailwind scale).
Cards: 16px internal padding.
Section gaps: 24px.

---

## Component Patterns

### Cards

- White background (light) / `#1C1C1E` (dark)
- `border-radius: 12px`
- Subtle shadow: `shadow-sm` in light, none in dark (dark mode uses background contrast)
- 1px border in light mode: `border border-[--color-border]`

### Bottom Sheets

Used for all forms (Add Expense, Add Investment) on mobile.

- Slides up from bottom
- Drag handle at top
- Full screen height on short content, scrollable on long
- Backdrop blur behind sheet
- Spring animation via Framer Motion

### Bottom Navigation Bar

- 3 items + FAB centre
- Active item: brand indigo indicator dot above icon
- Labels always shown (never icon-only)
- Height: 64px + safe area inset
- Background: surface color with top border

### FAB (Floating Action Button)

- Centred in bottom nav bar
- Brand indigo background
- White + icon
- Size: 56px diameter
- Spring scale animation on press
- Opens Add Expense sheet (or Add Investment if on Investments tab)

### Profile Stack (Avatar Menu)

- Avatar: circular, 36px, top right of top bar
- Tapping slides in a full-height sheet from the right
- Back button or swipe right to dismiss

### Toasts

Library: Sonner

- Success: green accent, bottom of screen
- Error: red accent
- Info: neutral
- Never use browser alert()

### Progress Bars (Budget)

- Track: `--color-border`
- Fill: `--color-positive` under 80%, `--color-alert` over 80%
- Animated fill on load

---

## Motion Principles

Library: Framer Motion

- All animations: spring physics (not linear or ease)
- Bottom sheet open: `y: '100%' → y: 0`, spring stiffness 400, damping 40
- Page transitions: fade + slight upward movement, 150ms
- Number changes on dashboard: count-up animation
- FAB press: scale 0.95 spring
- Card tap: scale 0.98 spring
- NEVER animate for decoration — every animation communicates state change

---

## Icons

Library: Lucide Icons
Consistent stroke weight (2px), no fill icons.
Size: 20px in lists, 24px in navigation, 16px inline.

---

## App Identity

Name: **Hisaab**
Icon: Geometric tally mark (four vertical lines + diagonal cross)

- Light mode: Indigo `#5B5BD6` mark on white background
- Dark mode: White mark on Indigo `#5B5BD6` background
- Corner radius: 22% (iOS style, works on Android too)
- PWA icon sizes: 72, 96, 128, 144, 152, 192, 384, 512px

Wordmark: "Hisaab" in Inter SemiBold, brand indigo color
