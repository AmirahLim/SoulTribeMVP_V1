'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../../lib/authContext';
import { checkUserProfileExists, getUserProfileRecord, checkHandleAvailability } from '../../../lib/supabaseAuth';
import { deriveSuggestedHandle, validateHandle, setUserProfile, getUserProfile } from '../../../lib/userStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, AlertCircle, KeyRound, CheckCircle2, Mail, Key, AtSign, Loader2, ArrowRight, UserCheck } from 'lucide-react';

function GoogleIcon() {
  return (
    <svg className="h-5 w-5 mr-3 shrink-0" viewBox="0 0 24 24">
      <path
        fill="#EA4335"
        d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.9C6.2 7.3 8.9 5 12 5z"
      />
      <path
        fill="#4285F4"
        d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
      />
      <path
        fill="#FBBC05"
        d="M5.3 14.7c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.6 7.2C.6 9.2 0 10.5 0 12s.6 2.8 1.6 4.8l3.7-2.1z"
      />
      <path
        fill="#34A853"
        d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.3-6.7-5.3L1.6 16C3.5 19.8 7.4 23 12 23z"
      />
    </svg>
  );
}

function LumaSignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams?.get('next') || searchParams?.get('redirect') || '/home';
  const initialStepParam = searchParams?.get('step');

  const {
    signInWithOtp,
    signInWithGoogle,
    signUpWithPassword,
    signInWithPassword,
    resetPasswordForEmail,
    user,
    loading: authLoading,
    isSupabaseConfigured,
  } = useAuth();

  // Mode: 'signup' (default) | 'login' | 'forgot_password' | 'choose_username'
  const [authTab, setAuthTab] = useState<'signup' | 'login'>(
    initialStepParam === 'choose_username' ? 'signup' : 'signup'
  );
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isChooseUsernameStep, setIsChooseUsernameStep] = useState(initialStepParam === 'choose_username');

  // Method toggle for Email Password vs Email OTP
  const [usePasswordMode, setUsePasswordMode] = useState(true);

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Handle (Username) Step State
  const [displayName, setDisplayName] = useState('');
  const [handle, setHandle] = useState('');
  const [handleStatus, setHandleStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid'>('idle');
  const [handleStatusMsg, setHandleStatusMsg] = useState<string | null>(null);

  // UI States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [suggestSwitchTab, setSuggestSwitchTab] = useState<'signup' | 'login' | null>(null);
  const [resetSuccessMessage, setResetSuccessMessage] = useState<string | null>(null);
  const [otpSentSuccess, setOtpSentSuccess] = useState(false);

  // Read saved profile handle on load
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedProfile = getUserProfile();
      if (savedProfile.handle) {
        setHandle(savedProfile.handle);
      }
      if (savedProfile.displayName) {
        setDisplayName(savedProfile.displayName);
      }
    }
  }, []);

  // Auto-suggest handle when email or displayName changes
  useEffect(() => {
    if (!handle && (displayName || email)) {
      const source = displayName || (email.includes('@') ? email.split('@')[0] : email);
      const suggested = deriveSuggestedHandle(source);
      if (suggested) {
        setHandle(suggested);
      }
    }
  }, [displayName, email, handle]);

  // Debounced live handle availability check (~450ms)
  useEffect(() => {
    if (!isChooseUsernameStep) return;

    const trimmed = (handle || '').trim().toLowerCase();
    if (!trimmed) {
      setHandleStatus('idle');
      setHandleStatusMsg(null);
      return;
    }

    const val = validateHandle(trimmed);
    if (!val.valid) {
      setHandleStatus('invalid');
      setHandleStatusMsg(val.error || 'Invalid username format.');
      return;
    }

    setHandleStatus('checking');
    setHandleStatusMsg('Checking availability...');

    const timer = setTimeout(async () => {
      const res = await checkHandleAvailability(trimmed, user?.id);
      if (res.available) {
        setHandleStatus('available');
        setHandleStatusMsg(`✓ @${trimmed} is available!`);
      } else {
        setHandleStatus('taken');
        setHandleStatusMsg(res.message || `@${trimmed} is already taken.`);
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [handle, isChooseUsernameStep, user?.id]);

  // Handle post-auth routing checks for logged-in session
  useEffect(() => {
    if (user && !authLoading && !isChooseUsernameStep) {
      checkUserProfileExists(user.id).then((hasProfile) => {
        if (hasProfile) {
          router.push(redirectPath);
        } else {
          // Check if handle is set in userStore
          const currentProfile = getUserProfile();
          if (currentProfile.handle && currentProfile.handle !== 'priya_sharma') {
            router.push('/onboarding');
          } else {
            // Prompt handle step
            setIsChooseUsernameStep(true);
          }
        }
      });
    }
  }, [user, authLoading, isChooseUsernameStep, redirectPath, router]);

  // Handle Google Sign-In
  const handleGoogleSignIn = async () => {
    setErrorMessage(null);
    setSuggestSwitchTab(null);
    setOtpSentSuccess(false);
    setIsSubmitting(true);

    const { error } = await signInWithGoogle(redirectPath);
    setIsSubmitting(false);

    if (error) {
      setErrorMessage(error.message || 'Google sign-in failed. Please try again.');
    }
  };

  // Handle Sign-Up or Log-In Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuggestSwitchTab(null);
    setOtpSentSuccess(false);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrorMessage('Please enter your email address.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);

    if (authTab === 'signup') {
      // SIGN UP FLOW
      if (usePasswordMode) {
        if (!password || password.length < 8) {
          setIsSubmitting(false);
          setErrorMessage('Password must be at least 8 characters long.');
          return;
        }

        const { error, user: newUser } = await signUpWithPassword(trimmedEmail, password);
        setIsSubmitting(false);

        if (error) {
          const msg = error.message || '';
          if (msg.includes('already registered') || msg.includes('email_exists') || msg.includes('duplicate')) {
            setErrorMessage('That email already has an account.');
            setSuggestSwitchTab('login');
          } else {
            setErrorMessage(msg || 'Sign-up failed. Please try again.');
          }
          return;
        }

        if (newUser) {
          setIsChooseUsernameStep(true);
        }
      } else {
        // Email OTP mode
        const { error } = await signInWithOtp(trimmedEmail, redirectPath);
        setIsSubmitting(false);

        if (error) {
          setErrorMessage(error.message || 'Unable to send Email OTP link right now.');
          return;
        }

        setOtpSentSuccess(true);
      }
    } else {
      // LOG IN FLOW
      if (usePasswordMode) {
        if (!password) {
          setIsSubmitting(false);
          setErrorMessage('Please enter your password.');
          return;
        }

        const { error, user: loggedInUser } = await signInWithPassword(trimmedEmail, password);
        setIsSubmitting(false);

        if (error) {
          const msg = error.message || '';
          if (msg.includes('Invalid login credentials') || msg.includes('User not found')) {
            setErrorMessage('No account found with this email, or invalid password.');
            setSuggestSwitchTab('signup');
          } else {
            setErrorMessage(msg || 'Log-in failed. Please check your credentials.');
          }
          return;
        }

        if (loggedInUser) {
          const profileRec = await getUserProfileRecord(loggedInUser.id);
          if (profileRec?.hasProfile) {
            router.push(redirectPath);
          } else {
            const currentProfile = getUserProfile();
            if (currentProfile.handle && currentProfile.handle !== 'priya_sharma') {
              router.push('/onboarding');
            } else {
              setIsChooseUsernameStep(true);
            }
          }
        }
      } else {
        // Email OTP mode
        const { error } = await signInWithOtp(trimmedEmail, redirectPath);
        setIsSubmitting(false);

        if (error) {
          setErrorMessage(error.message || 'Unable to send Email OTP link right now.');
          return;
        }

        setOtpSentSuccess(true);
      }
    }
  };

  // Handle Username Completion Step
  const handleSaveUsernameStep = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanHandle = handle.trim().toLowerCase();
    const val = validateHandle(cleanHandle);

    if (!val.valid) {
      setHandleStatus('invalid');
      setHandleStatusMsg(val.error || 'Please enter a valid username.');
      return;
    }

    if (handleStatus === 'taken') {
      return;
    }

    // Save chosen handle to userStore & localStorage
    const derivedName = displayName.trim() || email.split('@')[0] || 'Member';
    setUserProfile({
      handle: cleanHandle,
      displayName: derivedName,
    });

    if (typeof window !== 'undefined') {
      localStorage.setItem('soul_tribe_handle', cleanHandle);
    }

    router.push('/onboarding');
  };

  // Handle Password Reset
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setResetSuccessMessage(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrorMessage('Please enter your email address.');
      return;
    }

    setIsSubmitting(true);
    const { error } = await resetPasswordForEmail(trimmedEmail);
    setIsSubmitting(false);

    if (error) {
      setErrorMessage(error.message || 'Failed to send password reset email.');
      return;
    }

    setResetSuccessMessage('Password reset link sent! Please check your email inbox.');
  };

  return (
    <div className="relative z-10 w-full max-w-[420px]">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[32px] border border-white/15 bg-[#09090b]/90 p-8 backdrop-blur-2xl shadow-2xl text-white"
      >
        <AnimatePresence mode="wait">
          {/* STEP 2B: CHOOSE YOUR USERNAME STEP */}
          {isChooseUsernameStep ? (
            <motion.div
              key="choose-username-step"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
            >
              <div className="flex justify-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-[#18181b] text-emerald-400 shadow-inner">
                  <AtSign className="h-6 w-6" />
                </div>
              </div>

              <div className="mt-5 text-center">
                <h1 className="text-[26px] font-extrabold tracking-tight text-white">
                  Choose your username
                </h1>
                <p className="mt-1.5 text-[14px] text-white/70">
                  Your unique handle on Soul Tribe. People will recognize you by this.
                </p>
              </div>

              <form onSubmit={handleSaveUsernameStep} className="mt-6 space-y-4">
                {/* Display Name Input */}
                <div>
                  <label htmlFor="username-display-name" className="block text-[13.5px] font-semibold text-white mb-2">
                    Display Name
                  </label>
                  <input
                    id="username-display-name"
                    type="text"
                    required
                    placeholder="e.g. Priya Sharma"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="h-12 w-full rounded-[16px] border border-[#27272a] bg-black/60 px-4 text-[14px] text-white placeholder-white/40 outline-none focus:border-white/60 focus:ring-1 focus:ring-white/60 transition-all"
                  />
                </div>

                {/* Handle Input */}
                <div>
                  <label htmlFor="username-handle-input" className="block text-[13.5px] font-semibold text-white mb-2">
                    Username (Handle) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-3.5 text-[14px] font-bold text-white/50">@</span>
                    <input
                      id="username-handle-input"
                      type="text"
                      required
                      placeholder="priya_sharma"
                      value={handle}
                      onChange={(e) => setHandle(e.target.value.toLowerCase().replace(/\s+/g, '_'))}
                      className="h-12 w-full rounded-[16px] border border-[#27272a] bg-black/60 pl-9 pr-4 text-[14px] font-mono text-white placeholder-white/40 outline-none focus:border-white/60 focus:ring-1 focus:ring-white/60 transition-all"
                    />
                  </div>
                  <p className="mt-1.5 text-[11.5px] text-white/50">
                    3–20 characters: lowercase letters, numbers, and underscores. Must match <code className="text-amber-300/90 font-mono">^[a-z0-9_]&#123;3,20&#125;$</code>.
                  </p>
                </div>

                {/* Live Availability Status */}
                {handleStatusMsg && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`rounded-[14px] border p-3.5 text-[13px] flex items-center gap-2.5 ${
                      handleStatus === 'checking'
                        ? 'border-amber-400/40 bg-amber-500/10 text-amber-200'
                        : handleStatus === 'available'
                        ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-200 font-semibold'
                        : 'border-rose-500/40 bg-rose-500/15 text-rose-200'
                    }`}
                  >
                    {handleStatus === 'checking' && <Loader2 className="h-4 w-4 animate-spin shrink-0 text-amber-300" />}
                    {handleStatus === 'available' && <UserCheck className="h-4 w-4 shrink-0 text-emerald-300" />}
                    {handleStatus === 'taken' && <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />}
                    {handleStatus === 'invalid' && <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />}
                    <span>{handleStatusMsg}</span>
                  </motion.div>
                )}

                <button
                  type="submit"
                  disabled={handleStatus !== 'available'}
                  className="h-12 w-full rounded-[16px] bg-[#FDFBF7] hover:bg-white active:scale-[0.99] text-black font-extrabold text-[15px] transition-all shadow-lg flex items-center justify-center gap-2 mt-4 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue to Onboarding →
                </button>
              </form>
            </motion.div>
          ) : isForgotPassword ? (
            /* FORGOT PASSWORD VIEW */
            <motion.div
              key="forgot-password-view"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
            >
              <div className="flex justify-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-[#18181b] text-amber-300 shadow-inner">
                  <KeyRound className="h-6 w-6" />
                </div>
              </div>

              <div className="mt-5 text-center">
                <h2 className="text-[24px] font-extrabold tracking-tight text-white">
                  Reset Your Password
                </h2>
                <p className="mt-1.5 text-[13.5px] text-white/70">
                  Enter your email address and we'll send you a password reset link.
                </p>
              </div>

              <form onSubmit={handleResetPassword} className="mt-6 space-y-4">
                <div>
                  <label htmlFor="reset-email-input" className="block text-[13.5px] font-semibold text-white mb-2">
                    Email Address
                  </label>
                  <input
                    id="reset-email-input"
                    type="email"
                    required
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 w-full rounded-[16px] border border-[#27272a] bg-black/60 px-4 text-[14px] text-white placeholder-white/40 outline-none focus:border-white/60 focus:ring-1 focus:ring-white/60 transition-all"
                  />
                </div>

                {errorMessage && (
                  <div className="rounded-[14px] border border-rose-500/40 bg-rose-500/15 p-3.5 text-[13px] text-rose-200 flex items-start gap-2.5">
                    <AlertCircle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {resetSuccessMessage && (
                  <div className="rounded-[14px] border border-emerald-500/40 bg-emerald-500/15 p-3.5 text-[13px] text-emerald-200 flex items-start gap-2.5">
                    <CheckCircle2 className="h-5 w-5 text-emerald-300 shrink-0 mt-0.5" />
                    <span>{resetSuccessMessage}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-12 w-full rounded-[16px] bg-[#FDFBF7] hover:bg-white active:scale-[0.99] text-black font-extrabold text-[15px] transition-all shadow-lg flex items-center justify-center cursor-pointer mt-3"
                >
                  {isSubmitting ? 'Sending Reset Link...' : 'Send Reset Link →'}
                </button>
              </form>

              <div className="mt-5 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotPassword(false);
                    setErrorMessage(null);
                    setResetSuccessMessage(null);
                  }}
                  className="text-[13px] font-medium text-white/70 hover:text-white underline underline-offset-4 transition-all cursor-pointer"
                >
                  ← Back to sign in
                </button>
              </div>
            </motion.div>
          ) : (
            /* MAIN SIGN-UP VS LOG-IN VIEW */
            <motion.div
              key="auth-main-view"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
            >
              {/* Top Mode Selector Tabs: Sign up (default) vs Log in */}
              <div className="flex rounded-[20px] border border-[#27272a] bg-black/60 p-1.5 mb-6">
                <button
                  type="button"
                  onClick={() => {
                    setAuthTab('signup');
                    setErrorMessage(null);
                    setSuggestSwitchTab(null);
                  }}
                  className={`flex-1 rounded-[14px] py-2.5 text-[14px] font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    authTab === 'signup'
                      ? 'bg-white text-black shadow-md'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  Sign Up
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthTab('login');
                    setErrorMessage(null);
                    setSuggestSwitchTab(null);
                  }}
                  className={`flex-1 rounded-[14px] py-2.5 text-[14px] font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    authTab === 'login'
                      ? 'bg-white text-black shadow-md'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  Log In
                </button>
              </div>

              {/* Title & Subtitle */}
              <div className="text-center">
                <h1 className="text-[24px] font-extrabold tracking-tight text-white">
                  {authTab === 'signup' ? 'Create your Soul Tribe account' : 'Welcome back to Soul Tribe'}
                </h1>
                <p className="mt-1 text-[13.5px] text-white/70">
                  {authTab === 'signup'
                    ? 'Sign up to connect with your tribe in Singapore.'
                    : 'Log in to view your outings and matches.'}
                </p>
              </div>

              {!isSupabaseConfigured && (
                <div className="mt-4 rounded-[16px] border border-amber-400/40 bg-amber-500/10 p-3.5 text-[12.5px] text-amber-200">
                  <p className="font-semibold text-amber-300">Environment Configuration Required</p>
                  <p className="mt-0.5 text-amber-200/90 leading-relaxed">
                    Set <code className="text-amber-100 font-mono">NEXT_PUBLIC_SUPABASE_URL</code> & <code className="text-amber-100 font-mono">NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code>.
                  </p>
                </div>
              )}

              {/* Google OAuth Button (At top of both modes) */}
              <div className="mt-5">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isSubmitting}
                  className="flex h-12 w-full items-center justify-center rounded-[16px] border border-white/20 bg-[#18181b] hover:bg-[#27272a] active:scale-[0.99] text-[14.5px] font-bold text-white shadow-sm transition-all cursor-pointer"
                >
                  <GoogleIcon />
                  Continue with Google
                </button>
              </div>

              {/* Divider */}
              <div className="my-5 flex items-center gap-4">
                <div className="h-[1px] flex-1 bg-white/15" />
                <span className="text-[11px] font-bold tracking-widest text-white/40 uppercase">OR</span>
                <div className="h-[1px] flex-1 bg-white/15" />
              </div>

              {/* Sub-method Selector: Password vs Email OTP */}
              <div className="flex rounded-[14px] border border-[#27272a] bg-black/40 p-1">
                <button
                  type="button"
                  onClick={() => {
                    setUsePasswordMode(true);
                    setErrorMessage(null);
                    setSuggestSwitchTab(null);
                  }}
                  className={`flex-1 rounded-[10px] py-1.5 text-[12.5px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    usePasswordMode
                      ? 'bg-white/15 text-white shadow-sm border border-white/20'
                      : 'text-white/50 hover:text-white'
                  }`}
                >
                  <Key className="h-3.5 w-3.5" /> Password
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setUsePasswordMode(false);
                    setErrorMessage(null);
                    setSuggestSwitchTab(null);
                  }}
                  className={`flex-1 rounded-[10px] py-1.5 text-[12.5px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    !usePasswordMode
                      ? 'bg-white/15 text-white shadow-sm border border-white/20'
                      : 'text-white/50 hover:text-white'
                  }`}
                >
                  <Mail className="h-3.5 w-3.5" /> Email OTP
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
                <div>
                  <label htmlFor="auth-email-input" className="block text-[13px] font-semibold text-white mb-1.5">
                    Email Address
                  </label>
                  <input
                    id="auth-email-input"
                    type="email"
                    required
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 w-full rounded-[16px] border border-[#27272a] bg-black/60 px-4 text-[14px] text-white placeholder-white/40 outline-none focus:border-white/60 focus:ring-1 focus:ring-white/60 transition-all"
                  />
                </div>

                {/* Password Input */}
                {usePasswordMode && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-1.5"
                  >
                    <label htmlFor="auth-password-input" className="block text-[13px] font-semibold text-white">
                      Password
                    </label>
                    <input
                      id="auth-password-input"
                      type="password"
                      required
                      minLength={8}
                      placeholder={authTab === 'signup' ? 'Create a password (min 8 chars)' : 'Enter your password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-12 w-full rounded-[16px] border border-[#27272a] bg-black/60 px-4 text-[14px] text-white placeholder-white/40 outline-none focus:border-white/60 focus:ring-1 focus:ring-white/60 transition-all"
                    />

                    {authTab === 'login' && (
                      <div className="flex justify-end pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setIsForgotPassword(true);
                            setErrorMessage(null);
                          }}
                          className="text-[12px] font-medium text-white/60 hover:text-white underline underline-offset-4 transition-all cursor-pointer"
                        >
                          Forgot password?
                        </button>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Clear Error Banner with One-Click Mode Switching */}
                {errorMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-[16px] border border-rose-500/40 bg-rose-500/15 p-4 text-[13px] text-rose-200 flex flex-col gap-2.5"
                  >
                    <div className="flex items-start gap-2.5">
                      <AlertCircle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
                      <span className="leading-relaxed font-medium">{errorMessage}</span>
                    </div>

                    {suggestSwitchTab && (
                      <button
                        type="button"
                        onClick={() => {
                          setAuthTab(suggestSwitchTab);
                          setErrorMessage(null);
                          setSuggestSwitchTab(null);
                        }}
                        className="mt-1 flex items-center justify-center gap-2 rounded-[12px] border border-white/20 bg-white/10 py-2 px-3 text-[13px] font-bold text-white hover:bg-white/20 transition-all cursor-pointer"
                      >
                        {suggestSwitchTab === 'login'
                          ? 'Switch to Log in with this email →'
                          : 'Switch to Sign up with this email →'}
                      </button>
                    )}
                  </motion.div>
                )}

                {otpSentSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-[16px] border border-emerald-500/40 bg-emerald-500/15 p-4 text-[13px] text-emerald-200 flex items-start gap-2.5"
                  >
                    <CheckCircle2 className="h-5 w-5 text-emerald-300 shrink-0 mt-0.5" />
                    <span>Email OTP link sent! Check your inbox to complete sign-in.</span>
                  </motion.div>
                )}

                {/* Primary Action Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-12 w-full rounded-[16px] bg-[#FDFBF7] hover:bg-white active:scale-[0.99] text-black font-extrabold text-[15px] transition-all shadow-lg flex items-center justify-center gap-2 mt-4 cursor-pointer"
                >
                  {isSubmitting
                    ? 'Processing...'
                    : !usePasswordMode
                    ? 'Send Email OTP →'
                    : authTab === 'signup'
                    ? 'Create Account →'
                    : 'Log In →'}
                </button>
              </form>

              {/* Mode Toggle Footer Link */}
              <div className="mt-5 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setAuthTab(authTab === 'signup' ? 'login' : 'signup');
                    setErrorMessage(null);
                    setSuggestSwitchTab(null);
                  }}
                  className="text-[13px] font-medium text-white/70 hover:text-white underline underline-offset-4 transition-all cursor-pointer"
                >
                  {authTab === 'signup'
                    ? 'Already have an account? Log in'
                    : "Don't have an account yet? Sign up"}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center bg-black p-4 text-white">
      {/* Background ambient canvas photo */}
      <img
        src="/user-onboarding-bg.jpg"
        alt="Background"
        className="fixed inset-0 h-full w-full object-cover opacity-50 z-0"
      />
      <div className="fixed inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/95 z-0 pointer-events-none" />

      <React.Suspense
        fallback={
          <div className="relative z-10 flex flex-col items-center justify-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
            <p className="text-[13px] text-white/70">Loading sign in...</p>
          </div>
        }
      >
        <LumaSignInForm />
      </React.Suspense>
    </div>
  );
}
