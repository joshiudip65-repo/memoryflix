import { NextRequest, NextResponse } from "next/server";
import { mockMemories, mockRails } from "@/data/mock";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId") || "user-001";
  const context = searchParams.get("context") || "default";
  const limit = parseInt(searchParams.get("limit") || "10");

  // Simulated recommendation engine
  // In production: uses collaborative filtering, content-based filtering,
  // emotional engagement signals, time-of-day weighting, and neural ranking

  const now = new Date();
  const hour = now.getHours();
  const isEvening = hour >= 18 || hour <= 6;
  const isWeekend = now.getDay() === 0 || now.getDay() === 6;

  // Score each memory based on simulated signals
  const scored = mockMemories.map((memory) => {
    let score = memory.emotionalScore;

    // Time-of-day boost
    if (isEvening && memory.emotions.some((e) => ["calm", "comfort", "nostalgia"].includes(e.emotion))) {
      score += 15;
    }

    // Weekend boost for adventure/social
    if (isWeekend && memory.emotions.some((e) => ["joy", "excitement", "adventure"].includes(e.emotion))) {
      score += 10;
    }

    // Nostalgia boost for older memories
    const age = (Date.now() - new Date(memory.capturedAt).getTime()) / (365.25 * 24 * 60 * 60 * 1000);
    if (age > 3) score += age * 2;

    // Rediscovery boost for unviewed
    if (memory.viewCount < 20) score += 12;

    // Core memory bonus
    if (memory.isCoreMomory) score += 20;

    return {
      memoryId: memory.id,
      score: Math.min(100, score),
      reason: getRecommendationReason(memory, isEvening, isWeekend),
      confidence: 0.7 + Math.random() * 0.3,
    };
  });

  scored.sort((a, b) => b.score - a.score);

  return NextResponse.json({
    recommendations: scored.slice(0, limit),
    context: {
      timeOfDay: isEvening ? "evening" : "daytime",
      isWeekend,
      emotionalContext: isEvening ? "reflective" : "active",
    },
    rails: mockRails.filter((r) => r.isActive).slice(0, 8),
  });
}

function getRecommendationReason(memory: typeof mockMemories[0], isEvening: boolean, isWeekend: boolean): string {
  if (memory.isCoreMomory) return "One of your core memories";
  if (memory.viewCount < 10) return "A hidden gem you might have forgotten";
  if (isEvening && memory.emotions.some((e) => e.emotion === "comfort")) return "Perfect for tonight";
  if (isWeekend) return "A great weekend rediscovery";
  return "Recommended for you";
}
