"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload, Search, Filter, Grid3X3, List, MoreVertical,
  Image, Film, FileImage, Sparkles, Trash2, Edit3,
  Tag, Eye, Heart, Star, CheckSquare, Square, X, Save
} from "lucide-react";
import { Memory } from "@/types";
import { formatDuration, getEmotionColor } from "@/lib/utils";
import { useMemoryStore } from "@/lib/memoryStore";
import Modal from "@/components/ui/Modal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";

type ViewMode = "grid" | "list";
type MediaFilter = "all" | "photo" | "video" | "gif" | "clip";

export default function AdminMediaPage() {
  const { toast } = useToast();
  const { memories, setMemories } = useMemoryStore();
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [filter, setFilter] = useState<MediaFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Modal states
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadFiles, setUploadFiles] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const [editOpen, setEditOpen] = useState(false);
  const [editMemory, setEditMemory] = useState<Memory | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editTags, setEditTags] = useState("");

  const [retagOpen, setRetagOpen] = useState(false);
  const [bulkTags, setBulkTags] = useState("");

  const [reclassifyOpen, setReclassifyOpen] = useState(false);
  const [bulkEmotion, setBulkEmotion] = useState("");

  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailMemory, setDetailMemory] = useState<Memory | null>(null);

  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  const filtered = memories.filter((m) => {
    if (m.status === "deleted") return false;
    if (filter !== "all" && m.mediaType !== filter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return m.title.toLowerCase().includes(q) || m.aiTags.some((t) => t.includes(q));
    }
    return true;
  });

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const selectAll = () => {
    if (selectedIds.size === filtered.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(filtered.map((m) => m.id)));
  };

  // --- Actions ---
  const handleUpload = () => {
    if (uploadFiles.length === 0) {
      toast("error", "No Files", "Please select at least one file to upload.");
      return;
    }
    setUploading(true);
    const timestamp = Date.now();
    const newMemories: Memory[] = uploadFiles.map((fileName, idx) => {
      const seed = `upload-${timestamp}-${idx}`;
      const isVideo = /\.(mp4|mov|avi|webm|mkv)$/i.test(fileName);
      const isGif = /\.gif$/i.test(fileName);
      return {
        id: `mem-${timestamp}-${idx}`,
        title: fileName.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "),
        description: "Newly uploaded memory — AI processing in progress",
        mediaType: isVideo ? "video" : isGif ? "clip" : "photo",
        mediaUrl: `https://picsum.photos/seed/${seed}/1200/800`,
        thumbnailUrl: `https://picsum.photos/seed/${seed}/400/300`,
        duration: isVideo ? Math.floor(Math.random() * 120) + 10 : undefined,
        capturedAt: new Date().toISOString(),
        uploadedAt: new Date().toISOString(),
        emotions: [{ emotion: "joy" as const, confidence: 0.8, intensity: 70 }],
        people: [],
        scenes: ["new"],
        aiTags: ["uploaded", "new"],
        aiConfidence: 0,
        emotionalScore: 50,
        nostalgiaScore: 0,
        viewCount: 0,
        isFavorite: false,
        isCoreMomory: false,
        status: "processing" as const,
        genreIds: [],
        userId: "user-001",
      };
    });

    setTimeout(() => {
      // Add all new memories to the shared store
      setMemories((prev) => [...newMemories, ...prev]);
      setUploading(false);
      setUploadFiles([]);
      setUploadOpen(false);
      toast("success", "Upload Complete", `${newMemories.length} file(s) uploaded. AI processing started.`);

      // Simulate AI processing finishing after 3s
      setTimeout(() => {
        setMemories((prev) =>
          prev.map((m) => {
            const match = newMemories.find((nm) => nm.id === m.id);
            if (match) {
              return { ...m, status: "active" as const, aiConfidence: 0.92, emotionalScore: 78, nostalgiaScore: 45 };
            }
            return m;
          })
        );
        toast("info", "AI Processing Complete", `${newMemories.length} memories have been classified.`);
      }, 3000);
    }, 2000);
  };

  const handleDelete = (id?: string) => {
    const idsToDelete = id ? [id] : Array.from(selectedIds);
    setMemories((prev) => prev.map((m) => (idsToDelete.includes(m.id) ? { ...m, status: "deleted" as const } : m)));
    setSelectedIds(new Set());
    setDeleteTargetId(null);
    toast("success", "Deleted", `${idsToDelete.length} item(s) moved to trash.`);
  };

  const handleEdit = () => {
    if (!editMemory) return;
    setMemories((prev) =>
      prev.map((m) =>
        m.id === editMemory.id
          ? { ...m, title: editTitle, aiTags: editTags.split(",").map((t) => t.trim()).filter(Boolean) }
          : m
      )
    );
    setEditOpen(false);
    setEditMemory(null);
    toast("success", "Updated", `"${editTitle}" has been updated.`);
  };

  const handleBulkRetag = () => {
    const tags = bulkTags.split(",").map((t) => t.trim()).filter(Boolean);
    setMemories((prev) =>
      prev.map((m) => (selectedIds.has(m.id) ? { ...m, aiTags: [...m.aiTags, ...tags] } : m))
    );
    setRetagOpen(false);
    setBulkTags("");
    toast("success", "Retagged", `${selectedIds.size} items retagged with ${tags.length} new tag(s).`);
    setSelectedIds(new Set());
  };

  const handleBulkReclassify = () => {
    setMemories((prev) =>
      prev.map((m) =>
        selectedIds.has(m.id)
          ? {
              ...m,
              emotions: [{ emotion: bulkEmotion as any, confidence: 0.85, intensity: 75 }, ...m.emotions.slice(1)],
            }
          : m
      )
    );
    setReclassifyOpen(false);
    setBulkEmotion("");
    toast("success", "Reclassified", `${selectedIds.size} items reclassified as "${bulkEmotion}".`);
    setSelectedIds(new Set());
  };

  const openEdit = (memory: Memory) => {
    setEditMemory(memory);
    setEditTitle(memory.title);
    setEditTags(memory.aiTags.join(", "));
    setEditOpen(true);
    setMenuOpenId(null);
  };

  const openDetail = (memory: Memory) => {
    setDetailMemory(memory);
    setDetailOpen(true);
    setMenuOpenId(null);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Media Management</h1>
          <p className="text-gray-500 mt-1">{filtered.length} media items</p>
        </div>
        <button
          onClick={() => setUploadOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--mf-accent)] text-black font-semibold text-sm hover:brightness-110 transition cursor-pointer"
        >
          <Upload className="w-4 h-4" />
          Upload Media
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 mb-6 bg-[#141414] rounded-xl p-3 border border-white/5">
        <div className="flex items-center gap-2 flex-1 min-w-[200px] px-3 py-2 rounded-lg bg-white/5 border border-white/5">
          <Search className="w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search media..."
            className="bg-transparent text-white text-sm outline-none flex-1 placeholder-gray-600"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="p-0.5 hover:bg-white/10 rounded">
              <X className="w-3 h-3 text-gray-400" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
          {(["all", "photo", "video", "gif", "clip"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition cursor-pointer ${
                filter === f ? "bg-white/10 text-white" : "text-gray-500 hover:text-gray-300"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
          <button onClick={() => setViewMode("grid")} className={`p-1.5 rounded-md transition cursor-pointer ${viewMode === "grid" ? "bg-white/10 text-white" : "text-gray-500"}`}>
            <Grid3X3 className="w-4 h-4" />
          </button>
          <button onClick={() => setViewMode("list")} className={`p-1.5 rounded-md transition cursor-pointer ${viewMode === "list" ? "bg-white/10 text-white" : "text-gray-500"}`}>
            <List className="w-4 h-4" />
          </button>
        </div>

        <button onClick={selectAll} className="p-2 rounded-lg hover:bg-white/5 text-gray-500 hover:text-white transition cursor-pointer">
          {selectedIds.size === filtered.length && filtered.length > 0 ? <CheckSquare className="w-4 h-4 text-[var(--mf-accent)]" /> : <Square className="w-4 h-4" />}
        </button>
      </div>

      {/* Bulk Actions */}
      <AnimatePresence>
        {selectedIds.size > 0 && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex items-center gap-3 mb-4 px-4 py-3 bg-[var(--mf-accent)]/10 border border-[var(--mf-accent)]/20 rounded-xl">
            <span className="text-sm text-[var(--mf-accent)] font-medium">{selectedIds.size} selected</span>
            <div className="flex gap-2 ml-auto">
              <button onClick={() => setRetagOpen(true)} className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg bg-white/10 text-white hover:bg-white/15 cursor-pointer">
                <Tag className="w-3 h-3" /> Retag
              </button>
              <button onClick={() => setReclassifyOpen(true)} className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg bg-white/10 text-white hover:bg-white/15 cursor-pointer">
                <Edit3 className="w-3 h-3" /> Reclassify
              </button>
              <button onClick={() => setDeleteConfirm(true)} className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 cursor-pointer">
                <Trash2 className="w-3 h-3" /> Delete
              </button>
              <button onClick={() => setSelectedIds(new Set())} className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 cursor-pointer">
                <X className="w-3 h-3" /> Clear
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid View */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {filtered.map((memory, i) => (
            <motion.div
              key={memory.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.02 }}
              className={`relative group cursor-pointer rounded-xl overflow-hidden aspect-square border-2 transition-all ${
                selectedIds.has(memory.id) ? "border-[var(--mf-accent)]" : "border-transparent hover:border-white/10"
              }`}
            >
              <div
                className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
                style={{ backgroundImage: `url(${memory.thumbnailUrl})` }}
                onClick={() => toggleSelect(memory.id)}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

              {/* Selection checkbox */}
              <div
                onClick={(e) => { e.stopPropagation(); toggleSelect(memory.id); }}
                className={`absolute top-2 left-2 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all cursor-pointer ${
                  selectedIds.has(memory.id) ? "bg-[var(--mf-accent)] border-[var(--mf-accent)]" : "border-white/30 opacity-0 group-hover:opacity-100"
                }`}
              >
                {selectedIds.has(memory.id) && <span className="text-black text-xs font-bold">&#10003;</span>}
              </div>

              {/* Status badge */}
              {memory.status === "processing" && (
                <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 text-[10px] font-medium animate-pulse">Processing...</div>
              )}

              {/* Bottom actions on hover */}
              <div className="absolute bottom-0 left-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between">
                <p className="text-xs text-white font-medium truncate flex-1">{memory.title}</p>
                <div className="flex gap-1 flex-shrink-0">
                  <button onClick={(e) => { e.stopPropagation(); openDetail(memory); }} className="p-1 rounded bg-black/60 hover:bg-black/80 transition cursor-pointer" title="View details">
                    <Eye className="w-3 h-3 text-white" />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); openEdit(memory); }} className="p-1 rounded bg-black/60 hover:bg-black/80 transition cursor-pointer" title="Edit">
                    <Edit3 className="w-3 h-3 text-white" />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); setDeleteTargetId(memory.id); setDeleteConfirm(true); }} className="p-1 rounded bg-black/60 hover:bg-red-500/60 transition cursor-pointer" title="Delete">
                    <Trash2 className="w-3 h-3 text-white" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* List View */}
      {viewMode === "list" && (
        <div className="bg-[#141414] rounded-xl border border-white/5 overflow-hidden">
          <div className="grid grid-cols-[auto_1fr_100px_100px_80px_80px_80px_60px] gap-4 px-4 py-3 border-b border-white/5 text-xs font-medium text-gray-500 uppercase tracking-wider">
            <span className="w-5" /><span>Title</span><span>Type</span><span>Emotion</span><span>Score</span><span>Views</span><span>Status</span><span>Actions</span>
          </div>
          {filtered.map((memory) => (
            <div key={memory.id} className={`grid grid-cols-[auto_1fr_100px_100px_80px_80px_80px_60px] gap-4 px-4 py-3 items-center border-b border-white/5 hover:bg-white/5 transition ${selectedIds.has(memory.id) ? "bg-[var(--mf-accent)]/5" : ""}`}>
              <div onClick={() => toggleSelect(memory.id)} className={`w-5 h-5 rounded border-2 flex items-center justify-center cursor-pointer ${selectedIds.has(memory.id) ? "bg-[var(--mf-accent)] border-[var(--mf-accent)]" : "border-gray-600"}`}>
                {selectedIds.has(memory.id) && <span className="text-black text-xs font-bold">&#10003;</span>}
              </div>
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-cover bg-center flex-shrink-0" style={{ backgroundImage: `url(${memory.thumbnailUrl})` }} />
                <div className="min-w-0">
                  <p className="text-sm text-white truncate">{memory.title}</p>
                  <p className="text-xs text-gray-600 truncate">{memory.aiTags.slice(0, 3).join(", ")}</p>
                </div>
              </div>
              <span className="text-xs text-gray-400 capitalize">{memory.mediaType}</span>
              <span className="text-xs capitalize" style={{ color: memory.emotions[0] ? getEmotionColor(memory.emotions[0].emotion) : "#888" }}>{memory.emotions[0]?.emotion || "—"}</span>
              <span className="text-xs text-gray-400">{memory.emotionalScore}</span>
              <span className="text-xs text-gray-400">{memory.viewCount}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${memory.status === "active" ? "bg-green-500/10 text-green-400" : memory.status === "processing" ? "bg-yellow-500/10 text-yellow-400" : "bg-gray-500/10 text-gray-400"}`}>{memory.status}</span>
              <div className="relative">
                <button onClick={() => setMenuOpenId(menuOpenId === memory.id ? null : memory.id)} className="p-1 rounded hover:bg-white/10 transition cursor-pointer">
                  <MoreVertical className="w-4 h-4 text-gray-500" />
                </button>
                {menuOpenId === memory.id && (
                  <div className="absolute right-0 top-8 z-50 w-40 bg-[#222] border border-white/10 rounded-lg shadow-xl py-1">
                    <button onClick={() => openDetail(memory)} className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-white/10 flex items-center gap-2 cursor-pointer"><Eye className="w-3.5 h-3.5" /> View</button>
                    <button onClick={() => openEdit(memory)} className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-white/10 flex items-center gap-2 cursor-pointer"><Edit3 className="w-3.5 h-3.5" /> Edit</button>
                    <button onClick={() => { setMemories((prev) => prev.map((m) => m.id === memory.id ? { ...m, isFavorite: !m.isFavorite } : m)); setMenuOpenId(null); toast("success", memory.isFavorite ? "Unfavorited" : "Favorited", `Memory "${memory.title}" updated.`); }} className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-white/10 flex items-center gap-2 cursor-pointer"><Heart className="w-3.5 h-3.5" /> {memory.isFavorite ? "Unfavorite" : "Favorite"}</button>
                    <button onClick={() => { setDeleteTargetId(memory.id); setDeleteConfirm(true); setMenuOpenId(null); }} className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2 cursor-pointer"><Trash2 className="w-3.5 h-3.5" /> Delete</button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Dropzone */}
      <div
        onClick={() => setUploadOpen(true)}
        className="mt-8 border-2 border-dashed border-white/10 rounded-2xl p-12 text-center hover:border-[var(--mf-accent)]/30 hover:bg-white/[0.02] transition-all cursor-pointer"
      >
        <Upload className="w-10 h-10 text-gray-600 mx-auto mb-4" />
        <p className="text-base text-gray-400 font-medium mb-1">Drag & drop media here</p>
        <p className="text-sm text-gray-600">Click to upload photos, videos, GIFs, and clips</p>
      </div>

      {/* === MODALS === */}

      {/* Upload Modal */}
      <Modal isOpen={uploadOpen} onClose={() => setUploadOpen(false)} title="Upload Media" subtitle="Add photos, videos, GIFs to your memory library" size="lg">
        <div className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center mb-4 hover:border-[var(--mf-accent)]/30 transition-all">
          <Upload className="w-8 h-8 text-gray-500 mx-auto mb-3" />
          <p className="text-sm text-gray-400 mb-2">Drag files here or click to browse</p>
          <input
            type="file"
            multiple
            accept="image/*,video/*"
            onChange={(e) => setUploadFiles(Array.from(e.target.files || []).map((f) => f.name))}
            className="block mx-auto text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[var(--mf-accent)] file:text-black hover:file:brightness-110 cursor-pointer"
          />
        </div>
        {uploadFiles.length > 0 && (
          <div className="mb-4 p-3 rounded-lg bg-white/5 border border-white/5">
            <p className="text-xs text-gray-500 mb-2">{uploadFiles.length} file(s) selected:</p>
            {uploadFiles.map((f) => (
              <p key={f} className="text-sm text-white">{f}</p>
            ))}
          </div>
        )}
        <div className="flex justify-end gap-3 pt-2 border-t border-white/5">
          <button onClick={() => setUploadOpen(false)} className="px-4 py-2 rounded-lg bg-white/5 text-sm text-gray-300 hover:bg-white/10 transition cursor-pointer">Cancel</button>
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="px-5 py-2 rounded-lg bg-[var(--mf-accent)] text-black text-sm font-semibold hover:brightness-110 transition disabled:opacity-50 cursor-pointer"
          >
            {uploading ? "Uploading..." : "Upload & Process"}
          </button>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={editOpen} onClose={() => setEditOpen(false)} title="Edit Memory" size="md">
        {editMemory && (
          <>
            <div className="flex gap-4 mb-4">
              <div className="w-24 h-24 rounded-lg bg-cover bg-center flex-shrink-0" style={{ backgroundImage: `url(${editMemory.thumbnailUrl})` }} />
              <div className="flex-1">
                <label className="block text-xs text-gray-500 mb-1">Title</label>
                <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-[var(--mf-accent)]/50" />
              </div>
            </div>
            <label className="block text-xs text-gray-500 mb-1">Tags (comma separated)</label>
            <input type="text" value={editTags} onChange={(e) => setEditTags(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-[var(--mf-accent)]/50 mb-4" />
            <div className="flex justify-end gap-3 pt-2 border-t border-white/5">
              <button onClick={() => setEditOpen(false)} className="px-4 py-2 rounded-lg bg-white/5 text-sm text-gray-300 hover:bg-white/10 transition cursor-pointer">Cancel</button>
              <button onClick={handleEdit} className="px-5 py-2 rounded-lg bg-[var(--mf-accent)] text-black text-sm font-semibold hover:brightness-110 transition cursor-pointer">
                <span className="flex items-center gap-1"><Save className="w-3.5 h-3.5" /> Save</span>
              </button>
            </div>
          </>
        )}
      </Modal>

      {/* Detail Modal */}
      <Modal isOpen={detailOpen} onClose={() => setDetailOpen(false)} title="Memory Details" size="lg">
        {detailMemory && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="aspect-square rounded-xl bg-cover bg-center" style={{ backgroundImage: `url(${detailMemory.thumbnailUrl})` }} />
            <div>
              <h3 className="text-xl font-bold text-white mb-2">{detailMemory.title}</h3>
              <p className="text-sm text-gray-400 mb-4">{detailMemory.description}</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Type</span><span className="text-white capitalize">{detailMemory.mediaType}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Status</span><span className="text-white capitalize">{detailMemory.status}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Emotional Score</span><span className="text-white">{detailMemory.emotionalScore}/100</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Nostalgia Score</span><span className="text-white">{detailMemory.nostalgiaScore}/100</span></div>
                <div className="flex justify-between"><span className="text-gray-500">AI Confidence</span><span className="text-white">{(detailMemory.aiConfidence * 100).toFixed(0)}%</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Views</span><span className="text-white">{detailMemory.viewCount}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Captured</span><span className="text-white">{new Date(detailMemory.capturedAt).toLocaleDateString()}</span></div>
                {detailMemory.location?.city && <div className="flex justify-between"><span className="text-gray-500">Location</span><span className="text-white">{detailMemory.location.city}, {detailMemory.location.country}</span></div>}
              </div>
              <div className="mt-4">
                <p className="text-xs text-gray-500 mb-2">Emotions</p>
                <div className="flex flex-wrap gap-1">{detailMemory.emotions.map((e) => (<span key={e.emotion} className="px-2 py-0.5 rounded-full text-xs capitalize" style={{ backgroundColor: `${getEmotionColor(e.emotion)}20`, color: getEmotionColor(e.emotion) }}>{e.emotion} ({(e.confidence * 100).toFixed(0)}%)</span>))}</div>
              </div>
              <div className="mt-3">
                <p className="text-xs text-gray-500 mb-2">Tags</p>
                <div className="flex flex-wrap gap-1">{detailMemory.aiTags.map((t) => (<span key={t} className="px-2 py-0.5 rounded-full text-xs bg-white/5 text-gray-300">{t}</span>))}</div>
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={() => { setDetailOpen(false); openEdit(detailMemory); }} className="px-4 py-2 rounded-lg bg-white/10 text-sm text-white hover:bg-white/15 transition cursor-pointer flex items-center gap-1"><Edit3 className="w-3.5 h-3.5" /> Edit</button>
                <button onClick={() => { setDetailOpen(false); setDeleteTargetId(detailMemory.id); setDeleteConfirm(true); }} className="px-4 py-2 rounded-lg bg-red-500/10 text-sm text-red-400 hover:bg-red-500/20 transition cursor-pointer flex items-center gap-1"><Trash2 className="w-3.5 h-3.5" /> Delete</button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Bulk Retag Modal */}
      <Modal isOpen={retagOpen} onClose={() => setRetagOpen(false)} title="Retag Memories" subtitle={`Add tags to ${selectedIds.size} selected items`} size="sm">
        <label className="block text-xs text-gray-500 mb-1">New Tags (comma separated)</label>
        <input type="text" value={bulkTags} onChange={(e) => setBulkTags(e.target.value)} placeholder="e.g. summer, vacation, family" className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-[var(--mf-accent)]/50 mb-4" />
        <div className="flex justify-end gap-3">
          <button onClick={() => setRetagOpen(false)} className="px-4 py-2 rounded-lg bg-white/5 text-sm text-gray-300 hover:bg-white/10 cursor-pointer">Cancel</button>
          <button onClick={handleBulkRetag} disabled={!bulkTags.trim()} className="px-5 py-2 rounded-lg bg-[var(--mf-accent)] text-black text-sm font-semibold hover:brightness-110 disabled:opacity-50 cursor-pointer">Apply Tags</button>
        </div>
      </Modal>

      {/* Bulk Reclassify Modal */}
      <Modal isOpen={reclassifyOpen} onClose={() => setReclassifyOpen(false)} title="Reclassify Emotion" subtitle={`Change primary emotion for ${selectedIds.size} items`} size="sm">
        <div className="grid grid-cols-3 gap-2 mb-4">
          {["joy", "nostalgia", "love", "calm", "excitement", "comfort", "warmth", "adventure", "pride"].map((emotion) => (
            <button
              key={emotion}
              onClick={() => setBulkEmotion(emotion)}
              className={`px-3 py-2 rounded-lg text-sm capitalize transition cursor-pointer ${bulkEmotion === emotion ? "ring-2 ring-[var(--mf-accent)]" : ""}`}
              style={{ backgroundColor: `${getEmotionColor(emotion)}20`, color: getEmotionColor(emotion) }}
            >
              {emotion}
            </button>
          ))}
        </div>
        <div className="flex justify-end gap-3">
          <button onClick={() => setReclassifyOpen(false)} className="px-4 py-2 rounded-lg bg-white/5 text-sm text-gray-300 hover:bg-white/10 cursor-pointer">Cancel</button>
          <button onClick={handleBulkReclassify} disabled={!bulkEmotion} className="px-5 py-2 rounded-lg bg-[var(--mf-accent)] text-black text-sm font-semibold hover:brightness-110 disabled:opacity-50 cursor-pointer">Reclassify</button>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteConfirm}
        onClose={() => { setDeleteConfirm(false); setDeleteTargetId(null); }}
        onConfirm={() => handleDelete(deleteTargetId || undefined)}
        title="Delete Memory"
        message={deleteTargetId ? "Are you sure you want to delete this memory? It will be moved to trash." : `Are you sure you want to delete ${selectedIds.size} selected memories? They will be moved to trash.`}
        confirmLabel="Delete"
        confirmVariant="danger"
      />
    </div>
  );
}
