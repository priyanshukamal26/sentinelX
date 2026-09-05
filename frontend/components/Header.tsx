"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, ArrowUpRight } from "lucide-react";

export default function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Analytics", href: "/analytics" },
    { label: "Metrics", href: "/metrics" },
    { label: "Audit", href: "/audit" },
    { label: "About", href: "/about" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-black/80 backdrop-blur-md border-b border-white/[0.08]">
      <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between">
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
        <nav className="hidden md:flex items-center gap-2">
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

        {/* Right CTA - Desktop */}
        <div className="hidden md:flex items-center gap-2.5">
          <Link
            href="/dashboard/settings"
            className="text-xs text-neutral-400 hover:text-white px-2.5 py-1.5 rounded transition-colors"
          >
            Settings
          </Link>
          <Link
            href="/login"
            className="btn btn-ghost text-xs py-1.5 px-3"
          >
            Portal
          </Link>
          {pathname !== "/dashboard" && !pathname.startsWith("/dashboard/") && (
            <Link href="/dashboard" className="btn btn-solid text-xs font-semibold py-1.5 px-3">
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
        <div className="md:hidden fixed inset-x-0 top-[53px] bottom-0 bg-black/95 backdrop-blur-2xl z-50 flex flex-col p-6 space-y-4">
          <div className="flex flex-col space-y-3 pt-4">
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
                  className={`nav-pill w-full justify-center !h-12 !text-base ${
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
              className="nav-pill w-full justify-center !h-12 !text-base text-neutral-300"
            >
              Settings
            </Link>
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="btn btn-ghost w-full justify-center !h-12 !text-base"
            >
              Merchant Portal
            </Link>
          </div>

          <div className="pt-4 border-t border-white/10">
            <Link
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="btn btn-solid w-full !h-12 !text-sm"
            >
              View Dashboard
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
