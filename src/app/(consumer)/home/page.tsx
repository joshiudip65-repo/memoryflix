"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import HeroBanner from "@/components/consumer/HeroBanner";
import RailSlider from "@/components/consumer/RailSlider";
import StoryCard from "@/components/consumer/StoryCard";
import GooglePhotosSync from "@/components/consumer/GooglePhotosSync";
import { mockStories, getActiveRails, getActiveBanners } from "@/data/mock";
import { useMemoryStore } from "@/lib/memoryStore";
import { Memory, Rail } from "@/types";

interface HomeData {
  connected: boolean;
  memories: Memory[];
  rails: Rail[];
  banners: ReturnType<typeof getActiveBanners>;
  lastSync?: string;
  totalCount?: number;
  error?: string;
}

export default function HomePage() {
  const { memories: storeMemories } = useMemoryStore();
  const [homeData, setHomeData] = useState<HomeData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchHomeData = useCallback(() => {
    setLoading(true);
    fetch("/api/home")
      .then((r) => r.json())
      .then((data) => { setHomeData(data); setLoading(false); })
      .catch(() => { setHomeData({ connected: false, memories: [], rails: [], banners: [] }); setLoading(false); });
  }, []);

  useEffect(() => { fetchHomeData(); }, [fetchHomeData]);

  const handleSyncComplete = useCallback(() => { fetchHomeData(); }, [fetchHomeData]);

  const useMockData = !homeData?.connected || (homeData?.memories?.length ?? 0) === 0;

  const allMemories: Memory[] = useMockData
    ? storeMemories
    : [...(homeData?.memories ?? []), ...storeMemories];

  const memoryMap = new Map(allMemories.map((m) => [m.id, m]));

  const getRailMemories = (rail: Rail) =>
    (rail.memoryIds || []).map((id) => memoryMap.get(id)).filter(Boolean) as Memory[];

  const rails = useMockData ? getActiveRails() : (homeData?.rails ?? []);
  const banners = useMockData ? getActiveBanners() : (homeData?.banners as ReturnType<typeof getActiveBanners> ?? []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto" />
          <p className="text-white/60 text-sm">Loading your memories…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <HeroBanner banners={banners} />

      <div className="-mt-16 relative z-10 space-y-2">

        {/* Google Photos Connect Banner */}
        <AnimatePresence>
          {!homeData?.connected && (
            <motion.div
              initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="mx-6 md:mx-16 mb-4 rounded-2xl overflow-hidden"
              style={{ background: "linear-gradient(135deg, #1a73e8 0%, #0d47a1 100%)" }}
            >
              <div className="px-6 py-5 flex flex-col md:flex-row items-start md:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <circle cx="8"  cy="8"  r="5" fill="#fbbc04" />
                      <circle cx="16" cy="8"  r="5" fill="#ea4335" />
                      <circle cx="8"  cy="16" r="5" fill="#34a853" />
                      <circle cx="16" cy="16" r="5" fill="#4285f4" />
                    </svg>
                    <span className="text-white font-semibold text-base">Import from Google Photos</span>
                  </div>
                  <p className="text-white/80 text-sm">
                    Pull your real memories from Google Photos — AI will auto-categorise them into cinematic collections.
                  </p>
                </div>
                <GooglePhotosSync onSyncComplete={handleSyncComplete} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sync status bar */}
        {homeData?.connected && homeData?.lastSync && (
          <div className="px-6 md:px-16 mb-2 flex items-center gap-2 flex-wrap">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs text-white/40">
              {homeData.totalCount} photos · Last synced{" "}
              {new Date(homeData.lastSync).toLocaleDateString("en-AU", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
            </span>
            <GooglePhotosSync onSyncComplete={handleSyncComplete} compact />
          </div>
        )}

        {rails[0] && <RailSlider rail={rails[0]} memories={getRailMemories(rails[0])} variant="featured" />}

        {/* AI Stories Rail */}
        <motion.section initial={{ y: 20 }} animate={{ y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="py-4">
          <div className="px-6 md:px-16 mb-3">
            <h2 className="text-xl md:text-2xl font-bold text-white">AI-Generated Stories</h2>
            <p className="text-sm text-gray-500 mt-0.5">Cinematic recaps crafted by AI from your memories</p>
          </div>
          <div className="rail-scroll px-6 md:px-16 fade-right">
            {mockStories.map((story, i) => <StoryCard key={story.id} story={story} index={i} />)}
          </div>
        </motion.section>

        {rails.slice(1).map((rail, i) => (
          <RailSlider key={rail.id} rail={rail} memories={getRailMemories(rail)} variant={i % 3 === 0 ? "wide" : i % 3 === 1 ? "default" : "tall"} />
        ))}

        <div className="h-8" />
      </div>
    </div>
  );
}
