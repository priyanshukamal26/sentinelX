"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Lock,
  Mail,
  KeyRound,
  Store,
  CheckCircle2,
  Scale,
} from "lucide-react";
import {
  MERCHANT_PROFILES,
  MerchantProfile,
  setCurrentUser,
} from "@/lib/auth";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [storeName, setStoreName] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);

  const handleSelectProfile = (profile: MerchantProfile) => {
    setSelectedProfileId(profile.id);
    setLoading(true);
    setTimeout(() => {
      setCurrentUser(profile);
      router.push(redirectPath);
    }, 300);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const customProfile: MerchantProfile = {
      id: `custom_${Date.now().toString().slice(-4)}`,
      name: storeName.trim() || email.split("@")[0] || "Custom Merchant",
      storeDomain: `${(storeName || "store").toLowerCase().replace(/\s+/g, "")}.in`,
      category: "D2C General",
      productCategories: [],
      defaultThreshold: 0.4467,
      defaultDiscount: 5,
      avatar: "🛍️",
      badgeColor: "border-emerald-500/30 text-emerald-300 bg-emerald-500/10",
      description: "Custom merchant store instance.",
    };
    setCurrentUser(customProfile);
    router.push(redirectPath);
  };

  return (
    <div className="flex-1 flex items-center justify-center px-6 py-12 bg-black">
      <div className="w-full max-w-xl space-y-6">
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
          <h1 className="text-2xl font-bold text-white tracking-tight">Merchant & Evaluator Portal</h1>
          <p className="text-xs text-neutral-400 max-w-md mx-auto">
            Choose a merchant account to inspect customer-specific risk thresholds, or enter Judge Master View for cross-account evaluation.
          </p>
        </div>

        {/* Section 1: Hackathon Judge Master Access */}
        <div className="p-5 rounded-xl border border-amber-500/40 bg-amber-500/10 shadow-[0_0_20px_rgba(245,158,11,0.1)] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-300">
              <Scale className="w-4 h-4 text-amber-400" />
              <span>Hackathon Judge Master Access</span>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-400/20 text-amber-200 border border-amber-400/30 font-medium">
              EVALUATOR MODE
            </span>
          </div>
          <p className="text-xs text-amber-200/85 leading-relaxed">
            See all orders from across accounts in a single master dashboard, compare individual store thresholds, and review held-out model metrics.
          </p>
          <button
            type="button"
            onClick={() => handleSelectProfile(MERCHANT_PROFILES.judge_master)}
            disabled={loading}
            className="btn btn-solid w-full text-xs font-semibold py-2.5 flex items-center justify-center gap-1.5 shadow-md hover:scale-[1.01] transition-transform"
          >
            Launch Judge Master View (All Accounts)
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Section 2: Store-Specific Profiles */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-medium text-neutral-300">
            <span>Or Sign In as a Specific Merchant Store:</span>
            <span className="text-[11px] text-neutral-500">Account-specific thresholds</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              MERCHANT_PROFILES.urban_vogue,
              MERCHANT_PROFILES.kicks_india,
              MERCHANT_PROFILES.aura_electronics,
            ].map((profile) => {
              const isSelected = selectedProfileId === profile.id;
              return (
                <button
                  key={profile.id}
                  type="button"
                  onClick={() => handleSelectProfile(profile)}
                  disabled={loading}
                  className={`p-3.5 rounded-xl border text-left flex flex-col justify-between transition-all group ${
                    isSelected
                      ? "border-white bg-neutral-800"
                      : "border-white/10 bg-neutral-900/80 hover:border-white/25 hover:bg-neutral-900"
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xl">{profile.avatar}</span>
                      <span className="text-[10px] font-mono text-neutral-400 bg-white/5 px-1.5 py-0.5 rounded">
                        Thresh: {profile.defaultThreshold}
                      </span>
                    </div>
                    <div className="font-semibold text-white text-xs group-hover:text-amber-400 transition-colors">
                      {profile.name}
                    </div>
                    <div className="text-[11px] text-neutral-400 line-clamp-2 leading-snug">
                      {profile.category}
                    </div>
                  </div>
                  <div className="pt-3 mt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-neutral-300">
                    <span>Sign In</span>
                    <ArrowRight className="w-3 h-3 text-neutral-400 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="relative flex items-center justify-center my-2">
          <div className="border-t border-white/10 w-full" />
          <span className="bg-black px-3 text-[11px] text-neutral-500 uppercase font-medium absolute">
            Custom Store Sign In
          </span>
        </div>

        {/* Section 3: Custom Credentials Form */}
        <form onSubmit={handleCustomSubmit} className="p-4 rounded-xl border border-white/10 bg-neutral-950 space-y-3 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-neutral-400 font-medium mb-1">Store Name</label>
              <div className="relative">
                <Store className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="e.g. Acme Lifestyle"
                  className="w-full pl-8 pr-3 py-2 rounded-lg bg-neutral-900 border border-white/15 text-white placeholder-neutral-500 focus:outline-none focus:border-white/30"
                />
              </div>
            </div>
            <div>
              <label className="block text-neutral-400 font-medium mb-1">Store Email</label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="founder@store.in"
                  className="w-full pl-8 pr-3 py-2 rounded-lg bg-neutral-900 border border-white/15 text-white placeholder-neutral-500 focus:outline-none focus:border-white/30"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-ghost w-full text-xs font-semibold py-2 mt-1"
          >
            Launch Custom Store Instance
          </button>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex-1 flex items-center justify-center p-12 text-neutral-400 text-xs">Loading portal...</div>}>
      <LoginForm />
    </Suspense>
  );
}
