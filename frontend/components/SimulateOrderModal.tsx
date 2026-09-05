"use client";

import { useState } from "react";
import Link from "next/link";
import { X, Sparkles, AlertTriangle, CheckCircle2, ArrowRight, Loader2 } from "lucide-react";
import { createOrder } from "@/lib/api";

interface SimulateOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderCreated?: () => void;
}

export default function SimulateOrderModal({
  isOpen,
  onClose,
  onOrderCreated,
}: SimulateOrderModalProps) {
  const [pincode, setPincode] = useState("560001");
  const [paymentMode, setPaymentMode] = useState<"COD" | "prepaid">("COD");
  const [orderValue, setOrderValue] = useState("1899");
  const [isFirstOrder, setIsFirstOrder] = useState(true);
  const [deviceType, setDeviceType] = useState("mobile");
  const [productCategory, setProductCategory] = useState("clothing");
  const [address, setAddress] = useState("Flat 302, Green Glen Layout, Bellandur");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    id: string;
    risk_score: number;
    risk_band: "low" | "medium" | "high";
    explanation: string;
    top_factors: any[];
  } | null>(null);

  if (!isOpen) return null;

  const quickPresets = [
    { label: "Tier-1 Metro COD", pin: "560001", mode: "COD", val: "1499", first: false, addr: "Flat 102, Near Sony Center, Koramangala" },
    { label: "Tier-3 High-Risk Impulse", pin: "841301", mode: "COD", val: "2899", first: true, addr: "Village Road, Near Post Office" },
    { label: "Prepaid Safe Order", pin: "110001", mode: "prepaid", val: "999", first: false, addr: "Sector 14, Main Market, Connaught Place" },
  ];

  const handlePreset = (p: (typeof quickPresets)[0]) => {
    setPincode(p.pin);
    setPaymentMode(p.mode as "COD" | "prepaid");
    setOrderValue(p.val);
    setIsFirstOrder(p.first);
    setAddress(p.addr);
    setResult(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await createOrder({
        pincode,
        payment_mode: paymentMode,
        order_value: parseFloat(orderValue) || 1000,
        is_first_order: isFirstOrder,
        device_type: deviceType,
        product_category: productCategory,
        address,
      });
      setResult(res);
      if (onOrderCreated) onOrderCreated();
    } catch (err: any) {
      setError(err.message || "Failed to score order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-xl border border-white/20 bg-neutral-950 p-6 shadow-2xl my-8">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-white transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 rounded-md bg-white/10 text-white">
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Simulate & Score Order</h2>
            <p className="text-xs text-neutral-400">
              Run real-time XGBoost inference + SHAP explainability
            </p>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="mb-4 flex flex-wrap gap-2">
          <span className="text-xs text-neutral-400 self-center">Presets:</span>
          {quickPresets.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handlePreset(p)}
              className="text-xs px-2.5 py-1 rounded border border-white/10 bg-white/[0.04] text-neutral-300 hover:text-white hover:border-white/30 transition-all"
            >
              {p.label}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-4 p-3 rounded bg-red-500/10 border border-red-500/30 text-xs text-red-400 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {result ? (
          /* Scored Result Card */
          <div className="space-y-4 pt-2">
            <div className="p-4 rounded-lg border border-white/15 bg-neutral-900/70">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs uppercase tracking-wider text-neutral-400 font-medium">
                  Risk Assessment
                </span>
                <span className={`risk-badge ${result.risk_band}`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  {Math.round(result.risk_score * 100)}% {result.risk_band.toUpperCase()}
                </span>
              </div>

              <p className="text-sm text-neutral-200 leading-relaxed mb-3">
                {result.explanation}
              </p>

              {result.top_factors && result.top_factors.length > 0 && (
                <div className="space-y-1.5 pt-2 border-t border-white/10">
                  <div className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider">
                    Top SHAP Feature Drivers
                  </div>
                  {result.top_factors.slice(0, 3).map((factor: any, i: number) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <span className="text-neutral-300 font-mono">
                        {factor.feature.replace(/_/g, " ")}
                      </span>
                      <span
                        className={`tabular-nums font-mono font-medium ${
                          factor.impact > 0 ? "text-red-400" : "text-emerald-400"
                        }`}
                      >
                        {factor.impact > 0 ? `+${factor.impact}` : factor.impact}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setResult(null)}
                className="btn btn-ghost flex-1 text-xs"
              >
                Score Another
              </button>
              <Link
                href={`/dashboard/orders/${result.id}`}
                onClick={onClose}
                className="btn btn-solid flex-1 text-xs font-semibold"
              >
                View Full Breakdown
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </div>
          </div>
        ) : (
          /* Input Form */
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div className="grid grid-cols-2 gap-3">
              {/* Pincode */}
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Delivery Pincode
                </label>
                <input
                  type="text"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  placeholder="e.g. 560001"
                  required
                  className="w-full px-3 py-2 rounded-md bg-neutral-900 border border-white/15 text-sm text-white focus:outline-none focus:border-white/40"
                />
              </div>

              {/* Order Value */}
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Order Value (₹)
                </label>
                <input
                  type="number"
                  value={orderValue}
                  onChange={(e) => setOrderValue(e.target.value)}
                  placeholder="1499"
                  required
                  className="w-full px-3 py-2 rounded-md bg-neutral-900 border border-white/15 text-sm text-white focus:outline-none focus:border-white/40"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Payment Mode */}
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Payment Mode
                </label>
                <select
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-md bg-neutral-900 border border-white/15 text-sm text-white focus:outline-none focus:border-white/40"
                >
                  <option value="COD">Cash on Delivery (COD)</option>
                  <option value="prepaid">Prepaid (UPI / Card)</option>
                </select>
              </div>

              {/* Customer Type */}
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Customer History
                </label>
                <select
                  value={isFirstOrder ? "true" : "false"}
                  onChange={(e) => setIsFirstOrder(e.target.value === "true")}
                  className="w-full px-3 py-2 rounded-md bg-neutral-900 border border-white/15 text-sm text-white focus:outline-none focus:border-white/40"
                >
                  <option value="true">First-time Customer</option>
                  <option value="false">Returning Customer</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Device Type */}
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Device
                </label>
                <select
                  value={deviceType}
                  onChange={(e) => setDeviceType(e.target.value)}
                  className="w-full px-3 py-2 rounded-md bg-neutral-900 border border-white/15 text-sm text-white focus:outline-none focus:border-white/40"
                >
                  <option value="mobile">Mobile</option>
                  <option value="desktop">Desktop</option>
                </select>
              </div>

              {/* Product Category */}
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Category
                </label>
                <select
                  value={productCategory}
                  onChange={(e) => setProductCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-md bg-neutral-900 border border-white/15 text-sm text-white focus:outline-none focus:border-white/40"
                >
                  <option value="clothing">Clothing / Fashion</option>
                  <option value="footwear">Footwear</option>
                  <option value="electronics">Electronics</option>
                  <option value="beauty">Beauty & Personal Care</option>
                  <option value="other">General Merchandise</option>
                </select>
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Delivery Address Line
              </label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={2}
                placeholder="Street address, landmarks..."
                className="w-full px-3 py-2 rounded-md bg-neutral-900 border border-white/15 text-sm text-white focus:outline-none focus:border-white/40 resize-none"
              />
              <p className="text-[11px] text-neutral-400 mt-1">
                SentinelX extracts address character length and landmark cues (near, opp, behind).
              </p>
            </div>

            {/* Submit Button */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="btn btn-ghost text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-solid text-xs font-semibold"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                    Scoring...
                  </>
                ) : (
                  <>Score Order Now</>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
