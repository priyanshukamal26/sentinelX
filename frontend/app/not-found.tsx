import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-24">
      <div className="text-6xl font-bold tracking-tight text-white/20 font-mono mb-4">
        404
      </div>
      <h1 className="text-2xl font-semibold text-white mb-2">Page Not Found</h1>
      <p className="text-xs text-neutral-400 max-w-sm mb-6">
        The requested URL was not found in the SentinelX console.
      </p>
      <Link href="/dashboard" className="btn btn-solid text-xs font-semibold">
        <ArrowLeft className="w-3.5 h-3.5 mr-1" />
        Return to Dashboard
      </Link>
    </div>
  );
}
