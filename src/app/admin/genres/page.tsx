"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Plus, Search, Edit3, Trash2, Eye, EyeOff,
  Star, MoreVertical, Save, X
} from "lucide-react";
import { mockGenres } from "@/data/mock";
import { Genre } from "@/types";
import Modal from "@/components/ui/Modal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";

const GENRE_TYPES = ["emotional", "time", "seasonal", "relationship", "travel", "ai_discovery"] as const;
const GENRE_COLORS = ["#fbbf24", "#f472b6", "#60a5fa", "#c084fc", "#34d399", "#f97316", "#ef4444", "#22c55e"];

export default function AdminGenresPage() {
  const { toast } = useToast();
  const [genres, setGenres] = useState<Genre[]>(mockGenres);
  const [searchQuery, setSearchQuery] = useState("");

  const typeFilters = ["all", "emotional", "time", "seasonal", "relationship", "travel", "ai_discovery"];
  const [activeFilter, setActiveFilter] = useState("all");

  // Create/Edit modal
  const [formOpen, setFormOpen] = useState(false);
  const [editingGenre, setEditingGenre] = useState<Genre | null>(null);
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formType, setFormType] = useState<string>("emotional");
  const [formColor, setFormColor] = useState("#fbbf24");
  const [formPriority, setFormPriority] = useState(50);

  // Delete confirm
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Context menu
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  const filtered = genres.filter((g) => {
    if (activeFilter !== "all" && g.type !== activeFilter) return false;
    if (searchQuery) return g.name.toLowerCase().includes(searchQuery.toLowerCase());
    return true;
  });

  const openCreate = () => {
    setEditingGenre(null);
    setFormName("");
    setFormDescription("");
    setFormType("emotional");
    setFormColor("#fbbf24");
    setFormPriority(50);
    setFormOpen(true);
  };

  const openEdit = (genre: Genre) => {
    setEditingGenre(genre);
    setFormName(genre.name);
    setFormDescription(genre.description);
    setFormType(genre.type);
    setFormColor(genre.color);
    setFormPriority(genre.rankingPriority);
    setFormOpen(true);
    setMenuOpenId(null);
  };

  const handleSave = () => {
    if (!formName.trim()) {
      toast("error", "Name required", "Genre name cannot be empty.");
      return;
    }

    if (editingGenre) {
      setGenres((prev) =>
        prev.map((g) =>
          g.id === editingGenre.id
            ? {
                ...g,
                name: formName,
                slug: formName.toLowerCase().replace(/\s+/g, "-"),
                description: formDescription,
                type: formType as Genre["type"],
                color: formColor,
                rankingPriority: formPriority,
              }
            : g
        )
      );
      toast("success", "Genre Updated", `"${formName}" has been updated.`);
    } else {
      const newGenre: Genre = {
        id: `genre-${Date.now()}`,
        name: formName,
        slug: formName.toLowerCase().replace(/\s+/g, "-"),
        description: formDescription,
        type: formType as Genre["type"],
        color: formColor,
        thumbnailUrl: `https://picsum.photos/seed/${Date.now()}/800/400`,
        memoryCount: 0,
        isVisible: true,
        rankingPriority: formPriority,
        icon: "sparkles",
        createdAt: new Date().toISOString(),
      };
      setGenres((prev) => [newGenre, ...prev]);
      toast("success", "Genre Created", `"${formName}" has been added.`);
    }
    setFormOpen(false);
  };

  const handleDelete = () => {
    if (!deleteTargetId) return;
    const genre = genres.find((g) => g.id === deleteTargetId);
    setGenres((prev) => prev.filter((g) => g.id !== deleteTargetId));
    setDeleteTargetId(null);
    toast("success", "Genre Deleted", `"${genre?.name}" has been removed.`);
  };

  const toggleVisibility = (id: string) => {
    setGenres((prev) =>
      prev.map((g) => (g.id === id ? { ...g, isVisible: !g.isVisible } : g))
    );
    const genre = genres.find((g) => g.id === id);
    toast("success", genre?.isVisible ? "Genre Hidden" : "Genre Visible", `"${genre?.name}" visibility toggled.`);
    setMenuOpenId(null);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Genre Management</h1>
          <p className="text-gray-500 mt-1">Create and manage emotional memory categories</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--mf-accent)] text-black font-semibold text-sm hover:brightness-110 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          New Genre
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex items-center gap-2 flex-1 min-w-[200px] px-3 py-2 rounded-lg bg-[#141414] border border-white/5">
          <Search className="w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search genres..."
            className="bg-transparent text-white text-sm outline-none flex-1 placeholder-gray-600"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="p-0.5 hover:bg-white/10 rounded cursor-pointer">
              <X className="w-3 h-3 text-gray-400" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-1 bg-[#141414] rounded-lg p-1 border border-white/5">
          {typeFilters.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition cursor-pointer ${
                activeFilter === f ? "bg-white/10 text-white" : "text-gray-500 hover:text-gray-300"
              }`}
            >
              {f === "ai_discovery" ? "AI" : f}
            </button>
          ))}
        </div>
      </div>

      {/* Genres Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((genre, i) => (
          <motion.div
            key={genre.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="bg-[#141414] rounded-xl border border-white/5 overflow-hidden group hover:border-white/10 transition-all"
          >
            {/* Thumbnail */}
            <div className="relative h-32">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${genre.thumbnailUrl})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-black/40 to-transparent" />
              <div
                className="absolute inset-0 opacity-20"
                style={{ backgroundColor: genre.color }}
              />

              {/* Badges */}
              <div className="absolute top-3 right-3 flex items-center gap-2">
                {genre.homepagePlacement && (
                  <span className="px-2 py-0.5 rounded-full bg-[var(--mf-accent)]/20 text-[var(--mf-accent)] text-[10px] font-medium">
                    Homepage #{genre.homepagePlacement}
                  </span>
                )}
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                  genre.isVisible ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400"
                }`}>
                  {genre.isVisible ? "Visible" : "Hidden"}
                </span>
              </div>

              {/* Priority */}
              <div className="absolute top-3 left-3">
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-sm text-[10px] text-white/70">
                  <Star className="w-2.5 h-2.5" /> Priority: {genre.rankingPriority}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-base font-semibold text-white flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: genre.color }} />
                    {genre.name}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">/{genre.slug} &middot; {genre.type}</p>
                </div>
                <div className="relative">
                  <button
                    onClick={() => setMenuOpenId(menuOpenId === genre.id ? null : genre.id)}
                    className="p-1 rounded hover:bg-white/10 transition opacity-0 group-hover:opacity-100 cursor-pointer"
                  >
                    <MoreVertical className="w-4 h-4 text-gray-500" />
                  </button>
                  {menuOpenId === genre.id && (
                    <div className="absolute right-0 top-8 z-50 w-40 bg-[#222] border border-white/10 rounded-lg shadow-xl py-1">
                      <button onClick={() => openEdit(genre)} className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-white/10 flex items-center gap-2 cursor-pointer">
                        <Edit3 className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button onClick={() => toggleVisibility(genre.id)} className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-white/10 flex items-center gap-2 cursor-pointer">
                        {genre.isVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        {genre.isVisible ? "Hide" : "Show"}
                      </button>
                      <button onClick={() => { setDeleteTargetId(genre.id); setDeleteConfirm(true); setMenuOpenId(null); }} className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2 cursor-pointer">
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <p className="text-sm text-gray-400 mb-3 line-clamp-2">{genre.description}</p>

              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">{genre.memoryCount} memories</span>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(genre)} className="p-1.5 rounded-lg hover:bg-white/10 transition cursor-pointer" title="Edit">
                    <Edit3 className="w-3.5 h-3.5 text-gray-400" />
                  </button>
                  <button onClick={() => toggleVisibility(genre.id)} className="p-1.5 rounded-lg hover:bg-white/10 transition cursor-pointer" title="Toggle visibility">
                    {genre.isVisible ? (
                      <EyeOff className="w-3.5 h-3.5 text-gray-400" />
                    ) : (
                      <Eye className="w-3.5 h-3.5 text-gray-400" />
                    )}
                  </button>
                  <button onClick={() => { setDeleteTargetId(genre.id); setDeleteConfirm(true); }} className="p-1.5 rounded-lg hover:bg-red-500/10 transition cursor-pointer" title="Delete">
                    <Trash2 className="w-3.5 h-3.5 text-red-400" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}

        {/* Create New Genre Card */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          onClick={openCreate}
          className="border-2 border-dashed border-white/10 rounded-xl p-8 flex flex-col items-center justify-center gap-3 hover:border-[var(--mf-accent)]/30 hover:bg-white/[0.02] transition-all min-h-[200px] cursor-pointer"
        >
          <Plus className="w-8 h-8 text-gray-600" />
          <span className="text-sm text-gray-500 font-medium">Create New Genre</span>
        </motion.button>
      </div>

      {/* Create / Edit Modal */}
      <Modal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        title={editingGenre ? "Edit Genre" : "Create New Genre"}
        subtitle={editingGenre ? `Editing "${editingGenre.name}"` : "Add a new emotional memory category"}
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Genre Name</label>
            <input
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="e.g. Summer Vibes"
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-[var(--mf-accent)]/50"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Description</label>
            <textarea
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder="Describe this genre..."
              rows={3}
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-[var(--mf-accent)]/50 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Type</label>
            <div className="flex flex-wrap gap-2">
              {GENRE_TYPES.map((t) => (
                <button
                  key={t}
                  onClick={() => setFormType(t)}
                  className={`px-3 py-1.5 rounded-lg text-xs capitalize transition cursor-pointer ${
                    formType === t
                      ? "bg-[var(--mf-accent)]/20 text-[var(--mf-accent)] ring-1 ring-[var(--mf-accent)]/30"
                      : "bg-white/5 text-gray-400 hover:bg-white/10"
                  }`}
                >
                  {t === "ai_discovery" ? "AI Discovery" : t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Color</label>
            <div className="flex gap-2">
              {GENRE_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setFormColor(c)}
                  className={`w-8 h-8 rounded-full transition cursor-pointer ${
                    formColor === c ? "ring-2 ring-white ring-offset-2 ring-offset-[#1a1a1a]" : "hover:scale-110"
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Ranking Priority: {formPriority}</label>
            <input
              type="range"
              min={1}
              max={100}
              value={formPriority}
              onChange={(e) => setFormPriority(Number(e.target.value))}
              className="w-full accent-[var(--mf-accent)]"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-white/5">
            <button onClick={() => setFormOpen(false)} className="px-4 py-2 rounded-lg bg-white/5 text-sm text-gray-300 hover:bg-white/10 transition cursor-pointer">
              Cancel
            </button>
            <button onClick={handleSave} className="px-5 py-2 rounded-lg bg-[var(--mf-accent)] text-black text-sm font-semibold hover:brightness-110 transition cursor-pointer">
              <span className="flex items-center gap-1"><Save className="w-3.5 h-3.5" /> {editingGenre ? "Save Changes" : "Create Genre"}</span>
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteConfirm}
        onClose={() => { setDeleteConfirm(false); setDeleteTargetId(null); }}
        onConfirm={handleDelete}
        title="Delete Genre"
        message={`Are you sure you want to delete "${genres.find((g) => g.id === deleteTargetId)?.name}"? This will unlink all associated memories.`}
        confirmLabel="Delete Genre"
        confirmVariant="danger"
      />
    </div>
  );
}
