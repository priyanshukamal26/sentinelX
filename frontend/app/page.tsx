"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ShieldCheck,
  FileText,
  Sparkles,
  Activity,
  Cpu,
  Zap,
  CheckCircle2,
  Lock,
  Layers,
  ShoppingBag,
  HelpCircle,
} from "lucide-react";
import QuickScoreWidget from "@/components/QuickScoreWidget";
import ROICalculator from "@/components/ROICalculator";

export default function LandingPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoLoaded, setVideoLoaded] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let loaded = false;
    const handleLoadedData = () => {
      loaded = true;
      setVideoLoaded(true);
    };
    const handleError = () => {
      video.style.display = "none";
    };

    video.addEventListener("loadeddata", handleLoadedData);
    video.addEventListener("error", handleError);

    const timer = setTimeout(() => {
      if (!loaded && video) {
        video.style.display = "none";
      }
    }, 4000);

    return () => {
      clearTimeout(timer);
      video.removeEventListener("loadeddata", handleLoadedData);
      video.removeEventListener("error", handleError);
    };
  }, []);

  return (
    <div className="relative w-full bg-black text-white overflow-x-hidden">
      {/* ─── HERO SECTION ─── */}
      <section className="relative min-h-[92vh] flex flex-col justify-between overflow-hidden">
        {/* Background Fallback Layer */}
        <div
          className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_50%_30%,#1a1a1a_0%,#000000_65%)]"
          aria-hidden="true"
        />

        {/* Hero Background Video */}
        <video
          ref={videoRef}
          className="absolute inset-0 z-0 w-full h-full object-cover pointer-events-none transition-opacity duration-1000"
          style={{ opacity: videoLoaded ? 1 : 0 }}
          autoPlay
          muted
          loop
          playsInline
          aria-hidden="true"
          src="/hero-bg.mp4"
        />

        {/* Bottom Scrim for text contrast */}
        <div
          className="absolute inset-0 z-0 pointer-events-none bg-gradient-to-t from-black via-black/40 to-transparent"
          aria-hidden="true"
        />

        {/* Hero Content Section */}
        <div className="relative z-10 max-w-5xl mx-auto px-6 pt-16 md:pt-24 pb-12 flex-1 flex flex-col justify-center items-center text-center space-y-6">
          {/* Badge */}
          <div className="appear appear--soft inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/20 bg-gradient-to-r from-neutral-800 via-neutral-900 to-black text-xs font-medium text-white/90 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Operational Risk Infrastructure</span>
          </div>

          {/* H1 Headline */}
          <h1 className="appear appear--soft text-4xl sm:text-5xl md:text-6xl font-medium tracking-tight text-white leading-[1.12] max-w-3xl">
            Catch <span className="font-serif-accent text-[1.1em] text-neutral-400">risky orders</span> before
            <br className="hidden sm:inline" /> they become returns.
          </h1>

          {/* Lede Paragraph */}
          <p className="appear appear--soft text-sm sm:text-base text-neutral-400 max-w-xl leading-relaxed">
            SentinelX scores every COD order in real time and nudges only the highest-risk
            toward prepaid — never blocking a customer, always logged.
          </p>

          {/* Quick Score Interactive Widget */}
          <div className="appear appear--soft w-full pt-2">
            <QuickScoreWidget />
          </div>

          {/* Hero Action Buttons */}
          <div className="appear appear--soft pt-2 flex flex-wrap items-center justify-center gap-4">
            <Link href="/dashboard" className="btn btn-solid btn-hero font-semibold text-sm">
              View Merchant Dashboard
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
            <Link href="/metrics" className="btn btn-ghost btn-hero text-sm">
              See Held-Out ML Metrics
            </Link>
          </div>
        </div>

        {/* Stats Strip */}
        <div className="relative z-10 border-t border-white/[0.1] bg-black/60 backdrop-blur-md py-4">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-center md:text-left">
            <div className="appear appear--stat flex items-center justify-center md:justify-start gap-3">
              <div className="p-2 rounded-md bg-white/[0.06] border border-white/[0.12]">
                <Activity className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-xs text-neutral-300">
                <span className="font-semibold text-white">28–35%</span> typical COD RTO rate in India
              </div>
            </div>

            <div className="appear appear--stat flex items-center justify-center md:justify-start gap-3">
              <div className="p-2 rounded-md bg-white/[0.06] border border-white/[0.12]">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-xs text-neutral-300">
                <span className="font-semibold text-white">100% test-mode</span> — zero real money moved
              </div>
            </div>

            <Link
              href="/audit"
              className="appear appear--stat flex items-center justify-center md:justify-start gap-3 text-neutral-300 hover:text-white transition-colors group"
            >
              <div className="p-2 rounded-md bg-white/[0.06] border border-white/[0.12] group-hover:border-white/30">
                <FileText className="w-4 h-4 text-sky-400" />
              </div>
              <div className="text-xs">
                Every decision logged — <span className="underline underline-offset-2">view audit trail</span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── SECTION 2: INTERACTIVE ROI CALCULATOR ─── */}
      <section className="py-20 px-6 border-t border-white/10 bg-gradient-to-b from-black via-neutral-950 to-black">
        <ROICalculator />
      </section>

      {/* ─── SECTION 3: HOW IT WORKS (3-STEP PIPELINE) ─── */}
      <section className="py-20 px-6 max-w-6xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-white/15 bg-white/[0.04] text-xs text-neutral-300 font-medium">
            <Cpu className="w-3.5 h-3.5 text-sky-400" />
            <span>Architecture & Workflow</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-white">
            How SentinelX Protects Merchant Margins
          </h2>
          <p className="text-sm text-neutral-400 max-w-xl mx-auto">
            A defense-only pipeline operating silently between order placement and fulfillment.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 1 */}
          <div className="p-6 rounded-xl border border-white/10 bg-[#0a0a0a] space-y-3 relative">
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-sm">
              1
            </div>
            <h3 className="text-base font-semibold text-white">Checkout Telemetry</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              SentinelX extracts 10 grounded signals at checkout — pincode tier lookup across 2,277 postal codes, address character length, landmark keywords, and nighttime impulse placement hours.
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-6 rounded-xl border border-white/10 bg-[#0a0a0a] space-y-3 relative">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-sm">
              2
            </div>
            <h3 className="text-base font-semibold text-white">XGBoost & SHAP Inference</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              The trained XGBoost model scores failure probability against the optimal threshold (0.4467). SHAP TreeExplainer generates mathematical feature attributions translated by LLM into plain English.
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-6 rounded-xl border border-white/10 bg-[#0a0a0a] space-y-3 relative">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm">
              3
            </div>
            <h3 className="text-base font-semibold text-white">Defense-Only Prepaid Nudge</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Low-risk orders proceed with zero friction. High-risk orders trigger an automated Razorpay test-mode payment link offering a 5% discount to switch to prepaid. Zero customers blocked.
            </p>
          </div>
        </div>
      </section>

      {/* ─── SECTION 4: PLATFORM INTEGRATIONS ─── */}
      <section className="py-16 px-6 border-y border-white/10 bg-[#070707]">
        <div className="max-w-5xl mx-auto text-center space-y-8">
          <div>
            <h3 className="text-xs uppercase tracking-wider text-neutral-400 font-semibold mb-2">
              Seamless Integration Ecosystem
            </h3>
            <h2 className="text-2xl font-bold text-white">
              Connect SentinelX to Your Store Stack in Minutes
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl border border-white/10 bg-neutral-950 flex flex-col items-center gap-2">
              <ShoppingBag className="w-6 h-6 text-emerald-400" />
              <span className="text-xs font-semibold text-white">Shopify App</span>
              <span className="text-[10px] text-neutral-400">Checkout Extension</span>
            </div>

            <div className="p-4 rounded-xl border border-white/10 bg-neutral-950 flex flex-col items-center gap-2">
              <Layers className="w-6 h-6 text-sky-400" />
              <span className="text-xs font-semibold text-white">WooCommerce</span>
              <span className="text-[10px] text-neutral-400">WordPress Plugin</span>
            </div>

            <div className="p-4 rounded-xl border border-white/10 bg-neutral-950 flex flex-col items-center gap-2">
              <Zap className="w-6 h-6 text-amber-400" />
              <span className="text-xs font-semibold text-white">Razorpay Magic</span>
              <span className="text-[10px] text-neutral-400">1-Click Checkout</span>
            </div>

            <div className="p-4 rounded-xl border border-white/10 bg-neutral-950 flex flex-col items-center gap-2">
              <Lock className="w-6 h-6 text-purple-400" />
              <span className="text-xs font-semibold text-white">REST API</span>
              <span className="text-[10px] text-neutral-400">Custom Integration</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 5: FAQ ─── */}
      <section className="py-20 px-6 max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <HelpCircle className="w-6 h-6 text-neutral-400 mx-auto" />
          <h2 className="text-2xl font-bold text-white">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-4 text-xs sm:text-sm">
          <div className="p-5 rounded-xl border border-white/10 bg-[#0a0a0a] space-y-2">
            <div className="font-semibold text-white">Does SentinelX ever block or cancel an order?</div>
            <div className="text-neutral-400 leading-relaxed">
              No, never. SentinelX follows a strict defense-only philosophy. Normal orders proceed as regular COD. High-risk orders are offered a 5% discount link to convert to prepaid. If the customer ignores the offer, the order still dispatches normally.
            </div>
          </div>

          <div className="p-5 rounded-xl border border-white/10 bg-[#0a0a0a] space-y-2">
            <div className="font-semibold text-white">How are the model metrics evaluated?</div>
            <div className="text-neutral-400 leading-relaxed">
              Model performance is evaluated on a held-out test set of 2,000 un-seen orders. The optimal F1 threshold (0.4467) yields 26.1% Precision and 58.1% Recall — honest numbers computed on realistic synthetic distributions.
            </div>
          </div>

          <div className="p-5 rounded-xl border border-white/10 bg-[#0a0a0a] space-y-2">
            <div className="font-semibold text-white">How are webhook payments processed?</div>
            <div className="text-neutral-400 leading-relaxed">
              When a customer completes a Razorpay payment link, Razorpay posts a webhook signed with HMAC-SHA256 signature to SentinelX backend, updating the status to <code>converted_prepaid</code> and logging the transaction in the audit trail.
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 px-6 text-center text-xs text-neutral-400 space-y-3">
        <div>
          SentinelX · Built for <strong>Razorpay AI Buildathon (Track 02: AI Risk Manager)</strong>
        </div>
        <div className="flex justify-center gap-4 text-neutral-300 font-medium">
          <Link href="/dashboard" className="hover:underline">Dashboard</Link>
          <Link href="/metrics" className="hover:underline">Held-Out Metrics</Link>
          <Link href="/audit" className="hover:underline">Audit Trail</Link>
          <Link href="/about" className="hover:underline">About & Tech Stack</Link>
        </div>
      </footer>
    </div>
  );
}
