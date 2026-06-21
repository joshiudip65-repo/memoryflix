import { NextRequest, NextResponse } from "next/server";
import { mockMemories } from "@/data/mock";
import { SearchResult, EmotionType } from "@/types";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") || "";
  const limit = parseInt(searchParams.get("limit") || "20");

  if (!query.trim()) {
    return NextResponse.json({ memories: [], totalCount: 0, suggestedQueries: [], emotionalSummary: {} });
  }

  const q = query.toLowerCase();

  // Semantic-like search across all memory fields
  const results = mockMemories.filter((m) =>
    m.title.toLowerCase().includes(q) ||
    m.description?.toLowerCase().includes(q) ||
    m.aiTags.some((t) => t.toLowerCase().includes(q)) ||
    m.scenes.some((s) => s.toLowerCase().includes(q)) ||
    m.emotions.some((e) => e.emotion.toLowerCase().includes(q)) ||
    m.people.some((p) => p.name.toLowerCase().includes(q)) ||
    m.location?.city?.toLowerCase().includes(q) ||
    m.location?.country?.toLowerCase().includes(q) ||
    m.location?.landmark?.toLowerCase().includes(q)
  );

  // Build emotional summary
  const emotionalSummary: Partial<Record<EmotionType, number>> = {};
  results.forEach((m) => {
    m.emotions.forEach((e) => {
      emotionalSummary[e.emotion] = (emotionalSummary[e.emotion] || 0) + 1;
    });
  });

  // Suggest related queries
  const suggestedQueries = [
    `${query} memories`,
    `best ${query}`,
    `${query} moments`,
  ].slice(0, 3);

  const response: SearchResult = {
    memories: results.slice(0, limit),
    totalCount: results.length,
    suggestedQueries,
    emotionalSummary: emotionalSummary as Record<EmotionType, number>,
  };

  return NextResponse.json(response);
}
