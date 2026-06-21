"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Rail, Memory } from "@/types";
import MemoryCard from "./MemoryCard";

interface RailSliderProps {
  rail: Rail;
  memories: Memory[];
  variant?: "default" | "wide" | "tall" | "featured";
}

export default function RailSlider({ rail, memories, variant = "default" }: RailSliderProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showAll, setShowAll] = useState(false);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const scrollAmount = direction === "left" ? -400 : 400;
    scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  if (memories.length === 0) return null;

  return (
    <>
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative py-4"
      >
        {/* Rail header */}
        <div className="flex items-end justify-between px-6 md:px-16 mb-3">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-white">{rail.title}</h2>
            {rail.subtitle && (
              <p className="text-sm text-gray-500 mt-0.5">{rail.subtitle}</p>
            )}
          </div>
          <button
            onClick={() => setShowAll(true)}
            className="text-sm font-medium text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            See All
          </button>
        </div>

        {/* Scroll container */}
        <div className="relative group/rail">
          {/* Left arrow */}
          <button
            onClick={() => scroll("left")}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover/rail:opacity-100 transition-opacity duration-300 hover:bg-black/80 border border-white/10 cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>

          {/* Memory cards */}
          <div
            ref={scrollRef}
            className="rail-scroll px-6 md:px-16 fade-right"
          >
            {memories.map((memory, i) => (
              <MemoryCard
                key={memory.id}
                memory={memory}
                variant={variant}
                index={i}
                playlist={memories}
              />
            ))}
          </div>

          {/* Right arrow */}
          <button
            onClick={() => scroll("right")}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover/rail:opacity-100 transition-opacity duration-300 hover:bg-black/80 border border-white/10 cursor-pointer"
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </button>
        </div>
      </motion.section>

      {/* See All Overlay */}
      <AnimatePresence>
        {showAll && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] bg-black/95 backdrop-blur-lg overflow-y-auto"
          >
            <div className="max-w-7xl mx-auto px-6 md:px-16 py-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-white">{rail.title}</h2>
                  {rail.subtitle && <p className="text-gray-500 mt-1">{rail.subtitle}</p>}
                  <p className="text-sm text-gray-600 mt-1">{memories.length} memories</p>
                </div>
                <button
                  onClick={() => setShowAll(false)}
                  className="p-3 rounded-full hover:bg-white/10 transition cursor-pointer"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>
              <div className="flex flex-wrap gap-4">
                {memories.map((memory, i) => (
                  <MemoryCard
                    key={memory.id}
                    memory={memory}
                    variant="wide"
                    index={i}
                    playlist={memories}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
