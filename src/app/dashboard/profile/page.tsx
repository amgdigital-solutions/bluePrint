"use client";

import { useState } from "react";
import { User, Mail, Phone, MapPin, Crown, Save, CheckCircle2 } from "lucide-react";

export default function DashboardProfilePage() {
  const [saved, setSaved] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "John Smith",
    email: "john@company.com",
    phone: "+1 (561) 804-9110",
    company: "Smith Construction",
    address: "123 Main St, West Palm Beach, FL 33405",
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-gray-900">My Profile</h1>

      {/* Membership Card */}
      <div className="bg-gradient-to-r from-yellow-400 to-amber-500 rounded-2xl p-6 text-yellow-900">
        <div className="flex items-center gap-3 mb-2">
          <Crown className="w-6 h-6" />
          <h3 className="font-display font-bold text-lg">Monthly Member</h3>
        </div>
        <p className="text-yellow-800 text-sm mb-1">Member since Aug 2026</p>
        <p className="text-yellow-800 text-sm">Renews on Sep 20, 2026</p>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
        {saved && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Profile updated successfully!
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:border-blueprint-500 transition-colors"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:border-blueprint-500 transition-colors"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:border-blueprint-500 transition-colors"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Company</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:border-blueprint-500 transition-colors"
              />
            </div>
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Default Delivery Address</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <textarea
              rows={2}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:border-blueprint-500 transition-colors resize-none"
            />
          </div>
        </div>
        <button type="submit" className="btn-primary flex items-center gap-2">
          <Save className="w-4 h-4" />
          Save Changes
        </button>
      </form>
    </div>
  );
}
