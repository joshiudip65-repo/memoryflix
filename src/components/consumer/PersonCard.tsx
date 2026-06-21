"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Heart } from "lucide-react";
import { Person } from "@/types";
import { getEmotionColor } from "@/lib/utils";

interface PersonCardProps {
  person: Person;
  index?: number;
}

export default function PersonCard({ person, index = 0 }: PersonCardProps) {
  return (
    <Link href={`/people/${person.id}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.08 }}
        whileHover={{ scale: 1.05, y: -5 }}
        className="flex flex-col items-center gap-3 cursor-pointer group"
      >
        {/* Avatar with emotion ring */}
        <div className="relative">
          <div
            className="w-20 h-20 md:w-24 md:h-24 rounded-full p-[3px]"
            style={{
              background: `linear-gradient(135deg, ${getEmotionColor(person.sharedEmotions[0] || "joy")}, ${getEmotionColor(person.sharedEmotions[1] || "love")})`,
            }}
          >
            <div
              className="w-full h-full rounded-full bg-cover bg-center border-2 border-[#0a0a0a]"
              style={{ backgroundImage: `url(${person.avatarUrl})` }}
            />
          </div>
          {/* Closeness indicator */}
          <div className="absolute -bottom-1 -right-1 flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-black/80 border border-white/10 text-[10px]">
            <Heart className="w-2.5 h-2.5 text-red-400" fill="currentColor" />
            <span className="text-white/80">{person.emotionalCloseness}</span>
          </div>
        </div>

        {/* Name */}
        <div className="text-center">
          <p className="text-sm font-semibold text-white group-hover:text-[var(--mf-accent)] transition-colors">
            {person.name}
          </p>
          <p className="text-xs text-gray-500 capitalize">{person.relationshipType}</p>
          <p className="text-[10px] text-gray-600 mt-0.5">{person.memoryCount} memories</p>
        </div>
      </motion.div>
    </Link>
  );
}
