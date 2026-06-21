"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Play, Star, Eye, ArrowLeft } from "lucide-react";
import MoodGrid from "@/components/consumer/MoodGrid";
import SearchBar from "@/components/consumer/SearchBar";
import { mockGenres } from "@/data/mock";
import { Genre, Memory, MoodCategory } from "@/types";
import { getEmotionColor, formatDuration } from "@/lib/utils";
import { useMemoryViewer } from "@/components/consumer/MemoryViewer";
import { useMemoryStore } from "@/lib/memoryStore";

// Map mood categories to emotions for filtering
const moodToEmotions: Record<MoodCategory, string[]> = {
  cozy: ["warmth", "comfort", "love"],
  dreamy: ["wonder", "serenity", "nostalgia"],
  chaotic: ["excitement", "surprise", "adventure"],
  calm: ["serenity", "gratitude", "peace"],
  romantic: ["love", "warmth", "tenderness"],
  wild: ["excitement", "adventure", "thrill"],
  nostalgic: ["nostalgia", "warmth", "melancholy"],
  energetic: ["excitement", "joy", "pride"],
  reflective: ["gratitude", "nostalgia", "serenity"],
  festive: ["joy", "excitement", "love"],
};

export default function ExplorePage() {
  const [selectedMood, setSelectedMood] = useState<MoodCategory | null>(null);
  const [selectedGenre, setSelectedGenre] = useState<Genre | null>(null);
  const { openMemory } = useMemoryViewer();
  const { memories: allMemories } = useMemoryStore();
  const activeMemories = allMemories.filter((m) => m.status !== "deleted");

  const handleMoodSelect = (mood: MoodCategory) => {
    setSelectedMood(mood);
    setSelectedGenre(null);
  };

  const handleGenreClick = (genre: Genre) => {
    setSelectedGenre(genre);
    setSelectedMood(null);
  };

  const handleBack = () => {
    setSelectedMood(null);
    setSelectedGenre(null);
  };

  // Filter memories by mood
  const getMoodMemories = (mood: MoodCategory): Memory[] => {
    const targetEmotions = moodToEmotions[mood] || [];
    const filtered = activeMemories.filter((m) =>
      m.emotions.some((e) => targetEmotions.includes(e.emotion))
    );
    return filtered.length > 0 ? filtered : activeMemories;
  };

  // Filter memories by genre (using genre type matching or just return all for demo)
  const getGenreMemories = (genre: Genre): Memory[] => {
    // Try to match by tags or emotions related to genre name
    const genreName = genre.name.toLowerCase();
    const filtered = activeMemories.filter((m) =>
      m.aiTags.some((t: string) => genreName.includes(t.toLowerCase())) ||
      m.genreIds.includes(genre.id) ||
      m.emotions.some((e) => genreName.includes(e.emotion.toLowerCase()))
    );
    return filtered.length > 0 ? filtered : activeMemories;
  };

  // If a mood or genre is selected, show the filtered view
  if (selectedMood || selectedGenre) {
    const memories = selectedMood
      ? getMoodMemories(selectedMood)
      : getGenreMemories(selectedGenre!);
    const title = selectedMood
      ? `${selectedMood.charAt(0).toUpperCase() + selectedMood.slice(1)} Memories`
      : selectedGenre!.name;
    const subtitle = selectedMood
      ? `Memories that match your ${selectedMood} mood`
      : `${selectedGenre!.memoryCount} memories in this collection`;
    const accentColor = selectedMood
      ? undefined
      : selectedGenre!.color;

    return (
      <div className="min-h-screen pt-24 pb-8 px-6 md:px-16">
        {/* Back button and header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to Explore</span>
          </button>

          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2" style={accentColor ? { color: accentColor } : undefined}>
            {title}
          </h1>
          <p className="text-lg text-gray-500">{subtitle}</p>
          <p className="text-sm text-gray-600 mt-1">{memories.length} memories found</p>
        </motion.div>

        {/* Memory Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {memories.map((memory, idx) => {
            const isVideo = memory.mediaType === "video" || memory.mediaType === "clip";
            const primaryEmotion = memory.emotions[0];
            return (
              <motion.div
                key={memory.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                whileHover={{ scale: 1.05, zIndex: 10 }}
                onClick={() => openMemory(memory, memories)}
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

                {/* Play */}
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
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-8 px-6 md:px-16">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-10"
      >
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">Explore</h1>
        <p className="text-lg text-gray-500 max-w-2xl mb-8">
          Discover memories by mood, emotion, or just let yourself wander.
        </p>
        <SearchBar />
      </motion.div>

      {/* Mood Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="mb-14"
      >
        <h2 className="text-xl font-bold text-white mb-6">How Are You Feeling?</h2>
        <MoodGrid onMoodSelect={handleMoodSelect} />
      </motion.section>

      {/* Genre Grid */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <h2 className="text-xl font-bold text-white mb-6">Memory Collections</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {mockGenres.map((genre, i) => (
            <motion.div
              key={genre.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: i * 0.04 }}
              whileHover={{ scale: 1.03, y: -3 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleGenreClick(genre)}
              className="relative group cursor-pointer rounded-xl overflow-hidden aspect-[4/3]"
            >
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                style={{ backgroundImage: `url(${genre.thumbnailUrl})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
              <div
                className="absolute inset-0 opacity-20"
                style={{ backgroundColor: genre.color }}
              />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="text-base font-bold text-white">{genre.name}</h3>
                <p className="text-xs text-gray-400 mt-0.5">{genre.memoryCount} memories</p>
                <div className="flex items-center gap-1.5 mt-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: genre.color }}
                  />
                  <span className="text-[10px] capitalize text-gray-500">{genre.type}</span>
                </div>
              </div>

              {/* Hover border */}
              <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-white/15 transition-all pointer-events-none" />
            </motion.div>
          ))}
        </div>
      </motion.section>
    </div>
  );
}
