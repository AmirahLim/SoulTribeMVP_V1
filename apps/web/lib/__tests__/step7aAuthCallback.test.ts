import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';

const ROOT = resolve(__dirname, '../..');
const CALLBACK_PAGE_PATH = resolve(ROOT, 'app/auth/callback/page.tsx');
const CALLBACK_ROUTE_PATH = resolve(ROOT, 'app/auth/callback/route.ts');
const MIDDLEWARE_PATH = resolve(ROOT, 'middleware.ts');
const ROOT_PAGE_PATH = resolve(ROOT, 'app/page.tsx');
const SIGNIN_PAGE_PATH = resolve(ROOT, 'app/auth/signin/page.tsx');

describe('Step 7a — Auth Callback, Middleware, Intro Redirect, OTP Code', () => {
  it('1. callback/page.tsx does NOT exist; route.ts DOES exist', () => {
    expect(existsSync(CALLBACK_PAGE_PATH)).toBe(false);
    expect(existsSync(CALLBACK_ROUTE_PATH)).toBe(true);
  });

  it('2. callback/route.ts calls exchangeCodeForSession', () => {
    const source = readFileSync(CALLBACK_ROUTE_PATH, 'utf-8');
    expect(source).toContain('exchangeCodeForSession');
    // Confirm it's a route handler
    expect(source).toContain('export async function GET');
  });

  it('3. callback/route.ts redirects to /auth/signin?error on exchange failure', () => {
    const source = readFileSync(CALLBACK_ROUTE_PATH, 'utf-8');
    expect(source).toContain('exchange_failed');
    expect(source).toContain('/auth/signin');
  });

  it('4. callback/route.ts redirects to /auth/signin when no code param', () => {
    const source = readFileSync(CALLBACK_ROUTE_PATH, 'utf-8');
    // Should handle missing code before trying to exchange
    expect(source).toContain("if (!code)");
    expect(source).toContain('/auth/signin');
  });

  it('5. middleware.ts exists and exports a config with matcher', () => {
    expect(existsSync(MIDDLEWARE_PATH)).toBe(true);
    const source = readFileSync(MIDDLEWARE_PATH, 'utf-8');
    expect(source).toContain('export const config');
    expect(source).toContain('matcher');
    // Must call getUser for session refresh
    expect(source).toContain('getUser');
  });

  it('6. root page.tsx checks session and redirects to /home', () => {
    const source = readFileSync(ROOT_PAGE_PATH, 'utf-8');
    // Should NOT have 'use client' — it's a server component now
    expect(source).not.toContain("'use client'");
    // Must check session via getUser
    expect(source).toContain('getUser');
    // Must redirect signed-in users
    expect(source).toContain("redirect('/home')");
  });

  it('7. sign-in page catches getUserProfileRecord errors and has verifyOtp', () => {
    const source = readFileSync(SIGNIN_PAGE_PATH, 'utf-8');
    // Must have .catch on getUserProfileRecord
    expect(source).toContain('.catch');
    expect(source).toContain('getUserProfileRecord');
    // Must use verifyOtp for OTP code verification
    expect(source).toContain('verifyOtp');
    // Must read error query param from URL
    expect(source).toContain('exchange_failed');
  });
});
