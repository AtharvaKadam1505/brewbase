# BrewBase — Complete Setup Guide

> A production-ready creator support platform built with Next.js, Clerk, Supabase & Stripe.

---

## Prerequisites

Make sure you have these installed:
- **Node.js** v18 or above → https://nodejs.org
- **Git** → https://git-scm.com
- A code editor (**VS Code** recommended)

---

## STEP 1 — Project Setup

### 1.1 Copy project files
Place all the provided project files into a folder called `brewbase`.

### 1.2 Install dependencies
Open a terminal inside the `brewbase` folder and run:

```bash
npm install
```

### 1.3 Create environment file
Copy the example env file:

```bash
cp .env.local.example .env.local
```

You will fill in the values in the steps below.

---

## STEP 2 — Clerk (Authentication)

### 2.1 Create a Clerk account
Go to → https://clerk.com and sign up for free.

### 2.2 Create a new application
- Click **"Add Application"**
- Give it a name: `BrewBase`
- Enable sign-in methods: **Email, Google, GitHub**
- Click **"Create application"**

### 2.3 Copy API keys
In your Clerk Dashboard → **API Keys**:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

Paste these into `.env.local`.

### 2.4 Set up Clerk Webhook (to sync users to Supabase)
- In Clerk Dashboard → **Webhooks** → **Add Endpoint**
- Endpoint URL: `https://your-domain.vercel.app/api/webhooks/clerk`
  - (Use ngrok for local testing: `npx ngrok http 3000` → use that URL)
- Events to subscribe: `user.created`, `user.updated`
- Copy the **Signing Secret** — you don't need it in `.env.local` for now
  (Clerk auto-verifies in newer SDK versions)

---

## STEP 3 — Supabase (Database)

### 3.1 Create a Supabase account
Go to → https://supabase.com and sign up for free.

### 3.2 Create a new project
- Click **"New project"**
- Give it a name: `brewbase`
- Set a strong database password (save it somewhere safe)
- Choose a region close to you (e.g., `ap-south-1` for India)
- Click **"Create new project"** and wait ~2 minutes

### 3.3 Run the database schema
- In Supabase Dashboard → click **"SQL Editor"** in the left sidebar
- Click **"New query"**
- Open the file `supabase-schema.sql` from the project
- Copy ALL its contents and paste into the SQL editor
- Click **"Run"** (the green button)
- You should see: `Success. No rows returned`

### 3.4 Create Storage Buckets
- In Supabase Dashboard → **Storage** → **New Bucket**
- Create bucket named: `avatars` → tick **Public bucket** → Save
- Create another bucket named: `post-media` → tick **Public bucket** → Save

### 3.5 Copy API keys
In Supabase Dashboard → **Project Settings** → **API**:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

> ⚠️ Never expose `SUPABASE_SERVICE_ROLE_KEY` to the frontend. It's only used in server-side code.

---

## STEP 4 — Stripe (Payments)

### 4.1 Create a Stripe account
Go to → https://stripe.com and sign up for free.

> ✅ You do NOT need a GST number for test mode. For live mode, you will need business KYC — but Stripe India allows individual/freelancer registration.

### 4.2 Enable test mode
Make sure the toggle in the top-right of Stripe Dashboard says **"Test mode"**.

### 4.3 Copy API keys
In Stripe Dashboard → **Developers** → **API Keys**:

```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
```

### 4.4 Set up Stripe Webhook (for payment confirmation)

**Option A — Local development with Stripe CLI:**

```bash
# Install Stripe CLI
npm install -g @stripe/stripe-cli

# Login
stripe login

# Forward webhooks to your local server
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

This will print a webhook signing secret — copy it:

```env
STRIPE_WEBHOOK_SECRET=whsec_...
```

**Option B — Production (Vercel):**
- In Stripe Dashboard → **Developers** → **Webhooks** → **Add endpoint**
- Endpoint URL: `https://your-domain.vercel.app/api/webhooks/stripe`
- Events: `checkout.session.completed`
- Copy the **Signing secret** → paste as `STRIPE_WEBHOOK_SECRET`

---

## STEP 5 — App URL

Add your app URL to `.env.local`:

```env
# Local development:
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Production (replace with your actual Vercel URL):
# NEXT_PUBLIC_APP_URL=https://brewbase.vercel.app
```

