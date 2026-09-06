"use client";

import Link from "next/link";
import { ExternalLink, Sparkles, ShieldCheck } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full border-t border-white/[0.08] bg-black/80 backdrop-blur-md mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-12 space-y-8">
        {/* Top Builder Spotlight Card */}
        <div className="p-6 rounded-2xl border border-white/15 bg-gradient-to-r from-neutral-950 via-neutral-900 to-neutral-950 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-300 text-[11px] font-medium">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Lead Architect & Builder</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              Priyanshu Kamal
            </h3>
            <p className="text-xs text-neutral-300 leading-relaxed">
              Designed & engineered for the <strong>Razorpay AI Buildathon (Track 02: AI Risk Manager)</strong>. Built with a defense-only philosophy to protect Indian D2C merchants from high COD Return-to-Origin (RTO) cash leakage using explainable XGBoost risk scoring and automated Razorpay incentive nudges.
            </p>
          </div>

          {/* Social Links */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {/* LinkedIn */}
            <a
              href="https://www.linkedin.com/in/priyanshukamal/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#0A66C2]/40 bg-[#0A66C2]/15 text-[#70B5F9] hover:bg-[#0A66C2]/25 hover:text-white transition-all text-xs font-semibold shadow-sm group"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.64c-.88 0-1.6.72-1.6 1.6s.72 1.6 1.6 1.6 1.6-.72 1.6-1.6-.72-1.6-1.6-1.6Z" />
              </svg>
              <span>Connect on LinkedIn</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100 transition-opacity" />
            </a>

            {/* GitHub */}
            <a
              href="https://github.com/priyanshukamal26/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/20 bg-white/5 text-white hover:bg-white/15 transition-all text-xs font-semibold shadow-sm group"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              <span>GitHub @priyanshukamal26</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100 transition-opacity" />
            </a>
          </div>
        </div>

        {/* Navigation & Credits */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>
              SentinelX · 100% Defense-Only RTO Risk Scoring Engine
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-neutral-300 font-medium">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
            <Link href="/analytics" className="hover:text-white transition-colors">Analytics</Link>
            <Link href="/metrics" className="hover:text-white transition-colors">Model Metrics</Link>
            <Link href="/audit" className="hover:text-white transition-colors">Audit Trail</Link>
            <Link href="/about" className="hover:text-white transition-colors">About & Architecture</Link>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="text-center text-[11px] text-neutral-500 pt-4 border-t border-white/[0.05]">
          Crafted with precision by <strong>Priyanshu Kamal</strong> for the Razorpay AI Buildathon 2026.
        </div>
      </div>
    </footer>
  );
}
