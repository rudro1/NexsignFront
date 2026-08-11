

// import React, { useState } from 'react';
// import { useNavigate, Link } from 'react-router-dom';
// import { api } from '@/api/apiClient';
// import { useAuth } from '@/lib/AuthContext';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { toast } from 'sonner';
// import { Loader2, ShieldCheck, UserPlus } from 'lucide-react';


// //import { auth } from '@/firebase.config';


// export default function Register({ toggle }) {
//   const navigate = useNavigate();
//   const { registerWithEmail,  checkEmailVerified, login } = useAuth();
//   const [formData, setFormData] = useState({ full_name: '', email: '', password: '', confirm_password: '' });
//   const [loading, setLoading] = useState(false);
//   const [isWaiting, setIsWaiting] = useState(false); //
  
//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
    
//   };
// const handleSubmit = async (e) => {
//   e.preventDefault();

//   // ১. বেসিক ভ্যালিডেশন
//   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//   if (!emailRegex.test(formData.email)) return toast.error("Invalid email format!");
//   if (formData.password !== formData.confirm_password) return toast.error('Passwords do not match!');
//   if (formData.password.length < 6) return toast.error('Password too short!');

//   setLoading(true);
//   let firebaseUser = null;

//   try {
//     // ২. Firebase Registration (অ্যাকাউন্ট তৈরি ও মেইল পাঠানো)
//     const result = await registerWithEmail(formData.email, formData.password);
//     firebaseUser = result.user;

//     setIsWaiting(true); 
//     toast.info("Verification email sent! Check your inbox.");

//     // ৩. পোলিং শুরু (ইমেইল ভেরিফাই হওয়া পর্যন্ত অপেক্ষা)
//     const interval = setInterval(async () => {
//       const isVerified = await checkEmailVerified(firebaseUser); 
      
//       if (isVerified) {
//         clearInterval(interval);
        
//         try {
//           // ৪. ইমেইল ভেরিফাই হওয়ার পরেই কেবল ব্যাকএন্ডে ডাটা সেভ হবে
//           const payload = { 
//             full_name: formData.full_name, 
//             email: formData.email.toLowerCase().trim(),
//             password: formData.password 
//           };
//           const res = await api.post('/auth/register', payload);

//           // সেশন সেট এবং ড্যাশবোর্ডে পাঠানো
//           login(res.data.user, res.data.token); 
//           toast.success("Registration Complete!");
//           navigate('/dashboard');
//         } catch (backendErr) {
//           toast.error("Verified but failed to save in database.");
//         }
//       }
//     }, 3000);

//     // ১০ মিনিট পর পোলিং বন্ধ
//     setTimeout(() => clearInterval(interval), 600000);

//   } catch (err) {
//     setLoading(false);
//     console.error("Error:", err);
//     toast.error(err.message || "Registration failed.");
//   }
// };

//   return (
//     <div className="w-full h-full p-8 flex flex-col justify-center bg-white dark:bg-slate-900">
//       <div className="text-center mb-5">
//         <div className="w-12 h-12 bg-sky-50 dark:bg-sky-900/20 rounded-xl flex items-center justify-center mx-auto mb-3">
//           <Link to="/"><UserPlus className="h-6 w-6 text-sky-500" /></Link>
//         </div>
//         <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Create Account</h1>
//         <p className="text-slate-500 text-sm mt-1">Join NeXsign today</p>
//       </div>

