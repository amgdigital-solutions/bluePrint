import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Star, Quote } from "lucide-react";

const testimonials = [
  { name: "Marcus Johnson", role: "Project Manager, Apex Construction", text: "Blueprints Club cut our printing costs by 40%. The rush service saved us on a deadline last month when we needed 200 sets overnight. Unbelievable service.", rating: 5, location: "West Palm Beach, FL" },
  { name: "Sarah Chen", role: "Architect, Chen Design Studio", text: "Finally a print shop that understands architects. The color accuracy on our renderings is spot-on. I've stopped going to the big box stores entirely.", rating: 5, location: "Palm Beach Gardens, FL" },
  { name: "David Rodriguez", role: "Site Supervisor, BuildRight LLC", text: "Free delivery to our job sites within 10 miles? That's a game changer. No more sending interns to pick up prints. They arrive before lunch every time.", rating: 5, location: "Lake Worth, FL" },
  { name: "Jennifer Walsh", role: "Owner, Walsh Design Group", text: "The digitizing service is incredible. We had 20 years of paper archives converted to digital in a week. Now our whole team can access plans from anywhere.", rating: 5, location: "Boca Raton, FL" },
  { name: "Michael Torres", role: "General Contractor, Torres Builds", text: "Membership pays for itself. We print about 100 blueprints a month. At member prices, we save over $100 monthly. Plus the rush prints have saved projects.", rating: 5, location: "Boynton Beach, FL" },
  { name: "Amanda Foster", role: "Interior Designer, Foster Spaces", text: "I love that I can upload from my phone while on site. The quality is always perfect and the turnaround is faster than anywhere else I've tried.", rating: 5, location: "Delray Beach, FL" },
];

export default function TestimonialsPage() {
  return (
    <main>
      <Navbar />
      <section className="pt-32 pb-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="font-display text-5xl font-bold text-gray-900 mb-6">Member Stories</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Don&apos;t just take our word for it. Here&apos;s what professionals across South Florida say about Blueprints Club.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((t, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <Quote className="w-8 h-8 text-blueprint-200 mb-4" />
                <div className="flex gap-1 mb-4">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed">&ldquo;{t.text}&rdquo;</p>
                <div className="border-t border-gray-100 pt-4">
                  <p className="font-semibold text-gray-900">{t.name}</p>
                  <p className="text-sm text-gray-500">{t.role}</p>
                  <p className="text-xs text-gray-400 mt-1">{t.location}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
