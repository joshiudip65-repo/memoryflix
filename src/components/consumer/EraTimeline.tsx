"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Play, Star, Eye, Clock, MapPin, Calendar } from "lucide-react";
import { Era, Memory } from "@/types";
import { getEmotionColor, formatDuration } from "@/lib/utils";
import { useMemoryViewer } from "./MemoryViewer";
import { useMemoryStore } from "@/lib/memoryStore";

interface EraTimelineProps {
  eras: Era[];
}

export default function EraTimeline({ eras }: EraTimelineProps) {
  const [expandedEra, setExpandedEra] = useState<Era | null>(null);
  const { openMemory } = useMemoryViewer();
  const { memories: allMemories } = useMemoryStore();
  const activeMemories = allMemories.filter((m) => m.status !== "deleted");

  // Get memories that belong to an era by matching highlight IDs and date range
  const getEraMemories = (era: Era): Memory[] => {
    const highlightSet = new Set(era.highlights);
    // First get highlights, then fill with date-range matches
    const highlights = activeMemories.filter((m) => highlightSet.has(m.id));
    const dateMatches = activeMemories.filter(
      (m) =>
        !highlightSet.has(m.id) &&
        m.capturedAt >= era.startDate &&
        (!era.endDate || m.capturedAt <= era.endDate)
    );
    return [...highlights, ...dateMatches];
  };

  const handleEraClick = (era: Era) => {
    setExpandedEra(era);
  };

  return (
    <>
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent" />

        <div className="space-y-16">
          {eras.map((era, i) => {
            const isLeft = i % 2 === 0;
            return (
              <motion.div
                key={era.id}
                initial={{ opacity: 0, x: isLeft ? -30 : 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: i * 0.15 }}
                className={`relative flex items-center gap-8 ${
                  isLeft ? "md:flex-row" : "md:flex-row-reverse"
                } flex-row`}
              >
                {/* Timeline dot */}
                <div className="absolute left-8 md:left-1/2 -translate-x-1/2 z-10">
                  <div
                    className="w-4 h-4 rounded-full border-2 border-[#0a0a0a]"
                    style={{ backgroundColor: era.color }}
                  />
                  <div
                    className="absolute inset-0 w-4 h-4 rounded-full animate-ping opacity-20"
                    style={{ backgroundColor: era.color }}
                  />
                </div>

                {/* Era card */}
                <div className={`ml-16 md:ml-0 md:w-[45%] ${isLeft ? "md:mr-auto md:pr-12" : "md:ml-auto md:pl-12"}`}>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleEraClick(era)}
                    className="relative group cursor-pointer rounded-2xl overflow-hidden"
                  >
                    {/* Background image */}
                    <div
                      className="aspect-video bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                      style={{ backgroundImage: `url(${era.thumbnailUrl})` }}
                    />

                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

                    {/* Content */}
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      {/* Date range */}
                      <p className="text-xs font-medium uppercase tracking-wider mb-1" style={{ color: era.color }}>
                        {new Date(era.startDate).getFullYear()} — {era.endDate ? new Date(era.endDate).getFullYear() : "Present"}
                      </p>

                      <h3 className="text-2xl font-bold text-white mb-1">{era.name}</h3>
                      <p className="text-sm text-gray-400 mb-3">{era.description}</p>

                      {/* Stats */}
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>{era.memoryCount} memories</span>
                        <span className="flex items-center gap-1">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: getEmotionColor(era.dominantEmotion) }}
                          />
                          <span className="capitalize">{era.dominantEmotion}</span>
                        </span>
                        <span>{era.people.length} people</span>
                      </div>

                      {/* Tap hint on hover */}
                      <div className="mt-3 text-xs font-medium text-white/0 group-hover:text-white/60 transition-colors duration-300">
                        Tap to explore this era
                      </div>
                    </div>

                    {/* Hover border glow */}
                    <div
                      className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-white/15 transition-all"
                    />
                  </motion.div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Era Detail Overlay */}
      <AnimatePresence>
        {expandedEra && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] bg-black/95 backdrop-blur-lg overflow-y-auto"
          >
            {/* Era Hero */}
            <div className="relative h-[40vh] min-h-[300px]">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${expandedEra.thumbnailUrl})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-black/50 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/30" />

              {/* Close button */}
              <button
                onClick={() => setExpandedEra(null)}
                className="absolute top-6 right-6 z-20 p-3 rounded-full bg-black/40 backdrop-blur-sm hover:bg-black/60 transition cursor-pointer"
              >
                <X className="w-5 h-5 text-white" />
              </button>

              {/* Era info */}
              <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16">
                <p className="text-sm font-medium uppercase tracking-wider mb-2" style={{ color: expandedEra.color }}>
                  <Calendar className="w-3.5 h-3.5 inline mr-1.5" />
                  {new Date(expandedEra.startDate).getFullYear()} — {expandedEra.endDate ? new Date(expandedEra.endDate).getFullYear() : "Present"}
                </p>
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-2">{expandedEra.name}</h2>
                <p className="text-lg text-gray-400 max-w-2xl">{expandedEra.description}</p>

                <div className="flex items-center gap-6 mt-4 text-sm text-gray-500">
                  <span>{expandedEra.memoryCount} memories</span>
                  <span className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: getEmotionColor(expandedEra.dominantEmotion) }} />
                    <span className="capitalize">{expandedEra.dominantEmotion}</span>
                  </span>
                  <span>{expandedEra.people.length} people</span>
                </div>
              </div>
            </div>

            {/* Era Memories Grid */}
            <div className="max-w-7xl mx-auto px-6 md:px-16 py-8">
              <h3 className="text-xl font-bold text-white mb-6">Memories from this era</h3>
              {(() => {
                const eraMemories = getEraMemories(expandedEra);
                if (eraMemories.length === 0) {
                  return (
                    <div className="text-center py-16">
                      <p className="text-gray-500">No memories found for this era in demo data.</p>
                      <p className="text-sm text-gray-600 mt-2">In production, this will show all {expandedEra.memoryCount} memories.</p>
                    </div>
                  );
                }
                return (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {eraMemories.map((memory, idx) => {
                      const isVideo = memory.mediaType === "video" || memory.mediaType === "clip";
                      const primaryEmotion = memory.emotions[0];
                      return (
                        <motion.div
                          key={memory.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          whileHover={{ scale: 1.05, zIndex: 10 }}
                          onClick={() => openMemory(memory, eraMemories)}
                          className="relative group cursor-pointer rounded-xl overflow-hidden aspect-[3/4]"
                        >
                          <div
                            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                            style={{ backgroundImage: `url(${memory.thumbnailUrl})` }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-70 group-hover:opacity-100 transition-opacity" />

                          {/* Badges */}
                          <div className="absolute top-3 left-3 right-3 flex justify-between items-start z-10">
                            {memory.isCoreMomory && (
                              <span className="flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-400 backdrop-blur-sm">
                                <Star className="w-3 h-3" /> Core
                              </span>
                            )}
                            {isVideo && memory.duration && (
                              <span className="text-xs font-medium px-2 py-1 rounded-full bg-black/50 text-white/90 backdrop-blur-sm ml-auto">
                                {formatDuration(memory.duration)}
                              </span>
                            )}
                          </div>

                          {/* Play button for videos */}
                          {isVideo && (
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
                              <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                                <Play className="w-5 h-5 text-white ml-0.5" fill="white" />
                              </div>
                            </div>
                          )}

                          {/* Bottom content */}
                          <div className="absolute bottom-0 left-0 right-0 p-3 z-10">
                            {primaryEmotion && (
                              <div className="flex items-center gap-1.5 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getEmotionColor(primaryEmotion.emotion) }} />
                                <span className="text-xs capitalize" style={{ color: getEmotionColor(primaryEmotion.emotion) }}>{primaryEmotion.emotion}</span>
                              </div>
                            )}
                            <h4 className="text-sm font-semibold text-white leading-tight line-clamp-2">{memory.title}</h4>
                            <div className="flex items-center gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity text-xs text-gray-500">
                              <Eye className="w-3 h-3" />
                              {memory.viewCount}
                            </div>
                          </div>

                          <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-white/20 transition-all pointer-events-none" />
                        </motion.div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>

            {/* Keyboard hint */}
            <div className="text-center pb-8 text-xs text-white/30">Press Esc or click X to close</div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
