"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Brain, RefreshCw, CheckCircle, XCircle, Merge, Split,
  Sparkles, AlertTriangle, Eye, Zap
} from "lucide-react";
import Modal from "@/components/ui/Modal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";

interface AICluster {
  id: string;
  name: string;
  type: string;
  memoryCount: number;
  confidence: number;
  isApproved: boolean;
}

const initialClusters: AICluster[] = [
  { id: "cl-001", name: "Beach & Ocean Scenes", type: "scene", memoryCount: 42, confidence: 0.94, isApproved: true },
  { id: "cl-002", name: "Family Gatherings", type: "person", memoryCount: 67, confidence: 0.91, isApproved: true },
  { id: "cl-003", name: "Late Night Conversations", type: "emotion", memoryCount: 18, confidence: 0.87, isApproved: false },
  { id: "cl-004", name: "Mountain Adventures", type: "scene", memoryCount: 25, confidence: 0.93, isApproved: true },
  { id: "cl-005", name: "Cooking Together", type: "scene", memoryCount: 12, confidence: 0.82, isApproved: false },
  { id: "cl-006", name: "Holiday Celebrations", type: "time", memoryCount: 38, confidence: 0.96, isApproved: true },
  { id: "cl-007", name: "Road Trip Energy", type: "emotion", memoryCount: 22, confidence: 0.79, isApproved: false },
  { id: "cl-008", name: "College Campus Life", type: "location", memoryCount: 56, confidence: 0.90, isApproved: true },
];

const aiTags = [
  { tag: "sunset", count: 89, confidence: 0.95 },
  { tag: "smiling", count: 234, confidence: 0.92 },
  { tag: "outdoor", count: 156, confidence: 0.91 },
  { tag: "celebration", count: 78, confidence: 0.89 },
  { tag: "food", count: 112, confidence: 0.88 },
  { tag: "travel", count: 95, confidence: 0.93 },
  { tag: "pets", count: 45, confidence: 0.94 },
  { tag: "winter", count: 34, confidence: 0.87 },
];

const processingStats = [
  { label: "Classification Accuracy", value: "94.2%", trend: "+1.3%", color: "#22c55e" },
  { label: "Face Recognition Rate", value: "91.8%", trend: "+0.9%", color: "#60a5fa" },
  { label: "Emotion Detection", value: "87.4%", trend: "+2.1%", color: "#f472b6" },
  { label: "Scene Understanding", value: "92.6%", trend: "+1.7%", color: "#fbbf24" },
  { label: "Clustering Quality", value: "88.1%", trend: "+0.5%", color: "#c084fc" },
  { label: "Recommendation Hit Rate", value: "84.7%", trend: "+3.2%", color: "#34d399" },
];

