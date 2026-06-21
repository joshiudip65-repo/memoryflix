"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Search, MoreVertical, Shield, User as UserIcon,
  Ban, RefreshCw, Mail, Filter, X, Eye, Edit3
} from "lucide-react";
import { mockUsers } from "@/data/mock";
import { User } from "@/types";
import { formatBytes } from "@/lib/utils";
import Modal from "@/components/ui/Modal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";

export default function AdminUsersPage() {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [searchQuery, setSearchQuery] = useState("");
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState<string>("all");

  // User detail modal
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailUser, setDetailUser] = useState<User | null>(null);

  // Edit role modal
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [roleUserId, setRoleUserId] = useState<string | null>(null);
  const [newRole, setNewRole] = useState<string>("user");

  // Suspend confirm
  const [suspendConfirm, setSuspendConfirm] = useState(false);
  const [suspendUserId, setSuspendUserId] = useState<string | null>(null);

  // Notification modal
  const [notifModalOpen, setNotifModalOpen] = useState(false);
  const [notifMessage, setNotifMessage] = useState("");
  const [notifUserId, setNotifUserId] = useState<string | null>(null);

  const filtered = users.filter((u) => {
    if (roleFilter !== "all" && u.role !== roleFilter) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
  });

  const roleIcon = (role: string) => {
    switch (role) {
      case "admin": return <Shield className="w-3.5 h-3.5 text-red-400" />;
      case "moderator": return <Shield className="w-3.5 h-3.5 text-blue-400" />;
      default: return <UserIcon className="w-3.5 h-3.5 text-gray-400" />;
    }
  };

  const planBadge = (plan: string) => {
    switch (plan) {
      case "premium": return <span className="px-2 py-0.5 rounded-full bg-[var(--mf-accent)]/15 text-[var(--mf-accent)] text-[10px] font-semibold">Premium</span>;
      case "family": return <span className="px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-400 text-[10px] font-semibold">Family</span>;
      default: return <span className="px-2 py-0.5 rounded-full bg-gray-500/15 text-gray-400 text-[10px] font-semibold">Free</span>;
    }
  };

  const handleSuspendToggle = () => {
    if (!suspendUserId) return;
    const user = users.find((u) => u.id === suspendUserId);
    setUsers((prev) =>
      prev.map((u) =>
        u.id === suspendUserId
          ? { ...u, isSuspended: !u.isSuspended, isActive: u.isSuspended ? true : false }
          : u
      )
    );
    setSuspendUserId(null);
    toast(
      "success",
      user?.isSuspended ? "User Unsuspended" : "User Suspended",
      `${user?.name} has been ${user?.isSuspended ? "unsuspended" : "suspended"}.`
    );
  };

  const handleResetRecommendations = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    setMenuOpenId(null);
    toast("success", "Recommendations Reset", `AI recommendations cleared for ${user?.name}.`);
  };

  const handleRoleChange = () => {
    if (!roleUserId) return;
    const user = users.find((u) => u.id === roleUserId);
    setUsers((prev) =>
      prev.map((u) => (u.id === roleUserId ? { ...u, role: newRole as User["role"] } : u))
    );
    setRoleModalOpen(false);
    setRoleUserId(null);
    toast("success", "Role Updated", `${user?.name} is now a ${newRole}.`);
  };

  const handleSendNotification = () => {
    if (!notifUserId || !notifMessage.trim()) return;
    const user = users.find((u) => u.id === notifUserId);
    setNotifModalOpen(false);
    setNotifMessage("");
    setNotifUserId(null);
    toast("success", "Notification Sent", `Message sent to ${user?.name}.`);
  };

  const openUserDetail = (user: User) => {
    setDetailUser(user);
    setDetailOpen(true);
    setMenuOpenId(null);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">User Management</h1>
          <p className="text-gray-500 mt-1">{users.length} registered users</p>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center gap-2 flex-1 px-4 py-2.5 rounded-xl bg-[#141414] border border-white/5">
          <Search className="w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search users by name or email..."
            className="bg-transparent text-white text-sm outline-none flex-1 placeholder-gray-600"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="p-0.5 hover:bg-white/10 rounded cursor-pointer">
              <X className="w-3 h-3 text-gray-400" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-1 bg-[#141414] rounded-xl p-1 border border-white/5">
          {["all", "user", "moderator", "admin"].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition cursor-pointer ${
                roleFilter === r ? "bg-white/10 text-white" : "text-gray-500 hover:text-gray-300"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* User Table */}
      <div className="bg-[#141414] rounded-xl border border-white/5 overflow-hidden">
        <div className="grid grid-cols-[1fr_120px_100px_120px_100px_80px_40px] gap-4 px-5 py-3 border-b border-white/5 text-xs font-medium text-gray-500 uppercase tracking-wider">
          <span>User</span>
          <span>Plan</span>
          <span>Role</span>
          <span>Storage</span>
          <span>Memories</span>
          <span>Status</span>
          <span />
        </div>

        {filtered.map((user, i) => (
          <motion.div
            key={user.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.03 }}
            className="grid grid-cols-[1fr_120px_100px_120px_100px_80px_40px] gap-4 px-5 py-4 items-center border-b border-white/5 hover:bg-white/[0.02] transition group"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="w-9 h-9 rounded-full bg-cover bg-center flex-shrink-0"
                style={{ backgroundImage: `url(${user.avatarUrl})` }}
              />
              <div className="min-w-0">
                <p className="text-sm font-medium text-white truncate">{user.name}</p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
            </div>

            {planBadge(user.plan)}

            <div className="flex items-center gap-1.5">
              {roleIcon(user.role)}
              <span className="text-xs text-gray-400 capitalize">{user.role}</span>
            </div>

            <div>
              <div className="w-full h-1.5 bg-[#2a2a2a] rounded-full overflow-hidden mb-1">
                <div
                  className="h-full rounded-full bg-[var(--mf-accent)]"
                  style={{ width: `${(user.storageUsed / user.storageLimit) * 100}%` }}
                />
              </div>
              <span className="text-[10px] text-gray-500">
                {formatBytes(user.storageUsed)} / {formatBytes(user.storageLimit)}
              </span>
            </div>

            <span className="text-sm text-gray-300">{user.memoryCount.toLocaleString()}</span>

            <span className={`text-xs px-2 py-0.5 rounded-full w-fit ${
              user.isSuspended
                ? "bg-red-500/10 text-red-400"
                : user.isActive
                  ? "bg-green-500/10 text-green-400"
                  : "bg-gray-500/10 text-gray-400"
            }`}>
              {user.isSuspended ? "Suspended" : user.isActive ? "Active" : "Inactive"}
            </span>

            {/* Actions dropdown */}
            <div className="relative">
              <button
                onClick={() => setMenuOpenId(menuOpenId === user.id ? null : user.id)}
                className="p-1.5 rounded hover:bg-white/10 transition opacity-0 group-hover:opacity-100 cursor-pointer"
              >
                <MoreVertical className="w-4 h-4 text-gray-500" />
              </button>
              {menuOpenId === user.id && (
                <div className="absolute right-0 top-8 z-50 w-48 bg-[#222] border border-white/10 rounded-lg shadow-xl py-1">
                  <button onClick={() => openUserDetail(user)} className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-white/10 flex items-center gap-2 cursor-pointer">
                    <Eye className="w-3.5 h-3.5" /> View Profile
                  </button>
                  <button onClick={() => { setRoleUserId(user.id); setNewRole(user.role); setRoleModalOpen(true); setMenuOpenId(null); }} className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-white/10 flex items-center gap-2 cursor-pointer">
                    <Edit3 className="w-3.5 h-3.5" /> Change Role
                  </button>
                  <button onClick={() => handleResetRecommendations(user.id)} className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-white/10 flex items-center gap-2 cursor-pointer">
                    <RefreshCw className="w-3.5 h-3.5" /> Reset AI
                  </button>
                  <button onClick={() => { setNotifUserId(user.id); setNotifModalOpen(true); setMenuOpenId(null); }} className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-white/10 flex items-center gap-2 cursor-pointer">
                    <Mail className="w-3.5 h-3.5" /> Send Notification
                  </button>
                  <button onClick={() => { setSuspendUserId(user.id); setSuspendConfirm(true); setMenuOpenId(null); }} className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2 cursor-pointer">
                    <Ban className="w-3.5 h-3.5" /> {user.isSuspended ? "Unsuspend" : "Suspend"}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
        {[
          { icon: Ban, label: "Suspend User", desc: "Temporarily disable access", color: "#ef4444", onClick: () => toast("info", "Select a User", "Use the dropdown menu on a user to suspend them.") },
          { icon: RefreshCw, label: "Reset Recommendations", desc: "Clear AI recommendation history", color: "#f97316", onClick: () => toast("info", "Select a User", "Use the dropdown menu on a user to reset their AI.") },
          { icon: Mail, label: "Send Notification", desc: "Send custom notification to user", color: "#60a5fa", onClick: () => toast("info", "Select a User", "Use the dropdown menu on a user to send a notification.") },
        ].map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.label}
              onClick={action.onClick}
              className="flex items-center gap-4 p-4 rounded-xl bg-[#141414] border border-white/5 hover:border-white/10 transition text-left cursor-pointer"
            >
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${action.color}15` }}>
                <Icon className="w-5 h-5" style={{ color: action.color }} />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{action.label}</p>
                <p className="text-xs text-gray-500">{action.desc}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* User Detail Modal */}
      <Modal isOpen={detailOpen} onClose={() => setDetailOpen(false)} title="User Profile" size="md">
        {detailUser && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-cover bg-center" style={{ backgroundImage: `url(${detailUser.avatarUrl})` }} />
              <div>
                <h3 className="text-lg font-semibold text-white">{detailUser.name}</h3>
                <p className="text-sm text-gray-400">{detailUser.email}</p>
                <div className="flex items-center gap-2 mt-1">
                  {planBadge(detailUser.plan)}
                  <span className="text-xs text-gray-500 capitalize">{detailUser.role}</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/5 rounded-lg p-3"><p className="text-xs text-gray-500">Memories</p><p className="text-lg font-bold text-white">{detailUser.memoryCount}</p></div>
              <div className="bg-white/5 rounded-lg p-3"><p className="text-xs text-gray-500">Storage</p><p className="text-lg font-bold text-white">{formatBytes(detailUser.storageUsed)}</p></div>
              <div className="bg-white/5 rounded-lg p-3"><p className="text-xs text-gray-500">Joined</p><p className="text-sm text-white">{new Date(detailUser.joinedAt).toLocaleDateString()}</p></div>
              <div className="bg-white/5 rounded-lg p-3"><p className="text-xs text-gray-500">Last Active</p><p className="text-sm text-white">{new Date(detailUser.lastActiveAt).toLocaleDateString()}</p></div>
            </div>
          </div>
        )}
      </Modal>

      {/* Change Role Modal */}
      <Modal isOpen={roleModalOpen} onClose={() => setRoleModalOpen(false)} title="Change User Role" size="sm">
        <div className="space-y-3">
          {["user", "moderator", "admin"].map((r) => (
            <button
              key={r}
              onClick={() => setNewRole(r)}
              className={`w-full text-left px-4 py-3 rounded-lg transition cursor-pointer flex items-center gap-3 ${
                newRole === r ? "bg-[var(--mf-accent)]/10 ring-1 ring-[var(--mf-accent)]/30" : "bg-white/5 hover:bg-white/10"
              }`}
            >
              {roleIcon(r)}
              <span className="text-sm text-white capitalize">{r}</span>
            </button>
          ))}
          <div className="flex justify-end gap-3 pt-2 border-t border-white/5">
            <button onClick={() => setRoleModalOpen(false)} className="px-4 py-2 rounded-lg bg-white/5 text-sm text-gray-300 hover:bg-white/10 cursor-pointer">Cancel</button>
            <button onClick={handleRoleChange} className="px-5 py-2 rounded-lg bg-[var(--mf-accent)] text-black text-sm font-semibold hover:brightness-110 cursor-pointer">Save Role</button>
          </div>
        </div>
      </Modal>

      {/* Notification Modal */}
      <Modal isOpen={notifModalOpen} onClose={() => setNotifModalOpen(false)} title="Send Notification" size="sm">
        <div className="space-y-3">
          <p className="text-sm text-gray-400">To: {users.find((u) => u.id === notifUserId)?.name}</p>
          <textarea
            value={notifMessage}
            onChange={(e) => setNotifMessage(e.target.value)}
            placeholder="Write your notification message..."
            rows={4}
            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-[var(--mf-accent)]/50 resize-none"
          />
          <div className="flex justify-end gap-3">
            <button onClick={() => setNotifModalOpen(false)} className="px-4 py-2 rounded-lg bg-white/5 text-sm text-gray-300 hover:bg-white/10 cursor-pointer">Cancel</button>
            <button onClick={handleSendNotification} disabled={!notifMessage.trim()} className="px-5 py-2 rounded-lg bg-[var(--mf-accent)] text-black text-sm font-semibold hover:brightness-110 disabled:opacity-50 cursor-pointer">Send</button>
          </div>
        </div>
      </Modal>

      {/* Suspend Confirmation */}
      <ConfirmDialog
        isOpen={suspendConfirm}
        onClose={() => { setSuspendConfirm(false); setSuspendUserId(null); }}
        onConfirm={handleSuspendToggle}
        title={users.find((u) => u.id === suspendUserId)?.isSuspended ? "Unsuspend User" : "Suspend User"}
        message={`Are you sure you want to ${users.find((u) => u.id === suspendUserId)?.isSuspended ? "unsuspend" : "suspend"} ${users.find((u) => u.id === suspendUserId)?.name}?`}
        confirmLabel={users.find((u) => u.id === suspendUserId)?.isSuspended ? "Unsuspend" : "Suspend"}
        confirmVariant="danger"
      />
    </div>
  );
}
