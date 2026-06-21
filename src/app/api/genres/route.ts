import { NextRequest, NextResponse } from "next/server";
import { mockGenres } from "@/data/mock";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const visible = searchParams.get("visible");

  let results = [...mockGenres];

  if (type) results = results.filter((g) => g.type === type);
  if (visible === "true") results = results.filter((g) => g.isVisible);

  results.sort((a, b) => b.rankingPriority - a.rankingPriority);

  return NextResponse.json({ genres: results });
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  return NextResponse.json({
    success: true,
    message: "Genre created",
    genre: {
      id: `genre-${Date.now()}`,
      ...body,
      memoryCount: 0,
      createdAt: new Date().toISOString(),
    },
  });
}
