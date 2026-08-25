"use client";

import Link from "next/link";
import Image from "next/image";
import { Upload, Crown, ArrowRight } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden bg-blueprint-950">
      <div className="absolute inset-0 blueprint-grid opacity-20" />
      <div className="absolute top-20 right-0 w-96 h-96 bg-blueprint-500 rounded-full filter blur-3xl opacity-20" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-cyan-500 rounded-full filter blur-3xl opacity-10" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/10 border border-blueprint-400/40 rounded-full px-4 py-1.5 mb-6 shadow-sm">
              <span className="w-2 h-2 bg-blueprint-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-blueprint-100">Now Serving West Palm Beach</span>
            </div>
            <p className="eyebrow mb-3">Precision printing for the built environment</p>
            <h1 className="font-display text-5xl lg:text-7xl font-bold text-white leading-[1.05] mb-6 tracking-tight">
              Professional{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blueprint-300 to-cyan-300">
                Blueprint
              </span>{" "}
              Printing
            </h1>
            <p className="text-lg text-blueprint-100 mb-8 max-w-lg leading-relaxed">
              High-quality 24×36 blueprint printing for architects, engineers, and construction professionals. 
              Members enjoy exclusive pricing, rush delivery, and free digitizing services.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/order" className="btn-primary flex items-center gap-2 text-lg px-8 py-4">
                <Upload className="w-5 h-5" />
                Upload & Order
              </Link>
              <Link href="/membership" className="bg-white/10 border border-white/20 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white hover:text-blueprint-800 transition-all flex items-center gap-2">
                <Crown className="w-5 h-5" />
                View Membership
              </Link>
            </div>
            <div className="mt-10 grid grid-cols-3 gap-5 max-w-xl border-t border-white/15 pt-6">
              <div className="flex items-center gap-2">
                <div><p className="font-display text-xl font-bold text-white">24h</p><p className="text-xs text-blueprint-300">Turnaround</p></div>
              </div>
              <div className="flex items-center gap-2">
                <div><p className="font-display text-xl font-bold text-white">33%</p><p className="text-xs text-blueprint-300">Member savings</p></div>
              </div>
              <div className="flex items-center gap-2">
                <div><p className="font-display text-xl font-bold text-white">10 mi</p><p className="text-xs text-blueprint-300">Free delivery</p></div>
              </div>
            </div>
          </div>

          <div className="relative hidden lg:block">
            <div className="relative bg-white rounded-2xl shadow-2xl p-6 border border-gray-100 transform rotate-2 hover:rotate-0 transition-transform duration-500">
              <div className="relative h-[350px] overflow-hidden rounded-xl mb-4 bg-blueprint-50">
                <Image
                  src="/samples/engineering-site-plan.png"
                  alt="Engineering site plan blueprint"
                  fill
                  sizes="(max-width: 1024px) 90vw, 520px"
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-blueprint-950/35 via-transparent to-white/10" />
                <div className="absolute bottom-4 left-4 rounded-lg bg-white/90 px-3 py-2 shadow-sm backdrop-blur-sm">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-blueprint-700">Sample plan</p>
                  <p className="text-xs font-semibold text-gray-700">Site &amp; civil drawings</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider">Blueprint 24×36</p>
                  <p className="font-display font-bold text-2xl text-blueprint-800">$1.99</p>
                  <p className="text-xs text-gray-400">Member Price</p>
                </div>
                <div className="bg-gradient-to-r from-yellow-100 to-amber-100 px-3 py-1.5 rounded-lg">
                  <span className="text-xs font-bold text-yellow-800">MEMBER SAVE 33%</span>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-lg p-4 border border-gray-100 transform -rotate-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <ArrowRight className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Free Delivery</p>
                  <p className="text-xs text-gray-500">Within 10 miles • $50+ orders</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
