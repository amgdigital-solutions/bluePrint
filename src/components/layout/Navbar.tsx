"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, DraftingCompass, Crown, User } from "lucide-react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
      scrolled ? "bg-white/95 backdrop-blur-md shadow-sm" : "bg-transparent"
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blueprint-600 to-blueprint-800 rounded-lg flex items-center justify-center">
              <DraftingCompass className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-display font-bold text-xl text-blueprint-900">Blueprints Club</h1>
              <p className="text-[10px] text-blueprint-600 -mt-1 tracking-wider uppercase">Professional Printing</p>
            </div>
          </Link>

          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-blueprint-700 hover:bg-gray-50 transition-all"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/membership"
              className="ml-3 flex items-center gap-1.5 bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900 px-4 py-2.5 rounded-lg text-sm font-bold hover:shadow-lg transition-all"
            >
              <Crown className="w-4 h-4" />
              Join Club
            </Link>
            <Link
              href="/login"
              className="ml-2 flex items-center gap-1.5 bg-blueprint-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-blueprint-700 transition-all"
            >
              <User className="w-4 h-4" />
              Sign In
            </Link>
          </div>

          <button className="lg:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
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
                className="block px-4 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-blueprint-50 hover:text-blueprint-700"
              >
                {link.label}
              </Link>
            ))}
            <Link href="/membership" className="block px-4 py-3 rounded-lg text-sm font-bold text-yellow-800 bg-yellow-50">
              Join Blueprints Club
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
