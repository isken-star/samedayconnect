# Same Day Connect

UK courier quote-first MVP built with Next.js App Router, TypeScript, Tailwind, Prisma, and PostgreSQL.

## Environment

1. Copy env template:

```bash
cp .env.example .env
```

2. Set values in `.env`:

- `DATABASE_URL`: PostgreSQL connection string.
- `GOOGLE_MAPS_API_KEY`: server-side Google Maps API key (Directions + Geocoding enabled).
- `DISTANCE_PROVIDER`: currently `google`.
- `APP_BASE_URL`: absolute app URL used in magic links (e.g. `http://localhost:3000`).
- `EMAIL_PROVIDER`: `console`, `postmark`, or `sendgrid`.
- `EMAIL_FROM`: sender email for auth emails.
- `POSTMARK_SERVER_TOKEN`: required when `EMAIL_PROVIDER=postmark`.
- `SENDGRID_API_KEY`: required when `EMAIL_PROVIDER=sendgrid`.
- `STRIPE_SECRET_KEY`: required for hosted Stripe Checkout session creation.
- `STRIPE_WEBHOOK_SECRET`: required to verify Stripe webhook events.
- `STRIPE_PUBLISHABLE_KEY`: optional for future client-side Stripe work.
- `UPSTASH_REDIS_REST_URL`: optional Redis rate-limit backend URL.
- `UPSTASH_REDIS_REST_TOKEN`: optional Redis rate-limit backend token.

## Install and run

```bash
npm install
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

Open:
- `http://localhost:3000` (Home + quote-first hero)
- `http://localhost:3000/quote` (Quote form fallback page)
- `http://localhost:3000/quote/<quoteId>` (Quote results page after submit)
- `http://localhost:3000/about` (About + Meet your courier)
- `http://localhost:3000/services` (Services)
- `http://localhost:3000/contact` (Contact)
- `http://localhost:3000/courier/login` (Courier magic-link login)
- `http://localhost:3000/courier/dashboard` (Protected courier dashboard)

## Database and seed

- Prisma schema: `prisma/schema.prisma`
- Initial migration SQL: `prisma/migrations/0001_init/migration.sql`
- Seed script (creates one sample courier): `prisma/seed.ts`
- Courier placeholder images used by seed:
  - `public/couriers/placeholders/profile.svg`
  - `public/couriers/placeholders/van.svg`

## Tests

```bash
npm run test
```

Includes:
- pricing engine unit tests
- quote API route tests with mocked distance/zone services
- courier auth crypto/rate-limit tests
- courier accept-job action test

## Courier dashboard auth (magic links)

- Couriers sign in without passwords at `/courier/login`.
- Enter email and submit **Send sign-in link**.
- For local dev, the magic link is printed in terminal output by the console email provider.
- Token security:
  - single-use token rows in `MagicLinkToken`
  - 15-minute token expiry
  - token hashes only (SHA-256), no raw token storage
- Session security:
  - httpOnly cookie: `cc_courier_session`
  - 7-day rolling session refresh
  - 30-day absolute session cap

### Email provider hooks

- Provider interface: `src/lib/email/provider.ts`
- Current provider: `src/lib/email/consoleProvider.ts`
- Provider resolver: `src/lib/email/index.ts`
- Postmark adapter: `src/lib/email/postmarkProvider.ts`
- SendGrid adapter: `src/lib/email/sendgridProvider.ts`

## Stripe booking payments

- Booking flow:
  - quote result creates a `BookingDraft`
  - `/booking` collects addresses, contacts, and customer details
  - `/api/stripe/checkout` creates a hosted Stripe Checkout session for the full quoted amount
  - `/api/stripe/webhook` marks payment as successful and creates the confirmed `Booking`
- Local development webhook forwarding:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

- Copy the signing secret from the Stripe CLI output into `STRIPE_WEBHOOK_SECRET`.
- Use a test secret key in `STRIPE_SECRET_KEY` for local development.
- Checkout success returns to `/booking/success`.
- Leaving Stripe without paying returns to `/booking?checkout=cancelled`.

## Theme and UI system

- Theme context: `src/context/ThemeContext.tsx`
  - Currently runs in dark mode.
- Shared layout shell (navigation + footer): `src/components/layout/AppShell.tsx`
- Global design tokens and glassmorphism styles: `app/globals.css`
- Icons are provided by `lucide-react`.

## Congestion Charge Zone polygon

- CCZ file location: `src/lib/zones/ccz.json`
- Current file is a placeholder FeatureCollection.
- Replace `features` with the real London Congestion Charge Zone polygon/multipolygon GeoJSON.
- Zone checker implementation: `src/lib/zones/ccz.ts`

If the polygon is not configured, zone checks safely return `false`, and a postcode-prefix fallback matcher is available for MVP resilience.

## Production notes

- Do not rely on local-machine file paths for images in production.
- Courier van image is now served from `public/couriers/isken-van.png`.
- For distributed deployments, set Upstash Redis env vars so magic-link rate limiting is shared across instances.

## Railway domain setup

Use these values when connecting the live domain:

- Set `APP_BASE_URL=https://samedayconnect.co.uk`
- Add `samedayconnect.co.uk` as the main custom domain in Railway
- Add `www.samedayconnect.co.uk` if you want both root and `www`
- Point GoDaddy DNS at the Railway target records Railway provides

For future courier subdomains:

- Add a wildcard DNS record for `*.samedayconnect.co.uk`
- Point that wildcard record at Railway using the record type Railway recommends for your project
- After DNS is live, hosts like `ahmed-k.samedayconnect.co.uk` will resolve and the app will detect the courier slug from the hostname automatically

Current rollout note:

- Courier dashboard auth stays on the main app host for now
- Magic links use `APP_BASE_URL`
- Session cookies remain host-only to avoid cross-subdomain auth complexity in the first rollout

## Railway Stripe setup

When deploying the payment flow on Railway:

1. Add `STRIPE_SECRET_KEY` to the Railway service variables.
2. Add `STRIPE_WEBHOOK_SECRET` to the same service after creating the Stripe webhook endpoint.
3. Keep `APP_BASE_URL` set to your live app domain so Checkout success and cancel URLs point to the right place.
4. In Stripe Dashboard, create a webhook endpoint for:
   - `https://your-domain/api/stripe/webhook`
5. Subscribe at minimum to:
   - `checkout.session.completed`
6. Redeploy after adding the env vars so the app can create Checkout sessions and verify webhooks.

Recommended production checks:

- Run a full test booking in Stripe test mode before switching to live keys.
- Confirm the webhook creates one `Booking`, one successful `Payment`, and one linked `Job`.
- Confirm cancelling out of Checkout returns the customer to the saved booking draft without losing details.
