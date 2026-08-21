"use client";

import { useState } from "react";
import { Save, CheckCircle2, Store, Truck, DollarSign } from "lucide-react";

export default function AdminSettingsPage() {
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState({
    businessName: "Blueprints Club",
    address: "5001 S Dixie Hwy, West Palm Beach, FL 33405",
    phone: "+1 561-804-9110",
    email: "info@blueprintsclub.com",
    deliveryRadius: "10",
    minOrderDelivery: "50",
    constructionFee: "15",
    bwPrice: "2.99",
    bwMemberPrice: "1.99",
    colorPrice: "6.95",
    colorMemberPrice: "5.95",
    digitizingPrice: "1.99",
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Configure your business details and pricing</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {saved && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Settings saved successfully!
          </div>
        )}

        {/* Business Info */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blueprint-50 rounded-xl flex items-center justify-center">
              <Store className="w-5 h-5 text-blueprint-600" />
            </div>
            <h3 className="font-display font-bold text-lg text-gray-900">Business Information</h3>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Business Name</label>
              <input type="text" value={settings.businessName} onChange={(e) => setSettings({ ...settings, businessName: e.target.value })} className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blueprint-500 transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
              <input type="email" value={settings.email} onChange={(e) => setSettings({ ...settings, email: e.target.value })} className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blueprint-500 transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
              <input type="tel" value={settings.phone} onChange={(e) => setSettings({ ...settings, phone: e.target.value })} className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blueprint-500 transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Address</label>
              <input type="text" value={settings.address} onChange={(e) => setSettings({ ...settings, address: e.target.value })} className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blueprint-500 transition-colors" />
            </div>
          </div>
        </div>

        {/* Delivery Settings */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blueprint-50 rounded-xl flex items-center justify-center">
              <Truck className="w-5 h-5 text-blueprint-600" />
            </div>
            <h3 className="font-display font-bold text-lg text-gray-900">Delivery Settings</h3>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Delivery Radius (miles)</label>
              <input type="number" value={settings.deliveryRadius} onChange={(e) => setSettings({ ...settings, deliveryRadius: e.target.value })} className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blueprint-500 transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Min Order for Free Delivery ($)</label>
              <input type="number" value={settings.minOrderDelivery} onChange={(e) => setSettings({ ...settings, minOrderDelivery: e.target.value })} className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blueprint-500 transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Construction Site Fee ($)</label>
              <input type="number" value={settings.constructionFee} onChange={(e) => setSettings({ ...settings, constructionFee: e.target.value })} className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blueprint-500 transition-colors" />
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blueprint-50 rounded-xl flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-blueprint-600" />
            </div>
            <h3 className="font-display font-bold text-lg text-gray-900">Pricing</h3>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gray-50 rounded-xl p-4">
              <h4 className="font-semibold text-gray-900 mb-4">Black & White 24×36</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Regular Price</label>
                  <input type="number" step="0.01" value={settings.bwPrice} onChange={(e) => setSettings({ ...settings, bwPrice: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-blueprint-500 transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Member Price</label>
                  <input type="number" step="0.01" value={settings.bwMemberPrice} onChange={(e) => setSettings({ ...settings, bwMemberPrice: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-blueprint-500 transition-colors" />
                </div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <h4 className="font-semibold text-gray-900 mb-4">Color 24×36</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Regular Price</label>
                  <input type="number" step="0.01" value={settings.colorPrice} onChange={(e) => setSettings({ ...settings, colorPrice: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-blueprint-500 transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Member Price</label>
                  <input type="number" step="0.01" value={settings.colorMemberPrice} onChange={(e) => setSettings({ ...settings, colorMemberPrice: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-blueprint-500 transition-colors" />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Digitizing Service ($)</label>
              <input type="number" step="0.01" value={settings.digitizingPrice} onChange={(e) => setSettings({ ...settings, digitizingPrice: e.target.value })} className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blueprint-500 transition-colors" />
            </div>
          </div>
        </div>

        <button type="submit" className="btn-primary flex items-center gap-2">
          <Save className="w-4 h-4" />
          Save All Settings
        </button>
      </form>
    </div>
  );
}
