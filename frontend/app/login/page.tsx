"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, Sparkles, ArrowRight, Lock, Mail, KeyRound } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleDemoLogin = () => {
    setLoading(true);
    setTimeout(() => {
      // Set sample merchant session cookie / local storage
      if (typeof window !== "undefined") {
        localStorage.setItem("sentinelx_merchant", "demo@sentinelx.ai");
      }
      router.push("/dashboard");
    }, 400);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleDemoLogin();
  };

  return (
    <div className="flex-1 flex items-center justify-center px-6 py-16 bg-black">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 text-white font-semibold text-lg">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white">
              <g transform="rotate(-30 12 12)">
                <circle cx="7.3" cy="3.2" r="1.45" />
                <rect x="5.5" y="4.7" width="3.6" height="14.6" rx="1.8" />
                <rect x="14.9" y="4.7" width="3.6" height="14.6" rx="1.8" />
                <circle cx="16.7" cy="20.8" r="1.45" />
              </g>
            </svg>
            <span>SentinelX Console</span>
          </Link>
          <h1 className="text-xl font-bold text-white">Merchant Portal Sign In</h1>
          <p className="text-xs text-neutral-400">
            Access real-time risk controls, Razorpay nudge logs, and model metrics
          </p>
        </div>

        {/* 1-Click Demo Login Banner for Judges */}
        <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
            <Sparkles className="w-4 h-4" />
            Hackathon Judge Instant Access
          </div>
          <p className="text-xs text-amber-200/90 leading-relaxed">
            Click below to bypass manual registration and log directly into the pre-configured Demo Merchant Portal.
          </p>
          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={loading}
            className="btn btn-solid w-full text-xs font-semibold py-2.5 flex items-center justify-center gap-1.5 mt-1"
          >
            Instant Merchant Demo Login
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="relative flex items-center justify-center my-4">
          <div className="border-t border-white/10 w-full" />
          <span className="bg-black px-3 text-[11px] text-neutral-400 uppercase font-medium absolute">
            Or Sign In Manually
          </span>
        </div>

        {/* Form */}
        <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-neutral-300 font-medium mb-1">Store Email</label>
            <div className="relative">
              <Mail className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="merchant@store.com"
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-neutral-900 border border-white/15 text-white focus:outline-none focus:border-white/40"
              />
            </div>
          </div>

          <div>
            <label className="block text-neutral-300 font-medium mb-1">Password</label>
            <div className="relative">
              <KeyRound className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-neutral-900 border border-white/15 text-white focus:outline-none focus:border-white/40"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-ghost w-full text-xs font-semibold py-2.5"
          >
            Sign In with Email
          </button>
        </form>
      </div>
    </div>
  );
}
