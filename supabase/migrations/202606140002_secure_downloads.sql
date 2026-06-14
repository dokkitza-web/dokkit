alter table public.orders
  add column if not exists download_access_token_hash text,
  add column if not exists download_access_token_created_at timestamptz;

create unique index if not exists orders_download_access_token_hash_idx
  on public.orders(download_access_token_hash)
  where download_access_token_hash is not null;

create index if not exists download_links_token_hash_idx
  on public.download_links(token_hash);

create index if not exists download_links_expires_at_idx
  on public.download_links(expires_at);

create index if not exists download_links_product_file_id_idx
  on public.download_links(product_file_id);

create index if not exists download_events_order_id_idx
  on public.download_events(order_id);
