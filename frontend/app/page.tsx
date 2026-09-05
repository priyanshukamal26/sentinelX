"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, ShieldCheck, FileText, Sparkles, Activity } from "lucide-react";

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
    <div className="relative flex-1 flex flex-col justify-between overflow-hidden min-h-[calc(100vh-57px)]">
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

      {/* Subtle Bottom Scrim for crisp text contrast */}
      <div
        className="absolute inset-0 z-0 pointer-events-none bg-gradient-to-t from-black via-black/40 to-transparent"
        aria-hidden="true"
      />

      {/* Hero Content Section */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 pt-16 md:pt-28 pb-12 flex-1 flex flex-col justify-center items-center text-center">
        {/* Badge */}
        <div className="appear appear--soft mb-6 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/20 bg-gradient-to-r from-neutral-800 via-neutral-900 to-black text-xs font-medium text-white/90 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Operational Risk Infrastructure</span>
        </div>

        {/* H1 Headline with Instrument Serif accent */}
        <h1 className="appear appear--soft text-4xl sm:text-5xl md:text-6xl font-medium tracking-tight text-white leading-[1.12] max-w-3xl">
          Catch <span className="font-serif-accent text-[1.1em] text-neutral-400">risky orders</span> before
          <br className="hidden sm:inline" /> they become returns.
        </h1>

        {/* Lede Paragraph */}
        <p className="appear appear--soft mt-6 text-sm sm:text-base text-neutral-400 max-w-xl leading-relaxed">
          SentinelX scores every COD order in real time and nudges only the highest-risk
          toward prepaid — never blocking a customer, always logged.
        </p>

        {/* Action Buttons */}
        <div className="appear appear--soft mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link href="/dashboard" className="btn btn-solid btn-hero font-semibold text-sm">
            View Dashboard
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
          <Link href="/metrics" className="btn btn-ghost btn-hero text-sm">
            See a live score
          </Link>
        </div>
      </div>

      {/* Stats Footer (Ground truth, cited industry stats, honest disclosures) */}
      <footer className="relative z-10 border-t border-white/[0.1] bg-black/60 backdrop-blur-md py-5">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
          {/* Stat 1 */}
          <div className="appear appear--stat flex items-center justify-center md:justify-start gap-3">
            <div className="p-2 rounded-md bg-white/[0.06] border border-white/[0.12] text-neutral-300">
              <Activity className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-xs text-neutral-300">
              <span className="font-semibold text-white">28–35%</span> typical COD RTO rate in India
            </div>
          </div>

          {/* Stat 2 */}
          <div className="appear appear--stat flex items-center justify-center md:justify-start gap-3">
            <div className="p-2 rounded-md bg-white/[0.06] border border-white/[0.12] text-neutral-300">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-xs text-neutral-300">
              <span className="font-semibold text-white">100% test-mode</span> — zero real money moved
            </div>
          </div>

          {/* Stat 3 */}
          <Link
            href="/audit"
            className="appear appear--stat flex items-center justify-center md:justify-start gap-3 text-neutral-300 hover:text-white transition-colors group"
          >
            <div className="p-2 rounded-md bg-white/[0.06] border border-white/[0.12] text-neutral-300 group-hover:border-white/30">
              <FileText className="w-4 h-4 text-sky-400" />
            </div>
            <div className="text-xs">
              Every decision logged — <span className="underline underline-offset-2">view audit trail</span>
            </div>
          </Link>
        </div>
      </footer>
    </div>
  );
}
