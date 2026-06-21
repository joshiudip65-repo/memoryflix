"use client";

import { motion } from "framer-motion";
import {
  BarChart3, TrendingUp, Heart, Eye, RotateCcw,
  Users, Clock, Sparkles
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";
import { mockChartData } from "@/data/mock";

const engagementData = [
  { name: "Joy", value: 34, color: "#fbbf24" },
  { name: "Nostalgia", value: 28, color: "#c084fc" },
  { name: "Love", value: 18, color: "#f472b6" },
  { name: "Comfort", value: 12, color: "#a78bfa" },
  { name: "Wonder", value: 8, color: "#60a5fa" },
];

const topReplayed = [
  { title: "Christmas Morning 2020", views: 89, emotion: "Joy" },
  { title: "Puppy's First Day Home", views: 72, emotion: "Tenderness" },
  { title: "Dance Floor at Sarah's Wedding", views: 64, emotion: "Joy" },
  { title: "Road Trip Singalong", views: 56, emotion: "Excitement" },
  { title: "Golden Hour at the Beach", views: 47, emotion: "Calm" },
];

const nostalgiaTrigs = [
  { trigger: "On This Day reminders", rate: 78 },
  { trigger: "Seasonal content", rate: 65 },
  { trigger: "People suggestions", rate: 72 },
  { trigger: "Forgotten gems", rate: 84 },
  { trigger: "AI stories", rate: 69 },
];

export default function AdminAnalyticsPage() {
  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white">Analytics</h1>
        <p className="text-gray-500 mt-1">Engagement, emotional rediscovery, and recommendation performance</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { icon: Eye, label: "Daily Views", value: "14.2K", change: "+18%", color: "#60a5fa" },
          { icon: RotateCcw, label: "Rediscovery Rate", value: "27.1%", change: "+4.2%", color: "#c084fc" },
          { icon: Heart, label: "Avg Emotion Score", value: "87.4", change: "+2.8", color: "#f472b6" },
          { icon: Clock, label: "Session Duration", value: "18.4m", change: "+3.1m", color: "#fbbf24" },
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
              <Icon className="w-5 h-5 mb-2" style={{ color: stat.color }} />
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-xs text-gray-500">{stat.label}</p>
              <span className="text-[10px] text-green-400">{stat.change}</span>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Rediscovery Rate Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[#141414] rounded-xl p-6 border border-white/5"
        >
          <h3 className="text-base font-semibold text-white mb-4">Memory Rediscovery Rate</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={mockChartData.rediscoveryRate}>
              <defs>
                <linearGradient id="rediscGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#c084fc" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#c084fc" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#222" />
              <XAxis dataKey="date" tick={{ fill: "#666", fontSize: 12 }} axisLine={false} />
              <YAxis tick={{ fill: "#666", fontSize: 12 }} axisLine={false} />
              <Tooltip contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid #333", borderRadius: 8 }} />
              <Area type="monotone" dataKey="rate" stroke="#c084fc" fill="url(#rediscGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Emotional Engagement Pie */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-[#141414] rounded-xl p-6 border border-white/5"
        >
          <h3 className="text-base font-semibold text-white mb-4">Emotional Engagement Distribution</h3>
          <div className="flex items-center">
            <ResponsiveContainer width="50%" height={220}>
              <PieChart>
                <Pie
                  data={engagementData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {engagementData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid #333", borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2">
              {engagementData.map((entry) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                  <span className="text-sm text-gray-300">{entry.name}</span>
                  <span className="text-xs text-gray-500 ml-auto">{entry.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Replayed */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-[#141414] rounded-xl p-6 border border-white/5"
        >
          <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-[var(--mf-accent)]" />
            Most Replayed Memories
          </h3>
          <div className="space-y-3">
            {topReplayed.map((mem, i) => (
              <div key={mem.title} className="flex items-center gap-3">
                <span className="text-lg font-bold text-gray-600 w-6">{i + 1}</span>
                <div className="flex-1">
                  <p className="text-sm text-white">{mem.title}</p>
                  <p className="text-xs text-gray-500">{mem.emotion}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="w-3 h-3 text-gray-500" />
                  <span className="text-sm font-semibold text-white">{mem.views}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Nostalgia Triggers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-[#141414] rounded-xl p-6 border border-white/5"
        >
          <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[var(--mf-accent)]" />
            Nostalgia Trigger Effectiveness
          </h3>
          <div className="space-y-4">
            {nostalgiaTrigs.map((trig) => (
              <div key={trig.trigger}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-300">{trig.trigger}</span>
                  <span className="text-sm font-semibold text-white">{trig.rate}%</span>
                </div>
                <div className="w-full h-2 bg-[#2a2a2a] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${trig.rate}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="h-full rounded-full bg-gradient-to-r from-[var(--mf-accent)] to-[var(--mf-accent-light)]"
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
