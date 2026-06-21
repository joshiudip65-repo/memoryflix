"use client";

import { motion } from "framer-motion";
import PersonCard from "@/components/consumer/PersonCard";
import { mockPeople, getMostConnectedPeople } from "@/data/mock";

export default function PeoplePage() {
  const sortedPeople = getMostConnectedPeople();
  const familyPeople = mockPeople.filter((p) => p.relationshipType === "family");
  const friendPeople = mockPeople.filter((p) => p.relationshipType === "friend");

  return (
    <div className="min-h-screen pt-24 pb-8 px-6 md:px-16">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-12"
      >
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">Your People</h1>
        <p className="text-lg text-gray-500 max-w-2xl">
          The faces behind your most treasured memories. Sorted by emotional closeness.
        </p>
      </motion.div>

      {/* Most Connected */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="mb-12"
      >
        <h2 className="text-xl font-bold text-white mb-6">Most Connected</h2>
        <div className="flex flex-wrap gap-8">
          {sortedPeople.map((person, i) => (
            <PersonCard key={person.id} person={person} index={i} />
          ))}
        </div>
      </motion.section>

      {/* Family */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mb-12"
      >
        <h2 className="text-xl font-bold text-white mb-6">Family</h2>
        <div className="flex flex-wrap gap-8">
          {familyPeople.map((person, i) => (
            <PersonCard key={person.id} person={person} index={i} />
          ))}
        </div>
      </motion.section>

      {/* Friends */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="mb-12"
      >
        <h2 className="text-xl font-bold text-white mb-6">Friends</h2>
        <div className="flex flex-wrap gap-8">
          {friendPeople.map((person, i) => (
            <PersonCard key={person.id} person={person} index={i} />
          ))}
        </div>
      </motion.section>
    </div>
  );
}
