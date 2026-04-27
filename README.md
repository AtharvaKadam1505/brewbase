# ☕ BrewBase

> A production-ready creator support platform — the warmest way to support the people you love.

BrewBase is a full-stack **Buy Me a Coffee** clone built with modern tooling. Creators get a beautiful public profile page where fans can send one-time tips with messages, emoji reactions, and optional anonymity. Creators get a real-time dashboard with analytics, leaderboard, posts, and supporter feeds.

---

## ✨ Features

### For Creators
- 🎨 Beautiful public profile page at `yourdomain.com/username`
- 📊 Analytics dashboard — revenue charts, daily/weekly/monthly stats
- 🏆 Supporter leaderboard with podium view for top 3
- 📝 Posts — publish public or supporters-only content
- 🎯 Monthly goal with animated progress bar
- 📧 Automatic thank-you emails to supporters via Resend
- 💬 Real-time supporter feed with messages
- ⚙️ Settings — username, bio, goal, thank you message

### For Supporters
- ☕ One-time tips with preset or custom amounts
- 💌 Leave a personal message with each tip
- 👻 Stay anonymous or show your name
- 💰 Choose whether to show or hide tip amount
- 😄 React to support messages with 6 emojis (☕ ❤️ 🔥 🎉 👏 💛)
- 🔓 Unlock supporters-only posts after tipping

