"use client";

import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Heart, Share2, Play, Pause, Eye, Calendar, MapPin,
  Tag, Users, Sparkles, Star, ChevronLeft, ChevronRight,
  Download, Bookmark, Volume2, VolumeX
} from "lucide-react";
import { Memory } from "@/types";
import { getEmotionColor, formatDuration } from "@/lib/utils";

// === CONTEXT — global memory viewer state ===
interface MemoryViewerContextType {
  openMemory: (memory: Memory, playlist?: Memory[]) => void;
  closeMemory: () => void;
}

const MemoryViewerContext = createContext<MemoryViewerContextType>({
  openMemory: () => {},
  closeMemory: () => {},
});

export function useMemoryViewer() {
  return useContext(MemoryViewerContext);
}

// === PROVIDER ===
export function MemoryViewerProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [memory, setMemory] = useState<Memory | null>(null);
  const [playlist, setPlaylist] = useState<Memory[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showInfo, setShowInfo] = useState(true);

  const openMemory = useCallback((mem: Memory, list?: Memory[]) => {
    setMemory(mem);
    setIsFavorite(mem.isFavorite);
    setIsSaved(false);
    setShowInfo(true);
    if (list && list.length > 0) {
      setPlaylist(list);
      const idx = list.findIndex((m) => m.id === mem.id);
      setCurrentIndex(idx >= 0 ? idx : 0);
    } else {
      setPlaylist([mem]);
      setCurrentIndex(0);
    }
    setIsOpen(true);
  }, []);

  const closeMemory = useCallback(() => {
    setIsOpen(false);
    setTimeout(() => {
      setMemory(null);
      setPlaylist([]);
    }, 300);
  }, []);

  const goNext = useCallback(() => {
    if (currentIndex < playlist.length - 1) {
      const next = currentIndex + 1;
      setCurrentIndex(next);
      setMemory(playlist[next]);
      setIsFavorite(playlist[next].isFavorite);
    }
  }, [currentIndex, playlist]);

  const goPrev = useCallback(() => {
    if (currentIndex > 0) {
      const prev = currentIndex - 1;
      setCurrentIndex(prev);
      setMemory(playlist[prev]);
      setIsFavorite(playlist[prev].isFavorite);
    }
  }, [currentIndex, playlist]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape": closeMemory(); break;
        case "ArrowRight": goNext(); break;
        case "ArrowLeft": goPrev(); break;
        case "i": setShowInfo((p) => !p); break;
      }
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, closeMemory, goNext, goPrev]);

  const primaryEmotion = memory?.emotions[0];
  const isVideo = memory?.mediaType === "video" || memory?.mediaType === "clip";

  return (
    <MemoryViewerContext.Provider value={{ openMemory, closeMemory }}>
      {children}

      <AnimatePresence>
        {isOpen && memory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[200] flex items-center justify-center"
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/95 backdrop-blur-xl"
              onClick={closeMemory}
            />

            {/* Navigation arrows */}
            {playlist.length > 1 && (
              <>
                {currentIndex > 0 && (
                  <button
                    onClick={goPrev}
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition border border-white/10 cursor-pointer"
                  >
                    <ChevronLeft className="w-6 h-6 text-white" />
                  </button>
                )}
                {currentIndex < playlist.length - 1 && (
                  <button
                    onClick={goNext}
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition border border-white/10 cursor-pointer"
                  >
                    <ChevronRight className="w-6 h-6 text-white" />
                  </button>
                )}
              </>
            )}

            {/* Top bar */}
            <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-6 py-4">
              {/* Counter */}
              {playlist.length > 1 && (
                <span className="text-sm text-white/60 font-medium">
                  {currentIndex + 1} / {playlist.length}
                </span>
              )}
              <div className="flex-1" />

              {/* Action buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsFavorite((p) => !p)}
                  className="p-2.5 rounded-full hover:bg-white/10 transition cursor-pointer"
                  title="Favorite"
                >
                  <Heart
                    className={`w-5 h-5 transition ${isFavorite ? "text-red-400" : "text-white/70"}`}
                    fill={isFavorite ? "currentColor" : "none"}
                  />
                </button>
                <button
                  onClick={() => setIsSaved((p) => !p)}
                  className="p-2.5 rounded-full hover:bg-white/10 transition cursor-pointer"
                  title="Save"
                >
                  <Bookmark
                    className={`w-5 h-5 transition ${isSaved ? "text-[var(--mf-accent)]" : "text-white/70"}`}
                    fill={isSaved ? "currentColor" : "none"}
                  />
                </button>
                <button
                  onClick={() => setShowInfo((p) => !p)}
                  className="p-2.5 rounded-full hover:bg-white/10 transition cursor-pointer"
                  title="Toggle info (i)"
                >
                  <Sparkles className={`w-5 h-5 ${showInfo ? "text-[var(--mf-accent)]" : "text-white/70"}`} />
                </button>
                <button
                  onClick={closeMemory}
                  className="p-2.5 rounded-full hover:bg-white/10 transition cursor-pointer"
                  title="Close (Esc)"
                >
                  <X className="w-5 h-5 text-white/70" />
                </button>
              </div>
            </div>

            {/* Main content area */}
            <div className="relative z-20 flex items-center justify-center w-full h-full px-20 py-20">
              <AnimatePresence mode="wait">
                <motion.div
                  key={memory.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="relative max-w-5xl w-full max-h-[80vh] flex rounded-2xl overflow-hidden shadow-2xl"
                >
                  {/* Image / Video */}
                  <div className="relative flex-1 min-h-[400px] bg-black">
                    <div
                      className="absolute inset-0 bg-cover bg-center"
                      style={{ backgroundImage: `url(${memory.mediaUrl || memory.thumbnailUrl})` }}
                    />

                    {/* Video play overlay */}
                    {isVideo && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 cursor-pointer"
                        >
                          <Play className="w-8 h-8 text-white ml-1" fill="white" />
                        </motion.button>
                      </div>
                    )}

                    {/* Duration badge */}
                    {isVideo && memory.duration && (
                      <div className="absolute bottom-4 right-4 px-3 py-1 rounded-lg bg-black/60 backdrop-blur-sm text-sm text-white/80">
                        {formatDuration(memory.duration)}
                      </div>
                    )}

                    {/* Core memory badge */}
                    {memory.isCoreMomory && (
                      <div className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-yellow-500/20 backdrop-blur-sm text-yellow-400 text-sm font-medium">
                        <Star className="w-4 h-4" /> Core Memory
                      </div>
                    )}
                  </div>

                  {/* Info panel */}
                  <AnimatePresence>
                    {showInfo && (
                      <motion.div
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: 360, opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="bg-[#111] border-l border-white/5 overflow-y-auto overflow-x-hidden"
                      >
                        <div className="p-6 w-[360px]">
                          {/* Title */}
                          <h2 className="text-2xl font-bold text-white mb-2">{memory.title}</h2>
                          {memory.description && (
                            <p className="text-sm text-gray-400 mb-5 leading-relaxed">{memory.description}</p>
                          )}

                          {/* Emotions */}
                          <div className="mb-5">
                            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Emotions</p>
                            <div className="flex flex-wrap gap-2">
                              {memory.emotions.map((e) => (
                                <span
                                  key={e.emotion}
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium capitalize"
                                  style={{
                                    backgroundColor: `${getEmotionColor(e.emotion)}20`,
                                    color: getEmotionColor(e.emotion),
                                  }}
                                >
                                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getEmotionColor(e.emotion) }} />
                                  {e.emotion} ({(e.confidence * 100).toFixed(0)}%)
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Scores */}
                          <div className="grid grid-cols-2 gap-3 mb-5">
                            <div className="bg-white/5 rounded-lg p-3 text-center">
                              <p className="text-xl font-bold text-white">{memory.emotionalScore}</p>
                              <p className="text-[10px] text-gray-500">Emotional Score</p>
                            </div>
                            <div className="bg-white/5 rounded-lg p-3 text-center">
                              <p className="text-xl font-bold text-white">{memory.nostalgiaScore}</p>
                              <p className="text-[10px] text-gray-500">Nostalgia Score</p>
                            </div>
                          </div>

                          {/* People */}
                          {memory.people.length > 0 && (
                            <div className="mb-5">
                              <p className="text-xs text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                                <Users className="w-3 h-3" /> People
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {memory.people.map((p) => (
                                  <span key={p.personId} className="px-3 py-1.5 rounded-full bg-white/5 text-sm text-white border border-white/10">
                                    {p.name}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Tags */}
                          <div className="mb-5">
                            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                              <Tag className="w-3 h-3" /> Tags
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {memory.aiTags.map((t) => (
                                <span key={t} className="px-2.5 py-1 rounded-full bg-white/5 text-xs text-gray-300">
                                  {t}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Meta info */}
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2 text-gray-400">
                              <Calendar className="w-3.5 h-3.5 text-gray-500" />
                              {new Date(memory.capturedAt).toLocaleDateString("en-US", {
                                weekday: "long", year: "numeric", month: "long", day: "numeric"
                              })}
                            </div>
                            {memory.location?.city && (
                              <div className="flex items-center gap-2 text-gray-400">
                                <MapPin className="w-3.5 h-3.5 text-gray-500" />
                                {memory.location.city}{memory.location.country ? `, ${memory.location.country}` : ""}
                              </div>
                            )}
                            <div className="flex items-center gap-2 text-gray-400">
                              <Eye className="w-3.5 h-3.5 text-gray-500" />
                              {memory.viewCount} views
                            </div>
                            <div className="flex items-center gap-2 text-gray-400">
                              <Sparkles className="w-3.5 h-3.5 text-gray-500" />
                              AI Confidence: {(memory.aiConfidence * 100).toFixed(0)}%
                            </div>
                          </div>

                          {/* Action buttons at bottom */}
                          <div className="flex gap-2 mt-6 pt-4 border-t border-white/5">
                            <button
                              onClick={() => setIsFavorite((p) => !p)}
                              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition cursor-pointer ${
                                isFavorite
                                  ? "bg-red-500/10 text-red-400"
                                  : "bg-white/5 text-gray-300 hover:bg-white/10"
                              }`}
                            >
                              <Heart className="w-4 h-4" fill={isFavorite ? "currentColor" : "none"} />
                              {isFavorite ? "Favorited" : "Favorite"}
                            </button>
                            <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 text-gray-300 hover:bg-white/10 text-sm font-medium transition cursor-pointer">
                              <Share2 className="w-4 h-4" />
                              Share
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Keyboard hints */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-4 text-xs text-white/30">
              {playlist.length > 1 && <span>← → Navigate</span>}
              <span>i Toggle Info</span>
              <span>Esc Close</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </MemoryViewerContext.Provider>
  );
}
