import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function CTABanner() {
  return (
    <section className="py-20 bg-gradient-to-r from-blueprint-600 to-blueprint-800">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h2 className="font-display text-3xl lg:text-4xl font-bold text-white mb-4">Ready to Print Smarter?</h2>
        <p className="text-blueprint-100 mb-8 text-lg">Join 500+ professionals saving time and money with Blueprints Club.</p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/order" className="bg-white text-blueprint-700 px-8 py-4 rounded-xl font-bold hover:bg-blueprint-50 transition-all flex items-center gap-2">
            Start Your Order <ArrowRight className="w-5 h-5" />
          </Link>
          <Link href="/membership" className="border-2 border-white text-white px-8 py-4 rounded-xl font-bold hover:bg-white/10 transition-all">
            View Membership Plans
          </Link>
        </div>
      </div>
    </section>
  );
}
