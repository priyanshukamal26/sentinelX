"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Filter,
  ArrowRight,
  TrendingUp,
  ShieldAlert,
  IndianRupee,
  Activity,
  RefreshCw,
} from "lucide-react";
import { fetchKPIs, fetchOrders, OrderItem, KPIStats } from "@/lib/api";
import SimulateOrderModal from "@/components/SimulateOrderModal";

export default function DashboardPage() {
  const router = useRouter();
  const [kpis, setKpis] = useState<KPIStats | null>(null);
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isSimulateOpen, setIsSimulateOpen] = useState(false);

  // Filters
  const [tierFilter, setTierFilter] = useState<string>("all");
  const [modeFilter, setModeFilter] = useState<string>("all");
  const [riskFilter, setRiskFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const loadData = async () => {
    setLoading(true);
    try {
      const [kpiRes, ordersRes] = await Promise.all([
        fetchKPIs(),
        fetchOrders({
          tier: tierFilter === "all" ? undefined : parseInt(tierFilter),
          payment_mode: modeFilter === "all" ? undefined : modeFilter,
          risk_band: riskFilter === "all" ? undefined : riskFilter,
          status: statusFilter === "all" ? undefined : statusFilter,
          limit: 50,
        }),
      ]);
      setKpis(kpiRes);
      setOrders(ordersRes.orders);
      setTotalOrders(ordersRes.total);
    } catch (err) {
      console.error("Error loading dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [tierFilter, modeFilter, riskFilter, statusFilter]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 w-full space-y-8">
      {/* Top Header Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            COD Risk Control Center
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Real-time inference pipeline and defense-only nudge monitoring
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => loadData()}
            className="btn btn-ghost text-xs py-2 px-3"
            title="Refresh Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => setIsSimulateOpen(true)}
            className="btn btn-solid text-xs font-semibold py-2 px-4"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500 mr-1" />
            Simulate New Order
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Orders */}
        <div className="appear appear--stat p-5 rounded-lg border border-white/[0.12] bg-[#0a0a0a] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-medium">
            <span>Total Orders</span>
            <Activity className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="mt-3 text-2xl sm:text-3xl font-bold text-white tabular-nums tracking-tight">
            {kpis?.total_orders?.toLocaleString("en-IN") || 0}
          </div>
          <div className="text-[11px] text-neutral-400 mt-1">
            Real-time pipeline scored
          </div>
        </div>

        {/* High Risk Orders */}
        <div className="appear appear--stat p-5 rounded-lg border border-white/[0.12] bg-[#0a0a0a] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]" style={{ animationDelay: "0.12s" }}>
          <div className="flex items-center justify-between text-neutral-400 text-xs font-medium">
            <span>High Risk (≥44.7%)</span>
            <ShieldAlert className="w-4 h-4 text-red-400" />
          </div>
          <div className="mt-3 text-2xl sm:text-3xl font-bold text-red-400 tabular-nums tracking-tight">
            {kpis?.high_risk_orders || 0}{" "}
            <span className="text-xs font-normal text-neutral-400">
              ({kpis?.high_risk_percent || 0}%)
            </span>
          </div>
          <div className="text-[11px] text-neutral-400 mt-1">
            Flagged for prepaid nudge
          </div>
        </div>

        {/* Revenue Saved */}
        <div className="appear appear--stat p-5 rounded-lg border border-white/[0.12] bg-[#0a0a0a] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]" style={{ animationDelay: "0.24s" }}>
          <div className="flex items-center justify-between text-neutral-400 text-xs font-medium">
            <span>RTO Cost Saved</span>
            <IndianRupee className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-3 text-2xl sm:text-3xl font-bold text-emerald-400 tabular-nums tracking-tight">
            ₹{Math.round(kpis?.revenue_saved || 0).toLocaleString("en-IN")}
          </div>
          <div className="text-[11px] text-neutral-400 mt-1">
            {kpis?.converted_prepaid || 0} converted to prepaid
          </div>
        </div>

        {/* Live Precision / Recall */}
        <Link
          href="/metrics"
          className="appear appear--stat p-5 rounded-lg border border-white/[0.12] bg-[#0a0a0a] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] hover:border-white/30 transition-colors group block"
          style={{ animationDelay: "0.36s" }}
        >
          <div className="flex items-center justify-between text-neutral-400 text-xs font-medium">
            <span>Model Precision / Recall</span>
            <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:translate-x-0.5 transition-transform" />
          </div>
          <div className="mt-3 text-2xl sm:text-3xl font-bold text-white tabular-nums tracking-tight">
            {Math.round((kpis?.precision || 0.26) * 100)}% /{" "}
            <span className="text-amber-400 font-semibold">
              {Math.round((kpis?.recall || 0.58) * 100)}%
            </span>
          </div>
          <div className="text-[11px] text-neutral-400 mt-1 underline underline-offset-2">
            Held-out metrics breakdown →
          </div>
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3 p-3.5 rounded-lg border border-white/10 bg-[#0a0a0a]">
        <div className="flex items-center gap-1.5 text-xs text-neutral-400 font-medium mr-2">
          <Filter className="w-3.5 h-3.5" />
          <span>Filters:</span>
        </div>

        {/* Tier */}
        <select
          value={tierFilter}
          onChange={(e) => setTierFilter(e.target.value)}
          className="px-2.5 py-1.5 rounded bg-neutral-900 border border-white/15 text-xs text-white focus:outline-none"
        >
          <option value="all">All Tiers</option>
          <option value="1">Tier 1 (Metro)</option>
          <option value="2">Tier 2</option>
          <option value="3">Tier 3</option>
        </select>

        {/* Payment Mode */}
        <select
          value={modeFilter}
          onChange={(e) => setModeFilter(e.target.value)}
          className="px-2.5 py-1.5 rounded bg-neutral-900 border border-white/15 text-xs text-white focus:outline-none"
        >
          <option value="all">All Payment Modes</option>
          <option value="COD">COD Only</option>
          <option value="prepaid">Prepaid Only</option>
        </select>

        {/* Risk Band */}
        <select
          value={riskFilter}
          onChange={(e) => setRiskFilter(e.target.value)}
          className="px-2.5 py-1.5 rounded bg-neutral-900 border border-white/15 text-xs text-white focus:outline-none"
        >
          <option value="all">All Risk Bands</option>
          <option value="high">High Risk (&gt;75%)</option>
          <option value="medium">Medium Risk (40–75%)</option>
          <option value="low">Low Risk (&lt;40%)</option>
        </select>

        {/* Status */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-2.5 py-1.5 rounded bg-neutral-900 border border-white/15 text-xs text-white focus:outline-none"
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="nudged">Nudged</option>
          <option value="converted_prepaid">Converted Prepaid</option>
          <option value="cod_confirmed">COD Confirmed</option>
        </select>

        {(tierFilter !== "all" || modeFilter !== "all" || riskFilter !== "all" || statusFilter !== "all") && (
          <button
            onClick={() => {
              setTierFilter("all");
              setModeFilter("all");
              setRiskFilter("all");
              setStatusFilter("all");
            }}
            className="text-xs text-neutral-400 hover:text-white underline ml-auto"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Orders Table */}
      <div className="appear appear--soft rounded-lg border border-white/10 bg-[#0a0a0a] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-black/60 border-b border-white/10 text-neutral-400 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-4 py-3">Order ID</th>
                <th className="px-4 py-3">Pincode / Tier</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3">Value</th>
                <th className="px-4 py-3">RTO Risk Score</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-neutral-400">
                    No orders matching criteria. Click{" "}
                    <button
                      onClick={() => setIsSimulateOpen(true)}
                      className="text-white underline font-semibold"
                    >
                      Simulate New Order
                    </button>{" "}
                    to score one live.
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const scorePercent = Math.round(order.risk_score * 100);
                  return (
                    <tr
                      key={order.id}
                      onClick={() => router.push(`/dashboard/orders/${order.id}`)}
                      className="hover:bg-white/[0.03] transition-colors cursor-pointer group"
                    >
                      {/* Order ID */}
                      <td className="px-4 py-3.5 font-mono text-white/90">
                        {order.id.slice(0, 8)}...
                      </td>

                      {/* Pincode / Tier */}
                      <td className="px-4 py-3.5 text-neutral-300">
                        <span className="font-mono text-white">{order.pincode}</span>
                        <span className="text-neutral-400 ml-1.5">
                          (Tier {order.city_tier || 2})
                        </span>
                      </td>

                      {/* Payment */}
                      <td className="px-4 py-3.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                            order.payment_mode === "COD"
                              ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                              : "bg-white/10 text-white"
                          }`}
                        >
                          {order.payment_mode}
                        </span>
                      </td>

                      {/* Value */}
                      <td className="px-4 py-3.5 font-mono text-white tabular-nums">
                        ₹{Math.round(order.order_value).toLocaleString("en-IN")}
                      </td>

                      {/* Risk Badge */}
                      <td className="px-4 py-3.5">
                        <span className={`risk-badge ${order.risk_band}`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          {scorePercent}% {order.risk_band.toUpperCase()}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5">
                        <span className="text-neutral-300 capitalize text-[11px]">
                          {order.status.replace(/_/g, " ")}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="px-4 py-3.5 text-right">
                        <span className="text-neutral-400 group-hover:text-white transition-colors inline-flex items-center gap-1 font-medium">
                          Detail
                          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="px-4 py-3 border-t border-white/10 bg-black/40 flex justify-between items-center text-xs text-neutral-400">
          <span>Showing {orders.length} of {totalOrders} orders</span>
          <span>Click any row to inspect SHAP explanation & nudge controls</span>
        </div>
      </div>

      {/* Simulate Order Modal */}
      <SimulateOrderModal
        isOpen={isSimulateOpen}
        onClose={() => setIsSimulateOpen(false)}
        onOrderCreated={loadData}
      />
    </div>
  );
}
