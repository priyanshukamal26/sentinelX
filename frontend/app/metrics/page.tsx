"use client";

import { useEffect, useState } from "react";
import { Activity, ShieldCheck, AlertCircle, TrendingUp, Info } from "lucide-react";
import { fetchMetrics, ModelMetricsData } from "@/lib/api";

export default function MetricsPage() {
  const [metrics, setMetrics] = useState<ModelMetricsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics().then((data) => {
      setMetrics(data);
      setLoading(false);
    });
  }, []);

  const cm = metrics?.confusion_matrix || { tp: 119, fp: 337, tn: 1403, fn: 86 };
  const totalHeldOut = cm.tp + cm.fp + cm.tn + cm.fn;

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 w-full space-y-8">
      {/* Title */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Model Performance & Validation
          </h1>
          <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-white/10 text-neutral-300">
            {metrics?.version || "v1"} · XGBoost
          </span>
        </div>
        <p className="text-xs text-neutral-400 mt-1">
          Held-out test set evaluation (2,000 un-seen orders) evaluated at selected F1-optimal threshold (0.4467)
        </p>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="appear appear--stat p-4 rounded-lg border border-white/10 bg-[#0a0a0a]">
          <div className="text-xs text-neutral-400 font-medium">Precision (Held-out)</div>
          <div className="mt-2 text-2xl sm:text-3xl font-bold text-white tabular-nums">
            {metrics ? `${(metrics.precision * 100).toFixed(1)}%` : "26.1%"}
          </div>
          <div className="text-[11px] text-neutral-400 mt-1">
            26% of nudged orders would have been RTO
          </div>
        </div>

        <div className="appear appear--stat p-4 rounded-lg border border-white/10 bg-[#0a0a0a]" style={{ animationDelay: "0.1s" }}>
          <div className="text-xs text-neutral-400 font-medium">Recall (Held-out)</div>
          <div className="mt-2 text-2xl sm:text-3xl font-bold text-amber-400 tabular-nums">
            {metrics ? `${(metrics.recall * 100).toFixed(1)}%` : "58.1%"}
          </div>
          <div className="text-[11px] text-neutral-400 mt-1">
            Captures 58% of all true RTO attempts
          </div>
        </div>

        <div className="appear appear--stat p-4 rounded-lg border border-white/10 bg-[#0a0a0a]" style={{ animationDelay: "0.2s" }}>
          <div className="text-xs text-neutral-400 font-medium">F1 Score</div>
          <div className="mt-2 text-2xl sm:text-3xl font-bold text-white tabular-nums">
            {metrics ? metrics.f1.toFixed(3) : "0.360"}
          </div>
          <div className="text-[11px] text-neutral-400 mt-1">
            Balanced harmonic mean
          </div>
        </div>

        <div className="appear appear--stat p-4 rounded-lg border border-white/10 bg-[#0a0a0a]" style={{ animationDelay: "0.3s" }}>
          <div className="text-xs text-neutral-400 font-medium">Decision Threshold</div>
          <div className="mt-2 text-2xl sm:text-3xl font-bold text-emerald-400 tabular-nums">
            {metrics ? metrics.threshold.toFixed(4) : "0.4467"}
          </div>
          <div className="text-[11px] text-neutral-400 mt-1">
            Selected via validation PR-curve
          </div>
        </div>
      </div>

      {/* Confusion Matrix & Feature Importance Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Confusion Matrix */}
        <div className="p-6 rounded-xl border border-white/10 bg-[#0a0a0a] space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider">
              Held-Out Confusion Matrix
            </h2>
            <span className="text-[11px] font-mono text-neutral-400">N = {totalHeldOut}</span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-center">
            {/* TP */}
            <div className="p-4 rounded-lg border border-emerald-500/40 bg-emerald-500/[0.06] shadow-[0_0_15px_rgba(47,191,113,0.15)]">
              <div className="text-[11px] text-neutral-400 uppercase font-medium">True Positive (TP)</div>
              <div className="text-2xl font-bold text-emerald-400 tabular-nums mt-1">{cm.tp}</div>
              <div className="text-[10px] text-neutral-400 mt-0.5">High risk & correctly flagged</div>
            </div>

            {/* FP */}
            <div className="p-4 rounded-lg border border-amber-500/40 bg-amber-500/[0.06] shadow-[0_0_15px_rgba(224,163,54,0.15)]">
              <div className="text-[11px] text-neutral-400 uppercase font-medium">False Positive (FP)</div>
              <div className="text-2xl font-bold text-amber-400 tabular-nums mt-1">{cm.fp}</div>
              <div className="text-[10px] text-neutral-400 mt-0.5">Safe order received 5% discount</div>
            </div>

            {/* FN */}
            <div className="p-4 rounded-lg border border-red-500/40 bg-red-500/[0.06] shadow-[0_0_15px_rgba(224,82,90,0.15)]">
              <div className="text-[11px] text-neutral-400 uppercase font-medium">False Negative (FN)</div>
              <div className="text-2xl font-bold text-red-400 tabular-nums mt-1">{cm.fn}</div>
              <div className="text-[10px] text-neutral-400 mt-0.5">RTO missed by model</div>
            </div>

            {/* TN */}
            <div className="p-4 rounded-lg border border-white/20 bg-white/[0.04]">
              <div className="text-[11px] text-neutral-400 uppercase font-medium">True Negative (TN)</div>
              <div className="text-2xl font-bold text-white tabular-nums mt-1">{cm.tn}</div>
              <div className="text-[10px] text-neutral-400 mt-0.5">Safe order untouched</div>
            </div>
          </div>
        </div>

        {/* Global SHAP Feature Importance */}
        <div className="p-6 rounded-xl border border-white/10 bg-[#0a0a0a] space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider">
              Top Feature Importances
            </h2>
            <span className="text-[11px] text-neutral-400">TreeExplainer Mean |SHAP|</span>
          </div>

          <div className="space-y-3 pt-1">
            {metrics?.feature_importance ? (
              Object.entries(metrics.feature_importance).slice(0, 6).map(([feat, imp], i) => (
                <div key={i} className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-neutral-300 font-mono">{feat.replace(/_/g, " ")}</span>
                    <span className="text-white font-mono tabular-nums font-medium">{Number(imp).toFixed(3)}</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-white/[0.08] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-neutral-200"
                      style={{ width: `${Math.min(Math.round((Number(imp) / 0.85) * 100), 100)}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-xs text-neutral-400">Loading feature importance...</div>
            )}
          </div>
        </div>
      </div>

      {/* Per-Tier Breakdown Table */}
      <div className="p-6 rounded-xl border border-white/10 bg-[#0a0a0a] space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-white uppercase tracking-wider">
            Per-City-Tier Breakdown
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Proves model does not discriminate by blanket-flagging Tier 3, but scores across all tiers
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-black/50 border-b border-white/10 text-neutral-400 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-4 py-2.5">Tier</th>
                <th className="px-4 py-2.5">Location Type</th>
                <th className="px-4 py-2.5">Precision</th>
                <th className="px-4 py-2.5">Recall</th>
                <th className="px-4 py-2.5">Support (Test RTOs)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              <tr>
                <td className="px-4 py-3 font-semibold text-white">Tier 1</td>
                <td className="px-4 py-3 text-neutral-300">Metro Hubs (Bengaluru, Delhi, Mumbai...)</td>
                <td className="px-4 py-3 font-mono text-white">17.6%</td>
                <td className="px-4 py-3 font-mono text-amber-400">51.9%</td>
                <td className="px-4 py-3 font-mono text-neutral-400">54</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold text-white">Tier 2</td>
                <td className="px-4 py-3 text-neutral-300">Growth Cities (Jaipur, Patna, Lucknow...)</td>
                <td className="px-4 py-3 font-mono text-white">26.7%</td>
                <td className="px-4 py-3 font-mono text-amber-400">59.6%</td>
                <td className="px-4 py-3 font-mono text-neutral-400">99</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold text-white">Tier 3</td>
                <td className="px-4 py-3 text-neutral-300">Emerging Towns & Rural Districts</td>
                <td className="px-4 py-3 font-mono text-white">32.0%</td>
                <td className="px-4 py-3 font-mono text-amber-400">61.5%</td>
                <td className="px-4 py-3 font-mono text-neutral-400">52</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* False-Positive-Cost Callout Box (per spec: Instrument Serif italic emphasis) */}
      <div className="p-6 rounded-xl border border-white/15 bg-neutral-950 space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-white uppercase tracking-wider">
          <Info className="w-4 h-4 text-neutral-400" />
          The Asymmetric Cost of False Positives
        </div>
        <p className="text-sm text-neutral-200 leading-relaxed">
          In fraud detection, a false positive blocks a legitimate user and creates anger. In SentinelX, a false positive is{" "}
          <span className="font-serif-accent text-[1.15em] text-neutral-300">a low-severity</span> outcome: a genuine customer simply gets offered a 5% discount to pay prepaid. If they accept, the merchant saves payment processing hassles; if they decline, the order proceeds as normal COD. Zero customers are ever blocked.
        </p>
      </div>

      {/* What this model doesn't do (Honest Limitations Box) */}
      <div className="p-6 rounded-xl border border-white/10 bg-[#0a0a0a] space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider">
          <AlertCircle className="w-4 h-4" />
          What This Model Does Not Do (Honest Architecture Boundaries)
        </div>
        <ul className="text-xs text-neutral-300 space-y-2 list-disc list-inside leading-relaxed">
          <li>
            <strong>Does not auto-cancel orders:</strong> SentinelX is strictly defense-only. No customer order is ever automatically rejected or cancelled without human or merchant intervention.
          </li>
          <li>
            <strong>Does not claim 99% accuracy:</strong> Synthetic e-commerce RTO is noisy (precision ~26%, recall ~58%). These are realistic numbers for a problem where consumer intent is volatile.
          </li>
          <li>
            <strong>Does not replace logistics partner tracking:</strong> Once an order is handed to the 3PL courier (Delhivery, BlueDart, Shadowfax), NDR (Non-Delivery Report) workflows take over physical delivery.
          </li>
        </ul>
      </div>
    </div>
  );
}
