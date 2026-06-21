"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Film, ArrowRight, Bookmark, Share2, Heart, Sparkles } from "lucide-react";
import { HeroBanner as HeroBannerType } from "@/types";

interface HeroBannerProps {
  banners: HeroBannerType[];
}

const iconMap: Record<string, React.ReactNode> = {
  play: <Play className="w-5 h-5" />,
  film: <Film className="w-5 h-5" />,
  "arrow-right": <ArrowRight className="w-5 h-5" />,
  bookmark: <Bookmark className="w-5 h-5" />,
  share: <Share2 className="w-5 h-5" />,
  heart: <Heart className="w-5 h-5" />,
  sparkles: <Sparkles className="w-5 h-5" />,
};

export default function HeroBanner({ banners }: HeroBannerProps) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [saved, setSaved] = useState(false);
  const banner = banners[currentIndex];

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [banners.length]);

  if (!banner) return null;

  const handleCTA = (action: string) => {
    switch (action) {
      case "relive":
      case "watch_story":
      case "play_trailer":
        // Navigate to journey or a detail view
        router.push("/journey");
        break;
      case "continue":
        router.push("/home");
        break;
      case "share":
        // Copy link placeholder
        if (navigator.clipboard) {
          navigator.clipboard.writeText(window.location.href);
        }
        break;
      case "save":
        setSaved((p) => !p);
        break;
      default:
        router.push("/explore");
        break;
    }
  };

  return (
    <div className="relative w-full h-[70vh] min-h-[500px] max-h-[800px] overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={banner.id}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 1.2, ease: [0.25, 0.1, 0.25, 1] }}
          className="absolute inset-0"
        >
          {/* Background Image */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${banner.mediaUrl})` }}
          />

          {/* Cinematic Gradient Overlay */}
          <div className="absolute inset-0" style={{ background: banner.gradient }} />

          {/* Vignette */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/30" />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16 z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={banner.id + "-content"}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            {/* Subtitle tag */}
            <motion.p
              className="text-sm md:text-base font-medium tracking-wider uppercase mb-3"
              style={{ color: "var(--mf-accent)" }}
            >
              {banner.subtitle}
            </motion.p>

            {/* Title */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-cinema mb-4 max-w-3xl leading-tight">
              {banner.title}
            </h1>

            {/* Description */}
            <p className="text-base md:text-lg text-gray-300 max-w-2xl mb-8 leading-relaxed">
              {banner.description}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-3">
              {banner.ctaButtons.map((btn, i) => (
                <motion.button
                  key={i}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleCTA(btn.action)}
                  className={`
                    flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm md:text-base transition-all cursor-pointer
                    ${btn.variant === "primary"
                      ? "bg-white text-black hover:bg-gray-200"
                      : btn.variant === "secondary"
                        ? "bg-white/15 text-white backdrop-blur-sm hover:bg-white/25 border border-white/20"
                        : "text-white/80 hover:text-white hover:bg-white/10"
                    }
                  `}
                >
                  {btn.icon && iconMap[btn.icon]}
                  {btn.label}
                </motion.button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Banner Indicators */}
      {banners.length > 1 && (
        <div className="absolute bottom-6 right-8 md:right-16 flex gap-2 z-10">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`h-1 rounded-full transition-all duration-500 cursor-pointer ${
                i === currentIndex
                  ? "w-8 bg-white"
                  : "w-4 bg-white/30 hover:bg-white/50"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
