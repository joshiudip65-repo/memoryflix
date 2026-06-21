"use client";

import { motion } from "framer-motion";
import { MoodCategory } from "@/types";

interface MoodItem {
  mood: MoodCategory;
  label: string;
  emoji: string;
  gradient: string;
  count: number;
}

const moods: MoodItem[] = [
  { mood: "cozy", label: "Cozy", emoji: "", gradient: "linear-gradient(135deg, #a78bfa, #6366f1)", count: 42 },
  { mood: "dreamy", label: "Dreamy", emoji: "", gradient: "linear-gradient(135deg, #818cf8, #c084fc)", count: 28 },
  { mood: "chaotic", label: "Chaotic", emoji: "", gradient: "linear-gradient(135deg, #f97316, #ef4444)", count: 35 },
  { mood: "calm", label: "Calm", emoji: "", gradient: "linear-gradient(135deg, #60a5fa, #34d399)", count: 51 },
  { mood: "romantic", label: "Romantic", emoji: "", gradient: "linear-gradient(135deg, #f472b6, #ec4899)", count: 19 },
  { mood: "wild", label: "Wild", emoji: "", gradient: "linear-gradient(135deg, #fbbf24, #f97316)", count: 24 },
  { mood: "nostalgic", label: "Nostalgic", emoji: "", gradient: "linear-gradient(135deg, #c084fc, #818cf8)", count: 67 },
  { mood: "energetic", label: "Energetic", emoji: "", gradient: "linear-gradient(135deg, #34d399, #22c55e)", count: 31 },
  { mood: "reflective", label: "Reflective", emoji: "", gradient: "linear-gradient(135deg, #60a5fa, #818cf8)", count: 38 },
  { mood: "festive", label: "Festive", emoji: "", gradient: "linear-gradient(135deg, #ef4444, #fbbf24)", count: 22 },
];

interface MoodGridProps {
  onMoodSelect?: (mood: MoodCategory) => void;
}

export default function MoodGrid({ onMoodSelect }: MoodGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
      {moods.map((item, i) => (
        <motion.button
          key={item.mood}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: i * 0.05 }}
          whileHover={{ scale: 1.08, y: -4 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onMoodSelect?.(item.mood)}
          className="relative group rounded-2xl overflow-hidden aspect-square flex flex-col items-center justify-center cursor-pointer"
          style={{ background: item.gradient }}
        >
          {/* Overlay for depth */}
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all" />

          {/* Content */}
          <div className="relative z-10 text-center">
            <span className="text-3xl mb-2 block">{item.emoji}</span>
            <span className="text-base font-bold text-white">{item.label}</span>
            <span className="text-xs text-white/60 block mt-1">{item.count} memories</span>
          </div>
        </motion.button>
      ))}
    </div>
  );
}