### Technical
- 🔐 Auth with Clerk v7 (Email, Google, GitHub)
- 💳 Payments via Razorpay (UPI, Cards, Net Banking — no GST for test mode)
- 🗄️ Supabase PostgreSQL with Row Level Security
- ⚡ Real-time support feed via Supabase Realtime
- 📧 Transactional emails via Resend
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
| Email | [Resend](https://resend.com) |
| Charts | [Recharts](https://recharts.org) |
| Icons | [Lucide React](https://lucide.dev) |
| Deployment | [Vercel](https://vercel.com) |

---

## 📁 Project Structure

```
brewbase/
├── app/
│   ├── page.tsx                                   # Landing page
│   ├── layout.tsx                                 # Root layout
│   ├── not-found.tsx                              # 404 page
│   ├── globals.css                                # Global styles + theme
│   ├── onboarding/page.tsx                        # Username setup after sign-up
│   ├── explore/page.tsx                           # Browse all creators
│   ├── [username]/
│   │   ├── page.tsx                               # Public creator profile
│   │   └── posts/[postId]/page.tsx                # Public post reader
│   ├── (auth)/
│   │   ├── sign-in/[[...sign-in]]/page.tsx
│   │   └── sign-up/[[...sign-up]]/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx                             # Sidebar layout
│   │   ├── dashboard/
│   │   │   ├── page.tsx                           # Main dashboard + stats
│   │   │   └── posts/
│   │   │       ├── page.tsx                       # Posts list
│   │   │       ├── new/page.tsx                   # Create post
│   │   │       └── [id]/edit/page.tsx             # Edit post
│   │   ├── analytics/page.tsx                     # Revenue charts
│   │   ├── leaderboard/page.tsx                   # Top supporters
│   │   └── settings/page.tsx                      # Profile settings
│   └── api/
│       ├── checkout/route.ts                      # Create Razorpay order
│       ├── reactions/route.ts                     # Toggle emoji reactions
│       ├── goal-progress/route.ts                 # Fetch monthly earnings
│       └── webhooks/
│           ├── razorpay/route.ts                  # Payment confirmation + emails
│           └── clerk/route.ts                     # Sync users to Supabase
│
├── components/
│   ├── analytics/
│   │   ├── AnalyticsCharts.tsx                    # Range selector + chart wrapper
│   │   ├── RevenueChart.tsx                       # Area + Bar charts (Recharts)
│   │   └── StatCard.tsx                           # Stat display card
│   ├── feed/
│   │   ├── SupportCard.tsx                        # Supporter card + emoji reactions
│   │   └── SupportFeed.tsx                        # Paginated realtime feed
│   ├── goal/
│   │   └── GoalProgress.tsx                       # Monthly goal progress bar
│   ├── layout/
│   │   └── NavBar.tsx                             # Top navigation
│   ├── payment/
│   │   └── PaymentForm.tsx                        # Razorpay payment form
│   ├── posts/
│   │   └── PostCard.tsx                           # Post preview card
│   └── ui/
│       └── PaymentToast.tsx                       # Success/cancel notification
│
├── lib/
│   ├── supabase.ts                                # Supabase client (anon + admin)
│   ├── razorpay.ts                                # Razorpay client
│   ├── resend.ts                                  # Resend email client
│   ├── email-templates.ts                         # HTML email templates
│   └── utils.ts                                   # cn(), formatCurrency(), etc.
│
├── actions/
│   └── user.ts                                    # Server actions (save profile)
│
├── types/index.ts                                 # TypeScript interfaces
├── middleware.ts                                  # Clerk route protection
├── tailwind.config.js                             # Warm sunshine theme
├── supabase-schema.sql                            # Main DB schema + RLS
├── supabase-migrations.sql                        # Reactions + views
├── supabase-migrations-v2-safe.sql               # Goal + posts columns
└── .env.local.example                             # Environment variables template
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- Accounts on: [Clerk](https://clerk.com), [Supabase](https://supabase.com), [Razorpay](https://razorpay.com), [Resend](https://resend.com)

### 1. Clone and install
```bash
git clone https://github.com/yourusername/brewbase.git
cd brewbase
npm install
```

### 2. Environment variables
```bash
cp .env.local.example .env.local
```
Fill in all keys — see the setup guide below.

### 3. Run database migrations
In Supabase SQL Editor, run these files **in order**:
1. `supabase-schema.sql`
2. `supabase-migrations.sql`
3. `supabase-migrations-v2-safe.sql`

### 4. Create storage buckets
In Supabase Dashboard → Storage → New Bucket:
- `avatars` (public)
- `post-media` (public)

### 5. Run locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

---

## 🔑 Environment Variables

| Variable | Where to find it |
|---|---|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk Dashboard → API Keys |
| `CLERK_SECRET_KEY` | Clerk Dashboard → API Keys |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Razorpay → Settings → API Keys |
| `RAZORPAY_KEY_ID` | Razorpay → Settings → API Keys |
| `RAZORPAY_KEY_SECRET` | Razorpay → Settings → API Keys |
| `RAZORPAY_WEBHOOK_SECRET` | Razorpay → Webhooks → your webhook → Secret |
| `RESEND_API_KEY` | Resend Dashboard → API Keys |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` or your Vercel URL |

---

## 🧪 Test Payments (Razorpay)

| Card | Result |
|---|---|
| `4111 1111 1111 1111` | Success |
| `5267 3181 8797 5449` | Success (Mastercard) |
| `4000 0000 0000 0002` | Declined |

UPI test ID: `success@razorpay`

---

## 🌐 Deploy to Vercel

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

1. Go to [vercel.com](https://vercel.com) → New Project → import repo
2. Add all env variables from `.env.local`
3. Deploy
4. Update webhook URLs in Razorpay and Clerk dashboards to your production URL

---

## 🗄️ Database Schema

```
users         — clerk_id, username, bio, avatar_url, goal_amount, goal_label, thank_you_msg
payments      — amount, message, is_anonymous, show_amount, creator_id, user_id
reactions     — emoji reactions on payments (rate-limited by IP)
posts         — title, content, is_public, creator_id
subscriptions — future: monthly memberships
tiers         — future: subscription tiers
```

---

## 🎨 Color Theme (Warm Sunshine)

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

- [ ] Monthly subscription tiers
- [ ] Dark mode toggle
- [ ] Share button + QR code on creator profiles
- [ ] SEO open graph images per creator
- [ ] Email notifications for new posts
- [ ] Creator analytics export (CSV)

---

## 📄 License

MIT — free to use for your own projects.

---

<p align="center">Built with ☕ using Next.js · Clerk · Supabase · Razorpay · Resend</p>