"use client";

import { use } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Heart, Calendar, Camera } from "lucide-react";
import Link from "next/link";
import MemoryCard from "@/components/consumer/MemoryCard";
import { getPersonById, getMemoriesByPerson } from "@/data/mock";
import { getEmotionColor } from "@/lib/utils";

export default function PersonDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const person = getPersonById(id);
  const memories = getMemoriesByPerson(id);

  if (!person) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24">
        <p className="text-gray-500">Person not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-8 px-6 md:px-16">
      {/* Back button */}
      <Link href="/people" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8">
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm">Back to People</span>
      </Link>

      {/* Person Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row items-start gap-8 mb-12"
      >
        {/* Avatar */}
        <div
          className="w-32 h-32 rounded-full bg-cover bg-center border-4"
          style={{
            backgroundImage: `url(${person.avatarUrl})`,
            borderColor: getEmotionColor(person.sharedEmotions[0] || "joy"),
          }}
        />

        <div className="flex-1">
          <h1 className="text-4xl font-bold text-white mb-1">{person.name}</h1>
          <p className="text-gray-400 capitalize mb-3">{person.relationshipType}</p>
          {person.bio && <p className="text-gray-300 text-lg mb-4">{person.bio}</p>}

          {/* Stats */}
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <Camera className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-400">{person.memoryCount} memories</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-red-400" />
              <span className="text-sm text-gray-400">Closeness: {person.emotionalCloseness}%</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-400">Since {new Date(person.firstMemoryDate).getFullYear()}</span>
            </div>
          </div>

          {/* Shared emotions */}
          <div className="flex flex-wrap gap-2 mt-4">
            {person.sharedEmotions.map((e) => (
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
        </div>
      </motion.div>

      {/* Shared Memories */}
      <h2 className="text-xl font-bold text-white mb-4">Shared Memories</h2>
      <div className="flex flex-wrap gap-4">
        {memories.map((memory, i) => (
          <MemoryCard key={memory.id} memory={memory} index={i} variant="wide" playlist={memories} />
        ))}
      </div>
    </div>
  );
}
