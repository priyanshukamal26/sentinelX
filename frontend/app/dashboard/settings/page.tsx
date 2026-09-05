"use client";

import { useState } from "react";
import { Sliders, Key, ShieldCheck, Save, CheckCircle2, RefreshCw } from "lucide-react";

export default function SettingsPage() {
  const [threshold, setThreshold] = useState("0.4467");
  const [discount, setDiscount] = useState("5");
  const [razorpayKeyId, setRazorpayKeyId] = useState("rzp_test_sample_key_id_12345");
  const [razorpaySecret, setRazorpaySecret] = useState("••••••••••••••••");
  const [webhookSecret, setWebhookSecret] = useState("sentinelx_secret_webhook_key_2026");
  const [storeName, setStoreName] = useState("SentinelX Demo Store");
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 w-full space-y-8">
      {/* Title */}
      <div>
        <div className="flex items-center gap-2">
          <Sliders className="w-5 h-5 text-emerald-400" />
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Merchant Risk & Integration Settings
          </h1>
        </div>
        <p className="text-xs text-neutral-400 mt-1">
          Customize decision thresholds, Razorpay prepaid incentive discounts, and API webhooks
        </p>
      </div>

      {saved && (
        <div className="p-3.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-xs flex items-center gap-2 font-medium animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          Settings saved successfully! Risk threshold & Razorpay configurations updated.
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        {/* 1. ML Model Decision Threshold */}
        <div className="p-6 rounded-xl border border-white/10 bg-[#0a0a0a] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-white uppercase tracking-wider">
                1. Decision Threshold Tuning
              </h2>
              <p className="text-neutral-400 text-[11px] mt-0.5">
                Orders with risk probability above this cutoff trigger a prepaid nudge.
              </p>
            </div>
            <span className="font-mono text-emerald-400 font-bold text-sm bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded">
              {threshold}
            </span>
          </div>

          <div className="space-y-2">
            <input
              type="range"
              min="0.30"
              max="0.70"
              step="0.005"
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
              className="w-full h-2 rounded-lg bg-neutral-800 accent-emerald-500 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-neutral-400 font-mono">
              <span>0.3000 (Aggressive)</span>
              <span className="text-neutral-300">0.4467 (F1 Optimal)</span>
              <span>0.7000 (Conservative)</span>
            </div>
          </div>
        </div>

        {/* 2. Prepaid Nudge Incentive Discount */}
        <div className="p-6 rounded-xl border border-white/10 bg-[#0a0a0a] space-y-4">
          <div>
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider">
              2. Prepaid Nudge Discount %
            </h2>
            <p className="text-neutral-400 text-[11px] mt-0.5">
              The instant discount offered to high-risk COD buyers to convert them to UPI/Card.
            </p>
          </div>

          <div className="grid grid-cols-4 gap-3">
            {["3", "5", "7", "10"].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDiscount(d)}
                className={`py-2.5 px-3 rounded-lg border text-xs font-semibold font-mono transition-all ${
                  discount === d
                    ? "border-emerald-500 bg-emerald-500/10 text-emerald-400 shadow-[0_0_12px_rgba(47,191,113,0.2)]"
                    : "border-white/10 bg-white/[0.03] text-neutral-300 hover:border-white/30"
                }`}
              >
                {d}% Discount
              </button>
            ))}
          </div>
        </div>

        {/* 3. Razorpay & Webhook Credentials */}
        <div className="p-6 rounded-xl border border-white/10 bg-[#0a0a0a] space-y-4">
          <div>
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider">
              3. Razorpay Integration Credentials
            </h2>
            <p className="text-neutral-400 text-[11px] mt-0.5">
              Used for generating test-mode Payment Links and verifying webhook callbacks.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-neutral-300 font-medium mb-1">
                Razorpay Key ID
              </label>
              <input
                type="text"
                value={razorpayKeyId}
                onChange={(e) => setRazorpayKeyId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-white/15 text-white font-mono focus:outline-none focus:border-white/40"
              />
            </div>

            <div>
              <label className="block text-neutral-300 font-medium mb-1">
                Razorpay Key Secret
              </label>
              <input
                type="password"
                value={razorpaySecret}
                onChange={(e) => setRazorpaySecret(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-white/15 text-white font-mono focus:outline-none focus:border-white/40"
              />
            </div>
          </div>

          <div>
            <label className="block text-neutral-300 font-medium mb-1">
              Razorpay Webhook Secret (HMAC-SHA256)
            </label>
            <input
              type="text"
              value={webhookSecret}
              onChange={(e) => setWebhookSecret(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-white/15 text-white font-mono focus:outline-none focus:border-white/40"
            />
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="btn btn-solid text-xs font-semibold py-2.5 px-6 flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            Save Merchant Configuration
          </button>
        </div>
      </form>
    </div>
  );
}
