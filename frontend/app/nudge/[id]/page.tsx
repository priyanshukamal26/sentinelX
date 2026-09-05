"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Clock, ShieldCheck, CheckCircle2, CreditCard, Sparkles, AlertCircle, Loader2 } from "lucide-react";
import { fetchOrderDetail, simulatePayment, OrderDetail } from "@/lib/api";

export default function CustomerNudgePage() {
  const params = useParams();
  const orderId = params?.id as string;

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [paid, setPaid] = useState(false);
  const [timeLeft, setTimeLeft] = useState(599); // 9 mins 59 secs

  useEffect(() => {
    if (!orderId) return;
    fetchOrderDetail(orderId).then((data) => {
      setOrder(data);
      if (data?.status === "converted_prepaid") {
        setPaid(true);
      }
      setLoading(false);
    });
  }, [orderId]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handlePayNow = async () => {
    setPaying(true);
    try {
      await simulatePayment(orderId);
      setPaid(true);
    } catch (err) {
      console.error("Payment failed:", err);
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center text-xs text-neutral-400">
        Loading Checkout Offer...
      </div>
    );
  }

  const originalPrice = order?.order_value || 1499;
  const discountedPrice = Math.round(originalPrice * 0.95);
  const savings = Math.round(originalPrice - discountedPrice);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 relative">
      {/* Background radial gradient */}
      <div
        className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_50%_30%,#1a1a1a_0%,#000000_70%)]"
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Exclusive Prepaid Incentive</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Convert to Prepaid & Save ₹{savings}
          </h1>
          <p className="text-xs text-neutral-400">
            Order #{orderId?.slice(0, 8)} · SentinelX Merchant Checkout
          </p>
        </div>

        {paid ? (
          /* Success Screen */
          <div className="p-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-center space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h2 className="text-lg font-bold text-white">Payment Received!</h2>
            <p className="text-xs text-emerald-200 leading-relaxed">
              Your order has been converted to Prepaid for <span className="font-mono font-bold text-white">₹{discountedPrice}</span>. You saved ₹{savings}!
            </p>
            <div className="text-[11px] text-neutral-400 pt-2 border-t border-white/10">
              Transaction verified & logged. Zero COD return risk.
            </div>
          </div>
        ) : (
          /* Checkout Box */
          <div className="p-6 rounded-2xl border border-white/15 bg-neutral-950/90 backdrop-blur-xl space-y-6 shadow-2xl">
            {/* Ticking Timer Banner */}
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between text-xs text-amber-300">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
                <span>Special Discount Expires In:</span>
              </div>
              <span className="font-mono font-bold text-sm text-amber-400">
                {formatTimer(timeLeft)}
              </span>
            </div>

            {/* Price Comparison */}
            <div className="space-y-3 pt-1">
              <div className="flex justify-between items-center text-xs text-neutral-400">
                <span>Original Cash on Delivery Price:</span>
                <span className="line-through font-mono">₹{originalPrice.toLocaleString("en-IN")}</span>
              </div>

              <div className="flex justify-between items-center text-sm font-bold border-t border-white/10 pt-3">
                <span className="text-white">Discounted Prepaid Price (5% OFF):</span>
                <span className="text-emerald-400 font-mono text-base">₹{discountedPrice.toLocaleString("en-IN")}</span>
              </div>
            </div>

            {/* Razorpay Test Button */}
            <button
              onClick={handlePayNow}
              disabled={paying}
              className="btn btn-solid w-full text-xs font-semibold py-3 flex items-center justify-center gap-2 shadow-xl"
            >
              {paying ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-black" />
                  Connecting Razorpay Checkout...
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4 text-black" />
                  Pay ₹{discountedPrice} via UPI / Card (Razorpay Test Mode)
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[10px] text-neutral-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>256-Bit SSL Encrypted Razorpay Test Payment</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
