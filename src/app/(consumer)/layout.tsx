"use client";

import TopBar from "@/components/consumer/TopBar";
import BottomNav from "@/components/consumer/BottomNav";
import { MemoryViewerProvider } from "@/components/consumer/MemoryViewer";

export default function ConsumerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MemoryViewerProvider>
      <div className="min-h-screen bg-[#0a0a0a]">
        <TopBar />
        <main className="pb-24">{children}</main>
        <BottomNav />
      </div>
    </MemoryViewerProvider>
  );
}
