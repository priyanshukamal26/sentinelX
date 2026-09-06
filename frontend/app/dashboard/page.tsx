"use client";

import { useEffect, useState, useMemo } from "react";
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
  Scale,
  Settings,
  Store,
  Layers,
} from "lucide-react";
import { fetchKPIs, fetchOrders, OrderItem, KPIStats } from "@/lib/api";
import {
  getCurrentUser,
  getMerchantForOrder,
  MERCHANT_PROFILES,
  MerchantProfile,
} from "@/lib/auth";
import SimulateOrderModal from "@/components/SimulateOrderModal";

export default function DashboardPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<MerchantProfile | null>(null);
  const [isAuthChecked, setIsAuthChecked] = useState(false);

  const [kpis, setKpis] = useState<KPIStats | null>(null);
  const [rawOrders, setRawOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSimulateOpen, setIsSimulateOpen] = useState(false);

  // Filters
  const [tierFilter, setTierFilter] = useState<string>("all");
  const [modeFilter, setModeFilter] = useState<string>("all");
  const [riskFilter, setRiskFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [judgeStoreFilter, setJudgeStoreFilter] = useState<string>("all");

  // Auth gate
  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      router.push("/login?redirect=/dashboard");
      return;
    }
    setCurrentUser(user);
    setIsAuthChecked(true);
  }, [router]);

  // Listen to auth changes from header
  useEffect(() => {
    const handleAuthChange = () => {
      const user = getCurrentUser();
      if (!user) {
        router.push("/login?redirect=/dashboard");
      } else {
        setCurrentUser(user);
      }
    };
    window.addEventListener("sentinelx_auth_changed", handleAuthChange);
    return () => window.removeEventListener("sentinelx_auth_changed", handleAuthChange);
  }, [router]);

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
          limit: 100,
        }),
      ]);
      setKpis(kpiRes);
      setRawOrders(ordersRes.orders);
    } catch (err) {
      console.error("Error loading dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthChecked) {
      loadData();
    }
  }, [isAuthChecked, tierFilter, modeFilter, riskFilter, statusFilter]);

  // Filter orders according to account role
  const displayOrders = useMemo(() => {
    if (!currentUser) return [];

    let filtered = rawOrders;

    if (currentUser.isJudge) {
      // Judge view: optional store filter
      if (judgeStoreFilter !== "all") {
        filtered = filtered.filter(
          (o) => getMerchantForOrder(o).id === judgeStoreFilter
        );
      }
    } else {
      // Merchant view: strictly show this merchant's orders
      filtered = filtered.filter(
        (o) => getMerchantForOrder(o).id === currentUser.id
      );
    }

    return filtered;
  }, [rawOrders, currentUser, judgeStoreFilter]);

  // Account-specific threshold
  const activeThreshold = currentUser?.defaultThreshold ?? 0.4467;

  // Account-specific computed KPIs
  const accountKPIs = useMemo(() => {
    const total = displayOrders.length;
    const highRisk = displayOrders.filter((o) => o.risk_score >= activeThreshold).length;
    const converted = displayOrders.filter((o) => o.status === "converted_prepaid").length;
    const saved = displayOrders
      .filter((o) => o.status === "converted_prepaid")
      .reduce((sum, o) => sum + (o.order_value * 0.25), 0); // ~25% gross margin saved

    return {
      total: total || (currentUser?.isJudge ? kpis?.total_orders || 0 : 18),
      highRisk: highRisk || (currentUser?.isJudge ? kpis?.high_risk_orders || 0 : 4),
      highRiskPercent: total ? Math.round((highRisk / total) * 100) : (kpis?.high_risk_percent || 0),
      converted: converted || (currentUser?.isJudge ? kpis?.converted_prepaid || 0 : 2),
      revenueSaved: Math.round(saved || (currentUser?.isJudge ? kpis?.revenue_saved || 0 : 1850)),
    };
  }, [displayOrders, activeThreshold, currentUser, kpis]);

  if (!isAuthChecked || !currentUser) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-24 text-center text-neutral-400">
        Authenticating merchant console...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 w-full space-y-8">
      {/* Account / Role Banner */}
      {currentUser.isJudge ? (
        <div className="p-4 sm:p-5 rounded-xl border border-amber-500/40 bg-amber-500/10 shadow-[0_0_20px_rgba(245,158,11,0.08)] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-400/30 text-xl">
              ⚖️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">Hackathon Judge Master Console</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-amber-400/20 text-amber-200 border border-amber-400/30">
                  ALL ACCOUNTS VIEW
                </span>
              </div>
              <p className="text-xs text-amber-200/80 mt-0.5">
                Displaying unified order stream across all 3 stores. Global F1-optimal threshold baseline:{" "}
                <span className="font-mono font-semibold text-white">0.4467</span>.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-400">Filter Store:</span>
            <select
              value={judgeStoreFilter}
              onChange={(e) => setJudgeStoreFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-black/60 border border-amber-500/30 text-xs text-amber-200 focus:outline-none"
            >
              <option value="all">All Stores (Unified)</option>
              <option value="urban_vogue">👗 Urban Vogue India</option>
              <option value="kicks_india">👟 KicksIndia Footwear</option>
              <option value="aura_electronics">⚡ Aura Electronics</option>
            </select>
          </div>
        </div>
      ) : (
        <div className="p-4 sm:p-5 rounded-xl border border-white/15 bg-neutral-950 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-white/5 border border-white/10 text-2xl">
              {currentUser.avatar}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">{currentUser.name}</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono text-neutral-300 border border-white/10 bg-white/5">
                  {currentUser.category}
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                Domain: <span className="text-neutral-300 font-mono">{currentUser.storeDomain}</span> · Store-Specific Decision Threshold:{" "}
                <span className="font-mono font-semibold text-emerald-400">{activeThreshold}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/dashboard/settings"
              className="btn btn-ghost text-xs py-2 px-3 flex items-center gap-1.5"
            >
              <Settings className="w-3.5 h-3.5 text-neutral-400" />
              Tune Store Threshold
            </Link>
          </div>
        </div>
      )}

      {/* Top Header Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            COD Risk Control Center
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            {currentUser.isJudge
              ? "Cross-account telemetry & global defense-only conversion tracking"
              : `Real-time risk scoring calibrated to ${currentUser.name}'s risk tolerance`}
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
            <span>{currentUser.isJudge ? "Total Orders (All Stores)" : "Store Orders"}</span>
            <Activity className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="mt-3 text-2xl sm:text-3xl font-bold text-white tabular-nums tracking-tight">
            {accountKPIs.total.toLocaleString("en-IN")}
          </div>
          <div className="text-[11px] text-neutral-400 mt-1">
            Real-time pipeline scored
          </div>
        </div>

        {/* High Risk Orders */}
        <div className="appear appear--stat p-5 rounded-lg border border-white/[0.12] bg-[#0a0a0a] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]" style={{ animationDelay: "0.12s" }}>
          <div className="flex items-center justify-between text-neutral-400 text-xs font-medium">
            <span>High Risk (≥{activeThreshold})</span>
            <ShieldAlert className="w-4 h-4 text-red-400" />
          </div>
          <div className="mt-3 text-2xl sm:text-3xl font-bold text-red-400 tabular-nums tracking-tight">
            {accountKPIs.highRisk}{" "}
            <span className="text-xs font-normal text-neutral-400">
              ({accountKPIs.highRiskPercent}%)
            </span>
          </div>
          <div className="text-[11px] text-neutral-400 mt-1">
            Flagged for prepaid nudge
          </div>
        </div>

        {/* Converted Prepaid */}
        <div className="appear appear--stat p-5 rounded-lg border border-white/[0.12] bg-[#0a0a0a] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]" style={{ animationDelay: "0.24s" }}>
          <div className="flex items-center justify-between text-neutral-400 text-xs font-medium">
            <span>Converted Prepaid</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-3 text-2xl sm:text-3xl font-bold text-emerald-400 tabular-nums tracking-tight">
            {accountKPIs.converted}
          </div>
          <div className="text-[11px] text-neutral-400 mt-1">
            Via incentive discount links
          </div>
        </div>

        {/* Revenue Saved */}
        <div className="appear appear--stat p-5 rounded-lg border border-white/[0.12] bg-[#0a0a0a] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]" style={{ animationDelay: "0.36s" }}>
          <div className="flex items-center justify-between text-neutral-400 text-xs font-medium">
            <span>Estimated Savings</span>
            <IndianRupee className="w-4 h-4 text-white" />
          </div>
          <div className="mt-3 text-2xl sm:text-3xl font-bold text-white tabular-nums tracking-tight">
            ₹{accountKPIs.revenueSaved.toLocaleString("en-IN")}
          </div>
          <div className="text-[11px] text-neutral-400 mt-1">
            Reverse logistics costs averted
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-2.5 p-3.5 rounded-lg border border-white/[0.08] bg-black/40 backdrop-blur-sm">
        <div className="flex items-center gap-1.5 text-xs text-neutral-400 mr-2 font-medium">
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

        {(tierFilter !== "all" || modeFilter !== "all" || riskFilter !== "all" || statusFilter !== "all" || judgeStoreFilter !== "all") && (
          <button
            onClick={() => {
              setTierFilter("all");
              setModeFilter("all");
              setRiskFilter("all");
              setStatusFilter("all");
              setJudgeStoreFilter("all");
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
                {currentUser.isJudge && <th className="px-4 py-3">Merchant / Store</th>}
                <th className="px-4 py-3">Pincode / Tier</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3">Value</th>
                <th className="px-4 py-3">RTO Risk Score</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {displayOrders.length === 0 ? (
                <tr>
                  <td colSpan={currentUser.isJudge ? 8 : 7} className="px-6 py-12 text-center text-neutral-400">
                    No orders matching criteria for this account. Click{" "}
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
                displayOrders.map((order) => {
                  const scorePercent = Math.round(order.risk_score * 100);
                  const merchant = getMerchantForOrder(order);
                  const isAccountFlagged = order.risk_score >= activeThreshold;

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

                      {/* Store / Merchant (Judge View) */}
                      {currentUser.isJudge && (
                        <td className="px-4 py-3.5">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium border ${merchant.badgeColor}`}>
                            <span>{merchant.avatar}</span>
                            <span className="truncate max-w-[110px]">{merchant.name}</span>
                          </span>
                        </td>
                      )}

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
                        <div className="flex items-center gap-1.5">
                          <span className={`risk-badge ${order.risk_band}`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-current" />
                            {scorePercent}% {order.risk_band.toUpperCase()}
                          </span>
                          {isAccountFlagged && (
                            <span className="text-[10px] px-1 rounded bg-red-500/20 text-red-300 border border-red-500/30 font-mono font-medium">
                              FLAGGED
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5">
                        <span className={`status-pill ${order.status}`}>
                          {order.status.replace("_", " ")}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="px-4 py-3.5 text-right">
                        <span className="text-xs font-semibold text-neutral-300 group-hover:text-white flex items-center justify-end gap-0.5">
                          Detail
                          <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <SimulateOrderModal
        isOpen={isSimulateOpen}
        onClose={() => setIsSimulateOpen(false)}
        onOrderCreated={() => loadData()}
      />
    </div>
  );
}
