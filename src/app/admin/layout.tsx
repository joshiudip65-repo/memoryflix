"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard, Image, Tags, Home, Brain, Users,
  Shield, HardDrive, BarChart3, Bell, Sparkles,
  ChevronLeft, Menu, Settings, LogOut
} from "lucide-react";
import { ToastProvider } from "@/components/ui/Toast";

const sidebarItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/media", label: "Media", icon: Image },
  { href: "/admin/genres", label: "Genres", icon: Tags },
  { href: "/admin/homepage", label: "Homepage", icon: Home },
  { href: "/admin/ai", label: "AI Engine", icon: Brain },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/moderation", label: "Moderation", icon: Shield },
  { href: "/admin/storage", label: "Storage", icon: HardDrive },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/notifications", label: "Notifications", icon: Bell },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <ToastProvider>
    <div className="flex min-h-screen bg-[#0a0a0a]">
      {/* Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 72 : 260 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="fixed top-0 left-0 bottom-0 z-40 bg-[#111111] border-r border-white/5 flex flex-col"
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-4 py-5 border-b border-white/5">
          {!collapsed && (
            <Link href="/admin/dashboard" className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" style={{ color: "var(--mf-accent)" }} />
              <span className="text-base font-bold text-white">
                MF <span className="text-gray-500 font-normal">Admin</span>
              </span>
            </Link>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
          >
            {collapsed ? (
              <Menu className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-gray-400" />
            )}
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-white/10 text-white"
                    : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
                }`}
              >
                <Icon className={`w-4.5 h-4.5 flex-shrink-0 ${isActive ? "text-[var(--mf-accent)]" : ""}`} />
                {!collapsed && <span>{item.label}</span>}
                {isActive && !collapsed && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[var(--mf-accent)]" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="border-t border-white/5 p-3 space-y-1">
          <Link
            href="/home"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-500 hover:text-gray-300 hover:bg-white/5 transition-all"
          >
            <LogOut className="w-4 h-4" />
            {!collapsed && <span>Back to App</span>}
          </Link>
        </div>
      </motion.aside>

      {/* Main content */}
      <main
        className="flex-1 transition-all duration-300"
        style={{ marginLeft: collapsed ? 72 : 260 }}
      >
        <div className="p-6 md:p-8 max-w-[1600px]">{children}</div>
      </main>
    </div>
    </ToastProvider>
  );
}
