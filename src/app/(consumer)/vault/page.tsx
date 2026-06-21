"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload, FolderOpen, Trash2, Cloud, HardDrive,
  Image, Film, FileImage, Settings, RefreshCw,
  ChevronRight, ChevronDown, Plus, X, Play, Star, Eye, Check
} from "lucide-react";
import { Memory } from "@/types";
import { formatBytes, formatDuration, getEmotionColor } from "@/lib/utils";
import { useMemoryViewer } from "@/components/consumer/MemoryViewer";
import { useMemoryStore } from "@/lib/memoryStore";

const storageUsed = 45.2 * 1024 * 1024 * 1024;
const storageTotal = 500 * 1024 * 1024 * 1024;
const storagePercent = (storageUsed / storageTotal) * 100;

type FolderType = "photos" | "videos" | "clips" | "stories";

const folders: { name: string; icon: typeof Image; count: number; size: number; type: FolderType; filter: (m: Memory) => boolean }[] = [
  { name: "All Photos", icon: Image, count: 847, size: 24.1 * 1024 * 1024 * 1024, type: "photos", filter: (m) => m.mediaType === "photo" },
  { name: "All Videos", icon: Film, count: 312, size: 18.6 * 1024 * 1024 * 1024, type: "videos", filter: (m) => m.mediaType === "video" },
  { name: "GIFs & Clips", icon: FileImage, count: 88, size: 2.5 * 1024 * 1024 * 1024, type: "clips", filter: (m) => m.mediaType === "clip" },
  { name: "AI Stories", icon: Cloud, count: 15, size: 1.2 * 1024 * 1024 * 1024, type: "stories", filter: (m) => m.aiConfidence !== undefined && m.aiConfidence > 0.8 },
];

