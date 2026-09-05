"use client";

import { useEffect, useState } from "react";
import { BarChart3, MapPin, ShieldAlert, TrendingDown, Layers, Activity } from "lucide-react";
import { fetchMetrics, ModelMetricsData } from "@/lib/api";

export default function AnalyticsPage() {
  const [metrics, setMetrics] = useState<ModelMetricsData | null>(null);

  useEffect(() => {
    fetchMetrics().then(setMetrics);
  }, []);

  const tierData = metrics?.per_tier_breakdown || {
    "1": { precision: 0.1765, recall: 0.5185, support: 54 },
    "2": { precision: 0.2674, recall: 0.5960, support: 99 },
    "3": { precision: 0.3200, recall: 0.6154, support: 52 },
  };

  const highRiskPincodes = [
    { pincode: "841301", area: "Siwan / Bihar", tier: "Tier 3", rtoRate: "34.8%", topDriver: "Short Address + Impulse Time" },
    { pincode: "273001", area: "Gorakhpur / UP", tier: "Tier 3", rtoRate: "32.1%", topDriver: "COD Mode + First Order" },
    { pincode: "800001", area: "Patna / Bihar", tier: "Tier 2", rtoRate: "28.4%", topDriver: "Night Placement (23:00 hrs)" },
    { pincode: "302001", area: "Jaipur / Rajasthan", tier: "Tier 2", rtoRate: "26.2%", topDriver: "Delivery Est 5+ Days" },
    { pincode: "560001", area: "Bengaluru / KA", tier: "Tier 1", rtoRate: "11.2%", topDriver: "Landmark Keyword Present" },
  ];

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 w-full space-y-8">
      {/* Title */}
      <div>
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-sky-400" />
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Regional RTO Risk Analytics
          </h1>
        </div>
        <p className="text-xs text-neutral-400 mt-1">
          Geographic and demographic distribution of Cash-on-Delivery return risk across India
        </p>
      </div>

      {/* Tier Comparison Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl border border-white/10 bg-[#0a0a0a] space-y-2">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span className="font-semibold text-white">Tier 1 Metros</span>
            <MapPin className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono tabular-nums">
            ~11.5% <span className="text-xs font-normal text-emerald-400">RTO Rate</span>
          </div>
          <p className="text-[11px] text-neutral-400 leading-relaxed">
            High address specificity, 1-2 day delivery, high prepaid penetration.
          </p>
        </div>

        <div className="p-5 rounded-xl border border-white/10 bg-[#0a0a0a] space-y-2">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span className="font-semibold text-white">Tier 2 Growth Cities</span>
            <MapPin className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400 font-mono tabular-nums">
            ~26.7% <span className="text-xs font-normal text-neutral-400">RTO Rate</span>
          </div>
          <p className="text-[11px] text-neutral-400 leading-relaxed">
            Moderate COD reliance, 3-4 day delivery estimates, growing impulse zone.
          </p>
        </div>

        <div className="p-5 rounded-xl border border-white/10 bg-[#0a0a0a] space-y-2">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span className="font-semibold text-white">Tier 3 & Rural Towns</span>
            <MapPin className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-2xl font-bold text-red-400 font-mono tabular-nums">
            ~34.2% <span className="text-xs font-normal text-neutral-400">RTO Rate</span>
          </div>
          <p className="text-[11px] text-neutral-400 leading-relaxed">
            85%+ COD preference, landmark absence, 5-7 day delivery lead times.
          </p>
        </div>
      </div>

      {/* High-Risk Pincodes Table */}
      <div className="p-6 rounded-xl border border-white/10 bg-[#0a0a0a] space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white uppercase tracking-wider">
            Highest Risk Pincode Clusters
          </h2>
          <span className="text-xs text-neutral-400 font-mono">2,277 Postal Directory Evaluated</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-black/50 border-b border-white/10 text-neutral-400 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-4 py-2.5">Pincode</th>
                <th className="px-4 py-2.5">District / State</th>
                <th className="px-4 py-2.5">Classification</th>
                <th className="px-4 py-2.5">Baseline RTO</th>
                <th className="px-4 py-2.5">Primary SHAP Driver</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06] text-neutral-300">
              {highRiskPincodes.map((item, idx) => (
                <tr key={idx} className="hover:bg-white/[0.03]">
                  <td className="px-4 py-3 font-mono font-bold text-white">{item.pincode}</td>
                  <td className="px-4 py-3 text-neutral-200">{item.area}</td>
                  <td className="px-4 py-3 font-medium text-neutral-400">{item.tier}</td>
                  <td className="px-4 py-3 font-mono font-semibold text-amber-400">{item.rtoRate}</td>
                  <td className="px-4 py-3 text-neutral-400 font-mono text-[11px]">{item.topDriver}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
