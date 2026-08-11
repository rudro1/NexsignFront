// src/pages/Auth.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Login    from '@/pages/Login';
import Register from '@/pages/Register';
import { FileSignature } from 'lucide-react';

export default function Auth({ initialMode = 'login' }) {
  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  const navigate = useNavigate();

  useEffect(() => {
    setIsLogin(initialMode === 'login');
  }, [initialMode]);

  const switchToLogin = () => {
    setIsLogin(true);
    navigate('/login', { replace: true });
  };

  const switchToRegister = () => {
    setIsLogin(false);
    navigate('/register', { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center
                    bg-gradient-to-br from-slate-100 via-sky-50/30
                    to-slate-100 dark:from-slate-950
                    dark:via-sky-950/20 dark:to-slate-950 p-4">

      {/* ── Mobile (< md) ── সহজ single form ─────────────── */}
      <div className="md:hidden w-full max-w-sm">
        <div className="bg-white dark:bg-slate-900 rounded-3xl
                        shadow-xl shadow-slate-200/60
                        dark:shadow-slate-950/80 overflow-hidden">
          {isLogin
            ? <Login toggle={switchToRegister} />
            : <Register toggle={switchToLogin} />
          }
        </div>
      </div>

      {/* ── Desktop (≥ md) ── animated split card ─────────── */}
      <div className="hidden md:flex relative w-full max-w-4xl
                      bg-white dark:bg-slate-900
                      shadow-2xl shadow-slate-200/60
                      dark:shadow-slate-950/80
                      rounded-[2.5rem] overflow-hidden
                      h-[650px]">

        {/* Forms area */}
        <div className="relative flex w-full h-full">

          {/* Register — left half */}
          <div className={`
            absolute top-0 left-0 w-1/2 h-full
            transition-all duration-700 ease-in-out
            overflow-y-auto scrollbar-hide
            ${isLogin
              ? 'opacity-0 pointer-events-none z-0'
              : 'opacity-100 pointer-events-auto z-10'
            }
          `}>
            <Register toggle={switchToLogin} />
          </div>

          {/* Login — right half */}
          <div className={`
            absolute top-0 right-0 w-1/2 h-full
            transition-all duration-700 ease-in-out
            overflow-y-auto scrollbar-hide
            ${!isLogin
              ? 'opacity-0 pointer-events-none z-0'
              : 'opacity-100 pointer-events-auto z-10'
            }
          `}>
            <Login toggle={switchToRegister} />
          </div>
        </div>

        {/* Animated blue overlay panel */}
        <div className={`
          absolute top-0 left-0 h-full w-1/2 z-20
          bg-gradient-to-br from-sky-500 to-sky-700
          text-white
          transition-transform duration-700 ease-in-out
          flex flex-col items-center justify-center
          p-10 text-center shadow-2xl
          ${isLogin
            ? 'translate-x-0 rounded-r-[5rem]'
            : 'translate-x-full rounded-l-[5rem]'
          }
        `}>
          {/* Logo */}
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm
                          rounded-2xl flex items-center justify-center
                          mb-6 shadow-lg">
            <FileSignature size={28} className="text-white" />
          </div>

          <div className="space-y-5">
            <h2 className="text-3xl font-extrabold tracking-tight">
              {isLogin ? 'Welcome Back!' : "Let's Get Started!"}
            </h2>
            <p className="opacity-90 leading-relaxed
                          text-sm max-w-xs mx-auto">
              {isLogin
                ? 'Sign in to stay connected with NeXsign.'
                : 'Start signing documents digitally today.'}
            </p>

            {/* Features */}
            <div className="text-left space-y-2 text-sm
                            opacity-90 bg-white/10
                            rounded-2xl p-4">
              {[
                '✍️ Digital signatures',
                '📄 PDF editor',
                '🔒 Audit trail',
                '⚡ Real-time tracking',
              ].map(f => (
                <p key={f}>{f}</p>
              ))}
            </div>

            <button
              onClick={isLogin ? switchToRegister : switchToLogin}
              className="px-10 py-3 border-2 border-white
                         rounded-full font-bold text-sm
                         hover:bg-white hover:text-sky-600
                         transition-all duration-200
                         active:scale-95 shadow-lg"
            >
              {isLogin ? 'CREATE ACCOUNT' : 'SIGN IN'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}