export default function VaultPage() {
  const [activeTab, setActiveTab] = useState<"files" | "deleted" | "settings">("files");
  const [expandedFolder, setExpandedFolder] = useState<FolderType | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [settingsState, setSettingsState] = useState({
    cloudSync: true,
    autoProcess: true,
    storageTier: false,
  });
  const { openMemory } = useMemoryViewer();
  const { memories: allMemories, addMemory, setMemories } = useMemoryStore();

  const toggleSetting = (key: keyof typeof settingsState) => {
    setSettingsState((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const handleUpload = () => {
    if (selectedFiles.length === 0) {
      // Still allow demo upload with no files
      setUploading(true);
      setUploadSuccess(false);
      const timestamp = Date.now();
      const demoMem: Memory = {
        id: `mem-vault-${timestamp}`,
        title: "New Memory Upload",
        description: "Uploaded from the Vault",
        mediaType: "photo",
        mediaUrl: `https://picsum.photos/seed/vault-${timestamp}/1200/800`,
        thumbnailUrl: `https://picsum.photos/seed/vault-${timestamp}/400/300`,
        capturedAt: new Date().toISOString(),
        uploadedAt: new Date().toISOString(),
        emotions: [{ emotion: "joy" as const, confidence: 0.75, intensity: 65 }],
        people: [],
        scenes: ["uploaded"],
        aiTags: ["uploaded", "vault"],
        aiConfidence: 0.85,
        emotionalScore: 55,
        nostalgiaScore: 30,
        viewCount: 0,
        isFavorite: false,
        isCoreMomory: false,
        status: "processing" as const,
        genreIds: [],
        userId: "user-001",
      };
      setTimeout(() => {
        addMemory(demoMem);
        setUploading(false);
        setUploadSuccess(true);
        // Mark as active after 2s
        setTimeout(() => {
          setMemories((prev) =>
            prev.map((m) => m.id === demoMem.id ? { ...m, status: "active" as const } : m)
          );
        }, 2000);
      }, 2000);
      return;
    }

    setUploading(true);
    setUploadSuccess(false);
    const timestamp = Date.now();
    const newMemories: Memory[] = selectedFiles.map((file, idx) => {
      const seed = `vault-${timestamp}-${idx}`;
      const isVideo = file.type.startsWith("video/");
      return {
        id: `mem-vault-${timestamp}-${idx}`,
        title: file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "),
        description: "Uploaded from the Vault",
        mediaType: isVideo ? "video" as const : "photo" as const,
        mediaUrl: `https://picsum.photos/seed/${seed}/1200/800`,
        thumbnailUrl: `https://picsum.photos/seed/${seed}/400/300`,
        duration: isVideo ? Math.floor(Math.random() * 120) + 10 : undefined,
        capturedAt: new Date().toISOString(),
        uploadedAt: new Date().toISOString(),
        emotions: [{ emotion: "joy" as const, confidence: 0.75, intensity: 65 }],
        people: [],
        scenes: ["uploaded"],
        aiTags: ["uploaded", "vault"],
        aiConfidence: 0.85,
        emotionalScore: 55,
        nostalgiaScore: 30,
        viewCount: 0,
        isFavorite: false,
        isCoreMomory: false,
        status: "processing" as const,
        genreIds: [],
        userId: "user-001",
      };
    });

    setTimeout(() => {
      setMemories((prev) => [...newMemories, ...prev]);
      setUploading(false);
      setUploadSuccess(true);
      setSelectedFiles([]);
      // Mark all as active after 2s
      setTimeout(() => {
        const ids = new Set(newMemories.map((m) => m.id));
        setMemories((prev) =>
          prev.map((m) => ids.has(m.id) ? { ...m, status: "active" as const } : m)
        );
      }, 2000);
    }, 2000);
  };

  const handleFolderClick = (type: FolderType) => {
    setExpandedFolder((prev) => (prev === type ? null : type));
  };

  const activeMemories = allMemories.filter((m) => m.status !== "deleted");

  const getFolderMemories = (filter: (m: Memory) => boolean): Memory[] => {
    const filtered = activeMemories.filter(filter);
    // If filter returns nothing (limited mock data), show all as fallback
    return filtered.length > 0 ? filtered : activeMemories;
  };

  const settingsConfig = [
    { key: "cloudSync" as const, icon: Cloud, label: "Cloud Sync", desc: "Auto-backup to cloud storage" },
    { key: "autoProcess" as const, icon: RefreshCw, label: "Auto-Process", desc: "AI automatically classifies new uploads" },
    { key: "storageTier" as const, icon: Settings, label: "Storage Tier", desc: "Premium — 500 GB" },
  ];

  return (
    <div className="min-h-screen pt-24 pb-8 px-6 md:px-16">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">Vault</h1>
        <p className="text-lg text-gray-500">Your memory storage and backup management</p>
      </motion.div>

      {/* Storage Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-[#1a1a1a] rounded-2xl p-6 mb-8 border border-white/5"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <HardDrive className="w-5 h-5 text-[var(--mf-accent)]" />
            <h2 className="text-lg font-semibold text-white">Storage</h2>
          </div>
          <span className="text-sm text-gray-400">
            {formatBytes(storageUsed)} of {formatBytes(storageTotal)} used
          </span>
        </div>
        <div className="w-full h-3 bg-[#2a2a2a] rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${storagePercent}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full rounded-full"
            style={{ background: "var(--mf-gradient-accent)" }}
          />
        </div>
        <div className="flex justify-between mt-3 text-xs text-gray-500">
          <span>{activeMemories.length} memories</span>
          <span>{storagePercent.toFixed(1)}% used</span>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 mb-8 bg-[#1a1a1a] rounded-xl p-1 w-fit border border-white/5">
        {(["files", "deleted", "settings"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all cursor-pointer ${
              activeTab === tab
                ? "bg-white/10 text-white"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Files Tab */}
      {activeTab === "files" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-3"
        >
          {/* Upload button */}
          <button
            onClick={() => setUploadOpen(true)}
            className="w-full flex items-center justify-center gap-3 py-4 rounded-xl border-2 border-dashed border-white/10 hover:border-[var(--mf-accent)]/30 hover:bg-white/5 transition-all text-gray-400 hover:text-white cursor-pointer"
          >
            <Upload className="w-5 h-5" />
            <span className="font-medium">Upload Memories</span>
          </button>

          {/* Folders */}
          {folders.map((folder, i) => {
            const Icon = folder.icon;
            const isExpanded = expandedFolder === folder.type;
            const folderMemories = isExpanded ? getFolderMemories(folder.filter) : [];
            return (
              <div key={folder.name}>
                <motion.button
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => handleFolderClick(folder.type)}
                  className="w-full flex items-center gap-4 p-4 rounded-xl bg-[#1a1a1a] hover:bg-[#222] transition-colors border border-white/5 group cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-semibold text-white">{folder.name}</p>
                    <p className="text-xs text-gray-500">
                      {folder.count} items &middot; {formatBytes(folder.size)}
                    </p>
                  </div>
                  <motion.div
                    animate={{ rotate: isExpanded ? 90 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-gray-400 transition-colors" />
                  </motion.div>
                </motion.button>

                {/* Expanded folder — show memories */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-3 pb-1 pl-4">
                        <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-hide">
                          {folderMemories.map((memory, idx) => {
                            const isVideo = memory.mediaType === "video" || memory.mediaType === "clip";
                            return (
                              <motion.div
                                key={memory.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.04 }}
                                whileHover={{ scale: 1.05 }}
                                onClick={() => openMemory(memory, folderMemories)}
                                className="relative flex-shrink-0 w-[160px] aspect-[3/4] rounded-lg overflow-hidden cursor-pointer group"
                              >
                                <div
                                  className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                                  style={{ backgroundImage: `url(${memory.thumbnailUrl})` }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                                {isVideo && (
                                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                      <Play className="w-4 h-4 text-white ml-0.5" fill="white" />
                                    </div>
                                  </div>
                                )}
                                <div className="absolute bottom-0 left-0 right-0 p-2">
                                  <p className="text-xs font-medium text-white line-clamp-2">{memory.title}</p>
                                </div>
                                <div className="absolute inset-0 rounded-lg border border-transparent group-hover:border-white/20 transition-all pointer-events-none" />
                              </motion.div>
                            );
                          })}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </motion.div>
      )}

      {/* Deleted Tab */}
      {activeTab === "deleted" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <Trash2 className="w-12 h-12 text-gray-700 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-400 mb-2">No deleted memories</h3>
          <p className="text-sm text-gray-600">Deleted memories appear here for 30 days before permanent removal</p>
        </motion.div>
      )}

      {/* Settings Tab */}
      {activeTab === "settings" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          {settingsConfig.map((item) => {
            const Icon = item.icon;
            const enabled = settingsState[item.key];
            return (
              <div
                key={item.label}
                className="flex items-center gap-4 p-4 rounded-xl bg-[#1a1a1a] border border-white/5"
              >
                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-gray-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white">{item.label}</p>
                  <p className="text-xs text-gray-500">{item.desc}</p>
                </div>
                <button
                  onClick={() => toggleSetting(item.key)}
                  className={`w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${
                    enabled ? "bg-[var(--mf-accent)]" : "bg-gray-700"
                  }`}
                >
                  <motion.div
                    animate={{ x: enabled ? 20 : 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className="w-5 h-5 rounded-full bg-white shadow"
                  />
                </button>
              </div>
            );
          })}
        </motion.div>
      )}

      {/* Upload Modal */}
      <AnimatePresence>
        {uploadOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center"
          >
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => !uploading && setUploadOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative z-10 w-full max-w-lg mx-4 bg-[#1a1a1a] rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
                <h3 className="text-lg font-bold text-white">Upload Memories</h3>
                <button onClick={() => !uploading && setUploadOpen(false)} className="p-1.5 rounded-lg hover:bg-white/10 transition cursor-pointer">
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6">
                {uploadSuccess ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-8"
                  >
                    <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                      <Check className="w-8 h-8 text-green-400" />
                    </div>
                    <h4 className="text-lg font-bold text-white mb-1">Upload Complete!</h4>
                    <p className="text-sm text-gray-400">Your memories are being processed by AI</p>
                    <button
                      onClick={() => { setUploadOpen(false); setUploadSuccess(false); }}
                      className="mt-4 px-6 py-2 rounded-full bg-white/10 text-white text-sm font-medium hover:bg-white/20 transition cursor-pointer"
                    >
                      Done
                    </button>
                  </motion.div>
                ) : (
                  <>
                    {/* Drop zone with file input */}
                    <label className="block border-2 border-dashed border-white/10 rounded-xl p-12 text-center hover:border-[var(--mf-accent)]/30 hover:bg-white/5 transition-all cursor-pointer">
                      <Upload className="w-10 h-10 text-gray-500 mx-auto mb-3" />
                      <p className="text-sm font-semibold text-white mb-1">Drag and drop your files here</p>
                      <p className="text-xs text-gray-500">Photos, videos, GIFs — up to 2 GB per file</p>
                      <p className="text-xs text-gray-600 mt-3">or click to browse</p>
                      <input
                        type="file"
                        multiple
                        accept="image/*,video/*"
                        onChange={(e) => setSelectedFiles(Array.from(e.target.files || []))}
                        className="hidden"
                      />
                    </label>

                    {/* Selected files list */}
                    {selectedFiles.length > 0 && (
                      <div className="mt-3 p-3 rounded-lg bg-white/5 border border-white/5">
                        <p className="text-xs text-gray-500 mb-2">{selectedFiles.length} file(s) selected:</p>
                        {selectedFiles.map((f, i) => (
                          <p key={i} className="text-sm text-white truncate">{f.name}</p>
                        ))}
                      </div>
                    )}

                    {/* Upload button */}
                    <button
                      onClick={handleUpload}
                      disabled={uploading}
                      className="mt-4 w-full py-3 rounded-xl bg-white text-black font-semibold text-sm hover:bg-gray-200 transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                    >
                      {uploading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4" />
                          {selectedFiles.length > 0 ? `Upload ${selectedFiles.length} File(s)` : "Upload Demo File"}
                        </>
                      )}
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
