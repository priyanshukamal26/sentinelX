"use client";

import { useState } from "react";
import { Sparkles, ArrowRight, Loader2, CheckCircle2, ShieldAlert } from "lucide-react";
import { createOrder } from "@/lib/api";
import Link from "next/link";

export default function QuickScoreWidget() {
  const [pincode, setPincode] = useState("");
  const [orderValue, setOrderValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    id: string;
    risk_score: number;
    risk_band: "low" | "medium" | "high";
    explanation: string;
  } | null>(null);

  const isFormValid = pincode.trim().length >= 6 && parseFloat(orderValue) > 0;

  const handleQuickScore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    setLoading(true);
    try {
      const res = await createOrder({
        pincode: pincode.trim(),
        payment_mode: "COD",
        order_value: parseFloat(orderValue) || 1499,
        is_first_order: true,
        address: "Main Bazar Road, Near Temple",
      });
      setResult(res);
    } catch (err) {
      // Demo fallback
      setResult({
        id: "quick_demo",
        risk_score: 0.78,
        risk_band: "high",
        explanation: "Flagged mainly due to: Tier 3 pincode, COD payment mode, impulse order value.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto p-4 rounded-xl border border-white/20 bg-black/70 backdrop-blur-md shadow-2xl">
      <form onSubmit={handleQuickScore} className="flex flex-col sm:flex-row items-center gap-2">
        <div className="flex-1 w-full grid grid-cols-2 gap-2">
          <input
            type="text"
            value={pincode}
            maxLength={6}
            onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))}
            placeholder="Pincode (e.g. 560001)"
            className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-white/15 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white/30"
          />
          <input
            type="number"
            value={orderValue}
            onChange={(e) => setOrderValue(e.target.value)}
            placeholder="Order Value ₹ (e.g. 1499)"
            className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-white/15 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white/30"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !isFormValid}
          className={`btn btn-solid text-xs font-semibold w-full sm:w-auto shrink-0 py-2 px-4 ${
            !isFormValid ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {loading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <>
              Score Instantly
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </>
          )}
        </button>
      </form>

      {result && (
        <div className="mt-3 p-3 rounded-lg border border-white/15 bg-neutral-900/90 text-xs flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <span className={`risk-badge ${result.risk_band}`}>
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              {Math.round(result.risk_score * 100)}% {result.risk_band.toUpperCase()}
            </span>
            <span className="text-neutral-300 truncate max-w-[240px]">
              {result.explanation}
            </span>
          </div>
          {result.id !== "quick_demo" ? (
            <Link
              href={`/dashboard/orders/${result.id}`}
              className="text-emerald-400 font-semibold hover:underline shrink-0 text-[11px]"
            >
              Inspect SHAP →
            </Link>
          ) : (
            <Link
              href="/dashboard"
              className="text-emerald-400 font-semibold hover:underline shrink-0 text-[11px]"
            >
              View Dashboard →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