//       <form onSubmit={handleSubmit} className="space-y-3 max-w-sm mx-auto w-full text-left">
//         <div className="space-y-1"><Label className="text-sm">Full Name</Label>
//           <Input name="full_name" value={formData.full_name} onChange={handleChange} placeholder="John Doe" className="h-9 rounded-xl" required />
//         </div>
//         <div className="space-y-1"><Label className="text-sm">Email</Label>
//           <Input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="john@example.com" className="h-9 rounded-xl" required />
//         </div>
//         <div className="grid grid-cols-2 gap-3">
//           <div className="space-y-1"><Label className="text-sm">Password</Label>
//             <Input name="password" type="password" value={formData.password} onChange={handleChange} placeholder="••••" className="h-9 rounded-xl" required />
//           </div>
//           <div className="space-y-1"><Label className="text-sm">Confirm</Label>
//             <Input name="confirm_password" type="password" value={formData.confirm_password} onChange={handleChange} placeholder="••••" className="h-9 rounded-xl" required />
//           </div>
//         </div>
//         <div className="flex items-center gap-2 p-2 bg-sky-50 dark:bg-sky-900/10 rounded-xl border border-sky-100">
//           <ShieldCheck className="w-4 h-4 text-sky-500 shrink-0" />
//           <p className="text-[10px] text-sky-700 leading-tight">Password stays encrypted and safe.</p>
//         </div>
//         <Button type="submit" className="w-full h-10 bg-sky-500 hover:bg-sky-600 text-white rounded-xl shadow-lg font-semibold" disabled={loading}>
//           {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Account'}
//         </Button>
//       </form>
//       <p className="text-center mt-4 text-slate-500 text-xs md:hidden">
//         Already have an account? <button onClick={toggle} className="text-sky-500 font-bold">Log in</button>
//       </p>
//     </div>
//   );
// }
// src/pages/Register.jsx

import React, { useState, useCallback, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '@/api/apiClient';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Input }  from '@/components/ui/input';
import { Label }  from '@/components/ui/label';
import { toast }  from 'sonner';
import {
  Loader2, ShieldCheck, UserPlus,
  Eye, EyeOff, Mail, Lock, User,
  CheckCircle2, AlertCircle, RefreshCw,
} from 'lucide-react';

// ── Validation rules ──────────────────────────────────────────────
const rules = {
  full_name: (v) =>
    v.trim().length >= 2 ? '' : 'Name must be at least 2 characters.',
  email: (v) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())
      ? '' : 'Please enter a valid email.',
  password: (v) =>
    v.length >= 6 ? '' : 'Password must be at least 6 characters.',
  confirm_password: (v, all) =>
    v === all.password ? '' : 'Passwords do not match.',
};

const POLL_INTERVAL = 3000;    // 3s
const POLL_TIMEOUT  = 600_000; // 10min

// ── Password strength ─────────────────────────────────────────────
function getStrength(pw) {
  if (!pw) return { score: 0, label: '', color: '' };
  let score = 0;
  if (pw.length >= 6)  score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return { score, label: 'Weak',   color: 'bg-red-400'    };
  if (score <= 3) return { score, label: 'Medium',  color: 'bg-amber-400'  };
  return           { score, label: 'Strong',  color: 'bg-emerald-500' };
}

