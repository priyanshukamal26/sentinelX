"use client";

import { useState } from "react";
import { X, MessageSquare, CheckCheck, ExternalLink, ShieldCheck, ArrowRight } from "lucide-react";
import Link from "next/link";

interface WhatsAppSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  orderValue: number;
  discountPercent?: number;
  pincode?: string;
  nudgeUrl?: string;
}

export default function WhatsAppSimulatorModal({
  isOpen,
  onClose,
  orderId,
  orderValue,
  discountPercent = 5,
  pincode = "560001",
  nudgeUrl,
}: WhatsAppSimulatorModalProps) {
  if (!isOpen) return null;

  const discountedValue = Math.round(orderValue * (1 - discountPercent / 100));
  const savings = Math.round(orderValue - discountedValue);
  const checkoutUrl = nudgeUrl || `/nudge/${orderId}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm rounded-2xl border border-white/20 bg-[#0d1418] p-0 overflow-hidden shadow-2xl">
        {/* WhatsApp Top Bar */}
        <div className="bg-[#1f2c34] px-4 py-3 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-sm">
              SX
            </div>
            <div>
              <div className="text-sm font-semibold text-white flex items-center gap-1">
                SentinelX Verified Store
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400/20" />
              </div>
              <div className="text-[10px] text-emerald-400">Official Business Account</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white p-1"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* WhatsApp Chat Body */}
        <div className="p-4 space-y-3 bg-[#0b141a] min-h-[360px] flex flex-col justify-end">
          {/* Chat Bubble */}
          <div className="self-start max-w-[90%] bg-[#202c33] rounded-lg rounded-tl-none p-3 text-xs text-neutral-200 space-y-2 border border-white/5 shadow-md">
            <p className="font-medium text-emerald-400">
              Order Confirmation & Prepaid Offer 🚚
            </p>
            <p className="text-neutral-300 leading-relaxed">
              Hi there! Your order <span className="font-mono text-white font-bold">#{orderId.slice(0, 8)}</span> (COD ₹{orderValue.toLocaleString("en-IN")}) is being processed.
            </p>
            <div className="p-2 rounded bg-[#111b21] border border-emerald-500/20 text-[11px] space-y-1">
              <div className="text-emerald-400 font-semibold">
                🎉 Instant {discountPercent}% Discount Available
              </div>
              <div className="text-neutral-300">
                Pay prepaid via UPI / Card now for <span className="text-white font-bold font-mono">₹{discountedValue.toLocaleString("en-IN")}</span> (Save ₹{savings}).
              </div>
            </div>
            <div className="text-[10px] text-neutral-400 text-right flex items-center justify-end gap-1 pt-1">
              <span>14:02 PM</span>
              <CheckCheck className="w-3.5 h-3.5 text-sky-400" />
            </div>
          </div>

          {/* Interactive Button Card */}
          <div className="space-y-2 pt-2">
            <Link
              href={checkoutUrl}
              target={nudgeUrl ? "_blank" : "_self"}
              className="w-full py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg transition-all"
            >
              Pay via UPI & Save ₹{savings}
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-2 px-4 rounded-lg bg-[#202c33] hover:bg-[#2a3942] text-neutral-300 text-xs font-medium border border-white/10"
            >
              Keep Original COD (No Discount)
            </button>
          </div>
        </div>

        {/* WhatsApp Footer */}
        <div className="bg-[#1f2c34] px-3 py-2 text-[10px] text-neutral-400 text-center border-t border-white/10 flex items-center justify-center gap-1">
          <MessageSquare className="w-3 h-3 text-emerald-400" />
          <span>Simulated WhatsApp Business API Nudge</span>
        </div>
      </div>
    </div>
  );
}
