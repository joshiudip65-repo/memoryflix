"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Bell, Plus, Edit3, Trash2, Clock, Calendar,
  Heart, Sun, Sparkles, Send, ToggleLeft, ToggleRight, Save
} from "lucide-react";
import { mockNotifications } from "@/data/mock";
import { Notification } from "@/types";
import Modal from "@/components/ui/Modal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";

const typeConfig: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  nostalgia: { icon: Sparkles, color: "text-purple-400", bg: "bg-purple-500/10" },
  anniversary: { icon: Calendar, color: "text-pink-400", bg: "bg-pink-500/10" },
  seasonal: { icon: Sun, color: "text-yellow-400", bg: "bg-yellow-500/10" },
  emotional: { icon: Heart, color: "text-red-400", bg: "bg-red-500/10" },
  system: { icon: Bell, color: "text-blue-400", bg: "bg-blue-500/10" },
};

interface NotificationRule {
  label: string;
  desc: string;
  enabled: boolean;
  freq: string;
  icon: React.ElementType;
  color: string;
}

export default function AdminNotificationsPage() {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);

  // Rules state
  const [rules, setRules] = useState<NotificationRule[]>([
    { label: "Nostalgia Reminders", desc: "Surface old memories at optimal emotional times", enabled: true, freq: "Daily", icon: Sparkles, color: "#c084fc" },
    { label: "Anniversary Triggers", desc: "Remind on dates of significant memories", enabled: true, freq: "On date", icon: Calendar, color: "#f472b6" },
    { label: "Emotional Prompts", desc: "Context-aware comfort memory suggestions", enabled: true, freq: "Smart", icon: Heart, color: "#ef4444" },
    { label: "Seasonal Reminders", desc: "Season-matched memory collections", enabled: false, freq: "Seasonal", icon: Sun, color: "#fbbf24" },
  ]);

  // Create/Edit modal
  const [formOpen, setFormOpen] = useState(false);
  const [editingNotif, setEditingNotif] = useState<Notification | null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formBody, setFormBody] = useState("");
  const [formType, setFormType] = useState<Notification["type"]>("system");

  // Delete confirm
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Send confirm
  const [sendConfirm, setSendConfirm] = useState(false);
  const [sendTargetId, setSendTargetId] = useState<string | null>(null);

  const toggleRule = (index: number) => {
    setRules((prev) =>
      prev.map((r, i) => (i === index ? { ...r, enabled: !r.enabled } : r))
    );
    const rule = rules[index];
    toast("success", rule.enabled ? "Rule Disabled" : "Rule Enabled", `"${rule.label}" has been ${rule.enabled ? "disabled" : "enabled"}.`);
  };

  const openCreate = () => {
    setEditingNotif(null);
    setFormTitle("");
    setFormBody("");
    setFormType("system");
    setFormOpen(true);
  };

  const openEdit = (notif: Notification) => {
    setEditingNotif(notif);
    setFormTitle(notif.title);
    setFormBody(notif.body);
    setFormType(notif.type);
    setFormOpen(true);
  };

  const handleSave = () => {
    if (!formTitle.trim()) {
      toast("error", "Title Required", "Notification title cannot be empty.");
      return;
    }
    if (editingNotif) {
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === editingNotif.id
            ? { ...n, title: formTitle, body: formBody, type: formType }
            : n
        )
      );
      toast("success", "Notification Updated", `"${formTitle}" has been updated.`);
    } else {
      const newNotif: Notification = {
        id: `notif-${Date.now()}`,
        type: formType,
        title: formTitle,
        body: formBody,
        scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        isActive: true,
      };
      setNotifications((prev) => [newNotif, ...prev]);
      toast("success", "Notification Created", `"${formTitle}" scheduled.`);
    }
    setFormOpen(false);
  };

  const handleDelete = () => {
    if (!deleteTargetId) return;
    const notif = notifications.find((n) => n.id === deleteTargetId);
    setNotifications((prev) => prev.filter((n) => n.id !== deleteTargetId));
    setDeleteTargetId(null);
    toast("success", "Notification Deleted", `"${notif?.title}" removed.`);
  };

  const handleSendNow = () => {
    if (!sendTargetId) return;
    const notif = notifications.find((n) => n.id === sendTargetId);
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === sendTargetId ? { ...n, sentAt: new Date().toISOString() } : n
      )
    );
    setSendTargetId(null);
    toast("success", "Sent!", `"${notif?.title}" has been sent to all users.`);
  };

  const toggleNotifActive = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isActive: !n.isActive } : n))
    );
    const notif = notifications.find((n) => n.id === id);
    toast("success", notif?.isActive ? "Notification Disabled" : "Notification Enabled", `"${notif?.title}" updated.`);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Notification Management</h1>
          <p className="text-gray-500 mt-1">Configure nostalgia reminders, anniversary triggers, and emotional prompts</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--mf-accent)] text-black font-semibold text-sm hover:brightness-110 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Create Notification
        </button>
      </div>

      {/* Notification Philosophy Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-[var(--mf-accent)]/10 to-purple-500/10 rounded-2xl p-6 border border-[var(--mf-accent)]/20 mb-8"
      >
        <h3 className="text-base font-semibold text-white mb-2">Notification Philosophy</h3>
        <p className="text-sm text-gray-400 leading-relaxed">
          Notifications should feel <span className="text-white font-medium">thoughtful</span>, not invasive.
          Each notification is a gentle invitation to rediscover a moment.
          Never spam. Never aggressively surface traumatic memories.
          Every notification should make the user feel: <em className="text-[var(--mf-accent)]">&quot;I&apos;m glad you reminded me.&quot;</em>
        </p>
      </motion.div>

      {/* Notification Rules */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {rules.map((rule, i) => {
          const Icon = rule.icon;
          return (
            <motion.div
              key={rule.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-[#141414] rounded-xl p-5 border border-white/5"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${rule.color}15` }}>
                  <Icon className="w-5 h-5" style={{ color: rule.color }} />
                </div>
                <button
                  onClick={() => toggleRule(i)}
                  className="text-gray-400 hover:text-white transition cursor-pointer"
                >
                  {rule.enabled ? (
                    <ToggleRight className="w-6 h-6 text-green-400" />
                  ) : (
                    <ToggleLeft className="w-6 h-6 text-gray-600" />
                  )}
                </button>
              </div>
              <h3 className="text-sm font-semibold text-white mb-1">{rule.label}</h3>
              <p className="text-xs text-gray-500 mb-2">{rule.desc}</p>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-gray-400">
                Frequency: {rule.freq}
              </span>
            </motion.div>
          );
        })}
      </div>

      {/* Scheduled Notifications */}
      <h2 className="text-lg font-bold text-white mb-4">Scheduled Notifications</h2>
      <div className="space-y-3">
        {notifications.map((notif, i) => {
          const config = typeConfig[notif.type] || typeConfig.system;
          const TypeIcon = config.icon;

          return (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-4 bg-[#141414] rounded-xl p-4 border border-white/5 hover:border-white/10 transition group"
            >
              <div className={`w-10 h-10 rounded-lg ${config.bg} flex items-center justify-center flex-shrink-0`}>
                <TypeIcon className={`w-5 h-5 ${config.color}`} />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-white">{notif.title}</h3>
                <p className="text-xs text-gray-500 mt-0.5">{notif.body}</p>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium capitalize ${config.bg} ${config.color}`}>
                    {notif.type}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    {new Date(notif.scheduledAt).toLocaleDateString()} at{" "}
                    {new Date(notif.scheduledAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </div>

              <span className={`px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
                notif.sentAt ? "bg-blue-500/10 text-blue-400" : notif.isActive ? "bg-green-500/10 text-green-400" : "bg-gray-500/10 text-gray-400"
              }`}>
                {notif.sentAt ? "Sent" : notif.isActive ? "Scheduled" : "Disabled"}
              </span>

              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                {!notif.sentAt && (
                  <button
                    onClick={() => { setSendTargetId(notif.id); setSendConfirm(true); }}
                    className="p-1.5 rounded hover:bg-white/10 transition cursor-pointer"
                    title="Send now"
                  >
                    <Send className="w-3.5 h-3.5 text-gray-400" />
                  </button>
                )}
                <button
                  onClick={() => toggleNotifActive(notif.id)}
                  className="p-1.5 rounded hover:bg-white/10 transition cursor-pointer"
                  title={notif.isActive ? "Disable" : "Enable"}
                >
                  {notif.isActive ? (
                    <ToggleRight className="w-4 h-4 text-green-400" />
                  ) : (
                    <ToggleLeft className="w-4 h-4 text-gray-500" />
                  )}
                </button>
                <button
                  onClick={() => openEdit(notif)}
                  className="p-1.5 rounded hover:bg-white/10 transition cursor-pointer"
                  title="Edit"
                >
                  <Edit3 className="w-3.5 h-3.5 text-gray-400" />
                </button>
                <button
                  onClick={() => { setDeleteTargetId(notif.id); setDeleteConfirm(true); }}
                  className="p-1.5 rounded hover:bg-red-500/10 transition cursor-pointer"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-400" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Create / Edit Modal */}
      <Modal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        title={editingNotif ? "Edit Notification" : "Create Notification"}
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Title</label>
            <input type="text" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} placeholder="Notification title..." className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-[var(--mf-accent)]/50" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Body</label>
            <textarea value={formBody} onChange={(e) => setFormBody(e.target.value)} placeholder="Notification message..." rows={3} className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-[var(--mf-accent)]/50 resize-none" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Type</label>
            <div className="flex flex-wrap gap-2">
              {(["nostalgia", "anniversary", "emotional", "seasonal", "system"] as const).map((t) => {
                const cfg = typeConfig[t];
                const TIcon = cfg.icon;
                return (
                  <button
                    key={t}
                    onClick={() => setFormType(t)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs capitalize transition cursor-pointer ${
                      formType === t
                        ? `${cfg.bg} ${cfg.color} ring-1 ring-current`
                        : "bg-white/5 text-gray-400 hover:bg-white/10"
                    }`}
                  >
                    <TIcon className="w-3 h-3" /> {t}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2 border-t border-white/5">
            <button onClick={() => setFormOpen(false)} className="px-4 py-2 rounded-lg bg-white/5 text-sm text-gray-300 hover:bg-white/10 transition cursor-pointer">Cancel</button>
            <button onClick={handleSave} className="px-5 py-2 rounded-lg bg-[var(--mf-accent)] text-black text-sm font-semibold hover:brightness-110 transition cursor-pointer">
              <span className="flex items-center gap-1"><Save className="w-3.5 h-3.5" /> {editingNotif ? "Save" : "Create"}</span>
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteConfirm}
        onClose={() => { setDeleteConfirm(false); setDeleteTargetId(null); }}
        onConfirm={handleDelete}
        title="Delete Notification"
        message={`Are you sure you want to delete "${notifications.find((n) => n.id === deleteTargetId)?.title}"?`}
        confirmLabel="Delete"
        confirmVariant="danger"
      />

      {/* Send Confirmation */}
      <ConfirmDialog
        isOpen={sendConfirm}
        onClose={() => { setSendConfirm(false); setSendTargetId(null); }}
        onConfirm={handleSendNow}
        title="Send Now"
        message={`Send "${notifications.find((n) => n.id === sendTargetId)?.title}" to all users immediately?`}
        confirmLabel="Send Now"
        confirmVariant="primary"
      />
    </div>
  );
}
