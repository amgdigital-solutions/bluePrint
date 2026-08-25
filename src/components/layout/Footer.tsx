import Link from "next/link";
import Image from "next/image";
import { MapPin, Phone, Mail, Clock } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-blueprint-950 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          <div className="md:col-span-2">
            <Image
              src="/blueprints-club-logo.png"
              alt="Blueprints Club"
              width={1280}
              height={320}
              className="h-16 w-auto max-w-[260px] rounded bg-white object-contain mb-4"
            />
            <p className="text-blueprint-300 text-sm leading-relaxed max-w-sm">
              Your trusted partner for professional blueprint printing in West Palm Beach. 
              Serving architects, engineers, and construction professionals with quality, speed, and reliability.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-blueprint-200">Quick Links</h4>
            <ul className="space-y-2 text-sm text-blueprint-300">
              <li><Link href="/membership" className="hover:text-white transition-colors">Membership</Link></li>
              <li><Link href="/order" className="hover:text-white transition-colors">Order Now</Link></li>
              <li><Link href="/products" className="hover:text-white transition-colors">Products</Link></li>
              <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-blueprint-200">Contact</h4>
            <ul className="space-y-3 text-sm text-blueprint-300">
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                5001 S Dixie Hwy, WPB, FL
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 flex-shrink-0" />
                <a href="tel:+15618049110" className="hover:text-white transition-colors">+1 561-804-9110</a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 flex-shrink-0" />
                info@blueprintsclub.com
              </li>
              <li className="flex items-center gap-2">
                <Clock className="w-4 h-4 flex-shrink-0" />
                Mon–Fri: 9AM–5PM
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-blueprint-900 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-blueprint-400">&copy; 2026 Blueprints Club. All rights reserved.</p>
          <div className="flex gap-6 text-sm text-blueprint-400">
            <span className="hover:text-white cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-white cursor-pointer transition-colors">Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
