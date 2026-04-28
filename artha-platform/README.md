# ARTHA

ARTHA is a sports sponsorship intelligence dashboard powered by AIS, the Artha Intelligence Service. It includes authentication, role-based access, live SVI calculations, deal CRUD, comparison charts, analytics KPIs, CSV/PDF exports, dark mode, and Supabase-ready realtime data.

## Folder Structure

```text
artha-platform/
  design/artha-dashboard-concept.png
  src/
    components/
    context/
    data/
    lib/
    styles/
  supabase/schema.sql
  .env.example
  package.json
```

## Setup

```bash
cd artha-platform
npm install
copy .env.example .env
npm run dev
```

The app works without Supabase in local demo mode, using localStorage. Add Supabase credentials to enable real Auth, database CRUD, and realtime subscriptions.

## Environment

```bash
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-public-anon-key
```

## Supabase Integration

1. Create a Supabase project.
2. Open SQL Editor and run `supabase/schema.sql`.
3. In Authentication settings, enable Email provider.
4. Copy the project URL and anon key into `.env`.
5. Restart the dev server.

The schema creates:

- `public.users`
- `public.sponsorship_deals`
- `public.analytics_data`

Row-level security is enabled. Admins and analysts can create/edit deals; only admins can delete deals; viewers can inspect and export.

## AIS Formula

AIS derives:

- `CPA = Cost / Audience`
- `CPE = Cost / Engagement`
- `MVROI = Media Value / Cost`
- `SOV = Brand Share %`
- `SVI = weighted index of reach, engagement, MVROI, exposure, SOV, and cost efficiency`

The implementation lives in `src/lib/ais.js`.

## Production Notes

- Use Supabase Auth for sessions and password handling.
- Keep service role keys out of the frontend.
- Deploy with the same Vite environment variables on your hosting provider.
- Realtime requires the publication statements at the bottom of `supabase/schema.sql`.
