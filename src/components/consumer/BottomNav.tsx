"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Home, Clock, Users, Compass, Lock } from "lucide-react";

const navItems = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/journey", label: "Journey", icon: Clock },
  { href: "/people", label: "People", icon: Users },
  { href: "/explore", label: "Explore", icon: Compass },
  { href: "/vault", label: "Vault", icon: Lock },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-strong border-t border-white/5">
      <div className="max-w-lg mx-auto flex items-center justify-around py-2 px-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
          const Icon = item.icon;

          return (
            <Link key={item.href} href={item.href} className="relative flex flex-col items-center gap-0.5 py-1.5 px-3">
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-colors duration-300 ${
                    isActive ? "text-white" : "text-gray-500"
                  }`}
                />
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                    style={{ backgroundColor: "var(--mf-accent)" }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </div>
              <span
                className={`text-[10px] font-medium transition-colors duration-300 ${
                  isActive ? "text-white" : "text-gray-600"
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
