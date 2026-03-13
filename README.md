# Easy Budget Buddy

A personal expense tracker built with **React + TypeScript + Tailwind CSS + shadcn-ui**, backed by **Supabase** (open-source) for authentication and PostgreSQL storage.

## Features

- 📊 **Dashboard** — Summary cards, pie/bar charts, budget alerts
- 💳 **Transactions** — Add, delete, search, filter by type/category
- 🎯 **Budgets** — Overall monthly and per-category budget tracking
- 📈 **Reports** — Expense breakdowns, cumulative spending, income vs expense
- ⚙️ **Settings** — Profile, preferences, CSV export
- 🔐 **Auth** — Email/password signup & login via Supabase
- 🌙 **Dark mode** toggle

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite |
| UI | shadcn-ui, Tailwind CSS, Recharts |
| Backend | Supabase (Auth + PostgreSQL) |
| Deployment | Vercel |

---

## Getting Started

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Go to **Settings → API** and copy the **Project URL** and **anon/public key**

### 2. Set Up the Database

1. In Supabase, go to **SQL Editor**
2. Paste and run the contents of [`supabase/schema.sql`](./supabase/schema.sql)
3. This creates the `transactions`, `category_budgets`, and `user_settings` tables with Row Level Security

### 3. Configure Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local` and fill in your Supabase credentials:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Install & Run

```bash
npm install
npm run dev
```

The app runs at [http://localhost:8080](http://localhost:8080).

---

## Deploy to Vercel

### Option A: Via Vercel Dashboard

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → **Import Project** → select your repo
3. Vercel auto-detects Vite — use the defaults
4. Add environment variables in Vercel's dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Click **Deploy**

### Option B: Via Vercel CLI

```bash
npm i -g vercel
vercel
```

Follow the prompts, then add env vars:

```bash
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
vercel --prod
```

---

## Project Structure

```
src/
├── contexts/        — AuthContext (Supabase Auth), ExpenseContext (Supabase DB)
├── pages/           — Dashboard, Transactions, Budgets, Reports, Settings, Login, Signup
├── components/      — Layout, Sidebar, 49 shadcn-ui primitives
├── hooks/           — use-mobile, use-toast
└── lib/             — Supabase client, cn() utility
supabase/
└── schema.sql       — Database schema with RLS
```

## License

MIT
