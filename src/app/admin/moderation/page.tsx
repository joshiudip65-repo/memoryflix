"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Shield, AlertTriangle, CheckCircle, XCircle,
  Eye, Clock, Flag, Sparkles
} from "lucide-react";
import { mockModerationItems } from "@/data/mock";
import { ModerationItem } from "@/types";
import { timeAgo } from "@/lib/utils";
import Modal from "@/components/ui/Modal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";

const statusConfig: Record<string, { color: string; bg: string; icon: React.ElementType }> = {
  pending: { color: "text-yellow-400", bg: "bg-yellow-500/10", icon: Clock },
  approved: { color: "text-green-400", bg: "bg-green-500/10", icon: CheckCircle },
  rejected: { color: "text-red-400", bg: "bg-red-500/10", icon: XCircle },
  flagged: { color: "text-orange-400", bg: "bg-orange-500/10", icon: Flag },
};

export default function AdminModerationPage() {
  const { toast } = useToast();
  const [items, setItems] = useState<ModerationItem[]>(mockModerationItems);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Review modal
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewItem, setReviewItem] = useState<ModerationItem | null>(null);

  // Reject confirm
  const [rejectConfirm, setRejectConfirm] = useState(false);
  const [rejectTargetId, setRejectTargetId] = useState<string | null>(null);

  const filteredItems = statusFilter === "all" ? items : items.filter((i) => i.status === statusFilter);
  const pendingCount = items.filter((m) => m.status === "pending").length;
  const approvedToday = items.filter((m) => m.status === "approved").length;
  const rejectedToday = items.filter((m) => m.status === "rejected").length;
  const aiFlagged = items.filter((m) => m.status === "flagged").length;

  const handleApprove = (id: string) => {
    setItems((prev) =>
      prev.map((i) =>
        i.id === id
          ? { ...i, status: "approved" as const, reviewedAt: new Date().toISOString(), reviewedBy: "Admin" }
          : i
      )
    );
    toast("success", "Approved", "Memory has been approved and is now visible.");
  };

  const handleReject = () => {
    if (!rejectTargetId) return;
    setItems((prev) =>
      prev.map((i) =>
        i.id === rejectTargetId
          ? { ...i, status: "rejected" as const, reviewedAt: new Date().toISOString(), reviewedBy: "Admin" }
          : i
      )
    );
    setRejectTargetId(null);
    toast("success", "Rejected", "Memory has been rejected and hidden.");
  };

  const openReview = (item: ModerationItem) => {
    setReviewItem(item);
    setReviewOpen(true);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Moderation</h1>
          <p className="text-gray-500 mt-1">Review flagged and reported content</p>
        </div>
        {pendingCount > 0 && (
          <span className="flex items-center gap-2 px-4 py-2 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-sm font-medium">
            <AlertTriangle className="w-4 h-4" />
            {pendingCount} items need review
          </span>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Pending Review", value: pendingCount, color: "#fbbf24" },
          { label: "Approved", value: approvedToday, color: "#22c55e" },
          { label: "Rejected", value: rejectedToday, color: "#ef4444" },
          { label: "AI Auto-Flagged", value: aiFlagged, color: "#c084fc" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-[#141414] rounded-xl p-4 border border-white/5"
          >
            <p className="text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
            <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Status Filter */}
      <div className="flex items-center gap-2 mb-6">
        {["all", "pending", "approved", "rejected", "flagged"].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition cursor-pointer ${
              statusFilter === s ? "bg-white/10 text-white" : "bg-white/5 text-gray-500 hover:text-gray-300"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Moderation Queue */}
      <div className="space-y-3">
        {filteredItems.map((item, i) => {
          const config = statusConfig[item.status];
          const StatusIcon = config.icon;

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-[#141414] rounded-xl p-5 border border-white/5 hover:border-white/10 transition group"
            >
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-lg ${config.bg} flex items-center justify-center flex-shrink-0`}>
                  <StatusIcon className={`w-5 h-5 ${config.color}`} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-sm font-semibold text-white">Memory: {item.memoryId}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium capitalize ${config.bg} ${config.color}`}>
                      {item.status}
                    </span>
                  </div>

                  <p className="text-sm text-gray-400 mb-2">{item.reason}</p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                    {item.reportedBy && <span>Reported by: {item.reportedBy}</span>}
                    <span>{timeAgo(item.createdAt)}</span>
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      AI Severity: {(item.aiSeverity * 100).toFixed(0)}%
                    </span>
                    {item.reviewedBy && <span>Reviewed by: {item.reviewedBy}</span>}
                  </div>
                </div>

                {/* AI Severity meter */}
                <div className="flex-shrink-0 text-right">
                  <div className="w-16 h-16 rounded-full border-4 flex items-center justify-center" style={{
                    borderColor: item.aiSeverity > 0.7 ? "#ef4444" : item.aiSeverity > 0.4 ? "#fbbf24" : "#22c55e"
                  }}>
                    <span className="text-sm font-bold text-white">{(item.aiSeverity * 100).toFixed(0)}</span>
                  </div>
                  <p className="text-[10px] text-gray-600 mt-1">severity</p>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 flex-shrink-0">
                  {item.status === "pending" && (
                    <>
                      <button
                        onClick={() => handleApprove(item.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/10 text-green-400 text-xs font-medium hover:bg-green-500/20 transition cursor-pointer"
                      >
                        <CheckCircle className="w-3.5 h-3.5" /> Approve
                      </button>
                      <button
                        onClick={() => { setRejectTargetId(item.id); setRejectConfirm(true); }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 text-xs font-medium hover:bg-red-500/20 transition cursor-pointer"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Reject
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => openReview(item)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 text-gray-400 text-xs font-medium hover:bg-white/10 transition cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" /> Review
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
            <p className="text-lg font-semibold text-white">All caught up!</p>
            <p className="text-sm text-gray-500">No items matching this filter.</p>
          </div>
        )}
      </div>

      {/* Review Modal */}
      <Modal isOpen={reviewOpen} onClose={() => setReviewOpen(false)} title="Review Moderation Item" size="md">
        {reviewItem && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/5 rounded-lg p-3"><p className="text-xs text-gray-500">Memory ID</p><p className="text-sm text-white font-mono">{reviewItem.memoryId}</p></div>
              <div className="bg-white/5 rounded-lg p-3"><p className="text-xs text-gray-500">Status</p><p className="text-sm text-white capitalize">{reviewItem.status}</p></div>
              <div className="bg-white/5 rounded-lg p-3"><p className="text-xs text-gray-500">AI Severity</p><p className="text-sm text-white">{(reviewItem.aiSeverity * 100).toFixed(0)}%</p></div>
              <div className="bg-white/5 rounded-lg p-3"><p className="text-xs text-gray-500">Reported By</p><p className="text-sm text-white">{reviewItem.reportedBy || "AI System"}</p></div>
            </div>
            <div className="bg-white/5 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">Reason</p>
              <p className="text-sm text-white">{reviewItem.reason}</p>
            </div>
            {reviewItem.status === "pending" && (
              <div className="flex justify-end gap-2 pt-2 border-t border-white/5">
                <button onClick={() => { handleApprove(reviewItem.id); setReviewOpen(false); }} className="px-4 py-2 rounded-lg bg-green-500/10 text-green-400 text-sm font-medium hover:bg-green-500/20 transition cursor-pointer">Approve</button>
                <button onClick={() => { setRejectTargetId(reviewItem.id); setRejectConfirm(true); setReviewOpen(false); }} className="px-4 py-2 rounded-lg bg-red-500/10 text-red-400 text-sm font-medium hover:bg-red-500/20 transition cursor-pointer">Reject</button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Reject Confirmation */}
      <ConfirmDialog
        isOpen={rejectConfirm}
        onClose={() => { setRejectConfirm(false); setRejectTargetId(null); }}
        onConfirm={handleReject}
        title="Reject Content"
        message="Are you sure you want to reject this content? It will be hidden from all users."
        confirmLabel="Reject"
        confirmVariant="danger"
      />
    </div>
  );
}
