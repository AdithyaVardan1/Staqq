-- Create a table for public profiles (accessible via RLS)
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  updated_at timestamp with time zone,
  username text unique,
  full_name text,
  avatar_url text,
  website text,

  constraint username_length check (char_length(username) >= 3)
);

-- Set up Row Level Security (RLS)
-- See https://supabase.com/docs/guides/auth/row-level-security for more details.
alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone." on profiles
  for select using (true);

create policy "Users can insert their own profile." on profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on profiles
  for update using (auth.uid() = id);

-- This triggers a function every time a new user signs up in auth.users
-- It creates a corresponding row in public.profiles using the new user's ID
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─── Spike Detection & Alerting System ──────────────────────────────

-- User alert subscriptions (which tickers to watch)
create table alert_subscriptions (
  id          uuid default gen_random_uuid() primary key,
  user_id     uuid not null references auth.users(id) on delete cascade,
  ticker      text not null,           -- NSE ticker symbol OR 'ALL'
  email       text,                    -- denormalized for efficient scan queries
  is_active   boolean default true,
  created_at  timestamptz default now(),
  unique(user_id, ticker)
);

create index idx_alert_subs_user   on alert_subscriptions(user_id);
create index idx_alert_subs_ticker on alert_subscriptions(ticker);
create index idx_alert_subs_active on alert_subscriptions(is_active) where is_active = true;

alter table alert_subscriptions enable row level security;

create policy "Users manage own subscriptions"
  on alert_subscriptions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Detected spike events (one row per spike)
create table alerts (
  id              uuid default gen_random_uuid() primary key,
  ticker          text not null,
  mention_count   integer not null,
  baseline_avg    numeric(8,2) not null,
  spike_mult      numeric(6,2) not null,
  detected_at     timestamptz default now(),
  message         text,
  top_post_url    text,
  top_post_title  text
);

create index idx_alerts_ticker      on alerts(ticker);
create index idx_alerts_detected_at on alerts(detected_at desc);

alter table alerts enable row level security;

create policy "Alerts are publicly readable"
  on alerts for select using (true);

create policy "Service role inserts alerts"
  on alerts for insert
  with check (true);

-- Per-user notification fan-out
create table user_notifications (
  id            uuid default gen_random_uuid() primary key,
  user_id       uuid not null references auth.users(id) on delete cascade,
  alert_id      uuid not null references alerts(id) on delete cascade,
  read          boolean default false,
  delivered_via text[] default '{}',
  created_at    timestamptz default now()
);

create index idx_user_notifs_user    on user_notifications(user_id, created_at desc);
create index idx_user_notifs_unread  on user_notifications(user_id) where read = false;

alter table user_notifications enable row level security;

create policy "Users see own notifications"
  on user_notifications for select
  using (auth.uid() = user_id);

create policy "Users update own notifications"
  on user_notifications for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Service role inserts notifications"
  on user_notifications for insert
  with check (true);
