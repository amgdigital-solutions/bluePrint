"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  Settings,
  LogOut,
  DraftingCompass,
  ChevronRight,
  Shield,
} from "lucide-react";

const navItems = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/subscribers", label: "Subscribers", icon: Users },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [adminName, setAdminName] = useState("Admin");

  useEffect(() => {
    fetch("/api/auth/me")
      .then((response) => response.json())
      .then((result) => result.user?.name && setAdminName(result.user.name))
      .catch(() => undefined);
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top bar */}
      <header className="bg-blueprint-900 text-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/admin" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blueprint-600 rounded-lg flex items-center justify-center">
                <DraftingCompass className="w-4 h-4 text-white" />
              </div>
              <span className="font-display font-bold text-lg">Admin Panel</span>
              <span className="bg-blueprint-700 text-blueprint-200 text-xs px-2 py-0.5 rounded-full ml-2">Blueprints Club</span>
            </Link>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-blueprint-200">
                <Shield className="w-4 h-4" />
                <span className="hidden sm:inline">{adminName}</span>
              </div>
              <button onClick={handleLogout} className="text-sm text-blueprint-300 hover:text-white flex items-center gap-1 transition-colors">
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Sidebar */}
          <aside className="hidden lg:block">
            <nav className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              {navItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-6 py-4 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-blueprint-50 text-blueprint-700 border-r-2 border-blueprint-600"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                    {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
                  </Link>
                );
              })}
            </nav>
          </aside>

          {/* Mobile nav */}
          <div className="lg:hidden flex gap-2 overflow-x-auto pb-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
                    isActive
                      ? "bg-blueprint-50 text-blueprint-700"
                      : "bg-white text-gray-600 border border-gray-200"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Main content */}
          <main className="lg:col-span-4">{children}</main>
        </div>
      </div>
    </div>
  );
}
