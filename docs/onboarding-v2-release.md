# Five question onboarding release

The founder's September 7 brief supersedes the eight-question baseline. New visitors start at `/onboarding`; `/join` reuses the configured Google and email OTP methods; `/early-read` atomically claims their saved answers. Existing completed members go to their Social Signature. The original assessment remains at `/onboarding/legacy`, protected by its existing AuthGuard; deeper Tribal Pass routes are retained.

## Deploy order

1. Apply `20260914000000_baseline_onboarding_v2.sql` to staging Supabase. No historical trait values are reset. New intent depth defaults become unknown. Drafts have seven-day capability expiry and no direct anonymous table access.
2. Configure a daily database scheduler to call `purge_onboarding_drafts()`. Rate-limit `/api/onboarding/*` and anonymous RPC traffic at the project gateway before production. No new service-role secret is required by these endpoints.
3. Deploy the web branch to a Vercel preview with the existing Supabase URL and publishable key. Allowlist its auth callback in Supabase and Google. Check the existing NEXT_PUBLIC_SITE_URL points to the desired callback origin.
4. Test actual email OTP and Google sign-in in the same browser, duplicate handle recovery, refresh/resume, and two concurrent account claims. Then apply the migration to production and release the web build. Do not release the new web routes before the migration.

## Deliberate boundaries

Drafts are bound to an HttpOnly browser cookie. For another device, return to the original browser; cross-device recovery is not claimed. Answers are saved on Continue/Back; a failed save keeps the visible answers for retry. Handles are checked atomically at claim; no misleading pre-auth availability result is shown. Local name and birth year are account details after authentication. Exact birthdates, avatar upload and optional free-text interests are deferred to profile editing.

The server records only aggregate draft-save and profile-claim events, with step and time. No identity, area, handle or answer contents enter this event table. Detailed abandonment and screen dwell instrumentation are deferred. A new AI-generated editorial friendship photograph is reused across the question pages; distinct per-question photography remains a design follow-up. The asset is `apps/web/public/onboarding-friendship-v2.png`, created with the built-in image generator. Prompt: candid unposed three adult Singaporean friends at a leafy shophouse cafe, quiet funny story, coffee and paperback, warm natural afternoon light, cinematic analogue 35mm grain, forest green and cream, portrait framing, no text, logos, interface or watermarks.

The claimed baseline writes only measured intent, conversation style (depth/banter), group preference, contact expectation, planning horizon, opening pace, geography and approved interest nodes. Activity titles do not infer novelty, extraversion, reliability or emotional capacity. Matching continues to use the existing server engine and provisional soft gates. Existing profiles are never overwritten by a draft claim.

## Rollback

Redeploy the preceding web commit. Keep the additive draft tables and private answers; do not reverse the migration by deleting member data. Expired drafts remain inaccessible until the purge removes them. The nullable intent depth is compatible with the updated adapter and does not alter historical rows.
