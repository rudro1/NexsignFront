import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { api } from '@/api/apiClient';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Input }  from '@/components/ui/input';
import { Label }  from '@/components/ui/label';
import { toast }  from 'sonner';
import {
  LogIn, Loader2, Eye, EyeOff,
  Mail, Lock, AlertCircle, CheckCircle2,
} from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';

// ── Validation ───────────────────────────────────────────────────
const validateEmail    = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim());
const validatePassword = (p) => p.length >= 6;

// ── Role redirect ────────────────────────────────────────────────
const getRoleRedirect = (role) =>
  role === 'admin' || role === 'super_admin' ? '/admin' : '/dashboard';

export default function Login({ toggle }) {
  const navigate       = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, googleLogin, resetPassword, user } = useAuth();

  const [formData,      setFormData]      = useState({ email: '', password: '' });
  const [errors,        setErrors]        = useState({});
  const [showPw,        setShowPw]        = useState(false);
  const [loading,       setLoading]       = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [resetSent,     setResetSent]     = useState(false);

  // ── Redirect if already logged in ────────────────────────────
  useEffect(() => {
    if (user) navigate(getRoleRedirect(user.role), { replace: true });
  }, [user, navigate]);

  // ── URL param messages ────────────────────────────────────────
  useEffect(() => {
    if (searchParams.get('expired')  === 'true')
      toast.error('Session expired. Please sign in again.');
    if (searchParams.get('verified') === 'true')
      toast.success('Email verified! You can now sign in.');
    if (searchParams.get('reset')    === 'true')
      toast.success('Password reset! Please sign in with your new password.');
  }, [searchParams]);

  // ── Input handler ─────────────────────────────────────────────
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  }, [errors]);

  // ── Validate ──────────────────────────────────────────────────
  const validate = useCallback(() => {
    const errs = {};
    if (!validateEmail(formData.email))
      errs.email = 'Please enter a valid email.';
    if (!validatePassword(formData.password))
      errs.password = 'Password must be at least 6 characters.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }, [formData]);

  // ── Email/Password Login ──────────────────────────────────────
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    const email    = formData.email.toLowerCase().trim();
    const password = formData.password;

    try {
      const res = await api.post('/auth/login', { email, password });

      // ✅ Handle both response shapes
      const token    = res.data?.token;
      const userData = res.data?.user;

      if (token && userData) {
        login(userData, token);
        toast.success('Welcome back! 👋');
        navigate(getRoleRedirect(userData?.role), { replace: true });
      }
    } catch (err) {
      const status = err.status || err.response?.status;
      const code   = err.data?.code || err.response?.data?.code;

      // ── 401 → try Firebase fallback ────────────────────────
      if (status === 401) {
        try {
          const { signInWithEmailAndPassword } = await import('firebase/auth');
          const { auth } = await import('@/firebase.config.js');

          const fbResult = await signInWithEmailAndPassword(auth, email, password);

          if (fbResult?.user) {
            const syncRes = await api.post('/auth/sync-password', { email, password });
            const token    = syncRes.data?.token;
            const userData = syncRes.data?.user;

            if (token && userData) {
              login(userData, token);
              toast.success('Signed in successfully!');
              navigate(getRoleRedirect(userData?.role), { replace: true });
              return;
            }
          }
        } catch {
          // Firebase also failed — fall through
        }

        if (code === 'GOOGLE_ONLY') {
          toast.error('This account uses Google sign-in. Please use Google login.');
        } else {
          toast.error('Invalid email or password.');
        }

      } else if (status === 403) {
        toast.error('Account disabled. Contact support.');
      } else if (err.__network || err.__offline) {
        toast.error('No internet connection.');
      } else {
        toast.error(err.message || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, [formData, login, navigate, validate]);

  // ── Google Login — FIXED ──────────────────────────────────────
  const handleGoogleLogin = useCallback(async () => {
    setGoogleLoading(true);
    try {
      // ✅ Step 1: Firebase popup
      const result = await googleLogin();
      if (!result) return; // cancelled or redirect mode

      // ✅ Step 2: Extract user info safely
      const firebaseUser = result?.user ?? result;

      const email    = firebaseUser?.email;
      const name     = firebaseUser?.displayName
                       || email?.split('@')[0]
                       || 'User';
      const photoURL = firebaseUser?.photoURL || '';

      if (!email) {
        toast.error('Could not get email from Google. Please try again.');
        return;
      }

      console.log('[Google Login] Sending to backend:', { name, email });

      // ✅ Step 3: Backend call
      const res = await api.post('/auth/google', {
        name,
        email,
        photoURL,
      });

      // ✅ Step 4: Handle response
      const token    = res.data?.token;
      const userData = res.data?.user;

      if (token && userData) {
        login(userData, token);
        toast.success('Google login successful! 🎉');
        navigate(getRoleRedirect(userData?.role), { replace: true });
      } else {
        toast.error('Login failed. Invalid server response.');
      }

    } catch (err) {
      // ── Silently ignore user-cancelled popup ───────────────
      if (err?.__cancelled) return;

      console.error('[Google Login] Error:', err);
      console.error('[Google Login] Response data:', err?.response?.data);

      const status = err?.status || err?.response?.status;
      const msg    = err?.response?.data?.message || err?.message || '';
      const code   = err?.response?.data?.code;

      if (status === 400) {
        toast.error(`Google login failed: ${msg}`);
      } else if (status === 403) {
        toast.error('Account disabled. Contact support.');
      } else if (err?.__network || err?.__offline) {
        toast.error('No internet connection.');
      } else if (code === 'RATE_LIMITED') {
        toast.error('Too many attempts. Please wait a moment.');
      } else {
        toast.error('Google login failed. Please try again.');
      }
    } finally {
      setGoogleLoading(false);
    }
  }, [googleLogin, login, navigate]);

  // ── Forgot Password ───────────────────────────────────────────
  const handleForgotPassword = useCallback(async () => {
    if (!formData.email) {
      setErrors(prev => ({ ...prev, email: 'Enter your email first.' }));
      return;
    }
    if (!validateEmail(formData.email)) {
      setErrors(prev => ({ ...prev, email: 'Enter a valid email.' }));
      return;
    }
    setLoading(true);
    try {
      await resetPassword(formData.email.toLowerCase().trim());
      setResetSent(true);
    } catch {
      // Toast handled in AuthContext
    } finally {
      setLoading(false);
    }
  }, [formData.email, resetPassword]);

  const isFormLoading = loading || googleLoading;

  // ── Reset Sent Screen ─────────────────────────────────────────
  if (resetSent) {
    return (
      <div className="w-full h-full p-8 flex flex-col
                      justify-center items-center
                      bg-white dark:bg-slate-900">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 bg-green-50 dark:bg-green-900/20
                          rounded-2xl flex items-center justify-center
                          mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900
                         dark:text-white mb-2">
            Check Your Email
          </h2>
          <p className="text-slate-500 text-sm mb-6">
            Reset link sent to{' '}
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {formData.email}
            </span>
          </p>
          <Button
            onClick={() => setResetSent(false)}
            className="w-full h-10 bg-sky-500 hover:bg-sky-600
                       text-white rounded-xl"
          >
            Back to Sign In
          </Button>
        </div>
      </div>
    );
  }

  // ── Main Form ─────────────────────────────────────────────────
  return (
    <div className="w-full h-full p-6 sm:p-8 flex flex-col
                    justify-center bg-white dark:bg-slate-900">

      {/* Header */}
      <div className="text-center mb-6">
        <Link to="/">
          <div className="w-12 h-12 bg-sky-50 dark:bg-sky-900/20
                          rounded-2xl flex items-center justify-center
                          mx-auto mb-3 hover:scale-105
                          transition-transform cursor-pointer">
            <LogIn className="h-5 w-5 text-sky-500" />
          </div>
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Welcome Back
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Sign in to your NexSign account
        </p>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="space-y-4 max-w-sm mx-auto w-full"
        noValidate
      >
        {/* Email */}
        <div className="space-y-1.5">
          <Label
            htmlFor="login-email"
            className="text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            Email Address
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2
                             w-4 h-4 text-slate-400 pointer-events-none" />
            <Input
              id="login-email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="name@example.com"
              autoComplete="email"
              disabled={isFormLoading}
              className={`h-11 pl-10 rounded-xl border transition-colors
                ${errors.email
                  ? 'border-red-400 focus:ring-red-400'
                  : 'border-slate-200 dark:border-slate-700'
                }`}
            />
          </div>
          {errors.email && (
            <p className="flex items-center gap-1.5 text-xs text-red-500">
              <AlertCircle className="w-3 h-3 shrink-0" />
              {errors.email}
            </p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <Label
              htmlFor="login-password"
              className="text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Password
            </Label>
            <button
              type="button"
              onClick={handleForgotPassword}
              disabled={isFormLoading}
              className="text-xs text-sky-500 hover:text-sky-600
                         font-medium hover:underline transition-colors
                         disabled:opacity-50"
            >
              Forgot password?
            </button>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2
                             w-4 h-4 text-slate-400 pointer-events-none" />
            <Input
              id="login-password"
              name="password"
              type={showPw ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              autoComplete="current-password"
              disabled={isFormLoading}
              className={`h-11 pl-10 pr-10 rounded-xl border transition-colors
                ${errors.password
                  ? 'border-red-400 focus:ring-red-400'
                  : 'border-slate-200 dark:border-slate-700'
                }`}
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPw(p => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2
                         text-slate-400 hover:text-slate-600 transition-colors"
            >
              {showPw
                ? <EyeOff className="w-4 h-4" />
                : <Eye    className="w-4 h-4" />
              }
            </button>
          </div>
          {errors.password && (
            <p className="flex items-center gap-1.5 text-xs text-red-500">
              <AlertCircle className="w-3 h-3 shrink-0" />
              {errors.password}
            </p>
          )}
        </div>

        {/* Submit */}
        <Button
          type="submit"
          disabled={isFormLoading}
          className="w-full h-11 bg-sky-500 hover:bg-sky-600
                     active:bg-sky-700 text-white rounded-xl
                     font-semibold shadow-lg shadow-sky-500/25
                     transition-all active:scale-[0.98] disabled:opacity-70"
        >
          {loading
            ? <Loader2 className="w-5 h-5 animate-spin" />
            : 'Sign In'
          }
        </Button>
      </form>

      {/* Divider + Google */}
      <div className="max-w-sm mx-auto w-full mt-4 space-y-3">
        <div className="relative flex items-center gap-3">
          <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
          <span className="text-xs text-slate-400 font-medium">OR</span>
          <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
        </div>

        {/* Google Button */}
        <Button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isFormLoading}
          variant="outline"
          className="w-full h-11 flex items-center justify-center
                     gap-2.5 rounded-xl border border-slate-200
                     dark:border-slate-700 bg-white dark:bg-slate-800
                     text-slate-700 dark:text-slate-200
                     hover:bg-slate-50 dark:hover:bg-slate-700
                     font-semibold transition-all active:scale-[0.98]
                     shadow-sm disabled:opacity-70"
        >
          {googleLoading
            ? <Loader2 className="w-4 h-4 animate-spin" />
            : <FcGoogle className="w-5 h-5 shrink-0" />
          }
          {googleLoading ? 'Signing in...' : 'Continue with Google'}
        </Button>

        {/* Mobile toggle */}
        {toggle && (
          <p className="text-center text-slate-500 dark:text-slate-400
                        text-sm md:hidden">
            New here?{' '}
            <button
              type="button"
              onClick={toggle}
              className="text-sky-500 font-semibold hover:underline"
            >
              Create account
            </button>
          </p>
        )}

        {/* Desktop link */}
        <p className="text-center text-slate-500 dark:text-slate-400
                      text-sm hidden md:block">
          Don&apos;t have an account?{' '}
          <Link to="/register"
                className="text-sky-500 font-semibold hover:underline">
            Sign up free
          </Link>
        </p>
      </div>
    </div>
  );
}