"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import {
  Menu,
  X,
  ArrowUpRight,
  ChevronDown,
  LogOut,
  Settings,
  Scale,
  Sparkles,
  Store,
} from "lucide-react";
import {
  getCurrentUser,
  setCurrentUser as setAuthUser,
  logout,
  MerchantProfile,
  MERCHANT_PROFILES,
} from "@/lib/auth";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUserState] = useState<MerchantProfile | null>(null);
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateAuth = () => {
      setCurrentUserState(getCurrentUser());
    };
    updateAuth();
    window.addEventListener("sentinelx_auth_changed", updateAuth);
    return () => window.removeEventListener("sentinelx_auth_changed", updateAuth);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setSwitcherOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSwitchStore = (profile: MerchantProfile) => {
    setAuthUser(profile);
    setSwitcherOpen(false);
  };

  const handleLogout = () => {
    logout();
    setSwitcherOpen(false);
    router.push("/login");
  };

  const navLinks = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Analytics", href: "/analytics" },
    { label: "Metrics", href: "/metrics" },
    { label: "Audit", href: "/audit" },
    { label: "About", href: "/about" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-black/80 backdrop-blur-md border-b border-white/[0.08]">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="inline-flex items-center gap-2.5 text-white hover:opacity-90 transition-opacity"
        >
          <div className="text-white">
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-5 h-5 text-white"
            >
              <g transform="rotate(-30 12 12)">
                <circle cx="7.3" cy="3.2" r="1.45" />
                <rect x="5.5" y="4.7" width="3.6" height="14.6" rx="1.8" />
                <rect x="14.9" y="4.7" width="3.6" height="14.6" rx="1.8" />
                <circle cx="16.7" cy="20.8" r="1.45" />
              </g>
            </svg>
          </div>
          <span className="text-[15.5px] tracking-tight text-white font-semibold">
            Sentinel<span className="font-normal text-white/90">X</span>
          </span>
        </Link>

        {/* Center Pill Nav - Desktop */}
        <nav className="hidden md:flex items-center gap-1.5">
          {navLinks.map((link) => {
            const isActive =
              link.href === "/dashboard"
                ? pathname.startsWith("/dashboard")
                : pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`nav-pill ${isActive ? "active" : ""}`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Controls - Desktop */}
        <div className="hidden md:flex items-center gap-3">
          {currentUser ? (
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setSwitcherOpen(!switcherOpen)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                  currentUser.isJudge
                    ? "border-amber-500/40 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20"
                    : "border-white/15 bg-neutral-900 text-white hover:border-white/30"
                }`}
              >
                <span className="text-sm">{currentUser.avatar}</span>
                <span className="max-w-[120px] truncate font-semibold">
                  {currentUser.isJudge ? "Judge Master View" : currentUser.name}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-neutral-400 transition-transform ${switcherOpen ? "rotate-180" : ""}`} />
              </button>

              {/* Dropdown Menu */}
              {switcherOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-xl border border-white/15 bg-neutral-950 p-2 shadow-2xl z-50 text-xs animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-2.5 py-1.5 text-[10px] uppercase tracking-wider font-semibold text-neutral-500">
                    Active Account
                  </div>
                  <div className="px-2.5 py-1.5 mb-1.5 rounded-lg bg-white/5 border border-white/10 space-y-0.5">
                    <div className="flex items-center gap-1.5 font-semibold text-white">
                      <span>{currentUser.avatar}</span>
                      <span className="truncate">{currentUser.name}</span>
                    </div>
                    <div className="text-[10px] text-neutral-400">
                      Threshold: <span className="font-mono text-white">{currentUser.defaultThreshold}</span>
                    </div>
                  </div>

                  <div className="px-2.5 py-1 text-[10px] uppercase tracking-wider font-semibold text-neutral-500">
                    Switch Store / Profile
                  </div>
                  <div className="space-y-0.5 mb-1">
                    {[
                      MERCHANT_PROFILES.urban_vogue,
                      MERCHANT_PROFILES.kicks_india,
                      MERCHANT_PROFILES.aura_electronics,
                      MERCHANT_PROFILES.judge_master,
                    ].map((p) => {
                      const isCurrent = currentUser.id === p.id;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => handleSwitchStore(p)}
                          className={`w-full text-left px-2.5 py-1.5 rounded-md flex items-center justify-between transition-colors ${
                            isCurrent
                              ? "bg-white/10 text-white font-medium"
                              : "text-neutral-400 hover:text-white hover:bg-white/5"
                          }`}
                        >
                          <span className="flex items-center gap-1.5 truncate">
                            <span>{p.avatar}</span>
                            <span className="truncate">{p.name}</span>
                          </span>
                          <span className="text-[10px] font-mono text-neutral-500">
                            {p.defaultThreshold}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="pt-1.5 border-t border-white/10 flex items-center justify-between">
                    <Link
                      href="/dashboard/settings"
                      onClick={() => setSwitcherOpen(false)}
                      className="flex items-center gap-1 text-[11px] text-neutral-400 hover:text-white px-2 py-1 rounded transition-colors"
                    >
                      <Settings className="w-3 h-3" />
                      Settings
                    </Link>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex items-center gap-1 text-[11px] text-red-400 hover:text-red-300 px-2 py-1 rounded transition-colors"
                    >
                      <LogOut className="w-3 h-3" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="btn btn-solid text-xs font-semibold py-1.5 px-3"
            >
              Sign In / Select Store
            </Link>
          )}

          {pathname !== "/dashboard" && !pathname.startsWith("/dashboard/") && (
            <Link
              href="/dashboard"
              className="btn btn-ghost text-xs py-1.5 px-3"
            >
              Dashboard
              <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
            </Link>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-white/80 hover:text-white"
          aria-label="Toggle Menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-[51px] bottom-0 bg-black/95 backdrop-blur-2xl z-50 flex flex-col p-6 space-y-4">
          {currentUser && (
            <div className="p-3 rounded-lg border border-white/15 bg-neutral-900 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">{currentUser.avatar}</span>
                <div>
                  <div className="text-xs font-semibold text-white">{currentUser.name}</div>
                  <div className="text-[10px] text-neutral-400">
                    Threshold: {currentUser.defaultThreshold}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="text-xs text-red-400 hover:underline"
              >
                Sign Out
              </button>
            </div>
          )}

          <div className="flex flex-col space-y-2 pt-2">
            {navLinks.map((link) => {
              const isActive =
                link.href === "/dashboard"
                  ? pathname.startsWith("/dashboard")
                  : pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`nav-pill w-full justify-center !h-11 !text-sm ${
                    isActive ? "active" : ""
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <Link
              href="/dashboard/settings"
              onClick={() => setMobileMenuOpen(false)}
              className="nav-pill w-full justify-center !h-11 !text-sm text-neutral-300"
            >
              Settings
            </Link>
            {!currentUser && (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="btn btn-solid w-full justify-center !h-11 !text-sm mt-2"
              >
                Sign In / Select Store
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
