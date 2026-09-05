import Link from "next/link";
import { ShieldCheck, Cpu, Database, Zap, ExternalLink, ArrowRight } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12 w-full space-y-12">
      {/* Hero Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/20 bg-white/[0.05] text-xs text-neutral-300 mb-4">
          <span>Razorpay AI Buildathon · Track 02: AI Risk Manager</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
          Defense-Only RTO Risk Infrastructure
        </h1>
        <p className="mt-3 text-sm sm:text-base text-neutral-400 leading-relaxed max-w-2xl">
          SentinelX is an AI-powered risk scoring engine designed specifically for Indian Cash-on-Delivery (COD) e-commerce. It predicts delivery failure probability in real-time and converts high-risk orders into guaranteed prepaid purchases without ever blocking a customer.
        </p>
      </div>

      {/* Core Philosophy: Why Defense-Only? */}
      <div className="p-6 rounded-xl border border-white/10 bg-[#0a0a0a] space-y-4">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          The Defense-Only Philosophy
        </h2>
        <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
          Traditional fraud scoring tools in Indian e-commerce often act as blunt instruments: they cancel COD orders from Tier-2/Tier-3 towns or high-risk pincodes outright. This creates immense brand damage and alienates genuine shoppers who don&apos;t keep digital cash balances until delivery.
        </p>
        <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
          SentinelX operates on an <strong>asymmetric-incentive model</strong>:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div className="p-4 rounded-lg bg-white/[0.03] border border-white/[0.08] space-y-1.5">
            <div className="text-xs font-semibold text-white">Normal & Low Risk Orders (&lt;44.7%)</div>
            <div className="text-xs text-neutral-400">
              Pass through completely frictionless. Zero popups, zero friction, normal COD dispatch.
            </div>
          </div>
          <div className="p-4 rounded-lg bg-amber-500/[0.06] border border-amber-500/20 space-y-1.5">
            <div className="text-xs font-semibold text-amber-400">High Risk Orders (≥44.7%)</div>
            <div className="text-xs text-neutral-300">
              Trigger an automated prepaid incentive nudge: a 5% instant discount link generated via Razorpay. Customer is delighted by savings, merchant eliminates RTO freight loss.
            </div>
          </div>
        </div>
      </div>

      {/* System Architecture */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <Cpu className="w-5 h-5 text-sky-400" />
          End-to-End System Architecture
        </h2>
        <div className="p-6 rounded-xl border border-white/10 bg-[#0a0a0a] space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
            <div className="p-4 rounded bg-neutral-900 border border-white/10 space-y-2">
              <div className="text-amber-400 font-semibold uppercase">1. Feature Engine</div>
              <ul className="text-neutral-400 space-y-1 text-[11px]">
                <li>• 2,277 Pincode Directory</li>
                <li>• Tier 1/2/3 Mapping</li>
                <li>• Zone Complexity</li>
                <li>• Address Char Length</li>
                <li>• Landmark Detection</li>
                <li>• Night Impulse Timing</li>
              </ul>
            </div>

            <div className="p-4 rounded bg-neutral-900 border border-white/10 space-y-2">
              <div className="text-emerald-400 font-semibold uppercase">2. ML & Explainability</div>
              <ul className="text-neutral-400 space-y-1 text-[11px]">
                <li>• XGBoost Classifier</li>
                <li>• F1 Optimal Threshold (0.4467)</li>
                <li>• SHAP TreeExplainer</li>
                <li>• Groq LLM Plain-English</li>
                <li>• Immutable Audit Log</li>
              </ul>
            </div>

            <div className="p-4 rounded bg-neutral-900 border border-white/10 space-y-2">
              <div className="text-sky-400 font-semibold uppercase">3. Razorpay Integration</div>
              <ul className="text-neutral-400 space-y-1 text-[11px]">
                <li>• Payment Links API</li>
                <li>• Dynamic 5% Discount</li>
                <li>• Webhook Signature Auth</li>
                <li>• Real-Time Order Update</li>
                <li>• Zero Real Money Moved</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Tech Stack Table */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <Database className="w-5 h-5 text-purple-400" />
          Technical Stack & Deployment
        </h2>
        <div className="rounded-xl border border-white/10 bg-[#0a0a0a] overflow-hidden text-xs">
          <table className="w-full text-left">
            <thead className="bg-black/60 border-b border-white/10 text-neutral-400 uppercase font-semibold">
              <tr>
                <th className="px-4 py-3">Layer</th>
                <th className="px-4 py-3">Technology</th>
                <th className="px-4 py-3">Deployment / Tier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06] text-neutral-300">
              <tr>
                <td className="px-4 py-3 font-semibold text-white">Frontend UI</td>
                <td className="px-4 py-3 font-mono">Next.js 16 (App Router) + TypeScript + Tailwind CSS</td>
                <td className="px-4 py-3 text-neutral-400">Vercel (Free Tier)</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold text-white">Backend API</td>
                <td className="px-4 py-3 font-mono">FastAPI + Uvicorn + Pydantic</td>
                <td className="px-4 py-3 text-neutral-400">Render (Free Web Service)</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold text-white">Database</td>
                <td className="px-4 py-3 font-mono">SQLAlchemy + Asyncpg / NullPool (PostgreSQL)</td>
                <td className="px-4 py-3 text-neutral-400">Neon Serverless Postgres</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold text-white">Risk Model</td>
                <td className="px-4 py-3 font-mono">XGBoost + SHAP TreeExplainer</td>
                <td className="px-4 py-3 text-neutral-400">In-Memory Scorer</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold text-white">Payments</td>
                <td className="px-4 py-3 font-mono">Razorpay Payment Links API (Test Mode)</td>
                <td className="px-4 py-3 text-neutral-400">Webhook verified (HMAC-SHA256)</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold text-white">Keep-Warm</td>
                <td className="px-4 py-3 font-mono">GitHub Actions (/health 10-min ping)</td>
                <td className="px-4 py-3 text-neutral-400">GitHub Free Tier</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* CTA Box */}
      <div className="p-6 rounded-xl border border-white/15 bg-neutral-950 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="text-sm font-semibold text-white">Ready to test SentinelX?</div>
          <div className="text-xs text-neutral-400 mt-0.5">
            Simulate a live order or inspect model performance metrics.
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="btn btn-solid text-xs font-semibold">
            Go to Dashboard
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </div>
      </div>
    </div>
  );
}
