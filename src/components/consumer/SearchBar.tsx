"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Sparkles } from "lucide-react";

const suggestedQueries = [
  "rainy night",
  "college chaos",
  "when we were happiest",
  "beach sunset",
  "funny car rides",
  "cooking with family",
  "mountain views",
  "late night talks",
];

interface SearchBarProps {
  onSearch?: (query: string) => void;
  autoFocus?: boolean;
}

export default function SearchBar({ onSearch, autoFocus = false }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(query);
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <div className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl transition-all duration-300 ${
          isFocused
            ? "bg-white/10 border border-white/20 shadow-lg"
            : "bg-white/5 border border-white/10"
        }`}>
          <Search className="w-5 h-5 text-gray-500 flex-shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            placeholder="Search your memories... try 'rainy night' or 'when we were happiest'"
            className="flex-1 bg-transparent text-white placeholder-gray-500 text-base outline-none"
            autoFocus={autoFocus}
          />
          {query && (
            <button type="button" onClick={() => setQuery("")} className="p-1 hover:bg-white/10 rounded-full">
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
          <div className="flex items-center gap-1 text-xs text-gray-600 border-l border-white/10 pl-3">
            <Sparkles className="w-3.5 h-3.5" />
            AI Search
          </div>
        </div>
      </form>

      {/* Suggested queries dropdown */}
      <AnimatePresence>
        {isFocused && !query && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 p-4 rounded-xl bg-[#1a1a1a] border border-white/10 shadow-xl z-50"
          >
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
              Try searching for...
            </p>
            <div className="flex flex-wrap gap-2">
              {suggestedQueries.map((sq) => (
                <button
                  key={sq}
                  onClick={() => {
                    setQuery(sq);
                    onSearch?.(sq);
                  }}
                  className="px-3 py-1.5 rounded-full text-sm bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white transition-colors border border-white/5"
                >
                  {sq}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
