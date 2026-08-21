"use client";

import { useEffect, useState } from "react";
import { Printer, Users, Truck, Clock } from "lucide-react";

const stats = [
  { icon: Printer, value: 50000, suffix: "+", label: "Prints Delivered" },
  { icon: Users, value: 500, suffix: "+", label: "Active Members" },
  { icon: Truck, value: 10, suffix: " mi", label: "Free Delivery Radius" },
  { icon: Clock, value: 24, suffix: "hr", label: "Rush Turnaround" },
];

function AnimatedCounter({ target, suffix }: { target: number; suffix: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [target]);

  return (
    <span className="font-display text-4xl font-bold text-blueprint-700">
      {count.toLocaleString()}{suffix}
    </span>
  );
}

export default function Stats() {
  return (
    <section className="py-16 bg-white border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, idx) => (
            <div key={idx} className="text-center">
              <stat.icon className="w-8 h-8 text-blueprint-500 mx-auto mb-3" />
              <AnimatedCounter target={stat.value} suffix={stat.suffix} />
              <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
