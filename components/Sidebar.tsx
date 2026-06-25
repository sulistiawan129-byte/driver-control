"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Calendar,
  BarChart3,
  Truck,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const navItems = [
  {
    href: "/dashboard",
    icon: LayoutDashboard,
    label: "Dashboard",
    description: "Overview & Summary",
  },
  {
    href: "/dashboard/input",
    icon: Truck,
    label: "Input Data",
    description: "Catat Kehadiran",
  },
  {
    href: "/calendar",
    icon: Calendar,
    label: "Kalender",
    description: "Jadwal Visual",
  },
  {
    href: "/drivers",
    icon: Users,
    label: "Master Driver",
    description: "Kelola Driver",
  },
  {
    href: "/report",
    icon: BarChart3,
    label: "Laporan",
    description: "Statistik & Chart",
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-blue-700/30">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center">
            <Truck className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-white font-bold text-sm tracking-wide">
              DRIVER CONTROL
            </h1>
            <p className="text-blue-300 text-xs font-medium">
              Monitoring System
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        <p className="text-blue-400 text-xs font-semibold uppercase tracking-widest px-3 mb-3">
          Menu
        </p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 group",
                active
                  ? "bg-white/15 text-white shadow-sm"
                  : "text-blue-100 hover:bg-white/10 hover:text-white"
              )}
            >
              <Icon
                className={cn(
                  "w-5 h-5 flex-shrink-0",
                  active ? "text-white" : "text-blue-300 group-hover:text-white"
                )}
              />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{item.label}</p>
                <p
                  className={cn(
                    "text-xs truncate",
                    active ? "text-blue-200" : "text-blue-400"
                  )}
                >
                  {item.description}
                </p>
              </div>
              {active && (
                <ChevronRight className="w-3.5 h-3.5 text-blue-200 flex-shrink-0" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-blue-700/30">
        <p className="text-blue-400 text-xs text-center">
          © 2025 Driver Control v1.0
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg"
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={cn(
          "lg:hidden fixed left-0 top-0 z-40 h-full w-64 transition-transform duration-300",
          "bg-gradient-to-b from-blue-900 to-blue-800",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <SidebarContent />
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-60 flex-shrink-0 h-full bg-gradient-to-b from-blue-900 to-blue-800">
        <SidebarContent />
      </aside>
    </>
  );
}
