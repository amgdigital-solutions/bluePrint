import { Upload, BadgeDollarSign, Truck, Clock } from "lucide-react";

const stats = [
  { icon: Upload, value: "Easy", label: "Online file upload" },
  { icon: BadgeDollarSign, value: "Member", label: "Exclusive pricing" },
  { icon: Truck, value: "10 mi", label: "Delivery radius" },
  { icon: Clock, value: "24 hr", label: "Rush turnaround" },
];

export default function Stats() {
  return (
    <section className="py-16 bg-white border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, idx) => (
            <div key={idx} className="text-center">
              <stat.icon className="w-8 h-8 text-blueprint-500 mx-auto mb-3" />
              <span className="font-display text-3xl font-bold text-blueprint-700">{stat.value}</span>
              <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
