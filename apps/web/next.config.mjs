/**
 * Soul Tribe MVP — next.config.mjs (hardened)
 * Replaces apps/web/next.config.mjs
 *
 * What changed vs. your current file:
 *  - Added security headers (clickjacking protection, HTTPS enforcement, etc.)
 *  - Kept your existing settings so your current deploy keeps working.
 *  - Added TODO notes for the two build checks you'll want to turn back on.
 */

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@soul-tribe/ui', '@soul-tribe/tokens', '@soul-tribe/core'],

  // TODO (do this once the backend work settles): delete these two blocks so
  // real TypeScript/lint errors can't ship silently. If a deploy then fails,
  // read the error, fix it, and try again — don't just turn this back on.
  typescript: { ignoreBuildErrors: true },

  images: {
    unoptimized: true,
    // When you re-enable optimization (remove unoptimized above), this allowlist
    // lets Next load your remote images (e.g. Unsplash) safely:
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          // Stop your site being embedded in someone else's page (clickjacking).
          { key: 'X-Frame-Options', value: 'DENY' },
          // Force HTTPS for 2 years (Vercel already serves HTTPS; this enforces it).
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          // Stop the browser guessing/"sniffing" file types.
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // Don't leak full URLs to other sites in the Referer header.
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // Turn off browser features you don't use.
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()' },

          // ---- Content-Security-Policy (OPTIONAL, powerful, can break things) ----
          // CSP is the strongest XSS defense but often needs tuning per app.
          // Leave it commented until you can test the app after adding it, then
          // watch the browser console for "blocked by CSP" messages and adjust.
          // {
          //   key: 'Content-Security-Policy',
          //   value: [
          //     "default-src 'self'",
          //     "img-src 'self' data: https://images.unsplash.com",
          //     "style-src 'self' 'unsafe-inline'",
          //     "script-src 'self'",
          //     "connect-src 'self' https://*.supabase.co",  // add this once Supabase is wired in
          //     "frame-ancestors 'none'",
          //   ].join('; '),
          // },
        ],
      },
    ];
  },
};

export default nextConfig;
