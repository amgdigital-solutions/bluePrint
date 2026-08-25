"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, Crown, User } from "lucide-react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<{ role: "user" | "admin" } | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    fetch("/api/auth/me").then(async (response) => {
      if (!response.ok) { setUser(null); return; }
      const result = await response.json();
      setUser(result.user || null);
    }).catch(() => setUser(null));
  }, [pathname]);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/membership", label: "Membership" },
    { href: "/order", label: "Order" },
    { href: "/products", label: "Products" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled || pathname !== "/" ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100" : "bg-transparent"
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/blueprints-club-logo.png"
              alt="Blueprints Club"
              width={1280}
              height={320}
              priority
              className="h-11 w-auto max-w-[205px] object-contain"
            />
          </Link>

          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${pathname === link.href ? "text-blueprint-700 bg-blueprint-50" : "text-gray-600 hover:text-blueprint-700 hover:bg-gray-50"}`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href={user ? "/membership" : "/register?next=/membership"}
              className="ml-3 flex items-center gap-1.5 bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900 px-4 py-2.5 rounded-lg text-sm font-bold hover:shadow-lg transition-all"
            >
              <Crown className="w-4 h-4" />
              Join Club
            </Link>
            <Link
              href={user ? (user.role === "admin" ? "/admin" : "/dashboard") : `/login?next=${encodeURIComponent(pathname)}`}
              className="ml-2 flex items-center gap-1.5 bg-blueprint-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-blueprint-700 transition-all"
            >
              <User className="w-4 h-4" />
              {user ? "Dashboard" : "Sign In"}
            </Link>
          </div>

          <button aria-label={mobileOpen ? "Close menu" : "Open menu"} className="lg:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="lg:hidden bg-white border-t shadow-lg">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`block px-4 py-3 rounded-lg text-sm font-medium ${pathname === link.href ? "bg-blueprint-50 text-blueprint-700" : "text-gray-700 hover:bg-blueprint-50 hover:text-blueprint-700"}`}
              >
                {link.label}
              </Link>
            ))}
            <Link href={user ? "/membership" : "/register?next=/membership"} onClick={() => setMobileOpen(false)} className="block px-4 py-3 rounded-lg text-sm font-bold text-yellow-800 bg-yellow-50">
              Join Blueprints Club
            </Link>
            <Link href={user ? (user.role === "admin" ? "/admin" : "/dashboard") : `/login?next=${encodeURIComponent(pathname)}`} onClick={() => setMobileOpen(false)} className="block px-4 py-3 rounded-lg text-sm font-semibold text-blueprint-700 bg-blueprint-50">
              {user ? "Dashboard" : "Sign In"}
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
