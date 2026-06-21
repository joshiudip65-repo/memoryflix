"use client";

import { motion } from "framer-motion";
import {
  Users, Upload, HardDrive, Brain, TrendingUp,
  Clock, Eye, Target, Activity
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, RadarChart,
  PolarGrid, PolarAngleAxis, Radar
} from "recharts";
import { mockDashboardStats, mockChartData } from "@/data/mock";
import { formatNumber, formatBytes } from "@/lib/utils";

const stats = [
  { label: "Total Users", value: formatNumber(mockDashboardStats.totalUsers), icon: Users, color: "#60a5fa", change: "+12.3%" },
  { label: "Active Users", value: formatNumber(mockDashboardStats.activeUsers), icon: Activity, color: "#34d399", change: "+8.1%" },
  { label: "Uploads Today", value: formatNumber(mockDashboardStats.uploadsToday), icon: Upload, color: "#fbbf24", change: "+15.7%" },
  { label: "Storage Used", value: formatBytes(mockDashboardStats.storageUsed), icon: HardDrive, color: "#c084fc", change: "+2.4%" },
  { label: "AI Queue", value: mockDashboardStats.aiProcessingQueue.toString(), icon: Brain, color: "#f97316", change: "-23%" },
  { label: "Engagement", value: `${mockDashboardStats.engagementRate}%`, icon: TrendingUp, color: "#f472b6", change: "+5.2%" },
  { label: "Avg Watch Time", value: `${mockDashboardStats.avgWatchTime}m`, icon: Clock, color: "#818cf8", change: "+3.8%" },
  { label: "AI Accuracy", value: `${mockDashboardStats.recommendationAccuracy}%`, icon: Target, color: "#22c55e", change: "+1.9%" },
];

export default function AdminDashboardPage() {
  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-500 mt-1">MemoryFlix platform overview and analytics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-[#141414] rounded-xl p-4 border border-white/5 hover:border-white/10 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${stat.color}15` }}>
                  <Icon className="w-4.5 h-4.5" style={{ color: stat.color }} />
                </div>
                <span className={`text-xs font-medium ${stat.change.startsWith("+") ? "text-green-400" : "text-red-400"}`}>
                  {stat.change}
                </span>
              </div>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Uploads Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-[#141414] rounded-xl p-6 border border-white/5"
        >
          <h3 className="text-base font-semibold text-white mb-4">Uploads Per Day</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={mockChartData.uploadsPerDay}>
              <defs>
                <linearGradient id="uploadGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#e5a00d" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#e5a00d" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#222" />
              <XAxis dataKey="date" tick={{ fill: "#666", fontSize: 12 }} axisLine={false} />
              <YAxis tick={{ fill: "#666", fontSize: 12 }} axisLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid #333", borderRadius: 8 }}
                labelStyle={{ color: "#fff" }}
                itemStyle={{ color: "#e5a00d" }}
              />
              <Area type="monotone" dataKey="count" stroke="#e5a00d" fill="url(#uploadGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Watch Time Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-[#141414] rounded-xl p-6 border border-white/5"
        >
          <h3 className="text-base font-semibold text-white mb-4">Avg Watch Time (min)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={mockChartData.watchTimeData}>
              <defs>
                <linearGradient id="watchGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#60a5fa" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#60a5fa" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#222" />
              <XAxis dataKey="date" tick={{ fill: "#666", fontSize: 12 }} axisLine={false} />
              <YAxis tick={{ fill: "#666", fontSize: 12 }} axisLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid #333", borderRadius: 8 }}
                labelStyle={{ color: "#fff" }}
                itemStyle={{ color: "#60a5fa" }}
              />
              <Area type="monotone" dataKey="minutes" stroke="#60a5fa" fill="url(#watchGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Emotional Engagement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-[#141414] rounded-xl p-6 border border-white/5"
        >
          <h3 className="text-base font-semibold text-white mb-4">Emotional Engagement</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={mockChartData.emotionalEngagement} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#222" horizontal={false} />
              <XAxis type="number" tick={{ fill: "#666", fontSize: 12 }} axisLine={false} />
              <YAxis dataKey="emotion" type="category" tick={{ fill: "#999", fontSize: 11 }} axisLine={false} width={70} />
              <Tooltip
                contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid #333", borderRadius: 8 }}
                labelStyle={{ color: "#fff" }}
              />
              <Bar dataKey="score" fill="#e5a00d" radius={[0, 4, 4, 0]} barSize={16} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Retention */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-[#141414] rounded-xl p-6 border border-white/5"
        >
          <h3 className="text-base font-semibold text-white mb-4">User Retention</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={mockChartData.retentionData}>
              <defs>
                <linearGradient id="retGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#34d399" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#34d399" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#222" />
              <XAxis dataKey="week" tick={{ fill: "#666", fontSize: 12 }} axisLine={false} />
              <YAxis tick={{ fill: "#666", fontSize: 12 }} axisLine={false} domain={[0, 100]} />
              <Tooltip
                contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid #333", borderRadius: 8 }}
                labelStyle={{ color: "#fff" }}
                itemStyle={{ color: "#34d399" }}
              />
              <Area type="monotone" dataKey="rate" stroke="#34d399" fill="url(#retGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Trending Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-[#141414] rounded-xl p-6 border border-white/5"
        >
          <h3 className="text-base font-semibold text-white mb-4">Trending Categories</h3>
          <div className="space-y-3">
            {mockDashboardStats.trendingCategories.map((cat, i) => (
              <div key={cat.name} className="flex items-center gap-3">
                <span className="text-xs text-gray-600 w-5">{i + 1}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-white">{cat.name}</span>
                    <span className="text-xs text-gray-500">{formatNumber(cat.count)}</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#2a2a2a] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[var(--mf-accent)]"
                      style={{ width: `${(cat.count / mockDashboardStats.trendingCategories[0].count) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