---

## STEP 6 — Run Locally

```bash
npm run dev
```

Open → http://localhost:3000

You should see the BrewBase landing page! 🎉

### Test the full payment flow:
1. Sign up at `/sign-up`
2. Go to `/settings` — set your username (e.g., `testcreator`)
3. Visit `http://localhost:3000/testcreator`
4. Click **Support** and enter amount + message
5. Use Stripe test card: `4242 4242 4242 4242` | Any future date | Any CVC
6. After payment, you'll be redirected back with a success toast
7. The supporter card will appear in the feed in real-time!

---

## STEP 7 — Deploy to Vercel

### 7.1 Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/brewbase.git
git push -u origin main
```

### 7.2 Deploy on Vercel
- Go to → https://vercel.com → **New Project**
- Import your GitHub repository
- Framework: **Next.js** (auto-detected)
- Click **"Environment Variables"** → add ALL variables from `.env.local`
- Click **"Deploy"**

### 7.3 Update webhook URLs
After deployment, update:
- **Clerk webhook** URL → `https://your-domain.vercel.app/api/webhooks/clerk`
- **Stripe webhook** URL → `https://your-domain.vercel.app/api/webhooks/stripe`
- **`NEXT_PUBLIC_APP_URL`** in Vercel env vars → your production URL

---

## Project Structure Summary

```
brewbase/
├── app/
│   ├── page.tsx                  → Landing page
│   ├── layout.tsx                → Root layout (Clerk + fonts)
│   ├── not-found.tsx             → 404 page
│   ├── [username]/page.tsx       → Public creator profile
│   ├── (auth)/
│   │   ├── sign-in/              → Clerk sign-in
│   │   └── sign-up/              → Clerk sign-up
│   ├── (dashboard)/
│   │   ├── layout.tsx            → Dashboard sidebar layout
│   │   ├── dashboard/page.tsx    → Creator dashboard
│   │   └── settings/page.tsx     → Profile settings
│   └── api/
│       ├── checkout/route.ts     → Create Stripe checkout session
│       └── webhooks/
│           ├── stripe/route.ts   → Handle Stripe payment events
│           └── clerk/route.ts    → Sync Clerk users to Supabase
├── components/
│   ├── feed/
│   │   ├── SupportCard.tsx       → Individual supporter card
│   │   └── SupportFeed.tsx       → Paginated feed with realtime
│   ├── payment/
│   │   └── PaymentForm.tsx       → Payment amount + message form
│   └── ui/
│       └── PaymentToast.tsx      → Success/cancel notification
├── lib/
│   ├── supabase.ts               → Supabase client
│   ├── stripe.ts                 → Stripe client
│   └── utils.ts                  → Helper functions
├── types/index.ts                → TypeScript interfaces
├── middleware.ts                 → Clerk route protection
├── supabase-schema.sql           → Full DB schema + RLS
└── .env.local.example            → Environment variables template
```

---

## Stripe Test Cards

| Card Number           | Scenario         |
|-----------------------|------------------|
| `4242 4242 4242 4242` | Payment success  |
| `4000 0000 0000 9995` | Payment declined |
| `4000 0025 0000 3155` | 3D Secure auth   |

Use any future expiry date and any 3-digit CVC.

---

## Common Issues & Fixes

### "Username already taken" on settings
→ The username generated from Clerk may conflict. Just change it in `/settings`.

### Webhook not receiving events locally
→ Make sure `stripe listen` is running in a separate terminal.

### Supabase RLS blocking reads
→ For development, you can temporarily disable RLS on a table in Supabase Dashboard → Table Editor → RLS toggle.

### Clerk redirect loop
→ Double-check `NEXT_PUBLIC_CLERK_SIGN_IN_URL` and `AFTER_SIGN_IN_URL` in `.env.local`.

---

## Next Steps (Optional Enhancements)

- [ ] Add subscription tiers with Stripe recurring payments
- [ ] Add post creation in dashboard (locked/unlocked content)
- [ ] Add leaderboard page for top supporters
- [ ] Add emoji reactions on support messages
- [ ] Add creator analytics (charts with Recharts)
- [ ] Add email notifications with Resend

---

Built with ☕ using Next.js · Clerk · Supabase · Stripe
