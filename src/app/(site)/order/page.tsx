"use client";

import { useState, useRef, useCallback } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Upload, UploadCloud, X, MapPin, Navigation, Send, CheckCircle2, Loader2, Truck, AlertTriangle } from "lucide-react";

const BUSINESS_LAT = 26.6834;
const BUSINESS_LNG = -80.0543;
const DELIVERY_RADIUS_MILES = 10;

function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 3959;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function OrderPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    printType: "bw" as "bw" | "color",
    quantity: 1,
    isMember: false,
    isConstructionSite: false,
    address: "",
    useGeolocation: false,
    file: null as File | null,
    notes: "",
  });
  const [distance, setDistance] = useState<number | null>(null);
  const [calculating, setCalculating] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const printPrices = { bw: { regular: 2.99, member: 1.99 }, color: { regular: 6.95, member: 5.95 } };
  const unitPrice = formData.isMember ? printPrices[formData.printType].member : printPrices[formData.printType].regular;
  const subtotal = unitPrice * formData.quantity;
  const deliveryFee = formData.isMember && subtotal >= 50 && distance !== null && distance <= 10 && formData.isConstructionSite ? 15 : 0;
  const total = subtotal + deliveryFee;
  const eligibleForFreeDelivery = formData.isMember && subtotal >= 50 && distance !== null && distance <= 10 && !formData.isConstructionSite;

  const calculateDeliveryDistance = async () => {
    if (!formData.address.trim() && !formData.useGeolocation) {
      alert("Please enter an address or use your current location");
      return;
    }
    setCalculating(true);
    try {
      if (formData.useGeolocation && navigator.geolocation) {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });
        const dist = calculateDistance(BUSINESS_LAT, BUSINESS_LNG, position.coords.latitude, position.coords.longitude);
        setDistance(parseFloat(dist.toFixed(1)));
      } else {
        await new Promise((r) => setTimeout(r, 1000));
        const simulatedDist = Math.random() * 13 + 2;
        setDistance(parseFloat(simulatedDist.toFixed(1)));
      }
    } catch {
      alert("Unable to calculate distance. Please try again.");
    }
    setCalculating(false);
  };

  const handleFileDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.type.startsWith("image/") || /\.(pdf|dwg|dxf)$/i.test(file.name))) {
      setFormData((prev) => ({ ...prev, file }));
    } else {
      alert("Please upload an image, PDF, or CAD file");
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.file) { alert("Please upload your blueprint file"); return; }
    if (!formData.name || !formData.email || !formData.phone) { alert("Please fill in all required fields"); return; }
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <main>
      <Navbar />
      <section className="pt-32 pb-20 bg-white relative">
        <div className="absolute inset-0 blueprint-grid opacity-20" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-12">
            <h1 className="font-display text-4xl font-bold text-gray-900 mb-4">Place Your Order</h1>
            <p className="text-gray-600">Upload your design, choose your specs, and we&apos;ll handle the rest.</p>
          </div>

          {submitted ? (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-12 text-center">
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="font-display text-2xl font-bold text-green-900 mb-2">Order Submitted!</h2>
              <p className="text-green-700">We&apos;ll contact you within 30 minutes to confirm your order.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="p-8 lg:p-10">
                {/* File Upload */}
                <div className="mb-8">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Upload Your Blueprint *</label>
                  <div
                    className={`rounded-xl p-8 text-center cursor-pointer border-2 border-dashed transition-all ${dragOver ? "border-blueprint-500 bg-blueprint-50" : "border-gray-200 bg-gray-50 hover:border-blueprint-300"}`}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleFileDrop}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input ref={fileInputRef} type="file" className="hidden" accept="image/*,.pdf,.dwg,.dxf" onChange={(e) => setFormData({ ...formData, file: e.target.files?.[0] || null })} />
                    {formData.file ? (
                      <div className="flex items-center justify-center gap-3">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                          <CheckCircle2 className="w-6 h-6 text-green-600" />
                        </div>
                        <div className="text-left">
                          <p className="font-medium text-gray-900">{formData.file.name}</p>
                          <p className="text-sm text-gray-500">{(formData.file.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                        <button type="button" onClick={(e) => { e.stopPropagation(); setFormData({ ...formData, file: null }); }} className="ml-4 text-red-500 hover:text-red-700">
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <UploadCloud className="w-12 h-12 text-blueprint-400 mx-auto mb-3" />
                        <p className="font-medium text-gray-700 mb-1">Drop your file here or click to browse</p>
                        <p className="text-sm text-gray-400">Supports PDF, JPG, PNG, DWG, DXF up to 50MB</p>
                      </>
                    )}
                  </div>
                </div>

                {/* Customer Info */}
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
                    <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blueprint-500 transition-colors" placeholder="John Smith" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
                    <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blueprint-500 transition-colors" placeholder="john@company.com" />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Phone *</label>
                    <input type="tel" required value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blueprint-500 transition-colors" placeholder="+1 (561) 804-9110" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Print Type</label>
                    <select value={formData.printType} onChange={(e) => setFormData({ ...formData, printType: e.target.value as "bw" | "color" })} className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blueprint-500 transition-colors">
                      <option value="bw">Black & White — ${formData.isMember ? "1.99" : "2.99"}/print</option>
                      <option value="color">Color — ${formData.isMember ? "5.95" : "6.95"}/print</option>
                    </select>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Quantity</label>
                    <input type="number" min={1} value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })} className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blueprint-500 transition-colors" />
                  </div>
                  <div className="flex items-center">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" checked={formData.isMember} onChange={(e) => setFormData({ ...formData, isMember: e.target.checked })} className="w-5 h-5 text-blueprint-600 rounded border-gray-300" />
                      <span className="text-sm font-medium text-gray-700">I am a member</span>
                    </label>
                  </div>
                  <div className="flex items-center">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" checked={formData.isConstructionSite} onChange={(e) => setFormData({ ...formData, isConstructionSite: e.target.checked })} className="w-5 h-5 text-blueprint-600 rounded border-gray-300" />
                      <span className="text-sm font-medium text-gray-700">Construction site delivery</span>
                    </label>
                  </div>
                </div>

                {/* Distance Calculator */}
                <div className="bg-blueprint-50 rounded-xl p-6 mb-6 border border-blueprint-100">
                  <h4 className="font-display font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-blueprint-600" />
                    Delivery Distance Check
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Address</label>
                      <input type="text" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white focus:border-blueprint-500 transition-colors" placeholder="Enter your address" />
                    </div>
                    <div className="flex items-end gap-3">
                      <button type="button" onClick={calculateDeliveryDistance} disabled={calculating} className="flex-1 bg-blueprint-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-blueprint-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                        {calculating ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
                        {calculating ? "Calculating..." : "Check Distance"}
                      </button>
                      <button type="button" onClick={() => setFormData({ ...formData, useGeolocation: !formData.useGeolocation })} className={`px-4 py-3 rounded-lg font-medium border-2 transition-all flex items-center gap-2 ${formData.useGeolocation ? "bg-blueprint-100 border-blueprint-300 text-blueprint-700" : "border-gray-200 text-gray-600 hover:border-blueprint-300"}`}>
                        <Navigation className="w-4 h-4" />
                        Use My Location
                      </button>
                    </div>
                  </div>

                  {distance !== null && (
                    <div className={`rounded-lg p-4 ${distance <= DELIVERY_RADIUS_MILES ? "bg-green-100 border border-green-200" : "bg-red-50 border border-red-200"}`}>
                      <div className="flex items-center gap-3">
                        {distance <= DELIVERY_RADIUS_MILES ? <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" /> : <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0" />}
                        <div>
                          <p className="font-semibold text-gray-900">{distance <= DELIVERY_RADIUS_MILES ? "Delivery Available!" : "Outside Delivery Range"}</p>
                          <p className="text-sm text-gray-600">
                            Distance: <span className="font-bold">{distance} miles</span> from our West Palm Beach location.
                            {distance <= DELIVERY_RADIUS_MILES ? ` Free delivery on orders $50+${formData.isConstructionSite ? " (+$15 site fee)" : ""}.` : " Please choose pickup or call us at +1 561-804-9110 for special arrangements."}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Special Instructions</label>
                  <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={3} className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blueprint-500 transition-colors resize-none" placeholder="Any specific requirements, rush requests, etc." />
                </div>

                {/* Order Summary */}
                <div className="bg-gray-50 rounded-xl p-6 mb-6">
                  <h4 className="font-display font-bold text-lg text-gray-900 mb-4">Order Summary</h4>
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">{formData.quantity} × {formData.printType === "bw" ? "B&W" : "Color"} Blueprint</span>
                      <span className="font-medium">${subtotal.toFixed(2)}</span>
                    </div>
                    {deliveryFee > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Construction Site Fee</span>
                        <span className="font-medium">${deliveryFee.toFixed(2)}</span>
                      </div>
                    )}
                    {eligibleForFreeDelivery && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Free Delivery (Member Benefit)</span>
                        <span className="font-medium">-$0.00</span>
                      </div>
                    )}
                  </div>
                  <div className="border-t border-gray-200 pt-3 flex justify-between items-center">
                    <span className="font-display font-bold text-lg text-gray-900">Total</span>
                    <span className="font-display text-3xl font-bold text-blueprint-700">${total.toFixed(2)}</span>
                  </div>
                  {formData.isMember && (
                    <p className="text-sm text-green-600 mt-2">You saved ${((printPrices[formData.printType].regular - unitPrice) * formData.quantity).toFixed(2)} with your membership!</p>
                  )}
                </div>

                <button type="submit" className="w-full btn-primary py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2">
                  <Send className="w-5 h-5" />
                  Submit Order
                </button>
                <p className="text-center text-sm text-gray-400 mt-4">We&apos;ll contact you within 30 minutes to confirm your order during business hours.</p>
              </div>
            </form>
          )}
        </div>
      </section>
      <Footer />
    </main>
  );
}
