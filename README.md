# NOCASH Panel

A license-key management panel rebuilt on a modern, production-ready stack:

- **Frontend:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS v4
- **Backend / database:** Supabase (PostgreSQL + Auth + Row Level Security)
- **Hosting:** Vercel (free tier)

It replaces the original CodeIgniter 4 application (archived in [`legacy/`](legacy/)) with
the same functionality: referral-gated registration, key generation & management,
admin user management, server settings, and the client-facing licensing endpoint.

---

## Features

- Email + password authentication (Supabase Auth), with referral-code-gated registration
- Dashboard with live stats and recent activity
- Key generation (bulk or custom), search / filter / sort / paginate, edit, delete,
  and one-click download of keys
- Admin: user management, referral code management, server settings
- `/api/connect` licensing endpoint — validates keys, binds device serials,
  returns an activation token and mod metadata
- Responsive UI with light/dark theme, clean typography (Inter), and Lucide icons

---

## 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a free project.
2. Open **SQL Editor → New query**, paste the entire contents of
   [`supabase/schema.sql`](supabase/schema.sql), and run it.
3. Create your first admin account:
   - **Authentication → Users → Add user** (enter an email + password, enable
     "Auto Confirm User").
   - In the SQL editor, promote that user to admin:
     ```sql
     update public.profiles
     set username = 'ADMIN', level = 1, saldo = 999999
     where id = (select id from auth.users where email = 'you@example.com');
     ```
4. Grab your API keys from **Project Settings → API**:
   - Project URL
   - `anon` public key
   - `service_role` key (keep this secret)

> After setup, log in as the admin and create referral codes from
> **Admin → Referrals** so resellers can register.

---

## 2. Configure environment variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR-ANON-PUBLIC-KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR-SERVICE-ROLE-KEY
STATIC_WORDS=change-me-to-a-long-random-string
```

`SUPABASE_SERVICE_ROLE_KEY` and `STATIC_WORDS` are server-only secrets — never expose
them in client code.

---

## 3. Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Production build:

```bash
npm run build
npm start
```

---

## 4. Deploy to Vercel (free tier)

This project is pre-configured for Vercel (`vercel.json`, Next.js framework preset,
Node 20+ pinned via `engines` and `.nvmrc`).

1. Push this repository to GitHub:
   ```bash
   git add -A && git commit -m "Ready for Vercel" && git push
   ```
2. In [vercel.com](https://vercel.com), **Add New → Project** and import the repo.
   Vercel auto-detects Next.js — leave the build settings as default.
3. Add the environment variables as **encrypted secrets**:
   - **Project → Settings → Environment Variables** → add each of the four values
     from `.env.example`.
   - `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are *public*
     (they are embedded in the browser bundle — that is expected and safe, because
     Supabase Row Level Security protects your data).
   - `SUPABASE_SERVICE_ROLE_KEY` and `STATIC_WORDS` are *secret* — they are used
     **only** in server-side code and are never sent to the browser. Do **not**
     prefix them with `NEXT_PUBLIC_`.
   - Apply the variables to **Production** and **Preview** environments, then
     redeploy (Vercel does not propagate new variables to existing deployments
     automatically).
4. Deploy. Your app is live at `https://<project>.vercel.app`.

### Security notes

- The service-role key bypasses Row Level Security and is required only for
  registration (creating users) and the `/api/connect` endpoint. It never leaves
  the server.
- Set `STATIC_WORDS` to a long random value (`openssl rand -hex 32`) so activation
  tokens can't be forged.

---

## Licensing endpoint (`/api/connect`)

The cheat/launcher client authenticates against this endpoint.

**Request** (JSON or form-encoded):

```json
{
  "game": "PUBG",
  "user_key": "24xADMINxAb3k9",
  "serial": "DEVICE-SERIAL"
}
```

**Success:**

```json
{
  "ok": true,
  "token": "…",
  "modname": "NOCASH KURO PANEL",
  "telegram": "@NOCASH_xD",
  "floating_text": "@NOCASH_xD",
  "floating_status": "Safe",
  "expiry": "2026-09-11T12:00:00.000Z",
  "rng": 1757500000000
}
```

**Errors** return `{ "ok": false, "error": "key_not_found" | "key_inactive" | "key_expired" | "device_limit" | "maintenance" | "missing_fields" }`.

---

## Project structure

```
src/
  app/
    (dashboard)/        # authenticated area (dashboard, keys, admin, settings)
    login/ register/    # auth pages
    api/connect/        # licensing endpoint
  components/           # UI + feature components
  lib/
    actions/            # server actions (business logic)
    supabase/           # browser / server / admin clients
    config.ts           # games, durations, pricing
    settings.ts         # server settings helpers
    types.ts utils.ts
supabase/schema.sql     # database schema + RLS policies
```
