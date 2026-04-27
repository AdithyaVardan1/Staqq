create table if not exists tweets (
    id            bigserial primary key,
    post_id       text unique not null,        -- e.g. "twitter-1234567890"
    title         text,
    body          text,
    url           text,
    score         int default 0,
    comments      int default 0,
    source        text default 'twitter',
    community     text default 'X / Twitter',
    author        text,
    created_at_ts bigint not null,             -- unix timestamp
    tickers       text[] default '{}',
    is_hot        boolean default false,
    image         text,
    fetched_at    timestamptz default now()
);

create index if not exists tweets_created_at_ts_idx on tweets (created_at_ts desc);
