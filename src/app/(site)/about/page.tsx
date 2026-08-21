import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { MapPin, Phone, Mail, Award, Users, Clock, Shield } from "lucide-react";

export default function AboutPage() {
  return (
    <main>
      <Navbar />
      <section className="pt-32 pb-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="font-display text-5xl font-bold text-gray-900 mb-6">About Blueprints Club</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              We are West Palm Beach's premier blueprint printing service, built by professionals for professionals. 
              Our mission is simple: deliver high-quality prints fast, at prices that make sense.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
            <div className="bg-blueprint-50 rounded-2xl p-10 blueprint-grid">
              <div className="bg-white rounded-xl p-8 shadow-sm">
                <h3 className="font-display text-2xl font-bold text-gray-900 mb-4">Our Story</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Founded in 2024, Blueprints Club was born from a simple frustration — print shops that didn't understand 
                  the urgency and precision required in construction and architecture.
                </p>
                <p className="text-gray-600 leading-relaxed">
                  Today, we serve hundreds of professionals across South Florida with same-day printing, 
                  member-exclusive pricing, and delivery straight to job sites. We're not just a print shop — 
                  we're your project's behind-the-scenes partner.
                </p>
              </div>
            </div>
            <div className="space-y-6">
              {[
                { icon: Award, title: "Quality Guaranteed", desc: "Every print inspected before delivery. If it's not right, we reprint it free." },
                { icon: Users, title: "Built for Teams", desc: "Corporate accounts with centralized billing and multi-user access coming soon." },
                { icon: Clock, title: "Speed Matters", desc: "Standard 24hr turnaround. Rush service available for members on call." },
                { icon: Shield, title: "Secure & Private", desc: "Your plans are confidential. Files are encrypted and auto-deleted after 30 days." },
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blueprint-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-6 h-6 text-blueprint-600" />
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-lg text-gray-900">{item.title}</h4>
                    <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-blueprint-900 rounded-2xl p-10 text-white">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <p className="font-display text-5xl font-bold text-blueprint-300 mb-2">50,000+</p>
                <p className="text-blueprint-200">Prints Delivered</p>
              </div>
              <div>
                <p className="font-display text-5xl font-bold text-blueprint-300 mb-2">500+</p>
                <p className="text-blueprint-200">Active Members</p>
              </div>
              <div>
                <p className="font-display text-5xl font-bold text-blueprint-300 mb-2">99.2%</p>
                <p className="text-blueprint-200">On-Time Rate</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
