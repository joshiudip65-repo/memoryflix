"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  GripVertical, Eye, EyeOff, Edit3, Plus, Pin,
  Image, Layout, ArrowUp, ArrowDown, Sparkles,
  Save, Trash2, X
} from "lucide-react";
import { mockBanners, mockRails } from "@/data/mock";
import { HeroBanner, Rail } from "@/types";
import Modal from "@/components/ui/Modal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";

export default function AdminHomepagePage() {
  const { toast } = useToast();
  const [banners, setBanners] = useState<HeroBanner[]>(mockBanners);
  const [rails, setRails] = useState<Rail[]>(mockRails);

  // Banner modal
  const [bannerModalOpen, setBannerModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<HeroBanner | null>(null);
  const [bannerTitle, setBannerTitle] = useState("");
  const [bannerSubtitle, setBannerSubtitle] = useState("");

  // Rail modal
  const [railModalOpen, setRailModalOpen] = useState(false);
  const [editingRail, setEditingRail] = useState<Rail | null>(null);
  const [railTitle, setRailTitle] = useState("");
  const [railSubtitle, setRailSubtitle] = useState("");

  // Delete confirm
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: "banner" | "rail"; id: string } | null>(null);

  // Publishing
  const [publishing, setPublishing] = useState(false);

  const moveRail = (index: number, direction: "up" | "down") => {
    const next = [...rails];
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setRails(next);
    toast("info", "Rail Reordered", `"${next[target].title}" moved ${direction}.`);
  };

  const moveBanner = (index: number, direction: "up" | "down") => {
    const next = [...banners];
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setBanners(next);
    toast("info", "Banner Reordered", `"${next[target].title}" moved ${direction}.`);
  };

  const toggleBanner = (id: string) => {
    setBanners((prev) =>
      prev.map((b) => (b.id === id ? { ...b, isActive: !b.isActive } : b))
    );
    const banner = banners.find((b) => b.id === id);
    toast("success", banner?.isActive ? "Banner Deactivated" : "Banner Activated", `"${banner?.title}" updated.`);
  };

  const toggleRail = (id: string) => {
    setRails((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isActive: !r.isActive } : r))
    );
    const rail = rails.find((r) => r.id === id);
    toast("success", rail?.isActive ? "Rail Deactivated" : "Rail Activated", `"${rail?.title}" updated.`);
  };

  const toggleRailPin = (id: string) => {
    setRails((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isPinned: !r.isPinned } : r))
    );
    const rail = rails.find((r) => r.id === id);
    toast("success", rail?.isPinned ? "Rail Unpinned" : "Rail Pinned", `"${rail?.title}" updated.`);
  };

  // Banner CRUD
  const openBannerCreate = () => {
    setEditingBanner(null);
    setBannerTitle("");
    setBannerSubtitle("");
    setBannerModalOpen(true);
  };

  const openBannerEdit = (banner: HeroBanner) => {
    setEditingBanner(banner);
    setBannerTitle(banner.title);
    setBannerSubtitle(banner.subtitle);
    setBannerModalOpen(true);
  };

  const saveBanner = () => {
    if (!bannerTitle.trim()) {
      toast("error", "Title Required", "Banner title cannot be empty.");
      return;
    }
    if (editingBanner) {
      setBanners((prev) =>
        prev.map((b) =>
          b.id === editingBanner.id ? { ...b, title: bannerTitle, subtitle: bannerSubtitle } : b
        )
      );
      toast("success", "Banner Updated", `"${bannerTitle}" saved.`);
    } else {
      const newBanner: HeroBanner = {
        id: `banner-${Date.now()}`,
        title: bannerTitle,
        subtitle: bannerSubtitle,
        description: "",
        mediaUrl: `https://picsum.photos/seed/${Date.now()}/1920/1080`,
        thumbnailUrl: `https://picsum.photos/seed/${Date.now()}/400/225`,
        mediaType: "photo",
        ctaButtons: [{ label: "Relive", action: "relive", variant: "primary" }],
        gradient: "linear-gradient(to right, #0a0a0a, transparent)",
        isActive: true,
        position: banners.length,
      };
      setBanners((prev) => [...prev, newBanner]);
      toast("success", "Banner Created", `"${bannerTitle}" added to hero carousel.`);
    }
    setBannerModalOpen(false);
  };

  // Rail CRUD
  const openRailCreate = () => {
    setEditingRail(null);
    setRailTitle("");
    setRailSubtitle("");
    setRailModalOpen(true);
  };

  const openRailEdit = (rail: Rail) => {
    setEditingRail(rail);
    setRailTitle(rail.title);
    setRailSubtitle(rail.subtitle || "");
    setRailModalOpen(true);
  };

  const saveRail = () => {
    if (!railTitle.trim()) {
      toast("error", "Title Required", "Rail title cannot be empty.");
      return;
    }
    if (editingRail) {
      setRails((prev) =>
        prev.map((r) =>
          r.id === editingRail.id ? { ...r, title: railTitle, subtitle: railSubtitle } : r
        )
      );
      toast("success", "Rail Updated", `"${railTitle}" saved.`);
    } else {
      const newRail: Rail = {
        id: `rail-${Date.now()}`,
        title: railTitle,
        subtitle: railSubtitle,
        type: "custom",
        slug: railTitle.toLowerCase().replace(/\s+/g, "-"),
        memoryIds: [],
        rankingScore: 50,
        isActive: true,
        isPinned: false,
        position: rails.length,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        aiGenerated: false,
      };
      setRails((prev) => [...prev, newRail]);
      toast("success", "Rail Created", `"${railTitle}" added to homepage.`);
    }
    setRailModalOpen(false);
  };

  // Delete
  const handleDelete = () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === "banner") {
      const banner = banners.find((b) => b.id === deleteTarget.id);
      setBanners((prev) => prev.filter((b) => b.id !== deleteTarget.id));
      toast("success", "Banner Deleted", `"${banner?.title}" removed.`);
    } else {
      const rail = rails.find((r) => r.id === deleteTarget.id);
      setRails((prev) => prev.filter((r) => r.id !== deleteTarget.id));
      toast("success", "Rail Deleted", `"${rail?.title}" removed.`);
    }
    setDeleteTarget(null);
  };

  // Publish
  const handlePublish = () => {
    setPublishing(true);
    setTimeout(() => {
      setPublishing(false);
      toast("success", "Published!", "Homepage changes are now live.");
    }, 1500);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Homepage Builder</h1>
          <p className="text-gray-500 mt-1">Customize the consumer homepage experience</p>
        </div>
        <button
          onClick={handlePublish}
          disabled={publishing}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--mf-accent)] text-black font-semibold text-sm hover:brightness-110 transition disabled:opacity-50 cursor-pointer"
        >
          <Save className="w-4 h-4" />
          {publishing ? "Publishing..." : "Publish Changes"}
        </button>
      </div>

      {/* Hero Banners Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Image className="w-5 h-5 text-[var(--mf-accent)]" />
            Hero Banners
          </h2>
          <button
            onClick={openBannerCreate}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/5 text-sm text-gray-400 hover:text-white transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Add Banner
          </button>
        </div>

        <div className="space-y-3">
          {banners.map((banner, i) => (
            <div
              key={banner.id}
              className="flex items-center gap-4 bg-[#141414] rounded-xl p-4 border border-white/5 hover:border-white/10 transition group"
            >
              <GripVertical className="w-4 h-4 text-gray-600 cursor-grab flex-shrink-0" />
              <span className="text-lg font-bold text-gray-600 w-6">{i + 1}</span>
              <div
                className="w-28 h-16 rounded-lg bg-cover bg-center flex-shrink-0"
                style={{ backgroundImage: `url(${banner.thumbnailUrl})` }}
              />
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-white truncate">{banner.title}</h3>
                <p className="text-xs text-gray-500 truncate">{banner.subtitle}</p>
                <div className="flex items-center gap-2 mt-1">
                  {banner.ctaButtons.map((btn, j) => (
                    <span key={j} className="px-2 py-0.5 rounded-full bg-white/5 text-[10px] text-gray-400">
                      {btn.label}
                    </span>
                  ))}
                </div>
              </div>

              <span className={`px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
                banner.isActive ? "bg-green-500/10 text-green-400" : "bg-gray-500/10 text-gray-400"
              }`}>
                {banner.isActive ? "Active" : "Inactive"}
              </span>

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => moveBanner(i, "up")} disabled={i === 0} className="p-1 rounded hover:bg-white/10 disabled:opacity-20 cursor-pointer">
                  <ArrowUp className="w-3 h-3 text-gray-400" />
                </button>
                <button onClick={() => moveBanner(i, "down")} disabled={i === banners.length - 1} className="p-1 rounded hover:bg-white/10 disabled:opacity-20 cursor-pointer">
                  <ArrowDown className="w-3 h-3 text-gray-400" />
                </button>
                <button onClick={() => openBannerEdit(banner)} className="p-1.5 rounded hover:bg-white/10 transition cursor-pointer">
                  <Edit3 className="w-3.5 h-3.5 text-gray-400" />
                </button>
                <button onClick={() => toggleBanner(banner.id)} className="p-1.5 rounded hover:bg-white/10 transition cursor-pointer">
                  {banner.isActive ? (
                    <EyeOff className="w-3.5 h-3.5 text-gray-400" />
                  ) : (
                    <Eye className="w-3.5 h-3.5 text-gray-400" />
                  )}
                </button>
                <button onClick={() => { setDeleteTarget({ type: "banner", id: banner.id }); setDeleteConfirm(true); }} className="p-1.5 rounded hover:bg-red-500/10 transition cursor-pointer">
                  <Trash2 className="w-3.5 h-3.5 text-red-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </motion.section>

      {/* Memory Rails Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Layout className="w-5 h-5 text-[var(--mf-accent)]" />
            Memory Rails
          </h2>
          <button
            onClick={openRailCreate}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/5 text-sm text-gray-400 hover:text-white transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Add Rail
          </button>
        </div>

        <div className="space-y-2">
          {rails.map((rail, i) => (
            <div
              key={rail.id}
              className="flex items-center gap-4 bg-[#141414] rounded-xl px-4 py-3 border border-white/5 hover:border-white/10 transition group"
            >
              <GripVertical className="w-4 h-4 text-gray-600 cursor-grab flex-shrink-0" />
              <span className="text-lg font-bold text-gray-600 w-6">{i + 1}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-white">{rail.title}</h3>
                  {rail.isPinned && <Pin className="w-3 h-3 text-[var(--mf-accent)]" />}
                  {rail.aiGenerated && <Sparkles className="w-3 h-3 text-[var(--mf-accent)]" />}
                </div>
                <p className="text-xs text-gray-500">{rail.subtitle} &middot; {rail.memoryIds.length} memories &middot; {rail.type}</p>
              </div>

              <div className="text-right flex-shrink-0">
                <p className="text-sm font-semibold text-white">{rail.rankingScore}</p>
                <p className="text-[10px] text-gray-600">rank score</p>
              </div>

              <div className="flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => moveRail(i, "up")}
                  disabled={i === 0}
                  className="p-1 rounded hover:bg-white/10 disabled:opacity-20 cursor-pointer"
                >
                  <ArrowUp className="w-3 h-3 text-gray-400" />
                </button>
                <button
                  onClick={() => moveRail(i, "down")}
                  disabled={i === rails.length - 1}
                  className="p-1 rounded hover:bg-white/10 disabled:opacity-20 cursor-pointer"
                >
                  <ArrowDown className="w-3 h-3 text-gray-400" />
                </button>
              </div>

              <span className={`px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
                rail.isActive ? "bg-green-500/10 text-green-400" : "bg-gray-500/10 text-gray-400"
              }`}>
                {rail.isActive ? "Live" : "Draft"}
              </span>

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => toggleRailPin(rail.id)} className="p-1.5 rounded hover:bg-white/10 transition cursor-pointer" title={rail.isPinned ? "Unpin" : "Pin"}>
                  <Pin className={`w-3.5 h-3.5 ${rail.isPinned ? "text-[var(--mf-accent)]" : "text-gray-400"}`} />
                </button>
                <button onClick={() => openRailEdit(rail)} className="p-1.5 rounded hover:bg-white/10 transition cursor-pointer" title="Edit">
                  <Edit3 className="w-3.5 h-3.5 text-gray-400" />
                </button>
                <button onClick={() => toggleRail(rail.id)} className="p-1.5 rounded hover:bg-white/10 transition cursor-pointer" title={rail.isActive ? "Deactivate" : "Activate"}>
                  {rail.isActive ? <EyeOff className="w-3.5 h-3.5 text-gray-400" /> : <Eye className="w-3.5 h-3.5 text-gray-400" />}
                </button>
                <button onClick={() => { setDeleteTarget({ type: "rail", id: rail.id }); setDeleteConfirm(true); }} className="p-1.5 rounded hover:bg-red-500/10 transition cursor-pointer" title="Delete">
                  <Trash2 className="w-3.5 h-3.5 text-red-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </motion.section>

      {/* Banner Modal */}
      <Modal
        isOpen={bannerModalOpen}
        onClose={() => setBannerModalOpen(false)}
        title={editingBanner ? "Edit Banner" : "Add Hero Banner"}
        subtitle="Configure the hero carousel banner"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Title</label>
            <input type="text" value={bannerTitle} onChange={(e) => setBannerTitle(e.target.value)} placeholder="Banner headline..." className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-[var(--mf-accent)]/50" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Subtitle</label>
            <input type="text" value={bannerSubtitle} onChange={(e) => setBannerSubtitle(e.target.value)} placeholder="Banner subtitle..." className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-[var(--mf-accent)]/50" />
          </div>
          <div className="flex justify-end gap-3 pt-2 border-t border-white/5">
            <button onClick={() => setBannerModalOpen(false)} className="px-4 py-2 rounded-lg bg-white/5 text-sm text-gray-300 hover:bg-white/10 transition cursor-pointer">Cancel</button>
            <button onClick={saveBanner} className="px-5 py-2 rounded-lg bg-[var(--mf-accent)] text-black text-sm font-semibold hover:brightness-110 transition cursor-pointer">
              <span className="flex items-center gap-1"><Save className="w-3.5 h-3.5" /> {editingBanner ? "Save" : "Add Banner"}</span>
            </button>
          </div>
        </div>
      </Modal>

      {/* Rail Modal */}
      <Modal
        isOpen={railModalOpen}
        onClose={() => setRailModalOpen(false)}
        title={editingRail ? "Edit Rail" : "Add Memory Rail"}
        subtitle="Configure a homepage content rail"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Title</label>
            <input type="text" value={railTitle} onChange={(e) => setRailTitle(e.target.value)} placeholder="Rail title..." className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-[var(--mf-accent)]/50" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Subtitle</label>
            <input type="text" value={railSubtitle} onChange={(e) => setRailSubtitle(e.target.value)} placeholder="Rail subtitle..." className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-[var(--mf-accent)]/50" />
          </div>
          <div className="flex justify-end gap-3 pt-2 border-t border-white/5">
            <button onClick={() => setRailModalOpen(false)} className="px-4 py-2 rounded-lg bg-white/5 text-sm text-gray-300 hover:bg-white/10 transition cursor-pointer">Cancel</button>
            <button onClick={saveRail} className="px-5 py-2 rounded-lg bg-[var(--mf-accent)] text-black text-sm font-semibold hover:brightness-110 transition cursor-pointer">
              <span className="flex items-center gap-1"><Save className="w-3.5 h-3.5" /> {editingRail ? "Save" : "Add Rail"}</span>
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteConfirm}
        onClose={() => { setDeleteConfirm(false); setDeleteTarget(null); }}
        onConfirm={handleDelete}
        title={`Delete ${deleteTarget?.type === "banner" ? "Banner" : "Rail"}`}
        message={`Are you sure you want to delete this ${deleteTarget?.type}? This action cannot be undone.`}
        confirmLabel="Delete"
        confirmVariant="danger"
      />
    </div>
  );
}
