import { NextRequest, NextResponse } from "next/server";
import { mockMemories, getMemoriesByEmotion, getMemoriesByPerson, getCoreMemories, getForgottenGems } from "@/data/mock";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const emotion = searchParams.get("emotion");
  const personId = searchParams.get("personId");
  const filter = searchParams.get("filter");
  const limit = parseInt(searchParams.get("limit") || "50");
  const offset = parseInt(searchParams.get("offset") || "0");

  let results = [...mockMemories];

  if (emotion) results = getMemoriesByEmotion(emotion);
  if (personId) results = results.filter((m) => m.people.some((p) => p.personId === personId));
  if (filter === "core") results = getCoreMemories();
  if (filter === "forgotten") results = getForgottenGems();
  if (filter === "favorites") results = results.filter((m) => m.isFavorite);

  const total = results.length;
  const paginated = results.slice(offset, offset + limit);

  return NextResponse.json({
    memories: paginated,
    total,
    limit,
    offset,
  });
}

export async function POST(request: NextRequest) {
  // Placeholder for memory upload — in production, handles file upload + AI processing
  const body = await request.json();

  return NextResponse.json({
    success: true,
    message: "Memory upload initiated",
    memoryId: `mem-${Date.now()}`,
    aiProcessing: {
      status: "queued",
      estimatedTime: 30,
      tasks: ["face_detection", "emotion_analysis", "scene_classification", "embedding_generation"],
    },
  });
}
