-- ============================================================
-- Easy Budget Buddy — Supabase Schema
-- Run this SQL in the Supabase SQL Editor (supabase.com dashboard)
-- ============================================================

-- 1. Transactions table
create table if not exists public.transactions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  title       text not null,
  amount      numeric(12,2) not null,
  category    text not null,
  type        text not null check (type in ('income', 'expense')),
  date        date not null default current_date,
  note        text,
  created_at  timestamptz not null default now()
);

-- 2. Category budgets table
create table if not exists public.category_budgets (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  category    text not null,
  limit_amount numeric(12,2) not null default 0,
  unique (user_id, category)
);

-- 3. User settings table (monthly budget, etc.)
create table if not exists public.user_settings (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null unique references auth.users(id) on delete cascade,
  monthly_budget  numeric(12,2) not null default 2000
);

-- ============================================================
-- Row Level Security (RLS)
-- Each user can only read/write their own data
-- ============================================================

alter table public.transactions enable row level security;
alter table public.category_budgets enable row level security;
alter table public.user_settings enable row level security;

-- Transactions policies
create policy "Users can view own transactions"
  on public.transactions for select
  using (auth.uid() = user_id);

create policy "Users can insert own transactions"
  on public.transactions for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own transactions"
  on public.transactions for delete
  using (auth.uid() = user_id);

-- Category budgets policies
create policy "Users can view own category budgets"
  on public.category_budgets for select
  using (auth.uid() = user_id);

create policy "Users can insert own category budgets"
  on public.category_budgets for insert
  with check (auth.uid() = user_id);

create policy "Users can update own category budgets"
  on public.category_budgets for update
  using (auth.uid() = user_id);

-- User settings policies
create policy "Users can view own settings"
  on public.user_settings for select
  using (auth.uid() = user_id);

create policy "Users can insert own settings"
  on public.user_settings for insert
  with check (auth.uid() = user_id);

create policy "Users can update own settings"
  on public.user_settings for update
  using (auth.uid() = user_id);