// ── Verify waiting screen ─────────────────────────────────────────
function VerifyScreen({ email, onResend, onCancel, resending }) {
  const [countdown, setCountdown] = React.useState(60);

  React.useEffect(() => {
    if (countdown <= 0) return;
    const id = setInterval(() =>
      setCountdown(c => c - 1), 1000
    );
    return () => clearInterval(id);
  }, [countdown]);

  const handleResend = async () => {
    await onResend();
    setCountdown(60);
  };

  return (
    <div className="w-full h-full p-6 sm:p-8 flex flex-col
                    justify-center items-center
                    bg-white dark:bg-slate-900">
      <div className="max-w-sm w-full text-center">

        {/* Icon */}
        <div className="w-20 h-20 bg-sky-50 dark:bg-sky-900/20
                        rounded-3xl flex items-center justify-center
                        mx-auto mb-6 animate-pulse">
          <Mail className="w-10 h-10 text-sky-500" />
        </div>

        <h2 className="text-2xl font-bold text-slate-900
                       dark:text-white mb-2">
          Verify Your Email
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-2">
          We sent a verification link to:
        </p>
        <p className="font-bold text-slate-800 dark:text-slate-200
                      text-sm mb-6 bg-slate-50 dark:bg-slate-800
                      rounded-xl px-4 py-2.5 break-all">
          {email}
        </p>

        {/* Steps */}
        <div className="text-left space-y-3 mb-8
                        bg-sky-50 dark:bg-sky-900/10
                        rounded-2xl p-4 border border-sky-100
                        dark:border-sky-900">
          {[
            'Check your inbox (and spam folder)',
            'Click the verification link',
            'Come back — you\'ll be signed in automatically',
          ].map((step, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-sky-500
                              text-white text-xs font-bold
                              flex items-center justify-center
                              shrink-0 mt-0.5">
                {i + 1}
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {step}
              </p>
            </div>
          ))}
        </div>

        {/* Animated waiting indicator */}
        <div className="flex items-center justify-center gap-2
                        text-slate-400 text-sm mb-6">
          <Loader2 className="w-4 h-4 animate-spin text-sky-500" />
          Waiting for verification...
        </div>

        {/* Resend */}
        <Button
          variant="outline"
          onClick={handleResend}
          disabled={resending || countdown > 0}
          className="w-full rounded-xl h-11 font-semibold
                     border-slate-200 dark:border-slate-700 gap-2 mb-3"
        >
          {resending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
          {countdown > 0
            ? `Resend in ${countdown}s`
            : 'Resend Email'}
        </Button>

        <button
          onClick={onCancel}
          className="text-sm text-slate-400 hover:text-slate-600
                     dark:hover:text-slate-300 transition-colors"
        >
          ← Use a different email
        </button>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// MAIN REGISTER COMPONENT
// ════════════════════════════════════════════════════════════════
export default function Register({ toggle }) {
  const navigate = useNavigate();
  const { registerWithEmail, checkEmailVerified,
          resendVerificationEmail, login } = useAuth();

  const [formData, setFormData] = useState({
    full_name:        '',
    email:            '',
    password:         '',
    confirm_password: '',
  });
  const [errors,    setErrors]    = useState({});
  const [showPw,    setShowPw]    = useState(false);
  const [showCPw,   setShowCPw]   = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);
  const [resending, setResending] = useState(false);

  const firebaseUserRef = useRef(null);
  const pollRef         = useRef(null);
  const timeoutRef      = useRef(null);

  // ── Input change ─────────────────────────────────────────────
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  }, [errors]);

  // ── Validate all fields ───────────────────────────────────────
  const validate = useCallback(() => {
    const newErrors = {};
    Object.keys(rules).forEach(key => {
      const msg = rules[key](formData[key] || '', formData);
      if (msg) newErrors[key] = msg;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // ── Stop polling ──────────────────────────────────────────────
  const stopPolling = useCallback(() => {
    if (pollRef.current)    clearInterval(pollRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }, []);

  // ── Start polling for email verification ──────────────────────
  const startPolling = useCallback((fbUser) => {
    stopPolling();

    pollRef.current = setInterval(async () => {
      try {
        const verified = await checkEmailVerified(fbUser);
        if (!verified) return;

        // ✅ Email verified — register in backend
        stopPolling();
        try {
          const res = await api.post('/auth/register', {
            full_name: formData.full_name.trim(),
            email:     formData.email.toLowerCase().trim(),
            password:  formData.password,
          });

          if (res.data?.token) {
            login(res.data.user, res.data.token);
            toast.success('Account created! Welcome to NeXsign 🎉');
            navigate('/dashboard', { replace: true });
          }
        } catch (backendErr) {
          const msg = backendErr.message ||
            'Verified but failed to create account.';
          toast.error(msg);
          setIsWaiting(false);
          setLoading(false);
        }
      } catch (e) {
        console.warn('Poll error:', e.message);
      }
    }, POLL_INTERVAL);

    // Stop after 10min
    timeoutRef.current = setTimeout(() => {
      stopPolling();
      setIsWaiting(false);
      setLoading(false);
      toast.error(
        'Verification timed out. Please try again.'
      );
    }, POLL_TIMEOUT);
  }, [
    checkEmailVerified, formData,
    login, navigate, stopPolling,
  ]);

  // ── Submit ────────────────────────────────────────────────────
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);

    try {
      const result = await registerWithEmail(
        formData.email.toLowerCase().trim(),
        formData.password
      );

      firebaseUserRef.current = result.user;
      setIsWaiting(true);
      toast.info('Verification email sent! Check your inbox.');
      startPolling(result.user);

    } catch (err) {
      setLoading(false);
      toast.error(err.message || 'Registration failed.');
    }
  }, [
    validate, registerWithEmail,
    formData, startPolling,
  ]);

  // ── Resend verification ───────────────────────────────────────
  const handleResend = useCallback(async () => {
    setResending(true);
    try {
      await resendVerificationEmail();
    } catch {
      // Toast handled in AuthContext
    } finally {
      setResending(false);
    }
  }, [resendVerificationEmail]);

  // ── Cancel verification ───────────────────────────────────────
  const handleCancel = useCallback(() => {
    stopPolling();
    setIsWaiting(false);
    setLoading(false);
    firebaseUserRef.current = null;
  }, [stopPolling]);

  // ── Password strength ─────────────────────────────────────────
  const strength = getStrength(formData.password);

  // ── Show verify screen ────────────────────────────────────────
  if (isWaiting) {
    return (
      <VerifyScreen
        email={formData.email}
        onResend={handleResend}
        onCancel={handleCancel}
        resending={resending}
      />
    );
  }

  // ── Register Form ─────────────────────────────────────────────
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
            <UserPlus className="h-5 w-5 text-sky-500" />
          </div>
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Create Account
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Join NeXsign today — it&apos;s free
        </p>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="space-y-4 max-w-sm mx-auto w-full"
        noValidate
      >
        {/* Full Name */}
        <div className="space-y-1.5">
          <Label htmlFor="full_name"
                 className="text-sm font-medium
                            text-slate-700 dark:text-slate-300">
            Full Name
          </Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2
                             w-4 h-4 text-slate-400 pointer-events-none" />
            <Input
              id="full_name"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              placeholder="John Doe"
              autoComplete="name"
              disabled={loading}
              className={`h-11 pl-10 rounded-xl border
                          transition-colors
                          ${errors.full_name
                            ? 'border-red-400 focus:ring-red-400'
                            : 'border-slate-200 dark:border-slate-700 focus:border-sky-400 focus:ring-sky-400'
                          }`}
              required
            />
          </div>
          {errors.full_name && (
            <p className="flex items-center gap-1.5 text-xs text-red-500">
              <AlertCircle className="w-3 h-3 shrink-0" />
              {errors.full_name}
            </p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <Label htmlFor="email"
                 className="text-sm font-medium
                            text-slate-700 dark:text-slate-300">
            Email Address
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2
                             w-4 h-4 text-slate-400 pointer-events-none" />
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="john@example.com"
              autoComplete="email"
              disabled={loading}
              className={`h-11 pl-10 rounded-xl border
                          transition-colors
                          ${errors.email
                            ? 'border-red-400 focus:ring-red-400'
                            : 'border-slate-200 dark:border-slate-700 focus:border-sky-400 focus:ring-sky-400'
                          }`}
              required
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
          <Label htmlFor="password"
                 className="text-sm font-medium
                            text-slate-700 dark:text-slate-300">
            Password
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2
                             w-4 h-4 text-slate-400 pointer-events-none" />
            <Input
              id="password"
              name="password"
              type={showPw ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              placeholder="Min. 6 characters"
              autoComplete="new-password"
              disabled={loading}
              className={`h-11 pl-10 pr-10 rounded-xl border
                          transition-colors
                          ${errors.password
                            ? 'border-red-400 focus:ring-red-400'
                            : 'border-slate-200 dark:border-slate-700 focus:border-sky-400 focus:ring-sky-400'
                          }`}
              required
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPw(p => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2
                         text-slate-400 hover:text-slate-600
                         dark:hover:text-slate-300 transition-colors"
            >
              {showPw
                ? <EyeOff className="w-4 h-4" />
                : <Eye    className="w-4 h-4" />}
            </button>
          </div>

          {/* Strength bar */}
          {formData.password && (
            <div className="space-y-1">
              <div className="flex gap-1 h-1.5">
                {[1, 2, 3, 4, 5].map(n => (
                  <div
                    key={n}
                    className={`flex-1 rounded-full transition-all
                      ${n <= strength.score
                        ? strength.color
                        : 'bg-slate-100 dark:bg-slate-800'
                      }`}
                  />
                ))}
              </div>
              {strength.label && (
                <p className="text-xs text-slate-400">
                  Strength:{' '}
                  <span className={`font-semibold
                    ${strength.score <= 1
                      ? 'text-red-500'
                      : strength.score <= 3
                        ? 'text-amber-500'
                        : 'text-emerald-500'
                    }`}>
                    {strength.label}
                  </span>
                </p>
              )}
            </div>
          )}

          {errors.password && (
            <p className="flex items-center gap-1.5 text-xs text-red-500">
              <AlertCircle className="w-3 h-3 shrink-0" />
              {errors.password}
            </p>
          )}
        </div>

        {/* Confirm Password */}
        <div className="space-y-1.5">
          <Label htmlFor="confirm_password"
                 className="text-sm font-medium
                            text-slate-700 dark:text-slate-300">
            Confirm Password
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2
                             w-4 h-4 text-slate-400 pointer-events-none" />
            <Input
              id="confirm_password"
              name="confirm_password"
              type={showCPw ? 'text' : 'password'}
              value={formData.confirm_password}
              onChange={handleChange}
              placeholder="Repeat password"
              autoComplete="new-password"
              disabled={loading}
              className={`h-11 pl-10 pr-10 rounded-xl border
                          transition-colors
                          ${errors.confirm_password
                            ? 'border-red-400 focus:ring-red-400'
                            : formData.confirm_password &&
                              formData.confirm_password === formData.password
                              ? 'border-emerald-400 focus:ring-emerald-400'
                              : 'border-slate-200 dark:border-slate-700 focus:border-sky-400 focus:ring-sky-400'
                          }`}
              required
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowCPw(p => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2
                         text-slate-400 hover:text-slate-600
                         dark:hover:text-slate-300 transition-colors"
            >
              {showCPw
                ? <EyeOff className="w-4 h-4" />
                : <Eye    className="w-4 h-4" />}
            </button>

            {/* Match indicator */}
            {formData.confirm_password &&
              formData.confirm_password === formData.password && (
              <CheckCircle2 className="absolute right-9 top-1/2
                                       -translate-y-1/2 w-4 h-4
                                       text-emerald-500" />
            )}
          </div>
          {errors.confirm_password && (
            <p className="flex items-center gap-1.5 text-xs text-red-500">
              <AlertCircle className="w-3 h-3 shrink-0" />
              {errors.confirm_password}
            </p>
          )}
        </div>

        {/* Security note */}
        <div className="flex items-start gap-2.5 p-3
                        bg-sky-50 dark:bg-sky-900/10
                        rounded-xl border border-sky-100
                        dark:border-sky-900">
          <ShieldCheck className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
          <p className="text-xs text-sky-700 dark:text-sky-400
                        leading-relaxed">
            Your password is encrypted and never stored in plain text.
            We use bank-level security.
          </p>
        </div>

        {/* Submit */}
        <Button
          type="submit"
          disabled={loading}
          className="w-full h-11 bg-sky-500 hover:bg-sky-600
                     active:bg-sky-700 text-white rounded-xl
                     font-semibold shadow-lg shadow-sky-500/25
                     transition-all active:scale-[0.98]
                     disabled:opacity-70 gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Creating account...
            </>
          ) : (
            'Create Account'
          )}
        </Button>
      </form>

      {/* Toggle to Login */}
      <div className="max-w-sm mx-auto w-full">
        {toggle && (
          <p className="text-center mt-5 text-slate-500
                        dark:text-slate-400 text-sm md:hidden">
            Already have an account?{' '}
            <button
              type="button"
              onClick={toggle}
              className="text-sky-500 hover:text-sky-600
                         font-semibold hover:underline"
            >
              Sign in
            </button>
          </p>
        )}

        <p className="text-center mt-5 text-slate-500
                      dark:text-slate-400 text-sm hidden md:block">
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-sky-500 hover:text-sky-600
                       font-semibold hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
