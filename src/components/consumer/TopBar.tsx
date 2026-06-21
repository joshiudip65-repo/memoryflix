"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Bell, Settings, Sparkles, X } from "lucide-react";

const recentNotifications = [
  { id: "1", text: "A memory from 3 years ago is waiting for you", time: "2h ago" },
  { id: "2", text: "New AI story: \"Summer of 2023\" is ready", time: "5h ago" },
  { id: "3", text: "Family photo collection has been updated", time: "1d ago" },
];

export default function TopBar() {
  const [scrolled, setScrolled] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close notification panel on click outside
  useEffect(() => {
    if (!notifOpen) return;
    const close = () => setNotifOpen(false);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [notifOpen]);

  return (
    <motion.header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "glass-strong py-3"
          : "bg-gradient-to-b from-black/80 to-transparent py-4"
      }`}
    >
      <div className="flex items-center justify-between px-6 md:px-16 max-w-[1800px] mx-auto">
        {/* Logo */}
        <Link href="/home" className="flex items-center gap-2">
          <Sparkles className="w-6 h-6" style={{ color: "var(--mf-accent)" }} />
          <span className="text-xl font-bold tracking-tight text-white">
            Memory<span style={{ color: "var(--mf-accent)" }}>Flix</span>
          </span>
        </Link>

        {/* Right actions */}
        <div className="flex items-center gap-4">
          <Link
            href="/search"
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <Search className="w-5 h-5 text-gray-300" />
          </Link>

          {/* Notification bell with dropdown */}
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setNotifOpen((p) => !p)}
              className="p-2 rounded-full hover:bg-white/10 transition-colors relative cursor-pointer"
            >
              <Bell className="w-5 h-5 text-gray-300" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
            </button>

            <AnimatePresence>
              {notifOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 top-12 w-80 bg-[#1a1a1a] rounded-xl border border-white/10 shadow-2xl overflow-hidden z-50"
                >
                  <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
                    <h3 className="text-sm font-semibold text-white">Notifications</h3>
                    <button
                      onClick={() => setNotifOpen(false)}
                      className="p-1 rounded hover:bg-white/10 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5 text-gray-400" />
                    </button>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {recentNotifications.map((n) => (
                      <button
                        key={n.id}
                        onClick={() => setNotifOpen(false)}
                        className="w-full text-left px-4 py-3 hover:bg-white/5 transition border-b border-white/5 last:border-0 cursor-pointer"
                      >
                        <p className="text-sm text-white leading-snug">{n.text}</p>
                        <p className="text-xs text-gray-600 mt-1">{n.time}</p>
                      </button>
                    ))}
                  </div>
                  <Link
                    href="/explore"
                    onClick={() => setNotifOpen(false)}
                    className="block text-center py-3 text-xs text-[var(--mf-accent)] font-medium hover:bg-white/5 transition border-t border-white/5"
                  >
                    View All
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Link
            href="/admin/dashboard"
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <Settings className="w-5 h-5 text-gray-300" />
          </Link>
        </div>
      </div>
    </motion.header>
  );
}
