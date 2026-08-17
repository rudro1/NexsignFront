// src/pages/Register.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '@/api/apiClient';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  UserPlus, Mail, Lock, Eye, EyeOff,
  CheckCircle2, AlertCircle, Loader2,
  ShieldCheck, ArrowLeft, RefreshCw,
  KeyRound, Sparkles, User,
} from 'lucide-react';

// ── Password validation rules ─────────────────────────────────────
const rules = {
  full_name: (v) => (!v.trim() ? 'Full name is required' : ''),
  email: (v) => {
    if (!v.trim()) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()))
      return 'Please enter a valid email address';
    return '';
  },
  password: (v) => {
    if (!v) return 'Password is required';
    if (v.length < 6) return 'Password must be at least 6 characters';
    return '';
  },
  confirm_password: (v, all) => {
    if (!v) return 'Please confirm your password';
    if (v !== all.password) return 'Passwords do not match';
    return '';
  },
};

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
  if (score <= 3) return { score, label: 'Medium', color: 'bg-amber-400'  };
  return           { score, label: 'Strong', color: 'bg-emerald-500' };
}

// ── OTP Verification Screen ───────────────────────────────────────
function OtpVerificationScreen({
  email,
  name,
  onVerify,
  onResend,
  onCancel,
  verifying,
  resending,
}) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(60);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => setCountdown(c => c - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleOtpChange = (index, value) => {
    // Handle paste of whole code
    if (value.length > 1) {
      const digits = value.replace(/\D/g, '').slice(0, 6).split('');
      const newOtp = [...otp];
      digits.forEach((d, i) => {
        if (i < 6) newOtp[i] = d;
      });
      setOtp(newOtp);
      const nextIndex = Math.min(digits.length, 5);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    const cleanDigit = value.replace(/\D/g, '');
    const newOtp = [...otp];
    newOtp[index] = cleanDigit;
    setOtp(newOtp);

    // Auto-focus next input
    if (cleanDigit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasteData) {
      const newOtp = [...otp];
      pasteData.split('').forEach((digit, i) => {
        if (i < 6) newOtp[i] = digit;
      });
      setOtp(newOtp);
      const targetIdx = Math.min(pasteData.length, 5);
      inputRefs.current[targetIdx]?.focus();
    }
  };

  const handleResendClick = async () => {
    if (countdown > 0 || resending) return;
    const success = await onResend();
    if (success) {
      setCountdown(60);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    }
  };

  const isComplete = otp.every(d => d.length === 1);
  const otpString = otp.join('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isComplete) {
      onVerify(otpString);
    }
  };

  return (
    <div className="w-full h-full p-5 sm:p-8 flex flex-col justify-center items-center bg-white dark:bg-slate-900 overflow-y-auto">
      <div className="max-w-md w-full text-center py-4">

        {/* Security Badge Icon */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-sky-50 dark:bg-sky-900/30 rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-sky-500/10 border border-sky-100 dark:border-sky-800 animate-pulse">
          <KeyRound className="w-8 h-8 sm:w-10 sm:h-10 text-sky-500" />
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
          Verify Your Email
        </h2>
        
        <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mb-2">
          We sent a 6-digit security code to:
        </p>

        <p className="font-bold text-sky-600 dark:text-sky-400 text-xs sm:text-sm mb-6 bg-sky-50 dark:bg-sky-950/60 border border-sky-200/60 dark:border-sky-800 rounded-xl px-4 py-2.5 break-all inline-block max-w-full">
          {email}
        </p>

        {/* OTP Input Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center justify-center gap-2 sm:gap-3" onPaste={handlePaste}>
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={el => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={digit}
                onChange={e => handleOtpChange(index, e.target.value)}
                onKeyDown={e => handleKeyDown(index, e)}
                disabled={verifying}
                className="w-10 h-12 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-black rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 focus:bg-white dark:focus:bg-slate-900 transition-all outline-none"
              />
            ))}
          </div>

          {/* Security Note */}
          <div className="flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Code is valid for 10 minutes &bull; Free but Secure</span>
          </div>

          {/* Verify Button */}
          <Button
            type="submit"
            disabled={!isComplete || verifying}
            className="w-full h-11 sm:h-12 bg-sky-500 hover:bg-sky-600 active:bg-sky-700 text-white rounded-xl font-bold shadow-lg shadow-sky-500/25 transition-all active:scale-[0.99] disabled:opacity-50 gap-2"
          >
            {verifying ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Verifying Code...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Verify & Create Account
              </>
            )}
          </Button>
        </form>

        {/* Resend & Back options */}
        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm">
          <button
            type="button"
            onClick={handleResendClick}
            disabled={countdown > 0 || resending || verifying}
            className="flex items-center gap-1.5 font-semibold text-sky-500 hover:text-sky-600 dark:hover:text-sky-400 disabled:opacity-50 transition-colors"
          >
            {resending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <RefreshCw className="w-3.5 h-3.5" />
            )}
            {countdown > 0 ? `Resend code in ${countdown}s` : 'Resend Code'}
          </button>

          <button
            type="button"
            onClick={onCancel}
            disabled={verifying}
            className="flex items-center gap-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-medium transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Change email
          </button>
        </div>

      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// MAIN REGISTER COMPONENT
// ════════════════════════════════════════════════════════════════
export default function Register({ toggle }) {
  const navigate = useNavigate();
  const { login } = useAuth();

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
  const [isOtpStep, setIsOtpStep] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);

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

  // ── Step 1: Submit Form -> Send OTP ──────────────────────────
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);

    try {
      const res = await api.post('/auth/send-signup-otp', {
        full_name: formData.full_name.trim(),
        email:     formData.email.toLowerCase().trim(),
        password:  formData.password,
      });

      toast.success(res.data?.message || 'Verification code sent to your email!');
      setIsOtpStep(true);

    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to send verification code.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [validate, formData]);

  // ── Step 2: Verify OTP -> Activate Account ────────────────────
  const handleVerifyOtp = useCallback(async (otpCode) => {
    setVerifying(true);
    try {
      const res = await api.post('/auth/verify-signup-otp', {
        full_name: formData.full_name.trim(),
        email:     formData.email.toLowerCase().trim(),
        password:  formData.password,
        otp:       otpCode,
      });

      if (res.data?.token) {
        login(res.data.user, res.data.token);
        toast.success('Account verified! Welcome to NeXsign 🎉');
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Verification failed. Please check the code.';
      toast.error(msg);
    } finally {
      setVerifying(false);
    }
  }, [formData, login, navigate]);

  // ── Resend OTP ───────────────────────────────────────────────
  const handleResendOtp = useCallback(async () => {
    setResending(true);
    try {
      const res = await api.post('/auth/resend-signup-otp', {
        full_name: formData.full_name.trim(),
        email:     formData.email.toLowerCase().trim(),
      });
      toast.success(res.data?.message || 'New verification code sent!');
      return true;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to resend code.';
      toast.error(msg);
      return false;
    } finally {
      setResending(false);
    }
  }, [formData]);

  // ── Password strength ─────────────────────────────────────────
  const strength = getStrength(formData.password);

  // ── Show OTP screen ──────────────────────────────────────────
  if (isOtpStep) {
    return (
      <OtpVerificationScreen
        email={formData.email}
        name={formData.full_name}
        onVerify={handleVerifyOtp}
        onResend={handleResendOtp}
        onCancel={() => setIsOtpStep(false)}
        verifying={verifying}
        resending={resending}
      />
    );
  }

  // ── Registration Form ─────────────────────────────────────────
  return (
    <div className="w-full h-full p-5 sm:p-8 flex flex-col justify-center bg-white dark:bg-slate-900 overflow-y-auto">

      {/* Header */}
      <div className="text-center mb-6">
        <Link to="/">
          <div className="w-12 h-12 bg-sky-50 dark:bg-sky-900/20 rounded-2xl flex items-center justify-center mx-auto mb-3 hover:scale-105 transition-transform cursor-pointer">
            <UserPlus className="h-5 w-5 text-sky-500" />
          </div>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Create Account
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1">
          Join NeXsign — <span className="font-semibold text-sky-500">Free but Secure</span>
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
          <Label htmlFor="full_name" className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
            Full Name
          </Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <Input
              id="full_name"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              placeholder="John Doe"
              autoComplete="name"
              disabled={loading}
              className={`h-11 pl-10 rounded-xl border transition-colors ${
                errors.full_name
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
          <Label htmlFor="email" className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
            Email Address
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="john@example.com"
              autoComplete="email"
              disabled={loading}
              className={`h-11 pl-10 rounded-xl border transition-colors ${
                errors.email
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
          <Label htmlFor="password" className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
            Password
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <Input
              id="password"
              name="password"
              type={showPw ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              placeholder="Min. 6 characters"
              autoComplete="new-password"
              disabled={loading}
              className={`h-11 pl-10 pr-10 rounded-xl border transition-colors ${
                errors.password
                  ? 'border-red-400 focus:ring-red-400'
                  : 'border-slate-200 dark:border-slate-700 focus:border-sky-400 focus:ring-sky-400'
              }`}
              required
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPw(p => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Strength bar */}
          {formData.password && (
            <div className="space-y-1 pt-1">
              <div className="flex gap-1 h-1.5">
                {[1, 2, 3, 4, 5].map(n => (
                  <div
                    key={n}
                    className={`flex-1 rounded-full transition-all ${
                      n <= strength.score
                        ? strength.color
                        : 'bg-slate-100 dark:bg-slate-800'
                    }`}
                  />
                ))}
              </div>
              {strength.label && (
                <p className="text-[11px] text-slate-400">
                  Strength:{' '}
                  <span className={`font-semibold ${
                    strength.score <= 1
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
          <Label htmlFor="confirm_password" className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
            Confirm Password
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <Input
              id="confirm_password"
              name="confirm_password"
              type={showCPw ? 'text' : 'password'}
              value={formData.confirm_password}
              onChange={handleChange}
              placeholder="Repeat password"
              autoComplete="new-password"
              disabled={loading}
              className={`h-11 pl-10 pr-10 rounded-xl border transition-colors ${
                errors.confirm_password
                  ? 'border-red-400 focus:ring-red-400'
                  : formData.confirm_password && formData.confirm_password === formData.password
                    ? 'border-emerald-400 focus:ring-emerald-400'
                    : 'border-slate-200 dark:border-slate-700 focus:border-sky-400 focus:ring-sky-400'
              }`}
              required
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowCPw(p => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              {showCPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>

            {/* Match indicator */}
            {formData.confirm_password && formData.confirm_password === formData.password && (
              <CheckCircle2 className="absolute right-9 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
            )}
          </div>
          {errors.confirm_password && (
            <p className="flex items-center gap-1.5 text-xs text-red-500">
              <AlertCircle className="w-3 h-3 shrink-0" />
              {errors.confirm_password}
            </p>
          )}
        </div>

        {/* Security Note */}
        <div className="flex items-start gap-2.5 p-3 bg-sky-50 dark:bg-sky-900/10 rounded-xl border border-sky-100 dark:border-sky-900">
          <ShieldCheck className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
          <p className="text-xs text-sky-700 dark:text-sky-400 leading-relaxed">
            Bank-grade 256-bit encryption. A 6-digit OTP verification code will be sent to your email to activate your account.
          </p>
        </div>

        {/* Submit */}
        <Button
          type="submit"
          disabled={loading}
          className="w-full h-11 bg-sky-500 hover:bg-sky-600 active:bg-sky-700 text-white rounded-xl font-semibold shadow-lg shadow-sky-500/25 transition-all active:scale-[0.98] disabled:opacity-70 gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Sending Verification Code...
            </>
          ) : (
            'Create Account & Verify'
          )}
        </Button>
      </form>

      {/* Toggle to Login */}
      <div className="max-w-sm mx-auto w-full">
        {toggle && (
          <p className="text-center mt-5 text-slate-500 dark:text-slate-400 text-xs sm:text-sm md:hidden">
            Already have an account?{' '}
            <button
              type="button"
              onClick={toggle}
              className="text-sky-500 hover:text-sky-600 font-semibold hover:underline"
            >
              Sign in
            </button>
          </p>
        )}

        <p className="text-center mt-5 text-slate-500 dark:text-slate-400 text-xs sm:text-sm hidden md:block">
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-sky-500 hover:text-sky-600 font-semibold hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
