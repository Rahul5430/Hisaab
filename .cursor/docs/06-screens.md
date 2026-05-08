# Hisaab — Screen Map & Navigation

## Navigation Structure

### Bottom Navigation (always visible, 3 items)

```
[ Home ]   [ + FAB ]   [ Investments ]
```

- **Home** — Dashboard, expense feed, group summary
- **FAB (centre)** — Opens Add Expense bottom sheet from anywhere
- **Investments** — Investment list, summary, add investment

### Top Bar (on every screen)

```
[ Period Selector or Screen Title ]     [ Avatar ]
```

- Avatar (top right) opens Profile Stack (slides in from right)
- Period selector visible on Home and Investments screens

---

## Screen Inventory

### Auth

**Sign In**

- Google Sign-In button centred
- App logo + name above
- No email/password option

---

### Onboarding (first login only, 3 steps)

**Step 1 — Profile**

- Pre-filled from Google (name, photo)
- Editable display name

**Step 2 — Monthly Income**

- Amount input
- Currency selector (default INR)
- "Skip for now" option

**Step 3 — Create or Join Group**

- Two options: Create Group (enter name) or Join Group (enter invite code)
- "Skip — I'll do this later" option
- Skipping lands on Home with a soft prompt to create/join a group

---

### Home

Single scrollable screen.

```
┌─────────────────────────────┐
│ This Month ▾          [👤]  │  ← Top bar: period selector + avatar
├─────────────────────────────┤
│  Spent      Invested  Left  │  ← Summary bar (3 numbers)
│  ₹12,400    ₹5,000   ₹2,600 │
├─────────────────────────────┤
│  All Groups ▾               │  ← Group selector
├─────────────────────────────┤
│  [Donut chart]              │  ← Category breakdown
│  Food          ₹4,200  34%  │
│  Transport     ₹2,100  17%  │
│  ...                        │
├─────────────────────────────┤
│  By Person                  │
│  Rahul         ₹8,200       │
│  Sister        ₹4,200       │
├─────────────────────────────┤
│  Budgets                    │
│  Food    [████░░] ₹4.2/₹6k  │
│  ...                        │
├─────────────────────────────┤
│  Top Merchants              │
│  Swiggy        ₹2,100       │
│  Ola           ₹1,400       │
├─────────────────────────────┤
│  vs Last Month  ↑12% more   │
├─────────────────────────────┤
│  ✦ AI Insights              │  ← Collapsible card, saffron accent
│  "You've spent 60% more..." │
├─────────────────────────────┤
│  Recent                     │
│  [Expense Card]             │
│  [Expense Card]             │
│  See all →                  │
└─────────────────────────────┘
```

Tapping a category → Expense List filtered by category
Tapping an expense card → Expense Detail
Tapping "See all" → Expense List (unfiltered)

---

### Expense List

Pushed from Home (category tap or "See all").

```
┌─────────────────────────────┐
│ ← Food & Dining      [🔍]  │
├─────────────────────────────┤
│ [All] [Mine] [Group] [Others│  ← Filter toggle
├─────────────────────────────┤
│ Today                       │
│ [Expense Card]              │
│ [Expense Card]              │
│ Yesterday                   │
│ [Expense Card]              │
└─────────────────────────────┘
```

---

### Expense Card (component used in lists)

```
┌─────────────────────────────┐
│ 🛵 Swiggy          ₹340    │
│ Food Delivery · 7:30pm      │
│ Group · UPI                 │
└─────────────────────────────┘
```

---

### Expense Detail

Pushed from any expense card.

- Full info: merchant, amount, category, date/time, payment method, note, visibility, who added it
- Receipt image (if attached)
- Split breakdown (if split)
- Edit button → opens Add Expense sheet prefilled
- Delete button → confirmation dialog → delete

---

### Add Expense (FAB → bottom sheet)

Two tabs: SMS Paste / Manual

**SMS Paste tab:**

```
┌─────────────────────────────┐
│ Paste your SMS below        │
│ ┌─────────────────────────┐ │
│ │                         │ │  ← Large paste area
│ └─────────────────────────┘ │
│         [Parse SMS]         │
├─────────────────────────────┤
│ Amount    ₹ [340        ]   │  ← Parsed preview, all editable
│ Merchant  [Swiggy       ]   │
│ Category  [Food Delivery]   │
│ Date      [Today        ]   │
│ Time      [7:30 PM      ]   │
│ For       [Group ▾      ]   │
│ Note      [             ]   │
├─────────────────────────────┤
│         [Save Expense]      │
└─────────────────────────────┘
```

**Manual tab:**

- Amount + currency selector
- Category picker (hierarchical, searchable — opens sub-sheet)
- Merchant / Note
- Date & Time pickers
- Personal / Group toggle
- Group selector (if in multiple groups)
- Receipt photo button (camera or gallery)
- Payment method selector (optional)
- Save button

---

### Investments

```
┌─────────────────────────────┐
│ This Month ▾          [👤]  │
├─────────────────────────────┤
│ Total Invested   ₹15,000    │
│ MF/SIP  ₹10,000  Stocks ₹5k│
├─────────────────────────────┤
│ [Investment Card]           │
│ [Investment Card]           │
│ [Investment Card]           │
└─────────────────────────────┘
```

FAB on this screen opens Add Investment sheet (not Add Expense).
FAB context is determined by which tab is active.

---

### Investment Card (component)

```
┌─────────────────────────────┐
│ 📈 Axis Bluechip SIP ₹5,000 │
│ Mutual Fund · 5th monthly   │
│ Auto-logged · INR            │
└─────────────────────────────┘
```

---

### Investment Detail

- Full info: instrument, label, amount, currency, date, note
- Recurring info (if recurring): recurrenceDay, next log date, end date
- Edit / Delete

---

### Add Investment (FAB on Investments tab → bottom sheet)

- Instrument type selector (icon grid)
- Label (text input)
- Amount + currency
- Date
- One-time / Recurring toggle
- If recurring: day of month picker (1–28), optional end date
- Note (optional)
- Save

---

### Profile Stack (avatar tap → slides in from right)

Sections:

1. **Account** — photo, name, email, sign out button
2. **Groups** — list of groups, Create Group, Join via code, Group Settings per group
3. **Categories** — full hierarchy, add custom, reorder, toggle visibility
4. **Budgets** — set monthly limit per category, personal or group flag
5. **Recurring Investments** — list of all recurring entries, next log date, edit/delete
6. **Notifications** — toggle per notification type
7. **Theme** — light / dark / system
8. **Currency Preferences** — default currency
9. **Monthly Income** — update monthly income figure
10. **Export Data** — CSV download
11. **Admin Panel** — visible only to ADMIN_UID

---

## Navigation Flows

### Quick expense log (most common flow)

FAB → Add Expense sheet → SMS Paste tab → paste → parse → confirm → save → sheet closes → Home refreshes

### Check what was spent this month

Home → period = This Month → scroll category breakdown → tap category → Expense List filtered

### Add a recurring SIP

Investments tab → FAB → Add Investment sheet → toggle Recurring → set day → save

### Invite sister to group

Profile → Groups → [group name] → Group Settings → Share Invite Link → send via WhatsApp

### View sister's personal expenses

Home → By Person → tap sister's name → Expense List filtered by her uid
