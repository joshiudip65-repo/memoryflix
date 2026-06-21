"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Clock, Sparkles, X, Heart, Share2, Pause } from "lucide-react";
import { Story } from "@/types";
import { formatDuration, getEmotionColor } from "@/lib/utils";

interface StoryCardProps {
  story: Story;
  index?: number;
}

export default function StoryCard({ story, index = 0 }: StoryCardProps) {
  const [viewerOpen, setViewerOpen] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.08 }}
        whileHover={{ scale: 1.03 }}
        onClick={() => setViewerOpen(true)}
        className="relative w-[280px] md:w-[320px] flex-shrink-0 group cursor-pointer"
      >
        {/* Thumbnail */}
        <div className="relative aspect-video rounded-xl overflow-hidden mb-3">
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
            style={{ backgroundImage: `url(${story.thumbnailUrl})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          {/* Play button */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30"
            >
              <Play className="w-6 h-6 text-white ml-1" fill="white" />
            </motion.div>
          </div>

          {/* Duration badge */}
          <div className="absolute bottom-2 right-2 flex items-center gap-1 px-2 py-1 rounded-md bg-black/60 backdrop-blur-sm text-xs text-white/80">
            <Clock className="w-3 h-3" />
            {formatDuration(story.duration)}
          </div>

          {/* AI badge */}
          {story.aiGenerated && (
            <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 rounded-md bg-black/60 backdrop-blur-sm text-xs" style={{ color: "var(--mf-accent)" }}>
              <Sparkles className="w-3 h-3" />
              AI Generated
            </div>
          )}
        </div>

        {/* Info */}
        <h3 className="text-base font-semibold text-white group-hover:text-[var(--mf-accent)] transition-colors">
          {story.title}
        </h3>
        <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">{story.description}</p>

        {/* Emotion dots */}
        <div className="flex items-center gap-1.5 mt-2">
          {story.emotions.slice(0, 4).map((e) => (
            <div
              key={e}
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: getEmotionColor(e) }}
              title={e}
            />
          ))}
          {story.music && (
            <span className="text-xs text-gray-600 ml-2">{story.music}</span>
          )}
        </div>
      </motion.div>

      {/* Story Viewer Modal */}
      <AnimatePresence>
        {viewerOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center"
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/95 backdrop-blur-xl" onClick={() => setViewerOpen(false)} />

            {/* Top controls */}
            <div className="absolute top-4 right-4 z-30 flex items-center gap-2">
              <button
                onClick={(e) => { e.stopPropagation(); setIsLiked((p) => !p); }}
                className="p-2.5 rounded-full hover:bg-white/10 transition cursor-pointer"
              >
                <Heart className={`w-5 h-5 ${isLiked ? "text-red-400" : "text-white/70"}`} fill={isLiked ? "currentColor" : "none"} />
              </button>
              <button className="p-2.5 rounded-full hover:bg-white/10 transition cursor-pointer">
                <Share2 className="w-5 h-5 text-white/70" />
              </button>
              <button
                onClick={() => setViewerOpen(false)}
                className="p-2.5 rounded-full hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-5 h-5 text-white/70" />
              </button>
            </div>

            {/* Story content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative z-20 max-w-4xl w-full mx-4"
            >
              {/* Video area */}
              <div className="relative aspect-video rounded-2xl overflow-hidden mb-6">
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${story.thumbnailUrl})` }}
                />
                <div className="absolute inset-0 bg-black/30" />

                {/* Play/Pause button */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => { e.stopPropagation(); setIsPlaying((p) => !p); }}
                    className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 cursor-pointer"
                  >
                    {isPlaying ? (
                      <Pause className="w-8 h-8 text-white" fill="white" />
                    ) : (
                      <Play className="w-8 h-8 text-white ml-1" fill="white" />
                    )}
                  </motion.button>
                </div>

                {/* Duration */}
                <div className="absolute bottom-4 right-4 px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-sm text-sm text-white/80 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  {formatDuration(story.duration)}
                </div>

                {/* AI badge */}
                {story.aiGenerated && (
                  <div className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-sm text-sm" style={{ color: "var(--mf-accent)" }}>
                    <Sparkles className="w-4 h-4" />
                    AI-Generated Story
                  </div>
                )}
              </div>

              {/* Story info */}
              <div className="text-center">
                <h2 className="text-3xl font-bold text-white mb-2">{story.title}</h2>
                <p className="text-gray-400 text-base mb-4 max-w-2xl mx-auto">{story.description}</p>

                {/* Emotions */}
                <div className="flex items-center justify-center gap-3 mb-3">
                  {story.emotions.map((e) => (
                    <span
                      key={e}
                      className="px-3 py-1 rounded-full text-xs font-medium capitalize"
                      style={{
                        backgroundColor: `${getEmotionColor(e)}20`,
                        color: getEmotionColor(e),
                      }}
                    >
                      {e}
                    </span>
                  ))}
                </div>

                {story.music && (
                  <p className="text-sm text-gray-500">Music: {story.music}</p>
                )}
              </div>
            </motion.div>

            {/* Keyboard hint */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 text-xs text-white/30">
              Press Esc to close
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
