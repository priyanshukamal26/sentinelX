"use client";

import { useState } from "react";
import { X, Send, CreditCard, CheckCircle2, ExternalLink, AlertTriangle, Loader2 } from "lucide-react";
import { sendNudge, simulatePayment } from "@/lib/api";

interface SendNudgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  orderValue: number;
  onNudgeComplete?: () => void;
}

export default function SendNudgeModal({
  isOpen,
  onClose,
  orderId,
  orderValue,
  onNudgeComplete,
}: SendNudgeModalProps) {
  const [loading, setLoading] = useState(false);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nudgeResult, setNudgeResult] = useState<{
    nudge_id: string;
    payment_link_url: string;
    discount_percent: number;
    status: string;
  } | null>(null);
  const [paidSuccess, setPaidSuccess] = useState(false);

  if (!isOpen) return null;

  const discountAmount = Math.round(orderValue * 0.05);
  const discountedPrice = Math.round(orderValue * 0.95);

  const handleSendNudge = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await sendNudge(orderId);
      setNudgeResult(res);
      if (onNudgeComplete) onNudgeComplete();
    } catch (err: any) {
      setError(err.message || "Failed to create payment link");
    } finally {
      setLoading(false);
    }
  };

  const handleSimulatePayment = async () => {
    setPaying(true);
    try {
      await simulatePayment(orderId);
      setPaidSuccess(true);
      if (onNudgeComplete) onNudgeComplete();
    } catch (err: any) {
      setError(err.message || "Failed to simulate payment completion");
    } finally {
      setPaying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md rounded-xl border border-white/20 bg-neutral-950 p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-white transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 rounded-md bg-amber-500/10 text-amber-400">
            <Send className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Send Prepaid Nudge</h2>
            <p className="text-xs text-neutral-400">Razorpay Test-Mode Payment Link</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded bg-red-500/10 border border-red-500/30 text-xs text-red-400 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {!nudgeResult ? (
          <div className="space-y-4">
            <div className="p-4 rounded-lg border border-white/10 bg-neutral-900/60 space-y-2">
              <div className="text-xs text-neutral-400 font-medium uppercase tracking-wider">
                Nudge Proposal (Defense-Only)
              </div>
              <p className="text-xs text-neutral-300">
                Offer a 5% instant discount to encourage customer to convert this high-risk COD order into guaranteed prepaid.
              </p>
              <div className="pt-2 border-t border-white/10 flex justify-between items-center text-xs">
                <span className="text-neutral-400">Original COD:</span>
                <span className="text-white line-through font-mono">₹{orderValue.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between items-center text-sm font-semibold">
                <span className="text-emerald-400">Discounted Prepaid (5% off):</span>
                <span className="text-emerald-400 font-mono">₹{discountedPrice.toLocaleString("en-IN")}</span>
              </div>
            </div>

            <div className="text-xs text-neutral-400">
              Generating this nudge creates a real test-mode payment link via the Razorpay API and logs the event in the audit trail.
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
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
                    <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                    Generating Link...
                  </>
                ) : (
                  <>Generate & Send Nudge</>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 space-y-2">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                Payment Link Generated
              </div>
              <p className="text-xs text-emerald-200">
                A 5% discount link is active for this order.
              </p>
            </div>

            <div className="p-3 rounded-md bg-neutral-900 border border-white/10 space-y-1">
              <div className="text-[11px] text-neutral-400">Payment Link URL:</div>
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

            {/* Test Payment Simulation Button for Demo / Judges */}
            <div className="p-4 rounded-lg border border-white/10 bg-neutral-900/60 space-y-3">
              <div className="text-xs font-semibold text-white">
                Live Demo Verification
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Click below to simulate customer completing test-mode payment. The order will immediately transition to <strong>converted_prepaid</strong> and log in the audit trail.
              </p>

              {paidSuccess ? (
                <div className="p-2.5 rounded bg-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2 font-medium">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  Order marked as converted_prepaid!
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
                      <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                      Simulating Payment...
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
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
