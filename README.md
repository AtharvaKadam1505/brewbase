# ☕ BrewBase

> A production-ready creator support platform — the warmest way to support the people you love.

BrewBase is a full-stack **Buy Me a Coffee** clone built with modern tooling. Creators get a beautiful public profile page where fans can send one-time tips with messages, emoji reactions, and optional anonymity. Creators get a real-time dashboard with analytics, a leaderboard, and supporter feeds.

---

## ✨ Features

### For Creators
- 🎨 Beautiful public profile page at `yourdomain.com/username`
- 📊 Analytics dashboard with revenue charts (daily, weekly, monthly)
- 🏆 Supporter leaderboard with podium view for top 3
- 💬 Real-time supporter feed with messages
- ⚙️ Settings to update username and bio

### For Supporters
- ☕ One-time tips with preset or custom amounts (₹99, ₹199, ₹499, ₹999)
- 💌 Leave a personal message with each tip
- 👻 Stay anonymous or show your name publicly
- 💰 Choose whether to show or hide your tip amount
- 😄 React to support messages with 6 emojis (☕ ❤️ 🔥 🎉 👏 💛)

### Technical
- 🔐 Auth with Clerk (Email, Google, GitHub)
- 💳 Payments via Razorpay (UPI, Cards, Net Banking — no GST needed)
- 🗄️ Supabase PostgreSQL with Row Level Security
- ⚡ Real-time support feed via Supabase Realtime
- 🚀 Deployed on Vercel

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 14](https://nextjs.org) (App Router) |
| Styling | [Tailwind CSS](https://tailwindcss.com) |
| Auth | [Clerk](https://clerk.com) v7 |
| Database | [Supabase](https://supabase.com) (PostgreSQL) |
| Payments | [Razorpay](https://razorpay.com) |
| Charts | [Recharts](https://recharts.org) |
| Icons | [Lucide React](https://lucide.dev) |
| Deployment | [Vercel](https://vercel.com) |

---

## 📁 Project Structure

```
brewbase/
├── app/
│   ├── page.tsx                        # Landing page
│   ├── layout.tsx                      # Root layout (Clerk + fonts)
│   ├── not-found.tsx                   # 404 page
│   ├── onboarding/page.tsx             # Username setup after sign-up
│   ├── [username]/page.tsx             # Public creator profile
│   ├── (auth)/
│   │   ├── sign-in/                    # Clerk sign-in
│   │   └── sign-up/                    # Clerk sign-up
│   ├── (dashboard)/
│   │   ├── layout.tsx                  # Sidebar layout
│   │   ├── dashboard/page.tsx          # Creator dashboard + stats
│   │   ├── analytics/page.tsx          # Revenue charts
│   │   ├── leaderboard/page.tsx        # Top supporters podium
│   │   └── settings/page.tsx           # Edit profile
│   └── api/
│       ├── checkout/route.ts           # Create Razorpay order
│       ├── reactions/route.ts          # Toggle emoji reactions
│       └── webhooks/
│           ├── razorpay/route.ts       # Handle payment confirmation
│           └── clerk/route.ts          # Sync users to Supabase
├── components/
│   ├── analytics/
│   │   ├── AnalyticsCharts.tsx         # Range selector + chart wrapper
│   │   ├── RevenueChart.tsx            # Area + Bar charts (Recharts)
│   │   └── StatCard.tsx                # Stat display card
│   ├── feed/
│   │   ├── SupportCard.tsx             # Supporter card with reactions
│   │   └── SupportFeed.tsx             # Paginated realtime feed
│   ├── layout/
│   │   └── NavBar.tsx                  # Top navigation bar
│   ├── payment/
│   │   └── PaymentForm.tsx             # Razorpay payment form
│   └── ui/
│       └── PaymentToast.tsx            # Success/cancel notification
├── lib/
│   ├── supabase.ts                     # Supabase client (anon + admin)
│   ├── stripe.ts                       # Stripe client (legacy)
│   └── utils.ts                        # cn(), formatCurrency(), etc.
├── types/index.ts                      # TypeScript interfaces
├── middleware.ts                       # Clerk route protection
├── supabase-schema.sql                 # Main DB schema + RLS
├── supabase-migrations.sql             # Reactions table + views
└── .env.local.example                  # Environment variables template
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js v18+
- Accounts on: [Clerk](https://clerk.com), [Supabase](https://supabase.com), [Razorpay](https://razorpay.com)

### 1. Clone and install

```bash
git clone https://github.com/yourusername/brewbase.git
cd brewbase
npm install
```

### 2. Set up environment variables

```bash
cp .env.local.example .env.local
```

Fill in your keys — see the table below.

### 3. Set up Supabase

- Create a new project at [supabase.com](https://supabase.com)
- Go to **SQL Editor** and run `supabase-schema.sql`
- Then run `supabase-migrations.sql` for reactions + leaderboard view
- Create two storage buckets: `avatars` and `post-media` (both public)

### 4. Set up Clerk

- Create an app at [clerk.com](https://clerk.com)
- Enable **Email, Google, GitHub** sign-in methods
- Add webhook endpoint: `https://yourdomain.com/api/webhooks/clerk`
- Subscribe to events: `user.created`, `user.updated`
- Set **Sign-out URL** to `/` in Clerk Dashboard → Configure → Redirects

### 5. Set up Razorpay

- Sign up at [razorpay.com](https://razorpay.com) (no GST needed for test mode)
- Copy test API keys from **Settings → API Keys**
- Add webhook: `https://yourdomain.com/api/webhooks/razorpay`
- Subscribe to event: `payment.captured`

### 6. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🔑 Environment Variables

| Variable | Where to get it |
|---|---|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk Dashboard → API Keys |
| `CLERK_SECRET_KEY` | Clerk Dashboard → API Keys |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Razorpay → Settings → API Keys |
| `RAZORPAY_KEY_ID` | Razorpay → Settings → API Keys |
| `RAZORPAY_KEY_SECRET` | Razorpay → Settings → API Keys |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` (local) or your Vercel URL |

---

## 🧪 Testing Payments

Razorpay test cards:

| Card Number | Result |
|---|---|
| `4111 1111 1111 1111` | Payment success |
| `5267 3181 8797 5449` | Payment success (Mastercard) |
| `4000 0000 0000 0002` | Payment declined |

Use any future expiry date and any CVV. For UPI, use `success@razorpay` as the UPI ID.

---

## 🌐 Deploying to Vercel

```bash
# Push to GitHub first
git add .
git commit -m "Initial commit"
git push origin main
```

Then:
1. Go to [vercel.com](https://vercel.com) → **New Project** → import your repo
2. Add all environment variables from `.env.local` in Vercel's dashboard
3. Deploy — Vercel auto-detects Next.js
4. Update webhook URLs in Clerk and Razorpay dashboards to your production URL

---

## 🗄️ Database Schema

```
users         — Synced from Clerk via webhook
payments      — One-time tips (amount, message, visibility flags)
reactions     — Emoji reactions on payments (rate-limited by IP)
subscriptions — Monthly memberships (future)
tiers         — Subscription tiers (future)
posts         — Creator content, locked/unlocked (future)

Views:
leaderboard   — Aggregated total donations per supporter per creator
daily_revenue — Daily revenue totals for analytics charts
```

---

## 🎨 Color Theme

| Role | Hex |
|---|---|
| Primary | `#F97316` |
| Secondary | `#FBBF24` |
| Accent | `#EF4444` |
| Dark background | `#1C1917` |
| Light background | `#FFFBEB` |
| Muted text | `#92400E` |
| Border | `#FDE68A` |
| Card surface | `#FFF7ED` |

---

## 📋 Roadmap

- [ ] Monthly subscription tiers with Razorpay recurring
- [ ] Creator posts (locked/unlocked content)
- [ ] Email notifications with [Resend](https://resend.com)
- [ ] Pin top supporters on profile
- [ ] Dark mode toggle
- [ ] Creator explore/discover page

---

## 🤝 Contributing

Pull requests are welcome. For major changes, please open an issue first.

```bash
# Create a feature branch
git checkout -b feature/your-feature-name
git commit -m "feat: add your feature"
git push origin feature/your-feature-name
```

---

## 📄 License

MIT — feel free to use this for your own projects.

---

<p align="center">Built with ☕ using Next.js · Clerk · Supabase · Razorpay</p>