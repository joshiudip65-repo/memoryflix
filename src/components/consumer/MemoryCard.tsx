"use client";

import { motion } from "framer-motion";
import { Play, Heart, Star, Eye } from "lucide-react";
import { Memory } from "@/types";
import { getEmotionColor, formatDuration } from "@/lib/utils";
import { useMemoryViewer } from "./MemoryViewer";

interface MemoryCardProps {
  memory: Memory;
  variant?: "default" | "wide" | "tall" | "featured";
  index?: number;
  playlist?: Memory[];
}

export default function MemoryCard({ memory, variant = "default", index = 0, playlist }: MemoryCardProps) {
  const { openMemory } = useMemoryViewer();
  const primaryEmotion = memory.emotions[0];
  const isVideo = memory.mediaType === "video" || memory.mediaType === "clip";

  const sizeClasses = {
    default: "w-[200px] md:w-[240px] aspect-[3/4]",
    wide: "w-[300px] md:w-[360px] aspect-video",
    tall: "w-[180px] md:w-[220px] aspect-[2/3]",
    featured: "w-[280px] md:w-[340px] aspect-[4/5]",
  };

  const handleClick = () => {
    openMemory(memory, playlist);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      whileHover={{ scale: 1.05, zIndex: 10 }}
      onClick={handleClick}
      className={`relative group cursor-pointer rounded-xl overflow-hidden flex-shrink-0 ${sizeClasses[variant]}`}
    >
      {/* Thumbnail */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
        style={{ backgroundImage: `url(${memory.thumbnailUrl})` }}
      />

      {/* Gradient overlay - stronger on hover */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-70 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Top badges */}
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
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
          <motion.div
            whileHover={{ scale: 1.1 }}
            className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30"
          >
            <Play className="w-6 h-6 text-white ml-1" fill="white" />
          </motion.div>
        </div>
      )}

      {/* Bottom content */}
      <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
        {/* Emotion indicator */}
        {primaryEmotion && (
          <div className="flex items-center gap-1.5 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: getEmotionColor(primaryEmotion.emotion) }}
            />
            <span className="text-xs font-medium capitalize" style={{ color: getEmotionColor(primaryEmotion.emotion) }}>
              {primaryEmotion.emotion}
            </span>
          </div>
        )}

        {/* Title */}
        <h3 className="text-sm md:text-base font-semibold text-white leading-tight line-clamp-2">
          {memory.title}
        </h3>

        {/* Description on hover */}
        {memory.description && (
          <p className="text-xs text-gray-400 mt-1 line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {memory.description}
          </p>
        )}

        {/* People + stats */}
        <div className="flex items-center justify-between mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="flex items-center gap-1">
            {memory.people.slice(0, 3).map((p) => (
              <span key={p.personId} className="text-xs text-gray-400">
                {p.name}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-2">
            {memory.isFavorite && <Heart className="w-3.5 h-3.5 text-red-400" fill="currentColor" />}
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <Eye className="w-3 h-3" />
              {memory.viewCount}
            </span>
          </div>
        </div>
      </div>

      {/* Hover border glow */}
      <div
        className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-white/20 transition-all duration-300 pointer-events-none"
      />
    </motion.div>
  );
}
