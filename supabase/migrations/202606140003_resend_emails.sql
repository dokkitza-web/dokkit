alter table public.orders
  add column if not exists download_access_token_ciphertext text;

create unique index if not exists email_logs_order_template_sent_idx
  on public.email_logs(order_id, template_key)
  where status = 'sent';
