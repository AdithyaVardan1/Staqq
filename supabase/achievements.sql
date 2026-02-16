-- Drop policies if they exist to avoid conflict
drop policy if exists "Achievements are viewable by everyone" on achievements;
drop policy if exists "Users can view their own achievements" on user_achievements;
drop policy if exists "Users can unlock their own achievements" on user_achievements;
drop policy if exists "Users can delete their own achievements" on user_achievements;

-- Achievements Table
create table if not exists achievements (
  id text primary key,
  title text not null,
  description text not null,
  category text not null,
  icon text not null,
  points int default 10,
  created_at timestamp with time zone default now()
);

-- User Achievements Table (Many-to-Many)
create table if not exists user_achievements (
  user_id uuid references auth.users on delete cascade not null,
  achievement_id text references achievements(id) on delete cascade not null,
  unlocked_at timestamp with time zone default now(),
  primary key (user_id, achievement_id)
);

-- Row Level Security
alter table user_achievements enable row level security;
alter table achievements enable row level security;

-- Policies
create policy "Achievements are viewable by everyone" on achievements
  for select using (true);

create policy "Users can view their own achievements" on user_achievements
  for select using (auth.uid() = user_id);

create policy "Users can unlock their own achievements" on user_achievements
  for insert with check (auth.uid() = user_id);

create policy "Users can delete their own achievements" on user_achievements
  for delete using (auth.uid() = user_id);

-- Seed Data (Upsert)
insert into achievements (id, title, description, category, icon, points) values
('first_stack', 'First Stack', 'Complete your first lesson', 'Learning', 'Sprout', 10),
('market_scholar', 'Market Scholar', 'Complete all 5 learning tracks', 'Learning', 'GraduationCap', 50),
('ipo_nerd', 'IPO Nerd', 'Complete the IPO Investing track', 'Learning', 'Rocket', 20),
('chart_reader', 'Chart Reader', 'Complete Technical Analysis track', 'Learning', 'CandlestickChart', 20),
('balance_sheet_beast', 'Balance Sheet Beast', 'Complete Understanding Financials', 'Learning', 'Scale', 20),

('ipo_watcher', 'IPO Watcher', 'View 10 IPO details', 'IPO', 'Eye', 10),
('gmp_hunter', 'GMP Hunter', 'Check GMP on 5 different IPOs', 'IPO', 'Crosshair', 15),
('allotment_tracker', 'Allotment Tracker', 'Use the IPO Allotment calculator', 'IPO', 'Calculator', 10),

('screener_pro', 'Screener Pro', 'Use 3+ filters at once in stock screener', 'Stocks', 'Filter', 15),
('watchlist_builder', 'Watchlist Builder', 'Add 5 stocks to watchlist', 'Stocks', 'ListPlus', 10),
('comparer', 'Comparer', 'Compare 2 stocks head to head', 'Stocks', 'ArrowLeftRight', 10),

('early_bird', 'Early Bird', 'Log in 7 days in a row', 'Streak', 'Sunrise', 20),
('staqq_addict', 'Staqq Addict', '30 day login streak', 'Streak', 'Flame', 100),
('pulse_checker', 'Pulse Checker', 'Read Market Pulse 5 days in a row', 'Streak', 'Activity', 15),

('diamond_hands', 'Diamond Hands', 'Be on Staqq for 6 months', 'Rare', 'Gem', 50),
('og_staqq', 'OG Staqq', 'One of the first 1000 users', 'Rare', 'Crown', 1000),
('full_staqq', 'Full Staqq', 'Complete every single achievement', 'Rare', 'Trophy', 500)
on conflict (id) do update set
  title = excluded.title,
  description = excluded.description,
  category = excluded.category,
  icon = excluded.icon,
  points = excluded.points;