export default function AdminAIPage() {
  const { toast } = useToast();
  const [clusters, setClusters] = useState<AICluster[]>(initialClusters);
  const [retraining, setRetraining] = useState(false);
  const [queueCount, setQueueCount] = useState(156);

  // Selection for merge/split
  const [selectedClusterIds, setSelectedClusterIds] = useState<Set<string>>(new Set());

  // Review modal
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewCluster, setReviewCluster] = useState<AICluster | null>(null);

  // Merge modal
  const [mergeOpen, setMergeOpen] = useState(false);
  const [mergeName, setMergeName] = useState("");

  // Delete/reject confirm
  const [rejectConfirm, setRejectConfirm] = useState(false);
  const [rejectTargetId, setRejectTargetId] = useState<string | null>(null);

  const handleRetrain = () => {
    setRetraining(true);
    toast("info", "Retraining Started", "AI models are being retrained. This may take a few minutes.");
    setTimeout(() => {
      setRetraining(false);
      setQueueCount(0);
      toast("success", "Retraining Complete", "All AI models have been updated successfully.");
    }, 3000);
  };

  const handleApprove = (id: string) => {
    setClusters((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isApproved: true } : c))
    );
    const cluster = clusters.find((c) => c.id === id);
    toast("success", "Cluster Approved", `"${cluster?.name}" is now approved.`);
  };

  const handleReject = () => {
    if (!rejectTargetId) return;
    const cluster = clusters.find((c) => c.id === rejectTargetId);
    setClusters((prev) => prev.filter((c) => c.id !== rejectTargetId));
    setRejectTargetId(null);
    toast("success", "Cluster Rejected", `"${cluster?.name}" has been removed.`);
  };

  const openReview = (cluster: AICluster) => {
    setReviewCluster(cluster);
    setReviewOpen(true);
  };

  const toggleClusterSelect = (id: string) => {
    const next = new Set(selectedClusterIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedClusterIds(next);
  };

  const handleMerge = () => {
    if (selectedClusterIds.size < 2) {
      toast("warning", "Select More", "Select at least 2 clusters to merge.");
      return;
    }
    const selected = clusters.filter((c) => selectedClusterIds.has(c.id));
    const totalMemories = selected.reduce((sum, c) => sum + c.memoryCount, 0);
    const avgConfidence = selected.reduce((sum, c) => sum + c.confidence, 0) / selected.length;

    const merged: AICluster = {
      id: `cl-${Date.now()}`,
      name: mergeName || selected.map((c) => c.name).join(" + "),
      type: selected[0].type,
      memoryCount: totalMemories,
      confidence: avgConfidence,
      isApproved: false,
    };

    setClusters((prev) => [merged, ...prev.filter((c) => !selectedClusterIds.has(c.id))]);
    setSelectedClusterIds(new Set());
    setMergeOpen(false);
    setMergeName("");
    toast("success", "Clusters Merged", `${selected.length} clusters merged into "${merged.name}".`);
  };

  const handleSplit = () => {
    if (selectedClusterIds.size !== 1) {
      toast("warning", "Select One", "Select exactly 1 cluster to split.");
      return;
    }
    const id = Array.from(selectedClusterIds)[0];
    const cluster = clusters.find((c) => c.id === id);
    if (!cluster) return;

    const half = Math.floor(cluster.memoryCount / 2);
    const splitA: AICluster = {
      id: `cl-${Date.now()}-a`,
      name: `${cluster.name} (Part 1)`,
      type: cluster.type,
      memoryCount: half,
      confidence: cluster.confidence * 0.95,
      isApproved: false,
    };
    const splitB: AICluster = {
      id: `cl-${Date.now()}-b`,
      name: `${cluster.name} (Part 2)`,
      type: cluster.type,
      memoryCount: cluster.memoryCount - half,
      confidence: cluster.confidence * 0.93,
      isApproved: false,
    };

    setClusters((prev) => [splitA, splitB, ...prev.filter((c) => c.id !== id)]);
    setSelectedClusterIds(new Set());
    toast("success", "Cluster Split", `"${cluster.name}" split into 2 sub-clusters.`);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">AI Engine</h1>
          <p className="text-gray-500 mt-1">Manage AI classifications, clusters, and recommendations</p>
        </div>
        <button
          onClick={handleRetrain}
          disabled={retraining}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--mf-accent)] text-black font-semibold text-sm hover:brightness-110 transition disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${retraining ? "animate-spin" : ""}`} />
          {retraining ? "Retraining..." : "Retrain Models"}
        </button>
      </div>

      {/* AI Performance Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
        {processingStats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-[#141414] rounded-xl p-4 border border-white/5"
          >
            <p className="text-2xl font-bold text-white">{stat.value}</p>
            <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
            <span className="text-[10px] text-green-400">{stat.trend}</span>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AI Clusters */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Brain className="w-5 h-5 text-[var(--mf-accent)]" />
              AI Clusters
              {selectedClusterIds.size > 0 && (
                <span className="text-xs text-[var(--mf-accent)] font-normal ml-2">
                  ({selectedClusterIds.size} selected)
                </span>
              )}
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  if (selectedClusterIds.size < 2) {
                    toast("warning", "Select Clusters", "Select at least 2 clusters to merge.");
                  } else {
                    setMergeOpen(true);
                  }
                }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/5 text-xs text-gray-400 hover:text-white cursor-pointer transition"
              >
                <Merge className="w-3 h-3" /> Merge
              </button>
              <button
                onClick={handleSplit}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/5 text-xs text-gray-400 hover:text-white cursor-pointer transition"
              >
                <Split className="w-3 h-3" /> Split
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {clusters.map((cluster) => (
              <motion.div
                key={cluster.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={`flex items-center gap-4 bg-[#141414] rounded-xl px-4 py-3 border transition group cursor-pointer ${
                  selectedClusterIds.has(cluster.id)
                    ? "border-[var(--mf-accent)]/40 bg-[var(--mf-accent)]/5"
                    : "border-white/5 hover:border-white/10"
                }`}
                onClick={() => toggleClusterSelect(cluster.id)}
              >
                {/* Selection indicator */}
                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                  selectedClusterIds.has(cluster.id)
                    ? "bg-[var(--mf-accent)] border-[var(--mf-accent)]"
                    : "border-gray-600"
                }`}>
                  {selectedClusterIds.has(cluster.id) && <span className="text-black text-[10px] font-bold">&#10003;</span>}
                </div>

                {/* Status */}
                {cluster.isApproved ? (
                  <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-white">{cluster.name}</h3>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-xs text-gray-500 capitalize">{cluster.type}</span>
                    <span className="text-xs text-gray-500">{cluster.memoryCount} memories</span>
                  </div>
                </div>

                {/* Confidence */}
                <div className="text-right flex-shrink-0">
                  <div className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-[var(--mf-accent)]" />
                    <span className="text-sm font-semibold text-white">
                      {(cluster.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                  <span className="text-[10px] text-gray-600">confidence</span>
                </div>

                {/* Actions */}
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                  {!cluster.isApproved && (
                    <button
                      onClick={() => handleApprove(cluster.id)}
                      className="p-1.5 rounded hover:bg-green-500/10 transition cursor-pointer"
                      title="Approve"
                    >
                      <CheckCircle className="w-3.5 h-3.5 text-green-400" />
                    </button>
                  )}
                  <button
                    onClick={() => { setRejectTargetId(cluster.id); setRejectConfirm(true); }}
                    className="p-1.5 rounded hover:bg-red-500/10 transition cursor-pointer"
                    title="Reject"
                  >
                    <XCircle className="w-3.5 h-3.5 text-red-400" />
                  </button>
                  <button
                    onClick={() => openReview(cluster)}
                    className="p-1.5 rounded hover:bg-white/10 transition cursor-pointer"
                    title="Review"
                  >
                    <Eye className="w-3.5 h-3.5 text-gray-400" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* AI Tags */}
        <div>
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-[var(--mf-accent)]" />
            Top AI Tags
          </h2>
          <div className="bg-[#141414] rounded-xl p-4 border border-white/5 space-y-3">
            {aiTags.map((tag) => (
              <div key={tag.tag} className="flex items-center gap-3">
                <span className="text-sm text-white flex-1">{tag.tag}</span>
                <span className="text-xs text-gray-500">{tag.count}</span>
                <div className="w-16 h-1.5 bg-[#2a2a2a] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[var(--mf-accent)]"
                    style={{ width: `${tag.confidence * 100}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500 w-10 text-right">
                  {(tag.confidence * 100).toFixed(0)}%
                </span>
              </div>
            ))}
          </div>

          {/* Processing Queue */}
          <h2 className="text-lg font-bold text-white mt-8 mb-4">Processing Queue</h2>
          <div className="bg-[#141414] rounded-xl p-5 border border-white/5 text-center">
            <div className="w-16 h-16 rounded-full bg-[var(--mf-accent)]/10 flex items-center justify-center mx-auto mb-3">
              <Brain className="w-7 h-7 text-[var(--mf-accent)]" />
            </div>
            <p className="text-3xl font-bold text-white">{queueCount}</p>
            <p className="text-sm text-gray-500 mt-1">Items in queue</p>
            <div className="w-full h-2 bg-[#2a2a2a] rounded-full mt-4 overflow-hidden">
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: queueCount > 0 ? "67%" : "100%" }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="h-full rounded-full bg-gradient-to-r from-[var(--mf-accent)] to-[var(--mf-accent-light)]"
              />
            </div>
            <p className="text-xs text-gray-600 mt-2">
              {queueCount > 0 ? "Estimated: 23 min remaining" : "Queue empty — all processed"}
            </p>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      <Modal isOpen={reviewOpen} onClose={() => setReviewOpen(false)} title="Review Cluster" size="md">
        {reviewCluster && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              {reviewCluster.isApproved ? (
                <CheckCircle className="w-5 h-5 text-green-400" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-yellow-400" />
              )}
              <div>
                <h3 className="text-lg font-semibold text-white">{reviewCluster.name}</h3>
                <p className="text-sm text-gray-500 capitalize">{reviewCluster.type} cluster</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white/5 rounded-lg p-3 text-center">
                <p className="text-xl font-bold text-white">{reviewCluster.memoryCount}</p>
                <p className="text-xs text-gray-500">Memories</p>
              </div>
              <div className="bg-white/5 rounded-lg p-3 text-center">
                <p className="text-xl font-bold text-white">{(reviewCluster.confidence * 100).toFixed(0)}%</p>
                <p className="text-xs text-gray-500">Confidence</p>
              </div>
              <div className="bg-white/5 rounded-lg p-3 text-center">
                <p className="text-xl font-bold text-white">{reviewCluster.isApproved ? "Yes" : "No"}</p>
                <p className="text-xs text-gray-500">Approved</p>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-white/5">
              {!reviewCluster.isApproved && (
                <button
                  onClick={() => { handleApprove(reviewCluster.id); setReviewOpen(false); }}
                  className="px-4 py-2 rounded-lg bg-green-500/10 text-green-400 text-sm font-medium hover:bg-green-500/20 transition cursor-pointer"
                >
                  Approve
                </button>
              )}
              <button
                onClick={() => { setRejectTargetId(reviewCluster.id); setRejectConfirm(true); setReviewOpen(false); }}
                className="px-4 py-2 rounded-lg bg-red-500/10 text-red-400 text-sm font-medium hover:bg-red-500/20 transition cursor-pointer"
              >
                Reject
              </button>
              <button onClick={() => setReviewOpen(false)} className="px-4 py-2 rounded-lg bg-white/5 text-sm text-gray-300 hover:bg-white/10 transition cursor-pointer">Close</button>
            </div>
          </div>
        )}
      </Modal>

      {/* Merge Modal */}
      <Modal isOpen={mergeOpen} onClose={() => setMergeOpen(false)} title="Merge Clusters" subtitle={`Merging ${selectedClusterIds.size} clusters`} size="sm">
        <div className="space-y-3">
          <div className="space-y-1">
            {clusters.filter((c) => selectedClusterIds.has(c.id)).map((c) => (
              <div key={c.id} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 text-sm text-white">
                <Sparkles className="w-3 h-3 text-[var(--mf-accent)]" />
                {c.name} ({c.memoryCount} memories)
              </div>
            ))}
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Merged Cluster Name</label>
            <input
              type="text"
              value={mergeName}
              onChange={(e) => setMergeName(e.target.value)}
              placeholder="Name for merged cluster..."
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-[var(--mf-accent)]/50"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2 border-t border-white/5">
            <button onClick={() => setMergeOpen(false)} className="px-4 py-2 rounded-lg bg-white/5 text-sm text-gray-300 hover:bg-white/10 cursor-pointer">Cancel</button>
            <button onClick={handleMerge} className="px-5 py-2 rounded-lg bg-[var(--mf-accent)] text-black text-sm font-semibold hover:brightness-110 cursor-pointer">Merge Clusters</button>
          </div>
        </div>
      </Modal>

      {/* Reject Confirmation */}
      <ConfirmDialog
        isOpen={rejectConfirm}
        onClose={() => { setRejectConfirm(false); setRejectTargetId(null); }}
        onConfirm={handleReject}
        title="Reject Cluster"
        message={`Are you sure you want to reject "${clusters.find((c) => c.id === rejectTargetId)?.name}"? Its memories will be unlinked from this cluster.`}
        confirmLabel="Reject"
        confirmVariant="danger"
      />
    </div>
  );
}
