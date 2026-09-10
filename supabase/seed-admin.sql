-- =============================================================================
-- NOCASH Panel — first-run seed (admin + referral code)
-- =============================================================================
-- Registration requires a referral code, and referral codes are created by an
-- admin. The admin itself is NOT registered through the web form — it is
-- created directly here.
--
-- How to use:
--   1. Supabase → Authentication → Users → "Add user"
--        - enter your email + password, tick "Auto Confirm User", create.
--   2. Run the queries below in SQL Editor → New query.
-- =============================================================================

-- ── 1. Promote your account to admin ──────────────────────────────────────
-- Replace 'YOUR_EMAIL@example.com' with the email from step 1.
update public.profiles
set username = 'ADMIN', fullname = 'Admin', level = 1, saldo = 999999
where id = (select id from auth.users where email = 'YOUR_EMAIL@example.com');

-- ── 2. (Optional) Create a referral code so you can register resellers ────
-- 'nocashSTART1' is the code to type on the /register page.
-- set_saldo = starting balance granted on registration.
insert into public.referral_codes (code, set_saldo, created_by)
values ('nocashSTART1', 1000, 'ADMIN')
on conflict (code) do nothing;
