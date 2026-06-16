# DokKit Email And Domain Launch Checklist

Use this checklist when moving DokKit from the Vercel preview domain to
`dokkit.co.za`.

## Target Launch Setup

- Primary website: `https://dokkit.co.za`
- Optional redirect: `https://www.dokkit.co.za` redirects to `https://dokkit.co.za`
- Transactional sender: `DokKit <orders@dokkit.co.za>`
- Temporary reply-to: `dokkit.za@gmail.com`
- Later reply-to: `hello@dokkit.co.za` or `support@dokkit.co.za`

## DNS Owner

Before changing records, confirm where DNS is managed:

- Registrar DNS dashboard, or
- Cloudflare, or
- Vercel nameservers

Add DNS records only in the active DNS host. If nameservers point to Cloudflare,
edit Cloudflare. If nameservers point to the registrar, edit the registrar.

## Vercel Domain Setup

1. Open Vercel project settings.
2. Go to **Domains**.
3. Add `dokkit.co.za`.
4. Add `www.dokkit.co.za` when Vercel prompts for it.
5. Add the DNS records Vercel shows in the dashboard.
6. Wait for Vercel to show the domain as valid and SSL issued.
7. Set the preferred production domain.

Do not guess DNS records if Vercel gives a different value. Copy exactly what
the Vercel dashboard shows.

## Resend Domain Setup

1. Open Resend.
2. Add the domain `dokkit.co.za`.
3. Copy the DNS records Resend gives you.
4. Add those DNS records at the active DNS host.
5. Wait for Resend to verify the domain.
6. Use `DokKit <orders@dokkit.co.za>` only after verification succeeds.

Resend will show its required SPF, DKIM, and DMARC records under the domain's
records area. If the domain does not verify, check that the records were added
to the active DNS host and that names/values were copied exactly.

## Mailbox Setup

Resend sends transactional emails. It is not your inbox.

For receiving business email later, choose one:

- Google Workspace: best long-term option if budget allows.
- Zoho Mail: cheaper option for a small launch.
- Email forwarding: acceptable temporary option if you only need inbound mail
  to reach `dokkit.za@gmail.com`.

When a real domain mailbox exists, change:

```env
RESEND_REPLY_TO=hello@dokkit.co.za
```

Until then, keep:

```env
RESEND_REPLY_TO=dokkit.za@gmail.com
```

## Vercel Production Environment Variables

For production on `dokkit.co.za`:

```env
NEXT_PUBLIC_SITE_URL=https://dokkit.co.za

NEXT_PUBLIC_SUPABASE_URL=https://yuumdrtcemeofpqhkhhv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

PAYFAST_MERCHANT_ID=...
PAYFAST_MERCHANT_KEY=...
PAYFAST_PASSPHRASE=...
PAYFAST_PROCESS_URL=https://www.payfast.co.za/eng/process
PAYFAST_SKIP_IP_CHECK=false

RESEND_API_KEY=...
RESEND_FROM_EMAIL=DokKit <orders@dokkit.co.za>
RESEND_REPLY_TO=dokkit.za@gmail.com

DOWNLOAD_TOKEN_ENCRYPTION_KEY=...
```

For sandbox testing, keep PayFast sandbox credentials and:

```env
PAYFAST_PROCESS_URL=https://sandbox.payfast.co.za/eng/process
```

## Important Site URL Rule

`NEXT_PUBLIC_SITE_URL` controls:

- PayFast return URL
- PayFast cancel URL
- PayFast ITN notify URL
- email order links
- email secure download links

When production is live on `dokkit.co.za`, update this value in Vercel and
redeploy before doing a final payment test.

## Launch Test

After DNS, Resend, and Vercel env variables are ready:

1. Open `https://dokkit.co.za`.
2. Confirm public pages load.
3. Add a product to cart.
4. Complete PayFast payment.
5. Confirm return page shows `paid`.
6. Confirm secure downloads show the attached file.
7. Download the ZIP.
8. Confirm `email_logs` shows order confirmation and download email as `sent`.
9. Confirm the email links use `https://dokkit.co.za`, not the Vercel preview URL.

## Safe Workaround

If DNS or domain email is not ready by launch day:

- Keep production on `https://dokkit-ten.vercel.app`.
- Keep `NEXT_PUBLIC_SITE_URL=https://dokkit-ten.vercel.app`.
- Use Resend's currently approved sender for testing.
- Keep `RESEND_REPLY_TO=dokkit.za@gmail.com`.

Do not switch `NEXT_PUBLIC_SITE_URL` to `https://dokkit.co.za` until the domain
actually resolves to Vercel.

## References

- Resend domain records: https://resend.com/docs/dashboard/domains/introduction
- Resend DMARC guidance: https://resend.com/docs/dashboard/domains/dmarc
- Vercel custom domains: https://vercel.com/docs/domains/working-with-domains/add-a-domain
- Vercel DNS records: https://vercel.com/docs/domains/managing-dns-records
