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

      {/* Lead Architect & Builder Spotlight */}
      <div className="p-8 rounded-2xl border border-white/20 bg-gradient-to-br from-neutral-950 via-[#0d0d0d] to-neutral-950 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500/30 to-amber-300/10 border border-amber-400/40 flex items-center justify-center font-mono font-bold text-xl text-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.15)]">
              PK
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white tracking-tight">Priyanshu Kamal</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-amber-400/20 text-amber-200 border border-amber-400/30">
                  CREATOR & ARCHITECT
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                Full-Stack ML & Systems Engineer · Builder of SentinelX
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href="https://www.linkedin.com/in/priyanshukamal/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#0A66C2]/50 bg-[#0A66C2]/15 text-[#70B5F9] hover:bg-[#0A66C2]/25 hover:text-white transition-all text-xs font-semibold"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.64c-.88 0-1.6.72-1.6 1.6s.72 1.6 1.6 1.6 1.6-.72 1.6-1.6-.72-1.6-1.6-1.6Z" />
              </svg>
              <span>Connect on LinkedIn</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-70" />
            </a>
            <a
              href="https://github.com/priyanshukamal26/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-white/20 bg-white/5 text-white hover:bg-white/15 transition-all text-xs font-semibold"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              <span>GitHub @priyanshukamal26</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-70" />
            </a>
          </div>
        </div>

        <div className="space-y-3 text-xs leading-relaxed text-neutral-300">
          <div className="font-semibold text-white uppercase tracking-wider text-[11px] text-amber-400">
            Builder&apos;s Philosophy & Message:
          </div>
          <p>
            &ldquo;In Indian e-commerce, Cash on Delivery is both the lifeblood of customer acquisition and the single biggest killer of D2C profitability. With return rates climbing past 30% in non-metro tiers, traditional fraud systems react by aggressively cancelling orders — turning away honest customers and sacrificing gross merchandise value.&rdquo;
          </p>
          <p>
            &ldquo;With <strong>SentinelX</strong>, I built an alternative paradigm: <em>Defense-Only Risk Engineering</em>. Rather than blocking transactions, we leverage machine learning telemetry to predict friction points and deploy timely, gamified Razorpay prepaid conversion nudges. The customer gets an exclusive discount, and the merchant eliminates return logistics losses with zero cart abandonment. Building this end-to-end for the Razorpay AI Buildathon has been a masterclass in pragmatism, explainability, and real-world fintech architecture.&rdquo;
          </p>
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
