"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Send,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Clock,
  FileText,
  CreditCard,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react";
import { fetchOrderDetail, OrderDetail } from "@/lib/api";
import SendNudgeModal from "@/components/SendNudgeModal";

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params?.id as string;

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isNudgeModalOpen, setIsNudgeModalOpen] = useState(false);

  const loadOrder = async (isInitial = false) => {
    if (!orderId) return;
    if (isInitial) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }
    try {
      const data = await fetchOrderDetail(orderId);
      setOrder(data);
    } catch (err) {
      console.error("Failed to load order:", err);
    } finally {
      if (isInitial) setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadOrder(true);
  }, [orderId]);

  if (loading && !order) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-16 text-center text-neutral-400">
        Loading order details...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Order Not Found</h2>
        <p className="text-xs text-neutral-400">ID: {orderId}</p>
        <Link href="/dashboard" className="btn btn-ghost text-xs">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const scorePercent = Math.round(order.risk_score * 100);
  const isHighRisk = order.risk_score >= 0.4467; // Model threshold
  const hasNudge = order.nudges && order.nudges.length > 0;

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 w-full space-y-8">
      {/* Back button and title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="p-2 rounded-md border border-white/10 bg-neutral-900 text-neutral-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white font-mono">
                Order {order.id.slice(0, 13)}...
              </h1>
              <span className={`risk-badge ${order.risk_band}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                {scorePercent}% {order.risk_band.toUpperCase()}
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Created {order.created_at ? new Date(order.created_at).toLocaleString("en-IN") : "Recently"}
            </p>
          </div>
        </div>

        {/* Nudge Action Header */}
        <div>
          {isHighRisk && !hasNudge && (
            <button
              onClick={() => setIsNudgeModalOpen(true)}
              className="btn btn-solid text-xs font-semibold"
            >
              <Send className="w-3.5 h-3.5 mr-1" />
              Send Prepaid Nudge (5% off)
            </button>
          )}
        </div>
      </div>

      {/* Grid: Why Flagged (Left) + Nudge / Payment Status (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Why Flagged Panel (2 cols) */}
        <div
          className={`lg:col-span-2 p-6 rounded-xl border border-white/10 bg-[#0a0a0a] shadow-lg ${
            order.risk_band === "high"
              ? "border-l-4 border-l-red-500"
              : order.risk_band === "medium"
              ? "border-l-4 border-l-amber-500"
              : "border-l-4 border-l-emerald-500"
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm font-semibold text-white uppercase tracking-wider">
                Why This Order Was Flagged
              </h2>
            </div>
            <span className="text-[11px] text-neutral-400">SHAP TreeExplainer</span>
          </div>

          {/* Explanation Text */}
          <p className="text-sm text-neutral-200 leading-relaxed mb-6 font-normal">
            {order.explanation}
          </p>

          {/* Top SHAP Contributing Factors Visual */}
          <div className="space-y-3">
            <div className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider">
              Feature Attribution Contributions
            </div>
            {order.top_factors && order.top_factors.length > 0 ? (
              order.top_factors.slice(0, 5).map((f, i) => {
                const isFirst = i === 0;
                const isRiskPush = f.impact > 0;
                const absImpact = Math.min(Math.abs(f.impact), 1.0);
                const barWidth = `${Math.round(absImpact * 100)}%`;

                return (
                  <div key={i} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className={isFirst ? "font-serif-accent text-neutral-300 text-[1.05em]" : "text-neutral-300 font-mono"}>
                        {f.feature.replace(/_/g, " ")}
                      </span>
                      <span
                        className={`font-mono text-xs tabular-nums font-semibold ${
                          isRiskPush ? "text-red-400" : "text-emerald-400"
                        }`}
                      >
                        {isRiskPush ? `+${f.impact}` : f.impact}
                      </span>
                    </div>
                    {/* Bar visual */}
                    <div className="w-full h-1.5 rounded-full bg-white/[0.08] overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          isRiskPush ? "bg-red-400/80" : "bg-emerald-400/80"
                        }`}
                        style={{ width: barWidth }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-xs text-neutral-400">Feature contributions computed.</div>
            )}
          </div>
        </div>

        {/* Nudge & Conversion Status Card (1 col) */}
        <div className="p-6 rounded-xl border border-white/10 bg-[#0a0a0a] flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <CreditCard className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
                Prepaid Nudge Flow
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-white/[0.08]">
                <span className="text-neutral-400">Threshold Status:</span>
                <span className={isHighRisk ? "text-red-400 font-semibold" : "text-emerald-400 font-semibold"}>
                  {isHighRisk ? "≥ 44.7% (High Risk)" : "< 44.7% (Normal Risk)"}
                </span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-white/[0.08]">
                <span className="text-neutral-400">Order Status:</span>
                <span className="text-white capitalize font-medium">
                  {order.status.replace(/_/g, " ")}
                </span>
              </div>

              {hasNudge ? (
                <div className="p-3 rounded-md bg-white/[0.04] border border-white/10 space-y-2 mt-2">
                  <div className="text-[11px] text-neutral-400 font-medium uppercase">
                    Active Razorpay Link
                  </div>
                  <a
                    href={order.nudges[0].payment_link_url || "#"}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sky-400 hover:underline flex items-center gap-1 font-mono text-[11px] break-all"
                  >
                    {order.nudges[0].payment_link_url}
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                  <div className="text-[11px] text-neutral-400">
                    Discount: {order.nudges[0].discount_percent}% off (Prepaid incentive)
                  </div>
                </div>
              ) : isHighRisk ? (
                <div className="p-3 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs mt-2">
                  Eligible for prepaid conversion nudge. Customer will receive a 5% discount link.
                </div>
              ) : (
                <div className="p-3 rounded-md bg-white/[0.04] border border-white/10 text-neutral-400 text-xs mt-2">
                  Defense-only principle: low-risk orders are never nudged or interrupted.
                </div>
              )}
            </div>
          </div>

          <div>
            {isHighRisk && !hasNudge && (
              <button
                onClick={() => setIsNudgeModalOpen(true)}
                className="btn btn-solid w-full text-xs font-semibold"
              >
                Send Prepaid Nudge
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Order Input Features Breakdown */}
      <div className="p-6 rounded-xl border border-white/10 bg-[#0a0a0a]">
        <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-4">
          Order Input Features (Ground Truth)
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-3 rounded bg-white/[0.03] border border-white/[0.08]">
            <div className="text-neutral-400 text-[11px]">Pincode & Tier</div>
            <div className="font-mono text-white font-medium mt-1">
              {order.pincode} (Tier {order.city_tier || 2})
            </div>
            <div className="text-neutral-400 text-[10px]">{order.district || order.state || "India"}</div>
          </div>

          <div className="p-3 rounded bg-white/[0.03] border border-white/[0.08]">
            <div className="text-neutral-400 text-[11px]">Payment Mode</div>
            <div className="font-medium text-white mt-1">{order.payment_mode}</div>
            <div className="text-neutral-400 text-[10px]">
              {order.payment_mode === "COD" ? "Cash on Delivery" : "Prepaid"}
            </div>
          </div>

          <div className="p-3 rounded bg-white/[0.03] border border-white/[0.08]">
            <div className="text-neutral-400 text-[11px]">Order Value</div>
            <div className="font-mono text-white font-medium mt-1 tabular-nums">
              ₹{Math.round(order.order_value).toLocaleString("en-IN")}
            </div>
            <div className="text-neutral-400 text-[10px]">Category: {order.product_category || "General"}</div>
          </div>

          <div className="p-3 rounded bg-white/[0.03] border border-white/[0.08]">
            <div className="text-neutral-400 text-[11px]">Customer History</div>
            <div className="font-medium text-white mt-1">
              {order.is_first_order ? "First-time Buyer" : "Repeat Buyer"}
            </div>
            <div className="text-neutral-400 text-[10px]">Device: {order.device_type || "mobile"}</div>
          </div>

          <div className="p-3 rounded bg-white/[0.03] border border-white/[0.08]">
            <div className="text-neutral-400 text-[11px]">Address Length</div>
            <div className="font-mono text-white font-medium mt-1 tabular-nums">
              {order.address_char_length || 45} chars
            </div>
            <div className="text-neutral-400 text-[10px]">
              {order.has_landmark_keyword ? "Landmark keyword detected" : "No landmark keyword"}
            </div>
          </div>

          <div className="p-3 rounded bg-white/[0.03] border border-white/[0.08]">
            <div className="text-neutral-400 text-[11px]">Est. Delivery Days</div>
            <div className="font-mono text-white font-medium mt-1 tabular-nums">
              {order.estimated_delivery_days || 4} days
            </div>
            <div className="text-neutral-400 text-[10px]">Zone: {order.zone_complexity || "standard"}</div>
          </div>

          <div className="p-3 rounded bg-white/[0.03] border border-white/[0.08]">
            <div className="text-neutral-400 text-[11px]">Order Placement Hour</div>
            <div className="font-mono text-white font-medium mt-1 tabular-nums">
              {order.order_hour !== undefined ? `${order.order_hour}:00 hrs` : "14:00 hrs"}
            </div>
            <div className="text-neutral-400 text-[10px]">IST Local Time</div>
          </div>

          <div className="p-3 rounded bg-white/[0.03] border border-white/[0.08]">
            <div className="text-neutral-400 text-[11px]">Model Confidence</div>
            <div className="font-mono text-white font-medium mt-1 tabular-nums">
              {scorePercent}%
            </div>
            <div className="text-neutral-400 text-[10px]">Decision: {order.risk_band}</div>
          </div>
        </div>
      </div>

      {/* Mini Scoped Audit Trail */}
      <div className="p-6 rounded-xl border border-white/10 bg-[#0a0a0a]">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-4 h-4 text-sky-400" />
          <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
            Order Audit Trail ({order.audit_trail?.length || 0} events)
          </h3>
        </div>

        <div className="space-y-3">
          {order.audit_trail && order.audit_trail.length > 0 ? (
            order.audit_trail.map((entry, idx) => (
              <div
                key={idx}
                className="p-3 rounded bg-black/40 border border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2"
              >
                <div>
                  <span className="font-mono text-white font-medium">{entry.event_type}</span>
                  <div className="text-[11px] text-neutral-400 font-mono mt-0.5">
                    {JSON.stringify(entry.event_payload)}
                  </div>
                </div>
                <div className="text-[11px] text-neutral-400 whitespace-nowrap">
                  {entry.created_at ? new Date(entry.created_at).toLocaleTimeString("en-IN") : ""}
                </div>
              </div>
            ))
          ) : (
            <div className="text-xs text-neutral-400">No events recorded for this order yet.</div>
          )}
        </div>
      </div>

      {/* Send Nudge Modal */}
      <SendNudgeModal
        isOpen={isNudgeModalOpen}
        onClose={() => setIsNudgeModalOpen(false)}
        orderId={order.id}
        orderValue={order.order_value}
        existingNudgeUrl={hasNudge ? order.nudges[0]?.payment_link_url : undefined}
        onNudgeComplete={loadOrder}
      />
    </div>
  );
}
