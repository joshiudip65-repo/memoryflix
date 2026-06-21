import { NextRequest, NextResponse } from "next/server";
import { mockRails, getActiveRails, getRailsByType, mockMemories } from "@/data/mock";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const active = searchParams.get("active");

  let results = [...mockRails];

  if (type) results = getRailsByType(type);
  if (active === "true") results = getActiveRails();

  // Hydrate rails with memory data
  const hydrated = results.map((rail) => ({
    ...rail,
    memories: rail.memoryIds
      .map((id) => mockMemories.find((m) => m.id === id))
      .filter(Boolean),
  }));

  return NextResponse.json({ rails: hydrated });
}
