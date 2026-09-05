"use client";

import { useEffect, useState } from "react";
import { Search, Filter, ChevronDown, ChevronRight, FileText, CheckCircle2 } from "lucide-react";
import { fetchAuditLog, AuditEntry } from "@/lib/api";

export default function AuditPage() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [orderIdFilter, setOrderIdFilter] = useState("");
  const [eventTypeFilter, setEventTypeFilter] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const loadAudit = async () => {
    setLoading(true);
    try {
      const res = await fetchAuditLog({
        order_id: orderIdFilter ? orderIdFilter.trim() : undefined,
        event_type: eventTypeFilter === "all" ? undefined : eventTypeFilter,
        limit: 100,
      });
      setEntries(res.entries);
      setTotal(res.total);
    } catch (err) {
      console.error("Failed to load audit:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAudit();
  }, [eventTypeFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadAudit();
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 w-full space-y-8">
      {/* Title */}
      <div>
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-sky-400" />
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Immutable Audit Trail
          </h1>
        </div>
        <p className="text-xs text-neutral-400 mt-1">
          Every decision, threshold comparison, nudge issuance, and payment callback logged with microsecond precision
        </p>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-wrap items-center gap-3 p-3.5 rounded-lg border border-white/10 bg-[#0a0a0a]">
        <form onSubmit={handleSearchSubmit} className="flex-1 min-w-[240px] flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={orderIdFilter}
              onChange={(e) => setOrderIdFilter(e.target.value)}
              placeholder="Search by Order ID..."
              className="w-full pl-9 pr-3 py-1.5 rounded bg-neutral-900 border border-white/15 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white/30"
            />
          </div>
          <button type="submit" className="btn btn-ghost text-xs py-1.5 px-3">
            Search
          </button>
        </form>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-neutral-400" />
          <select
            value={eventTypeFilter}
            onChange={(e) => setEventTypeFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded bg-neutral-900 border border-white/15 text-xs text-white focus:outline-none"
          >
            <option value="all">All Event Types</option>
            <option value="order_scored">order_scored</option>
            <option value="threshold_checked">threshold_checked</option>
            <option value="nudge_sent">nudge_sent</option>
            <option value="payment_status_changed">payment_status_changed</option>
            <option value="error">error</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="appear appear--soft rounded-lg border border-white/10 bg-[#0a0a0a] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-black/60 border-b border-white/10 text-neutral-400 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-4 py-3 w-10"></th>
                <th className="px-4 py-3">Timestamp (IST)</th>
                <th className="px-4 py-3">Event Type</th>
                <th className="px-4 py-3">Order ID</th>
                <th className="px-4 py-3">Payload Summary</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {entries.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-neutral-400">
                    No audit records found matching query.
                  </td>
                </tr>
              ) : (
                entries.map((entry) => {
                  const isExpanded = expandedId === entry.id;
                  const dateStr = entry.created_at
                    ? new Date(entry.created_at).toLocaleString("en-IN")
                    : "—";

                  return (
                    <tbody key={entry.id} className="group">
                      <tr
                        onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                        className="hover:bg-white/[0.03] transition-colors cursor-pointer"
                      >
                        <td className="px-4 py-3 text-neutral-400">
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-white" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </td>
                        <td className="px-4 py-3 font-mono text-neutral-300 whitespace-nowrap">
                          {dateStr}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-0.5 rounded font-mono text-[11px] font-medium ${
                              entry.event_type === "order_scored"
                                ? "bg-purple-500/10 text-purple-300 border border-purple-500/20"
                                : entry.event_type === "nudge_sent"
                                ? "bg-amber-500/10 text-amber-300 border border-amber-500/20"
                                : entry.event_type === "payment_status_changed"
                                ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                                : "bg-white/10 text-neutral-300"
                            }`}
                          >
                            {entry.event_type}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono text-white/90">
                          {entry.order_id ? `${entry.order_id.slice(0, 8)}...` : "System"}
                        </td>
                        <td className="px-4 py-3 text-neutral-400 font-mono text-[11px] max-w-md truncate">
                          {JSON.stringify(entry.event_payload)}
                        </td>
                      </tr>

                      {/* Expanded JSON Panel */}
                      {isExpanded && (
                        <tr>
                          <td colSpan={5} className="px-6 py-4 bg-[#111111] border-y border-white/10">
                            <div className="space-y-2">
                              <div className="text-[11px] uppercase tracking-wider text-neutral-400 font-medium">
                                Full Event Payload (JSON)
                              </div>
                              <pre className="p-3 rounded bg-black/60 border border-white/10 text-xs font-mono text-neutral-200 overflow-x-auto leading-relaxed">
                                {JSON.stringify(
                                  {
                                    id: entry.id,
                                    order_id: entry.order_id,
                                    event_type: entry.event_type,
                                    payload: entry.event_payload,
                                    timestamp: entry.created_at,
                                  },
                                  null,
                                  2
                                )}
                              </pre>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-white/10 bg-black/40 text-xs text-neutral-400 flex justify-between">
          <span>Showing {entries.length} of {total} audit records</span>
          <span>Expand any row to inspect immutable raw event payload</span>
        </div>
      </div>
    </div>
  );
}
