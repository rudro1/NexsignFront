import React from 'react';
import { Button } from "@/components/ui/button";
import { motion } from 'framer-motion';
import { CheckCircle2, ShieldCheck, Zap } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
export function HeroSection({ onGetStarted }) {


  // See How It Works বাটন হ্যান্ডলার
  const handleSeeHowItWorks = () => {
    const section = document.getElementById('how-it-works');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const navigate = useNavigate();
const { isAuthenticated } = useAuth();

const handleGetStarted = () => {
  if (isAuthenticated) {
    navigate("/dashboard");
  } else {
    navigate("/login");
  }
};
  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full -z-10">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-bl from-sky-50 to-transparent opacity-70" />
        <div className="absolute bottom-0 left-0 w-1/3 h-1/2 bg-gradient-to-tr from-sky-50 to-transparent opacity-50 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 md:px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          {/* Text Content */}
          <motion.div
            initial={{
              opacity: 0,
              y: 20
            }}
            animate={{
              opacity: 1,
              y: 0
            }}
            transition={{
              duration: 0.6
            }}
            className="max-w-2xl">

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-100 text-sky-600 text-sm font-medium mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
              </span>
              New: Automated Workflows 2.0
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 mb-6 dark:text-white leading-[1.1]">
              Secure & Smart <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-sky-600">
                Digital Document Signing
              </span>
            </h1>

            <p className="text-lg md:text-xl text-slate-600 mb-8 leading-relaxed dark:text-gray-400">
              Simplify your document workflow with automated signing, secure
              links, and instant delivery. No more printing, scanning, or
              chasing signatures.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <Button
                size="lg"
                className="rounded-full px-8 text-base shadow-sky-200  shadow-lg dark:shadow-sm bg-blue-500 hover:bg-blue-600"
                onClick={handleGetStarted}>

                Get Started Free

              </Button>
              <Button
                variant="outline"
                size="lg"
                className="rounded-full px-8 text-blue-500 hover:text-blue-600"  onClick={handleSeeHowItWorks}>

                See How It Works
              </Button>
            </div>

            <div className="flex items-center gap-6 text-sm text-slate-500 font-medium">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-sky-500" />
                <span>Bank-grade Security</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-sky-500" />
                <span>Instant Setup</span>
              </div>
            </div>
          </motion.div>

          {/* Illustration / Mockup */}
          <motion.div
            initial={{
              opacity: 0,
              x: 20
            }}
            animate={{
              opacity: 1,
              x: 0
            }}
            transition={{
              duration: 0.8,
              delay: 0.2
            }}
            className="relative lg:h-[600px] flex items-center justify-center">

            <div className="relative w-full max-w-md mx-auto aspect-[4/5] bg-white rounded-2xl shadow-2xl border border-slate-100 p-8 transform rotate-2 hover:rotate-0 transition-transform duration-500">
              {/* Fake Document Content */}
              <div className="w-16 h-16 bg-sky-100 rounded-full mb-8 flex items-center justify-center">
                <div className="w-8 h-8 bg-sky-500 rounded-md" />
              </div>
              <div className="space-y-4 mb-12">
                <div className="h-4 bg-slate-100 rounded w-3/4" />
                <div className="h-4 bg-slate-100 rounded w-full" />
                <div className="h-4 bg-slate-100 rounded w-5/6" />
                <div className="h-4 bg-slate-100 rounded w-full" />
              </div>
              <div className="space-y-4 mb-12">
                <div className="h-4 bg-slate-100 rounded w-2/3" />
                <div className="h-4 bg-slate-100 rounded w-full" />
                <div className="h-4 bg-slate-100 rounded w-4/5" />
              </div>

              {/* Signature Area */}
              <div className="mt-auto pt-8 border-t border-slate-100">
                <div className="flex justify-between items-end">
                  <div>
                    <div className="h-12 w-32 mb-2 relative">
                      <svg
                        className="absolute bottom-0 left-0 w-full h-full text-sky-600"
                        viewBox="0 0 100 40"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2">

                        <path d="M5,35 C20,35 15,10 30,20 C40,25 35,35 50,30 C60,25 70,10 80,20 C90,30 85,35 95,35" />
                      </svg>
                    </div>
                    <div className="h-px w-40 bg-slate-300" />
                    <p className="text-xs text-slate-400 mt-1">
                      Authorized Signature
                    </p>
                  </div>
                  <div className="bg-green-100 text-green-700 p-2 rounded-full">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                </div>
              </div>

              {/* Floating Badge */}
              <div className="absolute hidden -right-6 top-20 bg-white p-4 rounded-xl shadow-xl border border-slate-100 md:flex items-center gap-3 animate-bounce duration-[3000ms]">
                <div className="bg-green-100 p-2 rounded-full">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">Signed!</p>
                  <p className="text-xs text-slate-500">Just now</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>);

}