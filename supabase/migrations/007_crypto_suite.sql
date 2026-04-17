-- wallet_watchlist: per-user saved wallets
create table if not exists wallet_watchlist (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) on delete cascade not null,
    wallet_address text not null,
    chain text not null check (chain in ('eth', 'bsc', 'solana')),
    label text,
    created_at timestamptz default now() not null,
    unique (user_id, wallet_address)
);

alter table wallet_watchlist enable row level security;

create policy "Users manage own wallet watchlist" on wallet_watchlist
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

-- new_token_cache: GoPlus + DexScreener results for recently launched tokens
create table if not exists new_token_cache (
    id uuid default gen_random_uuid() primary key,
    contract_address text not null,
    chain text not null,
    token_symbol text,
    token_name text,
    safety_score integer,
    verdict text,
    flags jsonb default '[]'::jsonb,
    dex_data jsonb default '{}'::jsonb,
    profile_url text,
    icon_url text,
    cached_at timestamptz default now() not null,
    unique (contract_address, chain)
);

alter table new_token_cache enable row level security;

create policy "Anyone can read new token cache" on new_token_cache
    for select using (true);

create policy "Service role can write new token cache" on new_token_cache
    for all using (true);
