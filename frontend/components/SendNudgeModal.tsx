"use client";

import { useState, useEffect } from "react";
import { X, Send, CreditCard, CheckCircle2, ExternalLink, AlertTriangle, Loader2 } from "lucide-react";
import { sendNudge, simulatePayment } from "@/lib/api";

interface SendNudgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  orderValue: number;
  existingNudgeUrl?: string;
  onNudgeComplete?: () => void;
}

export default function SendNudgeModal({
  isOpen,
  onClose,
  orderId,
  orderValue,
  existingNudgeUrl,
  onNudgeComplete,
}: SendNudgeModalProps) {
  const [loading, setLoading] = useState(false);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [discountPercent, setDiscountPercent] = useState<number>(5);
  const [nudgeResult, setNudgeResult] = useState<{
    nudge_id: string;
    payment_link_url: string;
    discount_percent: number;
    status: string;
  } | null>(null);
  const [paidSuccess, setPaidSuccess] = useState(false);

  useEffect(() => {
    if (existingNudgeUrl) {
      setNudgeResult({
        nudge_id: "active",
        payment_link_url: existingNudgeUrl,
        discount_percent: 5,
        status: "created",
      });
    } else {
      setNudgeResult(null);
    }
    setPaidSuccess(false);
    setError(null);
  }, [existingNudgeUrl, isOpen]);

  if (!isOpen) return null;

  const discountAmount = Math.round(orderValue * (discountPercent / 100));
  const discountedPrice = Math.max(1, orderValue - discountAmount);

  const getLiftBadge = (pct: number) => {
    if (pct <= 5) return { label: "+25% Conversion Lift", color: "text-neutral-300" };
    if (pct <= 8) return { label: "+38% Conversion Lift", color: "text-emerald-400" };
    if (pct <= 10) return { label: "+52% High Urgency Lift", color: "text-amber-400" };
    return { label: "+68% Max Recovery Lift", color: "text-purple-400" };
  };

  const lift = getLiftBadge(discountPercent);

  const handleSendNudge = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await sendNudge(orderId, discountPercent);
      setNudgeResult(res);
      if (onNudgeComplete) onNudgeComplete();
    } catch (err: any) {
      if (existingNudgeUrl) {
        setNudgeResult({
          nudge_id: "active",
          payment_link_url: existingNudgeUrl,
          discount_percent: discountPercent,
          status: "created",
        });
      } else {
        setError(err.message || "Failed to create payment link");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSimulatePayment = async () => {
    setPaying(true);
    setError(null);
    try {
      await simulatePayment(orderId);
      setPaidSuccess(true);
      if (onNudgeComplete) onNudgeComplete();
      setTimeout(() => {
        onClose();
      }, 1400);
    } catch (err: any) {
      setError(err.message || "Failed to simulate payment completion");
    } finally {
      setPaying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-xl border border-white/20 bg-neutral-950 p-6 shadow-2xl space-y-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-white transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <div className="p-2 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Send className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">Send Prepaid Nudge</h2>
            <p className="text-xs text-neutral-400">Variable Incentive & Razorpay Link Generation</p>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded bg-red-500/10 border border-red-500/30 text-xs text-red-400 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {!nudgeResult ? (
          <div className="space-y-4">
            {/* Variable Discount Selector */}
            <div className="p-4 rounded-lg border border-white/10 bg-neutral-900/70 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-neutral-400 font-medium uppercase tracking-wider">
                  Select Nudge Discount
                </span>
                <span className={`text-[11px] font-mono font-medium ${lift.color}`}>
                  {lift.label}
                </span>
              </div>

              {/* Preset Chips */}
              <div className="grid grid-cols-4 gap-1.5">
                {[5, 8, 10, 15].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => setDiscountPercent(pct)}
                    className={`py-1.5 rounded text-xs font-mono font-medium transition-all ${
                      discountPercent === pct
                        ? "bg-white text-black font-semibold shadow"
                        : "bg-white/5 text-neutral-400 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {pct}% off
                  </button>
                ))}
              </div>

              {/* Custom Slider */}
              <div className="space-y-1 pt-1">
                <div className="flex justify-between text-[11px] text-neutral-400">
                  <span>Custom Discount:</span>
                  <span className="font-mono text-white">{discountPercent}%</span>
                </div>
                <input
                  type="range"
                  min={3}
                  max={20}
                  step={1}
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(parseInt(e.target.value))}
                  className="w-full accent-white h-1.5 bg-white/10 rounded cursor-pointer"
                />
              </div>

              {/* Calculation Breakdown */}
              <div className="pt-2 border-t border-white/10 space-y-1.5 text-xs">
                <div className="flex justify-between items-center text-neutral-400">
                  <span>Original COD Price:</span>
                  <span className="text-white line-through font-mono">₹{orderValue.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between items-center text-neutral-400">
                  <span>Discount Applied ({discountPercent}%):</span>
                  <span className="text-emerald-400 font-mono">-₹{discountAmount.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between items-center text-sm font-semibold pt-1 border-t border-white/5">
                  <span className="text-white">Payable Prepaid Link:</span>
                  <span className="text-emerald-400 font-mono text-base">₹{discountedPrice.toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>

            <div className="text-[11px] text-neutral-400 leading-relaxed">
              Creates a test-mode Razorpay payment link for <strong>₹{discountedPrice}</strong> ({discountPercent}% off) and sends notification. Defense-only: order is never blocked or cancelled.
            </div>

            <div className="pt-1 flex items-center justify-end gap-3">
              <button type="button" onClick={onClose} className="btn btn-ghost text-xs">
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSendNudge}
                disabled={loading}
                className="btn btn-solid text-xs font-semibold"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5 text-black" />
                    Generating Link...
                  </>
                ) : (
                  <>Generate & Send Nudge ({discountPercent}% off)</>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 animate-in zoom-in-95 duration-200">
            <div className="p-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 space-y-1.5">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Payment Link Active
              </div>
              <p className="text-xs text-emerald-200">
                A {nudgeResult.discount_percent}% discount link is active for this order.
              </p>
            </div>

            <div className="p-3.5 rounded-md bg-neutral-900 border border-white/10 space-y-1.5">
              <div className="text-[11px] text-neutral-400 font-medium uppercase tracking-wider">
                Razorpay Payment Link:
              </div>
              <a
                href={nudgeResult.payment_link_url}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-sky-400 hover:underline flex items-center gap-1 font-mono break-all"
              >
                {nudgeResult.payment_link_url}
                <ExternalLink className="w-3 h-3 shrink-0" />
              </a>
            </div>

            {/* Test Payment Simulation Button for Demo / Pitch */}
            <div className="p-4 rounded-lg border border-white/10 bg-neutral-900/60 space-y-3">
              <div className="text-xs font-semibold text-white">
                Live Pitch & Demo Flow
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Click below to simulate the customer paying the discounted amount (₹{discountedPrice}). The order status will flip to <strong>converted_prepaid</strong> and log in the audit trail.
              </p>

              {paidSuccess ? (
                <div className="p-3 rounded bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 font-medium animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  Payment Successful! Updating Order & Audit Trail...
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleSimulatePayment}
                  disabled={paying}
                  className="btn btn-solid w-full text-xs font-semibold"
                >
                  {paying ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5 text-black" />
                      Processing Payment...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-3.5 h-3.5 mr-1" />
                      Simulate Successful Payment (₹{discountedPrice})
                    </>
                  )}
                </button>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="btn btn-ghost text-xs"
              >
                Close Window
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
