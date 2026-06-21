"use client";

import { motion } from "framer-motion";
import {
  HardDrive, Cloud, Server, Zap, Upload, Download,
  Database, Layers, Activity, ArrowUpRight
} from "lucide-react";
import { formatBytes } from "@/lib/utils";

const storageMetrics = {
  totalCapacity: 10 * 1024 * 1024 * 1024 * 1024,
  used: 2.4 * 1024 * 1024 * 1024 * 1024,
  photosSize: 1.2 * 1024 * 1024 * 1024 * 1024,
  videosSize: 0.9 * 1024 * 1024 * 1024 * 1024,
  otherSize: 0.3 * 1024 * 1024 * 1024 * 1024,
  cdnBandwidth: 847 * 1024 * 1024 * 1024,
  cdnBandwidthLimit: 5 * 1024 * 1024 * 1024 * 1024,
  transcodingQueue: 23,
  uploadsToday: 2341,
  downloadsBandwidth: 234 * 1024 * 1024 * 1024,
};

const storageTiers = [
  { name: "Hot Storage (SSD)", usage: 890, capacity: 2000, unit: "GB", color: "#ef4444", desc: "Frequently accessed memories" },
  { name: "Warm Storage (HDD)", usage: 1200, capacity: 5000, unit: "GB", color: "#fbbf24", desc: "Recently uploaded, moderate access" },
  { name: "Cold Storage (Archive)", usage: 310, capacity: 3000, unit: "GB", color: "#60a5fa", desc: "Rarely accessed, long-term archive" },
];

export default function AdminStoragePage() {
  const usedPercent = (storageMetrics.used / storageMetrics.totalCapacity) * 100;

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white">Storage Management</h1>
        <p className="text-gray-500 mt-1">CDN, object storage, transcoding, and bandwidth controls</p>
      </div>

      {/* Overview Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#141414] rounded-2xl p-6 border border-white/5 mb-8"
      >
        <div className="flex items-center gap-3 mb-4">
          <HardDrive className="w-5 h-5 text-[var(--mf-accent)]" />
          <h2 className="text-lg font-semibold text-white">Total Storage</h2>
        </div>

        <div className="flex items-end gap-2 mb-3">
          <span className="text-4xl font-bold text-white">{formatBytes(storageMetrics.used)}</span>
          <span className="text-lg text-gray-500 mb-1">/ {formatBytes(storageMetrics.totalCapacity)}</span>
        </div>

        <div className="w-full h-4 bg-[#2a2a2a] rounded-full overflow-hidden flex">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(storageMetrics.photosSize / storageMetrics.totalCapacity) * 100}%` }}
            transition={{ duration: 1 }}
            className="h-full bg-blue-500"
            title="Photos"
          />
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(storageMetrics.videosSize / storageMetrics.totalCapacity) * 100}%` }}
            transition={{ duration: 1, delay: 0.2 }}
            className="h-full bg-purple-500"
            title="Videos"
          />
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(storageMetrics.otherSize / storageMetrics.totalCapacity) * 100}%` }}
            transition={{ duration: 1, delay: 0.4 }}
            className="h-full bg-[var(--mf-accent)]"
            title="Other"
          />
        </div>

        <div className="flex items-center gap-6 mt-3">
          <span className="flex items-center gap-2 text-xs text-gray-400">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Photos ({formatBytes(storageMetrics.photosSize)})
          </span>
          <span className="flex items-center gap-2 text-xs text-gray-400">
            <div className="w-2.5 h-2.5 rounded-full bg-purple-500" /> Videos ({formatBytes(storageMetrics.videosSize)})
          </span>
          <span className="flex items-center gap-2 text-xs text-gray-400">
            <div className="w-2.5 h-2.5 rounded-full bg-[var(--mf-accent)]" /> Other ({formatBytes(storageMetrics.otherSize)})
          </span>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { icon: Cloud, label: "CDN Bandwidth", value: formatBytes(storageMetrics.cdnBandwidth), sub: `of ${formatBytes(storageMetrics.cdnBandwidthLimit)}`, color: "#60a5fa" },
          { icon: Zap, label: "Transcoding Queue", value: storageMetrics.transcodingQueue.toString(), sub: "items processing", color: "#f97316" },
          { icon: Upload, label: "Uploads Today", value: storageMetrics.uploadsToday.toLocaleString(), sub: "new memories", color: "#22c55e" },
          { icon: Download, label: "Download Bandwidth", value: formatBytes(storageMetrics.downloadsBandwidth), sub: "this month", color: "#c084fc" },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-[#141414] rounded-xl p-4 border border-white/5"
            >
              <div className="w-9 h-9 rounded-lg mb-3 flex items-center justify-center" style={{ backgroundColor: `${stat.color}15` }}>
                <Icon className="w-4.5 h-4.5" style={{ color: stat.color }} />
              </div>
              <p className="text-xl font-bold text-white">{stat.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
              <p className="text-[10px] text-gray-600">{stat.sub}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Storage Tiers */}
      <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <Layers className="w-5 h-5 text-[var(--mf-accent)]" />
        Storage Tiers
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {storageTiers.map((tier, i) => (
          <motion.div
            key={tier.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.1 }}
            className="bg-[#141414] rounded-xl p-5 border border-white/5"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: tier.color }} />
              <h3 className="text-sm font-semibold text-white">{tier.name}</h3>
            </div>
            <p className="text-xs text-gray-500 mb-4">{tier.desc}</p>

            <div className="flex items-end gap-1 mb-2">
              <span className="text-2xl font-bold text-white">{tier.usage}</span>
              <span className="text-sm text-gray-500 mb-0.5">/ {tier.capacity} {tier.unit}</span>
            </div>

            <div className="w-full h-2 bg-[#2a2a2a] rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(tier.usage / tier.capacity) * 100}%` }}
                transition={{ duration: 1, delay: 0.5 + i * 0.1 }}
                className="h-full rounded-full"
                style={{ backgroundColor: tier.color }}
              />
            </div>
            <p className="text-[10px] text-gray-600 mt-1.5">
              {((tier.usage / tier.capacity) * 100).toFixed(1)}% used
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
