"use client";

import Link from "next/link";
import { Upload, Crown, CheckCircle2, ArrowRight } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      <div className="absolute inset-0 blueprint-grid opacity-50" />
      <div className="absolute top-20 right-0 w-96 h-96 bg-blueprint-200 rounded-full filter blur-3xl opacity-30" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-blueprint-300 rounded-full filter blur-3xl opacity-20" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-blueprint-50 border border-blueprint-200 rounded-full px-4 py-1.5 mb-6">
              <span className="w-2 h-2 bg-blueprint-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-blueprint-700">Now Serving West Palm Beach</span>
            </div>
            <h1 className="font-display text-5xl lg:text-7xl font-bold text-gray-900 leading-tight mb-6">
              Professional{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blueprint-600 to-blueprint-800">
                Blueprint
              </span>{" "}
              Printing
            </h1>
            <p className="text-lg text-gray-600 mb-8 max-w-lg leading-relaxed">
              High-quality 24×36 blueprint printing for architects, engineers, and construction professionals. 
              Members enjoy exclusive pricing, rush delivery, and free digitizing services.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/order" className="btn-primary flex items-center gap-2 text-lg px-8 py-4">
                <Upload className="w-5 h-5" />
                Upload & Order
              </Link>
              <Link href="/membership" className="bg-white border-2 border-gray-200 text-gray-700 px-8 py-4 rounded-xl font-semibold text-lg hover:border-blueprint-300 hover:text-blueprint-700 transition-all flex items-center gap-2">
                <Crown className="w-5 h-5" />
                View Membership
              </Link>
            </div>
            <div className="mt-10 flex items-center gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span>24hr Turnaround</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span>Members Save 33%</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span>Free Delivery $50+</span>
              </div>
            </div>
          </div>

          <div className="relative hidden lg:block">
            <div className="relative bg-white rounded-2xl shadow-2xl p-6 border border-gray-100 transform rotate-2 hover:rotate-0 transition-transform duration-500">
              <div className="bg-blueprint-50 rounded-xl p-8 mb-4 blueprint-grid">
                <div className="border-2 border-blueprint-300 border-dashed rounded-lg p-6 bg-white/80">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-24 h-3 bg-blueprint-200 rounded" />
                    <div className="w-8 h-8 bg-blueprint-100 rounded-full" />
                  </div>
                  <div className="space-y-2">
                    <div className="w-full h-2 bg-blueprint-100 rounded" />
                    <div className="w-3/4 h-2 bg-blueprint-100 rounded" />
                    <div className="w-5/6 h-2 bg-blueprint-100 rounded" />
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    <div className="h-16 bg-blueprint-50 rounded border border-blueprint-200" />
                    <div className="h-16 bg-blueprint-50 rounded border border-blueprint-200" />
                    <div className="h-16 bg-blueprint-50 rounded border border-blueprint-200" />
                  </div>
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
