"use client";

import { useState } from "react";
import { IndianRupee, TrendingUp, ShieldCheck, Zap, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function ROICalculator() {
  const [monthlyOrders, setMonthlyOrders] = useState(5000);
  const [avgOrderValue, setAvgOrderValue] = useState(1400);
  const [currentRtoRate, setCurrentRtoRate] = useState(30);

  // Calculations
  const monthlyCodOrders = Math.round(monthlyOrders * 0.70); // ~70% COD in India D2C
  const rawRtoOrders = Math.round(monthlyCodOrders * (currentRtoRate / 100));
  
  // Cost of RTO per failed order (reverse freight + packaging loss ~ 25% of order value + ₹100 fixed)
  const rtoCostPerOrder = avgOrderValue * 0.25 + 100;
  const currentMonthlyLoss = Math.round(rawRtoOrders * rtoCostPerOrder);
  
  // SentinelX Impact:
  // Flags ~35% of orders as high risk. Nudges convert ~40% of flagged orders to prepaid.
  const flaggedOrders = Math.round(monthlyCodOrders * 0.35);
  const convertedPrepaid = Math.round(flaggedOrders * 0.42);
  
  // New RTO rate after conversion
  const remainingRtoOrders = Math.max(0, rawRtoOrders - convertedPrepaid);
  const newRtoRate = ((remainingRtoOrders / monthlyCodOrders) * 100).toFixed(1);
  
  const monthlySaved = Math.round(convertedPrepaid * rtoCostPerOrder);
  const annualSaved = monthlySaved * 12;

  return (
    <div className="w-full max-w-4xl mx-auto p-6 sm:p-8 rounded-2xl border border-white/15 bg-neutral-950/80 backdrop-blur-xl shadow-2xl space-y-8">
      {/* Title */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-semibold">
          <Zap className="w-3.5 h-3.5" />
          <span>Interactive Savings Estimator</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
          Calculate Your Merchant RTO Savings
        </h2>
        <p className="text-xs sm:text-sm text-neutral-400 max-w-xl mx-auto">
          See how much revenue your store recovers by converting high-risk COD buyers into prepaid orders.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Sliders Input Column */}
        <div className="space-y-6">
          {/* Monthly Total Orders */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-neutral-300 font-medium">Monthly Total Orders</span>
              <span className="font-mono text-white font-bold tabular-nums">
                {monthlyOrders.toLocaleString("en-IN")} orders
              </span>
            </div>
            <input
              type="range"
              min="500"
              max="50000"
              step="500"
              value={monthlyOrders}
              onChange={(e) => setMonthlyOrders(parseInt(e.target.value))}
              className="w-full h-2 rounded-lg bg-neutral-800 accent-emerald-500 cursor-pointer"
            />
          </div>

          {/* Average Order Value (AOV) */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-neutral-300 font-medium">Average Order Value (AOV)</span>
              <span className="font-mono text-emerald-400 font-bold tabular-nums">
                ₹{avgOrderValue.toLocaleString("en-IN")}
              </span>
            </div>
            <input
              type="range"
              min="400"
              max="5000"
              step="100"
              value={avgOrderValue}
              onChange={(e) => setAvgOrderValue(parseInt(e.target.value))}
              className="w-full h-2 rounded-lg bg-neutral-800 accent-emerald-500 cursor-pointer"
            />
          </div>

          {/* Current COD RTO Failure Rate */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-neutral-300 font-medium">Current COD Failure Rate</span>
              <span className="font-mono text-amber-400 font-bold tabular-nums">
                {currentRtoRate}%
              </span>
            </div>
            <input
              type="range"
              min="15"
              max="45"
              step="1"
              value={currentRtoRate}
              onChange={(e) => setCurrentRtoRate(parseInt(e.target.value))}
              className="w-full h-2 rounded-lg bg-neutral-800 accent-amber-500 cursor-pointer"
            />
          </div>

          <div className="p-3 rounded-lg bg-white/[0.03] border border-white/10 text-xs text-neutral-400 leading-relaxed">
            *Includes reverse logistics freight, repackaging, and inventory lockup costs estimated at ~25% AOV + ₹100 per RTO.
          </div>
        </div>

        {/* Results Card Column */}
        <div className="p-6 rounded-xl border border-emerald-500/30 bg-gradient-to-b from-emerald-500/10 via-neutral-900/80 to-black space-y-6 shadow-xl">
          <div>
            <div className="text-xs uppercase tracking-wider text-emerald-400 font-semibold mb-1">
              Estimated Annual Revenue Saved
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold text-white font-mono tabular-nums tracking-tight">
              ₹{annualSaved.toLocaleString("en-IN")}
            </div>
            <div className="text-xs text-neutral-400 mt-1">
              ≈ ₹{monthlySaved.toLocaleString("en-IN")} / month recovered
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/10 text-xs">
            <div className="p-3 rounded bg-black/50 border border-white/10">
              <div className="text-neutral-400 text-[11px]">RTO Rate Reduction</div>
              <div className="text-lg font-bold text-white font-mono mt-1">
                {currentRtoRate}% → <span className="text-emerald-400">{newRtoRate}%</span>
              </div>
            </div>

            <div className="p-3 rounded bg-black/50 border border-white/10">
              <div className="text-neutral-400 text-[11px]">Prepaid Conversions</div>
              <div className="text-lg font-bold text-emerald-400 font-mono mt-1">
                +{convertedPrepaid} <span className="text-xs text-neutral-400">/mo</span>
              </div>
            </div>
          </div>

          <Link
            href="/dashboard"
            className="btn btn-solid w-full text-xs font-semibold py-3 flex justify-center items-center gap-1.5"
          >
            Start Saving Revenue on Dashboard
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
