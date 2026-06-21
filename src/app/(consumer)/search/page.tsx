"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import SearchBar from "@/components/consumer/SearchBar";
import MemoryCard from "@/components/consumer/MemoryCard";
import { Memory } from "@/types";
import { useMemoryStore } from "@/lib/memoryStore";

export default function SearchPage() {
  const { memories: allMemories } = useMemoryStore();
  const [results, setResults] = useState<Memory[]>([]);
  const [searched, setSearched] = useState(false);

  const handleSearch = (query: string) => {
    if (!query.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }
    setSearched(true);
    const q = query.toLowerCase();
    const filtered = allMemories.filter(
      (m) => m.status !== "deleted"
    ).filter(
      (m) =>
        m.title.toLowerCase().includes(q) ||
        m.description?.toLowerCase().includes(q) ||
        m.aiTags.some((t) => t.toLowerCase().includes(q)) ||
        m.scenes.some((s) => s.toLowerCase().includes(q)) ||
        m.emotions.some((e) => e.emotion.toLowerCase().includes(q)) ||
        m.people.some((p) => p.name.toLowerCase().includes(q))
    );
    setResults(filtered);
  };

  return (
    <div className="min-h-screen pt-24 pb-8 px-6 md:px-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <h1 className="text-3xl font-bold text-white mb-6">Search Memories</h1>
        <SearchBar onSearch={handleSearch} autoFocus />
      </motion.div>

      {searched && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <p className="text-sm text-gray-500 mb-6">
            {results.length} {results.length === 1 ? "memory" : "memories"} found
          </p>
          <div className="flex flex-wrap gap-4">
            {results.map((memory, i) => (
              <MemoryCard key={memory.id} memory={memory} index={i} variant="wide" playlist={results} />
            ))}
          </div>
          {results.length === 0 && (
            <div className="text-center py-16">
              <p className="text-gray-500">No memories match your search.</p>
              <p className="text-sm text-gray-600 mt-1">Try emotional terms like &quot;calm&quot;, &quot;joy&quot;, or place names</p>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
