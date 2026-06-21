"use client";

import { motion } from "framer-motion";
import EraTimeline from "@/components/consumer/EraTimeline";
import { mockEras } from "@/data/mock";

export default function JourneyPage() {
  return (
    <div className="min-h-screen pt-24 pb-8">
      {/* Header */}
      <div className="px-6 md:px-16 mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">Your Journey</h1>
          <p className="text-lg text-gray-500 max-w-2xl">
            A cinematic timeline of the eras that shaped your life. Each chapter tells a story.
          </p>
        </motion.div>

        {/* Era summary stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex gap-8 mt-8"
        >
          <div>
            <p className="text-3xl font-bold text-white">{mockEras.length}</p>
            <p className="text-sm text-gray-500">Life Eras</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-white">
              {mockEras.reduce((sum, e) => sum + e.memoryCount, 0)}
            </p>
            <p className="text-sm text-gray-500">Total Memories</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-white">
              {new Date(mockEras[0]?.startDate || "").getFullYear()}
            </p>
            <p className="text-sm text-gray-500">First Memory</p>
          </div>
        </motion.div>
      </div>

      {/* Timeline */}
      <div className="px-6 md:px-16">
        <EraTimeline eras={mockEras} />
      </div>
    </div>
  );
}
